import React from 'react';
import {
  Plus,
  BarChart2,
  BrainCircuit,
  Zap,
  PieChart,
  Wallet,
  ShieldAlert,
} from 'lucide-react';
import NetWorthEvolution from '@/features/portfolio/components/NetWorthEvolution';
import FutureWealthSimulator from '@/features/portfolio/components/FutureWealthSimulator';
import DebtPlanner from '@/features/portfolio/components/DebtPlanner';
import EntryCard from '@/features/portfolio/components/EntryCard';
import AllocationDonut from '@/features/portfolio/components/AllocationDonut';
import { MobilePortfolioHero } from '@/features/portfolio/components/MobilePortfolioHero';
import { haptic } from '@/lib/haptic';

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
  savingsRate,
}: PortfolioViewMobileProps) {
  return (
    <div className="view-enter space-y-6 pb-24">
      {/* 1. Sticky Mini-Tab Selector */}
      <div className="flex items-center gap-2 bg-[var(--surface-card)] p-1.5 rounded-2xl border border-[var(--border)] shadow-sm sticky top-0 z-20">
        {[
          { id: 'overview', icon: BarChart2, label: 'Overview' },
          { id: 'simulation', icon: BrainCircuit, label: 'Wealth Sim' },
          { id: 'debt', icon: Zap, label: 'Debt Lab' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              haptic.light();
              setActiveTab(tab.id as any);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[length:var(--fs-overline)] font-black uppercase tracking-widest transition-all ${
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
          <MobilePortfolioHero
            netWorth={netWorth}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            currency={currency}
          />

          {/* Action Quick-Links */}
          <div className="grid grid-cols-2 gap-3 px-1">
            <button
              onClick={() => {
                haptic.medium();
                onAddAsset();
              }}
              className="h-14 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center gap-2 text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-[var(--teal)] active:bg-[var(--teal-dim)]"
            >
              <Plus size={16} /> Add Asset
            </button>
            <button
              onClick={() => {
                haptic.medium();
                onAddLiability();
              }}
              className="h-14 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center gap-2 text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-red-500 active:bg-red-50"
            >
              <Plus size={16} /> Add Liability
            </button>
          </div>

          {/* Chart & Allocation */}
          <div className="space-y-4">
            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-2 shadow-sm">
              <NetWorthEvolution transactions={financeState?.transactions ?? []} currency={currency} />
            </div>

            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <PieChart size={18} className="text-[var(--teal)]" />
                <h3 className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Asset Allocation
                </h3>
              </div>
              <AllocationDonut allocationByType={allocationByType} total={totalAssets} currency={currency} />
            </div>
          </div>

          {/* Asset/Liability Lists */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Your Assets
                </h3>
                <span className="text-[length:var(--fs-overline)] font-bold text-[var(--teal)]">
                  {currency}
                  {totalAssets.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <EntryCard
                    key={asset.id}
                    label={asset.name}
                    icon={<Wallet size={16} />}
                    iconEmoji={asset.icon || '🏦'}
                    color={asset.color || 'var(--teal)'}
                    balance={asset.balance}
                    currency={currency}
                    type={asset.type}
                    onDelete={() => {
                      haptic.medium();
                      onDeleteAsset(asset.id);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Liabilities
                </h3>
                <span className="text-[length:var(--fs-overline)] font-bold text-red-500">
                  {currency}
                  {totalLiabilities.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {liabilities.map((liability) => (
                  <EntryCard
                    key={liability.id}
                    label={liability.name}
                    icon={<ShieldAlert size={16} />}
                    iconEmoji={liability.icon || '💳'}
                    color="#ef4444"
                    balance={liability.balance}
                    currency={currency}
                    onDelete={() => {
                      haptic.medium();
                      onDeleteLiability(liability.id);
                    }}
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
            monthlySavings={Math.max(
              0,
              (financeState?.monthlyStats?.totalIncome ?? 0) - (financeState?.monthlyStats?.totalExpenses ?? 0)
            )}
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
