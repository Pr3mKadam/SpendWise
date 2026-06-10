import React from 'react';
import { motion } from 'framer-motion';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { Ico } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { StatusPill } from '@/components/ui/StatusPill';
import { Activity, Plus, ArrowRight, Sparkles } from 'lucide-react';

const fmt = (v: number, currency: string) => `${currency}${v.toLocaleString()}`;

export function WalletTab({
  entries,
  members,
  onDelete,
  currency,
}: {
  entries: any[];
  members: SharedGroupMember[];
  onDelete: (id: string) => void;
  currency: string;
}) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="m-0 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} className="text-[var(--teal)] animate-pulse" />
          Contribution Log
        </h3>
        <span className="text-xs text-[var(--text-muted)] font-medium bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--border)]">
          {entries.length} Entries
        </span>
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
          <span className="text-4xl block mb-2 opacity-60">💰</span>
          <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">
            No Pot Contributions Yet
          </p>
          <p className="m-0 text-xs text-[var(--text-muted)] mt-1.5 max-w-[280px] mx-auto">
            Add money to the pot to fund shared bills or withdraw for group purchases.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((e, index) => {
            const m = map[e.member_id];
            const isIn = e.kind === 'contribution';
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3.5 p-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)] transition-all hover:border-[var(--teal)]/30 hover:shadow-md hover:shadow-teal-500/5 group"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${isIn ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-red-500 shadow-md shadow-red-500/20'}`}
                />
                <Avatar emoji={m?.emoji ?? '👤'} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="m-0 font-bold text-sm text-[var(--text-primary)] truncate">
                    {e.label}
                  </p>
                  <p className="m-0 text-[11px] text-[var(--text-muted)] mt-0.5 font-medium flex items-center gap-1.5">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {m?.display_name ?? '?'}
                    </span>
                    <span className="opacity-40">•</span>
                    <span>{e.date}</span>
                  </p>
                </div>
                <span
                  className={`font-black text-sm shrink-0 tabular-nums ${isIn ? 'text-emerald-500' : 'text-red-500'}`}
                >
                  {isIn ? '+' : '-'}
                  {fmt(e.amount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(e.id)}
                  className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 flex hover:text-red-500 transition-all rounded-lg hover:bg-red-500/5"
                >
                  <Ico.Trash size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ExpensesTab({
  expenses,
  members,
  splitBalances,
  onDelete,
  currency,
}: {
  expenses: any[];
  members: SharedGroupMember[];
  splitBalances: Record<string, number>;
  onDelete: (id: string) => void;
  currency: string;
}) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));
  const active = members.filter(m => m.status === 'active');

  // Settlement logic
  const settlements = React.useMemo(() => {
    const balances = active.map(m => ({
      id: m.id,
      name: m.display_name,
      bal: splitBalances[m.id] ?? 0,
    }));
    const debtors = balances.filter(b => b.bal < -0.01).sort((a, b) => a.bal - b.bal);
    const creditors = balances.filter(b => b.bal > 0.01).sort((a, b) => b.bal - a.bal);

    const results: { from: string; to: string; amount: number }[] = [];
    let i = 0,
      j = 0;
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
      {/* Balances Board */}
      <div className="mb-6">
        <h4 className="m-0 mb-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Group Balance Sheet
        </h4>
        {active.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {active.map(m => {
              const bal = splitBalances[m.id] ?? 0;
              const isSettled = Math.abs(bal) < 0.01;
              const isCreditor = bal > 0;
              return (
                <div
                  key={m.id}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 text-center flex flex-col items-center shadow-sm relative overflow-hidden transition-all hover:border-[var(--teal)]/30"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--border)]" />
                  <Avatar emoji={m.emoji} size={36} />
                  <p className="m-0 mt-2.5 mb-1 text-xs font-bold text-[var(--text-primary)] truncate w-full">
                    {m.display_name}
                  </p>
                  <p
                    className={`m-0 text-sm font-black tabular-nums mt-0.5 ${isSettled ? 'text-[var(--text-muted)] font-bold text-xs' : isCreditor ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {isSettled
                      ? 'Settled ✓'
                      : isCreditor
                        ? `+${fmt(bal, currency)}`
                        : `-${fmt(Math.abs(bal), currency)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settlements Suggestion Panel */}
      {settlements.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[var(--teal)]/10 to-blue-500/10 border border-[var(--teal)]/20 rounded-2xl p-5 mb-6">
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-24 h-24 bg-[var(--teal)]/10 rounded-full blur-2xl" />
          <h4 className="m-0 mb-3.5 text-[var(--teal)] font-bold text-xs flex items-center gap-2 uppercase tracking-wider">
            <Sparkles size={14} className="animate-spin-slow" />
            SpendWise settlement optimizer
          </h4>
          <div className="space-y-3">
            {settlements.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-[var(--text-primary)] font-medium flex-wrap"
              >
                <span className="text-[var(--text-muted)] text-xs">Payment alert</span>
                <strong className="text-red-500 bg-red-500/5 px-2 py-0.5 rounded-lg border border-red-500/10">
                  {s.from}
                </strong>
                <ArrowRight size={12} className="text-[var(--text-muted)] shrink-0" />
                <strong className="text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                  {s.to}
                </strong>
                <span className="ml-auto font-black text-sm text-[var(--teal)] tabular-nums">
                  {fmt(s.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Log */}
      <div>
        <h4 className="m-0 mb-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Shared Bills & Expenses
        </h4>
        {expenses.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-4xl block mb-2 opacity-60">⚖️</span>
            <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">
              No Shared Bills Yet
            </p>
            <p className="m-0 text-xs text-[var(--text-muted)] mt-1.5 max-w-[280px] mx-auto">
              Add an expense paid by any member to automatically split it equally.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {expenses.map((e, index) => {
              const payer = map[e.paid_by_member_id];
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--teal)]/30 hover:shadow-md hover:shadow-teal-500/5 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <Avatar emoji={payer?.emoji ?? '👤'} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 font-bold text-sm text-[var(--text-primary)] truncate">
                        {e.label}
                      </p>
                      <p className="m-0 text-[11px] text-[var(--text-muted)] mt-0.5 font-medium truncate">
                        Paid by{' '}
                        <span className="font-semibold text-[var(--text-primary)]">
                          {payer?.display_name ?? '?'}
                        </span>{' '}
                        · {e.date} ·{' '}
                        <span className="bg-[var(--border)] px-1.5 py-0.5 rounded text-[10px] text-[var(--text-primary)] uppercase tracking-wider font-bold">
                          {e.category}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="m-0 font-black text-sm text-[var(--text-primary)] shrink-0 tabular-nums">
                        {fmt(e.amount, currency)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onDelete(e.id)}
                        className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 flex hover:text-red-500 transition-all rounded-lg hover:bg-red-500/5"
                      >
                        <Ico.Trash size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function GoalsTab({
  goals,
  onDelete,
  onContrib,
  currency,
}: {
  goals: SharedGoal[];
  onDelete: (id: string) => void;
  onContrib: (g: SharedGoal) => void;
  currency: string;
}) {
  if (!goals.length) {
    return (
      <div className="text-center py-12 px-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
        <span className="text-4xl block mb-2 opacity-60">🎯</span>
        <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">No Group Goals Set</p>
        <p className="m-0 text-xs text-[var(--text-muted)] mt-1.5 max-w-[280px] mx-auto">
          Create group goals to save together for trips, purchases, or shared investments.
        </p>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return (
    <div>
      <h3 className="m-0 mb-4 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={16} className="text-amber-500" />
        Group Target Goals
      </h3>
      <div className="flex flex-col gap-3.5">
        {goals.map((g, index) => {
          const saved = (g.contributions ?? []).reduce((s: number, c: any) => s + c.amount, 0);
          const pct = Math.min(100, Math.round((saved / g.target_amount) * 100));
          const days = Math.max(
            0,
            Math.ceil((new Date(g.target_date).getTime() - now) / 86400000)
          );
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--teal)]/30 hover:shadow-md hover:shadow-teal-500/5 transition-all group"
              style={{ borderLeft: `5px solid ${g.color || 'var(--teal)'}` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-[32px] leading-none shrink-0">{g.emoji || '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <p className="m-0 font-bold text-sm text-[var(--text-primary)] truncate">
                    {g.name}
                  </p>
                  <p className="m-0 text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">
                    Target:{' '}
                    <span className="font-semibold text-[var(--text-primary)]">
                      {fmt(g.target_amount, currency)}
                    </span>{' '}
                    · {days} days left
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onContrib(g)}
                    className="px-3 py-1.5 bg-[var(--teal)]/10 text-[var(--teal)] border-none rounded-lg cursor-pointer font-bold text-xs hover:bg-[var(--teal)]/20 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Plus size={12} /> Contribute
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(g.id)}
                    className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] opacity-0 group-hover:opacity-100 focus:opacity-100 flex p-1.5 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/5"
                  >
                    <Ico.Trash size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2 font-medium">
                <span>{fmt(saved, currency)} saved</span>
                <span style={{ color: g.color || 'var(--teal)', fontWeight: 800 }}>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: g.color || 'var(--teal)' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function MembersTab({
  members,
  uid,
  isOwner,
  onRemove,
  onInvite,
}: {
  members: SharedGroupMember[];
  uid: string | null;
  isOwner: boolean;
  onRemove: (id: string) => void;
  onInvite: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="m-0 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Group Cohorts
        </h3>
        {isOwner && (
          <button
            type="button"
            onClick={onInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--teal)] text-white border-none rounded-xl cursor-pointer font-bold text-xs hover:bg-[#0d9488] transition-all shadow-md shadow-teal-500/10 active:scale-95"
          >
            <Plus size={12} /> Invite Member
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {members.map(m => (
          <div
            key={m.id}
            className="flex items-center gap-3.5 p-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)] transition-all hover:border-[var(--teal)]/20"
          >
            <Avatar emoji={m.emoji} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {m.display_name}
                </span>
                {m.role === 'owner' && (
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-widest border border-amber-500/20">
                    Owner
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill s={m.status} />
                {m.invited_email && (
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {m.invited_email}
                  </span>
                )}
              </div>
            </div>
            {isOwner && m.user_id !== uid && m.role !== 'owner' && (
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-2 flex hover:text-red-500 transition-all rounded-lg hover:bg-red-500/5"
              >
                <Ico.Trash size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityTab({
  entries,
  expenses,
  goals,
  members,
  currency,
}: {
  entries: any[];
  expenses: any[];
  goals: any[];
  members: SharedGroupMember[];
  currency: string;
}) {
  const map = Object.fromEntries(members.map(m => [m.id, m]));

  const timeline = React.useMemo(() => {
    const items: any[] = [];
    entries.forEach(e => {
      items.push({
        id: e.id,
        date: new Date(e.date).getTime(),
        dateStr: e.date,
        type: 'wallet',
        icon: <Ico.Wallet size={15} />,
        title: e.kind === 'contribution' ? 'Added to Pot' : 'Used from Pot',
        desc: `${map[e.member_id]?.display_name || 'Someone'} ${e.kind === 'contribution' ? 'deposited' : 'withdrew'} for ${e.label}.`,
        amount: e.amount,
        color: e.kind === 'contribution' ? 'text-emerald-500' : 'text-red-500',
        bg: e.kind === 'contribution' ? 'bg-emerald-500/10' : 'bg-red-500/10',
        border: e.kind === 'contribution' ? 'border-emerald-500/20' : 'border-red-500/20',
      });
    });
    expenses.forEach(e => {
      items.push({
        id: e.id,
        date: new Date(e.date).getTime(),
        dateStr: e.date,
        type: 'expense',
        icon: <Ico.Split size={15} />,
        title: 'New Bill Split',
        desc: `${map[e.paid_by_member_id]?.display_name || 'Someone'} paid for ${e.label}.`,
        amount: e.amount,
        color: 'text-[var(--text-primary)]',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
      });
    });
    goals.forEach(g => {
      (g.contributions || []).forEach((c: any) => {
        items.push({
          id: c.id,
          date: new Date(c.date).getTime(),
          dateStr: c.date,
          type: 'goal',
          icon: <Ico.Target size={15} />,
          title: 'Goal Funded',
          desc: `${map[c.member_id]?.display_name || 'Someone'} funded ${g.name} ${g.emoji}.`,
          amount: c.amount,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
        });
      });
    });

    return items.sort((a, b) => b.date - a.date);
  }, [entries, expenses, goals, map]);

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-[var(--bg)] rounded-3xl border border-[var(--border)] mt-2">
        <div className="w-14 h-14 rounded-full bg-[var(--border)] flex items-center justify-center mb-4 text-[var(--text-muted)] opacity-50">
          <Activity size={28} />
        </div>
        <p className="m-0 text-sm font-bold text-[var(--text-primary)]">No Active Logs</p>
        <p className="m-0 text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-[280px]">
          Group logs appear automatically when members save, split bills, or add funds.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 relative mt-2 pb-4">
      <div className="absolute left-[22px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-[var(--border)] via-[var(--border)] to-transparent rounded-full" />

      {timeline.map((t, index) => (
        <div key={t.id + index} className="flex items-start gap-4 relative z-10 group">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border backdrop-blur-sm transition-transform group-hover:scale-105 ${t.bg} ${t.color} ${t.border}`}
          >
            {t.icon}
          </div>

          <div className="flex-1 min-w-0 bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 shadow-sm transition-all group-hover:border-[var(--teal)]/20">
            <div className="flex justify-between items-start gap-2 mb-1">
              <p className="m-0 font-bold text-sm text-[var(--text-primary)]">{t.title}</p>
              <p className={`m-0 font-black text-sm shrink-0 tabular-nums ${t.color}`}>
                {fmt(t.amount, currency)}
              </p>
            </div>
            <p className="m-0 text-xs text-[var(--text-muted)] leading-relaxed">{t.desc}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded border border-[var(--border)]">
                {t.dateStr}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
