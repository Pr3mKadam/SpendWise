import { useMemo, useState } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign, Calendar, Plus, Zap, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { RecurringPattern } from '../../../types';
import { useCategories } from '../../../hooks/useCategories';
import { useStore } from '../../../store';
import AddSubscriptionModal from './AddSubscriptionModal';
import { useCurrency } from '../../../contexts/CurrencyContext';

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

function SubscriptionCalendar({ subscriptions, currency }: { subscriptions: any[], currency: string }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDaySubs = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`;
    
    return subscriptions.filter(s => {
      // Compare the YYYY-MM-DD exactly if we have a nextExpected string
      if (!s.nextExpected) return false;
      const [sy, sm, sd] = s.nextExpected.split('-');
      
      // If it's a monthly sub, it happens on 'sd' every month
      if (s.frequency === 'monthly') {
        return Number(sd) === day;
      }
      
      // If annual or otherwise, only exact match
      return s.nextExpected === dateStr;
    });
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth();

  return (
    <div className="card p-5 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[15px] flex items-center gap-2">
          <Calendar size={18} style={{ color: 'var(--teal)' }} />
          Bills Calendar
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-semibold text-sm w-32 text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 py-1 uppercase">{d}</div>
        ))}
        
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 sm:h-20 bg-transparent rounded-lg" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const subs = getDaySubs(day);
          const isToday = isCurrentMonth && day === today.getDate();
          
          return (
            <div 
              key={`day-${day}`} 
              className={`h-14 sm:h-20 rounded-lg p-1 sm:p-2 flex flex-col items-center border transition-all ${
                isToday 
                  ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800' 
                  : 'bg-white border-gray-100 dark:bg-[#1a2235] dark:border-[#2d3748] hover:border-teal-100'
              }`}
            >
              <span className={`text-[11px] sm:text-xs font-semibold ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500'}`}>
                {day}
              </span>
              
              <div className="flex-1 w-full flex flex-col items-center justify-center gap-0.5 mt-1 overflow-hidden">
                {subs.slice(0, 2).map((s, idx) => (
                  <div 
                    key={idx}
                    className="w-full text-[9px] sm:text-[10px] truncate text-center font-medium rounded px-1"
                    style={{ backgroundColor: getServiceColor(s.merchant) + '20', color: getServiceColor(s.merchant) }}
                    title={`${s.merchant}: ${s.avgAmount}`}
                  >
                    {getServiceInitials(s.merchant)}
                  </div>
                ))}
                {subs.length > 2 && (
                  <div className="w-full text-[9px] text-center font-bold text-gray-400">+{subs.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SubscriptionManager({ patterns, currency = '₹' }: SubscriptionManagerProps) {
  const { mergedIcons } = useCategories();
  const { format, activeCurrency } = useCurrency();
  const recurringTransactions = useStore(s => s.recurringTransactions);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pull out subscription-like patterns (Subscriptions category or recurring monthly)
  const autoSubscriptions = useMemo(() =>
    patterns.filter(p =>
      p.category === 'Subscriptions' || p.frequency === 'monthly' || p.frequency === 'annual'
    ).sort((a, b) => b.avgAmount - a.avgAmount),
    [patterns]
  );

  const manualSubscriptions = useMemo(() => {
    return recurringTransactions.map(rt => ({
      merchant: rt.merchant,
      category: rt.category,
      avgAmount: rt.amount,
      frequency: rt.frequency === 'yearly' ? 'annual' : rt.frequency,
      lastSeen: rt.lastProcessed || new Date().toISOString(),
      nextExpected: rt.nextOccurrence,
      occurrences: 0,
      totalSpent: 0,
      priceCreep: false,
      isTrial: rt.isTrial,
      trialEndsAt: rt.trialEndsAt,
    } as RecurringPattern));
  }, [recurringTransactions]);

  const subscriptions = useMemo(() => {
    const combined = [...autoSubscriptions];
    // Add manual ones if not already auto-detected (simple merge by merchant name)
    manualSubscriptions.forEach(ms => {
      if (!combined.find(s => s.merchant.toLowerCase() === ms.merchant.toLowerCase())) {
        combined.push(ms);
      }
    });
    return combined.sort((a, b) => b.avgAmount - a.avgAmount);
  }, [autoSubscriptions, manualSubscriptions]);

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
    { label: 'Monthly Burn',    value: format(monthlyTotal), color: 'var(--teal)',   icon: <RefreshCw size={16} /> },
    { label: 'Annual Spend',    value: format(annualTotal),  color: 'var(--purple)', icon: <TrendingUp size={16} /> },
    { label: 'Active Services', value: `${subscriptions.length}`,               color: 'var(--blue)',   icon: <DollarSign size={16} /> },
    { label: 'Due This Week',   value: `${upcoming.length}`,                    color: 'var(--amber)',  icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="animate-fade-in-up space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <RefreshCw size={22} style={{ color: '#a855f7' }} />
            Subscription Intelligence
          </h2>
          <p className="text-caption mt-1">
            All recurring charges auto-detected from your transaction history.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-sm rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
        >
          <Plus size={16} />
          Add Manual
        </button>
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

      {/* Calendar View */}
      {subscriptions.length > 0 && (
        <SubscriptionCalendar subscriptions={subscriptions} currency={format(0).replace(/[0-9.,]/g, '').trim()} />
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
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-inter text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                        style={{ background: color + '15', color }}>
                        {sub.frequency}
                      </span>
                      {sub.isTrial && (
                        <span className="flex items-center gap-1 font-inter text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 rounded-full px-2 py-0.5 border border-amber-500/20">
                          <Zap size={10} /> Trial
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name + Amount */}
                  <p className="font-inter font-bold text-[14px] mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {sub.merchant}
                  </p>
                  <p className="font-manrope font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                    {format(sub.avgAmount)}
                    <span className="font-inter text-[11px] font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
                      /{sub.frequency === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </p>

                  {/* Trial Info */}
                  {sub.isTrial && sub.trialEndsAt && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={11} className="text-amber-500" />
                      <span className="font-inter text-[10px] text-amber-600 font-medium">
                        Ends {new Date(sub.trialEndsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Price Creep Alert */}
                  {sub.priceCreep && (
                    <div className="flex items-center gap-1.5 mt-1 animate-pulse">
                      <TrendingUp size={12} className="text-red-500" />
                      <span className="font-inter text-[10px] font-bold text-red-500 uppercase tracking-tight">Price Increased Recently</span>
                    </div>
                  )}

                  {/* Annual cost */}
                  <p className="font-inter text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {format(annualCost)} / year
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
            {format(annualTotal)}
          </p>
          <p className="font-inter text-[13px] text-white/70 mt-2">
            across {subscriptions.length} recurring service{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <AddSubscriptionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        currency={currency}
      />
    </div>
  );
}
