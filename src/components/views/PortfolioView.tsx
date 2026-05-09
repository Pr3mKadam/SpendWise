import { useState } from 'react';
import { TrendingUp, Plus, Trash2, X, Landmark, BarChart2, ShieldAlert, Sparkles, BrainCircuit, Zap } from 'lucide-react';
import { AssetType, LiabilityType } from '../../types';
import { usePortfolio } from '../../hooks/usePortfolio';
import Portal from '../common/Portal';
import NetWorthEvolution from '../features/wealth/NetWorthEvolution';
import FutureWealthSimulator from '../features/wealth/FutureWealthSimulator';
import { WealthTree } from '../features/wealth/WealthTree';
import DebtPlanner from '../features/wealth/DebtPlanner';

// ─── Config ────────────────────────────────────────────────────────────────────

const ASSET_TYPES: { value: AssetType; label: string; icon: string; color: string }[] = [
  { value: 'bank',       label: 'Bank Account',  icon: '🏦', color: '#14b8a6' },
  { value: 'investment', label: 'Investment',    icon: '📈', color: '#6366f1' },
  { value: 'crypto',     label: 'Crypto',        icon: '₿',  color: '#f59e0b' },
  { value: 'property',   label: 'Property',      icon: '🏠', color: '#10b981' },
  { value: 'other',      label: 'Other',         icon: '💼', color: '#64748b' },
];

const LIABILITY_TYPES: { value: LiabilityType; label: string; icon: string; color: string }[] = [
  { value: 'loan',        label: 'Personal Loan', icon: '📋', color: '#ef4444' },
  { value: 'credit_card', label: 'Credit Card',   icon: '💳', color: '#f97316' },
  { value: 'mortgage',    label: 'Mortgage',      icon: '🏡', color: '#dc2626' },
  { value: 'other',       label: 'Other Debt',    icon: '📄', color: '#94a3b8' },
];

function getAssetCfg(type: AssetType) {
  return ASSET_TYPES.find(t => t.value === type) ?? ASSET_TYPES[4];
}

function getLiabilityCfg(type: LiabilityType) {
  return LIABILITY_TYPES.find(t => t.value === type) ?? LIABILITY_TYPES[3];
}

function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddModal({
  mode,
  currency,
  onAdd,
  onClose,
}: {
  mode: 'asset' | 'liability';
  currency: string;
  onAdd: (data: any) => void;
  onClose: () => void;
}) {
  const types = mode === 'asset' ? ASSET_TYPES : LIABILITY_TYPES;
  const [selectedType, setSelectedType] = useState(types[0].value);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [error, setError] = useState('');

  const selected = types.find(t => t.value === selectedType)!;

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please enter a name'); return; }
    const bal = parseFloat(balance.replace(/,/g, ''));
    if (isNaN(bal) || bal <= 0) { setError('Please enter a valid positive amount'); return; }
    
    const data: any = { 
      name: name.trim(), 
      type: selectedType, 
      balance: bal, 
      icon: selected.icon, 
      color: selected.color 
    };

    if (mode === 'liability') {
      const rate = parseFloat(interestRate);
      const min = parseFloat(minPayment);
      if (!isNaN(rate)) data.interestRate = rate;
      if (!isNaN(min)) data.minPayment = min;
    }

    onAdd(data);
    onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: 'var(--surface-card)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="font-manrope font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Add {mode === 'asset' ? 'Asset' : 'Liability'}
            </h3>
            <p className="font-inter text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {mode === 'asset' ? 'Track what you own' : 'Track what you owe'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--surface-input)', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {types.map(t => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
                  style={{
                    background: selectedType === t.value ? t.color + '15' : 'var(--surface-input)',
                    border: `2px solid ${selectedType === t.value ? t.color : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="font-inter text-[11px] font-semibold" style={{ color: selectedType === t.value ? t.color : 'var(--text-muted)' }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder={mode === 'asset' ? 'e.g. HDFC Savings, Zerodha…' : 'e.g. Car Loan, HDFC Credit Card…'}
              className="w-full rounded-xl px-4 py-3 font-inter text-sm focus:outline-none transition-colors"
              style={{ background: 'var(--surface-input)', border: '2px solid transparent', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = selected.color}
              onBlur={e => e.target.style.borderColor = 'transparent'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              {mode === 'asset' ? 'Current Value' : 'Outstanding Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-manrope font-bold text-lg" style={{ color: 'var(--text-muted)' }}>
                {currency}
              </span>
              <input
                type="text"
                value={balance}
                onChange={e => { setBalance(e.target.value.replace(/[^0-9.]/g, '')); setError(''); }}
                placeholder="0"
                className="w-full rounded-xl pl-9 pr-4 py-3 font-manrope font-bold text-lg focus:outline-none transition-colors"
                style={{ background: 'var(--surface-input)', border: '2px solid transparent', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = selected.color}
                onBlur={e => e.target.style.borderColor = 'transparent'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {mode === 'liability' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  Interest Rate (%)
                </label>
                <input
                  type="text"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 12"
                  className="w-full rounded-xl px-4 py-3 font-inter text-sm focus:outline-none transition-colors"
                  style={{ background: 'var(--surface-input)', border: '2px solid transparent', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = selected.color}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
              </div>
              <div>
                <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  Min Payment
                </label>
                <input
                  type="text"
                  value={minPayment}
                  onChange={e => setMinPayment(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl px-4 py-3 font-inter text-sm focus:outline-none transition-colors"
                  style={{ background: 'var(--surface-input)', border: '2px solid transparent', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = selected.color}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="font-inter text-xs font-semibold" style={{ color: 'var(--red)' }}>⚠ {error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm transition-colors"
              style={{ background: 'var(--surface-input)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl font-inter font-bold text-sm text-white transition-all hover:opacity-90"
              style={{
                background: mode === 'asset' ? 'var(--teal)' : '#ef4444',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mode === 'asset' ? '0 4px 12px rgba(20,184,166,0.35)' : '0 4px 12px rgba(239,68,68,0.3)',
              }}
            >
              Add {mode === 'asset' ? 'Asset' : 'Liability'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  );
}

function getConsistentTrend(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const value = (Math.abs(hash % 500) / 100) - 1.5; // -1.5 to 3.5
  return value.toFixed(2);
}

// ─── Entry Card ────────────────────────────────────────────────────────────────

function EntryCard({
  label, icon, iconEmoji, color, balance, currency, type, onDelete,
}: {
  label: string; icon: React.ReactNode; iconEmoji?: string; color: string; balance: number; currency: string; type?: string; onDelete: () => void;
}) {
  const isInvestment = type === 'investment' || type === 'crypto';
  const simulatedTrend = isInvestment ? getConsistentTrend(label) : null;

  return (
    <div
      className="group relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
      style={{ background: 'var(--surface-input)', border: '1.5px solid transparent' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.background = color + '08'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--surface-input)'; }}
    >
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: color }} />

      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: color + '18' }}>
        {iconEmoji ?? icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-[14px] truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {simulatedTrend && (
          <div className="flex items-center gap-1 mt-0.5">
             <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ 
               background: Number(simulatedTrend) >= 0 ? 'var(--teal-dim)' : 'var(--red-dim)',
               color: Number(simulatedTrend) >= 0 ? 'var(--teal)' : 'var(--red)',
               fontFamily: 'var(--font-inter)'
             }}>
               {Number(simulatedTrend) >= 0 ? '▲' : '▼'} {Math.abs(Number(simulatedTrend))}%
             </span>
             <span className="text-[10px] font-medium" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-inter)' }}>24h change</span>
          </div>
        )}
      </div>

      <p className="font-manrope font-bold text-[16px] shrink-0 tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {fmt(balance, currency)}
      </p>

      <button
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0"
        style={{ background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ─── Charts ───────────────────────────────────────────────────────────────────

function AllocationDonut({ allocationByType, total, currency }: { allocationByType: any[]; total: number; currency: string }) {
  if (total === 0 || allocationByType.length === 0) return null;

  const data = allocationByType.map(a => ({
    name: ASSET_TYPES.find(t => t.value === a.type)?.label || a.type,
    value: a.value,
    color: ASSET_TYPES.find(t => t.value === a.type)?.color || '#64748b'
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 h-[180px]">
      <div className="w-full sm:w-[200px] h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
              formatter={(val: any) => fmt(Number(val), currency)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
            <div>
              <p className="font-inter text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
              <p className="font-manrope text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                {((d.value / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
              </div>
            </div>

            {/* ── Two-Column: Assets / Liabilities ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-manrope font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Assets</h3>
                    <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Liquid & Fixed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--teal)' }}>{fmt(totalAssets, currency)}</span>
                  </div>
                </div>

                {assets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-2xl" style={{ background: 'var(--surface-input)' }}>
                    <span className="text-3xl mb-2">🏦</span>
                    <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-muted)' }}>No assets yet</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assets.map(asset => {
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
