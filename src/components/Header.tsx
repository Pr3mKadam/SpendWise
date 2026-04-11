import { Bell, Search, ChevronRight } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  activeView:            AppView;
  unreadCount:           number;
  onToggleNotifications: () => void;
  currency:              string;
  currentBalance:        number;
}

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Overview',
  analytics: 'Statistics',
  budget:    'Budget',
  goals:     'Goals',
  history:   'Transactions',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Header({ activeView, unreadCount, onToggleNotifications }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 shrink-0"
      style={{
        height: '70px',
        background: 'var(--surface-card)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      {/* Left — Greeting */}
      <div className="flex items-center gap-3">
        {/* Breadcrumb for non-dashboard pages */}
        {activeView !== 'dashboard' && (
          <>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Dashboard
            </span>
            <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
          </>
        )}
        <div>
          <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {activeView === 'dashboard' ? `${getGreeting()}, User` : VIEW_TITLES[activeView]}
          </div>
          {activeView === 'dashboard' && (
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {dateStr}
            </div>
          )}
        </div>
      </div>

      {/* Right — Search & Bell */}
      <div className="flex items-center gap-3">
        {/* Search box */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-input)', minWidth: '180px' }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>
            Search here
          </span>
        </div>

        {/* Notification bell */}
        <button
          onClick={onToggleNotifications}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ background: 'var(--surface-input)' }}
          title="Notifications"
        >
          <Bell size={17} style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold text-white px-1"
              style={{ background: 'var(--red)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm shrink-0"
          style={{ background: 'var(--teal)', fontFamily: 'var(--font-manrope)' }}
        >
          U
        </div>
      </div>
    </header>
  );
}
