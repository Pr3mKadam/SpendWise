import { useState, useEffect } from 'react';
import {
  Users, Wallet, Receipt, Target, Plus, Trash2, Home, Heart, UserCircle2,
  AlertTriangle, ChevronRight,
} from 'lucide-react';
import type { HouseholdPurpose, HouseholdMember, SharedExpenseSplit } from '../types';
import { useSharedHousehold, equalSplits } from '../hooks/useSharedHousehold';

const PURPOSE_META: { id: HouseholdPurpose; label: string; icon: typeof Home; hint: string }[] = [
  { id: 'roommates', label: 'Roommates', icon: Home, hint: 'Rent, utilities, groceries' },
  { id: 'friends',    label: 'Friends',   icon: Users, hint: 'Trips, events, shared hobbies' },
  { id: 'family',     label: 'Family',    icon: Heart, hint: 'Parents & kids, household pool' },
  { id: 'other',      label: 'Other',     icon: UserCircle2, hint: 'Any shared money goal' },
];

type TabId = 'group' | 'wallet' | 'splits' | 'goals';

const GOAL_COLORS = ['#14b8a6', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#ec4899'];

function fmtMoney(sym: string, n: number) {
  return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function memberName(members: HouseholdMember[], id: string) {
  return members.find(x => x.id === id)?.name ?? 'Unknown';
}

function memberEmoji(members: HouseholdMember[], id: string) {
  return members.find(x => x.id === id)?.emoji ?? '👤';
}

export default function SharedView({ currency = '$' }: { currency?: string }) {
  const sh = useSharedHousehold();
  const [tab, setTab] = useState<TabId>('group');

  const [setupName, setSetupName] = useState('');
  const [setupPurpose, setSetupPurpose] = useState<HouseholdPurpose>('roommates');
  const [setupRows, setSetupRows] = useState<{ name: string; emoji: string; relation: string }[]>([
    { name: '', emoji: '👤', relation: '' },
    { name: '', emoji: '👤', relation: '' },
  ]);

  const [newMember, setNewMember] = useState({ name: '', emoji: '👤', relation: '' });
  const [localGroupName, setLocalGroupName] = useState('');
  const [disbandConfirm, setDisbandConfirm] = useState(false);

  const [wKind, setWKind] = useState<'contribution' | 'spend_from_pot' | 'withdrawal'>('contribution');
  const [wAmount, setWAmount] = useState('');
  const [wMember, setWMember] = useState('');
  const [wLabel, setWLabel] = useState('');
  const [wDate, setWDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [exLabel, setExLabel] = useState('');
  const [exCat, setExCat] = useState('General');
  const [exAmount, setExAmount] = useState('');
  const [exPaidBy, setExPaidBy] = useState('');
  const [exDate, setExDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [exSplits, setExSplits] = useState<SharedExpenseSplit[]>([]);

  const [gName, setGName] = useState('');
  const [gEmoji, setGEmoji] = useState('🎯');
  const [gTarget, setGTarget] = useState('');
  const [gDate, setGDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [gMembers, setGMembers] = useState<string[]>([]);
  const [gColor, setGColor] = useState(GOAL_COLORS[0]);

  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribMember, setContribMember] = useState('');
  const [contribDate, setContribDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [contribNote, setContribNote] = useState('');

  const members = sh.settings?.members ?? [];

  useEffect(() => {
    if (sh.settings) setLocalGroupName(sh.settings.name);
  }, [sh.settings?.name, sh.settings]);

  const startHousehold = () => {
    const rows = setupRows.filter(r => r.name.trim());
    if (rows.length === 0) return;
    sh.createHousehold(
      setupName,
      setupPurpose,
      rows.map(r => ({ name: r.name, emoji: r.emoji || '👤', relation: r.relation || undefined })),
    );
    setSetupName('');
    setSetupRows([
      { name: '', emoji: '👤', relation: '' },
      { name: '', emoji: '👤', relation: '' },
    ]);
    setTab('wallet');
  };

  const initExpenseForm = () => {
    if (!members.length) return;
    setExPaidBy(members[0].id);
    setExSplits(equalSplits(members.map(m => m.id)));
  };

  const submitExpense = () => {
    const amt = parseFloat(exAmount.replace(/,/g, ''));
    if (!Number.isFinite(amt) || amt <= 0) return;
    const ok = sh.addSharedExpense({
      date: exDate,
      label: exLabel,
      category: exCat,
      amount: amt,
      paidByMemberId: exPaidBy,
      splits: exSplits,
    });
    if (ok) {
      setExLabel('');
      setExAmount('');
      initExpenseForm();
    }
  };

  useEffect(() => {
    if (tab !== 'goals' || members.length === 0) return;
    setGMembers(prev => {
      const valid = prev.filter(id => members.some(m => m.id === id));
      return valid.length > 0 ? valid : members.map(m => m.id);
    });
    setContribMember(prev => (members.some(m => m.id === prev) ? prev : members[0]!.id));
  }, [tab, members]);

  const submitGoal = () => {
    const t = parseFloat(gTarget.replace(/,/g, ''));
    if (!Number.isFinite(t) || t <= 0 || gMembers.length === 0) return;
    const ids = gMembers.filter(id => members.some(m => m.id === id));
    if (ids.length === 0) return;
    sh.addSharedGoal({
      name: gName,
      emoji: gEmoji,
      targetAmount: t,
      targetDate: gDate,
      color: gColor,
      memberIds: ids,
    });
    setGName('');
    setGTarget('');
  };

  const submitContrib = () => {
    if (!contribGoalId) return;
    const a = parseFloat(contribAmount.replace(/,/g, ''));
    if (!Number.isFinite(a) || a <= 0) return;
    sh.contributeToGoal(contribGoalId, contribMember, a, contribDate, contribNote);
    setContribAmount('');
    setContribNote('');
    setContribGoalId(null);
  };

  if (!sh.hydrated) {
    return (
      <div className="view-enter flex items-center justify-center min-h-[240px]">
        <p className="text-caption">Loading…</p>
      </div>
    );
  }

  if (!sh.settings) {
    return (
      <div className="view-enter max-w-lg mx-auto space-y-6">
        <div className="text-center mb-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-3" style={{ background: 'var(--teal-dim)' }}>
            <Users size={28} style={{ color: 'var(--teal)' }} />
          </div>
          <h2 className="text-headline" style={{ fontFamily: 'var(--font-manrope)' }}>Shared money</h2>
          <p className="text-caption mt-2 max-w-md mx-auto">
            Track a joint wallet, split bills with roommates or friends, and save together toward a group goal.
            Everything stays on this device — perfect for coordinating with people you live or plan with.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="text-caption font-semibold block mb-1">Group name</label>
            <input
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
              placeholder="e.g. Flat 4B, Weekend crew, Smith family"
              className="w-full rounded-xl px-3 py-2.5 text-sm"
              style={{ border: '2px solid #edf2f7', fontFamily: 'var(--font-inter)' }}
            />
          </div>

          <div>
            <p className="text-caption font-semibold mb-2">Who is this for?</p>
            <div className="grid grid-cols-2 gap-2">
              {PURPOSE_META.map(p => {
                const Icon = p.icon;
                const sel = setupPurpose === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSetupPurpose(p.id)}
                    className="rounded-xl p-3 text-left transition-all"
                    style={{
                      border: sel ? '2px solid var(--teal)' : '2px solid #edf2f7',
                      background: sel ? 'var(--teal-dim)' : '#fafafa',
                    }}
                  >
                    <Icon size={18} style={{ color: sel ? 'var(--teal)' : 'var(--text-muted)' }} />
                    <p className="text-sm font-semibold mt-1" style={{ fontFamily: 'var(--font-manrope)' }}>{p.label}</p>
                    <p className="text-[10px] text-muted mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-caption font-semibold mb-2">People in the group</p>
            <div className="space-y-2">
              {setupRows.map((row, i) => (
                <div key={i} className="flex gap-2 flex-wrap">
                  <input
                    value={row.emoji}
                    onChange={e => setSetupRows(rs => rs.map((r, j) => j === i ? { ...r, emoji: e.target.value } : r))}
                    className="w-12 rounded-lg text-center text-lg"
                    style={{ border: '2px solid #edf2f7' }}
                    maxLength={4}
                  />
                  <input
                    value={row.name}
                    onChange={e => setSetupRows(rs => rs.map((r, j) => j === i ? { ...r, name: e.target.value } : r))}
                    placeholder="Name"
                    className="flex-1 min-w-[120px] rounded-xl px-3 py-2 text-sm"
                    style={{ border: '2px solid #edf2f7' }}
                  />
                  <input
                    value={row.relation}
                    onChange={e => setSetupRows(rs => rs.map((r, j) => j === i ? { ...r, relation: e.target.value } : r))}
                    placeholder="Role (optional)"
                    className="flex-1 min-w-[100px] rounded-xl px-3 py-2 text-sm"
                    style={{ border: '2px solid #edf2f7' }}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 text-xs font-semibold"
              style={{ color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setSetupRows(rs => [...rs, { name: '', emoji: '👤', relation: '' }])}
            >
              + Add another person
            </button>
          </div>

          <button
            type="button"
            onClick={startHousehold}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
          >
            Create group
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof Wallet }[] = [
    { id: 'group', label: 'Group', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'splits', label: 'Split expenses', icon: Receipt },
    { id: 'goals', label: 'Group goals', icon: Target },
  ];

  return (
    <div className="view-enter space-y-6 max-w-[900px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-caption uppercase tracking-wide font-semibold" style={{ color: 'var(--teal)' }}>Shared</p>
          <h2 className="text-headline mt-0.5" style={{ fontFamily: 'var(--font-manrope)' }}>{sh.settings.name}</h2>
          <p className="text-caption mt-1">
            {PURPOSE_META.find(p => p.id === sh.settings.purpose)?.label ?? 'Group'} · {members.length} people · stored locally on this device
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#f0f2f5' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                if (t.id === 'splits' && exSplits.length === 0 && members.length) initExpenseForm();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
              style={{
                fontFamily: 'var(--font-inter)',
                background: active ? '#fff' : 'transparent',
                color: active ? 'var(--teal)' : 'var(--text-muted)',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'group' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="text-title" style={{ fontFamily: 'var(--font-manrope)' }}>Group details</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[11px] font-semibold text-muted block mb-1">Name</label>
                <input
                  value={localGroupName}
                  onChange={e => setLocalGroupName(e.target.value)}
                  onBlur={() => sh.updateHouseholdMeta(localGroupName || sh.settings.name, sh.settings.purpose)}
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ border: '2px solid #edf2f7' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">Type</label>
                <select
                  value={sh.settings.purpose}
                  onChange={e => sh.updateHouseholdMeta(sh.settings.name, e.target.value as HouseholdPurpose)}
                  className="rounded-xl px-3 py-2 text-sm"
                  style={{ border: '2px solid #edf2f7' }}
                >
                  {PURPOSE_META.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-title mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>Members</h3>
            <ul className="space-y-2">
              {members.map(m => (
                <li key={m.id} className="flex items-center gap-3 py-2 border-b border-[#f0f2f5] last:border-0">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>{m.name}</p>
                    {m.relation && <p className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>{m.relation}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => sh.removeMember(m.id)}
                    className="p-2 rounded-lg"
                    style={{ color: 'var(--red)', background: 'var(--red-dim)', border: 'none', cursor: 'pointer' }}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={newMember.emoji}
                onChange={e => setNewMember(p => ({ ...p, emoji: e.target.value }))}
                className="w-11 rounded-lg text-center"
                style={{ border: '2px solid #edf2f7' }}
                maxLength={4}
              />
              <input
                value={newMember.name}
                onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                placeholder="New member name"
                className="flex-1 min-w-[140px] rounded-xl px-3 py-2 text-sm"
                style={{ border: '2px solid #edf2f7' }}
              />
              <input
                value={newMember.relation}
                onChange={e => setNewMember(p => ({ ...p, relation: e.target.value }))}
                placeholder="Role"
                className="w-28 rounded-xl px-3 py-2 text-sm"
                style={{ border: '2px solid #edf2f7' }}
              />
              <button
                type="button"
                onClick={() => {
                  sh.addMember(newMember);
                  setNewMember({ name: '', emoji: '👤', relation: '' });
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
          </div>

          <div className="card p-5 border border-red-200/50" style={{ background: 'var(--red-dim)' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} style={{ color: 'var(--red)', flexShrink: 0 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--red)' }}>Disband group</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Deletes this shared wallet, all split records, and group goals on this device.
                </p>
                {!disbandConfirm ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold underline"
                    style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setDisbandConfirm(true)}
                  >
                    Disband…
                  </button>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'var(--red)', border: 'none', cursor: 'pointer' }}
                      onClick={() => sh.disbandHousehold()}
                    >
                      Yes, delete everything
                    </button>
                    <button type="button" className="text-xs font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setDisbandConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'wallet' && (
        <div className="space-y-4">
          <div className="card p-6 text-center" style={{ background: 'linear-gradient(135deg, var(--teal-dim), #fff)' }}>
            <p className="text-caption font-semibold">Joint wallet balance</p>
            <p className="text-4xl font-extrabold mt-1 tabular-nums" style={{ fontFamily: 'var(--font-manrope)', color: 'var(--teal)' }}>
              {fmtMoney(currency, sh.walletBalance)}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Contributions add; purchases from the pot or withdrawals subtract.
            </p>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-title" style={{ fontFamily: 'var(--font-manrope)' }}>Add entry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold block mb-1">Type</label>
                <select
                  value={wKind}
                  onChange={e => setWKind(e.target.value as typeof wKind)}
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ border: '2px solid #edf2f7' }}
                >
                  <option value="contribution">Contribution (money in)</option>
                  <option value="spend_from_pot">Purchase from pot</option>
                  <option value="withdrawal">Withdrawal (took cash out)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1">Amount</label>
                <input
                  value={wAmount}
                  onChange={e => setWAmount(e.target.value.replace(/[^\d.,]/g, ''))}
                  placeholder="0.00"
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ border: '2px solid #edf2f7' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1">Who</label>
                <select
                  value={wMember || members[0]?.id}
                  onChange={e => setWMember(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ border: '2px solid #edf2f7' }}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1">Date</label>
                <input type="date" value={wDate} onChange={e => setWDate(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
              </div>
            </div>
            <input
              value={wLabel}
              onChange={e => setWLabel(e.target.value)}
              placeholder="Label (e.g. Rent pool, Groceries)"
              className="w-full rounded-xl px-3 py-2 text-sm"
              style={{ border: '2px solid #edf2f7' }}
            />
            <button
              type="button"
              onClick={() => {
                const a = parseFloat(wAmount.replace(/,/g, ''));
                const mid = wMember || members[0]?.id;
                if (!mid || !Number.isFinite(a) || a <= 0) return;
                sh.addWalletEntry(wKind, a, mid, wLabel, wDate);
                setWAmount('');
                setWLabel('');
              }}
              className="w-full py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer' }}
            >
              Save entry
            </button>
          </div>

          <div className="card p-5">
            <h3 className="text-title mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>History</h3>
            {sh.wallet.length === 0 ? (
              <p className="text-caption">No entries yet.</p>
            ) : (
              <ul className="space-y-2">
                {sh.wallet.map(w => (
                  <li key={w.id} className="flex items-center gap-3 text-sm py-2 border-b border-[#f7f8fa] last:border-0">
                    <div className="flex-1">
                      <span className="font-medium">{w.label}</span>
                      <span className="text-muted text-xs block" style={{ color: 'var(--text-muted)' }}>
                        {w.date} · {memberEmoji(members, w.memberId)} {memberName(members, w.memberId)} · {w.kind.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ color: w.kind === 'contribution' ? 'var(--green)' : 'var(--text-primary)' }}>
                      {w.kind === 'contribution' ? '+' : '-'}{fmtMoney(currency, w.amount)}
                    </span>
                    <button type="button" onClick={() => sh.deleteWalletEntry(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'splits' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-title mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>Who owes whom</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Positive = others owe this person overall (after all logged splits). Settle outside the app or log a contribution in the wallet.
            </p>
            <ul className="space-y-2">
              {members.map(m => {
                const b = sh.splitBalances[m.id] ?? 0;
                const label = b > 0.01 ? `Gets back ~${fmtMoney(currency, b)}` : b < -0.01 ? `Owes ~${fmtMoney(currency, Math.abs(b))}` : 'Settled up';
                return (
                  <li key={m.id} className="flex items-center justify-between py-2 border-b border-[#f0f2f5] last:border-0">
                    <span>{m.emoji} {m.name}</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: b > 0 ? 'var(--green)' : b < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-title" style={{ fontFamily: 'var(--font-manrope)' }}>Log split expense</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={exLabel} onChange={e => setExLabel(e.target.value)} placeholder="What was it?" className="rounded-xl px-3 py-2 text-sm sm:col-span-2" style={{ border: '2px solid #edf2f7' }} />
              <input value={exCat} onChange={e => setExCat(e.target.value)} placeholder="Category" className="rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
              <input value={exAmount} onChange={e => setExAmount(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Amount" className="rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
              <select value={exPaidBy} onChange={e => setExPaidBy(e.target.value)} className="rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }}>
                {members.map(m => (
                  <option key={m.id} value={m.id}>Paid by {m.name}</option>
                ))}
              </select>
              <input type="date" value={exDate} onChange={e => setExDate(e.target.value)} className="rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold">Split %</span>
              <button
                type="button"
                className="text-xs font-semibold px-2 py-1 rounded-lg"
                style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }}
                onClick={() => setExSplits(equalSplits(members.map(m => m.id)))}
              >
                Equal split
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map(m => {
                const row = exSplits.find(s => s.memberId === m.id);
                const pct = row?.sharePercent ?? 0;
                return (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <span className="truncate">{m.emoji}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={pct}
                      onChange={e => {
                        const v = parseFloat(e.target.value) || 0;
                        setExSplits(ss => {
                          const rest = ss.filter(x => x.memberId !== m.id);
                          return [...rest, { memberId: m.id, sharePercent: v }];
                        });
                      }}
                      className="w-16 rounded-lg px-1 py-1"
                      style={{ border: '1px solid #edf2f7' }}
                    />
                    <span>%</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px]" style={{ color: Math.abs(exSplits.reduce((a, s) => a + s.sharePercent, 0) - 100) < 0.02 ? 'var(--teal)' : 'var(--amber)' }}>
              Total: {exSplits.reduce((a, s) => a + s.sharePercent, 0).toFixed(1)}% (must be 100%)
            </p>
            <button
              type="button"
              onClick={submitExpense}
              className="w-full py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer' }}
            >
              Add split expense
            </button>
          </div>

          <div className="card p-5">
            <h3 className="text-title mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>Recent splits</h3>
            {sh.expenses.length === 0 ? (
              <p className="text-caption">No split expenses yet.</p>
            ) : (
              <ul className="space-y-3">
                {sh.expenses.map(e => (
                  <li key={e.id} className="flex flex-wrap items-start gap-2 justify-between py-2 border-b border-[#f7f8fa] last:border-0 text-sm">
                    <div>
                      <p className="font-semibold">{e.label}</p>
                      <p className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>{e.date} · {e.category} · Paid by {memberName(members, e.paidByMemberId)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">{fmtMoney(currency, e.amount)}</span>
                      <button type="button" onClick={() => sh.deleteSharedExpense(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'goals' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="text-title" style={{ fontFamily: 'var(--font-manrope)' }}>New group goal</h3>
            <div className="flex flex-wrap gap-2">
              <input value={gEmoji} onChange={e => setGEmoji(e.target.value)} className="w-12 rounded-lg text-center text-lg" style={{ border: '2px solid #edf2f7' }} maxLength={4} />
              <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Goal name" className="flex-1 min-w-[160px] rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
              <input value={gTarget} onChange={e => setGTarget(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Target amount" className="w-32 rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
              <input type="date" value={gDate} onChange={e => setGDate(e.target.value)} className="rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
            </div>
            <p className="text-[11px] font-semibold">Who’s in on this goal?</p>
            <div className="flex flex-wrap gap-2">
              {members.map(m => {
                const on = gMembers.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGMembers(gs => on ? gs.filter(id => id !== m.id) : [...gs, m.id])}
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: on ? 'var(--teal-dim)' : '#f0f2f5',
                      color: on ? 'var(--teal)' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {m.emoji} {m.name}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setGColor(c)}
                  className="h-7 w-7 rounded-full"
                  style={{ background: c, outline: gColor === c ? '2px solid #000' : 'none' }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={submitGoal}
              className="w-full py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={16} /> Create goal
            </button>
          </div>

          {sh.goals.map(g => {
            const total = g.contributions.reduce((a, c) => a + c.amount, 0);
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((total / g.targetAmount) * 100)) : 0;
            return (
              <div key={g.id} className="card p-5" style={{ borderLeft: `4px solid ${g.color}` }}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-2xl">{g.emoji}</p>
                    <h4 className="text-lg font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>{g.name}</h4>
                    <p className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>Target {fmtMoney(currency, g.targetAmount)} by {g.targetDate}</p>
                  </div>
                  <button type="button" onClick={() => sh.deleteSharedGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}><Trash2 size={16} /></button>
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                </div>
                <p className="text-sm font-semibold mt-2 tabular-nums">{fmtMoney(currency, total)} saved · {pct}%</p>
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold flex items-center gap-1"
                  style={{ color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setContribGoalId(g.id);
                    setContribMember(members[0]?.id ?? '');
                  }}
                >
                  Log contribution <ChevronRight size={14} />
                </button>
                {g.contributions.length > 0 && (
                  <ul className="mt-3 text-xs space-y-1 border-t border-[#f0f2f5] pt-3">
                    {g.contributions.slice(0, 8).map(c => (
                      <li key={c.id} className="flex justify-between">
                        <span>{c.date} · {memberName(members, c.memberId)}</span>
                        <span className="font-semibold">{fmtMoney(currency, c.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          {contribGoalId && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.45)' }}>
              <div className="card p-6 max-w-sm w-full space-y-3">
                <h4 className="font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>Add contribution</h4>
                <select value={contribMember} onChange={e => setContribMember(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }}>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <input value={contribAmount} onChange={e => setContribAmount(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Amount" className="w-full rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
                <input type="date" value={contribDate} onChange={e => setContribDate(e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
                <input value={contribNote} onChange={e => setContribNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #edf2f7' }} />
                <div className="flex gap-2">
                  <button type="button" onClick={submitContrib} className="flex-1 py-2 rounded-xl font-semibold text-white text-sm" style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setContribGoalId(null)} className="px-4 py-2 rounded-xl text-sm" style={{ background: '#f0f2f5', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
