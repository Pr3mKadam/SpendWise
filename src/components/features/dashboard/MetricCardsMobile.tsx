import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { MonthlyStats } from '../../../types';
import { useStore } from '../../../store';

interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality:     'low' | 'medium' | 'high';
    expectedChange:  number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}

export default function MetricCardsMobile({
  currentBalance,
  predictedEndOfMonth,
  projectionMeta,
  monthlyStats,
  currency = '$',
}: MetricCardsProps) {
  const isPositive = predictedEndOfMonth >= currentBalance;
  
  // Keep subtext shorter for mobile
  const projectionSub =
    projectionMeta.daysLeftInMonth > 0
      ? `${projectionMeta.daysLeftInMonth}d left · ${projectionMeta.dataQuality} conf.`
      : 'Month end snapshot';

  const cards = [
    {
      label: 'Balance',
      value: `${currency}${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'All Accounts',
      icon: Wallet,
      color: 'var(--teal)',
      bgColor: 'rgba(20,184,166,0.1)',
      trend: null,
    },
    {
      label: 'Income',
      value: `+${currency}${monthlyStats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'Total credits',
      icon: ArrowDownLeft,
      color: 'var(--green)',
      bgColor: 'rgba(34,197,94,0.1)',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Spend',
      value: `-${currency}${monthlyStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'Total debits',
      icon: ArrowUpRight,
      color: 'var(--red)',
      bgColor: 'rgba(239,68,68,0.1)',
      trend: monthlyStats.totalExpenses > 3000 ? '+8.2%' : '-3.1%',
      trendUp: false,
    },
    {
      label: 'Predicted',
      value: `${currency}${predictedEndOfMonth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: projectionSub,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'var(--teal)' : 'var(--amber)',
      bgColor: isPositive ? 'rgba(20,184,166,0.1)' : 'rgba(245,158,11,0.1)',
      trend: null,
      ai: true,
    },
  ];

  const store = useStore();
  const settings = store.parentalState;
  const shouldHideBalances = settings.hideBalances;

  return (
    <div className="grid grid-cols-2 gap-3 pb-safe">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            role="status"
            aria-label={`${card.label}: ${shouldHideBalances ? 'hidden' : card.value}`}
            className="rounded-2xl p-3 border border-[rgba(0,0,0,0.03)] dark:border-[rgba(255,255,255,0.05)] bg-[var(--surface)]"
            style={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col">
                <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {card.label}
                </span>
                {card.ai && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles size={8} style={{ color: 'var(--teal)' }} />
                    <span className="text-[8px] font-bold text-[var(--teal)] uppercase">
                      AI
                    </span>
                  </div>
                )}
              </div>
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg"
                style={{ background: card.bgColor }}
              >
                <Icon size={14} style={{ color: card.color }} strokeWidth={2.5} />
              </div>
            </div>

            <div
              className="tabular-nums mt-1 mb-1"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
                filter: shouldHideBalances ? 'blur(5px)' : 'none',
                opacity: shouldHideBalances ? 0.7 : 1,
                transition: 'filter 0.3s'
              }}
            >
              {shouldHideBalances ? '******' : card.value}
            </div>

            <div className="flex items-center justify-between mt-auto">
              {card.trend ? (
                <span
                  className={`flex items-center gap-0.5 text-[length:var(--fs-overline)] font-bold px-1.5 py-0.5 rounded-full ${card.trendUp ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                  style={{
                    color: card.trendUp ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {card.trendUp ? '↑' : '↓'} {card.trend}
                </span>
              ) : (
                <span className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-medium truncate">
                  {card.sub}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
