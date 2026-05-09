import { useMemo, useState, useEffect, useRef, memo } from 'react';
import { AppView, Transaction } from '../../types';
import { useFinanceState } from '../../hooks/useFinanceState';
import { useGamification } from '../../hooks/useGamification';
import { useGoals } from '../../hooks/useGoals';
import { usePortfolio } from '../../hooks/usePortfolio';
import LevelProgress from '../features/gamification/LevelProgress';
import WealthCity from '../features/gamification/WealthCity';
import { QuestsPanel } from '../features/gamification/QuestsPanel';
import { SavingsChallenges } from '../features/gamification/SavingsChallenges';
import DashboardHero from '../features/dashboard/DashboardHero';
import QuickAddPanel from '../features/dashboard/QuickAddPanel';
import MagicInput from '../features/ai/MagicInput';

import { useCategories } from '../../hooks/useCategories';
import { Camera, Sparkles, TrendingUp, TrendingDown, Wallet, Calendar, Plus, BrainCircuit, Target, Zap, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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

const Card = memo(function Card({ children, className = "", style = {}, glass = false }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; glass?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${glass ? 'glass-card' : 'bg-white rounded-2xl shadow-sm border border-black/[0.04]'} ${className}`}
      style={{
        padding: 'var(--card-padding, 16px)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
});

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  hideBalances?: boolean;
}

const StatCard = memo(function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend, hideBalances }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="flex flex-col justify-between h-full group" style={{ padding: '12px 14px' }}>
        <div className="flex items-start justify-between mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: iconBg }}>
            <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${iconColor}`} />
          </div>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
            trend === 'down' ? 'bg-red-500/10 text-red-500' : 
            'bg-slate-500/10 text-slate-500'
          }`}>
            {trend === 'up' && <TrendingUp size={10} />}
            {trend === 'down' && <TrendingDown size={10} />}
            {trend === 'up' ? 'Increase' : trend === 'down' ? 'Decrease' : 'Stable'}
          </div>
        </div>
        <div className="min-w-0">
          <p className={`text-[18px] sm:text-2xl font-black truncate tabular-nums transition-all ${hideBalances ? 'blur-md select-none' : ''}`} style={{ color: '#0f1117', letterSpacing: '-0.03em', fontFamily: 'var(--font-manrope)' }}>
            {value}
          </p>
          <p className="text-[10px] font-bold truncate uppercase tracking-widest text-[#9197a6] mt-0.5">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Custom Chart Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !bg-[#1a1d23]/90 !backdrop-blur-xl border-white/10 shadow-2xl p-4 min-w-[140px]">
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[11px] font-bold text-white/80">{p.name}</span>
          </div>
          <span className="text-[11px] font-black text-white tabular-nums">
            {currency}{Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_BG = '#f4f6fb';
const TEXT_PRIMARY = '#0f1117';
const TEXT_MUTED = '#9197a6';

export function DashboardView({
  financeState,
  onAdd,
  onOpenAdd,
  currency,
  onNavigate,
  hideBalances = false,
  onTogglePrivacy,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onAdd: Parameters<typeof MagicInput>[0]['onAdd'];
  onOpenAdd: () => void;
  currency: string;
  onNavigate: (view: AppView) => void;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}) {
  const { transactions, currentBalance, monthlyStats, monthlyHistory, dailySpendRate, balanceTrend, predictedEndOfMonth } = financeState;
  const { streak, healthScore, xp, level, xpToNextLevel, progress, levelName } = useGamification(transactions);
  const { goals } = useGoals();
  const { netWorth } = usePortfolio();
  const [dashboardInput, setDashboardInput] = useState('');

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

  const recentTx = useMemo(() => transactions.slice(0, 6), [transactions]);

  const saved = useMemo(() => Math.max(0, monthlyStats.totalIncome - monthlyStats.totalExpenses), [monthlyStats.totalIncome, monthlyStats.totalExpenses]);

  // Trend % from balanceTrend array
  const trendPct = useMemo(() => {
    if (!balanceTrend || balanceTrend.length < 2) return 0;
    const first = balanceTrend[0].balance;
    const last = balanceTrend[balanceTrend.length - 1].balance;
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }, [balanceTrend]);

  return (
    <div className="bg-[#f4f6fb] -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 min-h-[calc(100vh-60px)] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.04em' }}>
              Dashboard
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">Welcome back to your financial control center.</p>
          </div>

        </div>

        {/* Premium Dashboard Hero Section */}
        <div className="mb-6">
          <DashboardHero 
            currentBalance={currentBalance}
            monthlyStats={monthlyStats}
            balanceTrend={balanceTrend}
            healthScore={healthScore}
            currency={currency}
            hideBalances={hideBalances}
            onTogglePrivacy={onTogglePrivacy}
            predictedEndOfMonth={predictedEndOfMonth}
          />
        </div>

        {streak > 0 && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">🔥 {streak} DAY STREAK</span>
          </div>
        )}


        {/* Two-column layout (stacks on mobile and most tablets) */}
        <div className="flex flex-col xl:flex-row gap-5 xl:gap-6 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 min-w-0 w-full xl:flex-1">
            {/* Gamification Level Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <WealthCity />
              </div>
              <div className="lg:col-span-5">
                <LevelProgress onNavigate={onNavigate} />
              </div>
            </div>

            {/* Stat Cards (2x2 on mobile, 3x1 on tablet, 5x1 on xl desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
              <StatCard
                label="Balance"
                value={`${currency}${Math.abs(currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={Wallet}
                iconColor="text-[#6366f1]"
                iconBg="rgba(99,102,241,0.1)"
                trend={trendPct >= 0 ? 'up' : 'down'}
                hideBalances={hideBalances}
              />
              <StatCard
                label="Income"
                value={`${currency}${monthlyStats.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={TrendingUp}
                iconColor="text-[#10b981]"
                iconBg="rgba(16,185,129,0.1)"
                trend="up"
                hideBalances={hideBalances}
              />
              <StatCard
                label="Expenses"
                value={`${currency}${monthlyStats.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={TrendingDown}
                iconColor="text-[#f87171]"
                iconBg="rgba(248,113,113,0.1)"
                trend="down"
                hideBalances={hideBalances}
              />
              <StatCard
                label="Net Worth"
                value={`${currency}${Math.abs(netWorth).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={Target}
                iconColor="text-[#8b5cf6]"
                iconBg="rgba(139,92,246,0.1)"
                trend={netWorth >= 0 ? 'up' : 'down'}
                hideBalances={hideBalances}
              />
              <div className="col-span-2 sm:col-span-1">
                <StatCard
                  label="Health Score"
                  value={`${healthScore}/100`}
                  icon={Sparkles}
                  iconColor="text-[#14b8a6]"
                  iconBg="rgba(20,184,166,0.1)"
                  trend={healthScore > 70 ? 'up' : 'neutral'}
                  hideBalances={false}
                />
              </div>
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
            <div className="w-full">
              <QuickAddPanel 
                onAdd={onAdd} 
                recentMerchants={recentMerchants}
                onQuickInput={(val) => setDashboardInput(val)}
                dashboardInput={dashboardInput}
                setDashboardInput={setDashboardInput}
                transactions={transactions}
              />
            </div>



            {/* Transaction History */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex items-center justify-between px-3 sm:px-5 pt-4 pb-3">
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>Transaction History</p>
                <button
                  onClick={() => onNavigate('history')}
                  aria-label="View all transactions"
                  style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
                >
                  View all →
                </button>
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
                      className={`${i >= 3 ? 'hidden sm:flex' : 'flex'} items-center px-3 sm:px-5 py-2.5 gap-2 sm:gap-3 transition-colors hover:bg-[#f8f9fc]`}
                      style={{
                        borderTop: '1px solid rgba(0,0,0,0.04)',
                        borderBottom: isLast ? 'none' : undefined,
                      }}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center" style={{ background: bg }}>
                        <span className="text-[11px] font-bold text-white">{initials(tx.merchant)}</span>
                      </div>
                      {/* Name + date (mobile) */}
                      <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                        <span className="text-[13px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{tx.merchant}</span>
                        <span className="text-[10px]" style={{ color: TEXT_MUTED }}>
                          {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                      {/* Category badge - hidden on tiny screens */}
                      <span className="hidden sm:inline-block shrink-0" style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                        background: tx.type === 'credit' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                        color: tx.type === 'credit' ? '#059669' : '#dc2626',
                        textTransform: 'capitalize',
                      }}>
                        {tx.category}
                      </span>
                      {/* Amount */}
                      <span 
                        className={`text-[13px] font-black tabular-nums shrink-0 transition-all ${hideBalances ? 'blur-md select-none' : ''}`} 
                        style={{ color: tx.type === 'credit' ? '#10b981' : TEXT_PRIMARY }}
                      >
                        {tx.type === 'credit' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  );
                })
              )}
            </Card>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="flex flex-row xl:flex-col gap-4 min-w-0 w-full xl:w-[300px] xl:shrink-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mb-4">
            
            {/* Premium My Card */}
            <motion.div 
              whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
              className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center cursor-pointer" 
              style={{
                borderRadius: 24,
                padding: '28px 24px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(99,102,241,0.3)',
                perspective: '1000px'
              }}
            >
              {/* Decorative shimmer */}
              <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
              
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Vault Balance</p>
                    <p className="text-3xl font-black font-manrope letter-tight tracking-tighter">
                      {currency}{Math.abs(currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="glass-panel px-3 py-1.5 rounded-lg border-white/20">
                    <span className="text-[10px] font-black italic tracking-widest text-white/90">SPENDWISE</span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-4">
                    <p className="text-sm font-medium tracking-[0.25em] text-white/80 font-mono">•••• •••• •••• 8842</p>
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Premium Member</p>
                      <p className="text-xs font-bold uppercase tracking-wider">SpendWise Pro</p>
                    </div>
                  </div>
                  <div className="w-12 h-8 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-red-500/80" />
                      <div className="w-5 h-5 rounded-full bg-yellow-500/80" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* My Goals */}
            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <Card style={{ padding: 18, height: '100%' }}>
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
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {goals.slice(0, 2).map(g => {
                      const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
                      return (
                        <div key={g.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div className="flex items-center gap-2 truncate">
                              <span style={{ fontSize: 16 }}>{g.emoji}</span>
                              <span className="text-[12px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{g.name}</span>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: g.color || '#6366f1' }}>{pct}%</span>
                          </div>
                          <div style={{ height: 5, background: '#f1f3f9', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: g.color || '#6366f1', borderRadius: 99, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                    {goals.length > 2 && (
                      <button
                        onClick={() => onNavigate('goals')}
                        style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                      >
                        +{goals.length - 2} more goals →
                      </button>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* AI-Driven Gamification */}
            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <QuestsPanel transactions={transactions} />
            </div>

            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <SavingsChallenges />
            </div>

            {/* Daily Stats */}
            <div className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center">
              <Card style={{ padding: 16, height: '100%' }}>
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
    </div>
  );
}
