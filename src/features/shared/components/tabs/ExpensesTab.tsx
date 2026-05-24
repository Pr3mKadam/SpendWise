import React from 'react';
import { motion } from 'framer-motion';
import { SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { Avatar } from '@/ui/Avatar';
import { Ico } from '@/ui/Icons';
import { Sparkles, ArrowRight, Receipt } from 'lucide-react';
import EmptyState from '@/ui/EmptyState';

const fmt = (v: number, currency: string) => `${currency}${v.toLocaleString()}`;

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
      {/* Balances Board */}
      <div className="mb-6">
        <h4 className="m-0 mb-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Group Balance Sheet</h4>
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
                  <p className="m-0 mt-2.5 mb-1 text-xs font-bold text-[var(--text-primary)] truncate w-full">{m.display_name}</p>
                  <p className={`m-0 text-sm font-black tabular-nums mt-0.5 ${isSettled ? 'text-[var(--text-muted)] font-bold text-xs' : isCreditor ? 'text-emerald-500' : 'text-red-500'}`}>
                     {isSettled ? 'Settled ✓' : isCreditor ? `+${fmt(bal, currency)}` : `-${fmt(Math.abs(bal), currency)}`}
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
              <div key={idx} className="flex items-center gap-2 text-sm text-[var(--text-primary)] font-medium flex-wrap">
                <span className="text-[var(--text-muted)] text-xs">Payment alert</span>
                <strong className="text-red-500 bg-red-500/5 px-2 py-0.5 rounded-lg border border-red-500/10">{s.from}</strong>
                <ArrowRight size={12} className="text-[var(--text-muted)] shrink-0" />
                <strong className="text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">{s.to}</strong>
                <span className="ml-auto font-black text-sm text-[var(--teal)] tabular-nums">{fmt(s.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Log */}
      <div>
        <h4 className="m-0 mb-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Shared Bills & Expenses</h4>
        {expenses.length === 0
          ? (
            <EmptyState
              icon={<Receipt size={32} />}
              title="No Shared Bills Yet"
              subtitle="Add an expense paid by any member to automatically split it equally."
            />
          )
          : <div className="flex flex-col gap-2.5">
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
                        <p className="m-0 font-bold text-sm text-[var(--text-primary)] truncate">{e.label}</p>
                        <p className="m-0 text-[11px] text-[var(--text-muted)] mt-0.5 font-medium truncate">
                          Paid by <span className="font-semibold text-[var(--text-primary)]">{payer?.display_name ?? '?'}</span> · {e.date} · <span className="bg-[var(--border)] px-1.5 py-0.5 rounded text-[10px] text-[var(--text-primary)] uppercase tracking-wider font-bold">{e.category}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="m-0 font-black text-sm text-[var(--text-primary)] shrink-0 tabular-nums">{fmt(e.amount, currency)}</p>
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
        }
      </div>
    </div>
  );
}
