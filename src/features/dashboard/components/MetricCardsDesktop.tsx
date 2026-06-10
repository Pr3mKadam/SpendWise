import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats } from '@/types';
import { useStore } from '@/store';

interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality: 'low' | 'medium' | 'high';
    expectedChange: number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}

export default function MetricCards({
  currentBalance,
  predictedEndOfMonth,
  projectionMeta,
  monthlyStats,
  currency = '$',
}: MetricCardsProps) {
  const displayBalance = useCountUp(currentBalance, 600);
  const displayIncome = useCountUp(monthlyStats.totalIncome, 500);
  const displayExpenses = useCountUp(monthlyStats.totalExpenses, 500);
  const displayPredicted = useCountUp(predictedEndOfMonth, 600);

  const isPositive = predictedEndOfMonth >= currentBalance;
  const projectionSub =
    projectionMeta.daysLeftInMonth > 0
      ? `${projectionMeta.daysLeftInMonth}d left Â· ${projectionMeta.dataQuality} confidence Â· 30-day burn Ã— days left`
      : 'Month ending â€” snapshot';

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
      label: 'Predicted month-end',
      value: `${currency}${displayPredicted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: projectionSub,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'var(--teal)' : 'var(--amber)',
      dimColor: isPositive ? 'var(--teal-dim)' : 'var(--amber-dim)',
      trend: null,
      ai: true,
    },
  ];

  const store = useStore();
  const settings = store.parentalState;
  const shouldHideBalances = settings.hideBalances;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            role="status"
            aria-label={`${card.label}: ${shouldHideBalances ? 'hidden' : card.value}`}
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
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--teal)',
                        fontWeight: 600,
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Predictive
                    </span>
                  </div>
                )}
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl shadow-sm"
                style={{
                  background:
                    card.color === 'var(--teal)'
                      ? 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.05) 100%)'
                      : card.color === 'var(--green)'
                        ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)'
                        : card.color === 'var(--red)'
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)'
                          : card.dimColor,
                  border: `1px solid ${card.dimColor}`,
                }}
              >
                <Icon size={20} style={{ color: card.color }} strokeWidth={2} />
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
                filter: shouldHideBalances ? 'blur(8px)' : 'none',
                opacity: shouldHideBalances ? 0.7 : 1,
                transition: 'filter 0.3s',
              }}
            >
              {shouldHideBalances ? '••••••' : card.value}
            </div>

            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                {card.sub}
              </span>
              {card.trend && (
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${card.trendUp ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                  style={{
                    color: card.trendUp ? 'var(--green)' : 'var(--red)',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '11px',
                  }}
                >
                  {card.trendUp ? 'â†‘' : 'â†“'} {card.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
