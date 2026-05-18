import React, { useMemo, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Target,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { AppView, Transaction } from '../../types';
import { FinanceState } from '../../types/state';
import { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { haptic } from '../../lib/haptic';
import { useBudgets } from '../../hooks/useBudgets';
import { useGoals } from '../../hooks/useGoals';

// Lazy-load heavy components so they don't block initial paint
const QuickAddPanel  = lazy(() => import('../features/dashboard/QuickAddPanel'));
const LevelProgress  = lazy(() => import('../features/gamification/LevelProgress'));

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardViewMobileProps {
  financeState:     FinanceState;
  onAdd:            (tx: any) => void;
  currency:         string;
  onNavigate:       (view: AppView) => void;
  hideBalances?:    boolean;
  config:           SpendWiseConfig | null;
}

// ─── Category emoji map (small, fast) ────────────────────────────────────────

const CAT_EMOJI: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Utilities: '⚡',
  Health: '💊', Travel: '✈️', Education: '📚', Business: '💼',
  Subscriptions: '📱', Entertainment: '🎬', Income: '💰',
};

// ─── Snap-row card ────────────────────────────────────────────────────────────

interface SnapCardProps {
  label:   string;
  value:   string;
  sub:     string;
  accent:  string;
  icon:    React.ReactNode;
  onClick: () => void;
}

function SnapCard({ label, value, sub, accent, icon, onClick }: SnapCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-1 min-w-[96px] p-3 rounded-2xl active:scale-[0.96] transition-transform outline-none"
      style={{
        background: 'var(--surface-card)',
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span style={{ color: accent, lineHeight: 1 }}>{icon}</span>
        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-inter)' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
        {sub}
      </p>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardViewMobile({
  financeState, onAdd, currency, onNavigate, hideBalances = false, config,
}: DashboardViewMobileProps) {
  const { transactions, currentBalance, monthlyStats } = financeState;
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Pull data for snap row
  const { overallBudgetPercent, totalBudgeted } = useBudgets();
  const { goals } = useGoals();

  // Savings rate
  const savingsRate = useMemo(() => {
    if (monthlyStats.totalIncome <= 0) return 0;
    return Math.max(0, Math.round(
      ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome) * 100
    ));
  }, [monthlyStats]);

  // Monthly subscription spend
  const subSpend = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return transactions
      .filter(t => t.type === 'debit' && t.category === 'Subscriptions' && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Recent transactions — only last 5
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  // Balance trend direction
  const trendUp = monthlyStats.totalIncome >= monthlyStats.totalExpenses;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="view-enter pb-28" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── 1. Balance hero card ───────────────────────────────────────── */}
      <section style={{ padding: '0 4px' }}>
        <div
          className="rounded-[28px] p-5"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Top row: label + trend */}
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
              Total Balance
            </p>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${trendUp ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              {trendUp
                ? <TrendingUp size={11} style={{ color: '#10b981' }} />
                : <TrendingDown size={11} style={{ color: '#ef4444' }} />
              }
              <span style={{ fontSize: '10px', fontWeight: 700, color: trendUp ? '#10b981' : '#ef4444', fontFamily: 'var(--font-inter)' }}>
                {trendUp ? 'On track' : 'Over spend'}
              </span>
            </div>
          </div>

          {/* Balance numeral */}
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-manrope)',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            {hideBalances
              ? <span style={{ letterSpacing: '4px' }}>••••••</span>
              : `${currency}${currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            }
          </h2>

          {/* Income / Spent chips */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-3"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={11} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-inter)' }}>Income</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: hideBalances ? 'var(--text-muted)' : '#10b981', fontFamily: 'var(--font-manrope)' }}>
                {hideBalances ? '•••' : `${currency}${monthlyStats.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </p>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={11} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-inter)' }}>Spent</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: hideBalances ? 'var(--text-muted)' : '#ef4444', fontFamily: 'var(--font-manrope)' }}>
                {hideBalances ? '•••' : `${currency}${monthlyStats.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── 2. Horizontal snap row ─────────────────────────────────────── */}
      {/* 4 mini stat cards — each taps to the relevant view */}
      <section style={{ padding: '0 4px' }}>
        <div
          className="no-scrollbar"
          style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
        >
          <SnapCard
            label="Budget"
            value={`${Math.round(overallBudgetPercent)}%`}
            sub={totalBudgeted > 0 ? `of ${currency}${totalBudgeted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'not set'}
            accent="#f59e0b"
            icon={<Target size={12} />}
            onClick={() => { haptic.light(); onNavigate('budget'); }}
          />
          <SnapCard
            label="Goals"
            value={String(goals.length)}
            sub={goals.length === 1 ? 'active goal' : 'active goals'}
            accent="#8b5cf6"
            icon={<Sparkles size={12} />}
            onClick={() => { haptic.light(); onNavigate('goals'); }}
          />
          <SnapCard
            label="Savings"
            value={`${savingsRate}%`}
            sub="rate this month"
            accent={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444'}
            icon={<TrendingUp size={12} />}
            onClick={() => { haptic.light(); onNavigate('analytics'); }}
          />
          <SnapCard
            label="Subs"
            value={subSpend > 0 ? `${currency}${subSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
            sub="this month"
            accent="#06b6d4"
            icon={<RefreshCw size={12} />}
            onClick={() => { haptic.light(); onNavigate('subscriptions'); }}
          />
        </div>
      </section>


      {/* ── 3. Recent Transactions ─────────────────────────────────────── */}
      <section style={{ padding: '0 4px' }}>
        <div
          className="rounded-[24px]"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}>
              Recent
            </h3>
            <button
              onClick={() => { haptic.light(); onNavigate('history'); }}
              className="flex items-center gap-0.5 active:opacity-70"
              style={{ color: 'var(--teal)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-inter)' }}
            >
              See all <ChevronRight size={14} />
            </button>
          </div>

          {/* Transaction rows */}
          <div style={{ paddingBottom: '12px' }}>
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-glow)' }}
                >
                  <Plus size={24} style={{ color: 'var(--teal)' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-manrope)' }}>
                  No transactions yet
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
                  Tap + to record your first one
                </p>
              </div>
            ) : (
              recentTransactions.map((tx: Transaction, idx: number) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-5 py-3 active:bg-[var(--surface-hover)] transition-colors"
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border)' }}
                >
                  {/* Category emoji badge */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'var(--surface-input)' }}
                  >
                    {CAT_EMOJI[tx.category] ?? (tx.type === 'credit' ? '💰' : '💸')}
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.merchant}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
                      {tx.category} · {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Amount */}
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-manrope)',
                    color: tx.type === 'debit' ? '#ef4444' : '#10b981',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>


      {/* ── 4. Gamification progress (lazy) ───────────────────────────── */}
      <section style={{ padding: '0 4px' }}>
        <Suspense fallback={
          <div className="h-20 rounded-3xl animate-pulse" style={{ background: 'var(--surface-input)' }} />
        }>
          <LevelProgress onNavigate={onNavigate} />
        </Suspense>
      </section>


      {/* ── 5. Quick Add bottom sheet ──────────────────────────────────── */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-black/60"
              style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative rounded-t-[36px] p-6 overflow-y-auto"
              style={{
                background: 'var(--surface-card)',
                borderTop: '1px solid var(--border)',
                maxHeight: 'min(85vh, 85dvh)',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
              }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1.5 rounded-full mx-auto mb-6" style={{ background: 'var(--border)' }} />

              <Suspense fallback={
                <div className="h-48 animate-pulse rounded-3xl" style={{ background: 'var(--surface-input)' }} />
              }>
                <QuickAddPanel
                  onAdd={(tx) => { onAdd(tx); setIsAddOpen(false); haptic.success(); }}
                  transactions={transactions}
                  recentMerchants={[]}
                  dashboardInput=""
                  setDashboardInput={() => {}}
                />
              </Suspense>

              <button
                onClick={() => setIsAddOpen(false)}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
