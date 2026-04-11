import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { CategorySpend, MonthlyStats } from '../types';

interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  topCategory: CategorySpend | null;
  monthlyStats: MonthlyStats;
  currency?: string;
}

export default function MetricCards({
  currentBalance,
  predictedEndOfMonth,
  topCategory,
  monthlyStats,
  currency = '$',
}: MetricCardsProps) {
  const displayBalance = useCountUp(currentBalance, 600);
  const displayIncome = useCountUp(monthlyStats.totalIncome, 500);
  const displayExpenses = useCountUp(monthlyStats.totalExpenses, 500);
  const displayPredicted = useCountUp(predictedEndOfMonth, 600);

  const isPositive = predictedEndOfMonth >= currentBalance;

  const cards = [
    {
      label: 'Total Balance',
      value: `${currency}${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'All Accounts',
      icon: Wallet,
      color: 'var(--teal)',
      dimColor: 'var(--teal-dim)',
      trend: null,
    },
    {
      label: 'Monthly Income',
      value: `+${currency}${displayIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Total credits',
      icon: ArrowDownLeft,
      color: 'var(--green)',
      dimColor: 'var(--green-dim)',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Monthly Spend',
      value: `-${currency}${displayExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Total debits',
      icon: ArrowUpRight,
      color: 'var(--red)',
      dimColor: 'var(--red-dim)',
      trend: monthlyStats.totalExpenses > 3000 ? '+8.2%' : '-3.1%',
      trendUp: false,
    },
    {
      label: 'AI Projection',
      value: `${currency}${displayPredicted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'End of month',
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'var(--teal)' : 'var(--amber)',
      dimColor: isPositive ? 'var(--teal-dim)' : 'var(--amber-dim)',
      trend: null,
      ai: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="card px-5 py-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {card.label}
                </div>
                {card.ai && (
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkles size={10} style={{ color: 'var(--teal)' }} />
                    <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                      AI Powered
                    </span>
                  </div>
                )}
              </div>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: card.dimColor }}
              >
                <Icon size={18} style={{ color: card.color }} strokeWidth={2.5} />
              </div>
            </div>

            <div
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              {card.value}
            </div>

            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
                {card.sub}
              </span>
              {card.trend && (
                <span
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{
                    color: card.trendUp ? 'var(--green)' : 'var(--red)',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '11px',
                  }}
                >
                  {card.trendUp ? '↑' : '↓'} {card.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
