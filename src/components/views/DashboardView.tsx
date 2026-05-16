import { useMemo, useState, lazy, Suspense } from 'react';
import { AppView, Category } from '../../types';
import { FinanceState } from '../../types/state';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../hooks/useTransactions';
import { useGamification } from '../../hooks/useGamification';
import { useGoals } from '../../hooks/useGoals';
import { usePortfolio } from '../../hooks/usePortfolio';
import LevelProgress from '../features/gamification/LevelProgress';
import DashboardHero from '../features/dashboard/DashboardHero';
import MagicInput from '../features/ai/MagicInput';
import PullToRefresh from '../common/PullToRefresh';
import { haptic } from '../../lib/haptic';
import StatCard from '../features/dashboard/StatCard';
import { Sparkles, TrendingUp, TrendingDown, Wallet, BrainCircuit, Target, ChevronDown, ChevronUp } from 'lucide-react';

import FinanceChart from '../features/dashboard/FinanceChart';
import RecentTransactions from '../features/dashboard/RecentTransactions';
import GoalsSummary from '../features/dashboard/GoalsSummary';
import DailyStats from '../features/dashboard/DailyStats';
import { SafeToSpend } from '../features/dashboard/SafeToSpend';
import { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { useIsMobile } from '../../hooks/useMediaQuery';
import DashboardViewMobile from './DashboardViewMobile';

// Lazy load non-critical/heavy components
const FinanceChartLazy = lazy(() => import('../features/dashboard/FinanceChart'));
const WealthCity = lazy(() => import('../features/gamification/WealthCity'));
const QuestsPanel = lazy(() => import('../features/gamification/QuestsPanel').then(m => ({ default: m.QuestsPanel })));
const SavingsChallenges = lazy(() => import('../features/gamification/SavingsChallenges').then(m => ({ default: m.SavingsChallenges })));
const RoundUpVault = lazy(() => import('../features/gamification/RoundUpVault').then(m => ({ default: m.RoundUpVault })));
const SocialLeaderboard = lazy(() => import('../features/gamification/SocialLeaderboard').then(m => ({ default: m.SocialLeaderboard })));
const PredictiveForecasting = lazy(() => import('../features/analytics/PredictiveForecasting').then(m => ({ default: m.PredictiveForecasting })));
const StreakShareCard = lazy(() => import('../features/gamification/StreakShareCard').then(m => ({ default: m.StreakShareCard })));
const WeeklyDigestCard = lazy(() => import('../features/dashboard/WeeklyDigestCard').then(m => ({ default: m.WeeklyDigestCard })));
const QuickAddPanel = lazy(() => import('../features/dashboard/QuickAddPanel'));
const PremiumCard = lazy(() => import('../features/dashboard/PremiumCard'));

const WidgetSkeleton = () => <div className="w-full h-32 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />;


// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardView({
  financeState,
  onAdd,
  currency,
  onNavigate,
  hideBalances = false,
  onTogglePrivacy,
  config,
}: {
  financeState: FinanceState;
  onAdd: Parameters<typeof MagicInput>[0]['onAdd'];
  onOpenAdd: () => void;
  currency: string;
  onNavigate: (view: AppView) => void;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
  config: SpendWiseConfig | null;
}) {
  const [showAllWidgets, setShowAllWidgets] = useState(false);
  const isMobile = useIsMobile();
  
  const { transactions, currentBalance, monthlyStats, monthlyHistory, dailySpendRate, balanceTrend, predictedEndOfMonth } = financeState;
  const { streak, healthScore, level, levelName, savingsRate } = useGamification(transactions);
  const { goals } = useGoals();
  const { netWorth } = usePortfolio();
  const [dashboardInput, setDashboardInput] = useState('');

  const handleRefresh = async () => {
    haptic.medium();
    await new Promise(resolve => setTimeout(resolve, 1500));
    haptic.success();
  };

  const chartData = useMemo(() => {
    return monthlyHistory.slice(-6).map(m => ({
      month: m.month.length === 7
        ? new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' })
        : m.month,
      Income: Math.round(m.income),
      Expenses: Math.round(m.expenses),
    }));
  }, [monthlyHistory]);

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

  const trendPct = useMemo(() => {
    if (!balanceTrend || balanceTrend.length < 2) return 0;
    const first = balanceTrend[0].balance;
    const last = balanceTrend[balanceTrend.length - 1].balance;
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }, [balanceTrend]);

  const insights = useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const thisMonthTx = transactions.filter(t => t.date.startsWith(thisMonthStr) && t.type === 'debit');
    const prevMonthTx = transactions.filter(t => t.date.startsWith(prevMonthStr) && t.type === 'debit');

    const catSpend: Record<string, number> = {};
    thisMonthTx.forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount; });
    const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

    const prevCatSpend: Record<string, number> = {};
    prevMonthTx.forEach(t => { prevCatSpend[t.category] = (prevCatSpend[t.category] || 0) + t.amount; });

    const topCatChange = topCat && prevCatSpend[topCat[0]]
      ? ((topCat[1] - prevCatSpend[topCat[0]]) / prevCatSpend[topCat[0]]) * 100
      : null;

    const savingsRateValue = monthlyStats.totalIncome > 0
      ? Math.round(((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome) * 100)
      : 0;

    return { topCat, topCatChange, savingsRate: savingsRateValue };
  }, [transactions, monthlyStats]);

  if (isMobile) {
    return (
      <DashboardViewMobile 
        financeState={financeState}
        onAdd={onAdd}
        currency={currency}
        onNavigate={onNavigate}
        hideBalances={hideBalances}
        config={config}
      />
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen pb-20 md:pb-6">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Header - Simplified on Mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.04em' }}>
                Hey, {config?.name || 'there'}!
              </h1>
              {!isMobile && (
                <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                  {config?.userRole === 'student' && "Keep building those healthy spending habits! 🎓"}
                  {config?.userRole === 'business' && "Optimize your cash flow today. 🏢"}
                  {config?.userRole === 'professional' && "Your financial control center is ready. 💼"}
                  {!config?.userRole && "Welcome back to your financial control center."}
                </p>
              )}
            </div>
            
            {streak > 0 && (
              <div className="inline-flex items-center self-start sm:self-auto gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">🔥 {streak} DAY STREAK</span>
              </div>
            )}
          </div>

          {/* AI Insights - Hidden on mobile unless expanded to save space */}
          {(!isMobile || showAllWidgets) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
          )}

          {/* Core Dashboard Hero */}
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

          <div className="dashboard-cols flex flex-col lg:flex-row gap-4 lg:gap-6 items-start w-full">
            {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 min-w-0 w-full lg:flex-1">
              
              {/* Level Progress */}
              {(!isMobile || showAllWidgets) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {config?.userRole !== 'student' && (
                    <div className="hidden lg:block lg:col-span-7">
                      <Suspense fallback={<WidgetSkeleton />}>
                        <WealthCity />
                      </Suspense>
                    </div>
                  )}
                  <div className={config?.userRole === 'student' ? "col-span-full" : "col-span-full lg:col-span-5"}>
                    <LevelProgress onNavigate={onNavigate} />
                  </div>
                </div>
              )}

              {/* Stat Cards - Hidden on Mobile because DashboardHeroMobile already shows this data! */}
              {!isMobile && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
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
              )}

              {/* Weekly Digest - Desktop or Expanded Mobile */}
              {(!isMobile || showAllWidgets) && (
                <Suspense fallback={<WidgetSkeleton />}>
                  <WeeklyDigestCard transactions={transactions} currency={currency} />
                </Suspense>
              )}

              {/* Quick Add Panel - Very important, keep prominent */}
              <div className="w-full">
                <Suspense fallback={<WidgetSkeleton />}>
                  <QuickAddPanel
                    onAdd={onAdd}
                    recentMerchants={recentMerchants}
                    onQuickInput={(val) => setDashboardInput(val)}
                    dashboardInput={dashboardInput}
                    setDashboardInput={setDashboardInput}
                    transactions={transactions}
                  />
                </Suspense>
              </div>

              {/* Recent Transactions - Keep prominent */}
              <RecentTransactions recentTx={recentTx} onNavigate={onNavigate} hideBalances={hideBalances} currency={currency} />

              {/* Mobile "Show More" Button */}
              {isMobile && (
                <button 
                  onClick={() => setShowAllWidgets(!showAllWidgets)}
                  className="w-full py-4 mt-2 rounded-2xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  {showAllWidgets ? (
                    <>Hide extra widgets <ChevronUp size={16} /></>
                  ) : (
                    <>Show all widgets & stats <ChevronDown size={16} /></>
                  )}
                </button>
              )}

              {/* Expanded Mobile / Standard Desktop Widgets */}
              {(!isMobile || showAllWidgets) && (
                <div className="flex flex-col gap-4">
                  <Suspense fallback={<WidgetSkeleton />}>
                    <FinanceChartLazy chartData={chartData} currency={currency} />
                  </Suspense>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SafeToSpend transactions={transactions} currency={currency} currentBalance={currentBalance} />
                    <Suspense fallback={<WidgetSkeleton />}>
                      <RoundUpVault transactions={transactions} currency={currency} />
                    </Suspense>
                  </div>

                  <Suspense fallback={<WidgetSkeleton />}>
                    <PredictiveForecasting transactions={transactions} currency={currency} currentBalance={currentBalance} />
                  </Suspense>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-3 w-full lg:w-[300px] lg:shrink-0">
              
              {/* Essential right-column items always shown */}
              {config?.userRole !== 'student' && !isMobile && (
                <Suspense fallback={<WidgetSkeleton />}>
                  <PremiumCard currentBalance={currentBalance} currency={currency} />
                </Suspense>
              )}
              
              <GoalsSummary goals={goals} onNavigate={onNavigate} />

              {/* Hide the rest of the right column on mobile unless expanded */}
              {(!isMobile || showAllWidgets) && (
                <>
                  <Suspense fallback={<WidgetSkeleton />}>
                    <QuestsPanel transactions={transactions} />
                  </Suspense>
                  <Suspense fallback={<WidgetSkeleton />}>
                    <SocialLeaderboard />
                  </Suspense>
                  {config?.userRole === 'student' && (
                    <div 
                      onClick={() => onNavigate('education')}
                      className="card p-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white cursor-pointer hover:scale-[1.02] transition-transform shadow-xl shadow-indigo-500/20"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <Sparkles size={20} />
                        </div>
                        <h3 className="font-bold text-sm">Learning Center</h3>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Master your money with our byte-sized finance lessons. Complete tasks to earn XP!
                      </p>
                    </div>
                  )}
                  <Suspense fallback={<WidgetSkeleton />}>
                    <SavingsChallenges onNavigate={onNavigate} />
                  </Suspense>
                  <DailyStats currency={currency} dailySpendRate={dailySpendRate} streak={streak} transactionCount={transactions.length} />
                  <Suspense fallback={<WidgetSkeleton />}>
                    <StreakShareCard
                      streak={streak}
                      level={level}
                      levelName={levelName}
                      savingsRate={savingsRate ?? 0}
                      currency={currency}
                    />
                  </Suspense>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}
