import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { Virtuoso } from 'react-virtuoso';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  ChevronRight,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/lib/haptic';
import EmptyState from '@/ui/EmptyState';

interface HistoryViewMobileProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  currency?: string;
  onCategoryChange?: (id: string, newCategory: Category) => void;
}

export default function HistoryViewMobile({
  transactions,
  onDelete,
  currency = '₹',
  onCategoryChange
}: HistoryViewMobileProps) {
  const { allCategories, mergedIcons, mergedColors } = useCategories();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.merchant.toLowerCase().includes(search.toLowerCase()) || 
                           tx.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tx.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, activeCategory]);

  const total = filtered.reduce((acc, tx) => acc + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);

  const handleRowClick = (tx: Transaction) => {
    haptic.light();
    // Detail view or edit could go here
  };

  return (
    <div className="view-enter flex flex-col h-[calc(100vh-140px)]">
      {/* 1. Header with Quick Stats */}
      <div className="px-1 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">History</h2>
            <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
              {filtered.length} TRANSACTIONS
            </p>
          </div>
          <div className={`px-4 py-2 rounded-2xl ${total >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border border-current/20`}>
            <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-center opacity-70">Net</p>
            <p className="text-sm font-bold">{total >= 0 ? '+' : ''}{currency}{Math.abs(total).toLocaleString()}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search merchants, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl pl-12 pr-4 text-sm text-[var(--text-primary)] focus:border-[var(--teal)] outline-none transition-all"
          />
        </div>
      </div>

      {/* 2. Category Chips */}
      <div className="flex gap-2 overflow-x-auto px-1 pb-4 no-scrollbar">
        {['All', ...allCategories].map((cat) => (
          <button
            key={cat}
            onClick={() => { haptic.light(); setActiveCategory(cat as any); }}
            className={`px-4 py-2 rounded-full text-[length:var(--fs-overline)] font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${
              activeCategory === cat 
                ? 'bg-[var(--teal)] text-white border-[var(--teal)] shadow-md' 
                : 'bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Transaction List */}
      <div className="flex-1 min-h-0 bg-[var(--surface-card)] rounded-[var(--radius-sheet)] border border-[var(--border)] shadow-sm overflow-hidden">
        <Virtuoso
          totalCount={filtered.length}
          itemContent={(index) => {
            const tx = filtered[index];
            return (
              <button 
                key={tx.id}
                onClick={() => handleRowClick(tx)}
                className="w-full text-left p-4 border-b border-[var(--border)] flex items-center gap-4 active:bg-[var(--surface-light)] transition-colors focus:outline-none focus:bg-[var(--surface-light)]"
                aria-label={`${tx.merchant}, ${tx.type === 'debit' ? 'spent' : 'received'} ${currency}${tx.amount}, ${tx.category}, ${new Date(tx.date).toLocaleDateString()}`}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${mergedColors[tx.category] || 'var(--teal)'}15` }}
                >
                  {mergedIcons[tx.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{tx.merchant}</p>
                    <p className={`text-sm font-bold ${tx.type === 'debit' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">{tx.category}</p>
                    <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] font-medium">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-dim)] shrink-0">
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); haptic.medium(); onDelete(tx.id); }}
                      className="p-1.5 rounded-lg active:bg-red-500/10 active:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete ${tx.merchant} transaction`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
              </button>
            );
          }}
          style={{ height: '100%' }}
        />
        
        {filtered.length === 0 && (
          <EmptyState 
            message="No results found." 
            subMessage="Try a different search term or category." 
          />
        )}
      </div>
    </div>
  );
}
