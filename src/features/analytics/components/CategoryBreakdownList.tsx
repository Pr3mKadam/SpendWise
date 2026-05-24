import { CategorySpend, AppView } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/lib/haptic';

interface CategoryBreakdownListProps {
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency: string;
  onNavigate?: (view: AppView, category?: string) => void;
}

export function CategoryBreakdownList({
  categorySpending,
  totalSpent,
  currency,
  onNavigate
}: CategoryBreakdownListProps) {
  const { mergedColors, mergedIcons } = useCategories();

  return (
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
  );
}
