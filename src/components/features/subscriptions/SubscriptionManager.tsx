import { useMemo } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { RecurringPattern } from '../../../types';
import { useCategories } from '../../../hooks/useCategories';

interface SubscriptionManagerProps {
  patterns: RecurringPattern[];
  currency?: string;
}

const SERVICE_COLORS: Record<string, string> = {
  netflix:   '#e50914', spotify: '#1db954', notion:  '#000000',
  amazon:    '#ff9900', apple:   '#555555', youtube: '#ff0000',
  gym:       '#6366f1', jio:     '#0052cc', airtel:  '#e40000',
  phone:     '#64748b', adobe:   '#ff0000', canva:   '#00c4cc',
};

function getServiceColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#6366f1';
}

function getServiceInitials(name: string): string {
  return name.split(/[\s/]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

export default function SubscriptionManager({ patterns, currency = '₹' }: SubscriptionManagerProps) {
  const { mergedIcons } = useCategories();

  // Pull out subscription-like patterns (Subscriptions category or recurring monthly)
  const subscriptions = useMemo(() =>
    patterns.filter(p =>
      p.category === 'Subscriptions' || p.frequency === 'monthly' || p.frequency === 'annual'
    ).sort((a, b) => b.avgAmount - a.avgAmount),
    [patterns]
  );

  const monthlyTotal = useMemo(() =>
    subscriptions.filter(s => s.frequency === 'monthly').reduce((sum, s) => sum + s.avgAmount, 0),
    [subscriptions]
  );

  const annualTotal = useMemo(() => {
    return subscriptions.reduce((sum, s) => {
      if (s.frequency === 'monthly') return sum + s.avgAmount * 12;
      if (s.frequency === 'annual')  return sum + s.avgAmount;
      return sum;
    }, 0);
  }, [subscriptions]);

  const upcoming = useMemo(() =>
    subscriptions.filter(s => daysUntil(s.nextExpected) <= 7),
    [subscriptions]
  );

  const statsCards = [
    { label: 'Monthly Burn',    value: `${currency}${monthlyTotal.toFixed(0)}`, color: 'var(--teal)',   icon: <RefreshCw size={16} /> },
    { label: 'Annual Spend',    value: `${currency}${annualTotal.toFixed(0)}`,  color: 'var(--purple)', icon: <TrendingUp size={16} /> },
    { label: 'Active Services', value: `${subscriptions.length}`,               color: 'var(--blue)',   icon: <DollarSign size={16} /> },
    { label: 'Due This Week',   value: `${upcoming.length}`,                    color: 'var(--amber)',  icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="animate-fade-in-up space-y-6">

      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-headline">
          <RefreshCw size={22} style={{ color: '#a855f7' }} />
          Subscription Intelligence
        </h2>
        <p className="text-caption mt-1">
          All recurring charges auto-detected from your transaction history.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map(s => (
          <div key={s.label} className="card px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="font-inter text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <p className="font-manrope font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming this week alert */}
      {upcoming.length > 0 && (
        <div className="card px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1.5px solid rgba(251,191,36,0.3)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-inter font-bold text-[14px]" style={{ color: 'var(--amber)' }}>Bills due within 7 days</p>
            <p className="font-inter text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {upcoming.map(s => `${s.merchant} (${daysUntil(s.nextExpected) === 0 ? 'Today' : `in ${daysUntil(s.nextExpected)}d`})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f5f7fa' }}>
            <RefreshCw size={26} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-inter font-medium text-[14px]" style={{ color: 'var(--text-muted)' }}>No subscriptions detected yet</p>
          <p className="font-inter text-[12px] mt-1" style={{ color: 'var(--text-dim)' }}>
            Add recurring transactions — they'll automatically appear here after 2+ charges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map(sub => {
            const color = getServiceColor(sub.merchant);
            const initials = getServiceInitials(sub.merchant);
            const days = daysUntil(sub.nextExpected);
            const isUrgent = days <= 5;
            const annualCost = sub.frequency === 'monthly' ? sub.avgAmount * 12 : sub.avgAmount;

            return (
              <div
                key={`${sub.merchant}-${sub.frequency}`}
                className="card relative overflow-hidden transition-all"
                style={{ borderTop: `3px solid ${color}` }}
              >
                <div className="px-5 pt-4 pb-5">
                  {/* Service Logo */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ background: color, fontFamily: 'var(--font-manrope)' }}
                    >
                      {mergedIcons[sub.category] ? (
                        <span className="text-lg">{mergedIcons[sub.category]}</span>
                      ) : initials}
                    </div>
                    <span className="font-inter text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                      style={{ background: color + '15', color }}>
                      {sub.frequency}
                    </span>
                  </div>

                  {/* Name + Amount */}
                  <p className="font-inter font-bold text-[14px] mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {sub.merchant}
                  </p>
                  <p className="font-manrope font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                    {currency}{sub.avgAmount.toFixed(0)}
                    <span className="font-inter text-[11px] font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
                      /{sub.frequency === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </p>

                  {/* Price Creep Alert */}
                  {sub.priceCreep && (
                    <div className="flex items-center gap-1.5 mt-1 animate-pulse">
                      <TrendingUp size={12} className="text-red-500" />
                      <span className="font-inter text-[10px] font-bold text-red-500 uppercase tracking-tight">Price Increased Recently</span>
                    </div>
                  )}

                  {/* Annual cost */}
                  <p className="font-inter text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {currency}{annualCost.toFixed(0)} / year
                  </p>

                  {/* Next billing */}
                  <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px dashed var(--border)' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                      <span className="font-inter text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Next: <strong style={{ color: 'var(--text-primary)' }}>
                          {new Date(sub.nextExpected + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </strong>
                      </span>
                    </div>
                    <span
                      className="font-inter text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{
                        background: isUrgent ? 'var(--amber-dim)' : '#f5f7fa',
                        color: isUrgent ? 'var(--amber)' : 'var(--text-muted)'
                      }}
                    >
                      {days === 0 ? 'Today!' : `${days}d`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Annual Summary */}
      {subscriptions.length > 0 && (
        <div className="card px-6 py-5" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', border: 'none' }}>
          <p className="font-inter text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-2">Total Annual Subscription Cost</p>
          <p className="font-manrope font-bold text-4xl text-white">
            {currency}{annualTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="font-inter text-[13px] text-white/70 mt-2">
            across {subscriptions.length} recurring service{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
