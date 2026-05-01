import { useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Transaction, RecurringPattern } from '../types';

export function useSubscriptions() {
  const transactions = useStore(state => state.transactions);
  const subscriptions = useStore(state => state.subscriptions);
  const addSubscription = useStore(state => state.addSubscription);
  const updateSubscription = useStore(state => state.updateSubscription);

  // Auto-detector logic
  useEffect(() => {
    const merchants = new Map<string, Transaction[]>();
    
    // Group by merchant
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        const list = merchants.get(tx.merchant) ?? [];
        list.push(tx);
        merchants.set(tx.merchant, list);
      }
    });

    merchants.forEach((txs, merchant) => {
      if (txs.length >= 2) {
        // Sort by date
        const sorted = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Calculate average interval (days)
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          const d1 = new Date(sorted[i-1].date).getTime();
          const d2 = new Date(sorted[i].date).getTime();
          intervals.push((d2 - d1) / (1000 * 60 * 60 * 24));
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        // If interval is roughly 30 days (month) or 7 days (week) or 365 days (year)
        let frequency: 'weekly' | 'monthly' | 'annual' | null = null;
        if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly';
        else if (avgInterval >= 6 && avgInterval <= 8) frequency = 'weekly';
        else if (avgInterval >= 360 && avgInterval <= 370) frequency = 'annual';

        if (frequency) {
          const lastTx = sorted[sorted.length - 1];
          const avgAmount = txs.reduce((a, b) => a + b.amount, 0) / txs.length;
          
          const existing = subscriptions.find(s => s.merchant === merchant);
          
          const nextDate = new Date(lastTx.date);
          if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          else if (frequency === 'annual') nextDate.setFullYear(nextDate.getFullYear() + 1);

          const pattern: RecurringPattern = {
            merchant,
            category: lastTx.category,
            avgAmount,
            frequency,
            lastSeen: lastTx.date,
            nextExpected: nextDate.toISOString().split('T')[0],
            occurrences: txs.length,
            totalSpent: txs.reduce((a, b) => a + b.amount, 0),
            priceCreep: lastTx.amount > avgAmount + 10 // small buffer
          };

          if (!existing) {
            addSubscription(pattern);
          } else if (existing.lastSeen !== lastTx.date) {
            updateSubscription(merchant, pattern);
          }
        }
      }
    });
  }, [transactions]); // Run when transactions change

  return {
    subscriptions,
    upcoming: useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      return subscriptions
        .filter(s => s.nextExpected >= today)
        .sort((a, b) => a.nextExpected.localeCompare(b.nextExpected));
    }, [subscriptions])
  };
}
