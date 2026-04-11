import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySpend } from '../types';

interface SpendingDonutProps {
  data: CategorySpend[];
  totalSpent: number;
}

const COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#64748b'];

export default function SpendingDonut({ data, totalSpent }: SpendingDonutProps) {
  const chartData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      fill: d.color || COLORS[i % COLORS.length]
    })).filter(d => d.value > 0);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6 h-[380px] flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#1c2230] border border-white/5 flex items-center justify-center mb-4">
          <span className="text-2xl opacity-40">🍩</span>
        </div>
        <p className="text-sm font-medium text-slate-400">No expenses yet</p>
        <p className="text-xs text-slate-600 mt-1">Add transactions to see the breakdown</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col h-[380px]">
      <h3 className="text-base font-bold text-white mb-0.5">Spending Breakdown</h3>
      <p className="text-[11px] text-slate-500 mb-5">By category this period</p>

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const pct = totalSpent > 0 ? ((d.value / totalSpent) * 100).toFixed(1) : '0';
                return (
                  <div className="bg-[#151a23] border border-white/10 rounded-xl p-3 shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      <p className="text-xs font-semibold text-white">{d.name}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-200 tabular-nums">
                      ${d.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{pct}% of total spending</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Total</p>
          <p className="text-xl font-bold text-white mt-0.5 tabular-nums">
            ${totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Legend — shows ALL categories */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {chartData.map((d) => {
          const pct = totalSpent > 0 ? Math.round((d.value / totalSpent) * 100) : 0;
          return (
            <div key={d.name} className="flex items-center gap-2 px-1.5 py-0.5 rounded-lg hover:bg-slate-800/30 transition-colors">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
              <span className="text-[10px] text-slate-400 truncate flex-1">{d.name}</span>
              <span className="text-[10px] font-semibold text-white tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
