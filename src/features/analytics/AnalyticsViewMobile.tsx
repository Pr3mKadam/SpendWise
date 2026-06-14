import React from 'react';
import { Zap, Target, PieChart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { MonthlyStats, CategorySpend, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/core/haptic';

interface AnalyticsViewMobileProps {
  monthlyStats: MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency: string;
  transactions: Transaction[];
}

export default function AnalyticsViewMobile({
  monthlyStats,
  categorySpending,
  totalSpent: _totalSpent,
  currency,
  transactions: _transactions,
}: AnalyticsViewMobileProps) {
  const { mergedColors, mergedIcons } = useCategories();

  // Calculate some quick insights
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthProgress = (dayOfMonth / daysInMonth) * 100;
  const spendingVelocity = (monthlyStats.totalExpenses / dayOfMonth) * daysInMonth;

  return (
    <div className="flex flex-col space-y-6 pb-12">
      {/* Month Progress Card */}
      <div className="bg-[#0f172a] rounded-[2rem] p-6 shadow-xl border border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Calendar size={80} strokeWidth={1} className="text-teal-400" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-teal-400/80">
              Month Progress
            </span>
            <div className="h-[2px] flex-1 bg-[var(--surface-card)]/10 rounded-full">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${monthProgress}%` }}
              />
            </div>
          </div>

          <h3
            className="text-white font-bold text-xl mb-1"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Spending Forecast
          </h3>
          <p className="text-white/50 text-[length:var(--fs-caption)] font-medium leading-relaxed max-w-[200px]">
            Based on current velocity, you'll likely spend {currency}
            {Math.round(spendingVelocity).toLocaleString()} this month.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--surface-card)]/5 rounded-2xl border border-white/5">
              <p className="text-[length:var(--fs-overline)] font-bold text-white/40 uppercase tracking-wider mb-1">
                Income
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white font-bold text-base">
                  {currency}
                  {monthlyStats.totalIncome.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--surface-card)]/5 rounded-2xl border border-white/5">
              <p className="text-[length:var(--fs-overline)] font-bold text-white/40 uppercase tracking-wider mb-1">
                Spent
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-white font-bold text-base">
                  {currency}
                  {monthlyStats.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Section */}
      <div>
        <div className="flex items-center justify-between px-1 mb-4">
          <h3
            className="font-bold text-lg text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Category Breakdown
          </h3>
          <PieChart size={18} className="text-[var(--teal)]" />
        </div>

        <div className="bg-[var(--surface-card)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-sm">
          {categorySpending.length === 0 ? (
            <div className="py-12 text-center">
              <PieChart size={40} className="mx-auto text-[var(--text-muted)] opacity-20 mb-3" />
              <p className="text-[var(--text-muted)] text-xs font-bold">No data for this month</p>
            </div>
          ) : (
            <div className="p-2">
              {categorySpending.slice(0, 6).map((cat, _idx) => (
                <button
                  key={cat.name}
                  onClick={() => haptic.light()}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-[var(--surface-input)] transition-colors border-none text-left bg-transparent"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm shrink-0"
                    style={{ background: `${mergedColors[cat.name] || '#14b8a6'}15` }}
                  >
                    {mergedIcons[cat.name] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-bold text-[var(--text-primary)] text-sm truncate">
                        {cat.name}
                      </span>
                      <span className="font-bold text-[var(--text-primary)] text-sm">
                        {currency}
                        {cat.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--surface-input)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percent}%` }}
                        className="h-full rounded-full"
                        style={{ background: mergedColors[cat.name] || 'var(--teal)' }}
                      />
                    </div>
                  </div>
                </button>
              ))}

              {categorySpending.length > 6 && (
                <button className="w-full py-3 text-[length:var(--fs-overline)] font-bold text-[var(--teal)] uppercase tracking-widest bg-transparent border-none">
                  + {categorySpending.length - 6} more categories
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Intelligence Micro-Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
              Smart Suggestion
            </h4>
            <p className="text-indigo-800/60 dark:text-indigo-200/60 text-[length:var(--fs-caption)] font-medium leading-tight mt-1">
              You've spent 25% more on Coffee this week. Consider a weekly limit of {currency}500.
            </p>
          </div>
        </div>

        <div className="p-5 bg-[var(--teal)]/10 rounded-[2rem] border border-[var(--teal)]/20 flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--teal)] flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
            <Target size={22} />
          </div>
          <div>
            <h4 className="font-bold text-teal-900 dark:text-teal-200 text-sm">Goal on Track</h4>
            <p className="text-teal-800/60 dark:text-teal-200/60 text-[length:var(--fs-caption)] font-medium leading-tight mt-1">
              Keep it up! You're {currency}2,400 away from your 'New Laptop' goal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

