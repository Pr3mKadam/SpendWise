import { useState, useMemo } from 'react';
import { Ban, Calendar, Clock, AlertTriangle, Shield, CreditCard, TrendingUp } from 'lucide-react';
import { UPIMandate, MandateType } from '@/types';
import { useStore } from '@/store';
import { useCurrency } from '@/contexts/CurrencyContext';

interface MandateManagerProps {
  mandates: UPIMandate[];
  currency?: string;
}

const TYPE_CONFIG: Record<MandateType, { label: string; color: string; bg: string }> = {
  emi: { label: 'EMI', color: '#ef4444', bg: '#fef2f2' },
  sip: { label: 'SIP', color: '#3b82f6', bg: '#eff6ff' },
  subscription: { label: 'Subscription', color: '#22c55e', bg: '#f0fdf4' },
  insurance: { label: 'Insurance', color: '#a855f7', bg: '#faf5ff' },
  other: { label: 'Other', color: '#64748b', bg: '#f8fafc' },
};

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

function getUpcomingNotifications(mandates: UPIMandate[]): { mandate: UPIMandate; days: number }[] {
  return mandates
    .filter(m => m.status === 'active')
    .map(m => ({ mandate: m, days: daysUntil(m.nextDebit) }))
    .filter(({ days }) => days <= 3 && days >= 0)
    .sort((a, b) => a.days - b.days);
}

export default function MandateManager({
  mandates,
  currency: _currency = '₹',
}: MandateManagerProps) {
  const { format } = useCurrency();
  const removeMandate = useStore(s => s.removeMandate);
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'cancelled'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  const activeMandates = useMemo(() => mandates.filter(m => m.status === 'active'), [mandates]);

  const cancelledMandates = useMemo(
    () => mandates.filter(m => m.status === 'cancelled'),
    [mandates]
  );

  const monthlyOutflow = useMemo(
    () =>
      activeMandates.reduce((sum, m) => {
        if (m.frequency === 'monthly') return sum + m.amount;
        if (m.frequency === 'weekly') return sum + m.amount * 4.33;
        if (m.frequency === 'quarterly') return sum + m.amount / 3;
        if (m.frequency === 'annual') return sum + m.amount / 12;
        if (m.frequency === 'daily') return sum + m.amount * 30;
        return sum;
      }, 0),
    [activeMandates]
  );

  const upcomingNotifications = useMemo(() => getUpcomingNotifications(mandates), [mandates]);

  const filteredMandates = useMemo(() => {
    switch (selectedTab) {
      case 'active':
        return activeMandates;
      case 'cancelled':
        return cancelledMandates;
      default:
        return mandates;
    }
  }, [mandates, activeMandates, cancelledMandates, selectedTab]);

  const calendarEvents = useMemo(() => {
    return activeMandates
      .map(m => ({
        id: m.id,
        name: m.merchant,
        amount: m.amount,
        date: m.nextDebit,
        color: TYPE_CONFIG[m.type].color,
        frequency: m.frequency,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeMandates]);

  const statsCards = [
    {
      label: 'Active Mandates',
      value: `${activeMandates.length}`,
      color: 'var(--blue)',
      icon: <Shield size={16} />,
    },
    {
      label: 'Monthly Outflow',
      value: format(monthlyOutflow),
      color: 'var(--teal)',
      icon: <TrendingUp size={16} />,
    },
    {
      label: 'Total Mandates',
      value: `${mandates.length}`,
      color: 'var(--purple)',
      icon: <CreditCard size={16} />,
    },
    {
      label: 'Due Soon',
      value: `${upcomingNotifications.length}`,
      color: 'var(--amber)',
      icon: <AlertTriangle size={16} />,
    },
  ];

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Shield size={22} style={{ color: '#3b82f6' }} />
            UPI AutoPay Mandates
          </h2>
          <p className="text-caption mt-1">
            Detected recurring mandates from your UPI transaction history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'calendar' : 'cards')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar size={14} />
            {viewMode === 'cards' ? 'Calendar' : 'Cards'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map(s => (
          <div key={s.label} className="card px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span
                className="font-inter text-[length:var(--fs-overline)] font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.label}
              </span>
            </div>
            <p className="font-manrope font-bold text-2xl" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Notifications Section */}
      {upcomingNotifications.length > 0 && (
        <div className="space-y-2">
          {upcomingNotifications.map(({ mandate, days }) => {
            const config = TYPE_CONFIG[mandate.type];
            return (
              <div
                key={mandate.id}
                className="card px-5 py-4 flex items-start gap-3"
                style={{
                  background: `${config.bg}`,
                  border: `1.5px solid ${config.color}30`,
                }}
              >
                <AlertTriangle
                  size={20}
                  style={{ color: config.color, flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <p className="font-inter font-bold text-[14px]" style={{ color: config.color }}>
                    {days === 0
                      ? 'Due Today'
                      : `${days} day${days === 1 ? '' : 's'} before AutoPay`}
                  </p>
                  <p className="font-inter text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {format(mandate.amount)} {mandate.type === 'emi' ? 'EMI' : 'AutoPay'} to{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{mandate.merchant}</strong> on{' '}
                    {new Date(mandate.nextDebit + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        {(['all', 'active', 'cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              selectedTab === tab
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-1.5 text-xs opacity-60">
              (
              {tab === 'all'
                ? mandates.length
                : tab === 'active'
                  ? activeMandates.length
                  : cancelledMandates.length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && calendarEvents.length > 0 && (
        <div className="card px-5 py-4">
          <h3
            className="font-inter font-bold text-sm mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Calendar size={14} /> Upcoming Debits
          </h3>
          <div className="space-y-2">
            {calendarEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background: `${event.color}08` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: event.color }} />
                  <div>
                    <p
                      className="font-inter font-bold text-[13px]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {event.name}
                    </p>
                    <p className="font-inter text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-manrope font-bold text-sm" style={{ color: event.color }}>
                    {format(event.amount)}
                  </p>
                  <p
                    className="font-inter text-[10px] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {FREQ_LABELS[event.frequency] || event.frequency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandates Grid */}
      {filteredMandates.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#f5f7fa' }}
          >
            <Shield size={26} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-inter font-medium text-[14px]" style={{ color: 'var(--text-muted)' }}>
            No mandates detected yet
          </p>
          <p className="font-inter text-[12px] mt-1" style={{ color: 'var(--text-dim)' }}>
            SMS notifications from your bank about AutoPay mandates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMandates.map(mandate => {
            const config = TYPE_CONFIG[mandate.type];
            const days = daysUntil(mandate.nextDebit);
            const isUrgent = days <= 5;
            const isOverdue = days === 0;

            return (
              <div
                key={mandate.id}
                className="card relative overflow-hidden transition-all"
                style={{ borderTop: `3px solid ${config.color}` }}
              >
                <div className="px-5 pt-4 pb-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ background: config.color, fontFamily: 'var(--font-manrope)' }}
                    >
                      {mandate.merchant.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="font-inter text-[length:var(--fs-overline)] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                        style={{ background: config.bg, color: config.color }}
                      >
                        {config.label}
                      </span>
                      <span
                        className="font-inter text-[length:var(--fs-overline)] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                        style={{
                          background:
                            mandate.status === 'active'
                              ? '#f0fdf4'
                              : mandate.status === 'cancelled'
                                ? '#fef2f2'
                                : '#f8fafc',
                          color:
                            mandate.status === 'active'
                              ? '#22c55e'
                              : mandate.status === 'cancelled'
                                ? '#ef4444'
                                : '#64748b',
                        }}
                      >
                        {mandate.status}
                      </span>
                    </div>
                  </div>

                  <p
                    className="font-inter font-bold text-[14px] mb-1 truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {mandate.merchant}
                  </p>
                  <p
                    className="font-manrope font-bold text-2xl"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {format(mandate.amount)}
                    <span
                      className="font-inter text-[length:var(--fs-caption)] font-medium ml-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      /{FREQ_LABELS[mandate.frequency]?.toLowerCase() || mandate.frequency}
                    </span>
                  </p>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                      <span
                        className="font-inter text-[12px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Next debit:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {new Date(mandate.nextDebit + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>
                      </span>
                    </div>
                    {mandate.lastDebit && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                        <span
                          className="font-inter text-[12px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Last:{' '}
                          {new Date(mandate.lastDebit + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-inter text-[12px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        UMR:{' '}
                        <code
                          className="text-[11px] font-mono"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {mandate.umr}
                        </code>
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between mt-4 pt-3"
                    style={{ borderTop: '1px dashed var(--border)' }}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="font-inter text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        via {mandate.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-inter text-[length:var(--fs-overline)] font-bold rounded-full px-2 py-0.5"
                        style={{
                          background: isOverdue
                            ? '#fef2f2'
                            : isUrgent
                              ? 'var(--amber-dim)'
                              : '#f5f7fa',
                          color: isOverdue
                            ? '#ef4444'
                            : isUrgent
                              ? 'var(--amber)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {isOverdue ? 'Overdue!' : days === 0 ? 'Today!' : `${days}d`}
                      </span>
                      {mandate.status === 'active' && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Cancel AutoPay mandate for ${mandate.merchant}?\n\nTo manage this mandate:\n• Open ${mandate.provider} app\n• Go to AutoPay / Mandates\n• Find UMR: ${mandate.umr}\n• Cancel the mandate`
                              )
                            ) {
                              removeMandate(mandate.id);
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Cancel Mandate"
                        >
                          <Ban size={12} />
                          <span className="font-inter text-[11px] font-bold">Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Bar */}
      {activeMandates.length > 0 && (
        <div
          className="card px-6 py-5"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            border: 'none',
          }}
        >
          <p className="font-inter text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-2">
            Total Monthly Mandate Outflow
          </p>
          <p className="font-manrope font-bold text-4xl text-white">{format(monthlyOutflow)}</p>
          <p className="font-inter text-[13px] text-white/70 mt-2">
            across {activeMandates.length} active mandate{activeMandates.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
