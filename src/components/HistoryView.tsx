import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Download,
  History,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

interface HistoryViewProps {
  transactions: Transaction[];
  onDelete?:    (id: string) => void;
}

type SortKey    = 'date' | 'amount' | 'merchant' | 'category';
type SortDir    = 'asc' | 'desc';
type TypeFilter = 'all' | 'credit' | 'debit';

const CATEGORIES: (Category | 'All')[] = [
  'All', 'Food', 'Subscriptions', 'Transport', 'Entertainment',
  'Shopping', 'Utilities', 'Health', 'Income',
];

const PAGE_SIZE = 12;

// ── CSV Export ──────────────────────────────────────────────────────────────────

function exportCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount'];
  const rows = transactions.map(tx => [
    tx.date,
    `"${tx.merchant.replace(/"/g, '""')}"`,
    tx.category,
    tx.type,
    tx.type === 'credit' ? tx.amount : -tx.amount,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `spendwise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sort header button ──────────────────────────────────────────────────────────

function SortButton({
  label,
  field,
  sortKey,
  sortDir,
  onSort,
}: {
  label:   string;
  field:   SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort:  (k: SortKey) => void;
}) {
  const active = sortKey === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition ${
        active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
      {active ? (
        sortDir === 'desc'
          ? <ChevronDown className="h-3 w-3" />
          : <ChevronUp className="h-3 w-3" />
      ) : (
        <ChevronDown className="h-3 w-3 opacity-30" />
      )}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function HistoryView({ transactions, onDelete }: HistoryViewProps) {
  const [search, setSearch]                     = useState('');
  const [categoryFilter, setCategoryFilter]     = useState<Category | 'All'>('All');
  const [typeFilter, setTypeFilter]             = useState<TypeFilter>('all');
  const [sortKey, setSortKey]                   = useState<SortKey>('date');
  const [sortDir, setSortDir]                   = useState<SortDir>('desc');
  const [page, setPage]                         = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions
      .filter(tx => {
        if (categoryFilter !== 'All' && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (q) {
          return (
            tx.merchant.toLowerCase().includes(q) ||
            tx.category.toLowerCase().includes(q) ||
            tx.amount.toString().includes(q) ||
            tx.date.includes(q) ||
            (tx.description?.toLowerCase().includes(q) ?? false)
          );
        }
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
  }, [transactions, search, categoryFilter, typeFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalFiltered    = filtered.reduce((a, tx) => a + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
  const hasActiveFilters = search || categoryFilter !== 'All' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setTypeFilter('all');
    setPage(1);
  };

  return (
    <div className="animate-fade-in-up space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <History className="h-5 w-5 text-blue-400" />
            Transaction History
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} ·{' '}
            {totalFiltered >= 0
              ? `Net +$${totalFiltered.toFixed(2)}`
              : `Net -$${Math.abs(totalFiltered).toFixed(2)}`}
          </p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="glass-card space-y-3 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchant, category, amount…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />

          <div className="flex overflow-hidden rounded-lg border border-slate-700/60">
            {(['all', 'credit', 'debit'] as TypeFilter[]).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                  typeFilter === t
                    ? t === 'credit'
                      ? 'bg-blue-500/20 text-blue-400'
                      : t === 'debit'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-700/60 text-slate-300'
                    : 'bg-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                {t === 'all' ? 'All' : t === 'credit' ? '+ Income' : '− Debit'}
              </button>
            ))}
          </div>

          <div className="flex flex-1 gap-1.5 overflow-x-auto pb-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setPage(1); }}
                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                  categoryFilter === cat
                    ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat !== 'All' && CATEGORY_ICONS[cat as Category]}{' '}
                {cat}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg bg-slate-800/40 px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="hidden items-center gap-4 border-b border-slate-800/60 px-5 py-3 sm:flex">
          <div className="w-8" />
          <div className="w-20">
            <SortButton label="Date"     field="date"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
          </div>
          <div className="flex-1">
            <SortButton label="Merchant" field="merchant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
          </div>
          <div className="w-28">
            <SortButton label="Category" field="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
          </div>
          <div className="w-24 text-right">
            <SortButton label="Amount"   field="amount"   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
          </div>
          {onDelete && <div className="w-8" />}
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60">
              <Search className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">No transactions found</p>
            <p className="mt-1 text-xs text-slate-600">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {paginated.map(tx => {
              const dateStr = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day:   'numeric',
                year:  '2-digit',
              });
              return (
                <div
                  key={tx.id}
                  className={`group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-800/30 sm:gap-4 sm:px-5 ${
                    tx.isNew ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ backgroundColor: `${CATEGORY_COLORS[tx.category]}18` }}
                  >
                    {CATEGORY_ICONS[tx.category]}
                  </span>

                  <div className="hidden w-20 flex-shrink-0 sm:block">
                    <p className="text-xs text-slate-500">{dateStr}</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{tx.merchant}</p>
                    <p className="text-[10px] text-slate-500 sm:hidden">{dateStr}</p>
                  </div>

                  <div className="hidden w-28 flex-shrink-0 sm:block">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[tx.category]}18`,
                        color:           CATEGORY_COLORS[tx.category],
                      }}
                    >
                      {tx.category}
                    </span>
                  </div>

                  <div className="flex w-24 flex-shrink-0 items-center justify-end gap-1">
                    {tx.type === 'credit' ? (
                      <ArrowDownLeft className="h-3 w-3 text-blue-400" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 text-red-400/80" />
                    )}
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        tx.type === 'credit' ? 'text-blue-400' : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}$
                      {tx.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {onDelete && (
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="flex-shrink-0 rounded-lg p-1.5 text-slate-700 opacity-0 transition hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/60 px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      page === pageNum
                        ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                        : 'border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
