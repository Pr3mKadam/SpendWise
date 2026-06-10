import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView } from '@/types';
import { FinanceState } from '@/types/state';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { haptic } from '@/core/haptic';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { getProactiveNudge } from '@/features/analytics/insights/advisor';
import { useGamification } from '@/features/gamification/hooks/useGamification';
import { useStore } from '@/store';

import { MobileBalanceHero } from './components/MobileBalanceHero';
import { SnapCardRow } from './components/SnapCardRow';
import { MobileRecentTransactions } from './components/MobileRecentTransactions';
import { BankSyncCard } from './components/BankSyncCard';

// Lazy-load heavy components so they don't block initial paint
const QuickAddPanel = lazy(() => import('@/features/dashboard/components/QuickAddPanel'));
const LevelProgress = lazy(() => import('@/features/gamification/components/LevelProgress'));

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardViewMobileProps {
  financeState: FinanceState;
  onAdd: (tx: any) => void;
  currency: string;
  onNavigate: (view: AppView) => void;
  hideBalances?: boolean;
  config: SpendWiseConfig | null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardViewMobile({
  financeState,
  onAdd,
  currency,
  onNavigate,
  hideBalances = false,
  config,
}: DashboardViewMobileProps) {
  const { transactions, currentBalance, monthlyStats, monthlyHistory, balanceTrend } = financeState;
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Pull data for snap row
  const { overallBudgetPercent, totalBudgeted, budgetStats } = useBudgets();
  const { goals } = useGoals();
  const { streak } = useGamification(transactions);

  const budgetMap = React.useMemo(() => {
    const map: Record<string, { limit: number; spent: number }> = {};
    budgetStats.forEach(b => {
      map[b.category] = { limit: b.limit, spent: b.spent };
    });
    return map;
  }, [budgetStats]);

  const nudge = React.useMemo(
    () => getProactiveNudge(transactions, budgetMap, goals, streak, currency),
    [transactions, budgetMap, goals, streak, currency]
  );

  const razorpayKeys = useStore(s => s.razorpayKeys);

  const { recentTransactionsMobile, trendUp, savingsRate, subSpend } = useDashboardData(
    transactions,
    monthlyStats,
    monthlyHistory,
    balanceTrend
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="view-enter pb-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* ── 1. Balance hero card ───────────────────────────────────────── */}
      <MobileBalanceHero
        currentBalance={currentBalance}
        currency={currency}
        hideBalances={hideBalances}
        trendUp={trendUp}
        monthlyIncome={monthlyStats.totalIncome}
        monthlyExpenses={monthlyStats.totalExpenses}
      />

      {/* ── 1.5. Proactive Nudge ───────────────────────────────────────── */}
      {nudge && (
        <div
          className={`mx-4 rounded-[20px] p-4 flex items-start gap-3 border ${
            nudge.urgency === 'high'
              ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400'
              : nudge.urgency === 'medium'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
          }`}
        >
          <span className="text-xl mt-0.5">
            {nudge.urgency === 'high' ? '⚠️' : nudge.urgency === 'medium' ? '💡' : '🔥'}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium leading-snug">{nudge.message}</p>
          </div>
          <button
            onClick={() =>
              onNavigate(
                nudge.action.toLowerCase().replace('create_', '').replace('view_', '') as any
              )
            }
            className="text-xs font-bold shrink-0 mt-0.5 hover:underline active:scale-95 transition-transform"
          >
            Fix →
          </button>
        </div>
      )}

      {/* ── 1.75. Bank sync onboarding card ────────────────────────────── */}
      {!razorpayKeys && (
        <div style={{ padding: '0 16px' }}>
          <BankSyncCard onNavigate={onNavigate} />
        </div>
      )}

      {/* ── 2. Horizontal snap row ─────────────────────────────────────── */}
      <SnapCardRow
        overallBudgetPercent={overallBudgetPercent}
        totalBudgeted={totalBudgeted}
        goalsCount={goals.length}
        savingsRate={savingsRate}
        subSpend={subSpend}
        currency={currency}
        onNavigate={onNavigate}
      />

      {/* ── 3. Recent Transactions ─────────────────────────────────────── */}
      <MobileRecentTransactions
        recentTransactions={recentTransactionsMobile}
        onNavigate={onNavigate}
        currency={currency}
      />

      {/* ── 4. Gamification progress (lazy) ───────────────────────────── */}
      <section style={{ padding: '0 4px' }}>
        <Suspense
          fallback={
            <div
              className="h-20 rounded-3xl animate-pulse"
              style={{ background: 'var(--surface-input)' }}
            />
          }
        >
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
              <div
                className="w-10 h-1.5 rounded-full mx-auto mb-6"
                style={{ background: 'var(--border)' }}
              />

              <Suspense
                fallback={
                  <div
                    className="h-48 animate-pulse rounded-3xl"
                    style={{ background: 'var(--surface-input)' }}
                  />
                }
              >
                <QuickAddPanel
                  onAdd={tx => {
                    onAdd(tx);
                    setIsAddOpen(false);
                    haptic.success();
                  }}
                  transactions={transactions}
                  recentMerchants={[]}
                  dashboardInput=""
                  setDashboardInput={() => {}}
                />
              </Suspense>

              <button
                onClick={() => setIsAddOpen(false)}
                className="w-full mt-5 py-4 rounded-2xl font-bold text-sm"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-inter)',
                }}
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
