import { useMemo } from 'react';
import { CategorySpend } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface SpendingHeatmapProps {
  transactions: { date: string; amount: number; type: string }[];
  currency?: string;
}

function getDayColor(amount: number, max: number): string {
  if (amount === 0) return 'var(--surface-input)';
  const ratio = amount / max;
  if (ratio < 0.2) return '#dcfce7'; // lightest green
  if (ratio < 0.4) return '#86efac';
  if (ratio < 0.6) return '#fb923c'; // orange
  if (ratio < 0.8) return '#ef4444'; // red
  return '#b91c1c'; // darkest red
}

function getDayColorDark(amount: number, max: number): string {
  if (amount === 0) return '#1e293b';
  const ratio = amount / max;
  if (ratio < 0.2) return '#14532d';
  if (ratio < 0.4) return '#166534';
  if (ratio < 0.6) return '#9a3412';
  if (ratio < 0.8) return '#991b1b';
  return '#7f1d1d';
}

export default function SpendingHeatmap({ transactions, currency = '₹' }: SpendingHeatmapProps) {
  const { weeks, maxAmount, selectedMonth, isDark } = useMemo(() => {
    // R3-A fix: compute isDark inside useMemo so it re-evaluates on theme changes
    const isDark = document.documentElement.classList.contains('dark');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Build a map of date → total debit spending
    const dayMap: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.type !== 'debit') return;
      const d = new Date(tx.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = tx.date;
        dayMap[key] = (dayMap[key] || 0) + tx.amount;
      }
    });

    // Build weeks array (rows = day of week 0-6, cols = weeks)
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun

    const days: { date: string; amount: number; label: number }[] = [];
    // Pad start
    for (let i = 0; i < startDow; i++) days.push({ date: '', amount: 0, label: 0 });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, amount: dayMap[dateStr] || 0, label: d });
    }

    // Split into weeks (chunks of 7)
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const maxAmount = Math.max(...Object.values(dayMap), 1);
    const selectedMonth = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return { weeks, maxAmount, selectedMonth, isDark };
  }, [transactions]);

  const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const today = formatLocalYYYYMMDD(new Date());

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Spending Heatmap
          </h3>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {selectedMonth} · Daily spend intensity
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Less</span>
          {['var(--surface-input)', '#86efac', '#fb923c', '#ef4444', '#b91c1c'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>More</span>
        </div>
      </div>

      {/* Day of week header */}
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}>
        {DOW_LABELS.map((l, i) => (
          <div key={i} className="text-center" style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'var(--font-inter)' }}>
            {l}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid gap-1" style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}>
            {week.map((day, di) => {
              if (!day.date) {
                return <div key={di} className="aspect-square rounded-md" style={{ background: 'transparent' }} />;
              }
              const color = isDark
                ? getDayColorDark(day.amount, maxAmount)
                : getDayColor(day.amount, maxAmount);
              const isToday = day.date === today;
              return (
                <div
                  key={di}
                  className="aspect-square rounded-md flex items-center justify-center relative group transition-transform hover:scale-110 cursor-default"
                  style={{
                    background: color,
                    outline: isToday ? '2px solid var(--teal)' : undefined,
                    outlineOffset: '1px',
                  }}
                  title={day.amount > 0 ? `${day.date}: ${currency}${day.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : day.date}
                >
                  <span style={{ fontSize: '9px', fontWeight: 600, color: day.amount > maxAmount * 0.4 ? '#fff' : 'var(--text-dim)', fontFamily: 'var(--font-inter)' }}>
                    {day.label}
                  </span>
                  {/* Tooltip on hover */}
                  {day.amount > 0 && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap"
                      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', fontSize: '10px', fontFamily: 'var(--font-manrope)', fontWeight: 700, color: 'var(--text-primary)' }}
                    >
                      {currency}{day.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
