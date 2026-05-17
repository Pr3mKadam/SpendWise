import React from 'react';
import { Search, Filter, X, Calendar, IndianRupee } from 'lucide-react';
import { Category } from '../../../types';
import { haptic } from '../../../lib/haptic';

export type TypeFilter = 'all' | 'credit' | 'debit';

export interface FilterBarProps {
  search: string;
  setSearch: (s: string) => void;
  showDateFilter: boolean;
  setShowDateFilter: React.Dispatch<React.SetStateAction<boolean>>;
  dateFrom: string;
  setDateFrom: (s: string) => void;
  dateTo: string;
  setDateTo: (s: string) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (t: TypeFilter) => void;
  categoryFilter: Category | 'All';
  setCategoryFilter: (c: Category | 'All') => void;
  allCategories: Category[];
  mergedIcons: Record<string, string>;
  hasFilters: boolean;
  clearFilters: () => void;
  // Amount range
  amountMin?: string;
  setAmountMin?: (v: string) => void;
  amountMax?: string;
  setAmountMax?: (v: string) => void;
  showAmountFilter?: boolean;
  setShowAmountFilter?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FilterBar({
  search, setSearch,
  showDateFilter, setShowDateFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  typeFilter, setTypeFilter,
  categoryFilter, setCategoryFilter,
  allCategories, mergedIcons,
  hasFilters, clearFilters,
  amountMin = '', setAmountMin,
  amountMax = '', setAmountMax,
  showAmountFilter = false, setShowAmountFilter,
}: FilterBarProps) {
  const hasAmountFilter = Boolean(amountMin || amountMax);
  return (
    <div className="card px-3 sm:px-5 py-3 sm:py-4 space-y-3">
      <div className="flex flex-col gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="Search merchant, category, amount…"
            aria-label="Search transactions"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-9 pr-9 text-sm focus:outline-none transition-all"
            style={{ background: 'var(--surface-input)', border: '2px solid transparent', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)' }}
            onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
            onBlur={e => { e.target.style.border = '2px solid transparent'; }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              haptic.light();
              setShowDateFilter(s => !s);
            }}
            aria-label="Toggle date range filter"
            aria-expanded={showDateFilter}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all self-start"
            style={{
              background: showDateFilter || dateFrom || dateTo ? 'var(--teal-dim)' : 'var(--surface-input)',
              color: showDateFilter || dateFrom || dateTo ? 'var(--teal)' : 'var(--text-muted)',
              border: showDateFilter || dateFrom || dateTo ? '1.5px solid var(--teal-glow)' : '1.5px solid transparent',
              cursor: 'pointer', fontFamily: 'var(--font-inter)',
            }}
          >
            <Calendar size={13} /> Date Range
          </button>
          {setShowAmountFilter && (
            <button
              onClick={() => setShowAmountFilter(s => !s)}
              aria-label="Toggle amount range filter"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all self-start"
              style={{
                background: showAmountFilter || hasAmountFilter ? 'rgba(99,102,241,0.1)' : 'var(--surface-input)',
                color: showAmountFilter || hasAmountFilter ? '#818cf8' : 'var(--text-muted)',
                border: showAmountFilter || hasAmountFilter ? '1.5px solid rgba(99,102,241,0.3)' : '1.5px solid transparent',
                cursor: 'pointer', fontFamily: 'var(--font-inter)',
              }}
            >
              <IndianRupee size={13} /> Amount Range
            </button>
          )}
        </div>
      </div>

      {showDateFilter && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          <div className="flex items-center gap-2">
            <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
            <input
              type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ background: 'var(--surface-input)', border: '1.5px solid #edf2f7', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)', cursor: 'pointer' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
            <input
              type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ background: 'var(--surface-input)', border: '1.5px solid #edf2f7', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)', cursor: 'pointer' }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600 }}>
              <X size={12} style={{ display: 'inline', marginRight: 2 }} /> Clear dates
            </button>
          )}
        </div>
      )}

      {showAmountFilter && setAmountMin && setAmountMax && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          <div className="flex items-center gap-2">
            <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Min</label>
            <input
              type="number" placeholder="0" value={amountMin} onChange={e => setAmountMin(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none w-24"
              style={{ background: 'var(--surface-input)', border: '1.5px solid rgba(99,102,241,0.2)', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max</label>
            <input
              type="number" placeholder="∞" value={amountMax} onChange={e => setAmountMax(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none w-24"
              style={{ background: 'var(--surface-input)', border: '1.5px solid rgba(99,102,241,0.2)', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)' }}
            />
          </div>
          {(amountMin || amountMax) && (
            <button onClick={() => { setAmountMin(''); setAmountMax(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600 }}>
              <X size={12} style={{ display: 'inline', marginRight: 2 }} /> Clear
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1.5px solid #edf2f7' }}>
          {(['all', 'credit', 'debit'] as TypeFilter[]).map(t => (
            <button key={t}
              onClick={() => {
                haptic.light();
                setTypeFilter(t);
              }}
              style={{
                fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, padding: '5px 10px',
                background: typeFilter === t ? (t === 'credit' ? 'var(--teal-dim)' : t === 'debit' ? 'var(--red-dim)' : '#edf2f7') : '#fff',
                color: typeFilter === t ? (t === 'credit' ? 'var(--teal)' : t === 'debit' ? 'var(--red)' : 'var(--text-primary)') : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
              }}>
              {t === 'all' ? 'All' : t === 'credit' ? '+ Inc' : '− Exp'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-1 min-w-0">
          {['All', ...allCategories].map(cat => (
            <button key={cat}
              onClick={() => {
                haptic.light();
                setCategoryFilter(cat as Category | 'All');
              }}
              className="shrink-0 rounded-full px-2.5 py-1 text-[length:var(--fs-overline)] sm:text-xs font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-inter)',
                background: categoryFilter === cat ? 'var(--teal-dim)' : '#f5f7fa',
                color: categoryFilter === cat ? 'var(--teal)' : 'var(--text-muted)',
                border: categoryFilter === cat ? '1.5px solid var(--teal-glow)' : '1.5px solid transparent',
                cursor: 'pointer',
              }}>
              {cat !== 'All' && mergedIcons[cat]}{' '}{cat}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-semibold shrink-0"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
