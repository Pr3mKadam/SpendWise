import { useMemo, useCallback, useState } from 'react';
import { AppNotification, SpendingAlert, RecurringPattern, SavingsGoal, AlertSeverity } from '../types';

const STORAGE_KEY        = 'spendwise_read_notifications_v1';
const SNOOZE_STORAGE_KEY = 'spendwise_snoozed_notifications_v1';

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

function loadSnoozed(): Record<string, number> {
  try {
    const s = localStorage.getItem(SNOOZE_STORAGE_KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

function saveSnoozed(map: Record<string, number>) {
  try { localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
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
  const [customNotifications, setCustomNotifications] = useState<AppNotification[]>([]);
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>(loadSnoozed);

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

    // 4. Custom transient notifications
    customNotifications.forEach(cn => {
      list.push({
        ...cn,
        read: readIds.has(cn.id),
      });
    });

    // Filter out currently snoozed
    const now = Date.now();
    const active = list.filter(n => !snoozedUntil[n.id] || snoozedUntil[n.id] <= now);

    // Sort: unread first, then by timestamp desc
    return active.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.timestamp - a.timestamp;
    });
  }, [alerts, recurring, goals, readIds, customNotifications, snoozedUntil]);

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

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };
    setCustomNotifications(prev => [...prev, newNotif]);
  }, []);

  /** Snooze a notification for `hours` hours (default 1h) */
  const snoozeNotification = useCallback((id: string, hours = 1) => {
    const until = Date.now() + hours * 3_600_000;
    setSnoozedUntil(prev => {
      const next = { ...prev, [id]: until };
      saveSnoozed(next);
      return next;
    });
    // Also mark as read so it doesn't show on un-snooze in unread bucket
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
  }, []);

  /** Permanently dismiss a notification (only for custom ones) */
  const dismissNotification = useCallback((id: string) => {
    setCustomNotifications(prev => prev.filter(n => n.id !== id));
    // Also mark snoozed forever
    setSnoozedUntil(prev => {
      const next = { ...prev, [id]: Date.now() + 10 * 365 * 86_400_000 };
      saveSnoozed(next);
      return next;
    });
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, addNotification, snoozeNotification, dismissNotification };
}
