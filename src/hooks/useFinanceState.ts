import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Transaction,
  BalanceDataPoint,
  CategorySpend,
  Category,
  MonthlyStats,
  MonthlyHistoryPoint,
} from '../types';
import { initialTransactions, CATEGORY_COLORS, INITIAL_TRANSACTIONS_NET } from '../data/mockData';
import {
  deleteTransactionRemote,
  fetchTransactions,
  insertTransactionRemote,
  resetUserCloudData,
} from '../lib/supabaseData';

// ─── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY    = 'spendwise_transactions_v2';
const ONBOARDING_KEY = 'spendwise_config_v1';
const DEFAULT_BALANCE = 5200;

// ─── Stable seeded random (for consistent projection line across renders) ──────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

function loadTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Transaction[];
      return parsed.map(tx => ({ ...tx, isNew: false }));
    }
  } catch { /* ignore parse errors */ }
  return [];
}

function saveTransactions(txs: Transaction[]): void {
  try {
    const toSave = txs.map(tx => ({ ...tx, isNew: false }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore quota errors */ }
}

// ─── Hook options ──────────────────────────────────────────────────────────────

export interface UseFinanceStateOptions {
  userId?:           string | null;
  balanceAnchorNet?: number;
  onResetConfig?:    () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useFinanceState(
  initialBalance: number = DEFAULT_BALANCE,
  options?: UseFinanceStateOptions
) {
  const userId           = options?.userId ?? null;
  const balanceAnchorNet = options?.balanceAnchorNet ?? INITIAL_TRANSACTIONS_NET;

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    userId ? [] : loadTransactions()
  );
  const [remoteHydrated, setRemoteHydrated] = useState(!userId);

  // Load / switch between local and cloud ledger
  useEffect(() => {
    if (!userId) {
      setTransactions(loadTransactions());
      setRemoteHydrated(true);
      return;
    }

    setRemoteHydrated(false);
    setTransactions([]);

    let cancelled = false;
    fetchTransactions(userId)
      .then(rows => {
        if (cancelled) return;
        setTransactions(rows.map(tx => ({ ...tx, isNew: false })));
      })
      .catch(() => {
        if (cancelled) return;
        setTransactions([]);
      })
      .finally(() => {
        if (!cancelled) setRemoteHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persist locally when not using cloud
  useEffect(() => {
    if (userId) return;
    saveTransactions(transactions);
  }, [transactions, userId]);

  // Clear `isNew` flag after 2s
  const newFlagTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const hasNew = transactions.some(tx => tx.isNew);
    if (!hasNew) return;
    if (newFlagTimerRef.current) clearTimeout(newFlagTimerRef.current);
    newFlagTimerRef.current = setTimeout(() => {
      setTransactions(prev => prev.map(tx => (tx.isNew ? { ...tx, isNew: false } : tx)));
    }, 2000);
    return () => {
      if (newFlagTimerRef.current) clearTimeout(newFlagTimerRef.current);
    };
  }, [transactions]);

  const addTransaction = useCallback(
    (tx: Transaction) => {
      const next = { ...tx, isNew: true } as Transaction;
      setTransactions(prev => [next, ...prev]);
      if (userId) void insertTransactionRemote(userId, next);
    },
    [userId]
  );

  const onResetConfigRef = useRef(options?.onResetConfig);
  onResetConfigRef.current = options?.onResetConfig;

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    setTransactions([]);
  }, []);

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      if (userId) void deleteTransactionRemote(userId, id);
    },
    [userId]
  );

  // ── Derived: balance ────────────────────────────────────────────────────────

  const currentBalance = useMemo(() => {
    const startingPoint = initialBalance;

  // ── Derived: category spending (debits only) ─────────────────────────────────

  const categorySpending = useMemo((): CategorySpend[] => {
    const map = new Map<Category, number>();
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
      }
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value:   Math.round(value * 100) / 100,
        color:   CATEGORY_COLORS[name],
        percent: 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalSpent = useMemo(
    () => Math.round(categorySpending.reduce((acc, c) => acc + c.value, 0) * 100) / 100,
    [categorySpending]
  );

  const categorySpendingWithPercent = useMemo((): CategorySpend[] => {
    return categorySpending.map(c => ({
      ...c,
      percent: totalSpent > 0 ? Math.round((c.value / totalSpent) * 100) : 0,
    }));
  }, [categorySpending, totalSpent]);

  const topCategory = useMemo(
    () => (categorySpendingWithPercent.length > 0 ? categorySpendingWithPercent[0] : null),
    [categorySpendingWithPercent]
  );

  const dailySpendRate = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const recent = transactions.filter(tx => tx.type === 'debit' && tx.date >= cutoffStr);
    const total  = recent.reduce((acc, tx) => acc + tx.amount, 0);
    return Math.round((total / 30) * 100) / 100;
  }, [transactions]);

  const predictedEndOfMonth = useMemo(() => {
    const today    = new Date();
    const lastDay  = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - today.getDate();
    return Math.round((currentBalance - dailySpendRate * daysLeft) * 100) / 100;
  }, [currentBalance, dailySpendRate]);

  const monthlyStats = useMemo((): MonthlyStats => {
    const now      = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = transactions.filter(tx => tx.date.startsWith(monthStr));
    const income    = thisMonth.filter(tx => tx.type === 'credit').reduce((a, tx) => a + tx.amount, 0);
    const expenses  = thisMonth.filter(tx => tx.type === 'debit').reduce((a, tx) => a + tx.amount, 0);
    const net       = income - expenses;
    const savings   = income > 0 ? Math.round((net / income) * 100) : 0;
    const days      = now.getDate();
    return {
      totalIncome:      Math.round(income * 100) / 100,
      totalExpenses:    Math.round(expenses * 100) / 100,
      savingsRate:      savings,
      netCashFlow:      Math.round(net * 100) / 100,
      avgDailySpend:    Math.round((expenses / Math.max(1, days)) * 100) / 100,
      transactionCount: thisMonth.length,
    };
  }, [transactions]);

  const monthlyHistory = useMemo((): MonthlyHistoryPoint[] => {
    const now    = new Date();
    const points: MonthlyHistoryPoint[] = [];
    const seed = 42;
    const rand = seededRandom(seed);

    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year      = d.getFullYear();
      const monthNum  = d.getMonth() + 1;
      const monthStr  = `${year}-${String(monthNum).padStart(2, '0')}`;
      const label     = d.toLocaleDateString('en-US', { month: 'short' });

      if (m === 0) {
        const thisMonth = transactions.filter(tx => tx.date.startsWith(monthStr));
        const income    = thisMonth.filter(tx => tx.type === 'credit').reduce((a, tx) => a + tx.amount, 0);
        const expenses  = thisMonth.filter(tx => tx.type === 'debit').reduce((a, tx) => a + tx.amount, 0);
        points.push({
          month:    label,
          income:   Math.round(income),
          expenses: Math.round(expenses),
          savings:  Math.round(income - expenses),
        });
      } else {
        points.push({
          month:    label,
          income:   0,
          expenses: 0,
          savings:  0,
        });
      }
    }

    return points;
  }, [transactions]);

  const balanceTrend = useMemo((): BalanceDataPoint[] => {
    const points: BalanceDataPoint[] = [];
    const today = new Date();
    const startingPoint = initialBalance - balanceAnchorNet;

    // Use the same starting point reverse-calc for the trend lines
    const startingPoint = initialBalance;

    // --- Historical: last 14 days ---
    for (let i = 13; i >= 0; i--) {
      const d       = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      let bal = startingPoint;
      transactions.forEach(tx => {
        if (tx.date <= dateStr) {
          bal += tx.type === 'credit' ? tx.amount : -tx.amount;
        }
      });

      points.push({
        date:    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(bal * 100) / 100,
      });
    }

    const seed  = transactions.length * 1000 + today.getMonth() * 100 + today.getDate();
    const rand  = seededRandom(seed);
    let lastBal = points[points.length - 1].balance;

    for (let i = 1; i <= 14; i++) {
      const d           = new Date(today);
      d.setDate(d.getDate() + i);
      const dailyChange = -dailySpendRate + (rand() - 0.5) * 40;
      lastBal           = Math.round((lastBal + dailyChange) * 100) / 100;

      points.push({
        date:      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance:   lastBal,
        projected: true,
      });
    }

    return points;
  }, [transactions, dailySpendRate, initialBalance, balanceAnchorNet]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    resetData,
    remoteHydrated,
    currentBalance,
    predictedEndOfMonth,
    topCategory,
    categorySpending: categorySpendingWithPercent,
    totalSpent,
    balanceTrend,
    dailySpendRate,
    monthlyStats,
    monthlyHistory,
  };
}
