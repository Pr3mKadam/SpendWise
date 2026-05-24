import { motion } from 'framer-motion';
import { Target, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Category } from '@/types';

interface BudgetCategoryCardProps {
  b: {
    category: Category;
    limit: number;
    spent: number;
    remaining: number;
    percent: number;
    status: 'good' | 'warning' | 'danger';
  };
  currency: string;
  onEdit: (category: Category, limit: string) => void;
  onRemove: (category: Category) => void;
}

export function BudgetCategoryCard({ b, currency, onEdit, onRemove }: BudgetCategoryCardProps) {
  return (
    <div className="group p-4 bg-[var(--surface-input)] rounded-2xl border border-[var(--border)] hover:border-[var(--teal)]/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-card)] flex items-center justify-center shadow-sm">
            <Target size={16} className={b.status === 'danger' ? 'text-red-500' : 'text-[var(--teal)]'} />
          </div>
          <h4 className="font-bold text-[var(--text-primary)] text-sm">{b.category}</h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(b.category, b.limit.toString())}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--teal)] bg-transparent border-none cursor-pointer"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => onRemove(b.category)}
            className="p-1.5 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">Spent</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {currency}{b.spent.toLocaleString()} <span className="text-[length:var(--fs-overline)] font-medium text-[var(--text-muted)]">/ {currency}{b.limit.toLocaleString()}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">Remaining</p>
          <p className={`text-sm font-bold ${b.remaining < 0 ? 'text-red-500' : 'text-[var(--teal)]'}`}>
            {currency}{b.remaining.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-1.5 w-full bg-[var(--surface-card)] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(b.percent, 100)}%` }}
          className={`h-full rounded-full ${b.status === 'danger' ? 'bg-red-500' : b.status === 'warning' ? 'bg-amber-500' : 'bg-[var(--teal)]'}`}
        />
      </div>
      
      {b.percent > 100 && (
        <div className="mt-2 flex items-center gap-1 text-[length:var(--fs-overline)] font-bold text-red-500">
          <AlertCircle size={10} />
          OVER BUDGET BY {currency}{Math.abs(b.remaining).toLocaleString()}
        </div>
      )}
    </div>
  );
}
