import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err } from '@/components/ui/Alert';
import { Ico } from '@/components/ui/Icons';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';

export function ContribModal({
  show,
  onClose,
  goal,
  members,
  onSubmit,
  currency,
}: {
  show: boolean;
  onClose: () => void;
  goal: SharedGoal | null;
  members: SharedGroupMember[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (...a: any[]) => Promise<void>;
  currency: string;
}) {
  const active = members.filter(m => m.status === 'active');
  const [mid, setMid] = useState('');
  const defaultMid = useMemo(() => (active.length > 0 ? active[0].id : ''), [active]);
  const effectiveMid = mid || defaultMid;
  const [amount, setAmt] = useState('');
  const [date, setDate] = useState(formatLocalYYYYMMDD(new Date()));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!goal) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saved = (goal.contributions ?? []).reduce((s: number, c: any) => s + c.amount, 0);
  const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));

  const fmt = (v: number) => `${currency}${v.toLocaleString()}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal) return;
    const a = parseFloat(amount);
    if (!a || a <= 0) {
      setErr('Enter a valid amount.');
      return;
    }
    if (!effectiveMid) {
      setErr('Select a member.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit(goal.id, effectiveMid, a, date, note || undefined);
      setAmt('');
      setNote('');
      onClose();
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to add contribution.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show={show} onClose={onClose} title={`${goal.emoji} Contribute to ${goal.name}`}>
      <div className="p-4 bg-[var(--bg)] rounded-xl mb-5">
        <div className="flex justify-between text-[0.78rem] text-[var(--text-secondary)] mb-2">
          <span>{fmt(saved)} saved</span>
          <span style={{ color: goal.color, fontWeight: 700 }}>
            {pct}% of {fmt(goal.target_amount)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-400"
            style={{ width: `${pct}%`, background: goal.color }}
          />
        </div>
      </div>
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Contributing As">
          <Sel value={effectiveMid} onChange={e => setMid(e.target.value)}>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmt(e.target.value)}
          />
        </Field>
        <Field label="Date">
          <Inp
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Note (optional)">
          <Inp
            placeholder="e.g. Monthly top-up"
            value={note}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
          />
        </Field>
        <Btn full v="primary" type="submit" disabled={busy || !amount || !effectiveMid}>
          {busy ? (
            <>
              <Ico.Spin /> Saving…
            </>
          ) : (
            '💰 Add Contribution'
          )}
        </Btn>
      </form>
    </Modal>
  );
}
