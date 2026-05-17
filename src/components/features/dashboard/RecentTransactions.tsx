import { Transaction, AppView } from '../../../types';
import Card from '../../common/Card';
import { WalletCards } from 'lucide-react';
import { initials, avatarColor } from '../../../utils/avatar';

const TEXT_PRIMARY = '#0f1117';
const TEXT_MUTED = '#9197a6';

interface RecentTransactionsProps {
  recentTx: Transaction[];
  onNavigate: (view: AppView) => void;
  hideBalances: boolean;
  currency: string;
}

export default function RecentTransactions({ recentTx, onNavigate, hideBalances, currency }: RecentTransactionsProps) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-3 sm:px-5 pt-4 pb-3">
        <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>Transaction History</p>
        <button
          onClick={() => onNavigate('history')}
          aria-label="View all transactions"
          style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', margin: '-8px', whiteSpace: 'nowrap' }}
        >
          View all →
        </button>
      </div>

      {recentTx.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
             <WalletCards size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)] mb-1">No transactions yet</p>
          <p className="text-xs text-[var(--text-muted)] max-w-[200px]">Add your first transaction using the Quick Add panel to get started.</p>
        </div>
      ) : (
        recentTx.map((tx: Transaction, i) => {
          const bg = avatarColor(tx.merchant);
          const isLast = i === recentTx.length - 1;
          return (
            <div key={tx.id}
              className={`${i >= 3 ? 'hidden sm:flex' : 'flex'} items-center px-3 sm:px-5 py-2.5 gap-2 sm:gap-3 transition-colors hover:bg-[#f8f9fc]`}
              style={{
                borderTop: '1px solid rgba(0,0,0,0.04)',
                borderBottom: isLast ? 'none' : undefined,
              }}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center" style={{ background: bg }}>
                <span className="text-[length:var(--fs-caption)] font-bold text-white">{initials(tx.merchant)}</span>
              </div>
              {/* Name + date (mobile) */}
              <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className="text-[13px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{tx.merchant}</span>
                <span className="text-[length:var(--fs-overline)]" style={{ color: TEXT_MUTED }}>
                  {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
              </div>
              {/* Category badge - hidden on tiny screens */}
              <span className="hidden sm:inline-block shrink-0" style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                background: tx.type === 'credit' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                color: tx.type === 'credit' ? '#059669' : '#dc2626',
                textTransform: 'capitalize',
              }}>
                {tx.category}
              </span>
              {/* Amount */}
              <span 
                className={`text-[13px] font-bold tabular-nums shrink-0 transition-all ${hideBalances ? 'blur-md select-none' : ''}`} 
                style={{ color: tx.type === 'credit' ? '#10b981' : TEXT_PRIMARY }}
              >
                {tx.type === 'credit' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
          );
        })
      )}
    </Card>
  );
}
