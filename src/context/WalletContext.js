import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { saveJSON, loadJSON } from '../utils/storage';
import { apiGet, apiPost, getSavedToken, saveToken, clearToken } from '../services/apiClient';

const WalletContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'zannypay:user',
  BALANCE: 'zannypay:balance',
  TXNS: 'zannypay:transactions',
  ONBOARDED: 'zannypay:onboarded',
  // Elite Module Additions (v2) — Savings & Credit
  SAVINGS_GOALS: 'zannypay:savingsGoals',
  LOAN: 'zannypay:activeLoan',
};

const SAVINGS_APY = 0.15; // 15% annualized, purely illustrative for in-app projections
const LOAN_INTEREST_RATE = 0.05; // 5% flat fee per loan term

const STARTING_BALANCE = 0; // Aligned with server-side instantiation

export function WalletProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Elite Module Additions (v2) — Savings & Credit state
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loan, setLoan] = useState(null);

  // Synchronize local state with true backend state
  const syncWallet = useCallback(async () => {
    try {
      const data = await apiGet('/user/me');
      console.log('[Sync Engine] Received true payload:', data);

      if (data && data.user) {
        // 1. Process nested wallet balance object & convert DB string value to valid JS Number
        const walletBalance = data.user.wallet?.balance;
        if (walletBalance !== undefined) {
          const processedBalance = Number(walletBalance) || 0;
          setBalance(processedBalance);
          await saveJSON(STORAGE_KEYS.BALANCE, processedBalance);
        }
        
        // 2. Extract database transactions history array
        const remoteTxns = data.user.transactions || data.transactions;
        if (remoteTxns) {
          setTransactions(remoteTxns);
          await saveJSON(STORAGE_KEYS.TXNS, remoteTxns);
        }
      }
    } catch (error) {
      console.log('Background sync failed, relying on local storage:', error.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedBalance, savedTxns, savedOnboarded, savedToken, savedGoals, savedLoan] = await Promise.all([
          loadJSON(STORAGE_KEYS.USER, null),
          loadJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE),
          loadJSON(STORAGE_KEYS.TXNS, []),
          loadJSON(STORAGE_KEYS.ONBOARDED, false),
          getSavedToken(),
          loadJSON(STORAGE_KEYS.SAVINGS_GOALS, []),
          loadJSON(STORAGE_KEYS.LOAN, null),
        ]);

        setUser(savedUser);
        setBalance(Number(savedBalance) || 0);
        setTransactions(savedTxns);
        setOnboarded(savedOnboarded);
        setSavingsGoals(savedGoals || []);
        setLoan(savedLoan || null);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setIsAuthenticated(true);
          syncWallet();
        }
      } catch (error) {
        console.error("Storage load error:", error);
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
      const data = await apiPost('/auth/signup', { name, email, phone, pin });
      const { access_token, user: newUser } = data;

      await saveToken(access_token);
      await saveJSON(STORAGE_KEYS.USER, newUser);
      await saveJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE);

      setToken(access_token);
      setUser(newUser);
      setBalance(STARTING_BALANCE);
      setIsAuthenticated(true);

      return { ok: true, user: newUser };
    } catch (error) {
      return { ok: false, error: error.message || 'Signup failed.' };
    }
  }, []);

  const login = useCallback(async (phone, pin) => {
    try {
      const data = await apiPost('/auth/login', { phone, pin });
      const { access_token, user: loggedInUser } = data;

      await saveToken(access_token);
      await saveJSON(STORAGE_KEYS.USER, loggedInUser);
      setToken(access_token);
      setUser(loggedInUser);
      setIsAuthenticated(true);

      setTimeout(() => {
        syncWallet();
      }, 300);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message || 'Invalid credentials.' };
    }
  }, [syncWallet]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    setBalance(0);
    setTransactions([]);
    await clearToken();
  }, []);

  const addTransactionOptimistically = useCallback(async (txn, amt) => {
    const currentIsoString = new Date().toISOString();
    const entry = {
      id: Date.now().toString(),
      date: currentIsoString,
      createdAt: currentIsoString,
      ...txn
    };

    setTransactions((prev) => {
      const updated = [entry, ...prev];
      saveJSON(STORAGE_KEYS.TXNS, updated);
      return updated;
    });

    setBalance((prev) => {
      // UPGRADE: Only update the balance immediately if it is NOT pending.
      // This prevents the balance jumping up and then immediately reverting on sync.
      if (txn.status === 'pending') return prev;
      
      const updated = txn.type === 'credit' ? prev + amt : prev - amt;
      saveJSON(STORAGE_KEYS.BALANCE, updated);
      return updated;
    });
    
    return entry;
  }, []);

  const transferMoney = useCallback(async ({ recipientName, recipientAccount, bank, amount, note, pin }) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (amt > balance) return { ok: false, error: 'Insufficient balance.' };

      const data = await apiPost(
        '/transactions/transfer',
        { recipientAccount, amount: amt, pin },
        { type: 'transfer', amount: amt, account: recipientAccount }
      );

      const txn = await addTransactionOptimistically({
        type: 'debit',
        category: 'Transfer',
        title: `Transfer to ${recipientName || recipientAccount}`,
        subtitle: `${bank || 'ZannyPay'} · ${recipientAccount}`,
        amount: amt,
        note: note || '',
        status: 'success',
        reference: data.transactionId || data.id
      }, amt);

      syncWallet();
      return { ok: true, txn };
    } catch (error) {
      return { ok: false, error: error.message || 'Transfer failed.' };
    }
  }, [balance, addTransactionOptimistically, syncWallet]);

  const payBill = useCallback(async ({ billerName, category, amount, reference, pin }) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (amt > balance) return { ok: false, error: 'Insufficient balance.' };

      const data = await apiPost(
        '/transactions/bills',
        { billerName, category, amount: amt, reference, pin },
        category === 'Airtime' ? { type: 'airtime', amount: amt } : null
      );

      const txn = await addTransactionOptimistically({
        type: 'debit',
        category: category || 'Bill Payment',
        title: billerName,
        subtitle: reference ? `Ref: ${reference}` : '',
        amount: amt,
        status: 'success',
        reference: data.transactionId || data.id
      }, amt);

      syncWallet();
      return { ok: true, txn };
    } catch (error) {
      return { ok: false, error: error.message || 'Bill payment failed.' };
    }
  }, [balance, addTransactionOptimistically, syncWallet]);

  const fundWallet = useCallback(async (amount) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };

      const MAX_FUNDING_LIMIT = 10000000;
      if (amt > MAX_FUNDING_LIMIT) {
        return { ok: false, error: 'Watch your spending. Amount cannot be processed online.' };
      }

      const data = await apiPost('/transactions/fund', { amount: amt });

      const txn = await addTransactionOptimistically({
        type: 'credit',
        category: 'Wallet Funding',
        title: 'Wallet Top-up',
        subtitle: 'Paystack Checkout',
        amount: amt,
        status: 'pending',
        reference: data.reference || data.transactionId || data.id
      }, amt);

      // Instantly sync background records
      syncWallet();

      // Return authorization URL back up so the UI layer can open it cleanly
      return {
        ok: true,
        txn,
        authorizationUrl: data.authorizationUrl
      };
    } catch (error) {
      return { ok: false, error: error.message || 'Wallet funding failed.' };
    }
  }, [addTransactionOptimistically, syncWallet]);

  // Invoices are non-monetary (they don't move wallet funds), so they're
  // logged locally for history/analytics without touching balance or the
  // backend transactions endpoint.
  const recordInvoice = useCallback(async ({ clientName, amount, description }) => {
    const currentIsoString = new Date().toISOString();
    const entry = {
      id: Date.now().toString(),
      date: currentIsoString,
      createdAt: currentIsoString,
      type: 'invoice',
      category: 'Invoices',
      title: `Invoice to ${clientName}`,
      subtitle: description,
      amount: Number(amount) || 0,
      status: 'success',
    };
    setTransactions((prev) => {
      const updated = [entry, ...prev];
      saveJSON(STORAGE_KEYS.TXNS, updated);
      return updated;
    });
    return entry;
  }, []);

  // ==========================================
  // Elite Module Additions (v2) — Savings & Goals (Cashbox)
  // ==========================================
  const createSavingsGoal = useCallback(async ({ name, target }) => {
    const targetAmt = Number(target) || 0;
    if (!name || targetAmt <= 0) return { ok: false, error: 'Enter a name and a valid target amount.' };

    const goal = {
      id: Date.now().toString(),
      name,
      target: targetAmt,
      saved: 0,
      createdAt: new Date().toISOString(),
    };

    setSavingsGoals((prev) => {
      const updated = [goal, ...prev];
      saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
      return updated;
    });

    return { ok: true, goal };
  }, []);

  const depositToSavings = useCallback(async (goalId, amount) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
    if (amt > balance) return { ok: false, error: 'Insufficient wallet balance.' };

    setBalance((prev) => {
      const updated = prev - amt;
      saveJSON(STORAGE_KEYS.BALANCE, updated);
      return updated;
    });

    let updatedGoal = null;
    setSavingsGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== goalId) return g;
        updatedGoal = { ...g, saved: (g.saved || 0) + amt };
        return updatedGoal;
      });
      saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
      return updated;
    });

    await addTransactionOptimistically({
      type: 'debit',
      category: 'Savings',
      title: `Saved towards ${updatedGoal?.name || 'a goal'}`,
      subtitle: 'Moved to Cashbox',
      amount: amt,
      status: 'success',
    }, 0); // amt already deducted above; pass 0 so it doesn't double-debit balance

    return { ok: true, goal: updatedGoal };
  }, [balance, addTransactionOptimistically]);

  const withdrawFromSavings = useCallback(async (goalId, amount) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };

    const target = savingsGoals.find((g) => g.id === goalId);
    if (!target || amt > (target.saved || 0)) {
      return { ok: false, error: 'Insufficient savings balance for this goal.' };
    }

    let updatedGoal = null;
    setSavingsGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== goalId) return g;
        updatedGoal = { ...g, saved: (g.saved || 0) - amt };
        return updatedGoal;
      });
      saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
      return updated;
    });

    setBalance((prev) => {
      const updated = prev + amt;
      saveJSON(STORAGE_KEYS.BALANCE, updated);
      return updated;
    });

    await addTransactionOptimistically({
      type: 'credit',
      category: 'Savings',
      title: `Withdrew from ${updatedGoal?.name || 'Cashbox'}`,
      subtitle: 'Returned to Wallet',
      amount: amt,
      status: 'success',
    }, 0);

    return { ok: true, goal: updatedGoal };
  }, [savingsGoals, addTransactionOptimistically]);

  // ==========================================
  // Elite Module Additions (v2) — Flexi Credit / Loans
  // ==========================================
  const totalCredits = useMemo(() => {
    return (transactions || [])
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + (Math.abs(parseFloat(t.amount)) || 0), 0);
  }, [transactions]);

  const creditLimit = useMemo(() => {
    // Illustrative on-device credit scoring: baseline + a slice of historical inflow, capped.
    const computed = 50000 + totalCredits * 0.15;
    return Math.min(Math.round(computed / 1000) * 1000, 1000000);
  }, [totalCredits]);

  const requestLoan = useCallback(async ({ amount, termDays }) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
    if (loan && !loan.repaid) return { ok: false, error: 'You already have an active loan. Repay it first.' };
    if (amt > creditLimit) return { ok: false, error: `Amount exceeds your credit limit of ${creditLimit}.` };

    const fee = Math.round(amt * LOAN_INTEREST_RATE);
    const totalOwed = amt + fee;
    const dueDate = new Date(Date.now() + (Number(termDays) || 30) * 24 * 60 * 60 * 1000).toISOString();

    const newLoan = {
      id: Date.now().toString(),
      principal: amt,
      fee,
      totalOwed,
      amountRepaid: 0,
      termDays: Number(termDays) || 30,
      issuedAt: new Date().toISOString(),
      dueDate,
      repaid: false,
    };

    setLoan(newLoan);
    await saveJSON(STORAGE_KEYS.LOAN, newLoan);

    setBalance((prev) => {
      const updated = prev + amt;
      saveJSON(STORAGE_KEYS.BALANCE, updated);
      return updated;
    });

    await addTransactionOptimistically({
      type: 'credit',
      category: 'Flexi Credit',
      title: 'Loan Disbursed',
      subtitle: `${newLoan.termDays}-day term · Repay ${totalOwed}`,
      amount: amt,
      status: 'success',
    }, 0);

    return { ok: true, loan: newLoan };
  }, [loan, creditLimit, addTransactionOptimistically]);

  const repayLoan = useCallback(async (amount) => {
    const amt = Number(amount);
    if (!loan || loan.repaid) return { ok: false, error: 'No active loan to repay.' };
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
    if (amt > balance) return { ok: false, error: 'Insufficient wallet balance.' };

    const remaining = loan.totalOwed - loan.amountRepaid;
    const payment = Math.min(amt, remaining);
    const updatedLoan = {
      ...loan,
      amountRepaid: loan.amountRepaid + payment,
      repaid: loan.amountRepaid + payment >= loan.totalOwed,
    };

    setLoan(updatedLoan);
    await saveJSON(STORAGE_KEYS.LOAN, updatedLoan);

    setBalance((prev) => {
      const updated = prev - payment;
      saveJSON(STORAGE_KEYS.BALANCE, updated);
      return updated;
    });

    await addTransactionOptimistically({
      type: 'debit',
      category: 'Flexi Credit',
      title: updatedLoan.repaid ? 'Loan Fully Repaid' : 'Loan Repayment',
      subtitle: `Balance owed: ${Math.max(updatedLoan.totalOwed - updatedLoan.amountRepaid, 0)}`,
      amount: payment,
      status: 'success',
    }, 0);

    return { ok: true, loan: updatedLoan };
  }, [loan, balance, addTransactionOptimistically]);

  const value = {
    loading, onboarded, completeOnboarding, user, isAuthenticated,
    signup, login, logout, balance, transactions,
    transferMoney, payBill, fundWallet, syncWallet, recordInvoice,
    // Elite Module Additions (v2)
    savingsGoals, createSavingsGoal, depositToSavings, withdrawFromSavings, savingsApy: SAVINGS_APY,
    loan, creditLimit, requestLoan, repayLoan,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
