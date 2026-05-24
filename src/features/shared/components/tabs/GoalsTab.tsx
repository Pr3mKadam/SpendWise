import React from 'react';
import { motion } from 'framer-motion';
import { SharedGoal } from '@/features/shared/hooks/useSharedWallets';
import { Ico } from '@/ui/Icons';
import { Sparkles, Plus, Target } from 'lucide-react';
import EmptyState from '@/ui/EmptyState';

const fmt = (v: number, currency: string) => `${currency}${v.toLocaleString()}`;

export function GoalsTab({ goals, onDelete, onContrib, currency }: { goals: SharedGoal[]; onDelete: (id: string) => void; onContrib: (g: SharedGoal) => void; currency: string }) {
  if (!goals.length) {
    return (
      <EmptyState
        icon={<Target size={32} />}
        title="No Group Goals Set"
        subtitle="Create group goals to save together for trips, purchases, or shared investments."
      />
    );
  }

  return (
    <div>
      <h3 className="m-0 mb-4 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={16} className="text-amber-500" />
        Group Target Goals
      </h3>
      <div className="flex flex-col gap-3.5">
        {goals.map((g, index) => {
          const saved = (g.contributions ?? []).reduce((s: number, c: any) => s + c.amount, 0);
          const pct   = Math.min(100, Math.round((saved / g.target_amount) * 100));
          const days  = Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000));
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
                  <p className="m-0 font-bold text-sm text-[var(--text-primary)] truncate">{g.name}</p>
                  <p className="m-0 text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">
                    Target: <span className="font-semibold text-[var(--text-primary)]">{fmt(g.target_amount, currency)}</span> · {days} days left
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
