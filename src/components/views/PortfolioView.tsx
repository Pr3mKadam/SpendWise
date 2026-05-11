import { useState } from 'react';
import { TrendingUp, Plus, Landmark, BarChart2, ShieldAlert, Sparkles, BrainCircuit, Zap } from 'lucide-react';
import { AssetType, LiabilityType } from '../../types';
import { usePortfolio } from '../../hooks/usePortfolio';
import NetWorthEvolution from '../features/wealth/NetWorthEvolution';
import FutureWealthSimulator from '../features/wealth/FutureWealthSimulator';
import { WealthTree } from '../features/wealth/WealthTree';
import DebtPlanner from '../features/wealth/DebtPlanner';

import { ASSET_TYPES, LIABILITY_TYPES, getAssetCfg, getLiabilityCfg } from '../../data/portfolioConfig';
import AddModal from '../features/wealth/AddModal';
import EntryCard from '../features/wealth/EntryCard';
import AllocationDonut from '../features/wealth/AllocationDonut';




function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}


// ─── Main ─────────────────────────────────────────────────────────────────────

interface PortfolioViewProps { 
  currency?: string; 
  financeState: any;
}

export default function PortfolioView({ currency = '₹', financeState }: PortfolioViewProps) {
  const {
    assets, liabilities,
    totalAssets, totalLiabilities, netWorth,
    allocationByType,
    addAsset, deleteAsset,
    addLiability, deleteLiability,
  } = usePortfolio();

  const [modal, setModal] = useState<'asset' | 'liability' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'debt'>('overview');
  const positive = netWorth >= 0;

  // Calculate Wealth Health Score (simplified)
  const healthScore = Math.min(100, Math.max(0, 
    (positive ? 50 : 20) + 
    (totalAssets > 0 ? Math.min(40, (netWorth / Math.max(totalAssets, 1)) * 40) : 0) +
    (financeState.transactions.length > 10 ? 10 : 0)
  ));

  // Use monthlyStats from financeState for more accurate "Monthly" numbers
  const monthlyIncome = financeState.monthlyStats.totalIncome;
  const monthlyExpenses = financeState.monthlyStats.totalExpenses;
  const savingsRate = financeState.monthlyStats.savingsRate;

  return (
    <>
      {modal && (
        <AddModal
          mode={modal}
          currency={currency}
          onAdd={modal === 'asset' ? addAsset : addLiability}
          onClose={() => setModal(null)}
        />
      )}

      <div className="animate-fade-in-up space-y-6 pb-20">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-headline">
              <TrendingUp size={22} style={{ color: 'var(--teal)' }} />
              Net Worth & Portfolio
            </h2>
            <p className="text-caption mt-1">Strategic overview of your global wealth.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/50 p-1 rounded-xl border border-[var(--border)] shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-bold text-[12px] transition-all"
              style={{ 
                background: activeTab === 'overview' ? 'var(--teal)' : 'transparent',
                color: activeTab === 'overview' ? 'white' : 'var(--text-muted)',
                cursor: 'pointer'
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
                cursor: 'pointer'
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
                cursor: 'pointer'
              }}
            >
              <Zap size={14} /> Debt Lab
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setModal('liability')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-bold text-[13px] transition-all hover:opacity-90 shadow-sm"
              style={{ background: 'var(--card)', color: '#ef4444', border: '1.5px solid var(--border)', cursor: 'pointer' }}
            >
              <Plus size={15} /> Add Liability
            </button>
            <button
              onClick={() => setModal('asset')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter font-bold text-[13px] text-white transition-all hover:opacity-90"
              style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.35)' }}
            >
              <Plus size={15} /> Add Asset
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* ── Summary Banner ── */}
            <div
              className="rounded-2xl px-8 py-7 flex flex-wrap items-center gap-8 relative overflow-hidden"
              style={{
                background: positive
                  ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)'
                  : 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
                boxShadow: positive
                  ? '0 8px 32px rgba(20,184,166,0.3)'
                  : '0 8px 32px rgba(239,68,68,0.3)',
              }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} color="white" />
              </div>

              <div>
                <p className="font-inter text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1">Total Net Worth</p>
                <p className="font-manrope font-bold text-4xl text-white">
                  {positive ? '' : '−'}{fmt(netWorth, currency)}
                </p>
                <p className="font-inter text-[12px] text-white/70 mt-1">
                  {positive ? '🟢 Financial health is optimal' : '🔴 Focus on debt reduction'}
                </p>
              </div>
              <div className="flex gap-8 flex-wrap">
                <div>
                  <p className="font-inter text-[11px] text-white/60 uppercase tracking-wider mb-1">Total Assets</p>
                  <p className="font-manrope font-bold text-2xl text-white">{fmt(totalAssets, currency)}</p>
                </div>
                <div>
                  <p className="font-inter text-[11px] text-white/60 uppercase tracking-wider mb-1">Total Liabilities</p>
                  <p className="font-manrope font-bold text-2xl text-white">{fmt(totalLiabilities, currency)}</p>
                </div>
              </div>
            </div>

            {/* ── Visual Insights ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8 space-y-6">
                <NetWorthEvolution transactions={financeState.transactions} currency={currency} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <WealthTree score={healthScore} savingsRate={savingsRate} />
                  <div className="card p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-indigo-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">AI Insight</span>
                    </div>
                    <p className="text-sm font-manrope font-bold text-[var(--text-primary)] mb-2">
                      Growth potential is high.
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Your current savings rate of {savingsRate.toFixed(1)}% could lead to a {currency}{(netWorth * 1.5).toLocaleString()} portfolio in 2 years if maintained. 
                    </p>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-4 card px-6 py-5">
                <h3 className="font-inter font-bold text-[12px] uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>
                  Portfolio Allocation
                </h3>
                <AllocationDonut allocationByType={allocationByType} total={totalAssets} currency={currency} />
                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                   <div className="flex items-center gap-2 mb-3">
                      <BrainCircuit size={16} className="text-[var(--teal)]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Wealth Tip</span>
                   </div>
                   <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] font-inter">
                      Based on your current {allocationByType.find(a => a.type === 'bank') ? 'high cash' : 'diversified'} position, 
                      consider {netWorth > 100000 ? 'exploring tax-efficient index funds' : 'building a 6-month emergency buffer'} for better long-term security.
                   </p>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="font-inter font-bold text-[12px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Performance vs S&P 500
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-manrope font-bold text-lg text-green-500">+12.4%</p>
                      <p className="font-inter text-[10px] text-gray-400 uppercase">Your Portfolio</p>
                    </div>
                    <div className="text-right">
                      <p className="font-manrope font-bold text-lg text-gray-500 dark:text-gray-400">+10.2%</p>
                      <p className="font-inter text-[10px] text-gray-400 uppercase">S&P 500 (YTD)</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 flex justify-center items-center">
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                      +2.2% Alpha Generated 🚀
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Two-Column: Assets / Liabilities ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-manrope font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Traditional Assets</h3>
                    <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Liquid & Fixed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--teal)' }}>
                      {fmt(assets.filter(a => a.type !== 'crypto').reduce((s, a) => s + a.balance, 0), currency)}
                    </span>
                  </div>
                </div>

                {assets.filter(a => a.type !== 'crypto').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-2xl" style={{ background: 'var(--surface-input)' }}>
                    <span className="text-3xl mb-2">🏦</span>
                    <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-muted)' }}>No traditional assets yet</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assets.filter(a => a.type !== 'crypto').map(asset => {
                      const cfg = getAssetCfg(asset.type);
                      return (
                        <EntryCard
                          key={asset.id}
                          label={asset.name}
                          icon={<Landmark size={18} />}
                          iconEmoji={asset.icon ?? cfg.icon}
                          color={asset.color ?? cfg.color}
                          balance={asset.balance}
                          currency={currency}
                          type={asset.type}
                          onDelete={() => deleteAsset(asset.id)}
                        />
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Zap size={16} />
                      </div>
                      <div>
                        <h3 className="font-manrope font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Crypto Portfolio</h3>
                        <p className="font-inter text-[11px]" style={{ color: 'var(--text-muted)' }}>Web3 Assets</p>
                      </div>
                    </div>
                    <span className="font-manrope font-bold text-[15px] text-orange-500">
                      {fmt(assets.filter(a => a.type === 'crypto').reduce((s, a) => s + a.balance, 0), currency)}
                    </span>
                  </div>

                  {assets.filter(a => a.type === 'crypto').length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 rounded-2xl border border-dashed border-[var(--border)]">
                      <span className="text-2xl mb-1">🪙</span>
                      <p className="font-inter font-semibold text-[12px]" style={{ color: 'var(--text-muted)' }}>No crypto assets tracked.</p>
                      <button onClick={() => setModal('asset')} className="mt-2 text-[11px] font-bold text-[var(--teal)] bg-transparent border-none cursor-pointer hover:underline">Add Crypto Asset</button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {assets.filter(a => a.type === 'crypto').map(asset => {
                        const cfg = getAssetCfg(asset.type);
                        return (
                          <EntryCard
                            key={asset.id}
                            label={asset.name}
                            icon={<Zap size={18} />}
                            iconEmoji={asset.icon ?? cfg.icon}
                            color={asset.color ?? cfg.color}
                            balance={asset.balance}
                            currency={currency}
                            type={asset.type}
                            onDelete={() => deleteAsset(asset.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="card px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-manrope font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Liabilities</h3>
                    <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Active Debts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--red)' }}>{fmt(totalLiabilities, currency)}</span>
                  </div>
                </div>

                {liabilities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-2xl" style={{ background: 'var(--surface-input)' }}>
                    <span className="text-3xl mb-2">🎉</span>
                    <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--teal)' }}>Debt free!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {liabilities.map(liability => {
                      const cfg = getLiabilityCfg(liability.type);
                      return (
                        <EntryCard
                          key={liability.id}
                          label={liability.name}
                          icon={<ShieldAlert size={18} />}
                          iconEmoji={liability.icon ?? cfg.icon}
                          color={cfg.color}
                          balance={liability.balance}
                          currency={currency}
                          onDelete={() => deleteLiability(liability.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : activeTab === 'simulation' ? (
          <div className="animate-fade-in">
            <FutureWealthSimulator
              currentBalance={netWorth}
              monthlySavings={Math.max(0, monthlyIncome - monthlyExpenses)}
              currency={currency}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <DebtPlanner liabilities={liabilities} currency={currency} />
          </div>
        )}

        <div className="card px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--teal-dim)' }}>
            <BarChart2 size={18} style={{ color: 'var(--teal)' }} />
          </div>
          <p className="font-inter text-[13px]" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Wealth Efficiency: </strong>
            {totalAssets > 0 ? `${((totalLiabilities / totalAssets) * 100).toFixed(1)}% Debt Ratio` : 'N/A'}
            {' '}·{' '}
            {totalAssets === 0
              ? 'Add assets to begin portfolio tracking.'
              : positive
              ? `Your portfolio is highly resilient with a safety margin of ${((totalAssets / Math.max(totalLiabilities, 1))).toFixed(1)}x.`
              : 'Focus on aggressive debt repayment to flip your net worth positive.'}
          </p>
        </div>
      </div>
    </>
  );
}
