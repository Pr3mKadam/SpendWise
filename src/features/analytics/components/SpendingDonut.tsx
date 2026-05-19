import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySpend } from '@/types';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface SpendingDonutProps {
  data: CategorySpend[];
  totalSpent: number;
  currency?: string;
}

const PALETTE = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899', '#64748b'];

export default function SpendingDonut({ data, totalSpent, currency = '$' }: SpendingDonutProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const chartData = useMemo(() => {
    return data.map((d, i) => ({ ...d, fill: d.color || PALETTE[i % PALETTE.length] })).filter(d => d.value > 0);
  }, [data]);

  const screenReaderSummary = useMemo(() => {
    return chartData.map(d => {
      const pct = totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(1) : '0';
      return `${d.name}: ${currency}${d.value.toLocaleString()} (${pct}%)`;
    }).join(', ');
  }, [chartData, totalSpent, currency]);

  if (chartData.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center h-[360px] text-center" role="region" aria-label="Expenses Breakdown">
        <div className="text-3xl mb-3 opacity-40">🍩</div>
        <p className="text-title" style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
        <p className="text-caption mt-1">Add transactions to see breakdown</p>
      </div>
    );
  }

  return (
    <div className="card px-5 py-5 flex flex-col" role="region" aria-label="Expenses Breakdown Chart Card">
      <h3 className="text-headline mb-1">Expenses Breakdown</h3>
      <p className="text-caption mb-5">*Compare to last month</p>

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
        Expenses breakdown text summary: {screenReaderSummary || 'No data available'}
      </div>

      <div className="relative h-[240px] shrink-0 my-4" role="img" aria-label={`Spending breakdown pie chart. Total expenses: ${currency}${totalSpent.toLocaleString()}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
              isAnimationActive={!prefersReducedMotion}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct = totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(1) : '0';
                return (
                  <div className="card px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {currency}{d.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>{pct}% of total</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
 
        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-hidden="true">
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {currency}{totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Total</p>
        </div>
      </div>

      {/* Category list — Finebank style row list */}
      <div className="mt-5 space-y-2" role="list" aria-label="Expense categories breakdown list">
        {chartData.slice(0, 4).map((d) => {
          const pct = totalSpent > 0 ? Math.round((d.value / totalSpent) * 100) : 0;
          return (
            <div 
              key={d.name} 
              className="flex items-center gap-3 group cursor-pointer"
              role="listitem"
              aria-label={`${d.name}: ${currency}${d.value.toLocaleString()} representing ${pct}% of total spending`}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: `${d.fill}18` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {d.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currency}{d.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: d.fill }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
