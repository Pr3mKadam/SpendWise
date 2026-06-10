import { useMemo } from 'react';
import { useStore } from '@/store';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { TrendingUp, TrendingDown, Send, Clock, DollarSign } from 'lucide-react';

interface ExchangeRatePoint {
  date: string;
  rate: number;
}

const REMITTANCE_CURRENCIES: Record<string, CurrencyCode> = {
  USD: '$',
  AED: 'AED',
  GBP: '£',
  SGD: 'S$',
  SAR: 'SAR',
  EUR: '€',
};

function groupByMonthYear(dateStr: string): string {
  return dateStr.substring(0, 7);
}

export function RemittanceView() {
  const transactions = useStore(s => s.transactions);
  const { format: formatCurrency } = useCurrency();

  const remittances = useMemo(() => {
    return transactions.filter(t => {
      const isRemittanceTag = t.tags?.includes('remittance');
      const isIncome = t.category === 'Income';
      const hasForeignCurrency =
        t.originalCurrency && t.originalCurrency !== '₹' && t.originalCurrency !== 'INR';
      return isRemittanceTag || (isIncome && hasForeignCurrency);
    });
  }, [transactions]);

  const monthlyStats = useMemo(() => {
    const stats: Record<
      string,
      { count: number; totalOriginal: number; totalINR: number; fees: number }
    > = {};
    for (const t of remittances) {
      const month = groupByMonthYear(t.date);
      if (!stats[month]) stats[month] = { count: 0, totalOriginal: 0, totalINR: 0, fees: 0 };
      stats[month].count++;
      stats[month].totalOriginal += t.amount;
      stats[month].totalINR += t.exchangeRate ? t.amount * t.exchangeRate : t.amount;
      stats[month].fees += t.exchangeRate ? t.amount * (t.exchangeRate * 0.005) : 0;
    }
    return stats;
  }, [remittances]);

  const rateHistory = useMemo(() => {
    const points: ExchangeRatePoint[] = [];
    for (const t of remittances) {
      if (t.originalCurrency && t.exchangeRate && t.originalCurrency !== '₹') {
        const iso = Object.entries(REMITTANCE_CURRENCIES).find(
          ([, v]) => v === getSymbolForCurrency(t.originalCurrency!)
        )?.[0];
        if (iso) {
          points.push({ date: t.date, rate: t.exchangeRate });
        }
      }
    }
    points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return points;
  }, [remittances]);

  const totalFeeEstimate = useMemo(() => {
    return remittances.reduce((sum, t) => {
      const fee = t.exchangeRate ? t.amount * (t.exchangeRate * 0.005) : 0;
      return sum + fee;
    }, 0);
  }, [remittances]);

  const bestRate = useMemo(() => {
    if (rateHistory.length === 0) return null;
    return rateHistory.reduce((best, p) => (p.rate > best.rate ? p : best), rateHistory[0]);
  }, [rateHistory]);

  const worstRate = useMemo(() => {
    if (rateHistory.length === 0) return null;
    return rateHistory.reduce((worst, p) => (p.rate < worst.rate ? p : worst), rateHistory[0]);
  }, [rateHistory]);

  const totalRemittedOriginal = useMemo(() => {
    return remittances.reduce((s, t) => s + t.amount, 0);
  }, [remittances]);

  const months = Object.keys(monthlyStats).sort();

  if (remittances.length === 0) return null;

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Send size={18} className="text-indigo-500" />
        </div>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Remittance Tracker
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            NRI wire transfers & exchange rate trends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Total Remitted
          </p>
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}
          >
            {formatCurrency(totalRemittedOriginal, '₹')}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Transactions
          </p>
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}
          >
            {remittances.length}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <DollarSign size={12} className="inline mr-1" />
            Est. Fees
          </p>
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}
          >
            {formatCurrency(totalFeeEstimate, '₹')}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={12} className="inline mr-1" />
            Best Rate
          </p>
          <p
            className="text-lg font-bold tabular-nums"
            style={{
              color: bestRate ? 'var(--teal, #10b981)' : 'var(--text-muted)',
              fontFamily: 'var(--font-manrope)',
            }}
          >
            {bestRate ? bestRate.rate.toFixed(4) : 'N/A'}
          </p>
        </div>
      </div>

      {rateHistory.length > 1 && (
        <div className="rounded-xl p-3 mb-5" style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Exchange Rate Trends
            </span>
          </div>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-500" />
              Best: {bestRate?.rate.toFixed(4)} ({bestRate?.date})
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown size={14} className="text-red-500" />
              Worst: {worstRate?.rate.toFixed(4)} ({worstRate?.date})
            </span>
          </div>
          <div className="mt-2 h-8 flex items-end gap-0.5">
            {rateHistory.slice(-30).map((p, i) => {
              const min = Math.min(...rateHistory.slice(-30).map(x => x.rate));
              const max = Math.max(...rateHistory.slice(-30).map(x => x.rate));
              const h = ((p.rate - min) / (max - min || 1)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  title={`${p.date}: ${p.rate.toFixed(4)}`}
                  style={{
                    height: `${Math.max(h, 10)}%`,
                    background:
                      p.rate === bestRate?.rate
                        ? 'var(--teal, #10b981)'
                        : p.rate === worstRate?.rate
                          ? '#ef4444'
                          : '#6366f1',
                    opacity: 0.7,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {months.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Monthly Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left py-2 pr-3">Month</th>
                  <th className="text-right py-2 pr-3">Count</th>
                  <th className="text-right py-2 pr-3">Total Sent</th>
                  <th className="text-right py-2">Est. Fees</th>
                </tr>
              </thead>
              <tbody>
                {months
                  .slice(-12)
                  .reverse()
                  .map(month => {
                    const s = monthlyStats[month];
                    return (
                      <tr
                        key={month}
                        className="border-t"
                        style={{ borderColor: 'var(--border, #e5e7eb)' }}
                      >
                        <td
                          className="py-2 pr-3 font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {month}
                        </td>
                        <td
                          className="text-right py-2 pr-3 tabular-nums"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {s.count}
                        </td>
                        <td
                          className="text-right py-2 pr-3 tabular-nums font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatCurrency(s.totalINR, '₹')}
                        </td>
                        <td className="text-right py-2 tabular-nums" style={{ color: '#ef4444' }}>
                          {formatCurrency(s.fees, '₹')}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getSymbolForCurrency(curr: string): CurrencyCode {
  const map: Record<string, CurrencyCode> = {
    USD: '$',
    AED: 'AED',
    GBP: '£',
    SGD: 'S$',
    SAR: 'SAR',
    EUR: '€',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  };
  return map[curr.toUpperCase()] || '₹';
}
