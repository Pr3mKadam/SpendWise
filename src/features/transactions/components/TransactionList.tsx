import { useState, useMemo } from 'react';
import { Bot, Receipt, ArrowUpDown, Filter, Trash2, ChevronRight } from 'lucide-react';
import { Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store';
import { CategoryDropdown } from '@/ui/CategoryDropdown';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionListProps {
  transactions: Transaction[];
  onCategoryChange?: (id: string, newCategory: string) => void;
  onDelete?: (id: string) => void;
  currency?: string;
}

type TabFilter = 'all' | 'credit' | 'debit';

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).format(d);
};

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'credit', label: 'Revenue' },
  { key: 'debit',  label: 'Expenses' },
];

export default function TransactionList({ transactions, onCategoryChange, onDelete: _onDelete, currency = '$' }: TransactionListProps) {
  const { mergedIcons, mergedColors } = useCategories();
  const store = useStore();
  const settings = store.parentalState;
  const shouldHideBalances = settings.hideBalances;
  const [tab, setTab] = useState<TabFilter>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category))).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    let base = tab === 'all' ? transactions : transactions.filter(tx => tx.type === tab);
    
    if (categoryFilter !== 'all') {
      base = base.filter(tx => tx.category === categoryFilter);
    }

    const sorted = [...base].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return sorted.slice(0, 15);
  }, [transactions, tab, sortOrder, categoryFilter]);


  return (
    <div className="card flex flex-col overflow-hidden" style={{ maxHeight: '700px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
        <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recent Transaction
        </h3>
        <button className="group flex items-center gap-1 hover:bg-[var(--surface-input)] px-2 py-1 rounded-md transition-colors" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer' }}>
          View All <span className="transform transition-transform group-hover:translate-x-1">›</span>
        </button>
      </div>

      {/* Tabs — Finebank style: underline tabs */}
      <div className="flex px-5 pt-4 gap-5 shrink-0" style={{ borderBottom: '1.5px solid #f0f2f5' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              fontWeight: 600,
              paddingBottom: '10px',
              color: tab === t.key ? 'var(--teal)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--teal)' : '2px solid transparent',
              marginBottom: '-1.5px',
              background: 'none',
              border: 'none',
              borderBottomStyle: 'solid',
              cursor: 'pointer',
              transition: 'color 150ms',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sort & Filter Bar */}
      <div className="flex items-center gap-3 px-5 py-3 shrink-0" style={{ background: '#fafbfc', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setSortOrder(s => s === 'latest' ? 'oldest' : 'latest')}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[length:var(--fs-caption)] font-bold transition-colors"
          style={{ 
            background: 'white', 
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <ArrowUpDown size={12} className="text-[var(--teal)]" />
          {sortOrder === 'latest' ? 'Latest' : 'Oldest'}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Filter size={12} className="text-[var(--text-muted)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 bg-transparent border-none text-[length:var(--fs-caption)] font-bold text-[var(--text-secondary)] outline-none cursor-pointer p-0"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div 
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: 'var(--surface-input)', color: 'var(--text-muted)' }}
              >
                <Receipt size={32} strokeWidth={1.5} />
              </div>
              <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No transactions found
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px', lineHeight: 1.5 }}>
                {categoryFilter !== 'all' 
                  ? `No transactions in "${categoryFilter}" category.` 
                  : "Use the Quick Add panel to log your first expense."}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-1">
              {filtered.map((tx, index) => {
                const isCredit = tx.type === 'credit';
                const catColor = mergedColors[tx.category] || 'var(--teal)';
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    key={tx.id}
                    className="group flex items-center gap-3 py-3 transition-all rounded-xl px-2 -mx-2 hover:bg-[var(--surface-hover)]"
                  >
                    {/* Category Icon */}
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 text-lg shadow-sm"
                      style={{ background: 'white', border: '1px solid #f1f3f5' }}
                    >
                      {mergedIcons[tx.category] || '📦'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                          {tx.merchant}
                        </p>
                        {tx.aiParsed && (
                          <span
                            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider shrink-0"
                            style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                          >
                            <Bot size={8} />AI
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[length:var(--fs-overline)] font-bold uppercase tracking-wider"
                          style={{ background: `${catColor}15`, color: catColor }}
                        >
                          {tx.category}
                        </span>
                        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: 'var(--text-muted)' }}>
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p
                          style={{
                            fontFamily: 'var(--font-manrope)',
                            fontSize: '15px',
                            fontWeight: 800,
                            color: isCredit ? 'var(--green)' : 'var(--text-primary)',
                            filter: shouldHideBalances ? 'blur(6px)' : 'none',
                            opacity: shouldHideBalances ? 0.7 : 1,
                            transition: 'filter 0.3s'
                          }}
                          className="tabular-nums"
                        >
                          {shouldHideBalances ? '****' : (isCredit ? '+' : '-') + currency + tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Dropdown for category change */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity w-32 hidden md:block">
                        <CategoryDropdown
                          value={tx.category}
                          onChange={(newCat) => onCategoryChange?.(tx.id, newCat)}
                        />
                      </div>

                      {/* Quick delete for mobile or hover */}
                      <button
                        onClick={() => _onDelete?.(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
