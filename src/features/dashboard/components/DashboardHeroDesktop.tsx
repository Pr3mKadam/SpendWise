import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats, BalanceDataPoint } from '@/types';
import { haptic } from '@/core/haptic';

interface DashboardHeroProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  monthlyStats: MonthlyStats;
  balanceTrend: BalanceDataPoint[];
  healthScore: number;
  currency?: string;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: '#14b8a6' };
  if (score >= 60) return { label: 'Good', color: '#10b981' };
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Needs Work', color: '#ef4444' };
}

export default function DashboardHeroDesktop({
  currentBalance,
  monthlyStats,
  balanceTrend,
  healthScore,
  currency = '₹',
  hideBalances = false,
  onTogglePrivacy,
}: DashboardHeroProps) {
  const displayBalance = useCountUp(currentBalance, 800);
  const displayIncome = useCountUp(monthlyStats.totalIncome, 600);
  const displayExpenses = useCountUp(monthlyStats.totalExpenses, 600);

  const net = monthlyStats.totalIncome - monthlyStats.totalExpenses;
  const displayNet = useCountUp(Math.abs(net), 600);
  const isPositive = net >= 0;

  const { label: healthLabel, color: healthColor } = getHealthLabel(healthScore);

  const sparkData = useMemo(
    () => balanceTrend.map(p => ({ date: p.date, balance: p.balance })),
    [balanceTrend]
  );

  const isTrendUp =
    sparkData.length > 1 ? sparkData[sparkData.length - 1].balance >= sparkData[0].balance : true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => haptic.light()}
      className="relative w-full overflow-hidden rounded-3xl shadow-lg border border-white/10 dark:border-white/5 cursor-pointer hero-glow-dark"
      style={{ minHeight: '220px' }}
    >
      <div
        className="absolute inset-0 transition-all duration-700 ease-in-out"
        style={{
          background:
            healthScore >= 80
              ? 'linear-gradient(135deg, #064e3b 0%, #022c22 40%, #0f172a 100%)' // Emerald glow
              : healthScore >= 60
                ? 'linear-gradient(135deg, #042f2e 0%, #0f172a 60%, #020617 100%)' // Teal/Slate glow
                : healthScore >= 40
                  ? 'linear-gradient(135deg, #451a03 0%, #1e1b4b 65%, #0f172a 100%)' // Amber/Indigo glow
                  : 'linear-gradient(135deg, #450a0a 0%, #0f172a 70%, #020617 100%)', // Burgundy glow
        }}
      />

      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />

      {/* Animated mesh overlay - Keep on desktop */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(20,184,166,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(59,130,246,0.2) 0%, transparent 40%),
                            radial-gradient(circle at 60% 80%, rgba(139,92,246,0.15) 0%, transparent 40%)`,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col gap-4">
        {/* Top row: greeting + sparkline */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {/* Greeting chip */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                style={{ background: 'rgba(20,184,166,0.12)', borderColor: 'rgba(20,184,166,0.3)' }}
              >
                <Sparkles size={11} style={{ color: '#14b8a6' }} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#14b8a6',
                    fontFamily: 'var(--font-inter)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {getGreeting()}, Saver 👋
                </span>
              </div>
            </div>

            {/* Balance label */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-inter)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Total Balance
            </div>

            {/* Big animated number */}
            <div
              className={`tabular-nums transition-all duration-500 ${hideBalances ? 'blur-lg select-none' : ''}`}
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '48px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: hideBalances ? '4px' : '-0.02em',
              }}
            >
              {hideBalances
                ? '••••••'
                : `${currency}${displayBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            </div>

            {/* Trend indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              {isTrendUp ? (
                <TrendingUp size={13} style={{ color: '#14b8a6' }} />
              ) : (
                <TrendingDown size={13} style={{ color: '#f59e0b' }} />
              )}
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {isTrendUp ? 'Growing' : 'Declining'} over 14 days
              </span>
            </div>
          </div>

          {/* Sparkline & Privacy Toggle */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="w-[160px] h-[80px] bg-white/5 rounded-2xl p-2 border border-white/10 backdrop-blur-sm">
              {sparkData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke={isTrendUp ? '#2dd4bf' : '#fbbf24'}
                      strokeWidth={3}
                      dot={false}
                      strokeLinecap="round"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length || hideBalances) return null;
                        const val = payload[0].value as number;
                        return (
                          <div
                            style={{
                              background: 'rgba(15,23,42,0.95)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              padding: '8px 12px',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 800,
                                color: '#fff',
                                fontFamily: 'var(--font-manrope)',
                              }}
                            >
                              {currency}
                              {val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                    No trend data
                  </span>
                </div>
              )}
            </div>

            {onTogglePrivacy && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onTogglePrivacy();
                  haptic.light();
                }}
                className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl border transition-all hover:scale-105 active:scale-95"
                style={{
                  background: hideBalances ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: hideBalances ? '#14b8a6' : 'rgba(255,255,255,0.1)',
                  color: hideBalances ? '#14b8a6' : 'rgba(255,255,255,0.6)',
                }}
              >
                <Shield size={12} fill={hideBalances ? '#14b8a6' : 'none'} />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-inter)',
                    textTransform: 'uppercase',
                  }}
                >
                  {hideBalances ? 'Shield Active' : 'Privacy Mode'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Bottom row: mini-stats + health bar */}
        <div className="flex items-center gap-5">
          {/* Mini stats */}
          <div className="flex items-center gap-3 flex-1">
            {/* Income */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <ArrowDownLeft size={15} style={{ color: '#10b981' }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--font-inter)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Income
                </div>
                <div
                  className={`tabular-nums transition-all ${hideBalances ? 'blur-md select-none' : ''}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#10b981',
                    fontFamily: 'var(--font-manrope)',
                  }}
                >
                  {hideBalances
                    ? '•••'
                    : `+${currency}${displayIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)' }} />

            {/* Expenses */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}
              >
                <ArrowUpRight size={15} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--font-inter)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Expenses
                </div>
                <div
                  className={`tabular-nums transition-all ${hideBalances ? 'blur-md select-none' : ''}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#ef4444',
                    fontFamily: 'var(--font-manrope)',
                  }}
                >
                  {hideBalances
                    ? '•••'
                    : `-${currency}${displayExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)' }} />

            {/* Net */}
            <div className="flex items-center gap-2 pr-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: isPositive ? 'rgba(20,184,166,0.15)' : 'rgba(245,158,11,0.15)',
                }}
              >
                {isPositive ? (
                  <TrendingUp size={14} style={{ color: '#14b8a6' }} />
                ) : (
                  <TrendingDown size={14} style={{ color: '#f59e0b' }} />
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--font-inter)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Net
                </div>
                <div
                  className={`tabular-nums transition-all ${hideBalances ? 'blur-md select-none' : ''}`}
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: isPositive ? '#14b8a6' : '#f59e0b',
                    fontFamily: 'var(--font-manrope)',
                  }}
                >
                  {hideBalances
                    ? '•••'
                    : `${isPositive ? '+' : '-'}${currency}${displayNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </div>
              </div>
            </div>
          </div>

          {/* Health score bar */}
          <div className="w-[180px] flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Shield size={12} style={{ color: healthColor }} />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-inter)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Financial Health
                </span>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: healthColor,
                  fontFamily: 'var(--font-manrope)',
                }}
              >
                {healthScore}/100
              </span>
            </div>
            <div
              style={{
                height: '6px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: '999px',
                  background: `linear-gradient(90deg, ${healthColor}, ${healthColor}88)`,
                }}
              />
            </div>
            <div
              style={{
                marginTop: '4px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-inter)',
                textAlign: 'right',
              }}
            >
              {healthLabel}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
