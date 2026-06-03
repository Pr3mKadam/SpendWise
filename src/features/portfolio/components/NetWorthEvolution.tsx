import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Transaction } from '@/types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface NetWorthEvolutionProps {
  transactions: Transaction[];
  currency: string;
}

export default function NetWorthEvolution({ transactions, currency }: NetWorthEvolutionProps) {
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Sort transactions by date
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const data: { date: string; balance: number }[] = [];
    let runningBalance = 0;

    // Group by date to show balance at end of each day
    const dailyBalances: Record<string, number> = {};

    sorted.forEach(t => {
      const amt = t.type === 'credit' ? t.amount : -t.amount;
      runningBalance += amt;
      dailyBalances[t.date] = runningBalance;
    });

    return Object.entries(dailyBalances)
      .map(([date, balance]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(balance * 100) / 100,
        rawDate: date,
      }))
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
  }, [transactions]);

  const currentNetWorth = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;
  const initialNetWorth = chartData.length > 0 ? chartData[0].balance : 0;
  const peakWorth = chartData.length > 0 ? Math.max(...chartData.map(d => d.balance)) : 0;
  const netChange = currentNetWorth - initialNetWorth;
  // Only show percentage when initial is meaningful (abs > 10); cap at ±999%
  const absInitial = Math.abs(initialNetWorth);
  const percentChange =
    absInitial >= 10 ? Math.max(-999, Math.min(999, (netChange / absInitial) * 100)) : null; // null = not meaningful enough to show

  return (
    <div className="card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-manrope font-bold text-xl text-[var(--text-primary)] flex items-center gap-2">
            <Wallet className="text-[var(--teal)]" size={22} />
            Net Worth Evolution
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Track your total wealth growth over time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Current Balance
            </p>
            <p className="text-2xl font-black text-[var(--text-primary)]">
              {currency}
              {currentNetWorth.toLocaleString()}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[length:var(--fs-overline)] font-bold flex items-center gap-1 ${
              percentChange === null
                ? 'bg-[var(--surface-input)] text-[var(--text-muted)]'
                : netChange >= 0
                  ? 'bg-[var(--green-dim)] text-[var(--green)]'
                  : 'bg-red-500/10 text-red-500'
            }`}
          >
            {percentChange === null ? (
              <span>— %</span>
            ) : (
              <>
                {netChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {netChange >= 0 ? '+' : ''}
                {percentChange.toFixed(1)}%
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickFormatter={v =>
                `${currency}${Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`
              }
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-card)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}
              itemStyle={{ fontSize: '12px', fontFamily: 'var(--font-inter)' }}
              formatter={(value: any) => [
                `${currency}${Number(value).toLocaleString()}`,
                'Net Worth',
              ]}
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--teal)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#netWorthGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border)]">
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Initial
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {currency}
            {initialNetWorth.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Total Change
          </p>
          <p
            className={`text-sm font-bold ${netChange >= 0 ? 'text-[var(--green)]' : 'text-red-500'}`}
          >
            {netChange >= 0 ? '+' : ''}
            {currency}
            {netChange.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Peak Worth
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {currency}
            {peakWorth.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Data Points
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">{chartData.length} Days</p>
        </div>
      </div>
    </div>
  );
}
