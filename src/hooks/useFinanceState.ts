import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Transaction,
  BalanceDataPoint,
  CategorySpend,
  Category,
  MonthlyStats,
  MonthlyHistoryPoint,
} from '../types';
import { initialTransactions, CATEGORY_COLORS } from '../data/mockData';

// ─── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY          = 'spendwise_transactions_v2';
const ONBOARDING_KEY       = 'spendwise_config_v1';
const DEFAULT_BALANCE      = 5200;

// ─── Stable seeded random (for consistent projection line across renders) ──────
// Uses a simple LCG (Linear Congruential Generator) — deterministic given same seed.

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

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useFinanceState(initialBalance: number = DEFAULT_BALANCE) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  // Persist to localStorage whenever transactions change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Clear `isNew` flag after 2s so re-renders don't re-trigger entry animations
  const newFlagTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const hasNew = transactions.some(tx => tx.isNew);
    if (!hasNew) return;
    if (newFlagTimerRef.current) clearTimeout(newFlagTimerRef.current);
    newFlagTimerRef.current = setTimeout(() => {
      setTransactions(prev => prev.map(tx => tx.isNew ? { ...tx, isNew: false } : tx));
    }, 2000);
    return () => {
      if (newFlagTimerRef.current) clearTimeout(newFlagTimerRef.current);
    };
  }, [transactions]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => [{ ...tx, isNew: true }, ...prev]);
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    setTransactions([]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  // ── Derived: balance ────────────────────────────────────────────────────────

  const currentBalance = useMemo(() => {
    const startingPoint = initialBalance;

    return Math.round(
      transactions.reduce((acc, tx) => {
        return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
      }, startingPoint) * 100
    ) / 100;
  }, [transactions, initialBalance]);

  // ── Derived: category spending (debits only) ───────────────────────────────

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

  // Attach percentages after totalSpent is known
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

  // ── Derived: daily spend rate (30-day calendar window, debits only) ────────

  const dailySpendRate = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const recent = transactions.filter(tx => tx.type === 'debit' && tx.date >= cutoffStr);
    const total  = recent.reduce((acc, tx) => acc + tx.amount, 0);
    return Math.round((total / 30) * 100) / 100;
  }, [transactions]);

  // ── Derived: predicted end-of-month balance ────────────────────────────────

  const predictedEndOfMonth = useMemo(() => {
    const today    = new Date();
    const lastDay  = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - today.getDate();
    return Math.round((currentBalance - dailySpendRate * daysLeft) * 100) / 100;
  }, [currentBalance, dailySpendRate]);

  // ── Derived: monthly stats ─────────────────────────────────────────────────

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

  // ── Derived: 6-month history (for Analytics bar chart) ────────────────────
  // Uses real transactions + simulated prior months so Analytics isn't empty.

  const monthlyHistory = useMemo((): MonthlyHistoryPoint[] => {
    const now    = new Date();
    const points: MonthlyHistoryPoint[] = [];

    // Seeded fake data for past 5 months so the chart looks alive
    const seed = 42;
    const rand = seededRandom(seed);

    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year      = d.getFullYear();
      const monthNum  = d.getMonth() + 1;
      const monthStr  = `${year}-${String(monthNum).padStart(2, '0')}`;
      const label     = d.toLocaleDateString('en-US', { month: 'short' });

      // Current month: use real transaction data
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

  // ── Derived: balance trend (14-day history + 14-day stable projection) ─────

  const balanceTrend = useMemo((): BalanceDataPoint[] => {
    const points: BalanceDataPoint[] = [];
    const today = new Date();

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

    // --- Projection: next 14 days (deterministic via seeded RNG) ---
    const seed  = transactions.length * 1000 + today.getMonth() * 100 + today.getDate();
    const rand  = seededRandom(seed);
    let lastBal = points[points.length - 1].balance;

    for (let i = 1; i <= 14; i++) {
      const d           = new Date(today);
      d.setDate(d.getDate() + i);
      const dailyChange = -(dailySpendRate) + (rand() - 0.5) * 40;
      lastBal           = Math.round((lastBal + dailyChange) * 100) / 100;

      points.push({
        date:      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance:   lastBal,
        projected: true,
      });
    }

    return points;
  }, [transactions, dailySpendRate]);

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    resetData,
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
