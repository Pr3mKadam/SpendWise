import { useState, useMemo } from 'react';
import { Bot } from 'lucide-react';
import { Transaction } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useParentalControl } from '../contexts/ParentalControlContext';

interface TransactionListProps {
  transactions: Transaction[];
  onCategoryChange?: (id: string, newCategory: string) => void;
  currency?: string;
}

type TabFilter = 'all' | 'credit' | 'debit';

export default function TransactionList({ transactions, onCategoryChange, currency = '$' }: TransactionListProps) {
  const { mergedIcons } = useCategories();
  const { settings, isKidMode } = useParentalControl();
  const shouldHideBalances = isKidMode && settings.hideBalances;
  const [tab, setTab] = useState<TabFilter>('all');

  const filtered = useMemo(() => {
    const base = tab === 'all' ? transactions : transactions.filter(tx => tx.type === tab);
    return base.slice(0, 12);
  }, [transactions, tab]);

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).format(d);
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'credit', label: 'Revenue' },
    { key: 'debit',  label: 'Expenses' },
  ];

  return (
    <div className="card flex flex-col overflow-hidden" style={{ maxHeight: '700px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
        <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recent Transaction
        </h3>
        <button style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer' }}>
          View All ›
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

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-3xl mb-2 opacity-30">
              {tab === 'credit' ? '💰' : tab === 'debit' ? '💸' : '📋'}
            </span>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--text-muted)' }}>
              No transactions yet
            </p>
          </div>
        ) : (
          filtered.map((tx, index) => {
            const isCredit = tx.type === 'credit';
            return (
              <div
                key={tx.id}
                className={`group flex items-center gap-3 py-3 transition-colors rounded-xl px-2 -mx-2 ${
                  tx.isNew ? 'animate-fade-in-up' : ''
                }`}
                style={{
                  animationDelay: `${index * 0.03}s`,
                  borderBottom: index < filtered.length - 1 ? '1px solid #f7f8fa' : 'none',
                }}
              >
                {/* Category Icon */}
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 text-base"
                  style={{ background: '#f5f7fa' }}
                >
                  {mergedIcons[tx.category] || '📦'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                      {tx.merchant}
                    </p>
                    {tx.aiParsed && (
                      <span
                        className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0"
                        style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                      >
                        <Bot size={8} />AI
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{tx.category} · {formatDate(tx.date)}</span>
                    {tx.tags?.map(t => (
                      <span key={t} className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p
                      style={{
                        fontFamily: 'var(--font-manrope)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isCredit ? 'var(--green)' : 'var(--text-primary)',
                        filter: shouldHideBalances ? 'blur(6px)' : 'none',
                        opacity: shouldHideBalances ? 0.7 : 1,
                        transition: 'filter 0.3s'
                      }}
                      className="tabular-nums"
                    >
                      {shouldHideBalances ? '****' : (isCredit ? '+' : '-') + currency + tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
                      {formatDate(tx.date)}
                    </p>
                  </div>

                  {/* Edit Category */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={tx.category}
                      onChange={(e) => onCategoryChange?.(tx.id, e.target.value)}
                      className="bg-[var(--surface-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-md text-[10px] p-1 font-inter cursor-pointer hover:border-[var(--teal)] transition-colors focus:outline-none"
                    >
                      <option disabled value="">Change Category...</option>
                      {Object.keys(mergedIcons).map((cat) => (
                        <option key={cat} value={cat}>
                          {mergedIcons[cat]} {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
