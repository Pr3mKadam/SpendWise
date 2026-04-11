import { RefreshCw, Calendar, TrendingUp, Clock, Zap } from 'lucide-react';
import { RecurringPattern } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

interface RecurringViewProps {
  patterns: RecurringPattern[];
}

// ─── Frequency badge ──────────────────────────────────────────────────────────

const FREQ_CONFIG = {
  weekly:  { label: 'Weekly',  color: '#3b82f6', emoji: '🔁' },
  monthly: { label: 'Monthly', color: '#a855f7', emoji: '🔄' },
  annual:  { label: 'Annual',  color: '#f59e0b', emoji: '📅' },
};

// ─── Days until next ──────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

// ─── Pattern card ─────────────────────────────────────────────────────────────

function PatternCard({ pattern }: { pattern: RecurringPattern }) {
  const freq     = FREQ_CONFIG[pattern.frequency];
  const days     = daysUntil(pattern.nextExpected);
  const isUrgent = days <= 5;
  const catColor = CATEGORY_COLORS[pattern.category] ?? '#64748b';
  const catIcon  = CATEGORY_ICONS[pattern.category] ?? '💳';

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 transition-all duration-200 hover:border-slate-600/50 hover:bg-slate-800/50"
    >
      {/* Top accent */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${catColor}80, transparent)` }}
      />

      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: `${catColor}18` }}
        >
          {catIcon}
        </div>

        <div className="min-w-0 flex-1">
          {/* Merchant + frequency badge */}
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold text-white">{pattern.merchant}</p>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${freq.color}20`, color: freq.color }}
            >
              {freq.emoji} {freq.label}
            </span>
          </div>

          {/* Category + occurrences */}
          <p className="mt-0.5 text-[11px] text-slate-500">
            <span style={{ color: `${catColor}cc` }}>{pattern.category}</span>
            {' · '}{pattern.occurrences}× detected · ${pattern.totalSpent.toFixed(0)} total
          </p>
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-bold text-white">
            ~${pattern.avgAmount.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500">avg / charge</p>
        </div>
      </div>

      {/* Next expected */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-700/30 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-slate-600" />
          <span className="text-[11px] text-slate-500">
            Next expected <span className="text-slate-400">{formatDate(pattern.nextExpected)}</span>
          </span>
        </div>

        {/* Urgency indicator */}
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isUrgent
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-slate-700/60 text-slate-500'
          }`}
        >
          <Clock className="h-2.5 w-2.5" />
          {days === 0 ? 'Today' : `${days}d`}
        </span>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60">
        <RefreshCw className="h-7 w-7 text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-500">No recurring patterns found</p>
      <p className="mt-1 text-xs text-slate-600">
        Add more transactions — patterns emerge after 2+ identical charges
      </p>
    </div>
  );
}

// ─── Summary stats bar ────────────────────────────────────────────────────────

function SummaryBar({ patterns }: { patterns: RecurringPattern[] }) {
  const total       = patterns.reduce((a, p) => a + p.avgAmount, 0);
  const monthly     = patterns
    .filter(p => p.frequency === 'monthly')
    .reduce((a, p) => a + p.avgAmount, 0);
  const subscriptions = patterns.filter(p => p.category === 'Subscriptions').length;

  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      {[
        { label: 'Total Monthly',  value: `$${total.toFixed(0)}`,        icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Subscriptions',  value: `$${monthly.toFixed(0)}/mo`,   icon: RefreshCw,  color: 'text-purple-400' },
        { label: 'Recurring Bills', value: `${subscriptions} services`,  icon: Zap,        color: 'text-blue-400'   },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-slate-700/40 bg-slate-800/30 px-3 py-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <s.icon className={`h-3 w-3 ${s.color}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{s.label}</span>
          </div>
          <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecurringView({ patterns }: RecurringViewProps) {
  return (
    <div className="glass-card animate-fade-in-up rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            <RefreshCw className="h-5 w-5 text-purple-400" />
            Recurring Charges
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Auto-detected from your transaction history
          </p>
        </div>

        {patterns.length > 0 && (
          <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-400">
            {patterns.length} detected
          </span>
        )}
      </div>

      {patterns.length > 0 && <SummaryBar patterns={patterns} />}

      {patterns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {patterns.map(p => (
            <PatternCard key={`${p.merchant}-${p.frequency}`} pattern={p} />
          ))}
        </div>
      )}
    </div>
  );
}
