import { TrendingUp, BarChart2, BrainCircuit, Zap, Plus } from 'lucide-react';
import { SpendWiseConfig } from '@/types/config';

interface PortfolioHeaderProps {
  config: SpendWiseConfig | null;
  activeTab: 'overview' | 'simulation' | 'debt';
  setActiveTab: (tab: 'overview' | 'simulation' | 'debt') => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
}

export function PortfolioHeader({
  config,
  activeTab,
  setActiveTab,
  onAddAsset,
  onAddLiability,
}: PortfolioHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-headline">
          <TrendingUp size={22} style={{ color: 'var(--teal)' }} />
          {config?.userRole === 'student' ? 'Student Portfolio' : 'Net Worth & Portfolio'}
        </h2>
        <p className="text-caption mt-1">
          {config?.userRole === 'student'
            ? 'Tracking your assets as you build your future.'
            : config?.userRole === 'business'
              ? 'Optimizing capital and business growth.'
              : 'Strategic overview of your global wealth.'}
        </p>
      </div>

      <div className="flex items-center gap-4 bg-[var(--surface-card)]/50 p-1 rounded-xl border border-[var(--border)] shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-bold text-[12px] transition-all"
          style={{
            background: activeTab === 'overview' ? 'var(--teal)' : 'transparent',
            color: activeTab === 'overview' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <BarChart2 size={14} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-bold text-[12px] transition-all"
          style={{
            background: activeTab === 'simulation' ? 'var(--teal)' : 'transparent',
            color: activeTab === 'simulation' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <BrainCircuit size={14} /> Wealth Sim
        </button>
        <button
          onClick={() => setActiveTab('debt')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-bold text-[12px] transition-all"
          style={{
            background: activeTab === 'debt' ? 'var(--teal)' : 'transparent',
            color: activeTab === 'debt' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <Zap size={14} /> Debt Lab
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onAddLiability}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-bold text-[13px] transition-all hover:opacity-90 shadow-sm"
          style={{
            background: 'var(--card)',
            color: '#ef4444',
            border: '1.5px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Add Liability
        </button>
        <button
          onClick={onAddAsset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter font-bold text-[13px] text-white transition-all hover:opacity-90"
          style={{
            background: 'var(--teal)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
          }}
        >
          <Plus size={15} /> Add Asset
        </button>
      </div>
    </div>
  );
}
