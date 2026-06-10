import { useState } from 'react';
import { Coins, Calendar, Gift } from 'lucide-react';
import { useStore } from '@/store';

export function AllowanceCard() {
  const parentalState = useStore(s => s.parentalState);
  const setAllowance = useStore(s => s.setAllowance);
  const setSpendingCap = useStore(s => s.setSpendingCap);
  const payAllowance = useStore(s => s.payAllowance);
  const getAllowanceDue = useStore(s => s.getAllowanceDue);

  const [editMode, setEditMode] = useState(false);
  const [amount, setAmount] = useState(String(parentalState.allowanceAmount || ''));
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>(parentalState.allowanceFrequency);
  const [cap, setCap] = useState(String(parentalState.spendingCapWeekly || ''));

  const allowanceDue = getAllowanceDue();

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) return;
    setAllowance(numAmount, frequency);
    const capNum = parseFloat(cap);
    setSpendingCap(isNaN(capNum) ? null : capNum);
    setEditMode(false);
  };

  if (!editMode) {
    return (
      <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Coins size={16} className="text-purple-500" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Allowance</h3>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="text-xs font-semibold text-[var(--teal)] bg-transparent border-none cursor-pointer"
          >
            Configure
          </button>
        </div>

        {parentalState.allowanceAmount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Amount</span>
              <span className="font-bold text-[var(--text-primary)]">₹{parentalState.allowanceAmount}/{parentalState.allowanceFrequency === 'weekly' ? 'wk' : 'mo'}</span>
            </div>
            {parentalState.spendingCapWeekly && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Weekly cap</span>
                <span className="font-bold text-[var(--text-primary)]">₹{parentalState.spendingCapWeekly}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Last payout</span>
              <span className="font-medium text-[var(--text-primary)]">
                {parentalState.lastAllowancePayout
                  ? new Date(parentalState.lastAllowancePayout + 'T00:00:00').toLocaleDateString('en-IN')
                  : 'Never'}
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={payAllowance}
                disabled={!allowanceDue}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 bg-[var(--teal)] text-white border-none cursor-pointer disabled:cursor-not-allowed"
              >
                <Gift size={14} />
                {allowanceDue ? 'Pay Allowance Now' : 'Already paid this period'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">Set a weekly or monthly allowance to automate pocket money.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
      <h3 className="font-bold text-sm text-[var(--text-primary)] mb-3">Configure Allowance</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={0}
            className="w-full rounded-xl px-3 py-2 text-sm bg-[var(--surface-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)]"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Frequency</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFrequency('weekly')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer ${frequency === 'weekly' ? 'bg-purple-500/20 text-purple-500' : 'bg-[var(--surface-input)] text-[var(--text-muted)]'}`}
            >
              <Calendar size={12} /> Weekly
            </button>
            <button
              onClick={() => setFrequency('monthly')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer ${frequency === 'monthly' ? 'bg-purple-500/20 text-purple-500' : 'bg-[var(--surface-input)] text-[var(--text-muted)]'}`}
            >
              <Calendar size={12} /> Monthly
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Weekly spending cap (₹) — optional</label>
          <input
            type="number"
            value={cap}
            onChange={e => setCap(e.target.value)}
            min={0}
            className="w-full rounded-xl px-3 py-2 text-sm bg-[var(--surface-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)]"
            placeholder="Leave empty for no cap"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-[var(--teal)] text-white border-none cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-[var(--surface-input)] text-[var(--text-muted)] border-none cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
