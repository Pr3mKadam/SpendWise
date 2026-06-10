/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err, Ok } from '@/components/ui/Alert';
import { EmojiBtn } from '@/components/ui/Avatar';
import { Ico } from '@/components/ui/Icons';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';

// Constants
export const MEMBER_EMOJIS = [
  '👩',
  '👨',
  '👱‍♀️',
  '🧔',
  '👨‍🦱',
  '👩‍🦰',
  '😎',
  '🤓',
  '😊',
  '🤠',
  '👑',
  '👻',
  '👽',
  '🤖',
];
export const GOAL_EMOJIS = ['✈️', '🚗', '🏡', '💻', '📱', '🎁', '🎓', '💍', '🎉', '🎸', '🎮', '🚲'];
export const GOAL_COLORS = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
];

export function CreateGroupModal({
  show,
  onClose,
  onSubmit,
  userName,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (name: string, purpose: string, emoji: string) => Promise<void>;
  userName: string;
}) {
  const [name, setName] = useState('');
  const [purpose, setPur] = useState('friends');
  const [emoji, setEmoji] = useState('👑');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function reset() {
    setName('');
    setPur('friends');
    setEmoji('👑');
    setErr('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Please enter a group name.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit(name.trim(), purpose, emoji);
      reset();
      onClose();
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to create group — please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title="✨ Create a Group"
    >
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Group Name">
          <Inp
            placeholder="e.g. Goa Trip 2025"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Purpose">
          <Sel value={purpose} onChange={e => setPur(e.target.value)}>
            <option value="friends">🎉 Friends</option>
            <option value="roommates">🏠 Roommates</option>
            <option value="family">👨‍👩‍👧 Family</option>
            <option value="other">🤝 Other</option>
          </Sel>
        </Field>
        <Field label="Your Avatar">
          <div className="flex gap-1.5 flex-wrap">
            {MEMBER_EMOJIS.map(e => (
              <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />
            ))}
          </div>
        </Field>
        <p className="text-[0.8rem] text-[var(--text-secondary)] -mt-1 mb-4 leading-normal">
          You'll be added as <strong className="text-[var(--text)]">{userName}</strong> {emoji}
        </p>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim()}>
          {busy ? (
            <>
              <Ico.Spin /> Creating…
            </>
          ) : (
            '🚀 Create Group'
          )}
        </Btn>
      </form>
    </Modal>
  );
}

export function GroupQRModal({
  groupData,
  groupName,
  show,
  onClose,
}: {
  groupData: string;
  groupName: string;
  show: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !ref.current || !groupData) return;
    ref.current.innerHTML = '';

    try {
      // @ts-expect-error QRCode types not installed
      new window.QRCode(ref.current, { text: groupData, width: 180, height: 180 });
    } catch (e) {
      console.error('Failed to generate QR:', e);
    }
  }, [show, groupData]);

  if (!show) return null;
  return (
    <Modal show={show} onClose={onClose} title={`Join "${groupName}"`}>
      <div className="text-center pb-4">
        <p className="text-sm text-[var(--text-secondary)] mb-6">Scan to join this shared wallet</p>
        <div
          ref={ref}
          className="flex justify-center mx-auto mb-6 bg-white p-4 rounded-xl inline-block"
        />
        <Btn full v="primary" onClick={onClose}>
          Done
        </Btn>
      </div>
    </Modal>
  );
}

export function InviteModal({
  show,
  onClose,
  onSubmit,
  groupName,
  groupId,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string, emoji: string) => Promise<void>;
  groupName?: string;
  groupId?: string;
}) {
  const [email, setEmail] = useState('');
  const [dname, setDname] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  function reset() {
    setEmail('');
    setDname('');
    setEmoji('😊');
    setErr('');
    setOk('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setErr('Enter an email address.');
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setErr('Enter a valid email address (e.g., friend@gmail.com).');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit(email.trim(), dname.trim() || email.split('@')[0], emoji);

      // Mailto fallback
      if (groupName && groupId) {
        const subject = encodeURIComponent(`Join my SpendWise group: ${groupName}`);
        const body = encodeURIComponent(
          `Hi!\n\nI'd like you to join my shared wallet "${groupName}" on SpendWise.\n\n` +
            `Open SpendWise and enter this Group ID to join: ${groupId}\n\n` +
            `SpendWise — Smart Finance Tracker`
        );
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
      }

      setOk(`Invite sent to ${email.split('@')[0]}! They'll see it when they log in.`);
      setTimeout(() => {
        reset();
        onClose();
      }, 2000);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to send invite.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title="📨 Invite a Member"
    >
      <form onSubmit={submit}>
        <Err msg={err} />
        <Ok msg={ok} />
        {!ok && (
          <>
            <Field label="Email Address">
              <Inp
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="Display Name (optional)">
              <Inp
                placeholder="e.g. Rahul"
                value={dname}
                onChange={e => setDname(e.target.value)}
              />
            </Field>
            <Field label="Their Avatar">
              <div className="flex gap-1.5 flex-wrap">
                {MEMBER_EMOJIS.map(e => (
                  <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />
                ))}
              </div>
            </Field>
            <Btn full v="primary" type="submit" disabled={busy || !email.trim()}>
              {busy ? (
                <>
                  <Ico.Spin /> Sending…
                </>
              ) : (
                <>
                  <Ico.Mail /> Send Invite
                </>
              )}
            </Btn>
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  if (!window.location) return;
                  const inviteLink = `https://spendwise.app/join?group=${groupId || ''}`;
                  navigator.clipboard.writeText(inviteLink);
                  setOk('Invite link copied!');
                  setTimeout(() => setOk(''), 2000);
                }}
                className="bg-transparent border-none cursor-pointer text-[var(--teal)] font-bold text-sm hover:underline"
              >
                📋 Copy Invite Link
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

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

function eq(ids: string[]) {
  if (!ids.length) return [];
  const p = Math.floor(10000 / ids.length) / 100;
  return ids.map((id, i) => ({
    memberId: id,
    sharePercent: i === ids.length - 1 ? Math.round((100 - p * (ids.length - 1)) * 100) / 100 : p,
  }));
}

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

export function GoalModal({
  show,
  onClose,
  onSubmit,
}: {
  show: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (p: any) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [target, setTgt] = useState('');
  const [date, setDate] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseFloat(target);
    if (!name.trim()) {
      setErr('Enter a goal name.');
      return;
    }
    if (!t || t <= 0) {
      setErr('Enter a valid target amount.');
      return;
    }
    if (!date) {
      setErr('Select a target date.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit({ name: name.trim(), emoji, targetAmount: t, targetDate: date, color });
      setName('');
      setTgt('');
      setDate('');
      onClose();
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to create goal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show={show} onClose={onClose} title="🎯 New Group Goal">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Goal Name">
          <Inp
            placeholder="e.g. Goa Trip Fund"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Emoji
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {GOAL_EMOJIS.map(e => (
                <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Color
            </span>
            <div className="flex gap-1.5 flex-wrap mt-0.5">
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-[26px] h-[26px] rounded-full cursor-pointer"
                  style={{
                    background: c,
                    border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <Field label="Target Amount">
          <Inp
            type="number"
            min="1"
            placeholder="50000"
            value={target}
            onChange={e => setTgt(e.target.value)}
          />
        </Field>
        <Field label="Target Date">
          <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Field>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim() || !target || !date}>
          {busy ? (
            <>
              <Ico.Spin /> Creating…
            </>
          ) : (
            '🚀 Create Goal'
          )}
        </Btn>
      </form>
    </Modal>
  );
}

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
