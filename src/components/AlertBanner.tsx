import { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { SpendingAlert, AlertSeverity } from '../types';

interface AlertBannerProps {
  alerts:       SpendingAlert[];
  onDismiss:    (id: string) => void;
  onDismissAll: () => void;
}

const SEVERITY_STYLES: Record<AlertSeverity, {
  bg: string; border: string; icon: typeof AlertTriangle;
  iconColor: string; titleColor: string; msgColor: string;
}> = {
  danger: {
    bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.2)',
    icon: ShieldAlert,    iconColor: 'var(--red)',
    titleColor: 'var(--red)', msgColor: 'var(--text-secondary)',
  },
  warning: {
    bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.2)',
    icon: AlertTriangle,     iconColor: 'var(--amber)',
    titleColor: 'var(--amber)', msgColor: 'var(--text-secondary)',
  },
  info: {
    bg: 'var(--teal-dim)', border: 'var(--teal-glow)',
    icon: Info,            iconColor: 'var(--teal)',
    titleColor: 'var(--teal)', msgColor: 'var(--text-secondary)',
  },
};

function AlertRow({ alert, onDismiss }: { alert: SpendingAlert; onDismiss: (id: string) => void }) {
  const s    = SEVERITY_STYLES[alert.severity];
  const Icon = s.icon;
  return (
    <div
      className="group flex items-start gap-3 rounded-xl px-4 py-3 mb-2"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <Icon size={16} style={{ color: s.iconColor, flexShrink: 0, marginTop: '2px' }} />
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: s.titleColor }}>{alert.title}</p>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: s.msgColor, marginTop: '2px', lineHeight: 1.5 }}>{alert.message}</p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function AlertBanner({ alerts, onDismiss, onDismissAll }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(false);
  if (alerts.length === 0) return null;

  const sorted  = [...alerts].sort((a, b) => ({ danger: 0, warning: 1, info: 2 }[a.severity] - { danger: 0, warning: 1, info: 2 }[b.severity]));
  const shown   = expanded ? sorted : sorted.slice(0, 1);
  const danger  = alerts.filter(a => a.severity === 'danger').length;
  const warning = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="mb-5 view-enter">
      {/* Header row */}
      <div className="flex items-center justify-between py-2 px-1 mb-2">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Smart Alerts
          </span>
          {danger > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: 'var(--red)', fontFamily: 'var(--font-inter)' }}>
              {danger} critical
            </span>
          )}
          {warning > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'var(--amber-dim)', color: 'var(--amber)', fontFamily: 'var(--font-inter)' }}>
              {warning} warning
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 1 && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--teal)', fontFamily: 'var(--font-inter)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{alerts.length - 1} more</>}
            </button>
          )}
          <button
            onClick={onDismissAll}
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Dismiss all
          </button>
        </div>
      </div>
      {shown.map(a => <AlertRow key={a.id} alert={a} onDismiss={onDismiss} />)}
    </div>
  );
}
