import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MonthlyHistoryPoint } from '@/types';
import { ChartTooltip } from '@/features/analytics/components/AnalyticsPrimitives';

interface IncomeExpensesChartProps {
  monthlyHistory: MonthlyHistoryPoint[];
  currency: string;
}

export function IncomeExpensesChart({ monthlyHistory, currency }: IncomeExpensesChartProps) {
  const axisStyle = { fontSize: 11, fill: '#a0aec0', fontFamily: 'var(--font-inter)' };

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Monthly Comparison
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}
          >
            6-month income vs expenses
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[
            ['#14b8a6', 'Income'],
            ['#e2e8f0', 'Expenses'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyHistory} barGap={4} barCategoryGap="30%">
            <CartesianGrid stroke="#f0f2f5" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisStyle}
              tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`}
              width={44}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: '#f8fafc' }} />
            <Legend
              formatter={value => (
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 500,
                  }}
                >
                  {value}
                </span>
              )}
              wrapperStyle={{ paddingTop: '16px' }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#e2e8f0"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
