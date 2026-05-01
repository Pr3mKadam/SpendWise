import { useMemo, useCallback } from 'react';
import { CategorySpend, MonthlyStats, BalanceDataPoint, Transaction, Category } from '../types';
import { useCategories } from './useCategories';
import { useStore } from '../store';

const DEFAULT_BALANCE = 5200;

export function useFinanceState(initialBalance: number = DEFAULT_BALANCE) {
  const { mergedColors } = useCategories();
  
  const transactions = useStore(state => state.transactions);
  const addTransaction = useStore(state => state.addTransaction);
  const deleteTransaction = useStore(state => state.deleteTransaction);
  const updateTransactionCategory = useStore(state => state.updateTransactionCategory);
  const bulkReassignCategory = useStore(state => state.bulkReassignCategory);
  const resetData = useStore(state => state.resetData);

  const currentBalance = useMemo(() => {
    return Math.round(
      transactions.reduce((acc, tx) => {
        return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
      }, initialBalance) * 100
    ) / 100;
  }, [transactions, initialBalance]);

  const categorySpending = useMemo((): CategorySpend[] => {
    const map = new Map<Category, number>();
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
      }
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value:   Math.round(value * 100) / 100,
        color:   mergedColors[name] || '#14b8a6',
        percent: 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, mergedColors]);

  const totalSpent = useMemo(
    () => Math.round(categorySpending.reduce((acc, c) => acc + c.value, 0) * 100) / 100,
    [categorySpending]
  );

  const dailySpendRate = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const recent = transactions.filter(tx => tx.type === 'debit' && tx.date >= cutoffStr);
    const total  = recent.reduce((acc, tx) => acc + tx.amount, 0);
    return Math.round((total / 30) * 100) / 100;
  }, [transactions]);

  const predictedEndOfMonth = useMemo(() => {
    const today    = new Date();
    const lastDay  = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - today.getDate();
    return Math.round((currentBalance - dailySpendRate * daysLeft) * 100) / 100;
  }, [currentBalance, dailySpendRate]);

  const monthlyStats = useMemo((): MonthlyStats => {
    const now      = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = transactions.filter(tx => tx.date.startsWith(monthStr));
    const income    = thisMonth.filter(tx => tx.type === 'credit').reduce((a, tx) => a + tx.amount, 0);
    const expenses  = thisMonth.filter(tx => tx.type === 'debit').reduce((a, tx) => a + tx.amount, 0);
    const net       = income - expenses;
    const savings   = income > 0 ? Math.round((net / income) * 100) : 0;
    return {
      totalIncome:      Math.round(income * 100) / 100,
      totalExpenses:    Math.round(expenses * 100) / 100,
      savingsRate:      savings,
      netCashFlow:      Math.round(net * 100) / 100,
      avgDailySpend:    Math.round((expenses / Math.max(1, now.getDate())) * 100) / 100,
      transactionCount: thisMonth.length,
    };
  }, [transactions]);

  const balanceTrend = useMemo((): BalanceDataPoint[] => {
    const points: BalanceDataPoint[] = [];
    const today = new Date();
    const startingPoint = initialBalance;
    for (let i = 13; i >= 0; i--) {
      const d       = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      let bal = startingPoint;
      transactions.forEach(tx => {
        if (tx.date <= dateStr) {
          bal += tx.type === 'credit' ? tx.amount : -tx.amount;
        }
      });
      points.push({
        date:    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(bal * 100) / 100,
      });
    }
    return points;
  }, [transactions, initialBalance]);

  const projectionMeta = useMemo(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - today.getDate();
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const debitCount = transactions.filter(tx => tx.type === 'debit' && tx.date >= cutoffStr).length;

    let quality: 'low' | 'medium' | 'high' = 'low';
    if (debitCount > 20) quality = 'high';
    else if (debitCount > 5) quality = 'medium';

    return {
      daysLeftInMonth: daysLeft,
      dataQuality: quality,
      expectedChange: Math.round((dailySpendRate * daysLeft) * 100) / 100,
    };
  }, [transactions, dailySpendRate]);

  const subscriptions = useMemo(() => {
    // Basic detection: group by description and amount
    const groups = new Map<string, Transaction[]>();
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        const key = `${tx.description.toLowerCase().trim()}_${tx.amount}`;
        const existing = groups.get(key) || [];
        groups.set(key, [...existing, tx]);
      }
    });

    const detected: { description: string; amount: number; frequency: string; lastDate: string }[] = [];
    groups.forEach((txs, key) => {
      if (txs.length >= 2) {
        // Sort by date
        const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));
        // Check for roughly monthly intervals (25-35 days)
        let isMonthly = true;
        for (let i = 1; i < sorted.length; i++) {
          const d1 = new Date(sorted[i-1].date);
          const d2 = new Date(sorted[i].date);
          const diffDays = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 25 || diffDays > 35) {
            isMonthly = false;
            break;
          }
        }
        if (isMonthly) {
          detected.push({
            description: sorted[0].description,
            amount: sorted[0].amount,
            frequency: 'Monthly',
            lastDate: sorted[sorted.length - 1].date
          });
        }
      }
    });
    return detected;
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransactionCategory,
    bulkReassignCategory,
    resetData,
    currentBalance,
    predictedEndOfMonth,
    categorySpending,
    totalSpent,
    balanceTrend,
    dailySpendRate,
    monthlyStats,
    monthlyHistory: [], // Simplified for reset
    projectionMeta,
    subscriptions,
    topCategory: categorySpending[0] || null,
  };
}
