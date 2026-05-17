import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Transaction } from '../../../types';

interface SafeToSpendProps {
  transactions: Transaction[];
  currency: string;
  currentBalance: number;
}

export function SafeToSpend({ transactions, currency, currentBalance }: SafeToSpendProps) {
  const data = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeft = daysInMonth - dayOfMonth + 1;

    // Monthly income (credits this month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthTx = transactions.filter(t => t.date >= monthStart);
    const monthlyIncome = monthTx.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);
    const monthlySpent = monthTx.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0);

    // Estimate monthly fixed costs (recurring debits)
    const avgMonthlySpend = monthlySpent > 0 ? monthlySpent : currentBalance * 0.3;

    // Target: save 20% of income
    const savingsTarget = monthlyIncome * 0.20;
    const essentialBuffer = avgMonthlySpend * 0.3; // 30% for fixed costs remaining
    const available = currentBalance - savingsTarget - essentialBuffer;
    const safePerDay = daysLeft > 0 ? Math.max(0, available / daysLeft) : 0;

    // Status
    const ratio = safePerDay / (avgMonthlySpend / daysInMonth || 1);
    const status: 'great' | 'ok' | 'tight' =
      ratio > 1.2 ? 'great' : ratio > 0.7 ? 'ok' : 'tight';

    const todaySpent = transactions
      .filter(t => t.type === 'debit' && t.date === now.toISOString().split('T')[0])
      .reduce((a, t) => a + t.amount, 0);

    const remaining = Math.max(0, safePerDay - todaySpent);
    const usedPct = safePerDay > 0 ? Math.min(100, (todaySpent / safePerDay) * 100) : 0;

    return { safePerDay, todaySpent, remaining, usedPct, status, daysLeft, savingsTarget };
  }, [transactions, currentBalance]);

  const statusConfig = {
    great: { color: '#10b981', bg: '#10b98115', icon: CheckCircle, label: 'Healthy Budget' },
    ok:    { color: '#f59e0b', bg: '#f59e0b15', icon: ShieldCheck,  label: 'Watch Spending' },
    tight: { color: '#ef4444', bg: '#ef444415', icon: AlertCircle,  label: 'Budget Tight' },
  };
  const cfg = statusConfig[data.status];

  return (
    <div className="card p-4 sm:p-5 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: cfg.color }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Safe to Spend
          </p>
          <p className="text-[length:var(--fs-caption)] text-[var(--text-dim)] mt-0.5 font-inter">Today's budget</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[length:var(--fs-overline)] font-bold"
          style={{ background: cfg.bg, color: cfg.color }}>
          <cfg.icon size={10} />
          {cfg.label}
        </div>
      </div>

      {/* Big number */}
      <div className="flex items-end gap-2 mb-4">
        <span className="font-manrope font-black text-3xl sm:text-4xl tabular-nums"
          style={{ color: cfg.color, letterSpacing: '-0.04em' }}>
          {currency}{Math.round(data.remaining).toLocaleString('en-IN')}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-inter mb-1.5">left today</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1.5">
          <span>Spent: {currency}{Math.round(data.todaySpent).toLocaleString('en-IN')}</span>
          <span>Budget: {currency}{Math.round(data.safePerDay).toLocaleString('en-IN')}</span>
        </div>
        <div className="h-2 bg-[var(--surface-input)] rounded-full overflow-hidden border border-[var(--border)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.usedPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full transition-colors"
            style={{ background: cfg.color }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-1 text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter">
          <TrendingDown size={10} />
          <span>{data.daysLeft}d left in month</span>
        </div>
        <div className="w-px h-3 bg-[var(--border)]" />
        <div className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter">
          Saving target: {currency}{Math.round(data.savingsTarget).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}
