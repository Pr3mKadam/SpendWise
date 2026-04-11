import { useState, useCallback, useMemo, useEffect } from 'react';
import { Budget, BudgetConfig, BudgetPeriod, Category, Transaction } from '../types';

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

const BUDGET_CATEGORIES = Object.keys(DEFAULT_LIMITS) as Category[];

// ─── Storage keys ──────────────────────────────────────────────────────────────

const LIMITS_KEY   = 'spendwise_budgets_v1';
const CONFIG_KEY   = 'spendwise_budget_config_v1';
const ROLLOVER_KEY = 'spendwise_budget_rollover_v1';

// ─── localStorage helpers ──────────────────────────────────────────────────────

function loadLimits(): Partial<Record<Category, number>> {
  try {
    const s = localStorage.getItem(LIMITS_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return DEFAULT_LIMITS;
}

function saveLimits(l: Partial<Record<Category, number>>) {
  try { localStorage.setItem(LIMITS_KEY, JSON.stringify(l)); } catch { /* ignore */ }
}

function loadConfig(): BudgetConfig {
  try {
    const s = localStorage.getItem(CONFIG_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return { period: 'monthly', rolloverEnabled: false };
}

function saveConfig(c: BudgetConfig) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

// ─── Rollover store ────────────────────────────────────────────────────────────
// Stores: which period we're in, amounts rolled INTO this period, and the
// running unspent snapshot of the current period (used to seed next rollover).

interface RolloverStore {
  periodKey:       string;                          // key of the current period
  currentRollover: Partial<Record<string, number>>; // extra limit added this period
  prevUnspent:     Partial<Record<string, number>>; // unspent at end of last period
}

function loadRolloverStore(): RolloverStore {
  try {
    const s = localStorage.getItem(ROLLOVER_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return { periodKey: '', currentRollover: {}, prevUnspent: {} };
}

function saveRolloverStore(store: RolloverStore) {
  try { localStorage.setItem(ROLLOVER_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

// ─── Period helpers ────────────────────────────────────────────────────────────

interface PeriodInfo {
  key:       string; // unique identifier for this period
  startDate: string; // YYYY-MM-DD — earliest date to include in spending
  label:     string; // human-readable label
}

function getPeriodInfo(period: BudgetPeriod): PeriodInfo {
  const now = new Date();

  if (period === 'monthly') {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return {
      key:       `${y}-${m}`,
      startDate: `${y}-${m}-01`,
      label:     now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }

  if (period === 'weekly') {
    // Week starts on Monday
    const dayOfWeek   = now.getDay();                   // 0=Sun
    const daysBack    = (dayOfWeek + 6) % 7;            // days to Monday
    const monday      = new Date(now);
    monday.setDate(now.getDate() - daysBack);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startDate = monday.toISOString().split('T')[0];
    return {
      key:       startDate,
      startDate,
      label: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ` +
             `${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    };
  }

  // biweekly: fixed 14-day blocks anchored to Jan 1 of the current year
  const startOfYear  = new Date(now.getFullYear(), 0, 1);
  const daysSinceJan = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const blockIndex   = Math.floor(daysSinceJan / 14);
  const blockStart   = new Date(startOfYear);
  blockStart.setDate(startOfYear.getDate() + blockIndex * 14);
  const blockEnd = new Date(blockStart);
  blockEnd.setDate(blockStart.getDate() + 13);
  const startDate = blockStart.toISOString().split('T')[0];
  return {
    key:       startDate,
    startDate,
    label: `${blockStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ` +
           `${blockEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
  };
}

function getStatus(percent: number): Budget['status'] {
  if (percent >= 85) return 'danger';
  if (percent >= 60) return 'warning';
  return 'safe';
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useBudgets(transactions: Transaction[]) {
  const [limits,   setLimits]   = useState<Partial<Record<Category, number>>>(loadLimits);
  const [config,   setConfig]   = useState<BudgetConfig>(loadConfig);
  const [rollover, setRollover] = useState<RolloverStore>(loadRolloverStore);

  const { period, rolloverEnabled } = config;

  // Recompute period info whenever the period type changes
  const periodInfo = useMemo(() => getPeriodInfo(period), [period]);

  // ── Detect period change and seed rollover from previous unspent ─────────────
  useEffect(() => {
    if (!rolloverEnabled) return;
    if (rollover.periodKey === periodInfo.key) return;

    // We've crossed into a new period — carry forward the saved unspent amounts
    const newStore: RolloverStore = {
      periodKey:       periodInfo.key,
      currentRollover: rollover.prevUnspent, // prev unspent becomes this period's bonus
      prevUnspent:     {},                   // reset; will fill in as user spends
    };
    saveRolloverStore(newStore);
    setRollover(newStore);
  }, [periodInfo.key, rolloverEnabled, rollover.periodKey, rollover.prevUnspent]);

  // ── Derive period-filtered spending map ──────────────────────────────────────
  const periodSpendMap = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.type === 'debit' && tx.date >= periodInfo.startDate) {
        map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
      }
    });
    return map;
  }, [transactions, periodInfo.startDate]);

  // ── Build Budget objects ─────────────────────────────────────────────────────
  const budgets = useMemo((): Budget[] => {
    return BUDGET_CATEGORIES.map(category => {
      const baseLimit     = limits[category] ?? DEFAULT_LIMITS[category] ?? 100;
      const rolloverAmt   = rolloverEnabled ? Math.round((rollover.currentRollover[category] ?? 0) * 100) / 100 : 0;
      const effectiveLimit = baseLimit + rolloverAmt;
      const spent         = Math.round((periodSpendMap.get(category) ?? 0) * 100) / 100;
      const percent       = effectiveLimit > 0 ? Math.min(Math.round((spent / effectiveLimit) * 100), 999) : 0;

      return {
        category,
        limit:          effectiveLimit,
        baseLimit,
        rolloverAmount: rolloverAmt,
        spent,
        percent,
        remaining:      Math.round((effectiveLimit - spent) * 100) / 100,
        status:         getStatus(percent),
      };
    });
  }, [limits, periodSpendMap, rolloverEnabled, rollover.currentRollover]);

  // ── Persist running unspent snapshot for the current period ─────────────────
  // (This is what will be carried forward if rollover is enabled next period)
  useEffect(() => {
    if (!rolloverEnabled) return;
    if (rollover.periodKey !== periodInfo.key) return; // avoid stomping during period transition

    const prevUnspent: Partial<Record<string, number>> = {};
    budgets.forEach(b => {
      if (b.remaining > 0) prevUnspent[b.category] = b.remaining;
    });

    // Only write if something actually changed to avoid thrashing storage
    const changed = BUDGET_CATEGORIES.some(
      cat => (prevUnspent[cat] ?? 0) !== (rollover.prevUnspent[cat] ?? 0)
    );
    if (changed) {
      const updated = { ...rollover, prevUnspent };
      saveRolloverStore(updated);
      // Use functional update to avoid stale closure; no setState to avoid loop
      // (storage-only update — React state stays until next period flip)
    }
  }, [budgets, rolloverEnabled, periodInfo.key, rollover]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const updateLimit = useCallback((category: Category, newLimit: number) => {
    setLimits(prev => {
      const next = { ...prev, [category]: Math.max(0, newLimit) };
      saveLimits(next);
      return next;
    });
  }, []);

  const resetLimits = useCallback(() => {
    saveLimits(DEFAULT_LIMITS);
    setLimits(DEFAULT_LIMITS);
  }, []);

  const updatePeriod = useCallback((newPeriod: BudgetPeriod) => {
    setConfig(prev => {
      const next = { ...prev, period: newPeriod };
      saveConfig(next);
      return next;
    });
  }, []);

  const toggleRollover = useCallback(() => {
    setConfig(prev => {
      const next = { ...prev, rolloverEnabled: !prev.rolloverEnabled };
      saveConfig(next);
      return next;
    });
  }, []);

  // ── Summary stats ────────────────────────────────────────────────────────────

  const totalBudgeted = useMemo(() => budgets.reduce((a, b) => a + b.limit, 0), [budgets]);
  const totalSpent    = useMemo(() => budgets.reduce((a, b) => a + b.spent, 0), [budgets]);
  const overBudgetCount = useMemo(() => budgets.filter(b => b.status === 'danger').length, [budgets]);

  return {
    budgets,
    updateLimit,
    resetLimits,
    updatePeriod,
    toggleRollover,
    period,
    periodLabel: periodInfo.label,
    rolloverEnabled,
    totalBudgeted,
    totalSpentAgainstBudget: totalSpent,
    overBudgetCount,
  };
}
