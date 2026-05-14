import { Shield, RefreshCw, AlertTriangle, Flame, Star, Award } from 'lucide-react';
import { Budget } from '../../../../types';

export function BudgetSummaryBar({
  totalBudgeted, totalSpent, overBudgetCount, currency, periodLabel, rolloverEnabled, budgets,
}: {
  totalBudgeted: number; totalSpent: number; overBudgetCount: number;
  currency: string; periodLabel: string; rolloverEnabled: boolean; budgets: Budget[];
}) {
  const pct    = totalBudgeted > 0 ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100) : 0;
  const isOver = totalSpent > totalBudgeted;
  const totalRollover = rolloverEnabled
    ? budgets.reduce((a, b) => a + b.rolloverAmount, 0)
    : 0;

  // Gamification Milestones
  const hasBudgets = budgets.length > 0;
  const isPerfect = hasBudgets && overBudgetCount === 0;
  const isFrugal = hasBudgets && pct > 0 && pct < 50;
  const isActive = hasBudgets && totalSpent > 0;

  return (
    <div className="card mb-5" style={{ padding: '22px 24px' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--teal)' }} />
          <div>
            <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Budget Overview
            </span>
            <span
              className="ml-2 text-xs font-semibold rounded-full px-2 py-0.5"
              style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)' }}
            >
              {periodLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {totalRollover > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontFamily: 'var(--font-inter)' }}
            >
              <RefreshCw size={11} />{currency}{totalRollover.toFixed(0)} rolled over
            </span>
          )}
          {overBudgetCount > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--red-dim)', color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
            >
              <AlertTriangle size={12} />{overBudgetCount} over limit
            </span>
          )}
        </div>
      </div>

      {/* Gamification Badges */}
      {hasBudgets && (
        <div className="flex gap-2 mb-4 pb-4 overflow-x-auto hide-scrollbar" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isActive ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800'}`}>
            <Flame size={14} className={isActive ? 'text-amber-500' : 'text-gray-400'} />
            <span className="text-xs font-bold whitespace-nowrap">Active Tracker</span>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isPerfect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800'}`}>
            <Star size={14} className={isPerfect ? 'text-emerald-500' : 'text-gray-400'} />
            <span className="text-xs font-bold whitespace-nowrap">Flawless</span>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isFrugal ? 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800'}`}>
            <Award size={14} className={isFrugal ? 'text-purple-500' : 'text-gray-400'} />
            <span className="text-xs font-bold whitespace-nowrap">Frugal Master</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-4">
        {[
          { label: 'Total Budget', value: `${currency}${totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'var(--text-primary)' },
          { label: 'Total Spent',  value: `${currency}${totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,    color: 'var(--text-primary)' },
          { label: 'Utilization',  value: `${pct}%`, color: isOver ? '#ef4444' : 'var(--teal)' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </p>
            <p className="tabular-nums" style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : 'var(--teal)' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{currency}0</span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {currency}{totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}
