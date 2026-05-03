import { useMemo } from 'react';
import { AppView, Transaction } from '../../types';
import { useFinanceState } from '../../hooks/useFinanceState';
import { useGamification } from '../../hooks/useGamification';
import { useGoals } from '../../hooks/useGoals';
import QuickAddPanel from '../features/dashboard/QuickAddPanel';
import MagicInput from '../features/ai/MagicInput';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, Target } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const palette = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-black/[0.04] ${className}`}
      style={{
        padding: 'var(--card-padding, 20px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ label, value, icon, iconBg, trend }: StatCardProps) {
  return (
    <Card className="px-3 py-3 sm:px-5 sm:py-4 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <div className="shrink-0">
          {trend === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
          {trend === 'down' && <TrendingDown size={14} className="text-red-400" />}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-lg sm:text-2xl font-extrabold truncate" style={{ color: '#0f1117', letterSpacing: '-0.02em', fontFamily: 'var(--font-manrope)' }}>
          {value}
        </p>
        <p className="text-[10px] sm:text-xs font-semibold truncate uppercase tracking-wider" style={{ color: '#9197a6', marginTop: 2 }}>{label}</p>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Chart Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1d23', color: '#fff', borderRadius: 10, padding: '10px 14px',
      fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, opacity: 0.6, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {currency}{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardView({
  financeState,
  onAdd,
  currency,
  onNavigate,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onAdd: Parameters<typeof MagicInput>[0]['onAdd'];
  currency: string;
  onNavigate: (view: AppView) => void;
}) {
  const { transactions, currentBalance, monthlyStats, monthlyHistory, dailySpendRate, balanceTrend } = financeState;
  const { streak } = useGamification(transactions);
  const { goals } = useGoals();

  // Chart data — last 6 months
  const chartData = useMemo(() => {
    return monthlyHistory.slice(-6).map(m => ({
      month: m.month.length === 7
        ? new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' })
        : m.month,
      Income: Math.round(m.income),
      Expenses: Math.round(m.expenses),
    }));
  }, [monthlyHistory]);

  // Recent unique merchants for "Quick Access" row
  const recentMerchants = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const tx of transactions) {
      if (!seen.has(tx.merchant)) { seen.add(tx.merchant); result.push(tx.merchant); }
      if (result.length >= 4) break;
    }
    return result;
  }, [transactions]);

  const recentTx = transactions.slice(0, 6);

  const saved = Math.max(0, monthlyStats.totalIncome - monthlyStats.totalExpenses);

  // Trend % from balanceTrend array
  const trendPct = useMemo(() => {
    if (!balanceTrend || balanceTrend.length < 2) return 0;
    const first = balanceTrend[0].balance;
    const last = balanceTrend[balanceTrend.length - 1].balance;
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }, [balanceTrend]);

  const PAGE_BG = '#f4f6fb';
  const TEXT_PRIMARY = '#0f1117';
  const TEXT_MUTED = '#9197a6';

  return (
    <div className="bg-[#f4f6fb] -mx-4 -mt-6 sm:-mx-8 sm:-my-6 min-h-[calc(100vh-60px)] px-4 py-6 sm:px-8 sm:py-7">
      <div className="max-w-[1200px] mx-auto">

        {/* Page Title */}
        <h1 className="text-[22px] font-extrabold mb-6" style={{ color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>

        {/* Two-column layout (stacks on mobile and most tablets) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* Stat Cards (2x2 on small, 4x1 on desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Balance"
                value={`${currency}${Math.abs(currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={<Wallet size={16} className="sm:w-[18px] sm:h-[18px] text-[#6366f1]" />}
                iconBg="rgba(99,102,241,0.1)"
                trend={trendPct >= 0 ? 'up' : 'down'}
              />
              <StatCard
                label="Income"
                value={`${currency}${monthlyStats.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={<TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-[#10b981]" />}
                iconBg="rgba(16,185,129,0.1)"
                trend="up"
              />
              <StatCard
                label="Expenses"
                value={`${currency}${monthlyStats.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={<TrendingDown size={16} className="sm:w-[18px] sm:h-[18px] text-[#f87171]" />}
                iconBg="rgba(248,113,113,0.1)"
                trend="down"
              />
              <StatCard
                label="Savings"
                value={`${currency}${saved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={<PiggyBank size={16} className="sm:w-[18px] sm:h-[18px] text-[#f59e0b]" />}
                iconBg="rgba(245,158,11,0.1)"
                trend={saved > 0 ? 'up' : 'neutral'}
              />
            </div>

            {/* Finance Chart */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>Finances</p>
                  <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>Income vs Expenses over last 6 months</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ label: 'Income', color: '#6366f1' }, { label: 'Expenses', color: '#f87171' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                      <span style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 500 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {chartData.length < 2 ? (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 12, color: TEXT_MUTED }}>Add transactions across months to see trends</p>
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
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9197a6' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9197a6' }} axisLine={false} tickLine={false} tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip currency={currency} />} />
                    <Area type="monotone" dataKey="Income" stroke="#6366f1" strokeWidth={2.5} fill="url(#incGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
                    <Area type="monotone" dataKey="Expenses" stroke="#f87171" strokeWidth={2.5} fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: '#f87171' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* ── Quick Add — between chart and history ─────────── */}
            <Card style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: recentMerchants.length > 0 ? 14 : 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>Add Transaction</p>
              </div>

              {/* Recent merchants as avatar row */}
              {recentMerchants.length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  {recentMerchants.map(m => (
                    <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: avatarColor(m),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'transform 0.15s',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials(m)}</span>
                      </div>
                      <span style={{ fontSize: 9, color: TEXT_MUTED, maxWidth: 44, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {m.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <QuickAddPanel onAdd={onAdd} />
            </Card>

            {/* Transaction History */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3">
                <p style={{ fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>Transaction History</p>
                <button
                  onClick={() => onNavigate('history')}
                  style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  View all →
                </button>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_auto] sm:grid-cols-[2fr_1fr_1fr_1fr] px-4 sm:px-5 pb-2 gap-2 sm:gap-3">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: TEXT_MUTED }}>Name</span>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: TEXT_MUTED }}>Type</span>
                <span className="hidden sm:block text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: TEXT_MUTED }}>Date</span>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-right sm:text-left" style={{ color: TEXT_MUTED }}>Amount</span>
              </div>

              {recentTx.length === 0 ? (
                <p style={{ fontSize: 13, color: TEXT_MUTED, padding: '16px 20px 20px', textAlign: 'center' }}>
                  No transactions yet. Add one using the panel →
                </p>
              ) : (
                recentTx.map((tx: Transaction, i) => {
                  const bg = avatarColor(tx.merchant);
                  const isLast = i === recentTx.length - 1;
                  return (
                    <div key={tx.id} 
                      className="grid grid-cols-[2fr_1fr_auto] sm:grid-cols-[2fr_1fr_1fr_1fr] px-4 sm:px-5 py-2.5 sm:py-3 gap-2 sm:gap-3 items-center transition-colors hover:bg-[#f8f9fc]"
                      style={{
                        borderTop: '1px solid rgba(0,0,0,0.04)',
                        borderBottom: isLast ? 'none' : undefined,
                      }}
                    >
                      {/* Name + avatar */}
                      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center" style={{ background: bg }}>
                          <span className="text-[11px] font-bold text-white">{initials(tx.merchant)}</span>
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="text-[13px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{tx.merchant}</span>
                          <span className="sm:hidden text-[10px]" style={{ color: TEXT_MUTED }}>
                            {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      {/* Type badge */}
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                        background: tx.type === 'credit' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                        color: tx.type === 'credit' ? '#059669' : '#dc2626',
                        width: 'fit-content',
                        textTransform: 'capitalize',
                      }}>
                        {tx.category}
                      </span>
                      {/* Date (Desktop) */}
                      <span className="hidden sm:block text-[12px]" style={{ color: TEXT_MUTED }}>
                        {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      {/* Amount */}
                      <span className="text-[13px] font-bold text-right sm:text-left whitespace-nowrap" style={{ color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                        {tx.type === 'credit' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })
              )}
            </Card>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* My Card */}
            <div style={{
              borderRadius: 20,
              padding: '24px 22px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(99,102,241,0.35)',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -20, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div>
                  <p style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Total Balance</p>
                  <p style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-manrope)', letterSpacing: '-0.02em' }}>
                    {currency}{Math.abs(currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  VISA
                </div>
              </div>

              <div style={{ marginTop: 28, position: 'relative' }}>
                <p style={{ fontSize: 13, letterSpacing: '0.22em', opacity: 0.7, fontFamily: 'monospace' }}>•••• •••• •••• 4532</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, opacity: 0.7 }}>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Card Holder</p>
                    <p style={{ fontSize: 11, fontWeight: 600 }}>SpendWise User</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Expires</p>
                    <p style={{ fontSize: 11, fontWeight: 600 }}>12/28</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Goals */}
            <Card style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>My Goals</p>
                <button
                  onClick={() => {
                    onNavigate('goals');
                    setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-goal')), 150);
                  }}
                  style={{
                    width: 26, height: 26, borderRadius: 8, background: 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <Plus size={14} color="#6366f1" />
                </button>
              </div>

              {goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Target size={28} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: TEXT_MUTED }}>No goals yet</p>
                  <button
                    onClick={() => {
                      onNavigate('goals');
                      setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-goal')), 150);
                    }}
                    style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
                  >
                    + Add your first goal
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {goals.slice(0, 3).map(g => {
                    const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
                    return (
                      <div key={g.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{g.emoji}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY }}>{g.name}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: g.color || '#6366f1' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: '#f1f3f9', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: g.color || '#6366f1', borderRadius: 99, transition: 'width 0.4s ease' }} />
                        </div>
                        <p style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 4 }}>
                          {currency}{g.savedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / {currency}{g.targetAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    );
                  })}
                  {goals.length > 3 && (
                    <button
                      onClick={() => onNavigate('goals')}
                      style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                      +{goals.length - 3} more goals →
                    </button>
                  )}
                </div>
              )}
            </Card>

            {/* Daily Stats */}
            <Card style={{ padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 12, fontFamily: 'var(--font-manrope)' }}>Today's Stats</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Daily burn rate', value: `${currency}${dailySpendRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#f87171' },
                  { label: 'Logging streak', value: `${streak} days`, color: '#fbbf24' },
                  { label: 'Transactions', value: String(transactions.length), color: '#6366f1' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: TEXT_MUTED }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
