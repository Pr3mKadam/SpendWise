import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { BarChart2, TrendingUp, Wallet, PiggyBank, ArrowUpRight } from 'lucide-react';
import { MonthlyHistoryPoint, MonthlyStats, CategorySpend } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../data/mockData';

interface AnalyticsViewProps {
  monthlyHistory:   MonthlyHistoryPoint[];
  monthlyStats:     MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent:       number;
}

// ── Custom tooltip for bar chart ────────────────────────────────────────────────

function BarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/98 px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-bold text-slate-400">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="text-sm font-bold text-white">
            ${p.value.toLocaleString('en-US')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Custom tooltip for savings line ────────────────────────────────────────────

function SavingsTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/98 px-4 py-3 shadow-2xl">
      <p className="mb-1 text-xs font-semibold text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {val >= 0 ? '+' : ''}${val.toLocaleString('en-US')}
      </p>
      <p className="text-[10px] text-slate-500">Net savings</p>
    </div>
  );
}

// ── Stat mini-card ──────────────────────────────────────────────────────────────

function MiniStat({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub:   string;
  color: string;
  icon:  React.ElementType;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg`} style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function AnalyticsView({
  monthlyHistory,
  monthlyStats,
  categorySpending,
  totalSpent,
}: AnalyticsViewProps) {
  const latestMonth   = monthlyHistory[monthlyHistory.length - 1];
  const avgSavings    = monthlyHistory.length > 0
    ? Math.round(monthlyHistory.reduce((a, m) => a + m.savings, 0) / monthlyHistory.length)
    : 0;
  const bestMonth     = [...monthlyHistory].sort((a, b) => b.savings - a.savings)[0];

  return (
    <div className="animate-fade-in-up space-y-5">

      {/* ── Page Header ── */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <BarChart2 className="h-5 w-5 text-emerald-400" />
          Analytics
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          6-month overview · Income, expenses & savings trends
        </p>
      </div>

      {/* ── Summary mini-stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          label="This Month Income"
          value={`$${monthlyStats.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub="Total credits received"
          color="#10b981"
          icon={TrendingUp}
        />
        <MiniStat
          label="This Month Spent"
          value={`$${monthlyStats.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub="Total debits recorded"
          color="#ef4444"
          icon={Wallet}
        />
        <MiniStat
          label="Avg Monthly Savings"
          value={`${avgSavings >= 0 ? '+' : ''}$${Math.abs(avgSavings).toLocaleString('en-US')}`}
          sub="Last 6 months average"
          color={avgSavings >= 0 ? '#10b981' : '#ef4444'}
          icon={PiggyBank}
        />
        <MiniStat
          label="Best Month"
          value={bestMonth ? bestMonth.month : '—'}
          sub={bestMonth ? `$${bestMonth.savings.toLocaleString('en-US')} saved` : 'No data'}
          color="#f59e0b"
          icon={ArrowUpRight}
        />
      </div>

      {/* ── Income vs Expenses Bar Chart ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-bold text-white">Income vs Expenses</h3>
          <p className="mt-0.5 text-xs text-slate-500">6-month comparison · Current month uses live data</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyHistory} barGap={6} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
                width={48}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{value}</span>
                )}
              />
              <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} fillOpacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Net Savings Trend Line ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Net Savings Trend</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Monthly surplus or deficit after all expenses
            </p>
          </div>
          {latestMonth && (
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                This Month
              </p>
              <p className={`text-lg font-bold ${latestMonth.savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {latestMonth.savings >= 0 ? '+' : ''}${latestMonth.savings.toLocaleString('en-US')}
              </p>
            </div>
          )}
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v >= 0 ? '' : '-'}${Math.abs(v / 1000).toFixed(1)}k`}
                width={52}
              />
              <Tooltip content={<SavingsTooltip />} />
              <ReferenceLine y={0} stroke="rgba(71,85,105,0.6)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#022c22', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Category Breakdown Table ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Category Breakdown</h3>
          <span className="rounded-full bg-slate-800/60 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
            All time
          </span>
        </div>

        {categorySpending.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-600">No spending data recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categorySpending.map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-800/40"
              >
                {/* Rank */}
                <span className="w-5 text-center text-[11px] font-bold text-slate-600">
                  #{i + 1}
                </span>

                {/* Icon */}
                <span className="text-base">
                  {CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}
                </span>

                {/* Name + bar */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-200">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-slate-500">
                        {cat.percent}%
                      </span>
                      <span className="text-sm font-bold text-slate-200">
                        ${cat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width:           `${cat.percent ?? 0}%`,
                        backgroundColor: CATEGORY_COLORS[cat.name as keyof typeof CATEGORY_COLORS],
                        opacity:         0.85,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-800/30 px-3 py-2.5">
              <span className="text-sm font-bold text-slate-300">Total Spending</span>
              <span className="text-sm font-bold text-white">
                ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
