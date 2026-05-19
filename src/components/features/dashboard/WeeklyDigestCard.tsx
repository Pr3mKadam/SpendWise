import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus, Calendar } from 'lucide-react';
import { Transaction } from '@/types';

interface WeeklyDigestCardProps {
  transactions: Transaction[];
  currency?: string;
}

function getISOMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // Mon=0 offset
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function WeeklyDigestCard({ transactions, currency = '₹' }: WeeklyDigestCardProps) {
  const digest = useMemo(() => {
    const now = new Date();
    const thisMonday = getISOMonday(now);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(lastMonday.getDate() - 7);
    const prevMonday = new Date(lastMonday);
    prevMonday.setDate(prevMonday.getDate() - 7);

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const thisWeekStart = fmt(thisMonday);
    const lastWeekStart = fmt(lastMonday);
    const lastWeekEnd   = fmt(new Date(thisMonday.getTime() - 86400000));
    const prevWeekStart = fmt(prevMonday);
    const prevWeekEnd   = fmt(new Date(lastMonday.getTime() - 86400000));

    // Only show if it's Monday (within first 24h of week) OR if there's data
    // Always show last week's digest
    let lastWeekTotal = 0;
    let prevWeekTotal = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach(tx => {
      if (tx.type !== 'debit') return;
      if (tx.date >= lastWeekStart && tx.date <= lastWeekEnd) {
        lastWeekTotal += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
      if (tx.date >= prevWeekStart && tx.date <= prevWeekEnd) {
        prevWeekTotal += tx.amount;
      }
    });

    if (lastWeekTotal === 0) return null;

    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    const delta = prevWeekTotal > 0 ? ((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100 : null;

    return { lastWeekTotal, prevWeekTotal, topCategory, delta, lastWeekStart, lastWeekEnd };
  }, [transactions]);

  if (!digest) return null;

  const { lastWeekTotal, delta, topCategory, lastWeekStart, lastWeekEnd } = digest;

  const deltaColor = delta === null ? 'var(--text-muted)' : delta > 0 ? '#ef4444' : '#10b981';
  const DeltaIcon = delta === null ? Minus : delta > 0 ? TrendingUp : TrendingDown;

  const weekLabel = `${new Date(lastWeekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(lastWeekEnd + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="card px-5 py-4 flex gap-4 items-start" style={{ border: '1.5px solid var(--border)', borderLeft: '4px solid var(--teal)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(20,184,166,0.1)' }}>
        <Calendar size={18} style={{ color: 'var(--teal)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Last Week Summary
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
            {weekLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Spent
            </span>
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currency}{lastWeekTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          {delta !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${deltaColor}15` }}>
              <DeltaIcon size={13} style={{ color: deltaColor }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, color: deltaColor }}>
                {Math.abs(delta).toFixed(1)}% vs prev week
              </span>
            </div>
          )}
          {topCategory && (
            <div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Category
              </span>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {topCategory[0]} · {currency}{topCategory[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
