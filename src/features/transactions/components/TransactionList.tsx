import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { AlertCircle } from 'lucide-react';
import { SortBtn } from './SortBtn';
import TransactionRow from './TransactionRow';
import { DisplayRow } from '../hooks/useTransactionHistory';
import { Transaction, Category } from '@/types';
import type { SortKey, SortDir } from './historyTypes';

export interface TransactionListProps {
  filtered: Transaction[];
  displayRows: DisplayRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onDelete?: (id: string) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  sortKey: SortKey;
  sortDir: SortDir;
  handleSort: (key: SortKey) => void;
  virtuosoRef?: React.Ref<React.ElementRef<typeof Virtuoso>>;
}

export function TransactionList({
  filtered,
  displayRows,
  selectedIds,
  setSelectedIds,
  onCategoryChange,
  onDelete,
  currency,
  mergedColors,
  mergedIcons,
  sortKey,
  sortDir,
  handleSort,
  virtuosoRef
}: TransactionListProps) {
  return (
    <>
      <div className="hidden sm:flex items-center gap-4 px-5 py-3 shrink-0" style={{ borderBottom: '1.5px solid var(--border)' }}>
        <div className="w-6 flex items-center justify-center">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selectedIds.size === filtered.length}
            onChange={() => {
              if (selectedIds.size === filtered.length) setSelectedIds(new Set());
              else setSelectedIds(new Set(filtered.map(t => t.id)));
            }}
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
          />
        </div>
        <div className="w-10" />
        <div className="w-24"><SortBtn label="Date" field="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
        <div className="flex-1"><SortBtn label="Merchant" field="merchant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
        <div className="hidden md:block w-32"><SortBtn label="Category" field="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
        <div className="w-28 text-right"><SortBtn label="Amount" field="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
        {onCategoryChange && <div className="w-32" />}
      </div>

      <div className="flex-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--surface-input)' }}>
              <AlertCircle size={22} style={{ color: 'var(--text-dim)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>No transactions found</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            totalCount={displayRows.length}
            itemContent={(index) => {
              const row = displayRows[index];
              if (row.type === 'header') {
                const formattedDate = new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                });
                const sign = row.subtotal >= 0 ? '+' : '';
                const color = row.subtotal >= 0 ? 'var(--teal)' : 'var(--red)';
                return (
                  <div className="tx-date-header px-5 bg-[var(--surface-card)]">
                    <span>{formattedDate}</span>
                    <span className="subtotal" style={{ color }}>
                      {sign}{currency}{row.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              }

              const tx = row.tx;
              return (
                <TransactionRow
                  tx={tx}
                  selected={selectedIds.has(tx.id)}
                  onSelect={(id, selected) => {
                    const newSet = new Set(selectedIds);
                    if (selected) newSet.add(id); else newSet.delete(id);
                    setSelectedIds(newSet);
                  }}
                  onCategoryChange={onCategoryChange}
                  onDelete={onDelete}
                  currency={currency}
                  mergedColors={mergedColors}
                  mergedIcons={mergedIcons}
                />
              );
            }}
            style={{ height: '100%' }}
            increaseViewportBy={200}
          />
        )}
      </div>
    </>
  );
}
