import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction, Category } from '../../../types';
import { CategoryDropdown } from '../../common/CategoryDropdown';

export interface TransactionRowProps {
  tx: Transaction;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
}

export function TransactionRow({
  tx,
  selected,
  onSelect,
  onCategoryChange,
  currency,
  mergedColors,
  mergedIcons
}: TransactionRowProps) {
  const isCredit = tx.type === 'credit';
  const dateStr = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  return (
    <div
      className="group flex items-center gap-2 px-3 sm:px-5 py-3 transition-colors hover:bg-gray-50/50"
      role="row"
      aria-selected={selected}
      style={{
        borderBottom: '1px solid #f7f8fa',
        background: tx.isNew ? '#f0fdfb' : selected ? 'var(--teal-dim)' : undefined,
      }}
    >
      <div className="w-5 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity" style={{ opacity: selected ? 1 : undefined }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(tx.id, e.target.checked)}
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
            <span key={t} className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}>
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
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 700, color: isCredit ? 'var(--teal)' : 'var(--text-primary)' }} className="tabular-nums whitespace-nowrap">
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
    </div>
  );
}

export default TransactionRow;
