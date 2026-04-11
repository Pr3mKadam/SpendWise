import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { CategorySpend, MonthlyStats } from '../types';
import { CATEGORY_ICONS } from '../data/mockData';

interface MetricCardsProps {
  currentBalance:      number;
  predictedEndOfMonth: number;
  topCategory:         CategorySpend | null;
  monthlyStats:        MonthlyStats;
  currency?:           string;
}

export default function MetricCards({
  currentBalance,
  predictedEndOfMonth,
  topCategory,
  monthlyStats,
  currency = '$',
}: MetricCardsProps) {
  const displayBalance   = useCountUp(currentBalance, 600);
  const displayPredicted = useCountUp(predictedEndOfMonth, 600);
  const displayIncome    = useCountUp(monthlyStats.totalIncome, 500);
  const displayExpenses  = useCountUp(monthlyStats.totalExpenses, 500);

  const isPositiveTrend = predictedEndOfMonth >= currentBalance;
  const topCatIcon = topCategory
    ? CATEGORY_ICONS[topCategory.name as keyof typeof CATEGORY_ICONS] ?? '💸'
    : '💸';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">

      {/* ── Main Balance Card ── */}
      <div className="md:col-span-2 glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-blue-600/15 transition-all duration-700" />

        <div className="flex items-start justify-between relative z-10 mb-8">
          <div>
            <p className="text-slate-500 font-medium text-xs mb-1.5 uppercase tracking-widest">Total Balance</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight flex items-baseline gap-1 tabular-nums">
              <span className="text-blue-500/70 text-3xl sm:text-4xl font-semibold">{currency}</span>
              {displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center animate-glow-pulse">
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        {/* Dynamic Income / Expense chips */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-[#090e17]/60 rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:border-blue-500/20 transition-colors">
            <div className="h-8 w-8 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
              <ArrowDownRight className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Income</p>
              <p className="text-blue-400 font-bold text-sm tabular-nums">
                +{currency}{displayIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="bg-[#090e17]/60 rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:border-rose-500/20 transition-colors">
            <div className="h-8 w-8 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
              <ArrowUpRight className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Expenses</p>
              <p className="text-rose-400 font-bold text-sm tabular-nums">
                -{currency}{displayExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Projection Card ── */}
      <div className="glass-card p-6 flex flex-col justify-between hoverable relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-all duration-700
          ${isPositiveTrend ? 'bg-blue-500/8 group-hover:bg-blue-500/15' : 'bg-rose-500/8 group-hover:bg-rose-500/15'}
        `} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Projection</h3>
            </div>
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-blue-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
          </div>

          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Predicted end-of-month balance based on your spending velocity:
          </p>

          <div className="mt-2">
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-slate-500 text-lg">{currency}</span>
              <span className={`text-3xl font-bold tracking-tight tabular-nums ${isPositiveTrend ? 'text-blue-400' : 'text-rose-400'}`}>
                {displayPredicted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Savings rate chip */}
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                monthlyStats.savingsRate >= 20 ? 'bg-emerald-500/15 text-emerald-400' :
                monthlyStats.savingsRate >= 0  ? 'bg-amber-500/15 text-amber-400' :
                'bg-rose-500/15 text-rose-400'
              }`}>
                {monthlyStats.savingsRate >= 0 ? '↑' : '↓'} {Math.abs(monthlyStats.savingsRate)}% savings rate
              </span>
            </div>

            {topCategory && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-medium">Top Category</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${topCategory.color}18` }}
                  >
                    {topCatIcon}
                  </div>
                  <span className="text-sm font-semibold text-slate-300">{topCategory.name}</span>
                  <span className="text-sm font-bold text-slate-100 ml-auto tabular-nums">
                    {currency}{Math.round(topCategory.value).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
