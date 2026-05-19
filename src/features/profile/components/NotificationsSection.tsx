import { Bell } from 'lucide-react';

interface NotificationsSectionProps {
  notifPermission:       NotificationPermission;
  onRequestPermission:   () => void;
  onTestNotification:    () => void;
}

export function NotificationsSection({ notifPermission, onRequestPermission, onTestNotification }: NotificationsSectionProps) {
  return (
    <div className="card border border-[var(--teal)]/20 shadow-sm shadow-[var(--teal)]/5">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">System Notifications</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Stay updated with budget alerts and goal progress.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
          <Bell size={20} />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
          <div>
            <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Push Notifications</h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {notifPermission === 'granted'
                ? 'Enabled and active'
                : notifPermission === 'denied'
                  ? 'Disabled in system settings'
                  : 'Permission requested on demand'}
            </p>
          </div>
          {notifPermission === 'default' && (
            <button onClick={onRequestPermission} className="px-4 py-2 bg-[var(--teal)] text-white text-xs font-bold rounded-lg transition-all active:scale-95">
              Enable
            </button>
          )}
          {notifPermission === 'granted' && (
            <button onClick={onTestNotification} className="px-4 py-2 bg-[var(--surface-card)] text-[var(--teal)] border border-[var(--teal)]/30 text-xs font-bold rounded-lg transition-all active:scale-95">
              Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
