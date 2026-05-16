import { useCallback, useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useBudgets } from './useBudgets';
import { useAlerts } from './useAlerts';
import { useRecurring } from './useRecurring';
import { useNotifications } from './useNotifications';
import { useGoals } from './useGoals';
import { useCategories } from './useCategories';
import { SpendWiseConfig } from '../components/features/onboarding/OnboardingModal';
import { FINANCE_DEFAULTS } from '../constants';
import { Budget, BudgetPeriod } from '../types';
import { useStore } from '../store';

export function useAppState(config: SpendWiseConfig | null) {
  const currency = config?.currency ?? '$';

  const financeState = useTransactions(config?.initialBalance ?? FINANCE_DEFAULTS.INITIAL_BALANCE);
  
  // Exclude pending-approval transactions from balance & budget calculations
  const transactions = useMemo(() => 
    financeState.transactions.filter(t => t.status !== 'pending_approval'),
    [financeState.transactions]
  );

  const budgetState = useBudgets();
  const goalsState = useGoals();
  const categoryState = useCategories();
  const recurringData = useRecurring(transactions);

  const alertState = useAlerts(
    transactions,
    financeState.currentBalance,
    budgetState.budgetStats,
    financeState.dailySpendRate,
    {
      currency,
      predictedEndOfMonth: financeState.predictedEndOfMonth,
      daysLeftInMonth: financeState.projectionMeta.daysLeftInMonth,
    }
  );

  const notifState = useNotifications(
    alertState.alerts,
    recurringData,
    goalsState.goals
  );

  // Budget derived state & handlers
  const resetLimits = budgetState.resetBudgets;

  const totalSpentAgainstBudget = budgetState.budgetStats.reduce((a: number, b: Budget) => a + (b.spent || 0), 0);
  const overBudgetCount = budgetState.budgetStats.filter(b => b.status === 'danger').length;
  
  const periodLabel = budgetState.budgetSettings.period === 'weekly' 
    ? 'This Week' 
    : budgetState.budgetSettings.period === 'biweekly' 
      ? 'Last 14 Days' 
      : 'This Month';

  const updatePeriod = useCallback((p: BudgetPeriod) => {
    budgetState.updateBudgetSettings({ period: p });
  }, [budgetState.updateBudgetSettings]);

  const toggleRollover = useCallback(() => {
    budgetState.updateBudgetSettings({ rolloverEnabled: !budgetState.budgetSettings.rolloverEnabled });
  }, [budgetState.updateBudgetSettings, budgetState.budgetSettings.rolloverEnabled]);

  const parentalState = useStore((state: any) => state.parentalState);

  return {
    currency,
    transactions,
    financeState,
    budgetState: {
      ...budgetState,
      resetLimits,
      totalSpentAgainstBudget,
      overBudgetCount,
      periodLabel,
      updatePeriod,
      toggleRollover,
      removeBudget: budgetState.removeBudget,
    },
    goalsState,
    categoryState,
    recurringData,
    alertState,
    notifState,
    parentalState,
  };
}
