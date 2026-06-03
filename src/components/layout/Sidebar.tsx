import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { AppView } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/core/haptic';
import { useStore } from '@/store';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ALL_NAV_ITEMS, MOBILE_BOTTOM_IDS, DESKTOP_ONLY_IDS } from './navigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileDrawer } from './components/MobileDrawer';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  overBudgetCount: number;
  showInstall?: boolean;
  onInstall?: () => void;
  config: SpendWiseConfig | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenQuickAdd?: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  overBudgetCount,
  config,
  showInstall,
  onInstall,
  theme,
  onToggleTheme,
  onOpenQuickAdd,
}: SidebarProps) {
  const { signOut } = useAuth();
  const store = useStore();
  const settings = store.parentalState;
  const isKidMode = settings.isTeenMode;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userRole = config?.userRole || 'professional';

  // Close drawer on view change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [activeView]);

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Filter nav items based on user role and mode
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

  const coreItems = navItems.filter(i =>
    ['dashboard', 'analytics', 'budget', 'history', 'goals'].includes(i.id)
  );
  const wealthItems = navItems.filter(i =>
    ['portfolio', 'subscriptions', 'shared', 'sync'].includes(i.id)
  );
  const toolItems = navItems.filter(i =>
    ['advisor', 'education', 'quests', 'parental', 'reports'].includes(i.id)
  );

  // Bottom tab items (exactly 4: dashboard, budget, history, sync)
  const mobileBottomItems = navItems
    .filter(i => MOBILE_BOTTOM_IDS.includes(i.id))
    .sort((a, b) => MOBILE_BOTTOM_IDS.indexOf(a.id) - MOBILE_BOTTOM_IDS.indexOf(b.id));

  // Drawer items: not in bottom bar, and NOT desktop-only (those are hidden from mobile entirely)
  const mobileDrawerItems = navItems.filter(
    i => !MOBILE_BOTTOM_IDS.includes(i.id) && !DESKTOP_ONLY_IDS.includes(i.id)
  );

  const navigate = (view: AppView) => {
    haptic.light();
    onViewChange(view);
  };

  return (
    <>
      <DesktopSidebar
        activeView={activeView}
        navigate={navigate}
        coreItems={coreItems}
        wealthItems={wealthItems}
        toolItems={toolItems}
        overBudgetCount={overBudgetCount}
        showInstall={showInstall}
        onInstall={onInstall}
        signOut={signOut}
      />

      {/* Desktop spacer — keeps main content from sitting under sidebar */}
      <div className="hidden md:block shrink-0" style={{ width: '56px' }} />

      {/* MOBILE — bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Flat layout: items distributed evenly across the screen */}
        <div className="flex items-center justify-evenly w-full px-1 h-[60px]">
          {/* ── First 2 items (Overview, Budget) ── */}
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
                className="relative flex flex-col items-center justify-center gap-[3px] min-w-[48px] h-full outline-none"
                style={{ color: isActive ? 'var(--teal)' : 'var(--sidebar-text)' }}
              >
                <div
                  className="absolute inset-x-0 inset-y-2 rounded-xl transition-opacity duration-200"
                  style={{ background: 'var(--teal)', opacity: isActive ? 0.12 : 0 }}
                />
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-inter)',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
                {item.id === 'budget' && overBudgetCount > 0 && (
                  <span
                    className="absolute top-1.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-0.5"
                    style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
                  >
                    {overBudgetCount > 9 ? '9+' : overBudgetCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* ── CENTRE FAB (QuickAdd) ── */}
          <div className="flex items-center justify-center shrink-0" style={{ width: '60px' }}>
            <button
              onClick={() => {
                haptic.medium();
                onOpenQuickAdd?.();
              }}
              aria-label="Quick add transaction"
              className="relative flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)] focus-visible:ring-offset-2"
              style={{
                width: '50px',
                height: '50px',
                marginTop: '-20px',
                background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)',
                boxShadow: '0 4px 16px rgba(20,184,166,0.4)',
                border: '3px solid var(--sidebar-bg)',
              }}
            >
              <Plus size={22} className="text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* ── Last 2 items (Transactions, Sync) ── */}
          {mobileBottomItems.slice(2).map(item => {
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
                className="relative flex flex-col items-center justify-center gap-[3px] min-w-[48px] h-full outline-none"
                style={{ color: isActive ? 'var(--teal)' : 'var(--sidebar-text)' }}
              >
                <div
                  className="absolute inset-x-0 inset-y-2 rounded-xl transition-opacity duration-200"
                  style={{ background: 'var(--teal)', opacity: isActive ? 0.12 : 0 }}
                />
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-inter)',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
                {item.id === 'budget' && overBudgetCount > 0 && (
                  <span
                    className="absolute top-1.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-0.5"
                    style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
                  >
                    {overBudgetCount > 9 ? '9+' : overBudgetCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* ── More ── */}
          <button
            onClick={() => {
              haptic.light();
              setIsDrawerOpen(true);
            }}
            aria-label="More features"
            aria-expanded={isDrawerOpen}
            className="relative flex flex-col items-center justify-center gap-[3px] min-w-[48px] h-full outline-none"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <MoreHorizontal size={20} strokeWidth={2} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: 'var(--font-inter)',
                lineHeight: 1,
              }}
            >
              More
            </span>
          </button>
        </div>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        navigate={navigate}
        mobileDrawerItems={mobileDrawerItems}
        overBudgetCount={overBudgetCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
        showInstall={showInstall}
        onInstall={onInstall}
        signOut={signOut}
      />
    </>
  );
}
