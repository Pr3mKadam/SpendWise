/**
 * SubscriptionCalendar.tsx
 * Monthly grid view showing when each subscription bill hits.
 */
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay?: number; // day of month (1-31)
  emoji?: string;
  color?: string;
}

interface Props {
  subscriptions: Subscription[];
  currency?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function SubscriptionCalendar({ subscriptions, currency = '₹' }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { year, month } = viewDate;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build bill map: day → subscriptions
  const billMap = useMemo(() => {
    const map: Record<number, Subscription[]> = {};
    subscriptions.forEach(sub => {
      const day = sub.billingDay ?? 1;
      if (!map[day]) map[day] = [];
      map[day].push(sub);
    });
    return map;
  }, [subscriptions]);

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);

  const prev = () => {
    setViewDate(v =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }
    );
  };
  const next = () => {
    setViewDate(v =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }
    );
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="card px-4 sm:px-6 py-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <CalendarDays size={18} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Subscription Calendar
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            {currency}
            {totalMonthly.toLocaleString()}/mo across {subscriptions.length} subscriptions
          </p>
        </div>
        {/* Nav */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-input)] transition-colors border-none cursor-pointer"
            style={{ background: 'transparent' }}
          >
            <ChevronLeft size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
          <span
            className="text-sm font-bold px-2"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-inter)',
              minWidth: 110,
              textAlign: 'center',
            }}
          >
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={next}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-input)] transition-colors border-none cursor-pointer"
            style={{ background: 'transparent' }}
          >
            <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div
            key={d}
            className="text-center text-[length:var(--fs-overline)] font-bold uppercase tracking-wider py-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const bills = billMap[day] ?? [];
          const isToday =
            year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
          const hasBills = bills.length > 0;

          return (
            <div
              key={day}
              className="relative min-h-[52px] rounded-xl p-1 flex flex-col items-center transition-colors"
              style={{
                background: hasBills
                  ? 'rgba(59,130,246,0.06)'
                  : isToday
                    ? 'var(--teal-dim)'
                    : 'transparent',
                border: isToday
                  ? '1.5px solid var(--teal)'
                  : hasBills
                    ? '1px solid rgba(59,130,246,0.2)'
                    : '1px solid transparent',
              }}
            >
              <span
                className="text-[length:var(--fs-caption)] font-bold mb-0.5"
                style={{
                  color: isToday ? 'var(--teal)' : hasBills ? '#3b82f6' : 'var(--text-muted)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {day}
              </span>
              {bills.slice(0, 2).map((sub, bi) => (
                <div
                  key={bi}
                  className="w-full text-center text-[8px] font-bold truncate px-0.5 rounded"
                  style={{
                    background: sub.color ? `${sub.color}25` : '#3b82f620',
                    color: sub.color ?? '#3b82f6',
                  }}
                  title={`${sub.name} — ${currency}${sub.amount}`}
                >
                  {sub.emoji ?? '💳'} {sub.amount}
                </div>
              ))}
              {bills.length > 2 && (
                <div className="text-[8px] font-bold" style={{ color: '#3b82f6' }}>
                  +{bills.length - 2}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming bills list */}
      {subscriptions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p
            className="text-[length:var(--fs-overline)] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Bills This Month
          </p>
          <div className="space-y-1.5">
            {[...subscriptions]
              .sort((a, b) => (a.billingDay ?? 1) - (b.billingDay ?? 1))
              .map(sub => (
                <div key={sub.id} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span>{sub.emoji ?? '💳'}</span>
                    <span
                      style={{
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-inter)',
                        fontWeight: 500,
                      }}
                    >
                      {sub.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span style={{ color: 'var(--text-muted)' }}>Day {sub.billingDay ?? 1}</span>
                    <span
                      className="font-bold"
                      style={{ color: '#3b82f6', fontFamily: 'var(--font-manrope)' }}
                    >
                      {currency}
                      {sub.amount}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
