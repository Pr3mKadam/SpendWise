import { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { SpendingAlert, AlertSeverity } from '../types';

interface AlertBannerProps {
  alerts:       SpendingAlert[];
  onDismiss:    (id: string) => void;
  onDismissAll: () => void;
}

// ─── Severity styles ──────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<AlertSeverity, {
  bg:      string;
  border:  string;
  icon:    typeof AlertTriangle;
  iconCls: string;
  titleCls: string;
  msgCls:  string;
  badgeCls: string;
}> = {
  danger: {
    bg:       'bg-red-500/8 hover:bg-red-500/12',
    border:   'border-red-500/25',
    icon:     ShieldAlert,
    iconCls:  'text-red-400',
    titleCls: 'text-red-300',
    msgCls:   'text-red-200/70',
    badgeCls: 'bg-red-500 text-white',
  },
  warning: {
    bg:       'bg-amber-500/8 hover:bg-amber-500/12',
    border:   'border-amber-500/25',
    icon:     AlertTriangle,
    iconCls:  'text-amber-400',
    titleCls: 'text-amber-300',
    msgCls:   'text-amber-200/70',
    badgeCls: 'bg-amber-500 text-white',
  },
  info: {
    bg:       'bg-blue-500/8 hover:bg-blue-500/12',
    border:   'border-blue-500/25',
    icon:     Info,
    iconCls:  'text-blue-400',
    titleCls: 'text-blue-300',
    msgCls:   'text-blue-200/70',
    badgeCls: 'bg-blue-500 text-white',
  },
};

// ─── Single alert row ────────────────────────────────────────────────────────

function AlertRow({ alert, onDismiss }: { alert: SpendingAlert; onDismiss: (id: string) => void }) {
  const s    = SEVERITY_STYLES[alert.severity];
  const Icon = s.icon;

  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 ${s.bg} ${s.border}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${s.iconCls}`} />

      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold leading-snug ${s.titleCls}`}>
          {alert.title}
        </p>
        <p className={`mt-0.5 text-[11px] leading-relaxed ${s.msgCls}`}>
          {alert.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(alert.id)}
        className="flex-shrink-0 rounded-lg p-1 text-slate-600 opacity-0 transition-all hover:bg-slate-700/50 hover:text-slate-400 group-hover:opacity-100"
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AlertBanner({ alerts, onDismiss, onDismissAll }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (alerts.length === 0) return null;

  // Sort: danger first, then warning, then info
  const sorted = [...alerts].sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const dangerCount  = alerts.filter(a => a.severity === 'danger').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const shown        = expanded ? sorted : sorted.slice(0, 1);

  // Header accent color driven by most severe alert
  const topSeverity = sorted[0]?.severity ?? 'info';
  const accentColor = topSeverity === 'danger' ? '#ef4444' : topSeverity === 'warning' ? '#f59e0b' : '#3b82f6';

  return (
    <div className="mb-4 animate-fade-in-up overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60 sm:mb-5"
      style={{ animationDelay: '0.05s' }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Smart Alerts</span>

          {/* Severity badges */}
          <div className="flex items-center gap-1">
            {dangerCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {dangerCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {warningCount} warning
              </span>
            )}
            {!dangerCount && !warningCount && (
              <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400">
                {alerts.length} info
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {alerts.length > 1 && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-800/50 hover:text-slate-400"
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3" /> Show less</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> +{alerts.length - 1} more</>
              )}
            </button>
          )}
          <button
            onClick={onDismissAll}
            className="rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-800/50 hover:text-slate-400"
          >
            Dismiss all
          </button>
        </div>
      </div>

      {/* Alert rows */}
      <div className="space-y-1.5 px-3 pb-3">
        {shown.map(a => (
          <AlertRow key={a.id} alert={a} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
