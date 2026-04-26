import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Btn } from '../ui/Button';
import { Field, Inp } from '../ui/Input';
import { Sel } from '../ui/Select';
import { Err, Ok } from '../ui/Alert';
import { EmojiBtn } from '../ui/Avatar';
import { Ico } from '../ui/Icons';
import { SharedGoal, SharedGroupMember } from '../../hooks/useSharedWallets';

// Constants
export const MEMBER_EMOJIS = ['👩','👨','👱‍♀️','🧔','👨‍🦱','👩‍🦰','😎','🤓','😊','🤠','👑','👻','👽','🤖'];
export const GOAL_EMOJIS   = ['✈️','🚗','🏡','💻','📱','🎁','🎓','💍','🎉','🎸','🎮','🚲'];
export const GOAL_COLORS   = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#14b8a6'];

export function CreateGroupModal({ show, onClose, onSubmit, userName }: {
  show: boolean; onClose: () => void;
  onSubmit: (name: string, purpose: string, emoji: string) => Promise<void>;
  userName: string;
}) {
  const [name, setName]   = useState('');
  const [purpose, setPur] = useState('friends');
  const [emoji, setEmoji] = useState('👑');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');

  function reset() { setName(''); setPur('friends'); setEmoji('👑'); setErr(''); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr('Please enter a group name.'); return; }
    setBusy(true); setErr('');
    try { await onSubmit(name.trim(), purpose, emoji); reset(); onClose(); }
    catch (ex: any) { setErr(ex?.message ?? 'Failed to create group — please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal show={show} onClose={() => { reset(); onClose(); }} title="✨ Create a Group">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Group Name">
          <Inp placeholder="e.g. Goa Trip 2025" value={name} onChange={e => setName(e.target.value)} autoFocus />
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
            {MEMBER_EMOJIS.map(e => <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />)}
          </div>
        </Field>
        <p className="text-[0.8rem] text-[var(--text-secondary)] -mt-1 mb-4 leading-normal">
          You'll be added as <strong className="text-[var(--text)]">{userName}</strong> {emoji}
        </p>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim()}>
          {busy ? <><Ico.Spin /> Creating…</> : '🚀 Create Group'}
        </Btn>
      </form>
    </Modal>
  );
}

export function InviteModal({ show, onClose, onSubmit }: {
  show: boolean; onClose: () => void;
  onSubmit: (email: string, name: string, emoji: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [dname, setDname] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');
  const [ok, setOk]       = useState('');

  function reset() { setEmail(''); setDname(''); setEmoji('😊'); setErr(''); setOk(''); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setErr('Enter an email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Enter a valid email.'); return; }
    setBusy(true); setErr('');
    try {
      await onSubmit(email.trim(), dname.trim() || email.split('@')[0], emoji);
      setOk(`Invite sent to ${email.split('@')[0]}! They'll see it when they log in.`);
      setTimeout(() => { reset(); onClose(); }, 2000);
    } catch (ex: any) { setErr(ex?.message ?? 'Failed to send invite.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal show={show} onClose={() => { reset(); onClose(); }} title="📨 Invite a Member">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Ok msg={ok} />
        {!ok && <>
          <Field label="Email Address">
            <Inp type="email" placeholder="friend@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </Field>
          <Field label="Display Name (optional)">
            <Inp placeholder="e.g. Rahul" value={dname} onChange={e => setDname(e.target.value)} />
          </Field>
          <Field label="Their Avatar">
            <div className="flex gap-1.5 flex-wrap">
              {MEMBER_EMOJIS.map(e => <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />)}
            </div>
          </Field>
          <Btn full v="primary" type="submit" disabled={busy || !email.trim()}>
            {busy ? <><Ico.Spin /> Sending…</> : <><Ico.Mail /> Send Invite</>}
          </Btn>
        </>}
      </form>
    </Modal>
  );
}

export function WalletModal({ show, onClose, members, onSubmit, currency }: {
  show: boolean; onClose: () => void; members: SharedGroupMember[];
  onSubmit: (p: any) => Promise<void>; currency: string;
}) {
  const active = members.filter(m => m.status === 'active');
  const [kind, setKind]     = useState<string>('contribution');
  const [mid, setMid]       = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel]   = useState('');
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState('');

  useEffect(() => { if (active.length > 0 && !mid) setMid(active[0].id); }, [active.length, mid]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!a || a <= 0) { setErr('Enter a valid amount.'); return; }
    if (!mid) { setErr('Select a member.'); return; }
    setBusy(true); setErr('');
    try {
      await onSubmit({ kind, memberId: mid, amount: a, label: label.trim() || (kind === 'contribution' ? 'Contribution' : kind === 'spend_from_pot' ? 'Shared purchase' : 'Withdrawal'), date });
      setAmount(''); setLabel(''); onClose();
    } catch (ex: any) { setErr(ex?.message ?? 'Failed to add entry.'); }
    finally { setBusy(false); }
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
          <Sel value={mid} onChange={e => setMid(e.target.value)}>
            {active.length === 0 && <option value="">No active members</option>}
            {active.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.display_name}</option>)}
          </Sel>
        </Field>
        <Field label={`Amount (${currency})`}>
          <Inp type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
        </Field>
        <Field label="Label (optional)">
          <Inp placeholder="e.g. Monthly contribution" value={label} onChange={e => setLabel(e.target.value)} />
        </Field>
        <Field label="Date">
          <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Field>
        <Btn full v="primary" type="submit" disabled={busy || !amount || !mid}>
          {busy ? <><Ico.Spin /> Saving…</> : 'Add Entry'}
        </Btn>
      </form>
    </Modal>
  );
}

function eq(ids: string[]) {
  if (!ids.length) return [];
  const p = Math.floor(10000 / ids.length) / 100;
  return ids.map((id, i) => ({ memberId: id, sharePercent: i === ids.length - 1 ? Math.round((100 - p * (ids.length - 1)) * 100) / 100 : p }));
}

export function ExpenseModal({ show, onClose, members, onSubmit, currency }: {
  show: boolean; onClose: () => void; members: SharedGroupMember[];
  onSubmit: (p: any) => Promise<void>; currency: string;
}) {
  const active = members.filter(m => m.status === 'active');
  const [label, setLabel]   = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [cat, setCat]       = useState('General');
  const [amount, setAmount] = useState('');
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState('');

  useEffect(() => { if (active.length > 0 && !paidBy) setPaidBy(active[0].id); }, [active.length, paidBy]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!label.trim()) { setErr('Enter a description.'); return; }
    if (!a || a <= 0) { setErr('Enter a valid amount.'); return; }
    if (!paidBy) { setErr('Select who paid.'); return; }
    setBusy(true); setErr('');
    try {
      await onSubmit({ paidByMemberId: paidBy, label: label.trim(), category: cat, amount: a, date, splits: eq(active.map(m => m.id)) });
      setLabel(''); setAmount(''); onClose();
    } catch (ex: any) { setErr(ex?.message ?? 'Failed to add expense.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal show={show} onClose={onClose} title="🧾 Add Split Expense">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Description"><Inp placeholder="e.g. Dinner at Makhani" value={label} onChange={e => setLabel(e.target.value)} autoFocus /></Field>
        <Field label="Paid By">
          <Sel value={paidBy} onChange={e => setPaidBy(e.target.value)}>
            {active.length === 0 && <option value="">No active members</option>}
            {active.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.display_name}</option>)}
          </Sel>
        </Field>
        <Field label={`Amount (${currency})`}><Inp type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
        <Field label="Category">
          <Sel value={cat} onChange={e => setCat(e.target.value)}>
            {['General','Food','Transport','Entertainment','Shopping','Utilities','Health'].map(c => <option key={c}>{c}</option>)}
          </Sel>
        </Field>
        <Field label="Date"><Inp type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        <p className="text-[0.78rem] text-[var(--text-secondary)] -mt-2 mb-4 leading-normal">Split equally among {active.length} active member{active.length !== 1 ? 's' : ''}.</p>
        <Btn full v="primary" type="submit" disabled={busy || !label.trim() || !amount || active.length === 0}>
          {busy ? <><Ico.Spin /> Saving…</> : 'Add Expense'}
        </Btn>
      </form>
    </Modal>
  );
}

export function GoalModal({ show, onClose, onSubmit }: { show: boolean; onClose: () => void; onSubmit: (p: any) => Promise<void> }) {
  const [name, setName]   = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [target, setTgt]  = useState('');
  const [date, setDate]   = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseFloat(target);
    if (!name.trim()) { setErr('Enter a goal name.'); return; }
    if (!t || t <= 0) { setErr('Enter a valid target amount.'); return; }
    if (!date) { setErr('Select a target date.'); return; }
    setBusy(true); setErr('');
    try { await onSubmit({ name: name.trim(), emoji, targetAmount: t, targetDate: date, color }); setName(''); setTgt(''); setDate(''); onClose(); }
    catch (ex: any) { setErr(ex?.message ?? 'Failed to create goal.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal show={show} onClose={onClose} title="🎯 New Group Goal">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Goal Name"><Inp placeholder="e.g. Goa Trip Fund" value={name} onChange={e => setName(e.target.value)} autoFocus /></Field>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><span className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Emoji</span><div className="flex gap-1.5 flex-wrap">{GOAL_EMOJIS.map(e => <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />)}</div></div>
          <div><span className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Color</span><div className="flex gap-1.5 flex-wrap mt-0.5">{GOAL_COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className="w-[26px] h-[26px] rounded-full cursor-pointer" style={{ background: c, border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}` }} />)}</div></div>
        </div>
        <Field label="Target Amount"><Inp type="number" min="1" placeholder="50000" value={target} onChange={e => setTgt(e.target.value)} /></Field>
        <Field label="Target Date"><Inp type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim() || !target || !date}>
          {busy ? <><Ico.Spin /> Creating…</> : '🚀 Create Goal'}
        </Btn>
      </form>
    </Modal>
  );
}

export function ContribModal({ show, onClose, goal, members, onSubmit, currency }: {
  show: boolean; onClose: () => void; goal: SharedGoal | null;
  members: SharedGroupMember[]; onSubmit: (...a: any[]) => Promise<void>; currency: string;
}) {
  const active = members.filter(m => m.status === 'active');
  const [mid, setMid]   = useState('');
  const [amount, setAmt] = useState('');
  const [date, setDate]  = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote]  = useState('');
  const [busy, setBusy]  = useState(false);
  const [err, setErr]    = useState('');

  useEffect(() => { if (active.length > 0 && !mid) setMid(active[0].id); }, [active.length, mid]);

  if (!goal) return null;
  const saved = (goal.contributions ?? []).reduce((s: number, c: any) => s + c.amount, 0);
  const pct   = Math.min(100, Math.round((saved / goal.target_amount) * 100));

  const fmt = (v: number) => `${currency}${v.toLocaleString()}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal) return;
    const a = parseFloat(amount);
    if (!a || a <= 0) { setErr('Enter a valid amount.'); return; }
    if (!mid) { setErr('Select a member.'); return; }
    setBusy(true); setErr('');
    try { await onSubmit(goal.id, mid, a, date, note || undefined); setAmt(''); setNote(''); onClose(); }
    catch (ex: any) { setErr(ex?.message ?? 'Failed to add contribution.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal show={show} onClose={onClose} title={`${goal.emoji} Contribute to ${goal.name}`}>
      <div className="p-4 bg-[var(--bg)] rounded-xl mb-5">
        <div className="flex justify-between text-[0.78rem] text-[var(--text-secondary)] mb-2">
          <span>{fmt(saved)} saved</span>
          <span style={{ color: goal.color, fontWeight: 700 }}>{pct}% of {fmt(goal.target_amount)}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-400" style={{ width: `${pct}%`, background: goal.color }} />
        </div>
      </div>
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Contributing As">
          <Sel value={mid} onChange={e => setMid(e.target.value)}>
            {active.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.display_name}</option>)}
          </Sel>
        </Field>
        <Field label={`Amount (${currency})`}><Inp type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmt(e.target.value)} /></Field>
        <Field label="Date"><Inp type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        <Field label="Note (optional)"><Inp placeholder="e.g. Monthly top-up" value={note} onChange={e => setNote(e.target.value)} /></Field>
        <Btn full v="primary" type="submit" disabled={busy || !amount || !mid}>
          {busy ? <><Ico.Spin /> Saving…</> : '💰 Add Contribution'}
        </Btn>
      </form>
    </Modal>
  );
}
