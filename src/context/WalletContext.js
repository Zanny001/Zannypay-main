import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { saveJSON, loadJSON } from '../utils/storage';
import { apiGet, apiPost, getSavedToken, saveToken, clearToken } from '../services/apiClient';

const WalletContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'zannypay:user',
  BALANCE: 'zannypay:balance',
  TXNS: 'zannypay:transactions',
  ONBOARDED: 'zannypay:onboarded',
  SAVINGS_GOALS: 'zannypay:savingsGoals',
  LOAN: 'zannypay:activeLoan',
};

const SAVINGS_APY = 0.15; // 15% annualized
const LOAN_INTEREST_RATE = 0.05; // 5% flat fee per loan term

const STARTING_BALANCE = 0;

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

  const syncWallet = useCallback(async () => {
    try {
      const data = await apiGet('/user/me');
      console.log('[Sync Engine] Received true payload:', data);

      if (data && data.user) {
        const walletBalance = data.user.wallet?.balance;
        if (walletBalance !== undefined) {
          const processedBalance = Number(walletBalance) || 0;
          setBalance(processedBalance);
          await saveJSON(STORAGE_KEYS.BALANCE, processedBalance);
        }

        const remoteTxns = data.user.transactions || data.transactions;
        if (remoteTxns) {
          setTransactions(remoteTxns);
          await saveJSON(STORAGE_KEYS.TXNS, remoteTxns);
        }

        // Auto-sync active savings & loans if the backend payload includes them
        if (data.user.savingsGoals) {
          setSavingsGoals(data.user.savingsGoals);
          await saveJSON(STORAGE_KEYS.SAVINGS_GOALS, data.user.savingsGoals);
        }
        if (data.user.loans) {
          const activeLoan = data.user.loans.find(l => !l.repaid) || null;
          setLoan(activeLoan);
          await saveJSON(STORAGE_KEYS.LOAN, activeLoan);
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
    setSavingsGoals([]);
    setLoan(null);
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

      const data = await apiPost('/transactions/transfer', { recipientAccount, amount: amt, pin });

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

      const data = await apiPost('/transactions/bills', { billerName, category, amount: amt, reference, pin });

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

      syncWallet();
      return { ok: true, txn, authorizationUrl: data.authorizationUrl };
    } catch (error) {
      return { ok: false, error: error.message || 'Wallet funding failed.' };
    }
  }, [addTransactionOptimistically, syncWallet]);

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
  // Elite Module Additions (v2) — Savings & Goals LIVE
  // ==========================================
  const createSavingsGoal = useCallback(async ({ name, target }) => {
    try {
      const targetAmt = Number(target) || 0;
      if (!name || targetAmt <= 0) return { ok: false, error: 'Enter a name and a valid target amount.' };

      const data = await apiPost('/savings/goal', { name, target: targetAmt });

      setSavingsGoals((prev) => {
        const updated = [data.goal, ...prev];
        saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
        return updated;
      });

      return { ok: true, goal: data.goal };
    } catch (error) {
      return { ok: false, error: error.message || 'Failed to create goal.' };
    }
  }, []);

  const depositToSavings = useCallback(async (goalId, amount) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (amt > balance) return { ok: false, error: 'Insufficient wallet balance.' };

      const data = await apiPost('/savings/deposit', { goalId, amount: amt });

      setSavingsGoals((prev) => {
        const updated = prev.map((g) => (g.id === goalId ? data.goal : g));
        saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
        return updated;
      });

      await addTransactionOptimistically({
        type: 'debit',
        category: 'Savings',
        title: `Saved towards ${data.goal.name}`,
        subtitle: 'Moved to Cashbox',
        amount: amt,
        status: 'success',
      }, amt); 

      syncWallet();
      return { ok: true, goal: data.goal };
    } catch (error) {
      return { ok: false, error: error.message || 'Deposit failed.' };
    }
  }, [balance, addTransactionOptimistically, syncWallet]);

  const withdrawFromSavings = useCallback(async (goalId, amount) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };

      const data = await apiPost('/savings/withdraw', { goalId, amount: amt });

      setSavingsGoals((prev) => {
        const updated = prev.map((g) => (g.id === goalId ? data.goal : g));
        saveJSON(STORAGE_KEYS.SAVINGS_GOALS, updated);
        return updated;
      });

      await addTransactionOptimistically({
        type: 'credit',
        category: 'Savings',
        title: `Withdrew from ${data.goal.name}`,
        subtitle: 'Returned to Wallet',
        amount: amt,
        status: 'success',
      }, amt);

      syncWallet();
      return { ok: true, goal: data.goal };
    } catch (error) {
      return { ok: false, error: error.message || 'Withdrawal failed.' };
    }
  }, [addTransactionOptimistically, syncWallet]);

  // ==========================================
  // Elite Module Additions (v2) — Flexi Credit / Loans LIVE
  // ==========================================
  const totalCredits = useMemo(() => {
    return (transactions || [])
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + (Math.abs(parseFloat(t.amount)) || 0), 0);
  }, [transactions]);

  const creditLimit = useMemo(() => {
    const computed = 50000 + totalCredits * 0.15;
    return Math.min(Math.round(computed / 1000) * 1000, 1000000);
  }, [totalCredits]);

  const requestLoan = useCallback(async ({ amount, termDays }) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (loan && !loan.repaid) return { ok: false, error: 'You already have an active loan. Repay it first.' };
      if (amt > creditLimit) return { ok: false, error: `Amount exceeds your credit limit of ${creditLimit}.` };

      const data = await apiPost('/loans/request', { amount: amt, termDays: Number(termDays) || 30 });

      setLoan(data.loan);
      await saveJSON(STORAGE_KEYS.LOAN, data.loan);

      await addTransactionOptimistically({
        type: 'credit',
        category: 'Flexi Credit',
        title: 'Loan Disbursed',
        subtitle: `${data.loan.termDays}-day term`,
        amount: amt,
        status: 'success',
      }, amt);

      syncWallet();
      return { ok: true, loan: data.loan };
    } catch (error) {
      return { ok: false, error: error.message || 'Loan request failed.' };
    }
  }, [loan, creditLimit, addTransactionOptimistically, syncWallet]);

  const repayLoan = useCallback(async (amount) => {
    try {
      const amt = Number(amount);
      if (!loan || loan.repaid) return { ok: false, error: 'No active loan to repay.' };
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (amt > balance) return { ok: false, error: 'Insufficient wallet balance.' };

      const data = await apiPost('/loans/repay', { amount: amt });

      setLoan(data.loan);
      await saveJSON(STORAGE_KEYS.LOAN, data.loan);

      await addTransactionOptimistically({
        type: 'debit',
        category: 'Flexi Credit',
        title: data.loan.repaid ? 'Loan Fully Repaid' : 'Loan Repayment',
        subtitle: `Payment applied to balance`,
        amount: amt, 
        status: 'success',
      }, amt);

      syncWallet();
      return { ok: true, loan: data.loan };
    } catch (error) {
      return { ok: false, error: error.message || 'Repayment failed.' };
    }
  }, [loan, balance, addTransactionOptimistically, syncWallet]);

  const value = {
    loading, onboarded, completeOnboarding, user, isAuthenticated,
    signup, login, logout, balance, transactions,
    transferMoney, payBill, fundWallet, syncWallet, recordInvoice,
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
