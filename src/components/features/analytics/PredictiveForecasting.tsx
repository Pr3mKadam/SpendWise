import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Transaction } from '../../../types';

interface PredictiveForecastingProps {
  transactions: Transaction[];
  currency: string;
  currentBalance: number;
}

function ForecastTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const isFuture = payload[0]?.payload?.future;
  return (
    <div className="card px-3 py-2 shadow-lg border border-[var(--border)]">
      <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-manrope font-bold text-sm" style={{ color: v >= 0 ? 'var(--teal)' : 'var(--red)' }}>
        {currency}{Math.round(v).toLocaleString('en-IN')}
      </p>
      {isFuture && <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5">Projected</p>}
    </div>
  );
}

export function PredictiveForecasting({ transactions, currency, currentBalance }: PredictiveForecastingProps) {
  const data = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();

    // Calculate daily spend rate from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const recentDebits = transactions.filter(t => t.type === 'debit' && t.date >= thirtyDaysAgo);
    const recentCredits = transactions.filter(t => t.type === 'credit' && t.date >= thirtyDaysAgo);
    const totalSpent30 = recentDebits.reduce((a, t) => a + t.amount, 0);
    const totalIncome30 = recentCredits.reduce((a, t) => a + t.amount, 0);

    const dailySpendRate = totalSpent30 / 30;
    const dailyIncomeRate = totalIncome30 / 30;
    const dailyNetRate = dailyIncomeRate - dailySpendRate;

    // Build chart points: actual (past) + projected (future)
    const points: { day: string; balance: number; future: boolean }[] = [];

    // Reconstruct past balance by replaying transactions day-by-day this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let d = 1; d <= dayOfMonth; d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTx = transactions.filter(t => t.date === dateStr);
      const dayNet = dayTx.reduce((a, t) => t.type === 'credit' ? a + t.amount : a - t.amount, 0);
      const bal = currentBalance + (dayOfMonth - d) * dailyNetRate * -1; // approximate
      points.push({ day: `${d}`, balance: Math.round(bal), future: false });
    }

    // Project remaining days
    const lastKnownBal = points[points.length - 1]?.balance ?? currentBalance;
    for (let d = dayOfMonth + 1; d <= daysInMonth; d++) {
      const projBal = lastKnownBal + (d - dayOfMonth) * dailyNetRate;
      points.push({ day: `${d}`, balance: Math.round(projBal), future: true });
    }

    const projectedEOM = points[points.length - 1]?.balance ?? currentBalance;
    const projectedChange = projectedEOM - currentBalance;
    const trend: 'up' | 'down' = projectedChange >= 0 ? 'up' : 'down';

    // Scenarios
    const optimistic = Math.round(projectedEOM + dailySpendRate * 5);
    const pessimistic = Math.round(projectedEOM - dailySpendRate * 5);

    return { points, projectedEOM, projectedChange, trend, dailySpendRate, dailyNetRate, optimistic, pessimistic, daysLeft: daysInMonth - dayOfMonth };
  }, [transactions, currentBalance]);

  const isPositive = data.projectedChange >= 0;

  return (
    <div className="card p-4 sm:p-6 overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--teal-dim)] flex items-center justify-center shrink-0">
            <Brain size={18} className="text-[var(--teal)]" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-base text-[var(--text-primary)]">Month-End Forecast</h3>
            <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] font-inter mt-0.5">AI-powered balance prediction · {data.daysLeft}d remaining</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[length:var(--fs-overline)] font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? 'Surplus' : 'Deficit'}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Projected Balance', value: `${currency}${Math.round(data.projectedEOM).toLocaleString('en-IN')}`, color: isPositive ? '#10b981' : '#ef4444' },
          { label: 'Daily Spend Rate', value: `${currency}${Math.round(data.dailySpendRate).toLocaleString('en-IN')}/day`, color: '#f59e0b' },
          { label: 'Net Daily Flow', value: `${data.dailyNetRate >= 0 ? '+' : ''}${currency}${Math.round(data.dailyNetRate).toLocaleString('en-IN')}`, color: data.dailyNetRate >= 0 ? '#10b981' : '#ef4444' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[var(--surface-input)] rounded-xl p-3 border border-[var(--border)]">
            <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-wider text-[var(--text-muted)]">{kpi.label}</p>
            <p className="font-manrope font-bold text-sm mt-1 tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.points}
            margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false} tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'var(--font-inter)' }}
              interval={4}
            />
            <YAxis
              axisLine={false} tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'var(--font-inter)' }}
              tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`}
              width={44}
            />
            <Tooltip content={<ForecastTooltip currency={currency} />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            {/* Solid line for historical */}
            <Area
              type="monotone"
              dataKey="balance"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2.5}
              fill="url(#forecastGrad)"
              dot={false}
              activeDot={{ r: 4, fill: isPositive ? '#10b981' : '#ef4444', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>


      {/* Scenarios */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: '🌟 Optimistic (spend 20% less)', value: data.optimistic, color: '#10b981' },
          { label: '⚠️ Pessimistic (spend 20% more)', value: data.pessimistic, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="bg-[var(--surface-input)] rounded-xl p-3 border border-[var(--border)]">
            <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1">{s.label}</p>
            <p className="font-manrope font-bold text-sm tabular-nums" style={{ color: s.color }}>
              {currency}{s.value.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {!isPositive && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200/90 font-inter leading-relaxed">
            At your current spending rate, you may end the month with a deficit. Consider reducing discretionary spending by {currency}{Math.round(Math.abs(data.dailyNetRate) * 5).toLocaleString('en-IN')}.
          </p>
        </motion.div>
      )}
    </div>
  );
}
