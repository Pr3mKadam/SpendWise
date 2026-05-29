import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Transaction, AppView } from '@/types';
import { haptic } from '@/core/haptic';

const CAT_EMOJI: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Utilities: '⚡',
  Health: '💊', Travel: '✈️', Education: '📚', Business: '💼',
  Subscriptions: '📱', Entertainment: '🎬', Income: '💰',
};

interface MobileRecentTransactionsProps {
  recentTransactions: Transaction[];
  onNavigate: (view: AppView) => void;
  currency: string;
}

export function MobileRecentTransactions({
  recentTransactions,
  onNavigate,
  currency,
}: MobileRecentTransactionsProps) {
  return (
    <section style={{ padding: '0 4px' }}>
      <div
        className="rounded-[24px]"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}>
            Recent
          </h3>
          <button
            onClick={() => { haptic.light(); onNavigate('history'); }}
            className="flex items-center gap-0.5 active:opacity-70"
            style={{ color: 'var(--teal)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-inter)' }}
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        {/* Transaction rows */}
        <div style={{ paddingBottom: '12px' }}>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center py-10 px-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-glow)' }}
              >
                <Plus size={24} style={{ color: 'var(--teal)' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-manrope)' }}>
                No transactions yet
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
                Tap + to record your first one
              </p>
            </div>
          ) : (
            recentTransactions.map((tx: Transaction, idx: number) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-5 py-3 active:bg-[var(--surface-hover)] transition-colors"
                style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border)' }}
              >
                {/* Category emoji badge */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'var(--surface-input)' }}
                >
                  {CAT_EMOJI[tx.category] ?? (tx.type === 'credit' ? '💰' : '💸')}
                </div>

                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.merchant}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
                    {tx.category} · {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Amount */}
                <p style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-manrope)',
                  color: tx.type === 'debit' ? '#ef4444' : '#10b981',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
