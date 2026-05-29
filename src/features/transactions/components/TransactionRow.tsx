import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, X, Tag } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Transaction, Category } from '@/types';
import { CategoryDropdown } from '@/components/ui/CategoryDropdown';
import { haptic } from '@/core/haptic';
import { useCategories } from '@/hooks/useCategories';

export interface TransactionRowProps {
  tx: Transaction;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onDelete?: (id: string) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
}

export function TransactionRow({
  tx,
  selected,
  onSelect,
  onCategoryChange,
  onDelete,
  currency,
  mergedColors,
  mergedIcons
}: TransactionRowProps) {
  const { allCategories } = useCategories();
  const [showCategorySwapper, setShowCategorySwapper] = useState(false);
  const isCredit = tx.type === 'credit';
  const dateStr = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  // Long press handling for mobile native feel
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      haptic.medium();
      onSelect(tx.id, !selected);
    }, 500);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const x = useMotionValue(0);
  const opacityDelete = useTransform(x, [-80, -40, 0], [1, 0.5, 0]);
  const opacityCategory = useTransform(x, [0, 40, 80], [0, 0.5, 1]);
  const [isDeleting, setIsDeleting] = useState(false);

  if (showCategorySwapper) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 px-3 sm:px-5 py-3 bg-[var(--surface-light)] w-full h-[60px] relative z-10 overflow-hidden"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button 
          onClick={() => setShowCategorySwapper(false)}
          className="p-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
        >
          <X size={14} />
        </button>
        <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase mr-1 shrink-0 border-r border-[var(--border)] pr-2">
          Category
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
          {allCategories.map(cat => {
            const isSelected = tx.category === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  haptic.success();
                  onCategoryChange?.(tx.id, cat);
                  setShowCategorySwapper(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0 border"
                style={{ 
                  background: isSelected ? `${mergedColors[cat] || '#14b8a6'}20` : 'var(--surface-card)',
                  color: mergedColors[cat] || '#14b8a6',
                  borderColor: isSelected ? mergedColors[cat] || '#14b8a6' : 'var(--border)'
                }}
              >
                <span>{mergedIcons[cat] || '📦'}</span>
                <span>{cat}</span>
              </button>
            )
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[var(--surface-card)]" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Background Actions (Delete on Left drag, Category on Right drag) */}
      <div className="absolute inset-0 flex items-center justify-between z-0">
        {/* Swiping Right → Reveals Category trigger on the left */}
        <div className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-start px-6 bg-[var(--teal)] text-white">
          <motion.div style={{ opacity: opacityCategory }} className="flex items-center gap-2">
            <Tag size={18} />
            <span className="text-[10px] font-black tracking-widest uppercase">Change Category</span>
          </motion.div>
        </div>

        {/* Swiping Left → Reveals Delete trigger on the right */}
        <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end px-6 bg-red-500 text-white">
          <motion.div style={{ opacity: opacityDelete }}>
            <Trash2 size={20} />
          </motion.div>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.15}
        onDragStart={() => haptic.light()}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            haptic.heavy();
            if (onDelete) onDelete(tx.id);
          } else if (info.offset.x > 60) {
            haptic.medium();
            setShowCategorySwapper(true);
          }
        }}
        style={{ x }}
        className="group flex items-center gap-2 px-3 sm:px-5 py-3 transition-colors hover:bg-[var(--surface-light)] bg-[var(--surface-card)] relative z-10"
        role="row"
        aria-selected={selected}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
      >
        <div className="w-5 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity" style={{ opacity: selected ? 1 : undefined }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              onSelect(tx.id, e.target.checked);
              haptic.light();
            }}
            aria-label={`Select transaction with ${tx.merchant}`}
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
          />
        </div>
        <span className="flex w-9 h-9 items-center justify-center rounded-xl text-base shrink-0" style={{ background: `${mergedColors[tx.category] || '#14b8a6'}15` }}>
          {mergedIcons[tx.category] || '📦'}
        </span>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{tx.merchant}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>{dateStr}</span>
            {tx.tags?.map(t => (
              <span key={t} className="rounded-md px-1.5 py-0.5 text-[length:var(--fs-overline)] font-semibold" style={{ background: 'var(--surface-input)', color: 'var(--text-secondary)' }}>
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden sm:block w-24 shrink-0">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${mergedColors[tx.category] || '#14b8a6'}15`, color: mergedColors[tx.category] || '#14b8a6', fontFamily: 'var(--font-inter)' }}>
            {tx.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <div className="text-right">
            <p
              style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 700, color: isCredit ? 'var(--teal)' : 'var(--red)' }}
              className="tabular-nums whitespace-nowrap"
            >
              {isCredit ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          {isCredit ? <ArrowDownLeft size={11} className="hidden sm:block" style={{ color: 'var(--teal)' }} /> : <ArrowUpRight size={11} className="hidden sm:block" style={{ color: 'var(--red)' }} />}
        </div>
        {onCategoryChange && (
          <div className="hidden md:block opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity w-32 shrink-0">
            <CategoryDropdown
              value={tx.category}
              onChange={(newCat) => onCategoryChange(tx.id, newCat as Category)}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default TransactionRow;
