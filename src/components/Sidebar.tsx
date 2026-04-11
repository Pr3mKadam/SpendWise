import { LayoutDashboard, CreditCard, ArrowLeftRight, Target, Settings, LogOut, PieChart, Landmark, TrendingUp, RefreshCw, Users } from 'lucide-react';
import { AppView } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
  onReset:         () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard'     as AppView, label: 'Overview',         icon: LayoutDashboard },
  { id: 'analytics'     as AppView, label: 'Statistics',       icon: PieChart },
  { id: 'budget'        as AppView, label: 'Budget',           icon: Target },
  { id: 'goals'         as AppView, label: 'Goals',            icon: CreditCard },
  { id: 'shared'        as AppView, label: 'Shared',           icon: Users },
  { id: 'portfolio'     as AppView, label: 'Net Worth',        icon: TrendingUp },
  { id: 'subscriptions' as AppView, label: 'Subscriptions',    icon: RefreshCw },
  { id: 'sync'          as AppView, label: 'Bank Sync',        icon: Landmark },
  { id: 'history'       as AppView, label: 'Transactions',     icon: ArrowLeftRight },
];

export default function Sidebar({ activeView, onViewChange, overBudgetCount, onReset }: SidebarProps) {
  const { signOut } = useAuth();
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
          <div className="flex items-baseline gap-0">
            <span style={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 800,
              fontSize: '20px',
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              <span style={{ fontWeight: 400 }}>SPEND</span>wise
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left relative"
                style={{
                  background: isActive ? 'var(--teal)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
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
          <button
            onClick={() => onViewChange('profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative"
            style={{ 
              background: activeView === 'profile' ? 'var(--teal)' : 'transparent',
              color: activeView === 'profile' ? '#ffffff' : 'var(--sidebar-text)', 
              fontFamily: 'var(--font-inter)', 
              fontSize: '14px', 
              fontWeight: activeView === 'profile' ? 600 : 500 
            }}
            onMouseEnter={e => { if (activeView !== 'profile') (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover)'; }}
            onMouseLeave={e => { if (activeView !== 'profile') (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <Settings size={18} strokeWidth={activeView === 'profile' ? 2.5 : 2} />
            <span>Profile & Settings</span>
          </button>

          <button
            onClick={onReset}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            style={{ color: 'rgba(239,68,68,0.7)', fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            title="Reset all data"
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Reset Data</span>
          </button>
          
          <button
            onClick={signOut}
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
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around px-2 py-2"
        style={{ background: 'var(--sidebar-bg)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="relative flex flex-col items-center justify-center w-14 h-12"
              style={{ color: isActive ? 'var(--teal)' : 'var(--sidebar-text)', fontFamily: 'var(--font-inter)' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '9px', fontWeight: 600, marginTop: '2px' }}>{item.label}</span>
              {item.id === 'budget' && overBudgetCount > 0 && (
                <span
                  className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                  style={{ background: 'var(--red)', color: '#fff' }}
                >
                  {overBudgetCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sidebar spacer (Desktop) ── */}
      <div className="hidden md:block shrink-0" style={{ width: 'var(--sidebar-width, 240px)' }} />
    </>
  );
}
