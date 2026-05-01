import React from 'react';
import { SharedGoal, SharedGroupMember } from '../../../hooks/useSharedWallets';
import { Ico } from '../../common/ui/Icons';
import { Avatar } from '../../common/ui/Avatar';
import { StatusPill } from '../../common/ui/StatusPill';

const fmt = (v: number, currency: string) => `${currency}${v.toLocaleString()}`;

export function WalletTab({ entries, balance, members, onDelete, currency }: { entries: any[]; balance: number; members: SharedGroupMember[]; onDelete: (id: string) => void; currency: string }) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  return (
    <div>
      <div className="bg-gradient-to-br from-[var(--accent)] to-indigo-500 rounded-2xl p-6 text-center mb-6">
        <p className="m-0 mb-1 text-white/65 text-[0.7rem] font-bold uppercase tracking-widest">Shared Pot Balance</p>
        <p className="m-0 text-[2.25rem] font-extrabold text-white tracking-tight">{fmt(balance, currency)}</p>
      </div>
      {entries.length === 0
        ? <p className="text-center text-[var(--text-secondary)] py-10 text-[0.9rem]">No entries yet — add a contribution to get started.</p>
        : <div className="flex flex-col gap-2">
            {entries.map(e => {
              const m = map[e.member_id]; const isIn = e.kind === 'contribution';
              return (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--card-border)]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isIn ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <Avatar emoji={m?.emoji ?? '👤'} size={30} />
                  <div className="flex-1 min-w-0">
                    <p className="m-0 font-semibold text-[0.85rem] text-[var(--text)] truncate">{e.label}</p>
                    <p className="m-0 text-[0.7rem] text-[var(--text-secondary)]">{m?.display_name ?? '?'} · {e.date}</p>
                  </div>
                  <span className={`font-bold text-[0.875rem] shrink-0 ${isIn ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isIn ? '+' : '-'}{fmt(e.amount, currency)}
                  </span>
                  <button type="button" onClick={() => onDelete(e.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-secondary)] opacity-50 p-1 flex hover:opacity-100 transition-opacity">
                    <Ico.Trash />
                  </button>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

export function ExpensesTab({ expenses, members, splitBalances, onDelete, currency }: { expenses: any[]; members: SharedGroupMember[]; splitBalances: Record<string, number>; onDelete: (id: string) => void; currency: string }) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  const active = members.filter(m => m.status === 'active');

  // Settlement logic
  const settlements = React.useMemo(() => {
    const balances = active.map(m => ({ id: m.id, name: m.display_name, bal: splitBalances[m.id] ?? 0 }));
    const debtors = balances.filter(b => b.bal < -0.01).sort((a, b) => a.bal - b.bal);
    const creditors = balances.filter(b => b.bal > 0.01).sort((a, b) => b.bal - a.bal);
    
    const results: { from: string; to: string; amount: number }[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(Math.abs(debtors[i].bal), creditors[j].bal);
      results.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
      debtors[i].bal += pay;
      creditors[j].bal -= pay;
      if (Math.abs(debtors[i].bal) < 0.01) i++;
      if (Math.abs(creditors[j].bal) < 0.01) j++;
    }
    return results;
  }, [active, splitBalances]);

  return (
    <div>
      {active.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 mb-6">
          {active.map(m => {
            const bal = splitBalances[m.id] ?? 0;
            return (
              <div key={m.id} className="bg-[var(--bg)] border border-[var(--card-border)] rounded-2xl p-4 text-center flex flex-col items-center shadow-sm">
                <Avatar emoji={m.emoji} size={32} />
                <p className="m-0 mt-2 mb-1 text-[0.75rem] font-bold text-[var(--text)] truncate w-full">{m.display_name}</p>
                <p className={`m-0 text-[0.8rem] font-black ${Math.abs(bal) < 0.01 ? 'text-[var(--text-secondary)]' : bal > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                   {Math.abs(bal) < 0.01 ? 'Settled ✓' : bal > 0 ? `+${fmt(bal, currency)}` : `-${fmt(Math.abs(bal), currency)}`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {settlements.length > 0 && (
        <div className="bg-[var(--teal)]/5 border border-[var(--teal)]/20 rounded-2xl p-5 mb-6">
          <h4 className="m-0 mb-3 text-[var(--teal)] font-bold text-[0.85rem] flex items-center gap-2 uppercase tracking-wider">
            <Ico.Check size={16} /> Settlement Plan
          </h4>
          <div className="space-y-2">
            {settlements.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[0.85rem] text-[var(--text)] font-medium">
                <span className="text-[var(--text-secondary)]">Heads up!</span>
                <strong className="text-red-500">{s.from}</strong>
                <span className="text-[var(--text-secondary)]">should pay</span>
                <strong className="text-emerald-500">{s.to}</strong>
                <span className="ml-auto font-black text-[var(--teal)]">{fmt(s.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {expenses.length === 0
        ? <p className="text-center text-[var(--text-secondary)] py-10 text-[0.9rem]">No split expenses yet.</p>
        : <div className="flex flex-col gap-2">
            {expenses.map(e => {
              const payer = map[e.paid_by_member_id];
              return (
                <div key={e.id} className="bg-[var(--bg)] rounded-xl border border-[var(--card-border)] p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar emoji={payer?.emoji ?? '👤'} size={30} />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 font-semibold text-[0.875rem] text-[var(--text)] truncate">{e.label}</p>
                      <p className="m-0 text-[0.7rem] text-[var(--text-secondary)] truncate">Paid by {payer?.display_name ?? '?'} · {e.date} · {e.category}</p>
                    </div>
                    <p className="m-0 font-bold text-[var(--text)] text-[0.925rem] shrink-0">{fmt(e.amount, currency)}</p>
                    <button type="button" onClick={() => onDelete(e.id)} className="bg-transparent border-none cursor-pointer text-red-500 opacity-70 p-1 flex hover:opacity-100 transition-opacity">
                      <Ico.Trash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

export function GoalsTab({ goals, onDelete, onContrib, currency }: { goals: SharedGoal[]; onDelete: (id: string) => void; onContrib: (g: SharedGoal) => void; currency: string }) {
  if (!goals.length) return <p className="text-center text-[var(--text-secondary)] py-10 text-[0.9rem]">No group goals yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      {goals.map(g => {
        const saved = (g.contributions ?? []).reduce((s: number, c: any) => s + c.amount, 0);
        const pct   = Math.min(100, Math.round((saved / g.target_amount) * 100));
        const days  = Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000));
        return (
          <div key={g.id} className="bg-[var(--bg)] rounded-xl border border-[var(--card-border)] p-5" style={{ borderLeft: `4px solid ${g.color}` }}>
            <div className="flex items-start gap-2.5 mb-3">
              <span className="text-[26px] leading-none">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 font-bold text-[var(--text)] text-[0.95rem] truncate">{g.name}</p>
                <p className="m-0 text-[0.7rem] text-[var(--text-secondary)]">Target: {fmt(g.target_amount, currency)} · {days} days left</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button type="button" onClick={() => onContrib(g)} className="px-3 py-1.5 bg-[var(--card-border)] text-[var(--text)] border-none rounded-lg cursor-pointer font-semibold text-[0.75rem] hover:bg-opacity-80 transition-colors">+ Contribute</button>
                <button type="button" onClick={() => onDelete(g.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-secondary)] opacity-50 flex p-1 hover:opacity-100 transition-opacity"><Ico.Trash /></button>
              </div>
            </div>
            <div className="flex justify-between text-[0.77rem] text-[var(--text-secondary)] mb-1.5">
              <span>{fmt(saved, currency)} saved</span>
              <span style={{ color: g.color, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: g.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MembersTab({ members, uid, isOwner, onRemove, onInvite }: { members: SharedGroupMember[]; uid: string | null; isOwner: boolean; onRemove: (id: string) => void; onInvite: () => void }) {
  return (
    <div>
      {isOwner && (
        <button type="button" onClick={onInvite} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent text-[var(--accent)] border-[1.5px] border-dashed border-[var(--accent)] rounded-xl cursor-pointer font-bold text-[0.85rem] w-full mb-4 hover:bg-[var(--accent)]/5 transition-colors">
          <Ico.Mail /> Invite Member by Email
        </button>
      )}
      <div className="flex flex-col gap-2">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--card-border)]">
            <Avatar emoji={m.emoji} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-[var(--text)] text-[0.9rem]">{m.display_name}</span>
                {m.role === 'owner' && <span className="text-[0.65rem] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 uppercase tracking-wider">Owner</span>}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatusPill s={m.status} />
                {m.invited_email && <span className="text-[0.68rem] text-[var(--text-secondary)]">{m.invited_email}</span>}
              </div>
            </div>
            {isOwner && m.user_id !== uid && m.role !== 'owner' && (
              <button type="button" onClick={() => onRemove(m.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-secondary)] opacity-50 p-1 flex hover:opacity-100 transition-opacity">
                <Ico.Trash />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
