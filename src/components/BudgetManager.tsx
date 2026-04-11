import { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, TrendingUp, Edit3, RotateCcw, Shield, X } from 'lucide-react';
import { Budget, Category } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

interface BudgetManagerProps {
  budgets:                 Budget[];
  totalBudgeted:           number;
  totalSpentAgainstBudget: number;
  overBudgetCount:         number;
  onUpdateLimit:           (category: Category, limit: number) => void;
  onResetLimits:           () => void;
  currency?:               string;
}

const STATUS_CONFIG = {
  safe:    { color: '#14b8a6', label: 'On Track',    bg: 'rgba(20,184,166,0.1)',  text: '#14b8a6', icon: CheckCircle2 },
  warning: { color: '#f59e0b', label: 'Watch Out',   bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', icon: AlertTriangle },
  danger:  { color: '#ef4444', label: 'Over Budget', bg: 'rgba(239,68,68,0.1)',  text: '#ef4444', icon: AlertTriangle },
} as const;

// ── Inline Edit ──────────────────────────────────────────────────

function BudgetEditRow({ budget, onSave, onCancel, currency }: {
  budget: Budget; onSave: (v: number) => void; onCancel: () => void; currency: string;
}) {
  const [val, setVal] = useState(String(budget.limit));
  const parsed  = parseFloat(val);
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 99999;

  return (
    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #f0f2f5' }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>{currency}</span>
      <input
        type="number" value={val} onChange={e => setVal(e.target.value)}
        min={0} max={99999} step={10} autoFocus
        className="rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
        style={{ background: '#f5f7fa', border: '2px solid var(--teal)', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', width: '110px' }}
      />
      <button onClick={() => isValid && onSave(parsed)} disabled={!isValid}
        className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
        style={{ background: 'var(--teal)', color: '#fff', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5, fontFamily: 'var(--font-inter)' }}>
        Save
      </button>
      <button onClick={onCancel}
        className="rounded-lg px-3 py-2 text-xs font-semibold"
        style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
        Cancel
      </button>
    </div>
  );
}

// ── Budget Row ───────────────────────────────────────────────────

function BudgetRow({ budget, onUpdate, currency }: {
  budget: Budget; onUpdate: (l: number) => void; currency: string;
}) {
  const [editing, setEditing] = useState(false);
  const cfg      = STATUS_CONFIG[budget.status];
  const Icon     = cfg.icon;
  const barWidth = Math.min(budget.percent, 100);
  const isOver   = budget.remaining < 0;

  return (
    <div className="card px-5 py-4 card-hover">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shrink-0"
          style={{ background: `${CATEGORY_COLORS[budget.category]}15` }}>
          {CATEGORY_ICONS[budget.category]}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{budget.category}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: cfg.bg, color: cfg.text, fontFamily: 'var(--font-inter)' }}>
                <Icon size={10} />{cfg.label}
              </span>
              <button onClick={() => setEditing(e => !e)}
                className="flex items-center justify-center w-6 h-6 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                style={{ background: '#f5f7fa', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                <Edit3 size={12} />
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-1" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currency}{budget.spent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              {' '}of {currency}{budget.limit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span style={{ fontWeight: 600, color: isOver ? '#ef4444' : 'var(--text-muted)' }}>
              {isOver ? `${currency}${Math.abs(budget.remaining).toFixed(0)} over` : `${currency}${budget.remaining.toFixed(0)} left`}
            </span>
          </div>

          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: '#f0f2f5' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barWidth}%`, background: cfg.color }} />
          </div>

          <div className="flex justify-between mt-1">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>{budget.percent}% used</span>
            {budget.status === 'danger' && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', fontFamily: 'var(--font-inter)' }}>⚠ Limit exceeded</span>
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

// ── Summary Bar ──────────────────────────────────────────────────

function BudgetSummaryBar({ totalBudgeted, totalSpent, overBudgetCount, currency }: {
  totalBudgeted: number; totalSpent: number; overBudgetCount: number; currency: string;
}) {
  const pct    = totalBudgeted > 0 ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100) : 0;
  const isOver = totalSpent > totalBudgeted;

  return (
    <div className="card px-6 py-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--teal)' }} />
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Budget Overview</span>
        </div>
        {overBudgetCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--red-dim)', color: 'var(--red)', fontFamily: 'var(--font-inter)' }}>
            <AlertTriangle size={12} />{overBudgetCount} over limit
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Budget</p>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }} className="tabular-nums">
            {currency}{totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Spent</p>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }} className="tabular-nums">
            {currency}{totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Utilization</p>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color: isOver ? '#ef4444' : 'var(--teal)' }} className="tabular-nums">
            {pct}%
          </p>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: '#f0f2f5' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : 'var(--teal)' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{currency}0</span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{currency}{totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export default function BudgetManager({
  budgets, totalBudgeted, totalSpentAgainstBudget, overBudgetCount, onUpdateLimit, onResetLimits, currency = '$',
}: BudgetManagerProps) {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="animate-fade-in-up">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Target size={20} style={{ color: 'var(--teal)' }} />
            Budget Manager
          </h2>
          <p className="text-caption mt-1">Set monthly limits · Hover a category to edit</p>
        </div>
        <button
          onClick={onResetLimits}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', boxShadow: 'var(--shadow-card)', border: 'none', cursor: 'pointer' }}
        >
          <RotateCcw size={14} /> Reset Defaults
        </button>
      </div>

      {/* Tip banner */}
      {showTip && (
        <div
          className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 mb-5"
          style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-glow)' }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp size={16} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>Pro Tip</p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Hover any budget card and click the ✏️ icon to set a custom monthly limit.
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
      <BudgetSummaryBar totalBudgeted={totalBudgeted} totalSpent={totalSpentAgainstBudget} overBudgetCount={overBudgetCount} currency={currency} />

      {/* Budget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(budget => (
          <div key={budget.category} className="group">
            <BudgetRow budget={budget} onUpdate={v => onUpdateLimit(budget.category, v)} currency={currency} />
          </div>
        ))}
      </div>
    </div>
  );
}
