import { useState } from 'react';
import { TrendingUp, Plus, Trash2, X, Landmark, BarChart2, ShieldAlert } from 'lucide-react';
import { AssetType, LiabilityType } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';
import Portal from './Portal';

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
  onAdd,
  onClose,
}: {
  mode: 'asset' | 'liability';
  onAdd: (data: any) => void;
  onClose: () => void;
}) {
  const types = mode === 'asset' ? ASSET_TYPES : LIABILITY_TYPES;
  const [selectedType, setSelectedType] = useState(types[0].value);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');

  const selected = types.find(t => t.value === selectedType)!;

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please enter a name'); return; }
    const bal = parseFloat(balance.replace(/,/g, ''));
    if (isNaN(bal) || bal <= 0) { setError('Please enter a valid positive amount'); return; }
    onAdd({ name: name.trim(), type: selectedType, balance: bal, icon: selected.icon, color: selected.color });
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
        {/* Modal Header */}
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
          {/* Type Selector Grid */}
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

          {/* Name Input */}
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

          {/* Balance Input */}
          <div>
            <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              {mode === 'asset' ? 'Current Value' : 'Outstanding Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-manrope font-bold text-lg" style={{ color: 'var(--text-muted)' }}>
                ₹
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

          {error && (
            <p className="font-inter text-xs font-semibold" style={{ color: 'var(--red)' }}>⚠ {error}</p>
          )}

          {/* Actions */}
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

// ─── Entry Card ────────────────────────────────────────────────────────────────

function EntryCard({
  label, icon, iconEmoji, color, balance, currency, onDelete,
}: {
  label: string; icon: React.ReactNode; iconEmoji?: string; color: string; balance: number; currency: string; onDelete: () => void;
}) {
  return (
    <div
      className="group relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
      style={{ background: 'var(--surface-input)', border: '1.5px solid transparent' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.background = color + '08'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--surface-input)'; }}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: color }} />

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: color + '18' }}>
        {iconEmoji ?? icon}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-[14px] truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
      </div>

      {/* Balance */}
      <p className="font-manrope font-bold text-[16px] shrink-0 tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {fmt(balance, currency)}
      </p>

      {/* Delete */}
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

// ─── Allocation Donut (pure CSS) ─────────────────────────────────────────────

function AllocationDonut({ allocationByType, total }: { allocationByType: any[]; total: number }) {
  if (total === 0 || allocationByType.length === 0) return null;

  // Build conic-gradient stops
  let acc = 0;
  const stops = allocationByType.map(({ type, pct }) => {
    const cfg = ASSET_TYPES.find(t => t.value === type)!;
    const from = acc;
    acc += pct;
    return `${cfg.color} ${from.toFixed(1)}% ${acc.toFixed(1)}%`;
  });
  const gradient = `conic-gradient(${stops.join(', ')})`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut: pure CSS conic-gradient + inner cutout */}
      <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: gradient }} />
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ margin: '26px', background: 'var(--surface-card)' }}
        >
          <span className="font-manrope font-bold text-[11px]" style={{ color: 'var(--text-muted)' }}>Assets</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 flex-1">
        {allocationByType.map(({ type, value, pct }) => {
          const cfg = ASSET_TYPES.find(t => t.value === type)!;
          return (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: cfg.color }} />
              <div>
                <p className="font-inter text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{cfg.label}</p>
                <p className="font-inter text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {fmt(value, '')} · {pct.toFixed(0)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface PortfolioViewProps { currency?: string; }

export default function PortfolioView({ currency = '₹' }: PortfolioViewProps) {
  const {
    assets, liabilities,
    totalAssets, totalLiabilities, netWorth,
    allocationByType,
    addAsset, deleteAsset,
    addLiability, deleteLiability,
  } = usePortfolio();

  const [modal, setModal] = useState<'asset' | 'liability' | null>(null);
  const positive = netWorth >= 0;

  return (
    <>
      {/* ── Add Modal ── */}
      {modal && (
        <AddModal
          mode={modal}
          onAdd={modal === 'asset' ? addAsset : addLiability}
          onClose={() => setModal(null)}
        />
      )}

      <div className="animate-fade-in-up space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-headline">
              <TrendingUp size={22} style={{ color: 'var(--teal)' }} />
              Net Worth & Portfolio
            </h2>
            <p className="text-caption mt-1">All your assets and liabilities in one place.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setModal('liability')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-bold text-[13px] transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.25)', cursor: 'pointer' }}
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

        {/* ── Summary Banner ── */}
        <div
          className="rounded-2xl px-8 py-7 flex flex-wrap items-center gap-8"
          style={{
            background: positive
              ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)'
              : 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
            boxShadow: positive
              ? '0 8px 32px rgba(20,184,166,0.3)'
              : '0 8px 32px rgba(239,68,68,0.3)',
          }}
        >
          <div>
            <p className="font-inter text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1">Net Worth</p>
            <p className="font-manrope font-bold text-4xl text-white">
              {positive ? '' : '−'}{fmt(netWorth, currency)}
            </p>
            <p className="font-inter text-[12px] text-white/70 mt-1">
              {positive ? '🟢 Assets exceed liabilities' : '🔴 Liabilities exceed assets'}
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

        {/* ── Asset Allocation Donut ── */}
        {allocationByType.length > 0 && (
          <div className="card px-6 py-5">
            <h3 className="font-inter font-bold text-[12px] uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>
              Asset Allocation
            </h3>
            <AllocationDonut allocationByType={allocationByType} total={totalAssets} />
          </div>
        )}

        {/* ── Two-Column: Assets / Liabilities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Assets */}
          <div className="card px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-manrope font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Assets</h3>
                <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>What you own</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--teal)' }}>{fmt(totalAssets, currency)}</span>
                <button
                  onClick={() => setModal('asset')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-2xl" style={{ background: 'var(--surface-input)' }}>
                <span className="text-3xl mb-2">🏦</span>
                <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-muted)' }}>No assets yet</p>
                <p className="font-inter text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>Click "+ Add Asset" to get started</p>
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
                      onDelete={() => deleteAsset(asset.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Liabilities */}
          <div className="card px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-manrope font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Liabilities</h3>
                <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>What you owe</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--red)' }}>{fmt(totalLiabilities, currency)}</span>
                <button
                  onClick={() => setModal('liability')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {liabilities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-2xl" style={{ background: 'var(--surface-input)' }}>
                <span className="text-3xl mb-2">🎉</span>
                <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--teal)' }}>Debt free!</p>
                <p className="font-inter text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>No liabilities — keep it up 💪</p>
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

        {/* ── Insight Footer ── */}
        <div className="card px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--teal-dim)' }}>
            <BarChart2 size={18} style={{ color: 'var(--teal)' }} />
          </div>
          <p className="font-inter text-[13px]" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Debt-to-Asset Ratio: </strong>
            {totalAssets > 0 ? `${((totalLiabilities / totalAssets) * 100).toFixed(1)}%` : 'N/A'}
            {' '}·{' '}
            {totalAssets === 0
              ? 'Add your first asset to start tracking your net worth.'
              : positive
              ? `Your assets are ${((totalAssets / Math.max(totalLiabilities, 1))).toFixed(1)}× your liabilities. Excellent position!`
              : 'Focus on paying down high-interest debt to improve your ratio.'}
          </p>
        </div>
      </div>
    </>
  );
}
