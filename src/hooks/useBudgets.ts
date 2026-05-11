import { useMemo } from 'react';
import { useStore } from '../store';
import { useFinanceState } from './useFinanceState';
import { Category } from '../types';

export function useBudgets() {
  const budgets = useStore(state => state.budgets);
  const budgetSettings = useStore(state => state.budgetSettings) || { period: 'monthly', rolloverEnabled: false };
  const setBudget = useStore(state => state.setBudget);
  const removeBudget = useStore(state => state.removeBudget);
  const updateBudgetSettings = useStore(state => state.updateBudgetSettings);
  const { transactions, monthlyStats } = useFinanceState();

  const budgetStats = useMemo(() => {
    // Determine the start date of the current period
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    
    if (budgetSettings.period === 'weekly') {
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (budgetSettings.period === 'biweekly') {
      startDate.setDate(now.getDate() - 14); // Last 14 days
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 14);
    } else {
      startDate.setDate(1); // Start of month
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    }
    startDate.setHours(0, 0, 0, 0);
    prevStartDate.setHours(0, 0, 0, 0);
    
    const startDateStr    = startDate.toISOString().split('T')[0];
    const endDateStr      = now.toISOString().split('T')[0]; // today — never include future dates
    const prevStartDateStr = prevStartDate.toISOString().split('T')[0];

    // Compute period spending per category
    const periodSpending = new Map<string, number>();
    const prevPeriodSpending = new Map<string, number>();

    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        if (tx.date >= startDateStr && tx.date <= endDateStr) {
          periodSpending.set(tx.category, (periodSpending.get(tx.category) || 0) + tx.amount);
        } else if (tx.date >= prevStartDateStr && tx.date < startDateStr) {
          prevPeriodSpending.set(tx.category, (prevPeriodSpending.get(tx.category) || 0) + tx.amount);
        }
      }
    });

    return Object.entries(budgets).map(([category, limit]) => {
      const spent = periodSpending.get(category) ?? 0;
      let limitWithRollover = limit;
      let rolloverAmount = 0;
      
      if (budgetSettings.rolloverEnabled) {
        const prevSpent = prevPeriodSpending.get(category) ?? 0;
        const unspent = Math.max(0, limit - prevSpent);
        rolloverAmount = unspent;
        limitWithRollover = limit + rolloverAmount;
      }
      
      const percent = limitWithRollover > 0 ? (spent / limitWithRollover) * 100 : 0;
      const remaining = limitWithRollover - spent;
      
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percent >= 90) status = 'danger';
      else if (percent >= 75) status = 'warning';

      return {
        category: category as Category,
        limit: limitWithRollover,
        baseLimit: limit,
        rolloverAmount,
        spent,
        percent: Math.round(percent),
        remaining,
        status
      };
    });
  }, [budgets, transactions, budgetSettings.period, budgetSettings.rolloverEnabled]);

  const totalBudgeted = Object.values(budgets).reduce((a, b) => a + b, 0);
  const totalSpentInBudgeted = budgetStats.reduce((a, b) => a + b.spent, 0);
  const overallBudgetPercent = totalBudgeted > 0 ? (totalSpentInBudgeted / totalBudgeted) * 100 : 0;

  return {
    budgets,
    budgetStats,
    setBudget,
    removeBudget,
    totalBudgeted,
    overallBudgetPercent,
    monthlyExpenses: monthlyStats.totalExpenses,
    budgetSettings,
    updateBudgetSettings
  };
}
