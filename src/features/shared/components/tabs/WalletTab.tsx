import React from 'react';
import { motion } from 'framer-motion';
import { SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { Avatar } from '@/ui/Avatar';
import { Ico } from '@/ui/Icons';
import { Activity, Wallet } from 'lucide-react';
import EmptyState from '@/ui/EmptyState';

const fmt = (v: number, currency: string) => `${currency}${v.toLocaleString()}`;

export function WalletTab({ entries, members, onDelete, currency }: { entries: any[]; members: SharedGroupMember[]; onDelete: (id: string) => void; currency: string }) {
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
      {entries.length === 0
        ? (
          <EmptyState
            icon={<Wallet size={32} />}
            title="No Pot Contributions Yet"
            subtitle="Add money to the pot to fund shared bills or withdraw for group purchases."
          />
        )
        : <div className="flex flex-col gap-2.5">
            {entries.map((e, index) => {
              const m = map[e.member_id]; const isIn = e.kind === 'contribution';
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-3.5 p-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)] transition-all hover:border-[var(--teal)]/30 hover:shadow-md hover:shadow-teal-500/5 group"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isIn ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-red-500 shadow-md shadow-red-500/20'}`} />
                  <Avatar emoji={m?.emoji ?? '👤'} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="m-0 font-bold text-sm text-[var(--text-primary)] truncate">{e.label}</p>
                    <p className="m-0 text-[11px] text-[var(--text-muted)] mt-0.5 font-medium flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--text-primary)]">{m?.display_name ?? '?'}</span>
                      <span className="opacity-40">•</span>
                      <span>{e.date}</span>
                    </p>
                  </div>
                  <span className={`font-black text-sm shrink-0 tabular-nums ${isIn ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isIn ? '+' : '-'}{fmt(e.amount, currency)}
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
      }
    </div>
  );
}
