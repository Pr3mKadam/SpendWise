import { useState, useCallback, useMemo } from 'react';
import { Budget, Category, CategorySpend } from '../types';

// ─── Default budget limits ─────────────────────────────────────────────────────

const DEFAULT_LIMITS: Partial<Record<Category, number>> = {
  Food:          400,
  Transport:     200,
  Entertainment: 150,
  Shopping:      300,
  Subscriptions: 100,
  Utilities:     180,
  Health:        150,
};

const STORAGE_KEY = 'spendwise_budgets_v1';

function loadLimits(): Partial<Record<Category, number>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Partial<Record<Category, number>>;
  } catch { /* ignore */ }
  return DEFAULT_LIMITS;
}

function saveLimits(limits: Partial<Record<Category, number>>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(limits)); } catch { /* ignore */ }
}

function getStatus(percent: number): Budget['status'] {
  if (percent >= 85) return 'danger';
  if (percent >= 60) return 'warning';
  return 'safe';
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useBudgets(categorySpending: CategorySpend[]) {
  const [limits, setLimits] = useState<Partial<Record<Category, number>>>(loadLimits);

  // Derive full Budget objects from limits + current spending
  const budgets = useMemo((): Budget[] => {
    const spendMap = new Map<string, number>();
    categorySpending.forEach(c => {
      if (c.name !== 'Income') spendMap.set(c.name, c.value);
    });

    return (Object.keys(DEFAULT_LIMITS) as Category[]).map(category => {
      const limit   = limits[category] ?? DEFAULT_LIMITS[category] ?? 100;
      const spent   = spendMap.get(category) ?? 0;
      const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0;
      return {
        category,
        limit,
        spent:     Math.round(spent * 100) / 100,
        percent,
        remaining: Math.round((limit - spent) * 100) / 100,
        status:    getStatus(percent),
      };
    });
  }, [limits, categorySpending]);

  const updateLimit = useCallback((category: Category, newLimit: number) => {
    setLimits(prev => {
      const next = { ...prev, [category]: Math.max(0, newLimit) };
      saveLimits(next);
      return next;
    });
  }, []);

  const resetLimits = useCallback(() => {
    saveLimits(DEFAULT_LIMITS);
    setLimits(DEFAULT_LIMITS);
  }, []);

  // Summary stats
  const totalBudgeted = useMemo(
    () => budgets.reduce((a, b) => a + b.limit, 0),
    [budgets]
  );
  const totalSpent = useMemo(
    () => budgets.reduce((a, b) => a + b.spent, 0),
    [budgets]
  );
  const overBudgetCount = useMemo(
    () => budgets.filter(b => b.status === 'danger').length,
    [budgets]
  );

  return {
    budgets,
    updateLimit,
    resetLimits,
    totalBudgeted,
    totalSpentAgainstBudget: totalSpent,
    overBudgetCount,
  };
}
