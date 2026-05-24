import { TrendingDown, TrendingUp } from 'lucide-react';

interface MobileBalanceHeroProps {
  currentBalance: number;
  currency: string;
  hideBalances: boolean;
  trendUp: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function MobileBalanceHero({
  currentBalance,
  currency,
  hideBalances,
  trendUp,
  monthlyIncome,
  monthlyExpenses,
}: MobileBalanceHeroProps) {
  return (
    <section style={{ padding: '0 4px' }}>
      <div
        className="rounded-[28px] p-5"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Top row: label + trend */}
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
            Total Balance
          </p>
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${trendUp ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}
          >
            {trendUp
              ? <TrendingUp size={11} style={{ color: '#10b981' }} />
              : <TrendingDown size={11} style={{ color: '#ef4444' }} />
            }
            <span style={{ fontSize: '10px', fontWeight: 700, color: trendUp ? '#10b981' : '#ef4444', fontFamily: 'var(--font-inter)' }}>
              {trendUp ? 'On track' : 'Over spend'}
            </span>
          </div>
        </div>

        {/* Balance numeral */}
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-manrope)',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          {hideBalances
            ? <span style={{ letterSpacing: '4px' }}>••••••</span>
            : `${currency}${currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
          }
        </h2>

        {/* Income / Spent chips */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={11} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-inter)' }}>Income</span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: hideBalances ? 'var(--text-muted)' : '#10b981', fontFamily: 'var(--font-manrope)' }}>
              {hideBalances ? '•••' : `${currency}${monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </p>
          </div>
          <div
            className="rounded-2xl p-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={11} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-inter)' }}>Spent</span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: hideBalances ? 'var(--text-muted)' : '#ef4444', fontFamily: 'var(--font-manrope)' }}>
              {hideBalances ? '•••' : `${currency}${monthlyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
