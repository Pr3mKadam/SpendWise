import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ReferenceLine, CartesianGrid,
} from 'recharts';
import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, Receipt } from 'lucide-react';
import { MonthlyHistoryPoint, MonthlyStats, CategorySpend } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { TaxPredictor } from '../features/analytics/TaxPredictor';
import { AnomalyDetector } from '../features/analytics/AnomalyDetector';
import { calculateHealthScore } from '../../utils/insights/healthScore';
import { ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsViewProps {
  monthlyHistory:   MonthlyHistoryPoint[];
  monthlyStats:     MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent:       number;
  currency?:        string;
  transactions?:    any[];
}

function ChartTooltip({ active, payload, label, currency = '$' }: { active?: boolean; payload?: any[]; label?: string; currency?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 shadow-lg">
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-8 mb-1">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currency}{Number(p.value).toLocaleString('en-US')}
          </span>
        </div>
      ))}
    </div>
  );
}

function SavingsTooltip({ active, payload, label, currency = '$' }: { active?: boolean; payload?: any[]; label?: string; currency?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="card px-4 py-3 shadow-lg">
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 800, color: val >= 0 ? 'var(--teal)' : 'var(--red)' }}>
        {val >= 0 ? '+' : ''}{currency}{Number(val).toLocaleString('en-US')}
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>Net savings</p>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub: string; color: string; icon: React.ElementType }) {
  return (
    <div className="card px-4 sm:px-5 py-4 transition-shadow hover:shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="truncate pr-2" style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }} className="tabular-nums truncate">{value}</p>
        <p className="truncate" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>
      </div>
    </div>
  );
}

export default function AnalyticsView({ monthlyHistory, monthlyStats, categorySpending, totalSpent, currency = '$', transactions = [] }: AnalyticsViewProps) {
  const { mergedColors, mergedIcons } = useCategories();
  
  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
    }, 5200); // Using default balance as fallback
  }, [transactions]);

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

  return (
    <div className="animate-fade-in-up space-y-6">

      {/* AI Financial Health Index */}
      <div className="card p-0 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center relative z-10">
          {/* Gauge */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80" cy="80" r="70"
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"
              />
              <motion.circle
                initial={{ strokeDasharray: "0 440" }}
                animate={{ strokeDasharray: `${(health.score / 100) * 440} 440` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="80" cy="80" r="70"
                fill="none" stroke={health.color} strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-white leading-none">{health.score}</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">Health Index</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <ShieldCheck className="text-teal-400" size={20} />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">AI Financial Health: {health.grade}</h3>
                <p className="text-gray-400 text-sm">Based on your spending discipline, stability, and savings rate.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(health.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <span>{key}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500/50 transition-all duration-1000" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <Info size={14} className="text-teal-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {health.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-teal-100/90 leading-relaxed font-medium">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-headline">Expenses Comparison</h2>
          <p className="text-caption mt-1">6-month overview · Income, expenses & savings trends</p>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="This Month Income"    value={`${currency}${monthlyStats.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}      sub="Total credits"         color="#14b8a6" icon={TrendingUp} />
        <StatCard label="This Month Spent"     value={`${currency}${monthlyStats.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}    sub="Total debits"          color="#ef4444" icon={Wallet} />
        <StatCard label="Avg Monthly Savings"  value={`${avgSavings >= 0 ? '+' : ''}${currency}${Math.abs(avgSavings).toLocaleString('en-US')}`}            sub="Last 6 months avg"     color={avgSavings >= 0 ? '#14b8a6' : '#ef4444'} icon={PiggyBank} />
        <StatCard label="Best Month"           value={bestMonth ? bestMonth.month : '—'}                                                                    sub={bestMonth ? `${currency}${bestMonth.savings.toLocaleString()} saved` : 'No history yet'} color="#f59e0b" icon={ArrowUpRight} />
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="card px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Comparison</h3>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>6-month income vs expenses</p>
          </div>
          {/* Chart Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#14b8a6' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#e2e8f0' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>Expenses</span>
            </div>
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
                <div key={cat.name} className="flex items-center gap-3 py-2 rounded-xl px-2 -mx-2 hover:bg-gray-50 transition-colors cursor-pointer">
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
                </div>
              ))}

              {/* Total */}
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
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full shrink-0">BETA</span>
        </div>
        <TaxPredictor income={monthlyStats.totalIncome} categorySpending={categorySpending} currency={currency} />
      </div>

      {/* Anomaly Detection */}
      <div className="card px-4 sm:px-6 py-5 mt-6">
        <AnomalyDetector transactions={transactions || []} currency={currency} />
      </div>
    </div>
  );
}
