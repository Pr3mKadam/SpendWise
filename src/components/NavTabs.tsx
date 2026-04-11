import { Home, BarChart2, PieChart, Clock, Target } from 'lucide-react';
import { AppView } from '../types';

interface NavTabsProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
}

export default function NavTabs({ activeView, onViewChange, overBudgetCount }: NavTabsProps) {
  const tabs = [
    { id: 'dashboard'  as AppView, label: 'Home',       icon: Home,      badge: 0 },
    { id: 'analytics'  as AppView, label: 'Statistics', icon: BarChart2, badge: 0 },
    { id: 'budget'     as AppView, label: 'Budget',     icon: PieChart,  badge: overBudgetCount },
    { id: 'goals'      as AppView, label: 'Goals',      icon: Target,    badge: 0 },
    { id: 'history'    as AppView, label: 'History',    icon: Clock,     badge: 0 },
  ];

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden sm:block mx-auto max-w-[1440px] px-6 lg:px-8 mb-6">
        <nav className="flex space-x-1 rounded-2xl bg-[#0d131f] p-1 shadow-lg border border-white/[0.04]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/[0.04] bg-[#0a0f18]/95 pb-safe pt-2 backdrop-blur-xl sm:hidden">
        <nav className="flex items-center justify-around px-2 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className="relative flex flex-col items-center justify-center w-14 h-12 gap-0.5 transition-colors"
              >
                <div className={`flex items-center justify-center p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-600'
                }`}>
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[9px] font-semibold transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-600'
                }`}>
                  {tab.label}
                </span>

                {tab.badge > 0 && (
                  <span className="absolute right-1 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[7px] font-bold text-white shadow-sm ring-2 ring-[#0a0f18]">
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
