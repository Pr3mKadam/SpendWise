import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err } from '@/components/ui/Alert';
import { Ico } from '@/components/ui/Icons';
import { SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';

export function ExpenseModal({
  show,
  onClose,
  members,
  onSubmit,
  currency,
}: {
  show: boolean;
  onClose: () => void;
  members: SharedGroupMember[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (p: any) => Promise<void>;
  currency: string;
}) {
  const active = members.filter(m => m.status === 'active');
  const [label, setLabel] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const defaultPaidBy = useMemo(() => (active.length > 0 ? active[0].id : ''), [active]);
  const effectivePaidBy = paidBy || defaultPaidBy;
  const [cat, setCat] = useState('General');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatLocalYYYYMMDD(new Date()));

  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (active.length > 0) {
      const initial: Record<string, number> = {};
      const p = Math.floor(10000 / active.length) / 100;
      active.forEach((m, i) => {
        initial[m.id] =
          i === active.length - 1 ? Math.round((100 - p * (active.length - 1)) * 100) / 100 : p;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomSplits(initial);
    }
  }, [active.length]);
  /* eslint-enable react-hooks/exhaustive-deps */

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!label.trim()) {
      setErr('Enter a description.');
      return;
    }
    if (!a || a <= 0) {
      setErr('Enter a valid amount.');
      return;
    }
    if (!effectivePaidBy) {
      setErr('Select who paid.');
      return;
    }

    let splitsToSave;
    if (splitMode === 'equal') {
      splitsToSave = eq(active.map(m => m.id));
    } else {
      const total = Object.values(customSplits).reduce((sum, val) => sum + (val || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        setErr(`Total split must be exactly 100% (currently ${total.toFixed(1)}%).`);
        return;
      }
      splitsToSave = active.map(m => ({ memberId: m.id, sharePercent: customSplits[m.id] || 0 }));
    }

    setBusy(true);
    setErr('');
    try {
      await onSubmit({
        paidByMemberId: effectivePaidBy,
        label: label.trim(),
        category: cat,
        amount: a,
        date,
        splits: splitsToSave,
      });
      setLabel('');
      setAmount('');
      setSplitMode('equal');
      onClose();
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to add expense.');
    } finally {
      setBusy(false);
    }
  }

  const customTotal = Object.values(customSplits).reduce((s, v) => s + (v || 0), 0);

  return (
    <Modal show={show} onClose={onClose} title="🧾 Add Split Expense">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Description">
          <Inp
            placeholder="e.g. Dinner at Makhani"
            value={label}
            onChange={e => setLabel(e.target.value)}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Paid By">
            <Sel value={effectivePaidBy} onChange={e => setPaidBy(e.target.value)}>
              {active.length === 0 && <option value="">No members</option>}
              {active.map(m => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.display_name}
                </option>
              ))}
            </Sel>
          </Field>
          <Field label={`Amount (${currency})`}>
            <Inp
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Category">
            <Sel value={cat} onChange={e => setCat(e.target.value)}>
              {[
                'General',
                'Food',
                'Transport',
                'Entertainment',
                'Shopping',
                'Utilities',
                'Health',
              ].map(c => (
                <option key={c}>{c}</option>
              ))}
            </Sel>
          </Field>
          <Field label="Date">
            <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Field>
        </div>

        <div className="bg-[var(--bg)] border border-[var(--card-border)] rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="m-0 text-[0.85rem] font-bold text-[var(--text)]">Split Method</h4>
            <div className="flex bg-[var(--card)] rounded-lg p-0.5 border border-[var(--card-border)]">
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`px-3 py-1 text-[0.7rem] font-bold rounded-md transition-colors cursor-pointer border-none ${splitMode === 'equal' ? 'bg-[var(--teal)] text-white shadow-sm' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                Equal
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('custom')}
                className={`px-3 py-1 text-[0.7rem] font-bold rounded-md transition-colors cursor-pointer border-none ${splitMode === 'custom' ? 'bg-[var(--teal)] text-white shadow-sm' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                Custom %
              </button>
            </div>
          </div>

          {splitMode === 'equal' ? (
            <p className="m-0 text-[0.8rem] text-[var(--text-secondary)] text-center py-2 bg-[var(--card)] rounded-lg border border-[var(--card-border)]/50">
              Split equally among <strong className="text-[var(--text)]">{active.length}</strong>{' '}
              active member{active.length !== 1 ? 's' : ''}.
              {amount && !isNaN(parseFloat(amount)) && (
                <span className="block mt-1 font-bold text-[var(--teal)]">
                  ~ {currency}
                  {(parseFloat(amount) / active.length).toFixed(2)} each
                </span>
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              {active.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-[1rem] shrink-0 border border-[var(--card-border)]">
                    {m.emoji}
                  </div>
                  <p className="m-0 flex-1 min-w-0 text-[0.8rem] font-semibold text-[var(--text)] truncate">
                    {m.display_name}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        className="w-16 h-8 bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-2 text-[0.8rem] text-right font-bold focus:border-[var(--teal)] outline-none"
                        value={customSplits[m.id] || ''}
                        onChange={e =>
                          setCustomSplits(prev => ({
                            ...prev,
                            [m.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.7rem] text-[var(--text-secondary)] font-bold opacity-50">
                        %
                      </span>
                    </div>
                    {amount && !isNaN(parseFloat(amount)) && (
                      <span className="w-16 text-right text-[0.75rem] font-bold text-[var(--text-secondary)]">
                        {currency}
                        {((parseFloat(amount) * (customSplits[m.id] || 0)) / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div
                className={`mt-2 p-2 rounded-lg text-center text-[0.75rem] font-bold transition-colors ${Math.abs(customTotal - 100) < 0.1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
              >
                Total: {customTotal.toFixed(1)}%{' '}
                {Math.abs(customTotal - 100) > 0.1 && '(Must equal 100%)'}
              </div>
            </div>
          )}
        </div>

        <Btn
          full
          v="primary"
          type="submit"
          disabled={
            busy ||
            !label.trim() ||
            !amount ||
            active.length === 0 ||
            (splitMode === 'custom' && Math.abs(customTotal - 100) > 0.1)
          }
        >
          {busy ? (
            <>
              <Ico.Spin /> Saving…
            </>
          ) : (
            'Add Expense'
          )}
        </Btn>
      </form>
    </Modal>
  );
}
