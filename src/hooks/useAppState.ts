import { useMemo } from 'react';
import { useTransactionContext } from '@/features/transactions/context/TransactionContext';
import { useBudgetContext } from '@/features/budget/context/BudgetContext';
import { useGoalContext } from '@/features/goals/context/GoalContext';
import { useAlerts } from '@/features/budget/hooks/useAlerts';
import { useRecurring } from '@/hooks/useRecurring';
import { useNotifications } from '@/hooks/useNotifications';
import { useCategories } from '@/hooks/useCategories';
import { useUI } from '@/hooks/useUI';
import { SpendWiseConfig } from '@/types/config';

export function useAppState(config: SpendWiseConfig | null) {
  const currency = config?.currency ?? '$';

  const financeState = useTransactionContext();

  const transactions = useMemo(
    () => financeState.transactions.filter(t => t.status !== 'pending_approval'),
    [financeState.transactions]
  );

  const budgetState = useBudgetContext();
  const goalsState = useGoalContext();
  const categoryState = useCategories();
  const { patterns: recurringData } = useRecurring();
  const { parentalState } = useUI();

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

  const notifState = useNotifications(alertState.alerts, recurringData, goalsState.goals);

  return {
    currency,
    transactions,
    financeState,
    budgetState,
    goalsState,
    categoryState,
    recurringData,
    alertState,
    notifState,
    parentalState,
  };
}
