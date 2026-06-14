import { useCallback } from 'react';
import {
  LineChart,
  Line,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyHistoryPoint } from '@/types';
import { SavingsTooltip } from '@/features/analytics/components/AnalyticsPrimitives';

const AXIS_STYLE = { fontSize: 11, fill: '#a0aec0', fontFamily: 'var(--font-inter)' };

interface SavingsTrendChartProps {
  monthlyHistory: MonthlyHistoryPoint[];
  currency: string;
  latestMonth: MonthlyHistoryPoint | null;
}

export function SavingsTrendChart({
  monthlyHistory,
  currency,
  latestMonth,
}: SavingsTrendChartProps) {
  const tickFormatter = useCallback(
    (v: number) => `${currency}${v >= 0 ? '' : '-'}${Math.abs(v / 1000).toFixed(1)}k`,
    [currency]
  );

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Net Savings Trend
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}
          >
            Monthly surplus / deficit
          </p>
        </div>
        {latestMonth && (
          <div className="text-right shrink-0">
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              This Month
            </p>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '18px',
                fontWeight: 800,
                color: latestMonth.savings >= 0 ? 'var(--teal)' : 'var(--red)',
              }}
              className="tabular-nums"
            >
              {latestMonth.savings >= 0 ? '+' : ''}
              {currency}
              {latestMonth.savings.toLocaleString('en-US')}
            </p>
          </div>
        )}
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyHistory}>
            <CartesianGrid stroke="#f0f2f5" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_STYLE} dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={AXIS_STYLE}
              tickFormatter={tickFormatter}
              width={48}
            />
            <Tooltip content={<SavingsTooltip currency={currency} />} />
            <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={{ fill: '#14b8a6', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
