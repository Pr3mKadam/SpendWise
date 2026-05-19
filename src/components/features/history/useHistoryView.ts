import { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import { useStore } from '@/store';
import { haptic } from '@/lib/haptic';
import { Virtuoso } from 'react-virtuoso';
import type { SortKey, SortDir, TypeFilter } from '@/components/features/history/historyTypes';

export function useHistoryView(transactions: Transaction[], initialSearchQuery: string) {
  const addTransactions   = useStore(s => s.addTransactions);
  const virtuosoRef       = useRef<React.ElementRef<typeof Virtuoso>>(null);

  const [search,            setSearch]            = useState(initialSearchQuery);
  const [categoryFilter,    setCategoryFilter]    = useState<Category | 'All'>('All');
  const [typeFilter,        setTypeFilter]        = useState<TypeFilter>('all');
  const [sortKey,           setSortKey]           = useState<SortKey>('date');
  const [sortDir,           setSortDir]           = useState<SortDir>('desc');
  const [dateFrom,          setDateFrom]          = useState('');
  const [dateTo,            setDateTo]            = useState('');
  const [showDateFilter,    setShowDateFilter]    = useState(false);
  const [amountMin,         setAmountMin]         = useState('');
  const [amountMax,         setAmountMax]         = useState('');
  const [showAmountFilter,  setShowAmountFilter]  = useState(false);
  const [selectedIds,       setSelectedIds]       = useState<Set<string>>(new Set());
  const [importToast,       setImportToast]       = useState<string | null>(null);
  const [deleteConfirmId,   setDeleteConfirmId]   = useState<string | null>(null);

  useEffect(() => { if (initialSearchQuery) setSearch(initialSearchQuery); }, [initialSearchQuery]);

  const handleSort = (key: SortKey) => {
    setSortKey(k => {
      if (k === key) { setSortDir(d => d === 'desc' ? 'asc' : 'desc'); return k; }
      setSortDir('desc'); return key;
    });
    virtuosoRef.current?.scrollToIndex({ index: 0 });
  };

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const minAmt = amountMin !== '' ? parseFloat(amountMin) : null;
    const maxAmt = amountMax !== '' ? parseFloat(amountMax) : null;
    return transactions
      .filter(tx => {
        if (categoryFilter !== 'All' && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo   && tx.date > dateTo)   return false;
        if (minAmt !== null && tx.amount < minAmt) return false;
        if (maxAmt !== null && tx.amount > maxAmt) return false;
        if (q) return (
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
        if (sortKey === 'date')     cmp = a.date.localeCompare(b.date);
        if (sortKey === 'amount')   cmp = a.amount - b.amount;
        if (sortKey === 'merchant') cmp = a.merchant.localeCompare(b.merchant);
        if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
        return sortDir === 'desc' ? -cmp : cmp;
      });
  }, [transactions, search, categoryFilter, typeFilter, sortKey, sortDir, dateFrom, dateTo, amountMin, amountMax]);

  const hasFilters = Boolean(search || categoryFilter !== 'All' || typeFilter !== 'all' || dateFrom || dateTo || amountMin || amountMax);
  const clearFilters = () => { setSearch(''); setCategoryFilter('All'); setTypeFilter('all'); setDateFrom(''); setDateTo(''); setAmountMin(''); setAmountMax(''); };

  const handleRefresh = async () => {
    haptic.medium();
    await new Promise(resolve => setTimeout(resolve, 1500));
    haptic.success();
  };

  return {
    // state
    search, setSearch, categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter, sortKey, sortDir,
    dateFrom, setDateFrom, dateTo, setDateTo,
    showDateFilter, setShowDateFilter,
    amountMin, setAmountMin, amountMax, setAmountMax,
    showAmountFilter, setShowAmountFilter,
    selectedIds, setSelectedIds,
    importToast, deleteConfirmId, setDeleteConfirmId,
    // computed
    filtered, hasFilters,
    // handlers
    handleSort, handleImportJSON, handleRefresh, clearFilters,
    // refs
    virtuosoRef,
  };
}
