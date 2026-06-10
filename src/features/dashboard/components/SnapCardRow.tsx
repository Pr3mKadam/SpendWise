import React from 'react';
import { Target, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/core/haptic';

// ─── Snap-row card ────────────────────────────────────────────────────────────

interface SnapCardProps {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function SnapCard({ label, value, sub, accent, icon, onClick }: SnapCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-1 min-w-[96px] p-3 rounded-2xl active:scale-[0.96] transition-transform outline-none"
      style={{
        background: 'var(--surface-card)',
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span style={{ color: accent, lineHeight: 1 }}>{icon}</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-manrope)',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
        {sub}
      </p>
    </button>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

interface SnapCardRowProps {
  overallBudgetPercent: number;
  totalBudgeted: number;
  goalsCount: number;
  savingsRate: number;
  subSpend: number;
  currency: string;
  onNavigate: (view: AppView) => void;
}

export function SnapCardRow({
  overallBudgetPercent,
  totalBudgeted,
  goalsCount,
  savingsRate,
  subSpend,
  currency,
  onNavigate,
}: SnapCardRowProps) {
  return (
    <section style={{ padding: '0 4px' }}>
      <div
        className="no-scrollbar"
        style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
      >
        <SnapCard
          label="Budget"
          value={`${Math.round(overallBudgetPercent)}%`}
          sub={
            totalBudgeted > 0
              ? `of ${currency}${totalBudgeted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              : 'not set'
          }
          accent="#f59e0b"
          icon={<Target size={12} />}
          onClick={() => {
            haptic.light();
            onNavigate('budget');
          }}
        />
        <SnapCard
          label="Goals"
          value={String(goalsCount)}
          sub={goalsCount === 1 ? 'active goal' : 'active goals'}
          accent="#8b5cf6"
          icon={<Sparkles size={12} />}
          onClick={() => {
            haptic.light();
            onNavigate('goals');
          }}
        />
        <SnapCard
          label="Savings"
          value={`${savingsRate}%`}
          sub="rate this month"
          accent={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444'}
          icon={<TrendingUp size={12} />}
          onClick={() => {
            haptic.light();
            onNavigate('analytics');
          }}
        />
        <SnapCard
          label="Subs"
          value={
            subSpend > 0
              ? `${currency}${subSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              : '—'
          }
          sub="this month"
          accent="#06b6d4"
          icon={<RefreshCw size={12} />}
          onClick={() => {
            haptic.light();
            onNavigate('subscriptions');
          }}
        />
      </div>
    </section>
  );
}
