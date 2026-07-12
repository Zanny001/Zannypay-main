
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
  LOCAL_INVOICES: 'zannypay:localInvoices',
};

const SAVINGS_APY = 0.15;
const STARTING_BALANCE = 0;

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

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

  const localInvoicesRef = useRef([]);

  const toggleBalanceHidden = useCallback(async () => {
    setIsBalanceHidden((prev) => {
      const nextState = !prev;
      saveJSON(STORAGE_KEYS.HIDE_BALANCE, nextState);
      return nextState;
    });
  }, []);

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

  const retryQueuedRequest = useCallback(async (item) => {
    if (item.type !== 'POST_RETRY') return;
    const { endpoint, payload } = item.payload;
    const res = await apiPost(endpoint, payload, null, true);
    if (!res || res.success === false) throw new Error('Retry failed');
  }, []);

  const drainOfflineQueue = useCallback(async () => {
    await SyncEngine.processQueue(retryQueuedRequest);
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

  const buyAirtime = useCallback(async ({ phone, amount, provider, pin, isData }) => {
    return payBill({
      billerName: provider,
      category: isData ? 'Data' : 'Airtime',
      amount,
      reference: phone,
      pin,
    });
  }, [payBill]);

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

  const recordInvoice = useCallback(async ({ clientName, amount, description }) => {
    try {
      // Sync to our newly created backend module!
      await apiPost('/invoices', { clientName, amount: parseFloat(amount), description });

      // Keep the optimistic local UI update so the list feels instant
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
  // Cards Integration
  // ==========================================
  const requestVirtualCard = useCallback(async () => {
    try {
      const res = await apiPost('/cards/request');
      if (res && res.cardNumber) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Failed to generate card' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const toggleCardFreeze = useCallback(async (cardId, isFrozen) => {
    try {
      const res = await apiPost(`/cards/${cardId}/freeze`, { isFrozen });
      if (res && res.id) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: 'Failed to update card status.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  // ==========================================
  // Savings & Loans
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
    requestVirtualCard, toggleCardFreeze, // <-- Exported to UI
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

