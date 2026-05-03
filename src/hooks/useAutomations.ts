import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { RecurringTransaction, Transaction } from '../types';

function getNextDate(dateStr: string, frequency: RecurringTransaction['frequency']): string {
  const d = new Date(dateStr + 'T00:00:00');
  switch (frequency) {
    case 'daily':   d.setDate(d.getDate() + 1); break;
    case 'weekly':  d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly':  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

export function useAutomations() {
  const recurringTransactions = useStore(s => s.recurringTransactions);
  const addTransactions = useStore(s => s.addTransactions);
  const updateRecurringTransaction = useStore(s => s.updateRecurringTransaction);
  
  // Use a ref to ensure we only run this once per mount, or avoid infinite loops if state updates trigger re-renders
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!recurringTransactions || recurringTransactions.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newTransactions: Transaction[] = [];

    recurringTransactions.forEach(rt => {
      let nextOccur = rt.nextOccurrence;
      let updated = false;

      // While the next occurrence is today or in the past
      while (nextOccur <= todayStr) {
        // Create a transaction for this occurrence
        newTransactions.push({
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: nextOccur,
          amount: rt.amount,
          category: rt.category,
          merchant: rt.merchant,
          type: 'debit',
          description: `Auto-generated ${rt.frequency} subscription`,
          isRecurring: true,
          status: 'completed',
        });
        
        // Calculate the next one
        nextOccur = getNextDate(nextOccur, rt.frequency);
        updated = true;
      }

      if (updated) {
        updateRecurringTransaction(rt.id, {
          lastProcessed: todayStr,
          nextOccurrence: nextOccur,
        });
      }
    });

    if (newTransactions.length > 0) {
      addTransactions(newTransactions);
    }
  }, [recurringTransactions, addTransactions, updateRecurringTransaction]);
}
