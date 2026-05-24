import { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from '@/shell/PullToRefresh';
import { haptic } from '@/lib/haptic';
import { useStore } from '@/store';

import { TransactionFilters } from '@/features/transactions/components/TransactionFilters';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import BulkActionHeader from '@/features/transactions/components/BulkActionHeader';
import { HistoryToolbar } from '@/features/transactions/components/HistoryToolbar';
import { DeleteConfirmModal } from '@/features/transactions/components/DeleteConfirmModal';
import { useTransactionHistory } from '@/features/transactions/hooks/useTransactionHistory';
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
  const addTransactions = useStore(s => s.addTransactions);

  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  
  // Create a visible subset of transactions that excludes pending deletes
  const visibleTransactions = useMemo(() => {
    return transactions.filter(tx => !pendingDeleteIds.has(tx.id));
  }, [transactions, pendingDeleteIds]);

  const {
    search, setSearch, categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter, sortKey, sortDir,
    dateFrom, setDateFrom, dateTo, setDateTo,
    showDateFilter, setShowDateFilter,
    amountMin, setAmountMin, amountMax, setAmountMax,
    showAmountFilter, setShowAmountFilter,
    filtered, displayRows, hasFilters, clearFilters, handleSort
  } = useTransactionHistory(visibleTransactions, initialSearchQuery);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importToast, setImportToast] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const virtuosoRef = useRef<React.ElementRef<typeof Virtuoso>>(null);

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

  const total = useMemo(() => {
    return filtered.reduce((a, tx) => a + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
  }, [filtered]);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw  = JSON.parse(event.target?.result as string);
        const data: Transaction[] = Array.isArray(raw) ? raw : (raw.transactions ?? []);
        if (data.length === 0) {
          setImportToast('No transactions found in file.');
          setTimeout(() => setImportToast(null), 3000);
          return;
        }
        const imported = data.map(tx => ({
          ...tx,
          id: `imp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        }));
        addTransactions(imported);
        setImportToast(`✅ Imported ${imported.length} transactions successfully!`);
        setTimeout(() => setImportToast(null), 4000);
      } catch {
        setImportToast('❌ Invalid JSON file. Please try again.');
        setTimeout(() => setImportToast(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleRefresh = async () => {
    haptic.medium();
    await new Promise(resolve => setTimeout(resolve, 1500));
    haptic.success();
  };

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

        <TransactionFilters
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

          <TransactionList
            filtered={filtered}
            displayRows={displayRows}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
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
            sortKey={sortKey}
            sortDir={sortDir}
            handleSort={(key) => {
              handleSort(key);
              virtuosoRef.current?.scrollToIndex({ index: 0 });
            }}
            virtuosoRef={virtuosoRef}
          />
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
