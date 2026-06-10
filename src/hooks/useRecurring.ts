import { useMemo } from 'react';
import { RecurringPattern } from '@/types';
import { useStore } from '@/store';
import { detectRecurringPatterns } from '@/utils/recurringDetection';

export function useRecurring() {
  const transactions = useStore(state => state.transactions);
  const subscriptions = useStore(state => state.subscriptions);
  const recurringTransactions = useStore(state => state.recurringTransactions);
  const addSubscription = useStore(state => state.addSubscription);
  const updateSubscription = useStore(state => state.updateSubscription);
  const deleteSubscription = useStore(state => state.deleteSubscription);
  const addRecurringTransaction = useStore(state => state.addRecurringTransaction);
  const updateRecurringTransaction = useStore(state => state.updateRecurringTransaction);
  const removeRecurringTransaction = useStore(state => state.removeRecurringTransaction);

  const patterns = useMemo(
    (): RecurringPattern[] => detectRecurringPatterns(transactions),
    [transactions]
  );

  return {
    patterns,
    subscriptions,
    recurringTransactions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addRecurringTransaction,
    updateRecurringTransaction,
    removeRecurringTransaction,
  };
}

export function useRecurringPatterns(transactions: import('@/types').Transaction[]): RecurringPattern[] {
  return useMemo(() => detectRecurringPatterns(transactions), [transactions]);
}
