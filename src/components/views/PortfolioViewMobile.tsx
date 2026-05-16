import React, { useState } from 'react';
import { 
  TrendingUp, Plus, Landmark, BarChart2, ShieldAlert, 
  Sparkles, BrainCircuit, Zap, ChevronRight, PieChart,
  ArrowUpRight, ArrowDownRight, Wallet
} from 'lucide-react';
import { AssetType, LiabilityType, SavingsGoal } from '../../types';
import NetWorthEvolution from '../features/wealth/NetWorthEvolution';
import FutureWealthSimulator from '../features/wealth/FutureWealthSimulator';
import DebtPlanner from '../features/wealth/DebtPlanner';
import EntryCard from '../features/wealth/EntryCard';
import AllocationDonut from '../features/wealth/AllocationDonut';
import { haptic } from '../../lib/haptic';

interface PortfolioViewMobileProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
  assets: any[];
  liabilities: any[];
  activeTab: 'overview' | 'simulation' | 'debt';
  setActiveTab: (tab: 'overview' | 'simulation' | 'debt') => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
  onDeleteAsset: (id: string) => void;
  onDeleteLiability: (id: string) => void;
  allocationByType: any[];
  financeState: any;
  config: any;
  healthScore: number;
  savingsRate: number;
}

export default function PortfolioViewMobile({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
  assets,
  liabilities,
  activeTab,
  setActiveTab,
  onAddAsset,
  onAddLiability,
  onDeleteAsset,
  onDeleteLiability,
  allocationByType,
  financeState,
  config,
  healthScore,
  savingsRate
}: PortfolioViewMobileProps) {
  const positive = netWorth >= 0;

  return (
    <div className="view-enter space-y-6 pb-24">
      {/* 1. Sticky Mini-Tab Selector */}
      <div className="flex items-center gap-2 bg-[var(--surface-card)] p-1.5 rounded-2xl border border-[var(--border)] shadow-sm sticky top-0 z-20">
        {[
          { id: 'overview', icon: BarChart2, label: 'Overview' },
          { id: 'simulation', icon: BrainCircuit, label: 'Wealth Sim' },
          { id: 'debt', icon: Zap, label: 'Debt Lab' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic.light(); setActiveTab(tab.id as any); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-[var(--teal)] text-white shadow-md' 
                : 'text-[var(--text-muted)]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 2. Hero Net Worth Card */}
          <div className={`rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl ${
            positive ? 'bg-gradient-to-br from-[#0d9488] to-[#2dd4bf]' : 'bg-gradient-to-br from-[#b91c1c] to-[#ef4444]'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={80} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Net Worth</p>
            <h2 className="text-4xl font-black mb-6">
              {positive ? '' : '−'}{currency}{Math.abs(netWorth).toLocaleString()}
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
              <div>
                <p className="text-[9px] font-black uppercase opacity-60 mb-1">Assets</p>
                <p className="text-lg font-black">{currency}{totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase opacity-60 mb-1">Liabilities</p>
                <p className="text-lg font-black">{currency}{totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 3. Action Quick-Links */}
          <div className="grid grid-cols-2 gap-3 px-1">
            <button 
              onClick={() => { haptic.medium(); onAddAsset(); }}
              className="h-14 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--teal)] active:bg-[var(--teal-dim)]"
            >
              <Plus size={16} /> Add Asset
            </button>
            <button 
              onClick={() => { haptic.medium(); onAddLiability(); }}
              className="h-14 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 active:bg-red-50"
            >
              <Plus size={16} /> Add Liability
            </button>
          </div>

          {/* 4. Chart & Allocation */}
          <div className="space-y-4">
            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-2 shadow-sm">
              <NetWorthEvolution transactions={financeState?.transactions ?? []} currency={currency} />
            </div>
            
            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <PieChart size={18} className="text-[var(--teal)]" />
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Asset Allocation</h3>
              </div>
              <AllocationDonut allocationByType={allocationByType} total={totalAssets} currency={currency} />
            </div>
          </div>

          {/* 5. Asset/Liability Lists */}
          <div className="space-y-6">
            {/* Assets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Your Assets</h3>
                <span className="text-[10px] font-black text-[var(--teal)]">{currency}{totalAssets.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {assets.map(asset => (
                  <EntryCard
                    key={asset.id}
                    label={asset.name}
                    icon={<Wallet size={16} />}
                    iconEmoji={asset.icon || '🏦'}
                    color={asset.color || 'var(--teal)'}
                    balance={asset.balance}
                    currency={currency}
                    type={asset.type}
                    onDelete={() => { haptic.medium(); onDeleteAsset(asset.id); }}
                  />
                ))}
              </div>
            </div>

            {/* Liabilities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Liabilities</h3>
                <span className="text-[10px] font-black text-red-500">{currency}{totalLiabilities.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {liabilities.map(liability => (
                  <EntryCard
                    key={liability.id}
                    label={liability.name}
                    icon={<ShieldAlert size={16} />}
                    iconEmoji={liability.icon || '💳'}
                    color="#ef4444"
                    balance={liability.balance}
                    currency={currency}
                    onDelete={() => { haptic.medium(); onDeleteLiability(liability.id); }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'simulation' && (
        <div className="animate-fade-in space-y-6">
          <FutureWealthSimulator
            currentBalance={netWorth}
            monthlySavings={Math.max(0, (financeState?.monthlyStats?.totalIncome ?? 0) - (financeState?.monthlyStats?.totalExpenses ?? 0))}
            currency={currency}
          />
        </div>
      )}

      {activeTab === 'debt' && (
        <div className="animate-fade-in">
          <DebtPlanner liabilities={liabilities} currency={currency} userRole={config?.userRole} />
        </div>
      )}
    </div>
  );
}
