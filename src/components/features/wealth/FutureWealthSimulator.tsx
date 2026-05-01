import { useState, useMemo } from 'react';
import { TrendingUp, PieChart, Landmark, ArrowRight, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface FutureWealthSimulatorProps {
  currentBalance: number;
  monthlySavings: number;
  currency?: string;
}

export default function FutureWealthSimulator({ 
  currentBalance, 
  monthlySavings, 
  currency = '$' 
}: FutureWealthSimulatorProps) {
  const [years, setYears] = useState(10);
  const [expectedROI, setExpectedROI] = useState(7); // 7% annual return
  const [initialInvestment, setInitialInvestment] = useState(currentBalance);
  const [monthlyContribution, setMonthlyContribution] = useState(monthlySavings);

  const data = useMemo(() => {
    const points = [];
    let balance = initialInvestment;
    const monthlyRate = expectedROI / 100 / 12;

    for (let m = 0; m <= years * 12; m++) {
      if (m % 12 === 0) {
        points.push({
          year: m / 12,
          balance: Math.round(balance),
          contributions: Math.round(initialInvestment + (monthlyContribution * m))
        });
      }
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
    }
    return points;
  }, [initialInvestment, monthlyContribution, expectedROI, years]);

  const finalBalance = data[data.length - 1].balance;
  const totalContributions = initialInvestment + (monthlyContribution * years * 12);
  const totalInterest = finalBalance - totalContributions;

  return (
    <div className="card p-6 space-y-8 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-manrope font-bold text-xl text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="text-[var(--teal)]" size={22} />
            Future Wealth Simulator
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Project your net worth growth over {years} years.</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--teal-dim)] text-[var(--teal)] text-[10px] font-bold uppercase tracking-wider">
          <Landmark size={12} /> Predictive Engine
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Time Horizon</label>
                <span className="text-xs font-bold text-[var(--teal)]">{years} Years</span>
              </div>
              <input 
                type="range" min="1" max="40" value={years} 
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full accent-[var(--teal)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Expected ROI (%)</label>
                <span className="text-xs font-bold text-[var(--green)]">{expectedROI}%</span>
              </div>
              <input 
                type="range" min="1" max="15" step="0.5" value={expectedROI} 
                onChange={(e) => setExpectedROI(parseFloat(e.target.value))}
                className="w-full accent-[var(--green)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase block mb-2">Initial Investment</label>
              <input 
                type="number" value={initialInvestment} 
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full font-inter text-sm px-4 py-3 rounded-xl bg-[var(--surface-input)] text-[var(--text-primary)] focus:outline-none border-2 border-transparent focus:border-[var(--teal)] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase block mb-2">Monthly Savings</label>
              <input 
                type="number" value={monthlyContribution} 
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full font-inter text-sm px-4 py-3 rounded-xl bg-[var(--surface-input)] text-[var(--text-primary)] focus:outline-none border-2 border-transparent focus:border-[var(--teal)] transition-all"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="p-4 rounded-xl bg-[var(--surface-input)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)]">Total Contributions</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{currency}{totalContributions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)]">Interest Earned</span>
              <span className="text-sm font-bold text-[var(--green)]">+{currency}{totalInterest.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center">
              <span className="text-xs font-bold text-[var(--text-primary)]">Final Wealth</span>
              <span className="text-lg font-black text-[var(--teal)]">{currency}{finalBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 h-[300px] sm:h-full min-h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickFormatter={(v) => `${currency}${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--surface-card)', 
                  border: '1.5px solid var(--border)', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ fontSize: '12px', fontFamily: 'var(--font-inter)' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="var(--teal)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                name="Projected Wealth"
              />
              <Line 
                type="monotone" 
                dataKey="contributions" 
                stroke="var(--text-muted)" 
                strokeDasharray="5 5" 
                dot={false}
                name="Principal Only"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="absolute bottom-4 right-4 flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-inter">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--teal)]" /> Projected Wealth
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] opacity-50" /> Principal Only
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mt-4">
        <Info size={14} className="text-blue-400 shrink-0" />
        <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
          This simulation uses the compound interest formula with monthly contributions. Actual market returns vary. Always consult with a human financial advisor before making large investment decisions.
        </p>
      </div>
    </div>
  );
}
