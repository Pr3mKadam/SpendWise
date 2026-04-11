import { useMemo, useCallback, useState } from 'react';
import { AppNotification, SpendingAlert, RecurringPattern, SavingsGoal, AlertSeverity } from '../types';

const STORAGE_KEY = 'spendwise_read_notifications_v1';

function loadRead(): Set<string> {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return new Set(JSON.parse(s) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function saveRead(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

// ─── Icon mapping ──────────────────────────────────────────────────────────────

function severityIcon(s: AlertSeverity): string {
  if (s === 'danger')  return '🚨';
  if (s === 'warning') return '⚠️';
  return 'ℹ️';
}

function freqIcon(f: RecurringPattern['frequency']): string {
  if (f === 'weekly')  return '🔁';
  if (f === 'annual')  return '📅';
  return '🔄';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(
  alerts:    SpendingAlert[],
  recurring: RecurringPattern[],
  goals:     SavingsGoal[],
) {
  const [readIds, setReadIds] = useState<Set<string>>(loadRead);

  // ── Build unified notification list ────────────────────────────────────────

  const notifications = useMemo((): AppNotification[] => {
    const list: AppNotification[] = [];

    // 1. Spending alerts
    alerts.forEach(a => {
      list.push({
        id:        `alert-${a.id}`,
        type:      'alert',
        title:     a.title,
        message:   a.message,
        icon:      severityIcon(a.severity),
        severity:  a.severity,
        read:      readIds.has(`alert-${a.id}`),
        timestamp: a.createdAt,
        link:      a.severity === 'danger' ? 'budget' : undefined,
      });
    });

    // 2. Upcoming recurring charges (due in next 7 days)
    const today = new Date().toISOString().split('T')[0];
    const in7   = new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0];

    recurring.forEach(r => {
      if (r.nextExpected >= today && r.nextExpected <= in7) {
        const id = `recurring-${r.merchant}-${r.nextExpected}`;
        list.push({
          id,
          type:      'recurring',
          title:     `${freqIcon(r.frequency)} Upcoming Charge`,
          message:   `${r.merchant} (~$${r.avgAmount.toFixed(2)}) expected around ${new Date(r.nextExpected + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
          icon:      freqIcon(r.frequency),
          severity:  'info',
          read:      readIds.has(id),
          timestamp: Date.now(),
          link:      'history',
        });
      }
    });

    // 3. Goal milestone notifications
    goals.forEach(g => {
      const pct = g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0;
      const milestones = [25, 50, 75, 100];
      milestones.forEach(m => {
        if (pct >= m) {
          const id = `goal-${g.id}-${m}`;
          list.push({
            id,
            type:      'goal',
            title:     pct >= 100 ? `🎉 Goal Achieved!` : `${g.emoji} Goal Milestone: ${m}%`,
            message:   pct >= 100
              ? `You reached your "${g.name}" goal of $${g.targetAmount.toLocaleString()}! Congratulations!`
              : `You're ${m}% of the way to your "${g.name}" goal ($${g.savedAmount.toLocaleString()} / $${g.targetAmount.toLocaleString()}).`,
            icon:      pct >= 100 ? '🎉' : g.emoji,
            severity:  pct >= 100 ? 'info' : 'info',
            read:      readIds.has(id),
            timestamp: Date.now() - milestones.indexOf(m) * 1000,
            link:      'goals',
          });
        }
      });
    });

    // Sort: unread first, then by timestamp desc
    return list.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.timestamp - a.timestamp;
    });
  }, [alerts, recurring, goals, readIds]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const ids = new Set(notifications.map(n => n.id));
    saveRead(ids);
    setReadIds(ids);
  }, [notifications]);

  return { notifications, unreadCount, markRead, markAllRead };
}
