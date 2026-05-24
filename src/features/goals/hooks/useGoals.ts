import { useCallback, useMemo } from 'react';
import { SavingsGoal, GoalStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';

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

export function useGoals() {
  const { user } = useAuth();
  const goals = useStore(state => state.goals);
  const setGoals = useStore(state => state.setGoals);
  const goalsHydrated = true;

  const addGoal = useCallback(
    async (partial: Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>) => {
      if (!user) return;
      
      const status = computeStatus({ ...partial, id: "", status: "on-track", createdAt: "" } as SavingsGoal);
      setGoals(prev => {
        const next = [...prev, {
          ...partial,
          id: Math.random().toString(36).substr(2, 9),
          status,
          createdAt: formatLocalYYYYMMDD(new Date())
        } as SavingsGoal];
        return next;
      });
    },
    [user, setGoals]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<SavingsGoal>) => {
      setGoals(prev => {
        const next = prev.map(g => g.id === id ? { ...g, ...updates, status: computeStatus({ ...g, ...updates }) } : g);
        return next;
      });
    },
    [setGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setGoals(prev => {
        const next = prev.filter(g => g.id !== id);
        return next;
      });
    },
    [setGoals]
  );

  const addContribution = useCallback(
    async (id: string, amount: number) => {
      // BUG-08 fix: use functional update — avoids stale closure when called rapidly
      setGoals(prev => {
        const existing = prev.find(g => g.id === id);
        if (!existing) return prev;
        const newSaved = Math.min(existing.savedAmount + amount, existing.targetAmount);
        const next = prev.map(g =>
          g.id === id
            ? {
                ...g,
                savedAmount: Math.round(newSaved * 100) / 100,
                status: computeStatus({ ...g, savedAmount: newSaved }),
              }
            : g
        );
        return next;
      });
    },
    [setGoals]
  );

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

  const goalStats = useMemo(() => ({
    onTrack: goals.filter(g => computeStatus(g) === 'on-track').length,
    atRisk:  goals.filter(g => computeStatus(g) === 'at-risk').length,
    achieved: goals.filter(g => computeStatus(g) === 'achieved').length,
  }), [goals]);

  return {
    goals,
    goalsHydrated,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    stats,
    goalStats,
    totalSaved: stats.totalSaved,
    totalTarget: stats.totalTarget,
    overallProgress: stats.overallPercent,
  };
}
