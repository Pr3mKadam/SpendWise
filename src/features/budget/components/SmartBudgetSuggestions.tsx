import { useState, useMemo } from 'react';
import { Lightbulb, X, Check, TrendingDown } from 'lucide-react';
import { Transaction, Category } from '@/types';

interface SmartBudgetSuggestionsProps {
  transactions: Transaction[];
  existingBudgets: Record<string, number>;
  onAccept: (category: Category, amount: number) => void;
  currency?: string;
}

interface Suggestion {
  category: Category;
  avgMonthlySpend: number;
  suggestedLimit: number;
  months: number;
}

export function SmartBudgetSuggestions({ transactions, existingBudgets, onAccept, currency = '₹' }: SmartBudgetSuggestionsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const suggestions: Suggestion[] = useMemo(() => {
    if (transactions.length === 0) return [];

    // Group debit transactions by category and month
    const monthCategoryMap: Record<string, Record<string, number>> = {};
    transactions.forEach(tx => {
      if (tx.type !== 'debit') return;
      const month = tx.date.substring(0, 7);
      if (!monthCategoryMap[month]) monthCategoryMap[month] = {};
      monthCategoryMap[month][tx.category] = (monthCategoryMap[month][tx.category] || 0) + tx.amount;
    });

    const months = Object.keys(monthCategoryMap);
    if (months.length === 0) return [];

    // Aggregate avg spend per category across months
    const categoryTotals: Record<string, { total: number; monthCount: number }> = {};
    months.forEach(month => {
      Object.entries(monthCategoryMap[month]).forEach(([cat, amount]) => {
        if (!categoryTotals[cat]) categoryTotals[cat] = { total: 0, monthCount: 0 };
        categoryTotals[cat].total += amount;
        categoryTotals[cat].monthCount += 1;
      });
    });

    return Object.entries(categoryTotals)
      .filter(([cat]) => !existingBudgets[cat]) // only suggest for unbudgeted categories
      .map(([cat, { total, monthCount }]) => {
        const avg = total / monthCount;
        // Suggest ~10% below avg to encourage saving
        const suggested = Math.round((avg * 0.9) / 100) * 100;
        return {
          category: cat as Category,
          avgMonthlySpend: Math.round(avg),
          suggestedLimit: Math.max(suggested, 100),
          months: monthCount,
        };
      })
      .filter(s => s.months >= 1 && s.avgMonthlySpend > 200) // only meaningful categories
      .sort((a, b) => b.avgMonthlySpend - a.avgMonthlySpend)
      .slice(0, 5);
  }, [transactions, existingBudgets]);

  const visible = suggestions.filter(s => !dismissed.has(s.category) && !accepted.has(s.category));

  if (visible.length === 0) return null;

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}>
          <Lightbulb size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Smart Budget Suggestions
          </h3>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Based on your spending history · Set limits to stay on track
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {visible.map(s => (
          <div
            key={s.category}
            className="flex items-center justify-between gap-4 p-3 rounded-xl border"
            style={{ border: '1.5px solid var(--border)', background: 'var(--surface-input)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {s.category}
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[length:var(--fs-overline)] font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                  AI Suggested
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Avg: {currency}{s.avgMonthlySpend.toLocaleString('en-IN')}/mo
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>→</span>
                <span className="flex items-center gap-1" style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 800, color: 'var(--teal)' }}>
                  <TrendingDown size={12} />
                  {currency}{s.suggestedLimit.toLocaleString('en-IN')} limit
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { onAccept(s.category, s.suggestedLimit); setAccepted(prev => new Set([...prev, s.category])); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all hover:opacity-90"
                style={{ background: 'var(--teal)', color: '#fff' }}
              >
                <Check size={12} />
                Set Budget
              </button>
              <button
                onClick={() => setDismissed(prev => new Set([...prev, s.category]))}
                className="p-1.5 rounded-xl border-none cursor-pointer transition-colors"
                style={{ background: 'var(--surface-input)', color: 'var(--text-muted)' }}
                title="Dismiss suggestion"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
