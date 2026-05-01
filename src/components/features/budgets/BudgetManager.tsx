import { useState } from 'react';
import {
  Target, AlertTriangle, CheckCircle2, TrendingUp, Edit3, RotateCcw,
  Shield, X, Tag as TagIcon, Calendar, RefreshCw,
} from 'lucide-react';
import { Budget, BudgetPeriod, Category } from '../../../types';
import { useCategories } from '../../../hooks/useCategories';

interface BudgetManagerProps {
  budgets:                 Budget[];
  totalBudgeted:           number;
  totalSpentAgainstBudget: number;
  overBudgetCount:         number;
  period:                  BudgetPeriod;
  periodLabel:             string;
  rolloverEnabled:         boolean;
  onUpdateLimit:           (category: Category, limit: number) => void;
  onResetLimits:           () => void;
  onChangePeriod:          (p: BudgetPeriod) => void;
  onToggleRollover:        () => void;
  onManageCategories?:     () => void;
  currency?:               string;
}

const STATUS_CONFIG = {
  safe:    { color: '#14b8a6', label: 'On Track',    bg: 'rgba(20,184,166,0.1)',  text: '#14b8a6', icon: CheckCircle2 },
  warning: { color: '#f59e0b', label: 'Watch Out',   bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', icon: AlertTriangle },
  danger:  { color: '#ef4444', label: 'Over Budget', bg: 'rgba(239,68,68,0.1)',  text: '#ef4444', icon: AlertTriangle },
} as const;

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string; short: string }[] = [
  { value: 'weekly',   label: 'Weekly',    short: '7d'  },
  { value: 'biweekly', label: 'Bi-Weekly', short: '14d' },
  { value: 'monthly',  label: 'Monthly',   short: '30d' },
];

// ── Inline Edit ──────────────────────────────────────────────────

function BudgetEditRow({ budget, onSave, onCancel, currency }: {
  budget: Budget; onSave: (v: number) => void; onCancel: () => void; currency: string;
}) {
  const [val, setVal] = useState(String(budget.baseLimit));
  const parsed  = parseFloat(val);
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 99999;

  return (
    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>{currency}</span>
      <input
        type="number" value={val} onChange={e => setVal(e.target.value)}
        min={0} max={99999} step={10} autoFocus
        className="rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
        style={{ background: 'var(--bg)', border: '2px solid var(--teal)', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', width: '110px' }}
      />
      <button onClick={() => isValid && onSave(parsed)} disabled={!isValid}
        className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
        style={{ background: 'var(--teal)', color: '#fff', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5, fontFamily: 'var(--font-inter)' }}>
        Save
      </button>
      <button onClick={onCancel}
        className="rounded-lg px-3 py-2 text-xs font-semibold"
        style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
        Cancel
      </button>
    </div>
  );
}

// ── Budget Row ───────────────────────────────────────────────────

function BudgetRow({ budget, onUpdate, currency, rolloverEnabled }: {
  budget: Budget; onUpdate: (l: number) => void; currency: string; rolloverEnabled: boolean;
}) {
  const { mergedColors, mergedIcons } = useCategories();
  const [editing, setEditing] = useState(false);
  const cfg      = STATUS_CONFIG[budget.status];
  const Icon     = cfg.icon;
  const barWidth = Math.min(budget.percent, 100);
  const isOver   = budget.remaining < 0;
  const hasRollover = rolloverEnabled && budget.rolloverAmount > 0;

  return (
    <div className="card card-hover" style={{ padding: '18px 20px' }}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shrink-0"
          style={{ background: `${mergedColors[budget.category] || '#14b8a6'}18` }}
        >
          {mergedIcons[budget.category] || '📦'}
        </span>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {budget.category}
              </span>
              {hasRollover && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', whiteSpace: 'nowrap' }}
                  title={`${currency}${budget.rolloverAmount.toFixed(0)} rolled over from last period`}
                >
                  <RefreshCw size={9} />
                  +{currency}{budget.rolloverAmount.toFixed(0)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: cfg.bg, color: cfg.text, fontFamily: 'var(--font-inter)' }}
              >
                <Icon size={10} />{cfg.label}
              </span>
              <button
                onClick={() => setEditing(e => !e)}
                className="flex items-center justify-center w-6 h-6 rounded-lg transition-colors"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                title="Edit budget limit"
              >
                <Edit3 size={12} />
              </button>
            </div>
          </div>

          {/* Amount row */}
          <div className="flex justify-between mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currency}{budget.spent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              {' '}of {currency}{budget.limit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              {hasRollover && (
                <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                  {' '}({currency}{budget.baseLimit.toLocaleString('en-US', { maximumFractionDigits: 0 })} base)
                </span>
              )}
            </span>
            <span style={{ fontWeight: 600, color: isOver ? '#ef4444' : 'var(--text-muted)' }}>
              {isOver
                ? `${currency}${Math.abs(budget.remaining).toFixed(0)} over`
                : `${currency}${budget.remaining.toFixed(0)} left`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${barWidth}%`, background: cfg.color }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
              {budget.percent}% used
            </span>
            {budget.status === 'danger' && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', fontFamily: 'var(--font-inter)' }}>
                ⚠ Limit exceeded
              </span>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <BudgetEditRow
          budget={budget}
          onSave={v => { onUpdate(v); setEditing(false); }}
          onCancel={() => setEditing(false)}
          currency={currency}
        />
      )}
    </div>
  );
}

// ── Period Selector ──────────────────────────────────────────────

function PeriodSelector({ period, onChange }: { period: BudgetPeriod; onChange: (p: BudgetPeriod) => void }) {
  return (
    <div
      className="flex items-center rounded-xl p-1 gap-1"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
          style={{
            background:  period === opt.value ? 'var(--teal)' : 'transparent',
            color:       period === opt.value ? '#fff' : 'var(--text-muted)',
            border:      'none',
            cursor:      'pointer',
            fontFamily:  'var(--font-inter)',
            whiteSpace:  'nowrap',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Rollover Toggle ──────────────────────────────────────────────

function RolloverToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all duration-200"
      style={{
        background: enabled ? 'rgba(99,102,241,0.1)' : 'var(--bg)',
        border:     `1px solid ${enabled ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`,
        cursor:     'pointer',
        color:      enabled ? '#818cf8' : 'var(--text-muted)',
        fontFamily: 'var(--font-inter)',
        fontSize:   '13px',
        fontWeight: 600,
      }}
      title="Carry unspent budget forward to the next period"
    >
      <RefreshCw size={14} style={{ flexShrink: 0 }} />
      <span>Rollover</span>
      {/* iOS-style pill */}
      <span
        className="relative inline-flex items-center shrink-0"
        style={{
          width: '34px', height: '20px',
          background:   enabled ? '#818cf8' : 'var(--border)',
          borderRadius: '999px',
          transition:   'background 0.25s',
        }}
      >
        <span
          style={{
            position:     'absolute',
            left:         enabled ? '16px' : '2px',
            width:        '16px', height: '16px',
            borderRadius: '50%',
            background:   '#fff',
            boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
            transition:   'left 0.25s',
          }}
        />
      </span>
    </button>
  );
}

// ── Summary Bar ──────────────────────────────────────────────────

function BudgetSummaryBar({
  totalBudgeted, totalSpent, overBudgetCount, currency, periodLabel, rolloverEnabled, budgets,
}: {
  totalBudgeted: number; totalSpent: number; overBudgetCount: number;
  currency: string; periodLabel: string; rolloverEnabled: boolean; budgets: Budget[];
}) {
  const pct    = totalBudgeted > 0 ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100) : 0;
  const isOver = totalSpent > totalBudgeted;
  const totalRollover = rolloverEnabled
    ? budgets.reduce((a, b) => a + b.rolloverAmount, 0)
    : 0;

  return (
    <div className="card mb-5" style={{ padding: '22px 24px' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--teal)' }} />
          <div>
            <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Budget Overview
            </span>
            <span
              className="ml-2 text-xs font-semibold rounded-full px-2 py-0.5"
              style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)' }}
            >
              {periodLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {totalRollover > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontFamily: 'var(--font-inter)' }}
            >
              <RefreshCw size={11} />{currency}{totalRollover.toFixed(0)} rolled over
            </span>
          )}
          {overBudgetCount > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--red-dim)', color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
            >
              <AlertTriangle size={12} />{overBudgetCount} over limit
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-4">
        {[
          { label: 'Total Budget', value: `${currency}${totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'var(--text-primary)' },
          { label: 'Total Spent',  value: `${currency}${totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,    color: 'var(--text-primary)' },
          { label: 'Utilization',  value: `${pct}%`, color: isOver ? '#ef4444' : 'var(--teal)' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </p>
            <p className="tabular-nums" style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : 'var(--teal)' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{currency}0</span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {currency}{totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export default function BudgetManager({
  budgets, totalBudgeted, totalSpentAgainstBudget, overBudgetCount,
  period, periodLabel, rolloverEnabled,
  onUpdateLimit, onResetLimits, onChangePeriod, onToggleRollover,
  onManageCategories, currency = '$',
}: BudgetManagerProps) {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="animate-fade-in-up">

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Target size={20} style={{ color: 'var(--teal)' }} />
            Budget Manager
          </h2>
          <p className="text-caption mt-1">
            Track spending limits · Click ✏️ to edit any limit · Rollover unused budget
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <PeriodSelector period={period} onChange={onChangePeriod} />
          </div>

          {/* Rollover toggle */}
          <RolloverToggle enabled={rolloverEnabled} onToggle={onToggleRollover} />

          {/* Categories button */}
          {onManageCategories && (
            <button
              onClick={onManageCategories}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <TagIcon size={14} /> Categories
            </button>
          )}

          {/* Reset defaults */}
          <button
            onClick={onResetLimits}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Rollover explainer tip */}
      {rolloverEnabled && showTip && (
        <div
          className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 mb-5"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <div className="flex items-start gap-3">
            <RefreshCw size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: '#818cf8' }}>
                Rollover is ON
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Any unspent budget from the current period will automatically carry forward to the next one.
                Purple badges show how much was rolled over into each category.
              </p>
            </div>
          </div>
          <button onClick={() => setShowTip(false)}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Period tip (when rollover is off) */}
      {!rolloverEnabled && showTip && (
        <div
          className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 mb-5"
          style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-glow)' }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp size={16} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>
                Pro Tip
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Switch between Weekly, Bi-Weekly, or Monthly periods above. Enable <strong>Rollover</strong> to carry
                unused budget into the next period automatically.
              </p>
            </div>
          </div>
          <button onClick={() => setShowTip(false)}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary */}
      <BudgetSummaryBar
        totalBudgeted={totalBudgeted}
        totalSpent={totalSpentAgainstBudget}
        overBudgetCount={overBudgetCount}
        currency={currency}
        periodLabel={periodLabel}
        rolloverEnabled={rolloverEnabled}
        budgets={budgets}
      />

      {/* Budget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(budget => (
          <BudgetRow
            key={budget.category}
            budget={budget}
            onUpdate={v => onUpdateLimit(budget.category, v)}
            currency={currency}
            rolloverEnabled={rolloverEnabled}
          />
        ))}
      </div>
    </div>
  );
}
