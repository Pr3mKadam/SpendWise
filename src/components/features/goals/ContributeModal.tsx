import { useState } from 'react';
import { Zap } from 'lucide-react';
import Portal from '../../common/Portal';
import { SavingsGoal } from '../../types';

export function ContributeModal({
  goal,
  onContribute,
  onClose,
  currency,
}: {
  goal:         SavingsGoal;
  onContribute: (amount: number) => void;
  onClose:      () => void;
  currency:     string;
}) {
  const [amount, setAmount] = useState('');
  const remaining = goal.targetAmount - goal.savedAmount;
  const parsed    = parseFloat(amount);
  const isValid   = !isNaN(parsed) && parsed > 0 && parsed <= remaining;

  const quickAmts = [goal.monthlyContribution, 50, 100, 200].filter(a => a > 0 && a <= remaining);

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div className="card relative w-full max-w-sm animate-scale-in overflow-hidden rounded-2xl">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${goal.color}, transparent)` }} />
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <span style={{ fontSize: '28px' }}>{goal.emoji}</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{goal.name}</h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{currency}{remaining.toFixed(0)} remaining</p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {[...new Set(quickAmts)].map(a => (
              <button key={a} onClick={() => setAmount(String(a))}
                className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: '1.5px solid #edf2f7', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
                +{currency}{a}
              </button>
            ))}
            <button onClick={() => setAmount(String(remaining.toFixed(2)))}
              className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
              style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1.5px solid var(--teal-glow)', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
              Full {currency}{remaining.toFixed(0)}
            </button>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{currency}</span>
            <input
              type="number" min={1} max={remaining} step={0.01}
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none"
              style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
              onBlur={e => { e.target.style.borderColor = 'transparent'; }}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: '#f5f7fa', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={() => { if (isValid) { onContribute(parsed); onClose(); } }}
              disabled={!isValid}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'var(--teal)', fontFamily: 'var(--font-inter)', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed' }}>
              <Zap size={15} />
              Contribute
            </button>
          </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
