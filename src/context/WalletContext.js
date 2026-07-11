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
  HIDE_BALANCE: 'zannypay:hideBalance', // New Storage Key
};

const SAVINGS_APY = 0.15;
const LOAN_INTEREST_RATE = 0.05;
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
  
  // Global Balance Visibility State
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

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
      console.log('Background sync failed:', error.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedBalance, savedTxns, savedOnboarded, savedToken, savedGoals, savedLoan, savedHideBalance] = await Promise.all([
          loadJSON(STORAGE_KEYS.USER, null),
          loadJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE),
          loadJSON(STORAGE_KEYS.TXNS, []),
          loadJSON(STORAGE_KEYS.ONBOARDED, false),
          getSavedToken(),
          loadJSON(STORAGE_KEYS.SAVINGS_GOALS, []),
          loadJSON(STORAGE_KEYS.LOAN, null),
          loadJSON(STORAGE_KEYS.HIDE_BALANCE, false),
        ]);

        setUser(savedUser);
        setBalance(Number(savedBalance) || 0);
        setTransactions(savedTxns);
        setOnboarded(savedOnboarded);
        setSavingsGoals(savedGoals || []);
        setLoan(savedLoan || null);
        setIsBalanceHidden(savedHideBalance || false);

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

  const signup = useCallback(async ({ name, email, phone, pin }) => { /* ... existing logic ... */ }, []);
  const login = useCallback(async (phone, pin) => { /* ... existing logic ... */ }, [syncWallet]);
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

  const addTransactionOptimistically = useCallback(async (txn, amt) => { /* ... existing logic ... */ }, []);
  const transferMoney = useCallback(async ({ recipientName, recipientAccount, bank, amount, note, pin }) => { /* ... existing logic ... */ }, [balance, addTransactionOptimistically, syncWallet]);
  const payBill = useCallback(async ({ billerName, category, amount, reference, pin }) => { /* ... existing logic ... */ }, [balance, addTransactionOptimistically, syncWallet]);
  const fundWallet = useCallback(async (amount) => { /* ... existing logic ... */ }, [addTransactionOptimistically, syncWallet]);
  const recordInvoice = useCallback(async ({ clientName, amount, description }) => { /* ... existing logic ... */ }, []);
  const createSavingsGoal = useCallback(async ({ name, target }) => { /* ... existing logic ... */ }, []);
  const depositToSavings = useCallback(async (goalId, amount) => { /* ... existing logic ... */ }, [balance, addTransactionOptimistically, syncWallet]);
  const withdrawFromSavings = useCallback(async (goalId, amount) => { /* ... existing logic ... */ }, [addTransactionOptimistically, syncWallet]);

  const totalCredits = useMemo(() => {
    return (transactions || [])
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + (Math.abs(parseFloat(t.amount)) || 0), 0);
  }, [transactions]);

  const creditLimit = useMemo(() => {
    const computed = 50000 + totalCredits * 0.15;
    return Math.min(Math.round(computed / 1000) * 1000, 1000000);
  }, [totalCredits]);

  const requestLoan = useCallback(async ({ amount, termDays }) => { /* ... existing logic ... */ }, [loan, creditLimit, addTransactionOptimistically, syncWallet]);
  const repayLoan = useCallback(async (amount) => { /* ... existing logic ... */ }, [loan, balance, addTransactionOptimistically, syncWallet]);

  const value = {
    loading, onboarded, completeOnboarding, user, isAuthenticated,
    signup, login, logout, balance, transactions,
    transferMoney, payBill, fundWallet, syncWallet, recordInvoice,
    savingsGoals, createSavingsGoal, depositToSavings, withdrawFromSavings, savingsApy: SAVINGS_APY,
    loan, creditLimit, requestLoan, repayLoan,
    isBalanceHidden, toggleBalanceHidden, // Added to context
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

