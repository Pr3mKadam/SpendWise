import { useEffect, useRef } from 'react';
import { X, Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { AppNotification, AlertSeverity, AppView } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  unreadCount:   number;
  isOpen:        boolean;
  onClose:       () => void;
  onMarkRead:    (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate:    (view: AppView) => void;
  cloudMode?:    boolean;
}

// ─── Severity accent ──────────────────────────────────────────────────────────

function severityAccent(s: AlertSeverity): string {
  if (s === 'danger')  return 'border-l-red-500/70';
  if (s === 'warning') return 'border-l-amber-500/70';
  return 'border-l-blue-500/50';
}

function severityBg(s: AlertSeverity): string {
  if (s === 'danger')  return 'bg-red-500/5';
  if (s === 'warning') return 'bg-amber-500/5';
  return 'bg-blue-500/5';
}

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({
  notif,
  onMarkRead,
  onNavigate,
  onClose,
}: {
  notif:      AppNotification;
  onMarkRead: (id: string) => void;
  onNavigate: (v: AppView) => void;
  onClose:    () => void;
}) {
  const handleClick = () => {
    onMarkRead(notif.id);
    if (notif.link) {
      onNavigate(notif.link);
      onClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex cursor-pointer items-start gap-3 border-l-2 px-4 py-3.5 transition-all duration-200 hover:bg-slate-800/30 ${
        severityAccent(notif.severity)
      } ${notif.read ? 'opacity-60' : ''} ${severityBg(notif.severity)}`}
    >
      {/* Emoji icon */}
      <span className="mt-0.5 flex-shrink-0 text-base leading-none">{notif.icon}</span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug ${notif.read ? 'text-slate-400' : 'text-slate-200'}`}>
            {notif.title}
          </p>
          <span className="flex-shrink-0 text-[10px] text-slate-600">{relativeTime(notif.timestamp)}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{notif.message}</p>

        {notif.link && (
          <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100">
            <ExternalLink className="h-2.5 w-2.5" />
            Go to {notif.link.charAt(0).toUpperCase() + notif.link.slice(1)}
          </span>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationCenter({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  cloudMode = false,
}: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay so the open-click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const grouped = {
    unread: notifications.filter(n => !n.read),
    read:   notifications.filter(n => n.read),
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-4 top-[72px] z-[70] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl animate-fade-in-up max-h-[calc(100vh-100px)]"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/25">
              <Bell className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              <p className="text-[10px] text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 transition hover:text-slate-300"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-800 hover:text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="mb-3 text-4xl">🔔</span>
              <p className="text-sm font-medium text-slate-500">No notifications</p>
              <p className="mt-1 text-xs text-slate-600">You're all caught up!</p>
            </div>
          ) : (
            <>
              {/* Unread section */}
              {grouped.unread.length > 0 && (
                <>
                  <div className="sticky top-0 bg-slate-900/95 px-4 py-2 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      New · {grouped.unread.length}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {grouped.unread.map(n => (
                      <NotifRow
                        key={n.id}
                        notif={n}
                        onMarkRead={onMarkRead}
                        onNavigate={onNavigate}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Read section */}
              {grouped.read.length > 0 && (
                <>
                  <div className="sticky top-0 bg-slate-900/95 px-4 py-2 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Earlier · {grouped.read.length}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {grouped.read.map(n => (
                      <NotifRow
                        key={n.id}
                        notif={n}
                        onMarkRead={onMarkRead}
                        onNavigate={onNavigate}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-800/60 px-4 py-3 text-center">
          <p className="text-[10px] text-slate-600">
            {cloudMode
              ? 'Alerts reset when you reload · Synced with your account'
              : 'Alerts reset when you reload · Stored on this device only'}
          </p>
        </div>
      </div>
    </>
  );
}
