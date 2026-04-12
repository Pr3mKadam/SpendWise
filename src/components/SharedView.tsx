/**
 * SharedView.tsx — Premium Cloud-backed Shared Wallets UI
 * Uses Portal for modals (fixes z-index bleed-through),
 * proper error handling, beautiful design, full Supabase integration.
 */
import React, { useState, useMemo, useCallback, useEffect, Component, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSharedWallets, type SharedGroupMember, type SharedGoal } from '../hooks/useSharedWallets';
import { useAuth } from '../hooks/useAuth';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function relTime(iso: string) {
  const d = new Date(iso), diff = Date.now() - d.getTime(), m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const PURPOSE_EMOJI: Record<string, string> = { roommates: '🏠', friends: '🎉', family: '👨‍👩‍👧', other: '🤝' };
const MEMBER_EMOJIS = ['👑', '😊', '🌟', '🦊', '🐼', '🎯', '🦁', '🐸', '🌈', '🚀', '💎', '🎸'];
const GOAL_EMOJIS   = ['🎯', '✈️', '🏖️', '🏠', '🚗', '💍', '🎵', '🎮', '🏋️', '📱'];
const GOAL_COLORS   = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#ec4899'];

// ─── Design Tokens ──────────────────────────────────────────────────────────

const S = {
  card:    { background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '1.25rem' } as const,
  input:   { width: '100%', background: 'var(--bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  select:  { width: '100%', background: 'var(--bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, cursor: 'pointer', fontFamily: 'inherit' },
  label:   { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  fieldWrap: { marginBottom: '1rem' } as const,
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const Ico = {
  Plus:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Mail:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Wallet:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>,
  Split:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16" y1="8" x2="8" y2="16"/><circle cx="8.5" cy="8.5" r="2.5"/><circle cx="15.5" cy="15.5" r="2.5"/></svg>,
  Target:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Users:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Chevron: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Alert:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Spin:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'sw-spin 0.8s linear infinite', display: 'inline-block' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

// ─── Atoms ───────────────────────────────────────────────────────────────────

function Err({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.875rem', lineHeight: 1.4 }}>
      <Ico.Alert /><span>{msg}</span>
    </div>
  );
}
function Ok({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.82rem', marginBottom: '0.875rem' }}>
      <Ico.Check /><span>{msg}</span>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={S.fieldWrap}><span style={S.label}>{label}</span>{children}</div>;
}
function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...S.input, ...props.style }} />;
}
function Sel({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select {...p} style={S.select}>{children}</select>;
}
function Btn({ children, v = 'primary', full, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { v?: 'primary' | 'ghost' | 'danger' | 'dashed'; full?: boolean }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff' },
    ghost:   { background: 'var(--card-border)', color: 'var(--text)' },
    danger:  { background: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    dashed:  { background: 'transparent', color: 'var(--accent)', border: '1.5px dashed var(--accent)' },
  };
  return (
    <button type="button" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s', width: full ? '100%' : undefined, opacity: p.disabled ? 0.45 : 1, ...styles[v] }} {...p}>{children}</button>
  );
}
function Avatar({ emoji, size = 36 }: { emoji: string; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.44, flexShrink: 0 }}>{emoji}</div>;
}
function EmojiBtn({ e, active, onPick }: { e: string; active: boolean; onPick: (e: string) => void }) {
  return (
    <button type="button" onClick={() => onPick(e)} style={{ fontSize: 22, background: active ? 'var(--accent)' + '22' : 'var(--bg)', border: `2px solid ${active ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 10, padding: '4px 6px', cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1 }}>{e}</button>
  );
}
function StatusPill({ s }: { s: string }) {
  const c: Record<string, string> = { active: '#10b981', invited: '#f59e0b', left: '#94a3b8' };
  const col = c[s] ?? '#94a3b8';
  return <span style={{ fontSize: '0.66rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: col + '22', color: col, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s}</span>;
}

// ─── Portal Modal ─────────────────────────────────────────────────────────────

function Modal({ show, onClose, title, children, width = 460 }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }} />
      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: 'rgba(22, 27, 34, 0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'sw-modal-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><Ico.X /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ─── Create Group ────────────────────────────────────────────────────────────

function CreateGroupModal({ show, onClose, onSubmit, userName }: {
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MEMBER_EMOJIS.map(e => <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />)}
          </div>
        </Field>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '-0.25rem 0 1rem', lineHeight: 1.5 }}>
          You'll be added as <strong style={{ color: 'var(--text)' }}>{userName}</strong> {emoji}
        </p>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim()}>
          {busy ? <><Ico.Spin /> Creating…</> : '🚀 Create Group'}
        </Btn>
      </form>
    </Modal>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ show, onClose, onSubmit }: {
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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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

// ─── Wallet Entry Modal ──────────────────────────────────────────────────────

function WalletModal({ show, onClose, members, onSubmit, currency }: {
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

  useEffect(() => { if (active.length > 0 && !mid) setMid(active[0].id); }, [active.length]);

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

// ─── Expense Modal ────────────────────────────────────────────────────────────

function eq(ids: string[]) {
  if (!ids.length) return [];
  const p = Math.floor(10000 / ids.length) / 100;
  return ids.map((id, i) => ({ memberId: id, sharePercent: i === ids.length - 1 ? Math.round((100 - p * (ids.length - 1)) * 100) / 100 : p }));
}

function ExpenseModal({ show, onClose, members, onSubmit, currency }: {
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

  useEffect(() => { if (active.length > 0 && !paidBy) setPaidBy(active[0].id); }, [active.length]);

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
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '-0.5rem 0 1rem', lineHeight: 1.5 }}>Split equally among {active.length} active member{active.length !== 1 ? 's' : ''}.</p>
        <Btn full v="primary" type="submit" disabled={busy || !label.trim() || !amount || active.length === 0}>
          {busy ? <><Ico.Spin /> Saving…</> : 'Add Expense'}
        </Btn>
      </form>
    </Modal>
  );
}

// ─── Goal Modal ───────────────────────────────────────────────────────────────

function GoalModal({ show, onClose, onSubmit }: { show: boolean; onClose: () => void; onSubmit: (p: any) => Promise<void> }) {
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '1rem' }}>
          <div><span style={S.label}>Emoji</span><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{GOAL_EMOJIS.map(e => <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />)}</div></div>
          <div><span style={S.label}>Color</span><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>{GOAL_COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer' }} />)}</div></div>
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

// ─── Contribute Modal ─────────────────────────────────────────────────────────

function ContribModal({ show, onClose, goal, members, onSubmit, currency }: {
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

  useEffect(() => { if (active.length > 0 && !mid) setMid(active[0].id); }, [active.length]);

  if (!goal) return null;
  const saved = (goal.contributions ?? []).reduce((s, c) => s + c.amount, 0);
  const pct   = Math.min(100, Math.round((saved / goal.target_amount) * 100));

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
      <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 12, marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
          <span>{fmt(saved, currency)} saved</span>
          <span style={{ color: goal.color, fontWeight: 700 }}>{pct}% of {fmt(goal.target_amount, currency)}</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--card-border)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: goal.color, borderRadius: 4, transition: 'width 0.4s' }} />
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

// ─── Invite Banner ────────────────────────────────────────────────────────────

function InviteBanner({ invites, onAccept, onDecline }: {
  invites: { memberId: string; groupId: string; groupName: string; groupPurpose: string; invitedAt: string }[];
  onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
  if (!invites.length) return null;
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
        {invites.length} Pending Invite{invites.length !== 1 ? 's' : ''}
      </div>
      {invites.map(inv => (
        <div key={inv.memberId} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{PURPOSE_EMOJI[inv.groupPurpose] ?? '🤝'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{inv.groupName}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Invited {relTime(inv.invitedAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button type="button" onClick={() => onAccept(inv.memberId)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}><Ico.Check /> Accept</button>
            <button type="button" onClick={() => onDecline(inv.memberId)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}><Ico.X /> Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: '1.5rem', lineHeight: 1 }}>🤝</div>
      <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>No Shared Groups Yet</h2>
      <p style={{ margin: '0 0 2.5rem', color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.7, fontSize: '0.95rem' }}>
        Create a shared wallet to track joint expenses, split bills and save towards group goals — all synced in real time.
      </p>
      <button type="button" onClick={onCreateGroup} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
        <Ico.Plus /> Create First Group
      </button>
    </div>
  );
}

// ─── Group Selector ───────────────────────────────────────────────────────────

function GroupSelector({ groups, selectedId, onSelect, onCreate }: { groups: any[]; selectedId: string | null; onSelect: (id: string) => void; onCreate: () => void }) {
  const [open, setOpen] = useState(false);
  const sel = groups.find(g => g.id === selectedId);
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--card)', border: '1.5px solid var(--card-border)', borderRadius: 12, cursor: 'pointer', width: '100%' }}>
        <span style={{ fontSize: 20 }}>{PURPOSE_EMOJI[sel?.purpose ?? 'friends'] ?? '🤝'}</span>
        <span style={{ flex: 1, fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel?.name ?? 'Select Group'}</span>
        <Ico.Chevron />
      </button>
      {open && createPortal(
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 8888 }} />
          <div style={{ position: 'fixed', top: 64, left: 200, zIndex: 8889, background: 'var(--card)', border: '1.5px solid var(--card-border)', borderRadius: 14, minWidth: 220, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
            {groups.map(g => (
              <button key={g.id} type="button" onClick={() => { onSelect(g.id); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', width: '100%', background: selectedId === g.id ? 'var(--accent)14' : 'transparent', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{PURPOSE_EMOJI[g.purpose] ?? '🤝'}</span>
                <span style={{ color: 'var(--text)', fontWeight: selectedId === g.id ? 700 : 400, fontSize: '0.875rem' }}>{g.name}</span>
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--card-border)' }}>
              <button type="button" onClick={() => { onCreate(); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Ico.Plus /> New Group
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = 'wallet' | 'expenses' | 'goals' | 'members';
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'wallet',   label: 'Wallet',   icon: <Ico.Wallet /> },
  { id: 'expenses', label: 'Expenses', icon: <Ico.Split /> },
  { id: 'goals',    label: 'Goals',    icon: <Ico.Target /> },
  { id: 'members',  label: 'Members',  icon: <Ico.Users /> },
];

// ─── Wallet Tab ───────────────────────────────────────────────────────────────

function WalletTab({ entries, balance, members, onDelete, currency }: { entries: any[]; balance: number; members: SharedGroupMember[]; onDelete: (id: string) => void; currency: string }) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  return (
    <div>
      {/* Balance card */}
      <div style={{ background: 'linear-gradient(135deg, var(--accent), #6366f1)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shared Pot Balance</p>
        <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{fmt(balance, currency)}</p>
      </div>
      {entries.length === 0
        ? <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0', fontSize: '0.9rem' }}>No entries yet — add a contribution to get started.</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {entries.map(e => {
              const m = map[e.member_id]; const isIn = e.kind === 'contribution';
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isIn ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                  <Avatar emoji={m?.emoji ?? '👤'} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.label}</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m?.display_name ?? '?'} · {e.date}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: isIn ? '#10b981' : '#ef4444', fontSize: '0.875rem', flexShrink: 0 }}>{isIn ? '+' : '-'}{fmt(e.amount, currency)}</span>
                  <button type="button" onClick={() => onDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.5, padding: 3, display: 'flex' }}><Ico.Trash /></button>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

function ExpensesTab({ expenses, members, splitBalances, onDelete, currency }: { expenses: any[]; members: SharedGroupMember[]; splitBalances: Record<string, number>; onDelete: (id: string) => void; currency: string }) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  const active = members.filter(m => m.status === 'active');
  return (
    <div>
      {active.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 8, marginBottom: '1.25rem' }}>
          {active.map(m => {
            const bal = splitBalances[m.id] ?? 0;
            return (
              <div key={m.id} style={{ background: 'var(--bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <Avatar emoji={m.emoji} size={28} />
                <p style={{ margin: '5px 0 2px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.display_name}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: Math.abs(bal) < 0.01 ? 'var(--text-secondary)' : bal > 0 ? '#10b981' : '#ef4444' }}>
                  {Math.abs(bal) < 0.01 ? 'Settled ✓' : bal > 0 ? `+${fmt(bal, currency)}` : `-${fmt(Math.abs(bal), currency)}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {expenses.length === 0
        ? <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0', fontSize: '0.9rem' }}>No split expenses yet.</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {expenses.map(e => {
              const payer = map[e.paid_by_member_id];
              return (
                <div key={e.id} style={{ background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--card-border)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar emoji={payer?.emoji ?? '👤'} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{e.label}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Paid by {payer?.display_name ?? '?'} · {e.date} · {e.category}</p>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: '0.925rem' }}>{fmt(e.amount, currency)}</p>
                    <button type="button" onClick={() => onDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.7, padding: 3, display: 'flex' }}><Ico.Trash /></button>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

// ─── Goals Tab ────────────────────────────────────────────────────────────────

function GoalsTab({ goals, onDelete, onContrib, currency }: { goals: SharedGoal[]; onDelete: (id: string) => void; onContrib: (g: SharedGoal) => void; currency: string }) {
  if (!goals.length) return <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0', fontSize: '0.9rem' }}>No group goals yet.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {goals.map(g => {
        const saved = (g.contributions ?? []).reduce((s, c) => s + c.amount, 0);
        const pct   = Math.min(100, Math.round((saved / g.target_amount) * 100));
        const days  = Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000));
        return (
          <div key={g.id} style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--card-border)', padding: '1.25rem', borderLeft: `4px solid ${g.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>{g.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{g.name}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: {fmt(g.target_amount, currency)} · {days} days left</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => onContrib(g)} style={{ padding: '6px 12px', background: 'var(--card-border)', color: 'var(--text)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>+ Contribute</button>
                <button type="button" onClick={() => onDelete(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.5, display: 'flex', padding: 4 }}><Ico.Trash /></button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>{fmt(saved, currency)} saved</span>
              <span style={{ color: g.color, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--card-border)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: g.color, borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({ members, uid, isOwner, onRemove, onInvite }: { members: SharedGroupMember[]; uid: string | null; isOwner: boolean; onRemove: (id: string) => void; onInvite: () => void }) {
  return (
    <div>
      {isOwner && (
        <button type="button" onClick={onInvite} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'transparent', color: 'var(--accent)', border: '1.5px dashed var(--accent)', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', width: '100%', justifyContent: 'center', marginBottom: '1rem' }}>
          <Ico.Mail /> Invite Member by Email
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {members.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
            <Avatar emoji={m.emoji} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{m.display_name}</span>
                {m.role === 'owner' && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <StatusPill s={m.status} />
                {m.invited_email && <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{m.invited_email}</span>}
              </div>
            </div>
            {isOwner && m.user_id !== uid && m.role !== 'owner' && (
              <button type="button" onClick={() => onRemove(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.5, padding: 4, display: 'flex' }}><Ico.Trash /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error Boundary ────────────────────────────────────────────────────────────

class SharedErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) { console.error('[SharedView] Render error:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text)', fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: '1.5rem', lineHeight: 1.6 }}>
            The Shared Wallets view encountered an error. This is usually caused by a database connection issue.
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '8px 16px', borderRadius: 8, maxWidth: 500 }}>
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: '1.5rem', padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SharedView({ currency, userId: propUserId }: { currency: string; userId?: string | null }) {
  const { user } = useAuth();
  const userId   = propUserId ?? user?.id ?? null;
  const sw       = useSharedWallets(userId);
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'You';

  const [tab, setTab]               = useState<Tab>('wallet');
  const [showCreate, setCreate]     = useState(false);
  const [showInvite, setInvite]     = useState(false);
  const [showWallet, setWallet]     = useState(false);
  const [showExpense, setExpense]   = useState(false);
  const [showGoal, setGoal]         = useState(false);
  const [showContrib, setContrib]   = useState(false);
  const [activeGoal, setActiveGoal] = useState<SharedGoal | null>(null);

  const isOwner = useMemo(() => sw.selectedGroup?.created_by === userId, [sw.selectedGroup, userId]);

  const openContrib = useCallback((g: SharedGoal) => { setActiveGoal(g); setContrib(true); }, []);

  const handleAdd = useCallback(() => {
    if (tab === 'wallet')   { setWallet(true);  return; }
    if (tab === 'expenses') { setExpense(true); return; }
    if (tab === 'goals')    { setGoal(true);    return; }
    if (tab === 'members')  { setInvite(true);  return; }
  }, [tab]);

  const addLabel = tab === 'wallet' ? '+ Add Entry' : tab === 'expenses' ? '+ Add Expense' : tab === 'goals' ? '+ New Goal' : isOwner ? '+ Invite' : null;

  return (
    <SharedErrorBoundary>
      <div className="view-enter">
        {/* CSS keyframes injected once */}
        <style>{`
          @keyframes sw-spin { to { transform: rotate(360deg); } }
          @keyframes sw-modal-in { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        `}</style>

        <InviteBanner invites={sw.pendingInvites} onAccept={sw.acceptInvite} onDecline={sw.declineInvite} />

        {!sw.loading && sw.groups.length === 0 && sw.pendingInvites.length === 0 ? (
          <EmptyState onCreateGroup={() => setCreate(true)} />
        ) : (
          <>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <GroupSelector groups={sw.groups} selectedId={sw.selectedGroupId} onSelect={sw.setSelectedGroupId} onCreate={() => setCreate(true)} />
              {sw.selectedGroupId && addLabel && (
                <Btn v="primary" onClick={handleAdd}>{addLabel}</Btn>
              )}
              <Btn v="ghost" onClick={() => setCreate(true)}><Ico.Plus /> New Group</Btn>
            </div>

            {sw.error && <Err msg={sw.error} />}

            {sw.loading && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 2, display: 'inline-block', marginBottom: 12 }}><Ico.Spin /></div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading group…</p>
              </div>
            )}

            {!sw.loading && sw.selectedGroupId && (
              <>
                {/* Tab Bar */}
                <div style={{ display: 'flex', gap: 3, background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: '1rem' }}>
                  {TABS.map(t => (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.15s', fontFamily: 'inherit', background: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)', boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={S.card}>
                  {tab === 'wallet'   && <WalletTab entries={sw.walletEntries} balance={sw.walletBalance} members={sw.members} onDelete={sw.deleteWalletEntry} currency={currency} />}
                  {tab === 'expenses' && <ExpensesTab expenses={sw.expenses} members={sw.members} splitBalances={sw.splitBalances} onDelete={sw.deleteExpense} currency={currency} />}
                  {tab === 'goals'    && <GoalsTab goals={sw.goals} onDelete={sw.deleteGoal} onContrib={openContrib} currency={currency} />}
                  {tab === 'members'  && <MembersTab members={sw.members} uid={userId} isOwner={isOwner} onRemove={sw.removeMember} onInvite={() => setInvite(true)} />}
                </div>
              </>
            )}
          </>
        )}

        {/* Modals — all rendered via createPortal inside components */}
        <CreateGroupModal show={showCreate} onClose={() => setCreate(false)} onSubmit={async (n, p, e) => { await sw.createGroup(n, p, userName, e); }} userName={userName} />
        <InviteModal      show={showInvite}  onClose={() => setInvite(false)}  onSubmit={sw.inviteMember} />
        <WalletModal      show={showWallet}  onClose={() => setWallet(false)}  members={sw.members} onSubmit={sw.addWalletEntry} currency={currency} />
        <ExpenseModal     show={showExpense} onClose={() => setExpense(false)} members={sw.members} onSubmit={sw.addExpense}     currency={currency} />
        <GoalModal        show={showGoal}    onClose={() => setGoal(false)}    onSubmit={sw.addGoal} />
        <ContribModal     show={showContrib} onClose={() => setContrib(false)} goal={activeGoal} members={sw.members} onSubmit={sw.contributeToGoal} currency={currency} />
      </div>
    </SharedErrorBoundary>
  );
}
