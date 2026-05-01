import { useMemo } from 'react';
import { useStore } from '../store';
import { useFinanceState } from './useFinanceState';
import { Category } from '../types';

export function useBudgets() {
  const budgets = useStore(state => state.budgets);
  const setBudget = useStore(state => state.setBudget);
  const removeBudget = useStore(state => state.removeBudget);
  const { categorySpending, monthlyStats } = useFinanceState();

  const budgetStats = useMemo(() => {
    return Object.entries(budgets).map(([category, limit]) => {
      const spending = categorySpending.find(s => s.name === category);
      const spent = spending?.value ?? 0;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      const remaining = limit - spent;
      
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percent >= 90) status = 'danger';
      else if (percent >= 75) status = 'warning';

      return {
        category: category as Category,
        limit,
        baseLimit: limit,
        rolloverAmount: 0,
        spent,
        percent,
        remaining,
        status
      };
    });
  }, [budgets, categorySpending]);

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
    monthlyExpenses: monthlyStats.totalExpenses
  };
}
