import { BudgetPeriod } from '@/types';

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string; short: string }[] = [
  { value: 'weekly', label: 'Weekly', short: '7d' },
  { value: 'biweekly', label: 'Bi-Weekly', short: '14d' },
  { value: 'monthly', label: 'Monthly', short: '30d' },
];

export function PeriodSelector({
  period,
  onChange,
}: {
  period: BudgetPeriod;
  onChange: (p: BudgetPeriod) => void;
}) {
  return (
    <div
      className="flex items-center rounded-xl p-1 gap-1"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
          style={{
            background: period === opt.value ? 'var(--teal)' : 'transparent',
            color: period === opt.value ? '#fff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            whiteSpace: 'nowrap',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
