import { useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Card from '@/components/ui/Card';
import ChartTooltip from '@/features/dashboard/components/ChartTooltip';

const TEXT_PRIMARY = '#0f1117';
const TEXT_MUTED = '#9197a6';

const AXIS_TICK = { fontSize: 11, fill: '#9197a6' };

interface FinanceChartProps {
  chartData: Array<{
    month: string;
    Income: number;
    Expenses: number;
  }>;
  currency: string;
}

export default function FinanceChart({ chartData, currency }: FinanceChartProps) {
  const tickFormatter = useCallback(
    (v: number) => `${currency}${(v / 1000).toFixed(0)}k`,
    [currency]
  );

  const tooltipContent = useMemo(() => <ChartTooltip currency={currency} />, [currency]);
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              fontFamily: 'var(--font-manrope)',
            }}
          >
            Finances
          </p>
          <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>
            Income vs Expenses over last 6 months
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Income', color: '#6366f1' },
            { label: 'Expenses', color: '#f87171' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div
          style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <p style={{ fontSize: 12, color: TEXT_MUTED }}>
            Add transactions across months to see trends
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickFormatter={tickFormatter}
            />
            <Tooltip content={tooltipContent} />
            <Area
              type="monotone"
              dataKey="Income"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#incGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1' }}
            />
            <Area
              type="monotone"
              dataKey="Expenses"
              stroke="#f87171"
              strokeWidth={2.5}
              fill="url(#expGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#f87171' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
