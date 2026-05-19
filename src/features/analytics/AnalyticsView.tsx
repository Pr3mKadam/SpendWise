import { useMemo } from 'react';
import { FINANCE_DEFAULTS } from '@/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ReferenceLine, CartesianGrid,
} from 'recharts';
import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, Receipt } from 'lucide-react';
import { MonthlyHistoryPoint, MonthlyStats, CategorySpend, Transaction, AppView } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { TaxPredictor } from '@/features/analytics/components/TaxPredictor';
import { AnomalyDetector } from '@/features/analytics/components/AnomalyDetector';
import { SpendingForecast } from '@/features/analytics/components/SpendingForecast';
import { calculateHealthScore } from '@/insights/healthScore';
import { PeerComparison } from '@/features/analytics/components/PeerComparison';
import { CashFlowWaterfall } from '@/features/analytics/components/CashFlowWaterfall';
import { HealthScoreChart } from '@/features/analytics/components/HealthScoreChart';
import SpendingDonut from '@/features/analytics/components/SpendingDonut';
import BalanceChart from '@/features/analytics/components/BalanceChart';
import SpendingHeatmap from '@/features/analytics/components/SpendingHeatmap';
import { haptic } from '@/lib/haptic';
import { CategoryAnalyzer } from '@/features/analytics/components/CategoryAnalyzer';
import { ChartTooltip, SavingsTooltip, StatCard } from '@/features/analytics/components/AnalyticsPrimitives';
import { TopMerchants } from '@/features/analytics/components/TopMerchants';
import { HealthIndexCard } from '@/features/analytics/components/HealthIndexCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AnalyticsViewMobile from '@/features/analytics/AnalyticsViewMobile';

interface AnalyticsViewProps {
  monthlyHistory:   MonthlyHistoryPoint[];
  monthlyStats:     MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent:       number;
  currency?:        string;
  transactions?:    Transaction[];
  onNavigate?:      (view: AppView, category?: string) => void;
  config?:          any;
}

export default function AnalyticsView({
  monthlyHistory, monthlyStats, categorySpending, totalSpent,
  currency = '$', transactions = [], onNavigate, config,
}: AnalyticsViewProps) {
  const isMobile = useIsMobile();
  const isStudent  = config?.userRole === 'student';
  const isBusiness = config?.userRole === 'business';
  const { mergedColors, mergedIcons } = useCategories();
  const financeState  = useTransactions();
  const balanceData   = financeState.balanceTrend ?? [];

  const currentBalance = useMemo(() =>
    transactions.reduce((acc: number, tx: Transaction) =>
      tx.type === 'credit' ? acc + tx.amount : acc - tx.amount,
      FINANCE_DEFAULTS.INITIAL_BALANCE),
    [transactions]
  );

  const health = useMemo(() =>
    calculateHealthScore(transactions, monthlyStats, categorySpending, currentBalance),
    [transactions, monthlyStats, categorySpending, currentBalance]
  );

  const latestMonth = monthlyHistory.length > 0 ? monthlyHistory[monthlyHistory.length - 1] : null;
  const avgSavings  = monthlyHistory.length > 0
    ? Math.round(monthlyHistory.reduce((a, m) => a + m.savings, 0) / monthlyHistory.length) : 0;
  const bestMonth   = monthlyHistory.length > 0
    ? [...monthlyHistory].sort((a, b) => b.savings - a.savings)[0] : null;

  const axisStyle = { fontSize: 11, fill: '#a0aec0', fontFamily: 'var(--font-inter)' };

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
          <h2 className="text-headline">{isBusiness ? 'Cash Flow Analysis' : 'Expenses Comparison'}</h2>
          <p className="text-caption mt-1">
            {isStudent ? 'Monthly burn rate & study fund trends' : isBusiness ? 'Operating expenses & revenue flow' : '6-month overview · Income, expenses & savings trends'}
          </p>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label={isBusiness ? 'Revenue' : isStudent ? 'Allowance/Income' : 'This Month Income'}
          value={`${currency}${monthlyStats.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub={isBusiness ? 'Gross earnings' : 'Total credits'} color="#14b8a6" icon={TrendingUp} />
        <StatCard label={isBusiness ? 'OpEx' : isStudent ? 'Burn Rate' : 'This Month Spent'}
          value={`${currency}${monthlyStats.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub={isBusiness ? 'Operating expenses' : 'Total debits'} color="#ef4444" icon={Wallet} />
        <StatCard label={isBusiness ? 'Net Profit' : 'Avg Monthly Savings'}
          value={`${avgSavings >= 0 ? '+' : ''}${currency}${Math.abs(avgSavings).toLocaleString('en-US')}`}
          sub="Last 6 months avg" color={avgSavings >= 0 ? '#14b8a6' : '#ef4444'} icon={PiggyBank} />
        <StatCard label={isBusiness ? 'Peak Revenue' : 'Best Month'}
          value={bestMonth ? bestMonth.month : '—'}
          sub={bestMonth ? `${currency}${bestMonth.savings.toLocaleString()} ${isBusiness ? 'profit' : 'saved'}` : 'No history yet'}
          color="#f59e0b" icon={ArrowUpRight} />
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="card px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Comparison</h3>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>6-month income vs expenses</p>
          </div>
          <div className="flex items-center gap-4">
            {[['#14b8a6', 'Income'], ['#e2e8f0', 'Expenses']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyHistory} barGap={4} barCategoryGap="30%">
              <CartesianGrid stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`} width={44} />
              <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: '#f8fafc' }} />
              <Legend formatter={(value) => <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-inter)', fontWeight: 500 }}>{value}</span>} wrapperStyle={{ paddingTop: '16px' }} />
              <Bar dataKey="income"   name="Income"   fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expenses" name="Expenses" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column: Savings trend + Category breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Net Savings Line */}
        <div className="card px-4 sm:px-6 py-5">
          <div className="flex items-start justify-between mb-5 gap-4">
            <div>
              <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Net Savings Trend</h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Monthly surplus / deficit</p>
            </div>
            {latestMonth && (
              <div className="text-right shrink-0">
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>This Month</p>
                <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 800, color: latestMonth.savings >= 0 ? 'var(--teal)' : 'var(--red)' }} className="tabular-nums">
                  {latestMonth.savings >= 0 ? '+' : ''}{currency}{latestMonth.savings.toLocaleString('en-US')}
                </p>
              </div>
            )}
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyHistory}>
                <CartesianGrid stroke="#f0f2f5" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={v => `${currency}${v >= 0 ? '' : '-'}${Math.abs(v / 1000).toFixed(1)}k`} width={48} />
                <Tooltip content={<SavingsTooltip currency={currency} />} />
                <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="savings" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Expenses Breakdown</h3>
            <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>*Compare to last month</span>
          </div>
          {categorySpending.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--text-muted)' }}>No spending data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categorySpending.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-3 py-2 rounded-xl px-2 -mx-2 hover:bg-[var(--teal-dim)] transition-colors cursor-pointer group"
                  onClick={() => { haptic.light(); onNavigate?.('history', cat.name); }}
                  title={`View all ${cat.name} transactions`}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: `${mergedColors[cat.name] || '#14b8a6'}15` }}>
                    <span className="text-base">{mergedIcons[cat.name] || '📦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
                        {currency}{cat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.percent}%`, background: mergedColors[cat.name] || 'var(--teal)' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>{cat.percent}%</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--teal)] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: '1px solid #f0f2f5' }}>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Spending</span>
                <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }} className="tabular-nums">
                  {currency}{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Intelligence */}
      <CategoryAnalyzer categorySpending={categorySpending} transactions={transactions} currency={currency} userRole={config?.userRole} />

      {/* Spending Donut + Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
        {balanceData.length > 0 && <BalanceChart data={balanceData} currency={currency} />}
      </div>

      {/* Spending Heatmap */}
      {transactions.length > 0 && <SpendingHeatmap transactions={transactions} currency={currency} />}

      {/* Top Merchants */}
      {transactions.length > 0 && <TopMerchants transactions={transactions} currency={currency} />}

      {/* Tax Liability Predictor */}
      <div className="card px-4 sm:px-6 py-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Receipt size={18} className="text-amber-500" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate" style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Tax Liability Estimator</h3>
            <p className="truncate hidden sm:block" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>Simplified estimate based on your income and spending</p>
          </div>
          <span className="ml-auto text-[length:var(--fs-overline)] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full shrink-0">BETA</span>
        </div>
        <TaxPredictor income={monthlyStats.totalIncome} categorySpending={categorySpending} currency={currency} />
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
        <CashFlowWaterfall totalIncome={monthlyStats.totalIncome} totalExpenses={monthlyStats.totalExpenses} currency={currency} />
      </div>

      {/* Financial Health Score History */}
      <div className="mt-6">
        <HealthScoreChart currentScore={health.score} />
      </div>
    </div>
  );
}
