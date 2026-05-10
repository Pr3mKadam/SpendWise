import { useState, useMemo, useRef } from 'react';
import { Search, Download, ChevronUp, ChevronDown, Upload, FileText } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

// Extracted components and utils
import FilterBar from '../features/history/FilterBar';
import TransactionRow from '../features/history/TransactionRow';
import BulkActionHeader from '../features/history/BulkActionHeader';
import { exportCSV, exportJSON } from '../../utils/export';

interface HistoryViewProps {
  transactions: Transaction[];
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onBulkCategoryChange?: (ids: string[], newCategory: Category) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onImportClick?: () => void;
  onPDFReport?:   () => void;
  currency?:    string;
}

export type SortKey    = 'date' | 'amount' | 'merchant' | 'category';
export type SortDir    = 'asc'  | 'desc';
export type TypeFilter = 'all'  | 'credit' | 'debit';




function SortBtn({ label, field, sortKey, sortDir, onSort }: { label: string; field: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void }) {
  const active = sortKey === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1"
      style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: active ? 'var(--teal)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
    >
      {label}
      {active ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : <ChevronDown size={12} style={{ opacity: 0.3 }} />}
    </button>
  );
}

export default function HistoryView({ 
  transactions, 
  onCategoryChange, 
  onBulkCategoryChange,
  onDelete, 
  onBulkDelete,
  onImportClick, 
  onPDFReport, 
  currency = '$' 
}: HistoryViewProps) {
  const { allCategories, mergedIcons, mergedColors } = useCategories();
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [typeFilter, setTypeFilter]       = useState<TypeFilter>('all');
  const [sortKey, setSortKey]             = useState<SortKey>('date');
  const [sortDir, setSortDir]             = useState<SortDir>('desc');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          // In a real app, we'd call an onImport prop
          alert(`Imported ${data.length} transactions (simulation)`);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSort = (key: SortKey) => {
    setSortKey(k => { if (k === key) { setSortDir(d => d === 'desc' ? 'asc' : 'desc'); return k; } setSortDir('desc'); return key; });
    virtuosoRef.current?.scrollToIndex({ index: 0 });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions
      .filter(tx => {
        if (categoryFilter !== 'All' && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo   && tx.date > dateTo)   return false;
        if (q) return tx.merchant.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q) || tx.amount.toString().includes(q) || tx.date.includes(q) || (tx.tags && tx.tags.some(t => t.toLowerCase().includes(q)));
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'date')     cmp = a.date.localeCompare(b.date);
        if (sortKey === 'amount')   cmp = a.amount - b.amount;
        if (sortKey === 'merchant') cmp = a.merchant.localeCompare(b.merchant);
        if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
        return sortDir === 'desc' ? -cmp : cmp;
      });
  }, [transactions, search, categoryFilter, typeFilter, sortKey, sortDir, dateFrom, dateTo]);

  const total      = filtered.reduce((a, tx) => a + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
  const hasFilters = search || categoryFilter !== 'All' || typeFilter !== 'all' || dateFrom || dateTo;

  const clearFilters = () => { setSearch(''); setCategoryFilter('All'); setTypeFilter('all'); setDateFrom(''); setDateTo(''); };



  return (
    <div className="animate-fade-in-up space-y-5">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-headline">Transaction History</h2>
          <p className="text-caption mt-1">
            {filtered.length} of {transactions.length} transactions · Net {total >= 0 ? `+${currency}${total.toFixed(2)}` : `-${currency}${Math.abs(total).toFixed(2)}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onImportClick && (
            <button
              onClick={onImportClick}
              aria-label="Import transactions from external source"
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors"
              style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: '1.5px solid #edf2f7', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}
            >
              <Upload size={14} /> <span className="hidden sm:inline">Import</span>
            </button>

          )}
          {onPDFReport && (
            <button
              onClick={onPDFReport}
              aria-label="Generate PDF report of history"
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors"
              style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: '1.5px solid #edf2f7', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}
            >
              <FileText size={14} /> <span className="hidden sm:inline">PDF Report</span>
            </button>

          )}
          <button
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            aria-label="Export history to CSV file"
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40"
            style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)', border: '1.5px solid var(--teal-glow)', cursor: filtered.length ? 'pointer' : 'not-allowed' }}
          >
            <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => exportJSON(filtered)}
            disabled={filtered.length === 0}
            aria-label="Export history to JSON file"
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40"
            style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)', border: '1.5px solid var(--teal-glow)', cursor: filtered.length ? 'pointer' : 'not-allowed' }}
          >
            <Download size={14} /> <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import history from JSON file"
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors"
            style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: '1.5px solid #edf2f7', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}
          >
            <Upload size={14} /> <span className="hidden sm:inline">Import JSON</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
            accept=".json" 
            className="hidden" 
          />
        </div>
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
      />

      {/* Table Card */}
      <div className="card overflow-hidden flex flex-col" style={{ height: '65vh', minHeight: 320 }}>
        {selectedIds.size > 0 && onCategoryChange && (
          <BulkActionHeader
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onBulkCategoryChange={(newCat) => {
              const ids = Array.from(selectedIds);
              if (onBulkCategoryChange) {
                onBulkCategoryChange(ids, newCat);
              } else if (onCategoryChange) {
                ids.forEach(id => onCategoryChange(id, newCat));
              }
              setSelectedIds(new Set());
            }}
            onBulkDelete={() => {
              if (window.confirm(`Delete ${selectedIds.size} transactions?`)) {
                const ids = Array.from(selectedIds);
                if (onBulkDelete) {
                  onBulkDelete(ids);
                } else if (onDelete) {
                  ids.forEach(id => onDelete(id));
                }
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
          <div className="w-24"><SortBtn label="Date" field="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          <div className="flex-1"><SortBtn label="Merchant" field="merchant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          <div className="hidden md:block w-32"><SortBtn label="Category" field="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          <div className="w-28 text-right"><SortBtn label="Amount" field="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          {onCategoryChange && <div className="w-32" />}
        </div>

        {/* Rows with Virtuoso */}
        <div className="flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f5f7fa' }}>
                <Search size={22} style={{ color: 'var(--text-dim)' }} />
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
                      if (selected) newSet.add(id);
                      else newSet.delete(id);
                      setSelectedIds(newSet);
                    }}
                    onCategoryChange={onCategoryChange}
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
    </div>
  );
}
