import { useMemo, useState, memo } from 'react';
import { AppView, Transaction } from '../../types';
import { useFinanceState } from '../../hooks/useFinanceState';
import { useGamification } from '../../hooks/useGamification';
import { useGoals } from '../../hooks/useGoals';
import { usePortfolio } from '../../hooks/usePortfolio';
import LevelProgress from '../features/gamification/LevelProgress';
import WealthCity from '../features/gamification/WealthCity';
import { QuestsPanel } from '../features/gamification/QuestsPanel';
import { SavingsChallenges } from '../features/gamification/SavingsChallenges';
import DashboardHero from '../features/dashboard/DashboardHero';
import QuickAddPanel from '../features/dashboard/QuickAddPanel';
import MagicInput from '../features/ai/MagicInput';

import { Camera, Sparkles, TrendingUp, TrendingDown, Wallet, Calendar, Plus, BrainCircuit, Target, Zap, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';

import Card from '../common/Card';
import StatCard from '../features/dashboard/StatCard';

import FinanceChart from '../features/dashboard/FinanceChart';
import RecentTransactions from '../features/dashboard/RecentTransactions';
import PremiumCard from '../features/dashboard/PremiumCard';
import GoalsSummary from '../features/dashboard/GoalsSummary';
import DailyStats from '../features/dashboard/DailyStats';

// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_BG = '#f4f6fb';
const TEXT_PRIMARY = '#0f1117';
const TEXT_MUTED = '#9197a6';

export function DashboardView({
  financeState,
  onAdd,
  onOpenAdd,
  currency,
  onNavigate,
  hideBalances = false,
  onTogglePrivacy,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onAdd: Parameters<typeof MagicInput>[0]['onAdd'];
  onOpenAdd: () => void;
  currency: string;
  onNavigate: (view: AppView) => void;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}) {
  const { transactions, currentBalance, monthlyStats, monthlyHistory, dailySpendRate, balanceTrend, predictedEndOfMonth } = financeState;
  const { streak, healthScore, xp, level, xpToNextLevel, progress, levelName } = useGamification(transactions);
  const { goals } = useGoals();
  const { netWorth } = usePortfolio();
  const [dashboardInput, setDashboardInput] = useState('');

  // Chart data — last 6 months
  const chartData = useMemo(() => {
    return monthlyHistory.slice(-6).map(m => ({
      month: m.month.length === 7
        ? new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' })
        : m.month,
      Income: Math.round(m.income),
      Expenses: Math.round(m.expenses),
    }));
  }, [monthlyHistory]);

  // Recent unique merchants for "Quick Access" row
  const recentMerchants = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const tx of transactions) {
      if (!seen.has(tx.merchant)) { seen.add(tx.merchant); result.push(tx.merchant); }
      if (result.length >= 4) break;
    }
    return result;
  }, [transactions]);

  const recentTx = useMemo(() => transactions.slice(0, 6), [transactions]);

  const saved = useMemo(() => Math.max(0, monthlyStats.totalIncome - monthlyStats.totalExpenses), [monthlyStats.totalIncome, monthlyStats.totalExpenses]);

  // Trend % from balanceTrend array
  const trendPct = useMemo(() => {
    if (!balanceTrend || balanceTrend.length < 2) return 0;
    const first = balanceTrend[0].balance;
    const last = balanceTrend[balanceTrend.length - 1].balance;
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }, [balanceTrend]);

  return (
    <div className="bg-[#f4f6fb] -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 min-h-[calc(100vh-60px)] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.04em' }}>
              Dashboard
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">Welcome back to your financial control center.</p>
          </div>

        </div>

        {/* Premium Dashboard Hero Section */}
        <div className="mb-6">
          <DashboardHero 
            currentBalance={currentBalance}
            monthlyStats={monthlyStats}
            balanceTrend={balanceTrend}
            healthScore={healthScore}
            currency={currency}
            hideBalances={hideBalances}
            onTogglePrivacy={onTogglePrivacy}
            predictedEndOfMonth={predictedEndOfMonth}
          />
        </div>

        {streak > 0 && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">🔥 {streak} DAY STREAK</span>
          </div>
        )}


        {/* Two-column layout (stacks on mobile and most tablets) */}
        <div className="flex flex-col xl:flex-row gap-5 xl:gap-6 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 min-w-0 w-full xl:flex-1">
            {/* Gamification Level Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <WealthCity />
              </div>
              <div className="lg:col-span-5">
                <LevelProgress onNavigate={onNavigate} />
              </div>
            </div>

            {/* Stat Cards (2x2 on mobile, 3x1 on tablet, 5x1 on xl desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
              <StatCard
                label="Balance"
                value={`${currency}${Math.abs(currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={Wallet}
                iconColor="text-[#6366f1]"
                iconBg="rgba(99,102,241,0.1)"
                trend={trendPct >= 0 ? 'up' : 'down'}
                hideBalances={hideBalances}
              />
              <StatCard
                label="Income"
                value={`${currency}${monthlyStats.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={TrendingUp}
                iconColor="text-[#10b981]"
                iconBg="rgba(16,185,129,0.1)"
                trend="up"
                hideBalances={hideBalances}
              />
              <StatCard
                label="Expenses"
                value={`${currency}${monthlyStats.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={TrendingDown}
                iconColor="text-[#f87171]"
                iconBg="rgba(248,113,113,0.1)"
                trend="down"
                hideBalances={hideBalances}
              />
              <StatCard
                label="Net Worth"
                value={`${currency}${Math.abs(netWorth).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={Target}
                iconColor="text-[#8b5cf6]"
                iconBg="rgba(139,92,246,0.1)"
                trend={netWorth >= 0 ? 'up' : 'down'}
                hideBalances={hideBalances}
              />
              <div className="col-span-2 sm:col-span-1">
                <StatCard
                  label="Health Score"
                  value={`${healthScore}/100`}
                  icon={Sparkles}
                  iconColor="text-[#14b8a6]"
                  iconBg="rgba(20,184,166,0.1)"
                  trend={healthScore > 70 ? 'up' : 'neutral'}
                  hideBalances={false}
                />
              </div>
            </div>

            {/* Finance Chart */}
            <FinanceChart chartData={chartData} currency={currency} />
            {/* ── Quick Add — between chart and history ─────────── */}
            <div className="w-full">
              <QuickAddPanel 
                onAdd={onAdd} 
                recentMerchants={recentMerchants}
                onQuickInput={(val) => setDashboardInput(val)}
                dashboardInput={dashboardInput}
                setDashboardInput={setDashboardInput}
                transactions={transactions}
              />
            </div>



            {/* Transaction History */}
            <RecentTransactions recentTx={recentTx} onNavigate={onNavigate} hideBalances={hideBalances} currency={currency} />          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-row xl:flex-col gap-4 min-w-0 w-full xl:w-[300px] xl:shrink-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mb-4">
            
            {/* Premium My Card */}
            <PremiumCard currentBalance={currentBalance} currency={currency} />
            {/* My Goals */}
            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <GoalsSummary goals={goals} onNavigate={onNavigate} />
            </div>

            {/* AI-Driven Gamification */}
            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <QuestsPanel transactions={transactions} />
            </div>

            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <SavingsChallenges />
            </div>

            {/* Daily Stats */}
            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <DailyStats currency={currency} dailySpendRate={dailySpendRate} streak={streak} transactionCount={transactions.length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
