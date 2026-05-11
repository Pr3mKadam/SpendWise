/**
 * Health Score History Hook
 * Stores a daily snapshot of the health score in localStorage so we can
 * chart it over time in the Analytics view.
 */
import { useEffect, useMemo } from 'react';

const KEY = 'spendwise_health_history_v1';
const MAX_DAYS = 60;

export interface HealthHistoryPoint {
  date: string; // YYYY-MM-DD
  score: number;
}

export function useHealthHistory(currentScore: number): HealthHistoryPoint[] {
  // Load existing history once
  const history = useMemo<HealthHistoryPoint[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, []);

  // Append today's snapshot (de-duped by date)
  useEffect(() => {
    if (currentScore === 0) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      const raw = localStorage.getItem(KEY);
      const existing: HealthHistoryPoint[] = raw ? JSON.parse(raw) : [];
      const filtered = existing.filter(p => p.date !== today);
      const updated = [...filtered, { date: today, score: currentScore }]
        .slice(-MAX_DAYS);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [currentScore]);

  return history;
}
