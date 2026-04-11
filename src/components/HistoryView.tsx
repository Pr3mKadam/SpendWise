import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Trash2, Download, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Transaction, Category } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

interface HistoryViewProps {
  transactions: Transaction[];
  onDelete?:    (id: string) => void;
  currency?:    string;
}

type SortKey    = 'date' | 'amount' | 'merchant' | 'category';
type SortDir    = 'asc'  | 'desc';
type TypeFilter = 'all'  | 'credit' | 'debit';

const CATEGORIES: (Category | 'All')[] = [
  'All', 'Food', 'Subscriptions', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Income',
];
const PAGE_SIZE = 12;

function exportCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount'];
  const rows = transactions.map(tx => [tx.date, `"${tx.merchant.replace(/"/g, '""')}"`, tx.category, tx.type, tx.type === 'credit' ? tx.amount : -tx.amount]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `spendwise-${new Date().toISOString().split('T')[0]}.csv` });
  a.click(); URL.revokeObjectURL(url);
}

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

export default function HistoryView({ transactions, onDelete, currency = '$' }: HistoryViewProps) {
  const [search, setSearch]           = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [typeFilter, setTypeFilter]   = useState<TypeFilter>('all');
  const [sortKey, setSortKey]         = useState<SortKey>('date');
  const [sortDir, setSortDir]         = useState<SortDir>('desc');
  const [page, setPage]               = useState(1);

  const handleSort = (key: SortKey) => {
    setSortKey(k => { if (k === key) { setSortDir(d => d === 'desc' ? 'asc' : 'desc'); return k; } setSortDir('desc'); return key; });
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions
      .filter(tx => {
        if (categoryFilter !== 'All' && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (q) return tx.merchant.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q) || tx.amount.toString().includes(q) || tx.date.includes(q);
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

  const total      = filtered.reduce((a, tx) => a + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || categoryFilter !== 'All' || typeFilter !== 'all';

  const clearFilters = () => { setSearch(''); setCategoryFilter('All'); setTypeFilter('all'); setPage(1); };

  return (
    <div className="animate-fade-in-up space-y-5">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-headline">Transaction History</h2>
          <p className="text-caption mt-1">
            {filtered.length} transactions · Net {total >= 0 ? `+${currency}${total.toFixed(2)}` : `-${currency}${Math.abs(total).toFixed(2)}`}
          </p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40"
          style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)', border: '1.5px solid var(--teal-glow)', cursor: filtered.length ? 'pointer' : 'not-allowed' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters Card */}
      <div className="card px-5 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="Search merchant, category, amount…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl py-2.5 pl-9 pr-9 text-sm focus:outline-none transition-all"
            style={{ background: '#f8fafc', border: '2px solid transparent', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)' }}
            onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
            onBlur={e => { e.target.style.border = '2px solid transparent'; }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type + Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />

          {/* Type pills */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1.5px solid #edf2f7' }}>
            {(['all', 'credit', 'debit'] as TypeFilter[]).map(t => (
              <button key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                style={{
                  fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, padding: '5px 12px',
                  background: typeFilter === t ? (t === 'credit' ? 'var(--teal-dim)' : t === 'debit' ? 'var(--red-dim)' : '#edf2f7') : '#fff',
                  color: typeFilter === t ? (t === 'credit' ? 'var(--teal)' : t === 'debit' ? 'var(--red)' : 'var(--text-primary)') : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 150ms',
                }}>
                {t === 'all' ? 'All' : t === 'credit' ? '+ Income' : '− Expense'}
              </button>
            ))}
          </div>

          {/* Category pills (scrollable) */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-1">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => { setCategoryFilter(cat); setPage(1); }}
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: categoryFilter === cat ? 'var(--teal-dim)' : '#f5f7fa',
                  color: categoryFilter === cat ? 'var(--teal)' : 'var(--text-muted)',
                  border: categoryFilter === cat ? '1.5px solid var(--teal-glow)' : '1.5px solid transparent',
                  cursor: 'pointer',
                }}>
                {cat !== 'All' && CATEGORY_ICONS[cat as Category]}{' '}{cat}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1.5px solid #f0f2f5' }}>
          <div className="w-10" />
          <div className="w-24"><SortBtn label="Date" field="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          <div className="flex-1"><SortBtn label="Merchant" field="merchant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          <div className="hidden md:block w-28"><SortBtn label="Category" field="category" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          <div className="w-28 text-right"><SortBtn label="Amount" field="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} /></div>
          {onDelete && <div className="w-8" />}
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f5f7fa' }}>
              <Search size={22} style={{ color: 'var(--text-dim)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>No transactions found</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>Try adjusting your filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 rounded-lg px-3 py-1.5 text-sm font-semibold"
                style={{ background: '#f5f7fa', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          paginated.map((tx, i) => {
            const isCredit = tx.type === 'credit';
            const dateStr  = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
            return (
              <div
                key={tx.id}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{
                  borderBottom: i < paginated.length - 1 ? '1px solid #f7f8fa' : 'none',
                  background: tx.isNew ? '#f0fdfb' : undefined,
                }}
              >
                <span className="flex w-10 h-10 items-center justify-center rounded-xl text-base shrink-0" style={{ background: `${CATEGORY_COLORS[tx.category] || '#14b8a6'}15` }}>
                  {CATEGORY_ICONS[tx.category]}
                </span>
                <div className="hidden sm:block w-24 shrink-0">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{dateStr}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{tx.merchant}</p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }} className="sm:hidden">{dateStr}</p>
                </div>
                <div className="hidden md:block w-28 shrink-0">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${CATEGORY_COLORS[tx.category]}15`, color: CATEGORY_COLORS[tx.category], fontFamily: 'var(--font-inter)' }}>
                    {tx.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-28 justify-end shrink-0">
                  <div className="text-right">
                    <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '14px', fontWeight: 700, color: isCredit ? 'var(--teal)' : 'var(--text-primary)' }} className="tabular-nums">
                      {isCredit ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {isCredit ? <ArrowDownLeft size={12} style={{ color: 'var(--teal)' }} /> : <ArrowUpRight size={12} style={{ color: 'var(--red)' }} />}
                </div>
                {onDelete && (
                  <button onClick={() => onDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex w-7 h-7 items-center justify-center rounded-lg"
                    style={{ background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    title="Delete">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1.5px solid #f0f2f5' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30"
                style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: 'none', cursor: page > 1 ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-inter)' }}>
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                  style={{
                    background: page === i + 1 ? 'var(--teal)' : '#f5f7fa',
                    color: page === i + 1 ? '#fff' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)',
                  }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30"
                style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: 'none', cursor: page < totalPages ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-inter)' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
