import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts';
import { BalanceDataPoint } from '@/types';
import { useStore } from '@/store';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface BalanceChartProps {
  data: BalanceDataPoint[];
  currency?: string;
}

export default function BalanceChart({ data, currency = '$' }: BalanceChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const splitIndex = useMemo(() => {
    const idx = data.findIndex(d => d.projected);
    return idx >= 0 ? idx : data.length;
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((d, i) => {
      const isProjected = !!d.projected;
      const isBridgeActual = i === splitIndex - 1;
      const isBridge = i === splitIndex;
      return {
        date: d.date,
        balance: d.balance,
        isProjected,
        actualBalance: !isProjected ? d.balance : undefined,
        projectedBalance: isProjected || isBridgeActual ? d.balance : undefined,
        ...(isBridge ? { actualBalance: undefined } : {}),
      };
    });
  }, [data, splitIndex]);

  const todayLabel = splitIndex > 0 && splitIndex < data.length ? data[splitIndex - 1]?.date : undefined;

  const store = useStore();
  const settings = store.parentalState;
  const isKidMode = settings.isTeenMode;
  const shouldHideBalances = isKidMode && settings.hideBalances;

  const screenReaderSummary = useMemo(() => {
    if (data.length === 0) return 'No data available';
    if (shouldHideBalances) {
      return 'Balance data is obscured under Parental Teen Mode privacy rules.';
    }
    const initialBalance = data[0]?.balance ?? 0;
    const currentBalance = splitIndex > 0 ? (data[splitIndex - 1]?.balance ?? 0) : 0;
    const finalProjected = data[data.length - 1]?.balance ?? 0;
    return `Balance history and projection chart. Initial balance on ${data[0]?.date} is ${currency}${initialBalance.toLocaleString()}. Current actual balance as of today is ${currency}${currentBalance.toLocaleString()}. Projected final balance at end of projection cycle is ${currency}${finalProjected.toLocaleString()}.`;
  }, [data, splitIndex, shouldHideBalances, currency]);

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-[300px]" role="region" aria-label="Weekly Comparison">
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>No balance data yet</p>
      </div>
    );
  }

  return (
    <div className="card px-6 py-5" role="region" aria-label="Weekly Comparison Balance Chart Card">
      {/* Visually hidden screen reader summary */}
      <div 
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0'
        }}
      >
        Balance summary: {screenReaderSummary}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-headline">Weekly Comparison</h2>
          <p className="text-caption mt-1">14-day history + 14-day AI projection</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--teal)' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#cbd5e0' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>Projected</span>
          </div>
        </div>
      </div>

      <div 
        role="img" 
        aria-label="Weekly balance comparison line chart showing actual and projected trends"
        style={{
          height: 260,
          filter: shouldHideBalances ? 'blur(8px)' : 'none',
          opacity: shouldHideBalances ? 0.7 : 1,
          transition: 'filter 0.3s'
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="20%" stopColor="#14b8a6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="20%" stopColor="#94a3b8" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#f0f2f5" vertical={false} />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#a0aec0', fontFamily: 'var(--font-inter)' }}
              dy={10}
              minTickGap={40}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#a0aec0', fontFamily: 'var(--font-inter)' }}
              tickFormatter={v => `${currency}${(v / 1000).toFixed(1)}k`}
              width={52}
            />

            {todayLabel && (
              <ReferenceLine
                x={todayLabel}
                stroke="#cbd5e0"
                strokeDasharray="4 4"
                label={{ value: 'TODAY', position: 'top', fill: '#a0aec0', fontSize: 10, fontFamily: 'var(--font-inter)', fontWeight: 600, letterSpacing: '0.08em' }}
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0]?.payload;
                const isProj = point?.isProjected;
                const value = point?.balance;
                return (
                  <div className="card px-4 py-3 shadow-lg">
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 800, color: isProj ? 'var(--text-muted)' : 'var(--teal)' }}>
                      {currency}{Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {isProj ? 'AI Projected' : 'Actual Balance'}
                    </p>
                  </div>
                );
              }}
            />

            <Area type="monotone" dataKey="actualBalance" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradActual)" connectNulls activeDot={{ r: 5, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={!prefersReducedMotion} />
            <Area type="monotone" dataKey="projectedBalance" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" fillOpacity={1} fill="url(#gradProjected)" connectNulls activeDot={{ r: 5, fill: '#94a3b8', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={!prefersReducedMotion} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
