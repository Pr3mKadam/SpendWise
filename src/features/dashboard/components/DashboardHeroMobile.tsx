import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Shield } from 'lucide-react';
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

function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: '#14b8a6' };
  if (score >= 60) return { label: 'Good', color: '#10b981' };
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Needs Work', color: '#ef4444' };
}

export default function DashboardHeroMobile({
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
    () => balanceTrend.map((p) => ({ date: p.date, balance: p.balance })),
    [balanceTrend]
  );

  const isTrendUp = sparkData.length > 1
    ? sparkData[sparkData.length - 1].balance >= sparkData[0].balance
    : true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => haptic.light()}
      className="relative w-full rounded-2xl shadow-lg border border-white/5 cursor-pointer overflow-hidden hero-glow-dark"
      style={{
        background:
          healthScore >= 80
            ? 'linear-gradient(135deg, #064e3b 0%, #022c22 45%, #0f172a 100%)' // Emerald
            : healthScore >= 60
            ? 'linear-gradient(135deg, #042f2e 0%, #0f172a 70%, #020617 100%)' // Teal/Slate
            : healthScore >= 40
            ? 'linear-gradient(135deg, #451a03 0%, #1e1b4b 65%, #0f172a 100%)' // Amber/Indigo
            : 'linear-gradient(135deg, #450a0a 0%, #0f172a 75%, #020617 100%)', // Burgundy
      }}
    >
      {/* Simplified Mobile Content */}
      <div className="relative z-10 p-5 flex flex-col gap-4">
        {/* Top: Balance and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total Balance
            </div>
            
            <div
              className={`tabular-nums transition-all duration-300 ${hideBalances ? 'blur-lg select-none' : ''}`}
              style={{ fontFamily: 'var(--font-manrope)', fontSize: '32px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: hideBalances ? '4px' : '-0.02em' }}
            >
              {hideBalances ? '••••••' : `${currency}${displayBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            </div>
            
            <div className="flex items-center gap-1.5 mt-1">
              {isTrendUp
                ? <TrendingUp size={12} style={{ color: '#14b8a6' }} />
                : <TrendingDown size={12} style={{ color: '#f59e0b' }} />
              }
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)' }}>
                {isTrendUp ? 'Growing' : 'Declining'} over 14 days
              </span>
            </div>
          </div>

          {onTogglePrivacy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePrivacy();
                haptic.medium();
              }}
              className="p-2 rounded-xl transition-colors"
              style={{ background: hideBalances ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.08)' }}
              aria-label="Toggle Privacy"
            >
              <Shield size={16} color={hideBalances ? '#14b8a6' : '#fff'} fill={hideBalances ? '#14b8a6' : 'none'} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Middle: Mini Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <ArrowDownLeft size={14} style={{ color: '#10b981' }} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>In</span>
              <span className={`tabular-nums ${hideBalances ? 'blur-md select-none' : ''}`} style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                {hideBalances ? '•••' : `${currency}${displayIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <ArrowUpRight size={14} style={{ color: '#ef4444' }} />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Out</span>
              <span className={`tabular-nums ${hideBalances ? 'blur-md select-none' : ''}`} style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                {hideBalances ? '•••' : `${currency}${displayExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isPositive ? 'rgba(20,184,166,0.15)' : 'rgba(245,158,11,0.15)' }}>
              {isPositive ? <TrendingUp size={14} style={{ color: '#14b8a6' }} /> : <TrendingDown size={14} style={{ color: '#f59e0b' }} />}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net</span>
              <span className={`tabular-nums ${hideBalances ? 'blur-md select-none' : ''}`} style={{ fontSize: '13px', fontWeight: 700, color: isPositive ? '#14b8a6' : '#f59e0b' }}>
                {hideBalances ? '•••' : `${isPositive ? '+' : '-'}${currency}${displayNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Health Score */}
        <div className="mt-1">
          <div className="flex justify-between items-center mb-1.5">
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health: {healthLabel}</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: healthColor }}>{healthScore}/100</span>
          </div>
          <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: healthColor }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
