import { Transaction, Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { Virtuoso } from 'react-virtuoso';
import { AlertCircle } from 'lucide-react';
import PullToRefresh from '@/shell/PullToRefresh';

import { FilterBar } from '@/components/features/history/FilterBar';
import TransactionRow from '@/components/features/history/TransactionRow';
import BulkActionHeader from '@/components/features/history/BulkActionHeader';
import { SortBtn } from '@/components/features/history/SortBtn';
import { HistoryToolbar } from '@/components/features/history/HistoryToolbar';
import { DeleteConfirmModal } from '@/components/features/history/DeleteConfirmModal';
import { useHistoryView } from '@/components/features/history/useHistoryView';
import { useIsMobile } from '@/hooks/useMediaQuery';
import HistoryViewMobile from '@/components/views/HistoryViewMobile';

// Re-export types for consumers that still import from this file
export type { SortKey, SortDir, TypeFilter } from '@/components/features/history/historyTypes';

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

  const total = filtered.reduce((a, tx) => a + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);

  if (isMobile) {
    return (
      <HistoryViewMobile 
        transactions={transactions}
        currency={currency}
        onDelete={onDelete}
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
                totalCount={filtered.length}
                itemContent={(index) => {
                  const tx = filtered[index];
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
                        if (onDelete) onDelete(id);
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
            if (onDelete) onDelete(id);
            setDeleteConfirmId(null);
          }}
        />
      </div>
    </PullToRefresh>
  );
}
