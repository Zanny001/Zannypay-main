import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { saveJSON, loadJSON } from '../utils/storage';
import { apiGet, apiPost, getSavedToken, saveToken, clearToken } from '../services/apiClient';
import { SyncEngine } from '../services/SyncEngine';

const WalletContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'zannypay:user',
  BALANCE: 'zannypay:balance',
  TXNS: 'zannypay:transactions',
  ONBOARDED: 'zannypay:onboarded',
  SAVINGS_GOALS: 'zannypay:savingsGoals',
  LOAN: 'zannypay:activeLoan',
  HIDE_BALANCE: 'zannypay:hideBalance',
  // Invoices have no backend module (see integration notes) so they're
  // tracked purely on-device and re-merged into `transactions` on every sync.
  LOCAL_INVOICES: 'zannypay:localInvoices',
};

const SAVINGS_APY = 0.15;
const STARTING_BALANCE = 0;

// Prisma serializes Decimal columns (balance, amount, target, saved, etc.)
// as strings over JSON. Every place that does arithmetic or comparisons on
// a money value from the API needs to go through this first.
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// Combines the server's transaction history with locally-tracked invoices
// (which the backend has no endpoint for) into one de-duplicated, newest
// -first feed for History/Analytics/Notifications to read from.
function mergeTransactionFeeds(remoteTxns = [], localInvoices = []) {
  const remoteIds = new Set(remoteTxns.map((t) => t.id));
  const extras = localInvoices.filter((t) => !remoteIds.has(t.id));
  return [...remoteTxns, ...extras].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.date || 0).getTime();
    const bTime = new Date(b.createdAt || b.date || 0).getTime();
    return bTime - aTime;
  });
}

export function WalletProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loan, setLoan] = useState(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Kept in sync with the localInvoices persisted list so syncWallet() can
  // merge them back in synchronously, without relying on stale closures.
  const localInvoicesRef = useRef([]);

  const toggleBalanceHidden = useCallback(async () => {
    setIsBalanceHidden((prev) => {
      const nextState = !prev;
      saveJSON(STORAGE_KEYS.HIDE_BALANCE, nextState);
      return nextState;
    });
  }, []);

  // Pulls /user/me (profile + wallet balance + last 50 transactions) and
  // returns the raw payload so callers can read the fresh data immediately
  // instead of racing React's state-update batching.
  const syncWallet = useCallback(async () => {
    try {
      const data = await apiGet('/user/me');
      if (data && data.user) {
        setUser(data.user);
        await saveJSON(STORAGE_KEYS.USER, data.user);

        const walletBalance = data.balance !== undefined ? data.balance : data.user.wallet?.balance;
        const processedBalance = toNumber(walletBalance);
        setBalance(processedBalance);
        await saveJSON(STORAGE_KEYS.BALANCE, processedBalance);

        const remoteTxns = data.transactions || data.user.transactions || [];
        const merged = mergeTransactionFeeds(remoteTxns, localInvoicesRef.current);
        setTransactions(merged);
        await saveJSON(STORAGE_KEYS.TXNS, merged);

        // NOTE: the backend's GET /user/me does not currently include
        // savingsGoals/loans relations, so these will normally be
        // undefined and we simply keep whatever we already have locally
        // (populated by the savings/loan endpoints below). If the backend
        // is updated to include them, this picks the fresher server copy
        // up automatically.
        if (data.user.savingsGoals) {
          setSavingsGoals(data.user.savingsGoals);
          await saveJSON(STORAGE_KEYS.SAVINGS_GOALS, data.user.savingsGoals);
        }
        if (data.user.loans) {
          const activeLoan = data.user.loans.find((l) => !l.repaid) || null;
          setLoan(activeLoan);
          await saveJSON(STORAGE_KEYS.LOAN, activeLoan);
        }

        return { ...data, transactions: merged, balance: processedBalance };
      }
      return null;
    } catch (error) {
      console.log('Background sync failed:', error.message);
      return null;
    }
  }, []);

  // Replays anything SyncEngine queued while the device was offline (a
  // transfer, bill payment, etc. that failed with a network error). Without
  // this, apiPost's offline queueing was write-only — nothing ever drained
  // the queue.
  const retryQueuedRequest = useCallback(async (item) => {
    if (item.type !== 'POST_RETRY') return;
    const { endpoint, payload } = item.payload;
    const res = await apiPost(endpoint, payload, null, true); // isRetry=true avoids re-enqueueing on repeat failure
    if (!res || res.success === false) throw new Error('Retry failed');
  }, []);

  const drainOfflineQueue = useCallback(async () => {
    await SyncEngine.processQueue(retryQueuedRequest);
    // A queued transfer/bill/savings action may have just gone through —
    // pull fresh balance & transactions so the UI reflects it.
    await syncWallet();
  }, [retryQueuedRequest, syncWallet]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isAuthenticated) {
        drainOfflineQueue();
      }
    });
    return () => subscription.remove();
  }, [isAuthenticated, drainOfflineQueue]);

  useEffect(() => {
    (async () => {
      try {
        const [
          savedUser, savedBalance, savedTxns, savedOnboarded, savedToken,
          savedGoals, savedLoan, savedHideBalance, savedInvoices,
        ] = await Promise.all([
          loadJSON(STORAGE_KEYS.USER, null),
          loadJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE),
          loadJSON(STORAGE_KEYS.TXNS, []),
          loadJSON(STORAGE_KEYS.ONBOARDED, false),
          getSavedToken(),
          loadJSON(STORAGE_KEYS.SAVINGS_GOALS, []),
          loadJSON(STORAGE_KEYS.LOAN, null),
          loadJSON(STORAGE_KEYS.HIDE_BALANCE, false),
          loadJSON(STORAGE_KEYS.LOCAL_INVOICES, []),
        ]);

        localInvoicesRef.current = savedInvoices || [];

        setUser(savedUser);
        setBalance(toNumber(savedBalance));
        setTransactions(savedTxns);
        setOnboarded(savedOnboarded);
        setSavingsGoals(savedGoals || []);
        setLoan(savedLoan || null);
        setIsBalanceHidden(savedHideBalance || false);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setIsAuthenticated(true);
          await syncWallet();
          drainOfflineQueue();
        }
      } catch (error) {
        console.error('Storage load error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [syncWallet]);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await saveJSON(STORAGE_KEYS.ONBOARDED, true);
  }, []);

  const signup = useCallback(async ({ name, email, phone, pin }) => {
    try {
      // The backend requires a unique, valid email at the database level
      // even though the DTO marks it optional, so we always send a
      // trimmed value here; SignupScreen enforces it's present before
      // calling this.
      const res = await apiPost('/auth/signup', { name, email: email?.trim(), phone, pin });

      const validToken = res?.access_token || res?.token;

      if (res && validToken) {
        await saveToken(validToken);
        setToken(validToken);
        setUser(res.user);
        setIsAuthenticated(true);
        await saveJSON(STORAGE_KEYS.USER, res.user);
        if (res.user?.balance !== undefined) {
          const processedBalance = toNumber(res.user.balance);
          setBalance(processedBalance);
          await saveJSON(STORAGE_KEYS.BALANCE, processedBalance);
        }
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Registration failed.' };
    } catch (err) {
      return { ok: false, error: err.message || 'An error occurred during signup.' };
    }
  }, []);

  const login = useCallback(async (phone, pin) => {
    try {
      const res = await apiPost('/auth/login', { phone, pin });
      const validToken = res?.access_token || res?.token;

      if (res && validToken) {
        await saveToken(validToken);
        setToken(validToken);
        setUser(res.user);
        setIsAuthenticated(true);
        await saveJSON(STORAGE_KEYS.USER, res.user);
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Invalid telephone number or PIN.' };
    } catch (err) {
      return { ok: false, error: err.message || 'Connection to server failed.' };
    }
  }, [syncWallet]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    setBalance(0);
    setTransactions([]);
    setSavingsGoals([]);
    setLoan(null);
    await clearToken();
  }, []);

  // ==========================================
  // Money movement — transfers, bills, airtime, funding
  // ==========================================

  // The backend's TransferDto only accepts { recipientAccount, amount, pin }
  // — ValidationPipe is configured with forbidNonWhitelisted, so sending any
  // extra field (bank, recipientName, note...) makes the WHOLE request fail
  // with a 400. Those extra fields stay purely client-side for display.
  const transferMoney = useCallback(async ({ recipientAccount, amount, pin }) => {
    try {
      const res = await apiPost(
        '/transactions/transfer',
        { recipientAccount, amount: parseFloat(amount), pin },
        { type: 'transfer', amount, account: recipientAccount }
      );
      if (res && res.success) {
        const data = await syncWallet();
        const txn = data?.transactions?.find((t) => t.id === res.transactionId) || null;
        return { ok: true, txn };
      }
      return { ok: false, error: res?.error || 'Transfer was rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  // Also backs Airtime/Data purchases (see buyAirtime below) since the
  // backend has no dedicated airtime endpoint — everything routes through
  // this same bill-payment pipeline.
  const payBill = useCallback(async ({ billerName, category, amount, reference, pin }) => {
    try {
      const res = await apiPost(
        '/transactions/bills',
        { billerName, category, amount: parseFloat(amount), reference, pin },
        { type: 'bill', amount }
      );
      if (res && res.success) {
        const data = await syncWallet();
        const txn = data?.transactions?.find((t) => t.id === res.transactionId) || null;
        return { ok: true, txn };
      }
      return { ok: false, error: res?.error || 'Bill payment was rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  // NOTE: there is no /transactions/airtime route on the backend — this
  // deliberately reuses payBill (category "Airtime" / "Data") so the
  // purchase is still verified server-side (PIN check + real wallet debit)
  // instead of being a purely cosmetic success message.
  const buyAirtime = useCallback(async ({ phone, amount, provider, pin, isData }) => {
    return payBill({
      billerName: provider,
      category: isData ? 'Data' : 'Airtime',
      amount,
      reference: phone,
      pin,
    });
  }, [payBill]);

  // Kicks off a Paystack checkout. The wallet balance does NOT update
  // immediately — Paystack confirms via webhook, and the caller (FundModal)
  // opens `authorizationUrl` in a browser session, then calls syncWallet()
  // once the browser session returns.
  const fundWallet = useCallback(async (amount) => {
    try {
      const res = await apiPost('/transactions/fund', { amount: parseFloat(amount) });
      if (res && res.success) {
        return { ok: true, authorizationUrl: res.authorizationUrl, reference: res.reference };
      }
      return { ok: false, error: res?.error || 'Funding request failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  // The backend has no invoicing module at all, so this is a fully local
  // feature: it's logged as a pseudo-transaction (type "invoice", category
  // "Invoices" — matching what AnalyticsScreen/TransactionRow already
  // expect) that lives in AsyncStorage and gets re-merged into
  // `transactions` on every syncWallet() call.
  const recordInvoice = useCallback(async ({ clientName, amount, description }) => {
    try {
      const localTxn = {
        id: `local-inv-${Date.now()}`,
        type: 'invoice',
        category: 'Invoices',
        title: `Invoice to ${clientName}`,
        subtitle: description,
        amount: toNumber(amount),
        status: 'completed',
        createdAt: new Date().toISOString(),
        reference: `INV-${Date.now()}`,
        local: true,
      };

      const updatedInvoices = [localTxn, ...localInvoicesRef.current];
      localInvoicesRef.current = updatedInvoices;
      await saveJSON(STORAGE_KEYS.LOCAL_INVOICES, updatedInvoices);

      setTransactions((prev) => {
        const merged = mergeTransactionFeeds(prev.filter((t) => !t.local), updatedInvoices);
        saveJSON(STORAGE_KEYS.TXNS, merged);
        return merged;
      });

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Could not save this invoice on-device.' };
    }
  }, []);

  // ==========================================
  // Savings goals (Cashbox). The backend only exposes create/deposit/
  // withdraw — no GET to list a user's goals — so the list is maintained
  // locally, seeded and updated from each endpoint's response.
  // ==========================================
  const createSavingsGoal = useCallback(async ({ name, target }) => {
    try {
      const res = await apiPost('/savings/goal', { name, target: parseFloat(target) });
      if (res && res.success && res.goal) {
        setSavingsGoals((prev) => {
          const updated = [res.goal, ...prev];
          saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
          return updated;
        });
        return { ok: true, goal: res.goal };
      }
      return { ok: false, error: res?.error || 'Could not create this savings goal.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const depositToSavings = useCallback(async (goalId, amount) => {
    try {
      const res = await apiPost('/savings/deposit', { goalId, amount: parseFloat(amount) });
      if (res && res.success && res.goal) {
        setSavingsGoals((prev) => {
          const updated = prev.map((g) => (g.id === res.goal.id ? res.goal : g));
          saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
          return updated;
        });
        await syncWallet();
        return { ok: true, goal: res.goal };
      }
      return { ok: false, error: res?.error || 'Deposit was rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const withdrawFromSavings = useCallback(async (goalId, amount) => {
    try {
      const res = await apiPost('/savings/withdraw', { goalId, amount: parseFloat(amount) });
      if (res && res.success && res.goal) {
        setSavingsGoals((prev) => {
          const updated = prev.map((g) => (g.id === res.goal.id ? res.goal : g));
          saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
          return updated;
        });
        await syncWallet();
        return { ok: true, goal: res.goal };
      }
      return { ok: false, error: res?.error || 'Withdrawal was rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  // ==========================================
  // Flexi Credit (loans). Same limitation as savings — no GET for the
  // active loan, so it's tracked locally from request/repay responses.
  // creditLimit is a client-side illustrative heuristic (see integration
  // notes) since the backend doesn't expose a real credit-scoring endpoint.
  // ==========================================
  const totalCredits = useMemo(() => {
    return (transactions || [])
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + Math.abs(toNumber(t.amount)), 0);
  }, [transactions]);

  const creditLimit = useMemo(() => {
    const computed = 50000 + totalCredits * 0.15;
    return Math.min(Math.round(computed / 1000) * 1000, 1000000);
  }, [totalCredits]);

  const requestLoan = useCallback(async ({ amount, termDays }) => {
    try {
      const res = await apiPost('/loans/request', {
        amount: parseFloat(amount),
        termDays: termDays ? Number(termDays) : undefined,
      });
      if (res && res.success && res.loan) {
        setLoan(res.loan);
        await saveJSON(STORAGE_KEYS.LOAN, res.loan);
        await syncWallet();
        return { ok: true, loan: res.loan };
      }
      return { ok: false, error: res?.error || 'Loan request was declined.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const repayLoan = useCallback(async (amount) => {
    try {
      const res = await apiPost('/loans/repay', { amount: parseFloat(amount) });
      if (res && res.success && res.loan) {
        // Once fully repaid it's no longer "active" — clear it so the UI
        // falls back to the loan-application flow, mirroring the backend's
        // own `repaid: false` filter for what counts as an active loan.
        const nextLoan = res.loan.repaid ? null : res.loan;
        setLoan(nextLoan);
        await saveJSON(STORAGE_KEYS.LOAN, nextLoan);
        await syncWallet();
        return { ok: true, loan: res.loan };
      }
      return { ok: false, error: res?.error || 'Repayment was rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const value = {
    loading, onboarded, completeOnboarding, user, isAuthenticated,
    signup, login, logout, balance, transactions,
    transferMoney, payBill, buyAirtime, fundWallet, syncWallet, recordInvoice,
    savingsGoals, createSavingsGoal, depositToSavings, withdrawFromSavings, savingsApy: SAVINGS_APY,
    loan, creditLimit, requestLoan, repayLoan,
    isBalanceHidden, toggleBalanceHidden,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
