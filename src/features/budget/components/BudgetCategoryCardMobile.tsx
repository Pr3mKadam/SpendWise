import { motion } from 'framer-motion';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Category } from '@/types';
import { haptic } from '@/core/haptic';

interface BudgetCategoryCardMobileProps {
  b: {
    category: Category;
    limit: number;
    spent: number;
    remaining: number;
    percent: number;
    status: 'good' | 'warning' | 'danger';
  };
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  onEdit: (category: string, limit: number) => void;
  onRemove: (category: Category) => void;
}

export function BudgetCategoryCardMobile({
  b,
  currency,
  mergedColors,
  mergedIcons,
  onEdit,
  onRemove,
}: BudgetCategoryCardMobileProps) {
  return (
    <motion.div
      layout
      className="group p-5 bg-[var(--surface-card)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
    >
      {/* Background progress indicator (subtle) */}
      <div
        className="absolute left-0 top-0 bottom-0 opacity-[0.03] pointer-events-none transition-all duration-700"
        style={{
          width: `${Math.min(b.percent, 100)}%`,
          background:
            b.status === 'danger'
              ? 'var(--red)'
              : b.status === 'warning'
                ? 'var(--amber)'
                : 'var(--teal)',
        }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
            style={{ background: `${mergedColors[b.category] || '#14b8a6'}15` }}
          >
            {mergedIcons[b.category] || '📦'}
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] text-sm">{b.category}</h4>
            <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {Math.round(b.percent)}% Used
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(b.category, b.limit)}
            className="w-11 h-11 flex items-center justify-center text-[var(--text-muted)] active:text-[var(--teal)] bg-white/5 rounded-xl border-none cursor-pointer"
            aria-label={`Edit ${b.category} budget`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => {
              haptic.medium();
              onRemove(b.category);
            }}
            className="w-11 h-11 flex items-center justify-center text-[var(--text-muted)] active:text-red-500 bg-white/5 rounded-xl border-none cursor-pointer"
            aria-label={`Delete ${b.category} budget`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-3 relative z-10">
        <div>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {currency}
            {b.spent.toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)]">
            / {currency}
            {b.limit.toLocaleString()} limit
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-bold ${b.remaining < 0 ? 'text-red-500' : 'text-[var(--teal)]'}`}
          >
            {b.remaining < 0 ? '-' : ''}
            {currency}
            {Math.abs(b.remaining).toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)]">
            {b.remaining < 0 ? 'Exceeded' : 'Left'}
          </p>
        </div>
      </div>

      <div className="h-2 w-full bg-[var(--surface-input)] rounded-full overflow-hidden relative z-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(b.percent, 100)}%` }}
          className={`h-full rounded-full ${b.status === 'danger' ? 'bg-red-500' : b.status === 'warning' ? 'bg-amber-500' : 'bg-gradient-to-r from-[var(--teal)] to-emerald-400'}`}
        />
      </div>

      {b.percent > 100 && (
        <div className="mt-3 flex items-center gap-2 text-[length:var(--fs-overline)] font-bold text-red-500 bg-red-500/10 py-1.5 px-3 rounded-full w-fit">
          <AlertCircle size={12} strokeWidth={3} />
          <span>
            OVER BUDGET BY {currency}
            {Math.abs(b.remaining).toLocaleString()}
          </span>
        </div>
      )}
    </motion.div>
  );
}
