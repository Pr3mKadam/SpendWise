/**
 * useQuestReset.ts
 * Manages daily quest state with automatic midnight reset.
 * Quests completed today are persisted in localStorage keyed by date.
 * On the next day, all completions reset.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface QuestProgress {
  date: string;                   // YYYY-MM-DD — the day this applies to
  completed: Record<string, boolean>; // questId → completed
  claimedXP: number;              // total XP claimed today
}

const KEY = 'spendwise_quest_progress_v2';
const TODAY = () => formatLocalYYYYMMDD(new Date());

function load(): QuestProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { date: TODAY(), completed: {}, claimedXP: 0 };
    const saved: QuestProgress = JSON.parse(raw);
    // Reset if it's a new day
    if (saved.date !== TODAY()) {
      return { date: TODAY(), completed: {}, claimedXP: 0 };
    }
    return saved;
  } catch {
    return { date: TODAY(), completed: {}, claimedXP: 0 };
  }
}

function save(state: QuestProgress) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function useQuestReset() {
  const [progress, setProgress] = useState<QuestProgress>(load);

  // Midnight auto-reset
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      const fresh: QuestProgress = { date: TODAY(), completed: {}, claimedXP: 0 };
      setProgress(fresh);
      save(fresh);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const completeQuest = useCallback((questId: string, xpReward: number) => {
    setProgress(prev => {
      if (prev.completed[questId]) return prev; // already done
      const next: QuestProgress = {
        ...prev,
        completed: { ...prev.completed, [questId]: true },
        claimedXP: prev.claimedXP + xpReward,
      };
      save(next);
      return next;
    });
    // Add XP to the global store for Level calculation
    useStore.getState().addXP(xpReward);
  }, []);

  const isCompleted = useCallback((questId: string) => {
    return !!progress.completed[questId];
  }, [progress]);

  const totalXPToday = progress.claimedXP;
  const completedCount = useMemo(
    () => Object.values(progress.completed).filter(Boolean).length,
    [progress]
  );

  return { isCompleted, completeQuest, totalXPToday, completedCount };
}
