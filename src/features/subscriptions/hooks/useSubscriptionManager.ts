import { useMemo } from 'react';
import { RecurringPattern } from '@/types';
import { useStore } from '@/store';

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

export function useSubscriptionManager(patterns: RecurringPattern[]) {
  const recurringTransactions = useStore(s => s.recurringTransactions);

  const autoSubscriptions = useMemo(() =>
    (patterns || [])
      .filter(p => p.category === 'Subscriptions' || p.frequency === 'monthly' || p.frequency === 'annual')
      .sort((a, b) => b.avgAmount - a.avgAmount),
    [patterns]
  );

  const manualSubscriptions = useMemo(() =>
    (recurringTransactions || []).map(rt => ({
      merchant:     rt.merchant,
      category:     rt.category,
      avgAmount:    rt.amount,
      frequency:    rt.frequency as RecurringPattern['frequency'],
      lastSeen:     rt.lastProcessed || new Date().toISOString(),
      nextExpected: rt.nextOccurrence,
      occurrences:  0,
      totalSpent:   0,
      priceCreep:   false,
      isTrial:      rt.isTrial,
      trialEndsAt:  rt.trialEndsAt,
    } as RecurringPattern)),
    [recurringTransactions]
  );

  const subscriptions = useMemo(() => {
    const combined = [...autoSubscriptions];
    manualSubscriptions.forEach(ms => {
      if (!combined.find(s => s.merchant.toLowerCase() === ms.merchant.toLowerCase())) {
        combined.push(ms);
      }
    });
    return combined.sort((a, b) => b.avgAmount - a.avgAmount);
  }, [autoSubscriptions, manualSubscriptions]);

  const monthlyTotal = useMemo(() =>
    subscriptions.filter(s => s.frequency === 'monthly').reduce((sum, s) => sum + s.avgAmount, 0),
    [subscriptions]
  );

  const annualTotal = useMemo(() =>
    subscriptions.reduce((sum, s) => {
      if (s.frequency === 'monthly') return sum + s.avgAmount * 12;
      if (s.frequency === 'annual')  return sum + s.avgAmount;
      return sum;
    }, 0),
    [subscriptions]
  );

  const upcoming = useMemo(() =>
    subscriptions.filter(s => daysUntil(s.nextExpected) <= 7),
    [subscriptions]
  );

  return { subscriptions, monthlyTotal, annualTotal, upcoming, daysUntil };
}
