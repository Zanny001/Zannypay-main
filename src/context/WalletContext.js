import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
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
  HIDE_BALANCE: 'zannypay:hideBalance',
};

const SAVINGS_APY = 0.15;
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
        setUser(data.user);
        await saveJSON(STORAGE_KEYS.USER, data.user);

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

  const signup = useCallback(async ({ name, email, phone, pin }) => {
    try {
      const res = await apiPost('/auth/signup', { name, email, phone, pin }); 
      const validToken = res?.access_token || res?.token;

      if (res && validToken) {
        await saveToken(validToken);
        setToken(validToken);
        setUser(res.user);                                                    
        setIsAuthenticated(true);                                             
        await saveJSON(STORAGE_KEYS.USER, res.user);
        Alert.alert('Success', 'Account registered successfully!');
        return { ok: true };
      } else {                                                                
        return { ok: false, error: res?.error || 'Registration failed.' };    
      }
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
      } else {
        return { ok: false, error: res?.error || 'Invalid telephone number or PIN.' };
      }
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

  const addTransactionOptimistically = useCallback(async (txn) => {
    setTransactions((prev) => [txn, ...prev]);
  }, []);

  const transferMoney = useCallback(async ({ recipientName, recipientAccount, bank, amount, note, pin }) => {
    try {
      const res = await apiPost('/wallet/transfer', { recipientName, recipientAccount, bank, amount: parseFloat(amount), note, pin });
      if (res && res.success) {
        if (res.transaction) addTransactionOptimistically(res.transaction);   
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Transfer transaction rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [addTransactionOptimistically, syncWallet]);

  const payBill = useCallback(async ({ billerName, category, amount, reference, pin }) => {                                                                 
    try {
      const res = await apiPost('/wallet/billpay', { billerName, category, amount: parseFloat(amount), reference, pin });
      if (res && res.success) {
        if (res.transaction) addTransactionOptimistically(res.transaction);
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Bill payment rejected.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [addTransactionOptimistically, syncWallet]);

  const buyAirtime = useCallback(async ({ phone, amount, provider }) => {
    try {
      const res = await apiPost('/wallet/airtime', { phone, amount: parseFloat(amount), provider });
      if (res && res.success) {
        if (res.transaction) addTransactionOptimistically(res.transaction);
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Airtime purchase failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [addTransactionOptimistically, syncWallet]);

  const fundWallet = useCallback(async (amount) => {
    try {
      const res = await apiPost('/wallet/fund', { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Funding request failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  // FIX: Point to the new standalone invoices controller path
  const recordInvoice = useCallback(async ({ clientName, amount, description }) => {
    try {
      await apiPost('/invoices', { clientName, amount: parseFloat(amount), description });
      return { ok: true };
    } catch (err) {                                                           
      return { ok: false, error: err.message };
    }
  }, []);

  const createSavingsGoal = useCallback(async ({ name, target }) => {
    try {                                                                     
      const res = await apiPost('/savings/create', { name, target: parseFloat(target) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Could not instantiate target.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const depositToSavings = useCallback(async (goalId, amount) => {
    try {
      const res = await apiPost(`/savings/deposit/${goalId}`, { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Savings transaction failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const withdrawFromSavings = useCallback(async (goalId, amount) => {
    try {
      const res = await apiPost(`/savings/withdraw/${goalId}`, { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();                                                   
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Withdrawal transaction failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  // NEW: Request a virtual card
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

  // NEW: Toggle card freeze status
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
      const res = await apiPost('/loans/request', { amount: parseFloat(amount), termDays });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Loan acquisition refused.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [syncWallet]);

  const repayLoan = useCallback(async (amount) => {                           
    try {
      const res = await apiPost('/loans/repay', { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };                                                  
      }
      return { ok: false, error: res?.error || 'Payment execution rejected.' };
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
    requestVirtualCard, toggleCardFreeze, // <-- NEW EXPORTS
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
