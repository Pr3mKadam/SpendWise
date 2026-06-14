import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err } from '@/components/ui/Alert';
import { Ico } from '@/components/ui/Icons';
import { SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';

export function WalletModal({
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
  const [kind, setKind] = useState<string>('contribution');
  const [mid, setMid] = useState('');
  const defaultMid = useMemo(() => (active.length > 0 ? active[0].id : ''), [active]);
  const effectiveMid = mid || defaultMid;
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(formatLocalYYYYMMDD(new Date()));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
      await onSubmit({
        kind,
        memberId: effectiveMid,
        amount: a,
        label:
          label.trim() ||
          (kind === 'contribution'
            ? 'Contribution'
            : kind === 'spend_from_pot'
              ? 'Shared purchase'
              : 'Withdrawal'),
        date,
      });
      setAmount('');
      setLabel('');
      onClose();
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to add entry.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show={show} onClose={onClose} title="💰 Pot Transaction">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Type">
          <Sel value={kind} onChange={e => setKind(e.target.value)}>
            <option value="contribution">➕ Contribution (add money)</option>
            <option value="spend_from_pot">🛒 Spend from pot</option>
            <option value="withdrawal">💸 Withdrawal</option>
          </Sel>
        </Field>
        <Field label="Member">
          <Sel value={effectiveMid} onChange={e => setMid(e.target.value)}>
            {active.length === 0 && <option value="">No active members</option>}
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
        <Field label="Label (optional)">
          <Inp
            placeholder="e.g. Monthly contribution"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
        </Field>
        <Field label="Date">
          <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Field>
        <Btn full v="primary" type="submit" disabled={busy || !amount || !effectiveMid}>
          {busy ? (
            <>
              <Ico.Spin /> Saving…
            </>
          ) : (
            'Add Entry'
          )}
        </Btn>
      </form>
    </Modal>
  );
}

