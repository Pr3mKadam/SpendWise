import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Activity } from 'lucide-react';

export function CashFlowWaterfall({
  totalIncome,
  totalExpenses,
  currency = '$',
}: {
  totalIncome: number;
  totalExpenses: number;
  currency?: string;
}) {
  const data = [
    { name: 'Income', value: totalIncome, fill: 'var(--teal)' },
    { name: 'Expenses', value: -totalExpenses, fill: 'var(--red)' },
    {
      name: 'Net Savings',
      value: totalIncome - totalExpenses,
      fill: totalIncome - totalExpenses >= 0 ? '#3b82f6' : 'var(--red)',
    },
  ];

  if (totalIncome === 0 && totalExpenses === 0) return null;

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Activity size={18} className="text-purple-500" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-manrope font-bold text-base text-[var(--text-primary)]">
            Cash Flow Waterfall
          </h3>
          <p className="truncate hidden sm:block font-inter text-xs text-[var(--text-muted)]">
            Visualizing where your money went this month
          </p>
        </div>
      </div>

      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${currency}${Math.abs(v / 1000).toFixed(1)}k`}
              tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="card px-4 py-3 shadow-lg">
                    <p className="font-inter text-xs text-[var(--text-muted)] font-semibold mb-2">
                      {p.name}
                    </p>
                    <p className="font-manrope font-bold text-[var(--text-primary)] text-sm">
                      {p.value < 0 ? '-' : ''}
                      {currency}
                      {Math.abs(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
