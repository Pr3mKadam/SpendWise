import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BalanceDataPoint } from '../types';

interface BalanceChartProps {
  data: BalanceDataPoint[];
  currency?: string;
}

export default function BalanceChart({ data, currency = '$' }: BalanceChartProps) {
  // Find the split point between actual and projected
  const splitIndex = useMemo(() => {
    const idx = data.findIndex(d => d.projected);
    return idx >= 0 ? idx : data.length;
  }, [data]);

  // Build chart data with separate series + bridge point
  const chartData = useMemo(() => {
    return data.map((d, i) => {
      const isProjected = !!d.projected;
      const isBridge = i === splitIndex; // first projected point
      const isBridgeActual = i === splitIndex - 1; // last actual point

      return {
        date: d.date, // already formatted as "Jan 5" from useFinanceState
        balance: d.balance,
        isProjected,
        // Actual series: show for non-projected + bridge on last actual
        actualBalance: !isProjected ? d.balance : undefined,
        // Projected series: show for projected + bridge from last actual
        projectedBalance: isProjected || isBridgeActual ? d.balance : undefined,
        // Bridge logic: first projected point also gets actual value for connection
        ...(isBridge ? { actualBalance: undefined } : {}),
      };
    });
  }, [data, splitIndex]);

  // Y-axis domain with padding
  const { min, max } = useMemo(() => {
    if (!data.length) return { min: 0, max: 1000 };
    const balances = data.map(d => d.balance);
    const minVal = Math.min(...balances);
    const maxVal = Math.max(...balances);
    const padding = (maxVal - minVal) * 0.25;
    return {
      min: Math.max(0, Math.floor((minVal - padding) / 100) * 100),
      max: Math.ceil((maxVal + padding) / 100) * 100,
    };
  }, [data]);

  // "Today" label for reference line
  const todayLabel = splitIndex > 0 && splitIndex < data.length
    ? data[splitIndex - 1]?.date
    : undefined;

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 h-[340px] flex items-center justify-center">
        <p className="text-sm text-slate-500">No balance data yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white">Balance Trend</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">14-day history + 14-day forecast</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-slate-500 font-medium">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-5 rounded-full bg-rose-500 opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #0d131f 2px, #0d131f 4px)' }} />
            <span className="text-[10px] text-slate-500 font-medium">Projected</span>
          </div>
        </div>
      </div>

      <div className="h-[260px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#475569' }}
              minTickGap={40}
              dy={10}
            />
            <YAxis
              domain={[min, max]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#475569' }}
              tickFormatter={(val) => `${currency}${(val / 1000).toFixed(1)}k`}
              dx={-5}
            />

            {/* Today reference line */}
            {todayLabel && (
              <ReferenceLine
                x={todayLabel}
                stroke="rgba(100,116,139,0.3)"
                strokeDasharray="4 4"
                label={{
                  value: 'Today',
                  position: 'top',
                  fill: '#64748b',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0]?.payload;
                const isProjected = point?.isProjected;
                const value = point?.balance;
                return (
                  <div className="bg-[#151a23] border border-white/10 rounded-xl p-3 shadow-2xl">
                    <p className="text-[10px] text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">{label}</p>
                    <p className={`text-lg font-bold tabular-nums ${isProjected ? 'text-rose-400' : 'text-blue-400'}`}>
                      {currency}{Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${isProjected ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      <span className="text-[10px] font-medium text-slate-400">
                        {isProjected ? 'Forecast' : 'Actual balance'}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Actual Balance Area */}
            <Area
              type="monotone"
              dataKey="actualBalance"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradActual)"
              connectNulls
              activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0d131f', strokeWidth: 3 }}
            />

            {/* Projected Balance Area */}
            <Area
              type="monotone"
              dataKey="projectedBalance"
              stroke="#f43f5e"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              fillOpacity={1}
              fill="url(#gradProjected)"
              connectNulls
              activeDot={{ r: 5, fill: '#f43f5e', stroke: '#0d131f', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
