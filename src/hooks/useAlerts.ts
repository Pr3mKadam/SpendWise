import { useMemo, useCallback, useState } from 'react';
import { Transaction, SpendingAlert, AlertSeverity, Budget, Category } from '../types';

const STORAGE_KEY = 'spendwise_dismissed_alerts_v1';

function loadDismissed(): Set<string> {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return new Set(JSON.parse(s) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

// ─── Alert generators ─────────────────────────────────────────────────────────

function makeId(...parts: (string | number)[]): string {
  return parts.join('-');
}

function alert(
  id: string,
  severity: AlertSeverity,
  title: string,
  message: string,
  category?: Category,
  actionLabel?: string,
): SpendingAlert {
  return { id, severity, title, message, category, actionLabel, createdAt: Date.now(), dismissed: false };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAlerts(
  transactions: Transaction[],
  currentBalance: number,
  budgets: Budget[],
  dailySpendRate: number,
) {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  // ── Generate all alerts from current state ─────────────────────────────────

  const rawAlerts = useMemo((): SpendingAlert[] => {
    const alerts: SpendingAlert[] = [];
    const now   = new Date();
    const today = now.toISOString().split('T')[0];

    // 1. Low balance warning
    if (currentBalance < 500 && currentBalance >= 0) {
      alerts.push(alert(
        makeId('low-balance', Math.floor(currentBalance / 100)),
        'warning',
        '⚠️ Low Balance Warning',
        `Your balance is $${currentBalance.toFixed(2)}. Consider reducing discretionary spending this week.`,
        undefined,
        'View Budget',
      ));
    }

    // 2. Critically low balance
    if (currentBalance < 100 && currentBalance >= 0) {
      alerts.push(alert(
        makeId('critical-balance'),
        'danger',
        '🚨 Critical: Balance Under $100',
        `You have only $${currentBalance.toFixed(2)} remaining. Avoid non-essential purchases immediately.`,
        undefined,
        'Review Transactions',
      ));
    }

    // 3. Negative balance
    if (currentBalance < 0) {
      alerts.push(alert(
        makeId('negative-balance'),
        'danger',
        '🔴 Account Overdrawn',
        `Your balance is -$${Math.abs(currentBalance).toFixed(2)}. This may incur overdraft fees.`,
      ));
    }

    // 4. High daily spend rate (velocity alert)
    if (dailySpendRate > 80) {
      alerts.push(alert(
        makeId('velocity', Math.floor(dailySpendRate / 10)),
        'warning',
        '🔥 High Spending Velocity',
        `You're spending $${dailySpendRate.toFixed(0)}/day over the last 30 days. At this rate you'll spend $${(dailySpendRate * 30).toFixed(0)} this month.`,
        undefined,
        'Set Budget Limits',
      ));
    }

    // 5. Budget breaches
    budgets.forEach(b => {
      if (b.status === 'danger' && b.limit > 0) {
        alerts.push(alert(
          makeId('budget-danger', b.category),
          'danger',
          `💸 Over Budget: ${b.category}`,
          `You've spent $${b.spent.toFixed(0)} of your $${b.limit} limit (${b.percent}%). You're $${Math.abs(b.remaining).toFixed(0)} over.`,
          b.category,
          'Adjust Limit',
        ));
      } else if (b.status === 'warning' && b.limit > 0) {
        alerts.push(alert(
          makeId('budget-warning', b.category, Math.floor(b.percent / 5)),
          'warning',
          `⚡ Approaching Limit: ${b.category}`,
          `${b.percent}% of your ${b.category} budget used ($${b.spent.toFixed(0)} / $${b.limit}). $${b.remaining.toFixed(0)} remaining.`,
          b.category,
        ));
      }
    });

    // 6. Spending spike — today vs daily average (velocity spike)
    const todayDebits = transactions
      .filter(tx => tx.type === 'debit' && tx.date === today)
      .reduce((a, tx) => a + tx.amount, 0);

    if (todayDebits > dailySpendRate * 2.5 && dailySpendRate > 0) {
      alerts.push(alert(
        makeId('spike', today),
        'warning',
        '📈 Spending Spike Today',
        `You've spent $${todayDebits.toFixed(0)} today — ${Math.round(todayDebits / dailySpendRate)}× your daily average of $${dailySpendRate.toFixed(0)}.`,
      ));
    }

    // 7. Large single transaction (> $300)
    const recentLarge = transactions
      .filter(tx => tx.type === 'debit' && tx.amount >= 300)
      .slice(0, 1)[0];
    if (recentLarge) {
      alerts.push(alert(
        makeId('large-tx', recentLarge.id),
        'info',
        `💰 Large Transaction Detected`,
        `$${recentLarge.amount.toFixed(2)} at ${recentLarge.merchant} (${recentLarge.category}) was your biggest recent spend.`,
        recentLarge.category,
      ));
    }

    // 8. Weekend binge detection (Sat/Sun spike)
    const dayOfWeek = now.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && todayDebits > 50) {
      alerts.push(alert(
        makeId('weekend', today),
        'info',
        '🎉 Weekend Spending Active',
        `You've spent $${todayDebits.toFixed(0)} so far this ${dayOfWeek === 6 ? 'Saturday' : 'Sunday'}. Weekends account for ~35% of most people's discretionary spend.`,
      ));
    }

    return alerts;
  }, [transactions, currentBalance, budgets, dailySpendRate]);

  // ── Filter out dismissed alerts ────────────────────────────────────────────

  const alerts = useMemo(
    () => rawAlerts.filter(a => !dismissed.has(a.id)),
    [rawAlerts, dismissed],
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const dismissAlert = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    const allIds = new Set(rawAlerts.map(a => a.id));
    saveDismissed(allIds);
    setDismissed(allIds);
  }, [rawAlerts]);

  const clearDismissed = useCallback(() => {
    const empty = new Set<string>();
    saveDismissed(empty);
    setDismissed(empty);
  }, []);

  return {
    alerts,
    alertCount:   alerts.length,
    dangerCount:  alerts.filter(a => a.severity === 'danger').length,
    warningCount: alerts.filter(a => a.severity === 'warning').length,
    dismissAlert,
    dismissAll,
    clearDismissed,
  };
}
