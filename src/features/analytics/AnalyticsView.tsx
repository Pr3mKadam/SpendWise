import { useMemo } from 'react';
import { FINANCE_DEFAULTS } from '@/constants';
import EmptyState from '@/components/ui/EmptyState';

import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, Receipt } from 'lucide-react';
import { MonthlyHistoryPoint, MonthlyStats, CategorySpend, Transaction, AppView } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { TaxPredictor } from '@/features/analytics/components/TaxPredictor';
import { AnomalyDetector } from '@/features/analytics/components/AnomalyDetector';
import { SpendingForecast } from '@/features/analytics/components/SpendingForecast';
import { calculateHealthScore } from '@/features/analytics/insights/healthScore';
import { PeerComparison } from '@/features/analytics/components/PeerComparison';
import { CashFlowWaterfall } from '@/features/analytics/components/CashFlowWaterfall';
import { HealthScoreChart } from '@/features/analytics/components/HealthScoreChart';
import CreditHealthView from '@/features/analytics/components/CreditHealthView';
import SpendingDonut from '@/features/analytics/components/SpendingDonut';
import BalanceChart from '@/features/analytics/components/BalanceChart';
import SpendingHeatmap from '@/features/analytics/components/SpendingHeatmap';

import { CategoryAnalyzer } from '@/features/analytics/components/CategoryAnalyzer';
import { StatCard } from '@/features/analytics/components/AnalyticsPrimitives';
import { TopMerchants } from '@/features/analytics/components/TopMerchants';
import { HealthIndexCard } from '@/features/analytics/components/HealthIndexCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AnalyticsViewMobile from '@/features/analytics/AnalyticsViewMobile';
import { IncomeExpensesChart } from '@/features/analytics/components/IncomeExpensesChart';
import { SavingsTrendChart } from '@/features/analytics/components/SavingsTrendChart';
import { CategoryBreakdownList } from '@/features/analytics/components/CategoryBreakdownList';

interface AnalyticsViewProps {
  monthlyHistory: MonthlyHistoryPoint[];
  monthlyStats: MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency?: string;
  transactions?: Transaction[];
  onNavigate?: (view: AppView, category?: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
}

export default function AnalyticsView({
  monthlyHistory,
  monthlyStats,
  categorySpending,
  totalSpent,
  currency = '$',
  transactions = [],
  onNavigate,
  config,
}: AnalyticsViewProps) {
  const isMobile = useIsMobile();
  const isStudent = config?.userRole === 'student';
  const isBusiness = config?.userRole === 'business';
  const financeState = useTransactions();
  const balanceData = financeState.balanceTrend ?? [];

  const currentBalance = useMemo(
    () =>
      transactions.reduce(
        (acc: number, tx: Transaction) =>
          tx.type === 'credit' ? acc + tx.amount : acc - tx.amount,
        FINANCE_DEFAULTS.INITIAL_BALANCE
      ),
    [transactions]
  );

  const health = useMemo(
    () => calculateHealthScore(transactions, monthlyStats, categorySpending, currentBalance),
    [transactions, monthlyStats, categorySpending, currentBalance]
  );

  const latestMonth = monthlyHistory.length > 0 ? monthlyHistory[monthlyHistory.length - 1] : null;
  const avgSavings =
    monthlyHistory.length > 0
      ? Math.round(monthlyHistory.reduce((a, m) => a + m.savings, 0) / monthlyHistory.length)
      : 0;
  const bestMonth =
    monthlyHistory.length > 0 ? [...monthlyHistory].sort((a, b) => b.savings - a.savings)[0] : null;

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No analytics yet"
        subtitle="Record your first transaction to unlock deep AI insights"
        onAction={() => onNavigate?.('transactions' as AppView)}
      />
    );
  }

  if (isMobile) {
    return (
      <AnalyticsViewMobile
        monthlyStats={monthlyStats}
        categorySpending={categorySpending}
        totalSpent={totalSpent}
        currency={currency}
        transactions={transactions}
      />
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* AI Financial Health Index */}
      <HealthIndexCard health={health} />

      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-headline">
            {isBusiness ? 'Cash Flow Analysis' : 'Expenses Comparison'}
          </h2>
          <p className="text-caption mt-1">
            {isStudent
              ? 'Monthly burn rate & study fund trends'
              : isBusiness
                ? 'Operating expenses & revenue flow'
                : '6-month overview · Income, expenses & savings trends'}
          </p>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={isBusiness ? 'Revenue' : isStudent ? 'Allowance/Income' : 'This Month Income'}
          value={`${currency}${monthlyStats.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub={isBusiness ? 'Gross earnings' : 'Total credits'}
          color="#14b8a6"
          icon={TrendingUp}
        />
        <StatCard
          label={isBusiness ? 'OpEx' : isStudent ? 'Burn Rate' : 'This Month Spent'}
          value={`${currency}${monthlyStats.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub={isBusiness ? 'Operating expenses' : 'Total debits'}
          color="#ef4444"
          icon={Wallet}
        />
        <StatCard
          label={isBusiness ? 'Net Profit' : 'Avg Monthly Savings'}
          value={`${avgSavings >= 0 ? '+' : ''}${currency}${Math.abs(avgSavings).toLocaleString('en-US')}`}
          sub="Last 6 months avg"
          color={avgSavings >= 0 ? '#14b8a6' : '#ef4444'}
          icon={PiggyBank}
        />
        <StatCard
          label={isBusiness ? 'Peak Revenue' : 'Best Month'}
          value={bestMonth ? bestMonth.month : '—'}
          sub={
            bestMonth
              ? `${currency}${bestMonth.savings.toLocaleString()} ${isBusiness ? 'profit' : 'saved'}`
              : 'No history yet'
          }
          color="#f59e0b"
          icon={ArrowUpRight}
        />
      </div>

      {/* Income vs Expenses Bar Chart */}
      <IncomeExpensesChart monthlyHistory={monthlyHistory} currency={currency} />

      {/* Two column: Savings trend + Category breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Net Savings Line */}
        <SavingsTrendChart
          monthlyHistory={monthlyHistory}
          currency={currency}
          latestMonth={latestMonth}
        />

        {/* Category Breakdown */}
        <CategoryBreakdownList
          categorySpending={categorySpending}
          totalSpent={totalSpent}
          currency={currency}
          onNavigate={onNavigate}
        />
      </div>

      {/* Category Intelligence */}
      <CategoryAnalyzer
        categorySpending={categorySpending}
        transactions={transactions}
        currency={currency}
        userRole={config?.userRole}
      />

      {/* Spending Donut + Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
        {balanceData.length > 0 && <BalanceChart data={balanceData} currency={currency} />}
      </div>

      {/* Spending Heatmap */}
      {transactions.length > 0 && (
        <SpendingHeatmap transactions={transactions} currency={currency} />
      )}

      {/* Top Merchants */}
      {transactions.length > 0 && <TopMerchants transactions={transactions} currency={currency} />}

      {/* Tax Liability Predictor */}
      <div className="card px-4 sm:px-6 py-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Receipt size={18} className="text-amber-500" />
          </div>
          <div className="min-w-0">
            <h3
              className="truncate"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Tax Liability Estimator
            </h3>
            <p
              className="truncate hidden sm:block"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              Simplified estimate based on your income and spending
            </p>
          </div>
          <span className="ml-auto text-[length:var(--fs-overline)] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full shrink-0">
            BETA
          </span>
        </div>
        <TaxPredictor
          income={monthlyStats.totalIncome}
          categorySpending={categorySpending}
          currency={currency}
        />
        {onNavigate && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <button
              onClick={() => onNavigate('taxreport' as AppView)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl cursor-pointer font-bold text-sm hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              <Receipt size={16} />
              View Full ITR Report
            </button>
          </div>
        )}
      </div>

      {/* Anomaly Detection */}
      <div className="card px-4 sm:px-6 py-5 mt-6">
        <AnomalyDetector transactions={transactions || []} currency={currency} />
      </div>

      {/* Spending Forecast */}
      <div className="card px-4 sm:px-6 py-5 mt-6">
        <SpendingForecast transactions={transactions || []} currency={currency} />
      </div>

      {/* Peer Comparison */}
      <div className="mt-6">
        <PeerComparison categorySpending={categorySpending} currency={currency} />
      </div>

      {/* Cash Flow Waterfall */}
      <div className="mt-6">
        <CashFlowWaterfall
          totalIncome={monthlyStats.totalIncome}
          totalExpenses={monthlyStats.totalExpenses}
          currency={currency}
        />
      </div>

      {/* Financial Health Score History */}
      <div className="mt-6">
        <HealthScoreChart currentScore={health.score} />
      </div>

      {/* Credit Health */}
      <div className="mt-6">
        <CreditHealthView />
      </div>
    </div>
  );
}
