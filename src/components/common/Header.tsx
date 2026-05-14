import React from 'react';
import { Bell, ChevronRight, Moon, Sun, User, Search, Eye, EyeOff } from 'lucide-react';
import { AppView } from '../../types';
import { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { MasterMic } from './MasterMic';

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
  isPrivacyEnabled?:     boolean;
  onTogglePrivacy?:      () => void;
  onExport?:             () => void;
  setSearchQuery?:       (q: string) => void;
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
  isPrivacyEnabled,
  onTogglePrivacy,
  onExport,
  setSearchQuery,
}: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const displayName = config?.name?.trim() || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  /* ── helpers for responsive styles ── */
  const isMobileGlassBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.13)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.18)',
    cursor: 'pointer',
  };

  return (
    <header
      className="sticky top-0 z-30 shrink-0 overflow-hidden"
      style={{
        height: 'calc(70px + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* ─── MOBILE background: rich navy-to-teal gradient with curve ─── */}
      <div
        className="md:hidden absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(120deg, #0f1c35 0%, #0d2d3f 55%, #0b3d3a 100%)',
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      />
      {/* Decorative shimmer line for mobile */}
      <div
        className="md:hidden absolute bottom-0 left-1/4 right-1/4 h-[3px] pointer-events-none rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)',
          opacity: 0.6,
          filter: 'blur(1px)'
        }}
      />
      {/* Subtle left-side teal glow orb (mobile only) */}
      <div
        className="md:hidden absolute -left-10 top-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)',
        }}
      />
      {/* Subtle right-side glow orb (mobile only) */}
      <div
        className="md:hidden absolute -right-10 bottom-0 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        }}
      />

      {/* ─── DESKTOP background: plain white/card ─── */}
      <div
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--surface-card)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
        }}
      />

      {/* ─── Content row ─── */}
      <div className="relative flex items-center justify-between h-full px-3 md:px-6 lg:px-8">

        {/* Left — Greeting / Page Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {activeView !== 'dashboard' && (
            <>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                }}
                aria-label="Go to Dashboard"
                style={{
                  fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500,
                  color: 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                Home
              </button>
              <ChevronRight size={12} style={{ color: 'var(--text-dim)' }} />
            </>
          )}
          <div className="min-w-0">
            {/* Mobile: white bold text - Simplified for Dashboard to save space */}
            <div
              className="md:hidden truncate"
              style={{
                fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '16px',
                color: '#ffffff',
                lineHeight: 1.2,
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
              }}
            >
              {activeView === 'dashboard'
                ? `Hi, ${displayName.split(' ')[0]} 👋`
                : VIEW_TITLES[activeView] ?? activeView}
            </div>
            {/* Desktop: themed text */}
            <div
              className="hidden md:block"
              style={{
                fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '18px',
                color: 'var(--text-primary)', lineHeight: 1.2,
              }}
            >
              {activeView === 'dashboard'
                ? `${getGreeting()}, ${displayName} 👋`
                : VIEW_TITLES[activeView] ?? activeView}
            </div>

            {activeView === 'dashboard' && (
              <>
                {/* Mobile date */}
                <div
                  className="md:hidden"
                  style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}
                >
                  {dateStr}
                </div>
                {/* Desktop date */}
                <div
                  className="hidden md:block"
                  style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}
                >
                  {dateStr}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right — Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Theme toggle */}
          <button
            onClick={() => {
              onToggleTheme();
            }}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            /* Mobile style applied via wrapper; desktop overrides inline */
            style={{ padding: 0, border: 'none' }}
          >
            {/* Mobile glass */}
            <span className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl" style={isMobileGlassBtn}>
              {theme === 'dark' ? <Sun size={16} style={{ color: 'rgba(255,255,255,0.85)' }} /> : <Moon size={16} style={{ color: 'rgba(255,255,255,0.85)' }} />}
            </span>
            {/* Desktop plain */}
            <span className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'var(--surface-input)' }}>
              {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--text-secondary)' }} /> : <Moon size={16} style={{ color: 'var(--text-secondary)' }} />}
            </span>
          </button>

          {/* Privacy toggle */}
          {onTogglePrivacy && (
            <button
              onClick={() => {
                onTogglePrivacy();
              }}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
              aria-label={isPrivacyEnabled ? 'Disable privacy mode' : 'Enable privacy mode'}
              style={{ padding: 0, border: 'none' }}
            >
              <span className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl" style={isMobileGlassBtn}>
                {isPrivacyEnabled ? <EyeOff size={16} style={{ color: 'rgba(255,255,255,0.85)' }} /> : <Eye size={16} style={{ color: 'rgba(255,255,255,0.85)' }} />}
              </span>
              <span className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'var(--surface-input)' }}>
                {isPrivacyEnabled ? <EyeOff size={16} style={{ color: 'var(--text-secondary)' }} /> : <Eye size={16} style={{ color: 'var(--text-secondary)' }} />}
              </span>
            </button>
          )}

          {/* Global Search */}
          {onOpenSearch && (
            <button
              onClick={() => {
                onOpenSearch?.();
              }}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
              aria-label="Search transactions and settings (Cmd+K)"
              style={{ padding: 0, border: 'none' }}
            >
              <span className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl" style={isMobileGlassBtn}>
                <Search size={16} style={{ color: 'rgba(255,255,255,0.85)' }} />
              </span>
              <span className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'var(--surface-input)' }}>
                <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              </span>
            </button>
          )}

          {/* Master Voice Mic */}
          {onExport && (
            <MasterMic 
              variant="header"
              navigate={onNavigate}
              onExport={onExport}
              toggleTheme={onToggleTheme}
              setSearchQuery={setSearchQuery}
            />
          )}

          {/* Notification bell */}
          <button
            onClick={() => {
              onToggleNotifications();
            }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
            aria-label={`View notifications, ${unreadCount} unread`}
            style={{ padding: 0, border: 'none' }}
          >
            <span className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl" style={isMobileGlassBtn}>
              <Bell size={16} style={{ color: 'rgba(255,255,255,0.85)' }} />
            </span>
            <span className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'var(--surface-input)' }}>
              <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
            </span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold text-white px-1 z-10"
                style={{ background: 'var(--red)', boxShadow: '0 2px 6px rgba(239,68,68,0.6)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={() => {
              onNavigate('profile');
            }}
            aria-label="View Profile and Settings"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm shrink-0 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              fontFamily: 'var(--font-manrope)',
              /* Mobile: white ring; desktop: teal glow */
              boxShadow: activeView === 'profile'
                ? '0 0 0 2.5px rgba(255,255,255,0.45), 0 4px 14px rgba(20,184,166,0.55)'
                : '0 0 0 2px rgba(255,255,255,0.25), 0 3px 10px rgba(20,184,166,0.4)',
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
      </div>
    </header>
  );
}
