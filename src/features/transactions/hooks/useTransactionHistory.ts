import { useState, useMemo, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import type { SortKey, SortDir, TypeFilter } from '@/features/transactions/components/historyTypes';

export type DisplayRow =
  | { type: 'header'; date: string; subtotal: number }
  | { type: 'tx'; tx: Transaction };

export function useTransactionHistory(
  transactions: Transaction[],
  initialSearchQuery: string = ''
) {
  const [search, setSearch] = useState(initialSearchQuery);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [showAmountFilter, setShowAmountFilter] = useState(false);

  useEffect(() => {
    if (initialSearchQuery) setSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  const handleSort = (key: SortKey) => {
    setSortKey(k => {
      if (k === key) {
        setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
        return k;
      }
      setSortDir('desc');
      return key;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const minAmt = amountMin !== '' ? parseFloat(amountMin) : null;
    const maxAmt = amountMax !== '' ? parseFloat(amountMax) : null;

    return transactions
      .filter(tx => {
        if (categoryFilter !== 'All' && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo && tx.date > dateTo) return false;
        if (minAmt !== null && tx.amount < minAmt) return false;
        if (maxAmt !== null && tx.amount > maxAmt) return false;
        if (q)
          return (
            tx.merchant.toLowerCase().includes(q) ||
            tx.category.toLowerCase().includes(q) ||
            tx.amount.toString().includes(q) ||
            tx.date.includes(q) ||
            (tx.tags && tx.tags.some(t => t.toLowerCase().includes(q)))
          );
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
        if (sortKey === 'amount') cmp = a.amount - b.amount;
        if (sortKey === 'merchant') cmp = a.merchant.localeCompare(b.merchant);
        if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
        return sortDir === 'desc' ? -cmp : cmp;
      });
  }, [
    transactions,
    search,
    categoryFilter,
    typeFilter,
    sortKey,
    sortDir,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
  ]);

  const displayRows = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(tx => {
      const d = tx.date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    const rows: DisplayRow[] = [];

    sortedDates.forEach(date => {
      const list = groups[date];
      const subtotal = list.reduce(
        (sum, tx) => sum + (tx.type === 'debit' ? -tx.amount : tx.amount),
        0
      );
      rows.push({ type: 'header', date, subtotal });
      list.forEach(tx => {
        rows.push({ type: 'tx', tx });
      });
    });

    return rows;
  }, [filtered]);

  const hasFilters = Boolean(
    search ||
    categoryFilter !== 'All' ||
    typeFilter !== 'all' ||
    dateFrom ||
    dateTo ||
    amountMin ||
    amountMax
  );

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
  };

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    sortKey,
    sortDir,
    handleSort,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    showDateFilter,
    setShowDateFilter,
    amountMin,
    setAmountMin,
    amountMax,
    setAmountMax,
    showAmountFilter,
    setShowAmountFilter,
    filtered,
    displayRows,
    hasFilters,
    clearFilters,
  };
}
