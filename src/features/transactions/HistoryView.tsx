import { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { Virtuoso } from 'react-virtuoso';
import { AlertCircle } from 'lucide-react';
import PullToRefresh from '@/shell/PullToRefresh';

import { FilterBar } from '@/features/transactions/components/FilterBar';
import TransactionRow from '@/features/transactions/components/TransactionRow';
import BulkActionHeader from '@/features/transactions/components/BulkActionHeader';
import { SortBtn } from '@/features/transactions/components/SortBtn';
import { HistoryToolbar } from '@/features/transactions/components/HistoryToolbar';
import { DeleteConfirmModal } from '@/features/transactions/components/DeleteConfirmModal';
import { useHistoryView } from '@/features/transactions/components/useHistoryView';
import { useIsMobile } from '@/hooks/useMediaQuery';
import HistoryViewMobile from '@/features/transactions/HistoryViewMobile';

// Re-export types for consumers that still import from this file
export type { SortKey, SortDir, TypeFilter } from '@/features/transactions/components/historyTypes';

interface HistoryViewProps {
  transactions:          Transaction[];
  onCategoryChange?:     (id: string, newCategory: Category) => void;
  onBulkCategoryChange?: (ids: string[], newCategory: Category) => void;
  onDelete?:             (id: string) => void;
  onBulkDelete?:         (ids: string[]) => void;
  onImportClick?:        () => void;
  onPDFReport?:          () => void;
  currency?:             string;
  initialSearchQuery?:   string;
}

export default function HistoryView({
  transactions,
  onCategoryChange, onBulkCategoryChange,
  onDelete, onBulkDelete,
  onImportClick, onPDFReport,
  currency = '$',
  initialSearchQuery = '',
}: HistoryViewProps) {
  const isMobile = useIsMobile();
  const { allCategories, mergedIcons, mergedColors } = useCategories();

  const {
    search, setSearch, categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter, sortKey, sortDir,
    dateFrom, setDateFrom, dateTo, setDateTo,
    showDateFilter, setShowDateFilter,
    amountMin, setAmountMin, amountMax, setAmountMax,
    showAmountFilter, setShowAmountFilter,
    selectedIds, setSelectedIds,
    importToast, deleteConfirmId, setDeleteConfirmId,
    filtered, hasFilters, handleSort, handleImportJSON,
    handleRefresh, clearFilters, virtuosoRef,
  } = useHistoryView(transactions, initialSearchQuery);

  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [lastDeletedTx, setLastDeletedTx] = useState<Transaction | null>(null);
  const undoTimerRef = useRef<any>(null);

  // Auto-commit on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (lastDeletedTx && onDelete) {
        onDelete(lastDeletedTx.id);
      }
    };
  }, [lastDeletedTx, onDelete]);

  const handleInterceptDelete = (id: string) => {
    if (lastDeletedTx && onDelete) {
      onDelete(lastDeletedTx.id);
    }
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setLastDeletedTx(tx);
    const newPending = new Set<string>();
    newPending.add(id);
    setPendingDeleteIds(newPending);

    haptic.medium();

    undoTimerRef.current = setTimeout(() => {
      if (onDelete) onDelete(id);
      setLastDeletedTx(null);
      setPendingDeleteIds(new Set());
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastDeletedTx(null);
    setPendingDeleteIds(new Set());
    haptic.success();
  };

  const visibleFiltered = useMemo(() => {
    return filtered.filter(tx => !pendingDeleteIds.has(tx.id));
  }, [filtered, pendingDeleteIds]);

  const visibleTransactions = useMemo(() => {
    return transactions.filter(tx => !pendingDeleteIds.has(tx.id));
  }, [transactions, pendingDeleteIds]);

  const total = useMemo(() => {
    return visibleFiltered.reduce((a, tx) => a + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
  }, [visibleFiltered]);

  if (isMobile) {
    return (
      <HistoryViewMobile 
        transactions={visibleTransactions}
        currency={currency}
        onDelete={handleInterceptDelete}
        onCategoryChange={onCategoryChange}
      />
    );
  }

  type DisplayRow =
    | { type: 'header'; date: string; subtotal: number }
    | { type: 'tx'; tx: Transaction };

  const displayRows = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    visibleFiltered.forEach(tx => {
      const d = tx.date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    const rows: DisplayRow[] = [];

    sortedDates.forEach(date => {
      const list = groups[date];
      const subtotal = list.reduce((sum, tx) => sum + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
      rows.push({ type: 'header', date, subtotal });
      list.forEach(tx => {
        rows.push({ type: 'tx', tx });
      });
    });

    return rows;
  }, [visibleFiltered]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="animate-fade-in-up space-y-5">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-headline">Transaction History</h2>
            <p className="text-caption mt-1">
              {filtered.length} of {transactions.length} transactions · Net{' '}
              {total >= 0 ? `+${currency}${total.toFixed(2)}` : `-${currency}${Math.abs(total).toFixed(2)}`}
            </p>
          </div>
          <HistoryToolbar
            filtered={filtered}
            currency={currency}
            onImportClick={onImportClick}
            onPDFReport={onPDFReport}
            onImportJSON={handleImportJSON}
          />
        </div>

        <FilterBar
          search={search} setSearch={setSearch}
          showDateFilter={showDateFilter} setShowDateFilter={setShowDateFilter}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
          allCategories={allCategories} mergedIcons={mergedIcons}
          hasFilters={hasFilters} clearFilters={clearFilters}
          amountMin={amountMin} setAmountMin={setAmountMin}
          amountMax={amountMax} setAmountMax={setAmountMax}
          showAmountFilter={showAmountFilter} setShowAmountFilter={setShowAmountFilter}
        />

        {/* Table Card */}
        <div className="card overflow-hidden flex flex-col" style={{ height: '65vh', minHeight: 320 }}>
          {selectedIds.size > 0 && onCategoryChange && (
            <BulkActionHeader
              selectedCount={selectedIds.size}
              onClearSelection={() => setSelectedIds(new Set())}
              onBulkCategoryChange={(newCat) => {
                const ids = Array.from(selectedIds);
                if (onBulkCategoryChange) onBulkCategoryChange(ids, newCat);
                else ids.forEach(id => onCategoryChange(id, newCat));
                setSelectedIds(new Set());
              }}
              onBulkDelete={() => {
                if (window.confirm(`Delete ${selectedIds.size} transactions?`)) {
                  const ids = Array.from(selectedIds);
                  if (onBulkDelete) onBulkDelete(ids);
                  else if (onDelete) ids.forEach(id => onDelete(id));
                  setSelectedIds(new Set());
                }
              }}
            />
          )}

          {/* Table header */}
          <div className="hidden sm:flex items-center gap-4 px-5 py-3 shrink-0" style={{ borderBottom: '1.5px solid #f0f2f5' }}>
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
            <div className="w-24"><SortBtn label="Date"     field="date"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
            <div className="flex-1"><SortBtn label="Merchant" field="merchant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
            <div className="hidden md:block w-32"><SortBtn label="Category" field="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
            <div className="w-28 text-right"><SortBtn label="Amount" field="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
            {onCategoryChange && <div className="w-32" />}
          </div>

          {/* Rows */}
          <div className="flex-1 min-h-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f5f7fa' }}>
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
                      onDelete={(id) => {
                        const newSet = new Set(selectedIds);
                        newSet.delete(id);
                        setSelectedIds(newSet);
                        handleInterceptDelete(id);
                      }}
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
        </div>

        {/* Floating Undo Delete Toast Overlay */}
        {lastDeletedTx && (
          <div className="undo-toast show animate-slide-up">
            <div className="flex items-center justify-between w-full">
              <span className="text-[var(--text-primary)] font-medium">Transaction deleted</span>
              <button 
                onClick={handleUndoDelete}
                className="ml-4 px-3 py-1.5 rounded-xl bg-[var(--teal)] text-white text-[11px] font-black tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Undo
              </button>
            </div>
          </div>
        )}

        {/* Import Toast */}
        {importToast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in-up"
            style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
          >
            {importToast}
          </div>
        )}

        <DeleteConfirmModal
          deleteConfirmId={deleteConfirmId}
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={(id) => {
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
            handleInterceptDelete(id);
            setDeleteConfirmId(null);
          }}
        />
      </div>
    </PullToRefresh>
  );
}
