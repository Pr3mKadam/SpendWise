import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import Portal from '../../common/Portal';
import { ASSET_TYPES, LIABILITY_TYPES } from '../../../data/portfolioConfig';
import { SpendWiseConfig } from '../onboarding/OnboardingModal';

export interface AddModalProps {
  mode: 'asset' | 'liability';
  currency: string;
  onAdd: (data: any) => void;
  onClose: () => void;
  config: SpendWiseConfig | null;
}

export function AddModal({
  mode,
  currency,
  onAdd,
  onClose,
  config,
}: AddModalProps) {
  const isStudent = config?.userRole === 'student';
  const isBusiness = config?.userRole === 'business';
  
  const rawTypes = mode === 'asset' ? ASSET_TYPES : LIABILITY_TYPES;
  
  const types = useMemo(() => {
    let filtered = [...rawTypes];
    
    if (mode === 'liability') {
      if (isStudent) {
        // Students usually don't have mortgages or business loans, but prioritize student loans
        filtered = filtered.filter(t => t.value !== 'mortgage' && t.value !== 'business_loan');
        const slIndex = filtered.findIndex(t => t.value === 'student_loan');
        if (slIndex > -1) {
          const [sl] = filtered.splice(slIndex, 1);
          filtered.unshift(sl);
        }
      } else if (isBusiness) {
        // Prioritize business loans
        const blIndex = filtered.findIndex(t => t.value === 'business_loan');
        if (blIndex > -1) {
          const [bl] = filtered.splice(blIndex, 1);
          filtered.unshift(bl);
        }
      }
    } else { // Assets
      if (isStudent) {
        // Prioritize education fund
        const edIndex = filtered.findIndex(t => t.value === 'education');
        if (edIndex > -1) {
          const [ed] = filtered.splice(edIndex, 1);
          filtered.unshift(ed);
        }
      } else if (isBusiness) {
        // Prioritize business assets
        const baIndex = filtered.findIndex(t => t.value === 'business');
        if (baIndex > -1) {
          const [ba] = filtered.splice(baIndex, 1);
          filtered.unshift(ba);
        }
      }
    }
    return filtered;
  }, [mode, isStudent, isBusiness, rawTypes]);

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
                    <span className="font-inter text-[length:var(--fs-caption)] font-semibold" style={{ color: selectedType === t.value ? t.color : 'var(--text-muted)' }}>
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

export default AddModal;
