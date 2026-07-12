import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api'; // Assuming you have a standard API wrapper
import AsyncStorage from '@react-native-async-storage/async-storage';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  // Core State
  const [balance, setBalance] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wealth / Savings State
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [savingsApy] = useState(0.12); // 12% APY Default

  // Finance / Loan State
  const [loan, setLoan] = useState(null);
  const [creditLimit, setCreditLimit] = useState(50000); // Dynamic based on user activity

  // ==========================================
  // INITIALIZATION & SYNC
  // ==========================================
  const syncWallet = useCallback(async () => {
    try {
      // Assuming a generic /user/me or /wallet/sync endpoint fetches the composite state
      const res = await apiGet('/wallet/sync');
      if (res && res.data) {
        setBalance(Number(res.data.wallet?.balance || 0));
        setTransactions(res.data.transactions || []);
        setUser(res.data.user || null);
        setSavingsGoals(res.data.savingsGoals || []);
        setLoan(res.data.loan || null);
        setCreditLimit(res.data.creditLimit || 50000);
      }
      return res?.data;
    } catch (err) {
      console.error('Wallet sync error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWallet();
  }, [syncWallet]);

  const toggleBalanceHidden = () => setIsBalanceHidden((prev) => !prev);

  // ==========================================
  // TRANSACTIONS / PAYMENTS
  // ==========================================
  const transferFunds = async (payload) => {
    try {
      // payload: { recipientAccount, amount, pin, bank, note, recipientName }
      const res = await apiPost('/wallet/transfer', {
        ...payload,
        amount: parseFloat(payload.amount),
      });
      if (res && res.success) {
        await syncWallet();
        return { ok: true, transactionId: res.transactionId };
      }
      return { ok: false, error: res?.error || 'Transfer failed.' };
    } catch (err) {
      return { ok: false, error: err.message || 'Network error during transfer.' };
    }
  };

  const fundWallet = async (amount) => {
    try {
      const res = await apiPost('/wallet/fund', { amount: parseFloat(amount) });
      if (res && res.success) {
        return { ok: true, authorizationUrl: res.authorizationUrl, reference: res.reference };
      }
      return { ok: false, error: res?.error || 'Could not initialize funding.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const payBill = async (payload) => {
    try {
      // payload: { billerName, category, amount, reference, pin }
      const res = await apiPost('/wallet/billpay', {
        ...payload,
        amount: parseFloat(payload.amount),
      });
      if (res && res.success) {
        await syncWallet();
        return { ok: true, transactionId: res.transactionId };
      }
      return { ok: false, error: res?.error || 'Bill payment failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const buyAirtime = async (payload) => {
    try {
      // payload matches AirtimeDto: { phone, amount, provider }
      const res = await apiPost('/wallet/airtime', {
        phone: payload.phone,
        amount: parseFloat(payload.amount),
        provider: payload.provider,
      });
      if (res && res.success) {
        await syncWallet();
        return { ok: true, transactionId: res.transactionId };
      }
      return { ok: false, error: res?.error || 'Airtime purchase failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // ==========================================
  // CARDS (CardScreen.js)
  // ==========================================
  const requestVirtualCard = async () => {
    try {
      const res = await apiPost('/wallet/cards/request');
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Card generation failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const toggleCardFreeze = async (cardId, isFrozen) => {
    try {
      const res = await apiPost(`/wallet/cards/${cardId}/freeze`, { isFrozen });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Could not update card status.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // ==========================================
  // LOANS (LoanScreen.js)
  // ==========================================
  const requestLoan = async ({ amount, termDays }) => {
    try {
      const res = await apiPost('/wallet/loans/request', { amount: parseFloat(amount), termDays });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Loan application declined.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const repayLoan = async (amount) => {
    try {
      const res = await apiPost('/wallet/loans/repay', { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true, loan: res.loan };
      }
      return { ok: false, error: res?.error || 'Repayment failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // ==========================================
  // SAVINGS / WEALTH (SavingsScreen.js)
  // ==========================================
  const createSavingsGoal = async ({ name, target }) => {
    try {
      const res = await apiPost('/wallet/savings/create', { name, target: parseFloat(target) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Failed to create goal.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const depositToSavings = async (goalId, amount) => {
    try {
      const res = await apiPost(`/wallet/savings/${goalId}/deposit`, { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Deposit failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const withdrawFromSavings = async (goalId, amount) => {
    try {
      const res = await apiPost(`/wallet/savings/${goalId}/withdraw`, { amount: parseFloat(amount) });
      if (res && res.success) {
        await syncWallet();
        return { ok: true };
      }
      return { ok: false, error: res?.error || 'Withdrawal failed.' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const value = {
    loading,
    user,
    balance,
    isBalanceHidden,
    transactions,
    savingsGoals,
    savingsApy,
    loan,
    creditLimit,
    toggleBalanceHidden,
    syncWallet,
    transferFunds,
    fundWallet,
    payBill,
    buyAirtime,
    requestVirtualCard,
    toggleCardFreeze,
    requestLoan,
    repayLoan,
    createSavingsGoal,
    depositToSavings,
    withdrawFromSavings,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
