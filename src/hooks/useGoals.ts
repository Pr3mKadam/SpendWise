import { useState, useCallback, useMemo } from 'react';
import { SavingsGoal, GoalStatus } from '../types';

const STORAGE_KEY = 'spendwise_goals_v1';

// ─── Default sample goals so the page looks alive on first load ────────────────

function makeDefaultGoals(): SavingsGoal[] {
  const today   = new Date();
  const fmt     = (d: Date) => d.toISOString().split('T')[0];
  const inMonths = (n: number) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + n);
    return fmt(d);
  };

  return [
    {
      id:                  'goal-1',
      name:                'Emergency Fund',
      emoji:               '🛡️',
      targetAmount:        10000,
      savedAmount:         4200,
      targetDate:          inMonths(8),
      monthlyContribution: 600,
      status:              'on-track',
      color:               '#10b981',
      createdAt:           fmt(today),
    },
    {
      id:                  'goal-2',
      name:                'Dream Vacation',
      emoji:               '✈️',
      targetAmount:        3500,
      savedAmount:         1800,
      targetDate:          inMonths(5),
      monthlyContribution: 350,
      status:              'at-risk',
      color:               '#3b82f6',
      createdAt:           fmt(today),
    },
    {
      id:                  'goal-3',
      name:                'New MacBook Pro',
      emoji:               '💻',
      targetAmount:        2499,
      savedAmount:         2499,
      targetDate:          inMonths(-1), // already achieved
      monthlyContribution: 0,
      status:              'achieved',
      color:               '#a855f7',
      createdAt:           fmt(today),
    },
  ];
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadGoals(): SavingsGoal[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s) as SavingsGoal[];
  } catch { /* ignore */ }
  return [];
}

function saveGoals(goals: SavingsGoal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch { /* ignore */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStatus(goal: SavingsGoal): GoalStatus {
  if (goal.savedAmount >= goal.targetAmount) return 'achieved';

  const today        = new Date();
  const target       = new Date(goal.targetDate + 'T00:00:00');
  const daysLeft     = Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
  const monthsLeft   = daysLeft / 30;
  const remaining    = goal.targetAmount - goal.savedAmount;
  const neededPerMth = monthsLeft > 0 ? remaining / monthsLeft : Infinity;

  if (goal.monthlyContribution <= 0) return 'paused';
  if (neededPerMth > goal.monthlyContribution * 1.2) return 'at-risk';
  return 'on-track';
}

function uid(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>(loadGoals);



  // ── CRUD ───────────────────────────────────────────────────────────────────

  const addGoal = useCallback((
    partial: Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>,
  ) => {
    const draft: SavingsGoal = {
      ...partial,
      id:        uid(),
      status:    'on-track',
      createdAt: new Date().toISOString().split('T')[0],
    };
    draft.status = computeStatus(draft);
    setGoals(prev => {
      const next = [...prev, draft];
      saveGoals(next);
      return next;
    });
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id !== id) return g;
        const updated = { ...g, ...updates };
        updated.status = computeStatus(updated);
        return updated;
      });
      saveGoals(next);
      return next;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id);
      saveGoals(next);
      return next;
    });
  }, []);

  const addContribution = useCallback((id: string, amount: number) => {
    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id !== id) return g;
        const newSaved = Math.min(g.savedAmount + amount, g.targetAmount);
        const updated  = { ...g, savedAmount: Math.round(newSaved * 100) / 100 };
        updated.status = computeStatus(updated);
        return updated;
      });
      saveGoals(next);
      return next;
    });
  }, []);

  // ── Summary stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const active   = goals.filter(g => g.status !== 'achieved');
    const achieved = goals.filter(g => g.status === 'achieved');
    const totalTarget = active.reduce((a, g) => a + g.targetAmount, 0);
    const totalSaved  = active.reduce((a, g) => a + g.savedAmount, 0);
    const monthlyCommitted = active.reduce((a, g) => a + g.monthlyContribution, 0);

    return {
      activeCount:       active.length,
      achievedCount:     achieved.length,
      totalTarget,
      totalSaved,
      overallPercent:    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
      monthlyCommitted,
    };
  }, [goals]);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    stats,
  };
}
