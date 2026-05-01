import { Bell, ChevronRight, Moon, Sun, User, Search } from 'lucide-react';
import { AppView } from '../types';
import { SpendWiseConfig } from './OnboardingModal';

interface HeaderProps {
  activeView:            AppView;
  unreadCount:           number;
  onToggleNotifications: () => void;
  onNavigate:            (view: AppView) => void;
  currency:              string;
  currentBalance:        number;
  theme:                 'light' | 'dark';
  onToggleTheme:         () => void;
  config?:               SpendWiseConfig | null;
  onOpenSearch?:         () => void;
}

const VIEW_TITLES: Partial<Record<AppView, string>> = {
  dashboard:     'Overview',
  analytics:     'Statistics',
  budget:        'Budget',
  goals:         'Goals',
  shared:        'Shared money',
  history:       'Transactions',
  sync:          'Bank & UPI Sync',
  profile:       'Profile & Settings',
  portfolio:     'Net worth',
  subscriptions: 'Subscriptions',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Header({
  activeView,
  unreadCount,
  onToggleNotifications,
  onNavigate,
  theme,
  onToggleTheme,
  config,
  onOpenSearch,
}: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const displayName = config?.name?.trim() || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 shrink-0"
      style={{
        height: '70px',
        background: 'var(--surface-card)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      {/* Left — Greeting / Page Title */}
      <div className="flex items-center gap-2">
        {activeView !== 'dashboard' && (
          <>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Home
            </button>
            <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
          </>
        )}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {activeView === 'dashboard'
              ? `${getGreeting()}, ${displayName} 👋`
              : VIEW_TITLES[activeView] ?? activeView}
          </div>
          {activeView === 'dashboard' && (
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {dateStr}
            </div>
          )}
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
          style={{ background: 'var(--surface-input)', border: 'none', cursor: 'pointer' }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={16} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Moon size={16} style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>

        {/* Global Search */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
            style={{ background: 'var(--surface-input)', border: 'none', cursor: 'pointer' }}
            title="Search (Cmd+K)"
          >
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}

        {/* Notification bell */}
        <button
          onClick={onToggleNotifications}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
          style={{ background: 'var(--surface-input)', border: 'none', cursor: 'pointer' }}
          title="Notifications"
        >
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold text-white px-1"
              style={{ background: 'var(--red)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar — opens Profile */}
        <button
          onClick={() => onNavigate('profile')}
          title="Profile & Settings"
          className="group relative flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm shrink-0 transition-all hover:scale-105 hover:ring-2 hover:ring-offset-1"
          style={{
            background: activeView === 'profile'
              ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)'
              : 'var(--teal)',
            fontFamily: 'var(--font-manrope)',
            boxShadow: activeView === 'profile' ? '0 0 0 3px rgba(20,184,166,0.3)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {initials || <User size={16} />}

          {/* Tooltip */}
          <span
            className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
            style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)' }}
          >
            {displayName} · Settings
          </span>
        </button>

      </div>
    </header>
  );
}
