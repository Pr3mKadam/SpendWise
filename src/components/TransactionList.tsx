import { useState, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORY_ICONS } from '../data/mockData';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

type TabFilter = 'all' | 'credit' | 'debit';

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [tab, setTab] = useState<TabFilter>('all');

  const filtered = useMemo(() => {
    const base = tab === 'all' ? transactions : transactions.filter(tx => tx.type === tab);
    return base.slice(0, 10);
  }, [transactions, tab]);

  const formatDate = (isoString: string) => {
    // Append T00:00:00 to avoid UTC timezone shift issue
    const d = new Date(isoString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'credit', label: 'Income' },
    { key: 'debit',  label: 'Expense' },
  ];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-0">
        <h3 className="text-base font-bold text-white">Transactions</h3>
        <span className="text-[10px] text-slate-500 font-medium">
          {filtered.length} shown
        </span>
      </div>

      {/* Functional Tab Filters */}
      <div className="flex p-4 gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full text-xs font-semibold py-2 transition-all duration-200 ${
              tab === t.key
                ? t.key === 'credit'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : t.key === 'debit'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-[#1c2230] border border-white/5 text-slate-400 hover:text-white hover:bg-[#1e2738]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-3xl mb-2 opacity-30">
              {tab === 'credit' ? '💰' : tab === 'debit' ? '💸' : '📋'}
            </span>
            <p className="text-sm font-medium text-slate-500">
              No {tab === 'all' ? '' : tab === 'credit' ? 'income ' : 'expense '}transactions yet
            </p>
          </div>
        ) : (
          filtered.map((tx, index) => {
            const isCredit = tx.type === 'credit';

            return (
              <div
                key={tx.id}
                className={`group relative flex items-center justify-between rounded-2xl bg-[#0d131f] border border-white/[0.03] p-3.5 transition-all hover:bg-[#131926] hover:border-white/10 ${
                  tx.isNew ? 'animate-fade-in-up border-blue-500/20 bg-blue-500/5' : ''
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full shrink-0 ${
                    isCredit ? 'bg-blue-500/15 text-blue-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {isCredit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">{tx.merchant}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] text-slate-600">{formatDate(tx.date)}</p>
                      <span className="h-0.5 w-0.5 rounded-full bg-slate-700" />
                      <p className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                        {CATEGORY_ICONS[tx.category] || '💸'} {tx.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`text-sm font-bold tabular-nums ${isCredit ? 'text-blue-400' : 'text-slate-200'}`}>
                    {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>

                  {/* Delete button - appears on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
