import { useMemo, useCallback, useState } from 'react';
import { Transaction, SpendingAlert, AlertSeverity, Budget, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

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

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface UseAlertsExtras {
  currency?:             string;
  predictedEndOfMonth?:  number;
  daysLeftInMonth?:      number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAlerts(
  transactions: Transaction[],
  currentBalance: number,
  budgets: Budget[],
  dailySpendRate: number,
  extras?: UseAlertsExtras,
) {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  // ── Generate all alerts from current state ─────────────────────────────────

  const rawAlerts = useMemo((): SpendingAlert[] => {
    const alerts: SpendingAlert[] = [];
    const now   = new Date();
    const today = formatLocalYYYYMMDD(now);

    // R3-B fix: fmt helpers defined inside useMemo to avoid stale-closure issues
    const sym = extras?.currency ?? '$';
    const fmt = (n: number, fractionDigits = 2) =>
      `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
    const fmt0 = (n: number) =>
      `${sym}${Math.round(n).toLocaleString('en-US')}`;

    const pred      = extras?.predictedEndOfMonth;
    const daysLeftM = extras?.daysLeftInMonth ?? 0;

    // 0. Predictive: month-end balance trajectory
    if (pred !== undefined && daysLeftM >= 1 && dailySpendRate > 0) {
      if (pred < 0) {
        alerts.push(alert(
          makeId('proj-negative'),
          'danger',
          '📉 Projected shortfall',
          `At your recent pace (~${fmt0(dailySpendRate)}/day), month-end balance could slip below zero (${fmt0(pred)}). Pause discretionary spend or plan a top-up.`,
          undefined,
          'View Budget',
        ));
      } else if (currentBalance >= 300 && pred < 150 && pred < currentBalance * 0.35) {
        alerts.push(alert(
          makeId('proj-low', Math.floor(pred)),
          'warning',
          '📊 Tight month-end outlook',
          `Projection: about ${fmt0(pred)} left by month-end vs ${fmt0(currentBalance)} now. Overspending and subscriptions are the usual culprits.`,
          undefined,
          'Review Spending',
        ));
      } else if (daysLeftM >= 5 && pred < currentBalance - 600 && dailySpendRate > 12) {
        alerts.push(alert(
          makeId('proj-trajectory', daysLeftM),
          'warning',
          '📉 Spending trajectory',
          `Keeping ~${fmt0(dailySpendRate)}/day suggests roughly ${fmt0(pred)} by month-end — a steep draw from today. Worth checking dining and shopping.`,
        ));
      }
    }

    // 1. Low balance warning
    if (currentBalance < 500 && currentBalance >= 0) {
      alerts.push(alert(
        makeId('low-balance', Math.floor(currentBalance / 100)),
        'warning',
        '⚠️ Low balance',
        `Your balance is ${fmt(currentBalance)}. Consider easing discretionary spending this week.`,
        undefined,
        'View Budget',
      ));
    }

    // 2. Critically low balance
    if (currentBalance < 100 && currentBalance >= 0) {
      alerts.push(alert(
        makeId('critical-balance'),
        'danger',
        '🚨 Critical: very low balance',
        `Only ${fmt(currentBalance)} left. Pause non-essential purchases until income lands.`,
        undefined,
        'Review Transactions',
      ));
    }

    // 3. Negative balance
    if (currentBalance < 0) {
      alerts.push(alert(
        makeId('negative-balance'),
        'danger',
        '🔴 Account overdrawn',
        `Balance is about -${sym}${Math.abs(currentBalance).toFixed(2)}. Watch for fees and fund the account as soon as you can.`,
      ));
    }

    // 4. High daily spend rate (velocity)
    if (dailySpendRate > 80) {
      alerts.push(alert(
        makeId('velocity', Math.floor(dailySpendRate / 10)),
        'warning',
        '🔥 High spending velocity',
        `About ${fmt0(dailySpendRate)}/day over the last 30 days — roughly ${fmt0(dailySpendRate * 30)} if that pace held a full month.`,
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
          `💸 Over budget: ${b.category}`,
          `${fmt0(b.spent)} of ${fmt0(b.limit)} (${b.percent}%). About ${fmt0(Math.abs(b.remaining))} over limit.`,
          b.category,
          'Adjust Limit',
        ));
      } else if (b.status === 'warning' && b.limit > 0) {
        alerts.push(alert(
          makeId('budget-warning', b.category, Math.floor(b.percent / 5)),
          'warning',
          `⚡ Approaching limit: ${b.category}`,
          `${b.percent}% used (${fmt0(b.spent)} / ${fmt0(b.limit)}). ${fmt0(b.remaining)} remaining.`,
          b.category,
        ));
      }
    });

    // 6. Spending spike — today vs daily average
    const todayDebits = transactions
      .filter(tx => tx.type === 'debit' && tx.date === today)
      .reduce((a, tx) => a + tx.amount, 0);

    if (todayDebits > dailySpendRate * 2.5 && dailySpendRate > 0) {
      alerts.push(alert(
        makeId('spike', today),
        'warning',
        '📈 Spending spike today',
        `${fmt0(todayDebits)} so far today — about ${Math.round(todayDebits / dailySpendRate)}× your recent daily average (${fmt0(dailySpendRate)}).`,
      ));
    }

    // 7. Large single transaction (absolute + relative threshold)
    const largeCandidates = transactions.filter(tx => tx.type === 'debit' && tx.amount >= 200);
    const recentLarge = largeCandidates.sort((a, b) => b.date.localeCompare(a.date))[0];
    if (recentLarge) {
      alerts.push(alert(
        makeId('large-tx', recentLarge.id),
        'info',
        '💰 Large transaction',
        `${fmt(recentLarge.amount)} at ${recentLarge.merchant} (${recentLarge.category}) — one of your bigger recent debits.`,
        recentLarge.category,
      ));
    }

    // 8. Unusual vs your median in that category (30d)
    const cutoff30 = new Date(now);
    cutoff30.setDate(cutoff30.getDate() - 30);
    const cutoff30Str = formatLocalYYYYMMDD(cutoff30);
    const debits30 = transactions.filter(tx => tx.type === 'debit' && tx.date >= cutoff30Str);
    const byCat = new Map<Category, number[]>();
    for (const tx of debits30) {
      const arr = byCat.get(tx.category as Category) ?? [];
      arr.push(tx.amount);
      byCat.set(tx.category as Category, arr);
    }
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeStr = formatLocalYYYYMMDD(threeDaysAgo);
    const recentDebits = debits30.filter(tx => tx.date >= threeStr);
    let unusual: Transaction | null = null;
    for (const tx of recentDebits) {
      const arr = byCat.get(tx.category as Category) ?? [];
      const med = median(arr);
      if (arr.length >= 4 && med > 0 && tx.amount >= Math.max(med * 2.8, 45) && tx.amount > med * 2) {
        if (!unusual || tx.amount > unusual.amount) unusual = tx;
      }
    }
    if (unusual) {
      const catMed = median(byCat.get(unusual.category as Category) ?? []);
      alerts.push(alert(
        makeId('unusual', unusual.id),
        'warning',
        '⚡ Unusual purchase size',
        `${fmt(unusual.amount)} at ${unusual.merchant} (${unusual.category}) is much larger than your typical ${unusual.category} debits (median ~${fmt0(catMed)}).`,
        unusual.category as Category,
      ));
    }

    // 9. Weekend note
    const dayOfWeek = now.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && todayDebits > 50) {
      alerts.push(alert(
        makeId('weekend', today),
        'info',
        '🎉 Weekend spending',
        `${fmt0(todayDebits)} so far this ${dayOfWeek === 6 ? 'Saturday' : 'Sunday'} — weekends often carry extra discretionary spend.`,
      ));
    }

    return alerts;
  }, [transactions, currentBalance, budgets, dailySpendRate, extras?.currency, extras?.predictedEndOfMonth, extras?.daysLeftInMonth]);

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
