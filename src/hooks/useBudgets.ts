import { useState, useCallback, useMemo, useEffect } from 'react';
import { Budget, Category, CategorySpend } from '../types';
import { fetchBudgetLimits, saveBudgetLimits } from '../lib/supabaseData';

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

export function useBudgets(
  categorySpending: CategorySpend[],
  userId?: string | null,
  refreshKey = 0
) {
  const [limits, setLimits] = useState<Partial<Record<Category, number>>>(() =>
    userId ? DEFAULT_LIMITS : loadLimits()
  );
  const [budgetsHydrated, setBudgetsHydrated] = useState(!userId);

  useEffect(() => {
    if (!userId) {
      setLimits(loadLimits());
      setBudgetsHydrated(true);
      return;
    }

    setBudgetsHydrated(false);
    fetchBudgetLimits(userId)
      .then(bl => {
        setLimits({ ...DEFAULT_LIMITS, ...(bl ?? {}) });
      })
      .catch(() => {
        setLimits({ ...DEFAULT_LIMITS });
      })
      .finally(() => setBudgetsHydrated(true));
  }, [userId, refreshKey]);

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

  const updateLimit = useCallback(
    (category: Category, newLimit: number) => {
      setLimits(prev => {
        const next = { ...prev, [category]: Math.max(0, newLimit) };
        if (userId) void saveBudgetLimits(userId, next);
        else saveLimits(next);
        return next;
      });
    },
    [userId]
  );

  const resetLimits = useCallback(() => {
    setLimits(DEFAULT_LIMITS);
    if (userId) void saveBudgetLimits(userId, DEFAULT_LIMITS);
    else saveLimits(DEFAULT_LIMITS);
  }, [userId]);

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
    budgetsHydrated,
    updateLimit,
    resetLimits,
    totalBudgeted,
    totalSpentAgainstBudget: totalSpent,
    overBudgetCount,
  };
}
