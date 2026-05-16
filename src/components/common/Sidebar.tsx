import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CreditCard, ArrowLeftRight, Target, Settings, LogOut, PieChart, Landmark, TrendingUp, RefreshCw, Users, Shield, Bot, FileText, Menu, X, GraduationCap, DownloadCloud, Trophy, Sun, Moon } from 'lucide-react';
import { AppView } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { haptic } from '../../lib/haptic';

import { useStore } from '../../store';

import { SpendWiseConfig, UserRole } from '../features/onboarding/OnboardingModal';

interface SidebarProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
  showInstall?:    boolean;
  onInstall?:      () => void;
  config:          SpendWiseConfig | null;
  theme?:          'light' | 'dark';
  onToggleTheme?:  () => void;
}

const ALL_NAV_ITEMS = [
  { id: 'dashboard'     as AppView, label: 'Overview',         icon: LayoutDashboard },
  { id: 'analytics'     as AppView, label: 'Statistics',       icon: PieChart },
  { id: 'budget'        as AppView, label: 'Budget',           icon: Target },
  { id: 'history'       as AppView, label: 'Transactions',     icon: ArrowLeftRight },
  { id: 'goals'         as AppView, label: 'Goals',            icon: CreditCard },
  { id: 'portfolio'     as AppView, label: 'Net Worth',        icon: TrendingUp },
  { id: 'subscriptions' as AppView, label: 'Subscriptions',    icon: RefreshCw },
  { id: 'shared'        as AppView, label: 'Shared',           icon: Users },
  { id: 'sync'          as AppView, label: 'UPI Sync',         icon: Landmark },
  { id: 'advisor'       as AppView, label: 'AI Advisor',       icon: Bot },
  { id: 'education'     as AppView, label: 'Learn',            icon: GraduationCap },
  { id: 'quests'        as AppView, label: 'Quests',           icon: Trophy },
  { id: 'parental'      as AppView, label: 'Family',           icon: Shield },
  { id: 'reports'       as AppView, label: 'Reports',          icon: FileText },
];

export default function Sidebar({ activeView, onViewChange, overBudgetCount, config, showInstall, onInstall, theme, onToggleTheme }: SidebarProps) {
  const { signOut } = useAuth();
  const store = useStore();
  const settings = store.parentalState;
  const isKidMode = settings.isTeenMode;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeView]);

  // Lock body scroll when mobile menu is open to prevent background scrolling and fixed height issues on mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const userRole = config?.userRole || 'professional';

  const navItems = ALL_NAV_ITEMS.filter(item => {
    // Parental Kid Mode gating
    if (isKidMode) {
      if (item.id === 'sync') return false;
      if (item.id === 'analytics' && settings.hideAnalytics) return false;
    }

    // Role-based gating
    if (userRole === 'student') {
      // Students don't need high-end portfolio tracking or bank sync (as per audio)
      if (['portfolio', 'sync', 'reports'].includes(item.id)) return false;
    }
    
    if (userRole === 'business' || userRole === 'professional') {
      // Professionals/Business owners don't need basic 'Learn' tab focus
      if (item.id === 'education') return false;
    }

    return true;
  });

  // Mobile nav: show 4 core items + 1 menu button to reduce crowding
  const mobileNavItems = navItems.filter(item => 
    ['dashboard', 'history', 'budget', 'advisor'].includes(item.id)
  ).slice(0, 4);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40"
        style={{
          width: 'var(--sidebar-width, 240px)',
          background: 'var(--sidebar-bg)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center px-6 h-[70px] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--teal)] to-[#0d9488] flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Landmark size={16} className="text-white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 800,
              fontSize: '20px',
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              Spend<span className="text-[var(--teal)]">Wise</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main Desktop Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  haptic.light();
                  onViewChange(item.id);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewChange(item.id); } }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                role="menuitem"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left relative group ${isActive ? 'shadow-md shadow-teal-500/10' : ''}`}
                style={{
                  background: isActive ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
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
                <span>{item.label}</span>
                {item.id === 'budget' && overBudgetCount > 0 && (
                  <span
                    className="ml-auto flex items-center justify-center h-5 min-w-[20px] rounded-full text-[10px] font-bold px-1"
                    style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
                  >
                    {overBudgetCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-6 space-y-1">
          {showInstall && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic.medium();
                onInstall?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2"
              style={{ 
                background: 'rgba(20,184,166,0.1)', 
                color: 'var(--teal)',
                border: '1px dashed var(--teal)',
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <DownloadCloud size={18} className="animate-pulse" />
              <span>Install SpendWise</span>
            </motion.button>
          )}

          <button
            onClick={() => {
              haptic.light();
              onViewChange('profile');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${activeView === 'profile' ? 'shadow-md shadow-teal-500/10' : ''}`}
            style={{ 
              background: activeView === 'profile' ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' : 'transparent',
              color: activeView === 'profile' ? '#ffffff' : 'var(--sidebar-text)', 
              fontFamily: 'var(--font-inter)', 
              fontSize: '14px', 
              fontWeight: activeView === 'profile' ? 600 : 500 
            }}
            onMouseEnter={e => { 
              if (activeView !== 'profile') {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover)';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              } 
            }}
            onMouseLeave={e => { 
              if (activeView !== 'profile') {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              } 
            }}
          >
            <Settings size={18} strokeWidth={activeView === 'profile' ? 2.5 : 2} />
            <span>Profile & Settings</span>
          </button>



          
          <button
            onClick={() => {
              haptic.light();
              signOut();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mt-4 border border-teal-500/10"
            style={{ color: 'var(--teal)', fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(45,212,191,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            title="Sign Out"
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around px-2 pt-2 pb-safe"
        style={{ 
          background: 'var(--sidebar-bg)', 
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                haptic.light();
                onViewChange(item.id);
              }}
              className="relative flex flex-col items-center justify-center w-16 h-12 min-h-[48px] outline-none"
              style={{ color: isActive ? 'var(--teal)' : 'var(--sidebar-text)', transition: 'color 0.2s' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--teal)]/10 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-inter)' }}>{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--teal)] shadow-[0_0_8px_var(--teal)]"
                />
              )}

              {item.id === 'budget' && overBudgetCount > 0 && (
                <span
                  className="absolute top-0 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] px-1 font-bold"
                  style={{ background: 'var(--red)', color: '#fff', boxShadow: '0 2px 4px rgba(239,68,68,0.4)' }}
                >
                  {overBudgetCount > 9 ? '9+' : overBudgetCount}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => {
            haptic.light();
            setIsMobileMenuOpen(true);
          }}
          className="relative flex flex-col items-center justify-center w-16 h-12 min-h-[48px]"
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Menu size={20} strokeWidth={2} />
          <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-inter)' }}>Menu</span>
        </button>
      </div>

      {/* ── Mobile Drawer (Overlay) ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] md:hidden flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div 
            className="relative w-[280px] h-full flex flex-col animate-slide-in-right bg-[var(--sidebar-bg)] ml-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
              <span style={{
                fontFamily: 'var(--font-manrope)',
                fontWeight: 800,
                fontSize: '18px',
                color: '#ffffff',
              }}>
                Spend<span className="text-[var(--teal)]">Wise</span>
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white/5 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.filter(item => !['dashboard', 'history', 'budget', 'advisor', 'education', 'quests', 'reports', 'subscriptions', 'shared'].includes(item.id)).map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      haptic.light();
                      onViewChange(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left min-h-[44px]`}
                    style={{
                      background: isActive ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                    {item.id === 'budget' && overBudgetCount > 0 && (
                      <span
                        className="ml-auto flex items-center justify-center h-5 min-w-[20px] rounded-full text-[10px] font-bold px-1"
                        style={{ background: 'var(--red)', color: '#fff' }}
                      >
                        {overBudgetCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-white/10 space-y-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
              {/* Theme Toggle (Mobile Only) */}
              <button
                onClick={() => {
                  haptic.medium();
                  onToggleTheme?.();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl min-h-[48px] bg-white/5 mb-2"
                style={{ color: '#ffffff', fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 500 }}
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-white/10 relative">
                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-[var(--teal)] transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              {showInstall && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    haptic.medium();
                    onInstall?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
                  style={{ 
                    background: 'var(--teal)', 
                    color: '#ffffff',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '15px',
                    fontWeight: 700
                  }}
                >
                  <DownloadCloud size={18} />
                  <span>Install Native App</span>
                </motion.button>
              )}
              <button
                onClick={() => {
                  haptic.light();
                  onViewChange('profile');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl min-h-[48px]`}
                style={{ 
                  background: activeView === 'profile' ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' : 'transparent',
                  color: activeView === 'profile' ? '#ffffff' : 'var(--sidebar-text)', 
                  fontFamily: 'var(--font-inter)', 
                  fontSize: '15px', 
                  fontWeight: activeView === 'profile' ? 600 : 500 
                }}
              >
                <Settings size={18} strokeWidth={activeView === 'profile' ? 2.5 : 2} />
                <span>Profile & Settings</span>
              </button>
              <button
                onClick={() => {
                  haptic.light();
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-teal-500/10 min-h-[48px]"
                style={{ color: 'var(--teal)', fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 500 }}
              >
                <LogOut size={18} strokeWidth={2} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar spacer (Desktop) ── */}
      <div className="hidden md:block shrink-0" style={{ width: 'var(--sidebar-width, 240px)' }} />
    </>
  );
}
