import { AppView } from '../types';

interface NavTabsProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
}

export default function NavTabs({ activeView, onViewChange, overBudgetCount }: NavTabsProps) {
  // Mobile responsive hiding is maintained, desktop matches the new layout rules
  const tabs = [
    { id: 'dashboard'  as AppView, label: 'Home',       badge: 0 },
    { id: 'analytics'  as AppView, label: 'Statistics', badge: 0 },
    { id: 'budget'     as AppView, label: 'Budget',     badge: overBudgetCount },
    { id: 'goals'      as AppView, label: 'Goals',      badge: 0 },
    { id: 'history'    as AppView, label: 'History',    badge: 0 },
  ];

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden sm:block px-[32px]">
        <nav className="flex space-x-[24px] border-b border-[var(--surface-3)]">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`flex items-center gap-[8px] py-[12px] font-[500] text-[14px] transition-all duration-200 border-b-2 relative -mb-[1px]
                  ${isActive
                    ? 'border-[var(--blue)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="badge-pill px-[6px] py-[2px] bg-[var(--red-dim)] text-[var(--red)]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-[var(--surface-1)] border-t border-[var(--surface-3)] sm:hidden">
        <nav className="flex items-center justify-around px-2 pb-safe pt-2">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className="relative flex flex-col items-center justify-center w-[60px] h-[50px]"
              >
                <div className={`text-[12px] font-[500] transition-colors ${
                  isActive ? 'text-[var(--blue)]' : 'text-[var(--text-muted)]'
                }`} style={{ fontFamily: 'var(--font-inter)' }}>
                  {tab.label}
                </div>
                {/* Active Indicator on Mobile */}
                {isActive && (
                  <div className="absolute top-0 w-1/2 h-[2px] bg-[var(--blue)] rounded-b-md" />
                )}

                {tab.badge > 0 && (
                  <span className="absolute right-0 top-0 badge-pill flex items-center justify-center h-[14px] min-w-[14px] bg-[var(--red)] text-white text-[9px] px-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
