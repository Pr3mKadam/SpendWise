import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Transaction } from '@/types';
import { forecastNextMonth } from '@/features/analytics/insights/forecast';

interface SpendingForecastProps {
  transactions: Transaction[];
  currency?: string;
}

const ConfidenceBadge = ({ confidence, reason }: { confidence: string; reason: string }) => {
  const cfg = {
    high: {
      bg: 'rgba(16,185,129,0.1)',
      color: '#10b981',
      icon: CheckCircle,
      label: 'High Confidence',
    },
    medium: {
      bg: 'rgba(245,158,11,0.1)',
      color: '#f59e0b',
      icon: AlertCircle,
      label: 'Medium Confidence',
    },
    low: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: Clock, label: 'Low Confidence' },
  }[confidence] ?? {
    bg: 'rgba(16,185,129,0.1)',
    color: '#10b981',
    icon: CheckCircle,
    label: 'High Confidence',
  };

  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: cfg.bg }}>
      <Icon size={14} style={{ color: cfg.color, marginTop: 1, flexShrink: 0 }} />
      <div>
        <span className="text-[length:var(--fs-caption)] font-bold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <p
          className="text-[length:var(--fs-overline)] mt-0.5 font-medium"
          style={{ color: cfg.color, opacity: 0.8 }}
        >
          {reason}
        </p>
      </div>
    </div>
  );
};

const TrendArrow = ({ trend, pct: _pct }: { trend: string; pct: number }) => {
  if (trend === 'stable') return <Minus size={12} className="text-gray-400" />;
  if (trend === 'up') return <TrendingUp size={12} className="text-red-400" />;
  return <TrendingDown size={12} className="text-emerald-500" />;
};

export function SpendingForecast({ transactions, currency = '₹' }: SpendingForecastProps) {
  const forecast = useMemo(() => forecastNextMonth(transactions), [transactions]);

  const top5 = forecast.categoryForecasts.slice(0, 5);
  const maxPredicted = top5[0]?.predicted ?? 1;

  const fmt = (n: number) =>
    `${currency}${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Zap size={17} className="text-violet-500" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-base text-[var(--text-primary)]">
              Next Month Forecast
            </h3>
            <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] mt-0.5">
              Local prediction · {forecast.daysRemaining} days remaining this month
            </p>
          </div>
        </div>
        <ConfidenceBadge confidence={forecast.confidence} reason={forecast.confidenceReason} />
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {/* Predicted Income */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1.5px solid rgba(16,185,129,0.12)',
          }}
        >
          <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-emerald-600 mb-1">
            Income Est.
          </p>
          <p className="font-manrope font-bold text-xl text-[var(--text-primary)]">
            {fmt(forecast.predictedIncome)}
          </p>
          <p className="text-[length:var(--fs-overline)] text-emerald-500 mt-1 font-medium">
            Based on avg credits
          </p>
        </div>
        {/* Predicted Spend */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.12)' }}
        >
          <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-red-500 mb-1">
            Spend Est.
          </p>
          <p className="font-manrope font-bold text-xl text-[var(--text-primary)]">
            {fmt(forecast.predictedTotal)}
          </p>
          <p className="text-[length:var(--fs-overline)] text-red-400 mt-1 font-medium">
            Run-rate: {fmt(forecast.runRate)}
          </p>
        </div>
        {/* Savings */}
        <div
          className="rounded-2xl p-4"
          style={{
            background:
              forecast.predictedSavings >= 0 ? 'rgba(99,102,241,0.06)' : 'rgba(249,115,22,0.06)',
            border: `1.5px solid ${forecast.predictedSavings >= 0 ? 'rgba(99,102,241,0.12)' : 'rgba(249,115,22,0.12)'}`,
          }}
        >
          <p
            className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest mb-1"
            style={{ color: forecast.predictedSavings >= 0 ? '#6366f1' : '#f97316' }}
          >
            Net Savings
          </p>
          <p
            className={`font-manrope font-bold text-xl ${forecast.predictedSavings >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}
          >
            {forecast.predictedSavings >= 0 ? '+' : '-'}
            {fmt(forecast.predictedSavings)}
          </p>
          <p
            className="text-[length:var(--fs-overline)] mt-1 font-medium"
            style={{ color: forecast.predictedSavings >= 0 ? '#6366f1' : '#f97316', opacity: 0.7 }}
          >
            {forecast.predictedSavings >= 0 ? 'On track 🎉' : 'Consider reducing spend'}
          </p>
        </div>
      </div>

      {/* Current month snapshot */}
      {forecast.spentSoFar > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] uppercase tracking-wide">
              Spent So Far This Month
            </p>
            <p className="font-manrope font-bold text-lg text-[var(--text-primary)]">
              {fmt(forecast.spentSoFar)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] uppercase tracking-wide">
              Daily Rate
            </p>
            <p className="font-manrope font-bold text-base text-[var(--text-primary)]">
              {fmt(forecast.spentSoFar / Math.max(1, 30 - forecast.daysRemaining))} / day
            </p>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {top5.length > 0 ? (
        <div className="space-y-2.5">
          <p className="text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Top Category Forecasts
          </p>
          {top5.map(cat => (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-[length:var(--fs-caption)] font-semibold text-[var(--text-muted)] w-24 shrink-0 truncate">
                {cat.category}
              </span>
              <div
                className="flex-1 relative h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--surface-input)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (cat.predicted / maxPredicted) * 100)}%`,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <TrendArrow trend={cat.trend} pct={cat.trendPct} />
                <span className="font-manrope font-bold text-[13px] text-[var(--text-primary)] tabular-nums">
                  {currency}
                  {cat.predicted.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Add more transactions to see spending forecasts
          </p>
        </div>
      )}
    </div>
  );
}

export default SpendingForecast;
