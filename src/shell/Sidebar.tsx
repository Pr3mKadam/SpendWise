import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Target, Settings, LogOut,
  PieChart, Landmark, TrendingUp, RefreshCw, Users, Shield, Bot, FileText,
  X, GraduationCap, DownloadCloud, Trophy, Sun, Moon, Plus, MoreHorizontal,
  History, Wallet, Coins, SmartphoneNfc
} from 'lucide-react';
import { AppView } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/lib/haptic';
import { useStore } from '@/store';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
  showInstall?:    boolean;
  onInstall?:      () => void;
  config:          SpendWiseConfig | null;
  theme?:          'light' | 'dark';
  onToggleTheme?:  () => void;
  onOpenQuickAdd?: () => void; // NEW — wired to FAB
}

// ─── Nav item definitions (unchanged from original) ───────────────────────────

const ALL_NAV_ITEMS = [
  { id: 'dashboard'     as AppView, label: 'Overview',      icon: LayoutDashboard },
  { id: 'analytics'     as AppView, label: 'Statistics',    icon: PieChart },
  { id: 'budget'        as AppView, label: 'Budget',        icon: Target },
  { id: 'history'       as AppView, label: 'Transactions',  icon: ArrowLeftRight },
  { id: 'goals'         as AppView, label: 'Goals',         icon: CreditCard },
  { id: 'portfolio'     as AppView, label: 'Net Worth',     icon: TrendingUp },
  { id: 'subscriptions' as AppView, label: 'Subscriptions', icon: RefreshCw },
  { id: 'shared'        as AppView, label: 'Shared',        icon: Users },
  { id: 'sync'          as AppView, label: 'UPI Sync',      icon: SmartphoneNfc },
  { id: 'advisor'       as AppView, label: 'AI Advisor',    icon: Bot },
  { id: 'education'     as AppView, label: 'Learn',         icon: GraduationCap },
  { id: 'quests'        as AppView, label: 'Quests',        icon: Trophy },
  { id: 'parental'      as AppView, label: 'Family',        icon: Shield },
  { id: 'reports'       as AppView, label: 'Reports',       icon: FileText },
];

// Items always in the mobile bottom nav (4 slots + FAB)
const MOBILE_BOTTOM_IDS = ['dashboard', 'history', 'analytics', 'budget'];

// ─── Desktop: icon-only sidebar item ─────────────────────────────────────────

interface IconNavItemProps {
  id: AppView;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

function IconNavItem({ id, label, icon: Icon, isActive, badge, onClick }: IconNavItemProps) {
  const [showTip, setShowTip] = useState(false);
  const [tipTop, setTipTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipTimer = useRef<any>(null);

  const handleEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTipTop(rect.top + rect.height / 2);
    }
    tipTimer.current = setTimeout(() => setShowTip(true), 120);
  };
  const handleLeave = () => {
    clearTimeout(tipTimer.current);
    setShowTip(false);
  };

  return (
    <div className="relative flex items-center" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        ref={buttonRef}
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)]"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)'
            : 'transparent',
          color: isActive ? '#ffffff' : 'var(--sidebar-text)',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--sidebar-text)';
          }
        }}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        {/* Badge */}
        {!!badge && badge > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-0.5"
            style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="fixed z-[100] pointer-events-none whitespace-nowrap"
            style={{
              left: '68px',
              top: `${tipTop}px`,
              transform: 'translateY(-50%)',
            }}
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold shadow-2xl relative"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {/* Tooltip Arrow */}
              <div 
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45"
                style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              />
              <span className="relative z-10">{label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop separator ────────────────────────────────────────────────────────

function Sep({ style }: { style?: React.CSSProperties }) {
  return <div className="w-7 h-px mx-auto" style={{ background: 'rgba(255,255,255,0.08)', ...style }} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Sidebar({
  activeView, onViewChange, overBudgetCount, config,
  showInstall, onInstall, theme, onToggleTheme, onOpenQuickAdd,
}: SidebarProps) {
  const { signOut } = useAuth();
  const store = useStore();
  const settings = store.parentalState;
  const isKidMode = settings.isTeenMode;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userRole = config?.userRole || 'professional';

  // Sign Out Tooltip state
  const [showSignOutTip, setShowSignOutTip] = useState(false);
  const [signOutTipTop, setSignOutTipTop] = useState(0);
  const signOutRef = useRef<HTMLButtonElement>(null);
  const signOutTimer = useRef<any>(null);

  // Close drawer on view change
  useEffect(() => { setIsDrawerOpen(false); }, [activeView]);

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  // Filter nav items (same logic as original)
  const navItems = ALL_NAV_ITEMS.filter(item => {
    if (isKidMode) {
      if (item.id === 'sync') return false;
      if (item.id === 'analytics' && settings.hideAnalytics) return false;
    }
    if (userRole === 'student') {
      if (['portfolio', 'sync', 'reports'].includes(item.id)) return false;
    }
    if (userRole === 'business' || userRole === 'professional') {
      if (item.id === 'education') return false;
    }
    return true;
  });

  // Desktop groups
  const coreItems   = navItems.filter(i => ['dashboard', 'analytics', 'budget', 'history', 'goals'].includes(i.id));
  const wealthItems = navItems.filter(i => ['portfolio', 'subscriptions', 'shared', 'sync'].includes(i.id));
  const toolItems   = navItems.filter(i => ['advisor', 'education', 'quests', 'parental', 'reports'].includes(i.id));

  // Mobile: 4 bottom items + drawer for the rest
  const mobileBottomItems = navItems.filter(i => MOBILE_BOTTOM_IDS.includes(i.id)).slice(0, 4);
  const mobileDrawerItems = navItems.filter(i => !MOBILE_BOTTOM_IDS.includes(i.id));

  const navigate = (view: AppView) => {
    haptic.light();
    onViewChange(view);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/*
       * ════════════════════════════════════════════════════════════════
       * DESKTOP — icon-only sidebar (52px wide, was 260px)
       * ════════════════════════════════════════════════════════════════
       */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 items-center py-4 overflow-y-auto hide-scrollbar"
        style={{
          width: '56px',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo mark */}
        <div className="mb-4 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' }}
            title="SpendWise"
          >
            <Coins size={16} className="text-white" />
          </div>
        </div>

        <Sep />

        {/* Core group */}
        <nav className="flex flex-col items-center gap-1 mt-2" role="navigation" aria-label="Core navigation">
          {coreItems.map(item => (
            <IconNavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeView === item.id}
              badge={item.id === 'budget' ? overBudgetCount : 0}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        <Sep style={{ marginTop: '8px', marginBottom: '8px' }} />

        {/* Wealth group */}
        <nav className="flex flex-col items-center gap-1" role="navigation" aria-label="Wealth navigation">
          {wealthItems.map(item => (
            <IconNavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeView === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        <Sep style={{ marginTop: '8px', marginBottom: '8px' }} />

        {/* Tools group */}
        <nav className="flex flex-col items-center gap-1" role="navigation" aria-label="Tools navigation">
          {toolItems.map(item => (
            <IconNavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeView === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: theme + profile + signout */}
        <div className="flex flex-col items-center gap-1">
          {showInstall && (
            <IconNavItem
              id={'profile' as AppView}
              label="Install SpendWise"
              icon={DownloadCloud}
              isActive={false}
              onClick={() => { haptic.medium(); onInstall?.(); }}
            />
          )}
          <IconNavItem
            id={'profile' as AppView}
            label="Profile & Settings"
            icon={Settings}
            isActive={activeView === 'profile'}
            onClick={() => navigate('profile')}
          />
          <div 
            className="relative flex items-center" 
            onMouseEnter={() => {
              if (signOutRef.current) {
                const rect = signOutRef.current.getBoundingClientRect();
                setSignOutTipTop(rect.top + rect.height / 2);
              }
              signOutTimer.current = setTimeout(() => setShowSignOutTip(true), 120);
            }} 
            onMouseLeave={() => {
              clearTimeout(signOutTimer.current);
              setShowSignOutTip(false);
            }}
          >
            <button
              ref={signOutRef}
              onClick={() => { haptic.light(); signOut(); }}
              aria-label="Sign out"
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: 'var(--sidebar-text)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--sidebar-text)';
              }}
            >
              <LogOut size={18} strokeWidth={2} />
            </button>

            {/* Tooltip for Sign Out */}
            <AnimatePresence>
              {showSignOutTip && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  className="fixed z-[100] pointer-events-none whitespace-nowrap"
                  style={{
                    left: '68px',
                    top: `${signOutTipTop}px`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div
                    className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold shadow-2xl relative"
                    style={{
                      background: 'rgba(239, 68, 68, 0.95)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {/* Tooltip Arrow */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45"
                      style={{
                        background: 'rgba(239, 68, 68, 0.95)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    />
                    <span className="relative z-10">Sign Out</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Desktop spacer — keeps main content from sitting under sidebar */}
      <div className="hidden md:block shrink-0" style={{ width: '56px' }} />


      {/*
       * ════════════════════════════════════════════════════════════════
       * MOBILE — bottom nav (4 items + centered FAB + More)
       * ════════════════════════════════════════════════════════════════
       */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-1 h-[60px]">

          {/* Left 2 items */}
          {mobileBottomItems.slice(0, 2).map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                aria-selected={isActive}
                className="relative flex flex-col items-center justify-center gap-[3px] min-w-[52px] h-full outline-none"
                style={{ color: isActive ? 'var(--teal)' : 'var(--sidebar-text)' }}
              >
                {/* Active pill background — CSS only, no layoutId */}
                <div
                  className="absolute inset-x-1 inset-y-2 rounded-xl transition-opacity duration-200"
                  style={{
                    background: 'var(--teal)',
                    opacity: isActive ? 0.12 : 0,
                  }}
                />
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-inter)', lineHeight: 1 }}>
                  {item.label}
                </span>
                {item.id === 'budget' && overBudgetCount > 0 && (
                  <span
                    className="absolute top-1.5 right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-0.5"
                    style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
                  >
                    {overBudgetCount > 9 ? '9+' : overBudgetCount}
                  </span>
                )}
              </button>
            );
          })}

          {/*
           * Centre FAB — elevated, always above keyboard via Visual Viewport
           * The CSS variable --kb-inset is set by MainShell.tsx (see instructions)
           */}
          <button
            onClick={() => { haptic.medium(); onOpenQuickAdd?.(); }}
            aria-label="Add transaction"
            className="relative flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
            style={{
              width: '52px',
              height: '52px',
              marginTop: '-22px',
              background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)',
              boxShadow: '0 4px 16px rgba(20,184,166,0.4)',
              border: '3px solid var(--sidebar-bg)',
            }}
          >
            <Plus size={22} className="text-white" strokeWidth={2.5} />
          </button>

          {/* Right 2 items */}
          {mobileBottomItems.slice(2, 4).map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                aria-selected={isActive}
                className="relative flex flex-col items-center justify-center gap-[3px] min-w-[52px] h-full outline-none"
                style={{ color: isActive ? 'var(--teal)' : 'var(--sidebar-text)' }}
              >
                <div
                  className="absolute inset-x-1 inset-y-2 rounded-xl transition-opacity duration-200"
                  style={{ background: 'var(--teal)', opacity: isActive ? 0.12 : 0 }}
                />
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-inter)', lineHeight: 1 }}>
                  {item.label}
                </span>
                {item.id === 'budget' && overBudgetCount > 0 && (
                  <span
                    className="absolute top-1.5 right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-0.5"
                    style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
                  >
                    {overBudgetCount > 9 ? '9+' : overBudgetCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => { haptic.light(); setIsDrawerOpen(true); }}
            aria-label="More features"
            aria-expanded={isDrawerOpen}
            className="relative flex flex-col items-center justify-center gap-[3px] min-w-[52px] h-full outline-none"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <MoreHorizontal size={20} strokeWidth={2} />
            <span style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-inter)', lineHeight: 1 }}>More</span>
          </button>

        </div>
      </div>


      {/*
       * ════════════════════════════════════════════════════════════════
       * MOBILE DRAWER — slides up from bottom, shows ALL remaining views
       * ════════════════════════════════════════════════════════════════
       */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[70] md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative rounded-t-[28px] overflow-hidden flex flex-col"
              style={{
                background: 'var(--sidebar-bg)',
                maxHeight: '80vh',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Header row */}
              <div className="flex items-center justify-between px-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '18px', color: '#fff' }}>
                  Spend<span style={{ color: 'var(--teal)' }}>Wise</span>
                </span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* ALL remaining nav items — shown in a 2-column grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Quick actions row */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {mobileDrawerItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all min-h-[52px]"
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)'
                            : 'rgba(255,255,255,0.05)',
                          color: isActive ? '#fff' : 'var(--sidebar-text)',
                          fontFamily: 'var(--font-inter)',
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 500,
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                        {item.id === 'budget' && overBudgetCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-bold px-1"
                            style={{ background: 'var(--red, #ef4444)', color: '#fff' }}>
                            {overBudgetCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Theme + settings row */}
                <div className="flex flex-col gap-2">
                  {/* Theme toggle */}
                  <button
                    onClick={() => { haptic.medium(); onToggleTheme?.(); }}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl min-h-[52px]"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '14px',
                      fontWeight: 500,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    {/* Toggle pill */}
                    <div className="w-10 h-5 rounded-full relative" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="absolute top-1 w-3 h-3 rounded-full transition-all"
                        style={{
                          background: 'var(--teal)',
                          [theme === 'dark' ? 'right' : 'left']: '4px',
                        }}
                      />
                    </div>
                  </button>

                  {showInstall && (
                    <button
                      onClick={() => { haptic.medium(); onInstall?.(); setIsDrawerOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl min-h-[52px]"
                      style={{
                        background: 'var(--teal)',
                        color: '#fff',
                        fontFamily: 'var(--font-inter)',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      <DownloadCloud size={18} />
                      <span>Install App</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate('profile')}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl min-h-[52px]"
                    style={{
                      background: activeView === 'profile'
                        ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)'
                        : 'rgba(255,255,255,0.05)',
                      color: activeView === 'profile' ? '#fff' : 'var(--sidebar-text)',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '14px',
                      fontWeight: activeView === 'profile' ? 600 : 500,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Settings size={18} strokeWidth={2} />
                    <span>Profile & Settings</span>
                  </button>

                  <button
                    onClick={() => { haptic.light(); signOut(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl min-h-[52px]"
                    style={{
                      color: 'var(--teal)',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '14px',
                      fontWeight: 500,
                      border: '1px solid rgba(20,184,166,0.2)',
                    }}
                  >
                    <LogOut size={18} strokeWidth={2} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
