import React from 'react';
import { SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { Ico } from '@/ui/Icons';
import { Activity } from 'lucide-react';

const fmt = (v: number, currency: string) => `${currency}${v.toLocaleString()}`;

export function ActivityTab({ entries, expenses, goals, members, currency }: { entries: any[]; expenses: any[]; goals: any[]; members: SharedGroupMember[]; currency: string }) {
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
        border: e.kind === 'contribution' ? 'border-emerald-500/20' : 'border-red-500/20'
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
        border: 'border-indigo-500/20'
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
          border: 'border-amber-500/20'
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
        <p className="m-0 text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-[280px]">Group logs appear automatically when members save, split bills, or add funds.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 relative mt-2 pb-4">
      <div className="absolute left-[22px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-[var(--border)] via-[var(--border)] to-transparent rounded-full" />

      {timeline.map((t, index) => (
        <div key={t.id + index} className="flex items-start gap-4 relative z-10 group">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border backdrop-blur-sm transition-transform group-hover:scale-105 ${t.bg} ${t.color} ${t.border}`}>
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
