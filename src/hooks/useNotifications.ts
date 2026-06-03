import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  AppNotification,
  SpendingAlert,
  RecurringPattern,
  SavingsGoal,
  AlertSeverity,
} from '@/types';
import { sendBrowserNotification } from '@/utils/pushNotification';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';

// ─── Icon mapping ──────────────────────────────────────────────────────────────

function severityIcon(s: AlertSeverity): string {
  if (s === 'danger') return '🚨';
  if (s === 'warning') return '⚠️';
  return 'ℹ️';
}

function freqIcon(f: RecurringPattern['frequency']): string {
  if (f === 'weekly') return '🔁';
  if (f === 'annual') return '📅';
  return '🔄';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(
  alerts: SpendingAlert[],
  recurring: RecurringPattern[],
  goals: SavingsGoal[]
) {
  const readNotificationIds = useStore(state => state.readNotificationIds);
  const setReadNotificationIds = useStore(state => state.setReadNotificationIds);
  const snoozedNotifications = useStore(state => state.snoozedNotifications);
  const setSnoozedNotifications = useStore(state => state.setSnoozedNotifications);

  const [customNotifications, setCustomNotifications] = useState<AppNotification[]>([]);

  const readIds = useMemo(() => new Set(readNotificationIds), [readNotificationIds]);

  const prevAlertsLengthRef = useRef(alerts.length);
  useEffect(() => {
    if (alerts.length > prevAlertsLengthRef.current) {
      const newAlerts = alerts.slice(prevAlertsLengthRef.current);
      newAlerts.forEach(a => {
        if (a.severity === 'danger' || a.severity === 'warning') {
          sendBrowserNotification('⚠️ Budget Alert', a.message);
        }
      });
    }
    prevAlertsLengthRef.current = alerts.length;
  }, [alerts]);

  // ── Build unified notification list ────────────────────────────────────────

  const notifications = useMemo((): AppNotification[] => {
    const list: AppNotification[] = [];

    // 1. Spending alerts
    alerts.forEach(a => {
      list.push({
        id: `alert-${a.id}`,
        type: 'alert',
        title: a.title,
        message: a.message,
        icon: severityIcon(a.severity),
        severity: a.severity,
        read: readIds.has(`alert-${a.id}`),
        timestamp: a.createdAt,
        link: a.severity === 'danger' ? 'budget' : undefined,
      });
    });

    // 2. Upcoming recurring charges (due in next 7 days)
    const today = formatLocalYYYYMMDD(new Date());
    const in7 = formatLocalYYYYMMDD(new Date(Date.now() + 7 * 86_400_000));

    recurring.forEach(r => {
      if (r.nextExpected >= today && r.nextExpected <= in7) {
        const id = `recurring-${r.merchant}-${r.nextExpected}`;
        list.push({
          id,
          type: 'recurring',
          title: `${freqIcon(r.frequency)} Upcoming Charge`,
          message: `${r.merchant} (~$${r.avgAmount.toFixed(2)}) expected around ${new Date(r.nextExpected + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
          icon: freqIcon(r.frequency),
          severity: 'info',
          read: readIds.has(id),
          timestamp: Date.now(),
          link: 'history',
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
            type: 'goal',
            title: pct >= 100 ? `🎉 Goal Achieved!` : `${g.emoji} Goal Milestone: ${m}%`,
            message:
              pct >= 100
                ? `You reached your "${g.name}" goal of $${g.targetAmount.toLocaleString()}! Congratulations!`
                : `You're ${m}% of the way to your "${g.name}" goal ($${g.savedAmount.toLocaleString()} / $${g.targetAmount.toLocaleString()}).`,
            icon: pct >= 100 ? '🎉' : g.emoji,
            severity: pct >= 100 ? 'info' : 'info',
            read: readIds.has(id),
            timestamp: Date.now() - milestones.indexOf(m) * 1000,
            link: 'goals',
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
    const active = list.filter(
      n => !snoozedNotifications[n.id] || snoozedNotifications[n.id] <= now
    );

    // Sort: unread first, then by timestamp desc
    return active.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.timestamp - a.timestamp;
    });
  }, [alerts, recurring, goals, readIds, customNotifications, snoozedNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = useCallback(
    (id: string) => {
      setReadNotificationIds(prev => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    },
    [setReadNotificationIds]
  );

  const markAllRead = useCallback(() => {
    const ids = notifications.map(n => n.id);
    setReadNotificationIds(prev => {
      const merged = new Set([...prev, ...ids]);
      return Array.from(merged);
    });
  }, [notifications, setReadNotificationIds]);

  const addNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
      };
      setCustomNotifications(prev => [...prev, newNotif]);
    },
    []
  );

  /** Snooze a notification for `hours` hours (default 1h) */
  const snoozeNotification = useCallback(
    (id: string, hours = 1) => {
      const until = Date.now() + hours * 3_600_000;
      setSnoozedNotifications(prev => ({
        ...prev,
        [id]: until,
      }));
      // Also mark as read so it doesn't show on un-snooze in unread bucket
      setReadNotificationIds(prev => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    },
    [setSnoozedNotifications, setReadNotificationIds]
  );

  /** Permanently dismiss a notification (only for custom ones) */
  const dismissNotification = useCallback(
    (id: string) => {
      setCustomNotifications(prev => prev.filter(n => n.id !== id));
      // Also mark snoozed forever
      setSnoozedNotifications(prev => ({
        ...prev,
        [id]: Date.now() + 10 * 365 * 86_400_000,
      }));
    },
    [setSnoozedNotifications]
  );

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    addNotification,
    snoozeNotification,
    dismissNotification,
  };
}
