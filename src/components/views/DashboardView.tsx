import { useMemo, useState } from 'react';
import { AppView } from '../../types';
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

import { Sparkles, TrendingUp, TrendingDown, Wallet, BrainCircuit, Target } from 'lucide-react';

import StatCard from '../features/dashboard/StatCard';
import FinanceChart from '../features/dashboard/FinanceChart';
import RecentTransactions from '../features/dashboard/RecentTransactions';
import PremiumCard from '../features/dashboard/PremiumCard';
import GoalsSummary from '../features/dashboard/GoalsSummary';
import DailyStats from '../features/dashboard/DailyStats';
import { BadgeGallery } from '../features/gamification/BadgeGallery';
import { SafeToSpend } from '../features/dashboard/SafeToSpend';
import { RoundUpVault } from '../features/gamification/RoundUpVault';
import { SocialLeaderboard } from '../features/gamification/SocialLeaderboard';
import { PredictiveForecasting } from '../features/analytics/PredictiveForecasting';
import { StreakShareCard } from '../features/gamification/StreakShareCard';
import { WeeklyDigestCard } from '../features/dashboard/WeeklyDigestCard';

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────

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
  const { streak, healthScore, xp, level, xpToNextLevel, progress, levelName, savingsRate } = useGamification(transactions);
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

  // Recent unique merchants for Quick Add shortcuts
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

  // Trend % from balanceTrend array
  const trendPct = useMemo(() => {
    if (!balanceTrend || balanceTrend.length < 2) return 0;
    const first = balanceTrend[0].balance;
    const last = balanceTrend[balanceTrend.length - 1].balance;
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }, [balanceTrend]);

  // Dynamic AI insight cards — computed from real spending data
  const insights = useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthStr = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString().slice(0, 7);

    const thisMonthTx = transactions.filter(t => t.date.startsWith(thisMonthStr) && t.type === 'debit');
    const prevMonthTx = transactions.filter(t => t.date.startsWith(prevMonthStr) && t.type === 'debit');

    // Top spending category this month
    const catSpend: Record<string, number> = {};
    thisMonthTx.forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount; });
    const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

    // Same category last month for comparison
    const prevCatSpend: Record<string, number> = {};
    prevMonthTx.forEach(t => { prevCatSpend[t.category] = (prevCatSpend[t.category] || 0) + t.amount; });

    const topCatChange = topCat && prevCatSpend[topCat[0]]
      ? ((topCat[1] - prevCatSpend[topCat[0]]) / prevCatSpend[topCat[0]]) * 100
      : null;

    // Savings rate this month
    const savingsRate = monthlyStats.totalIncome > 0
      ? Math.round(((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome) * 100)
      : 0;

    // Highest single merchant spend this month
    const merchantSpend: Record<string, number> = {};
    thisMonthTx.forEach(t => { merchantSpend[t.merchant] = (merchantSpend[t.merchant] || 0) + t.amount; });
    const topMerchant = Object.entries(merchantSpend).sort((a, b) => b[1] - a[1])[0];

    return { topCat, topCatChange, savingsRate, topMerchant };
  }, [transactions, monthlyStats]);

  return (
    <div className="bg-[#f4f6fb] -mx-2 -mt-3 sm:-mx-4 sm:-mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 min-h-[calc(100vh-60px)] px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.04em' }}>
              Dashboard
            </h1>
            <p className="text-[11px] sm:text-xs text-[var(--text-muted)] font-medium mt-0.5">Welcome back to your financial control center.</p>
          </div>
        </div>

        {/* Dynamic AI-powered Smart Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Insight 1: Savings Rate */}
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500 mt-0.5">
              <BrainCircuit size={18} />
            </div>
            <div>
              <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] m-0 mb-1">AI Smart Insight</h4>
              <p className="text-[0.75rem] text-[var(--text-muted)] m-0 leading-snug">
                {transactions.length === 0
                  ? 'Add transactions to unlock personalized AI insights.'
                  : insights.savingsRate > 0
                    ? `You're saving ${insights.savingsRate}% of income this month. ${
                        insights.savingsRate >= 20
                          ? 'Great discipline — consider moving savings to a Goal!'
                          : 'Try to hit the 20% savings target for financial health.'
                      }`
                    : `Your expenses exceed income this month. Review your ${insights.topCat?.[0] ?? 'top'} spending to find savings.`
                }
              </p>
            </div>
          </div>

          {/* Insight 2: Category Trend */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500 mt-0.5">
              {insights.topCatChange !== null && insights.topCatChange < 0
                ? <TrendingDown size={18} />
                : <TrendingUp size={18} />
              }
            </div>
            <div>
              <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] m-0 mb-1">Spending Pulse</h4>
              <p className="text-[0.75rem] text-[var(--text-muted)] m-0 leading-snug">
                {insights.topCat
                  ? insights.topCatChange !== null
                    ? `${insights.topCat[0]} is your top expense (${currency}${Math.round(insights.topCat[1]).toLocaleString()}). ${
                        insights.topCatChange < 0
                          ? `Down ${Math.abs(Math.round(insights.topCatChange))}% vs last month — great progress!`
                          : `Up ${Math.round(insights.topCatChange)}% from last month.`
                      }`
                    : `${insights.topCat[0]} is your biggest spend this month at ${currency}${Math.round(insights.topCat[1]).toLocaleString()}.`
                  : 'Add transactions to unlock spending insights.'
                }
              </p>
            </div>
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

        {streak > 0 ? (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">🔥 {streak} DAY STREAK</span>
          </div>
        ) : (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-500/5 to-slate-400/10 border border-slate-400/20 rounded-full">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">✨ Start your streak today — add a transaction!</span>
          </div>
        )}

        {/* Weekly Digest */}
        <div className="mb-4">
          <WeeklyDigestCard transactions={transactions} currency={currency} />
        </div>

        {/* Two-column layout: single column on mobile, side-by-side on lg+ */}
        <div className="dashboard-cols flex flex-col lg:flex-row gap-4 lg:gap-6 items-start w-full">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 min-w-0 w-full lg:flex-1">
            {/* Gamification: WealthCity (hidden on mobile) + LevelProgress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="hidden sm:block lg:col-span-7">
                <WealthCity />
              </div>
              <div className="sm:col-span-full lg:col-span-5">
                <LevelProgress onNavigate={onNavigate} />
              </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
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

            {/* Safe to Spend + Round-Up Vault */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SafeToSpend transactions={transactions} currency={currency} currentBalance={currentBalance} />
              <RoundUpVault transactions={transactions} currency={currency} />
            </div>

            {/* Predictive Month-End Forecast */}
            <PredictiveForecasting transactions={transactions} currency={currency} currentBalance={currentBalance} />

            {/* Quick Add Panel */}
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

            {/* Recent Transactions */}
            <RecentTransactions recentTx={recentTx} onNavigate={onNavigate} hideBalances={hideBalances} currency={currency} />
          </div>

          {/* ── RIGHT COLUMN — fully stacked on mobile, sidebar on lg+ ── */}
          <div className="flex flex-col gap-3 w-full lg:w-[300px] lg:shrink-0">

            {/* Premium My Card */}
            <PremiumCard currentBalance={currentBalance} currency={currency} />

            {/* My Goals */}
            <GoalsSummary goals={goals} onNavigate={onNavigate} />

            {/* AI-Driven Gamification Quests */}
            <QuestsPanel transactions={transactions} />

            {/* Social Leaderboard */}
            <SocialLeaderboard />

            <SavingsChallenges onNavigate={onNavigate} />

            {/* Daily Stats */}
            <DailyStats currency={currency} dailySpendRate={dailySpendRate} streak={streak} transactionCount={transactions.length} />

            {/* Streak Share */}
            <StreakShareCard
              streak={streak}
              level={level}
              levelName={levelName}
              savingsRate={savingsRate ?? 0}
              currency={currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
