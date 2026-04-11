import { useState } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit3,
  RotateCcw,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Budget, Category } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

interface BudgetManagerProps {
  budgets:                  Budget[];
  totalBudgeted:            number;
  totalSpentAgainstBudget:  number;
  overBudgetCount:          number;
  onUpdateLimit:            (category: Category, limit: number) => void;
  onResetLimits:            () => void;
}

// ── Status config ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  safe:    { color: '#10b981', label: 'On Track',   bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400', icon: CheckCircle2 },
  warning: { color: '#f59e0b', label: 'Watch Out',  bgClass: 'bg-amber-500/10',   textClass: 'text-amber-400',   icon: AlertTriangle },
  danger:  { color: '#ef4444', label: 'Over Budget',bgClass: 'bg-red-500/10',     textClass: 'text-red-400',     icon: AlertTriangle },
} as const;

// ── Inline Edit Input ───────────────────────────────────────────────────────────

function BudgetEditRow({
  budget,
  onSave,
  onCancel,
}: {
  budget:   Budget;
  onSave:   (val: number) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(String(budget.limit));
  const parsed = parseFloat(val);
  const isValid = !isNaN(parsed) && parsed >= 0 && parsed <= 99999;

  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs text-slate-500">$</span>
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        min={0}
        max={99999}
        step={10}
        autoFocus
        className="w-28 rounded-lg border border-emerald-500/40 bg-slate-800/80 px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />
      <button
        onClick={() => isValid && onSave(parsed)}
        disabled={!isValid}
        className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-40"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-300"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Budget Row ──────────────────────────────────────────────────────────────────

function BudgetRow({
  budget,
  onUpdate,
}: {
  budget:   Budget;
  onUpdate: (limit: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cfg         = STATUS_CONFIG[budget.status];
  const Icon        = cfg.icon;
  const barWidth    = Math.min(budget.percent, 100);
  const isOver      = budget.remaining < 0;

  return (
    <div
      className="group rounded-xl border border-slate-800/60 bg-slate-800/20 p-3.5 transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-800/40"
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: `${CATEGORY_COLORS[budget.category]}18` }}
        >
          {CATEGORY_ICONS[budget.category]}
        </span>

        {/* Name + status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">{budget.category}</span>
            <div className="flex items-center gap-1.5">
              {/* Status badge */}
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bgClass} ${cfg.textClass}`}>
                <Icon className="h-2.5 w-2.5" />
                {cfg.label}
              </span>
              {/* Edit button */}
              <button
                onClick={() => setEditing(e => !e)}
                className="rounded-lg p-1 text-slate-600 transition hover:bg-slate-700/40 hover:text-slate-300 opacity-0 group-hover:opacity-100"
                title="Edit limit"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Spent / limit */}
          <div className="mt-0.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              <span className="font-semibold text-slate-300">
                ${budget.spent.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
              {' '}/ ${budget.limit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className={isOver ? 'font-bold text-red-400' : 'text-slate-500'}>
              {isOver
                ? `$${Math.abs(budget.remaining).toFixed(0)} over`
                : `$${budget.remaining.toFixed(0)} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:           `${barWidth}%`,
            backgroundColor: cfg.color,
          }}
        />
      </div>

      {/* Percentage label */}
      <div className="mt-1 flex justify-between">
        <span className="text-[10px] text-slate-600">{budget.percent}% used</span>
        {budget.status === 'danger' && (
          <span className="text-[10px] font-semibold text-red-400 animate-pulse">
            ⚠ Limit exceeded
          </span>
        )}
      </div>

      {/* Inline editor */}
      {editing && (
        <BudgetEditRow
          budget={budget}
          onSave={val => { onUpdate(val); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ── Summary Bar ─────────────────────────────────────────────────────────────────

function BudgetSummaryBar({
  totalBudgeted,
  totalSpent,
  overBudgetCount,
}: {
  totalBudgeted:   number;
  totalSpent:      number;
  overBudgetCount: number;
}) {
  const overallPercent = totalBudgeted > 0
    ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100)
    : 0;
  const isOver = totalSpent > totalBudgeted;

  return (
    <div className="mb-4 rounded-xl border border-slate-800/60 bg-slate-800/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Monthly Budget Overview</span>
        </div>
        {overBudgetCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            {overBudgetCount} over limit
          </span>
        )}
      </div>

      {/* Overall progress bar */}
      <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:           `${overallPercent}%`,
            backgroundColor: isOver ? '#ef4444' : overallPercent > 80 ? '#f59e0b' : '#10b981',
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          <span className="font-semibold text-slate-300">
            ${totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>{' '}
          spent of ${totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })} budget
        </span>
        <span className={`font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
          {overallPercent}%
        </span>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function BudgetManager({
  budgets,
  totalBudgeted,
  totalSpentAgainstBudget,
  overBudgetCount,
  onUpdateLimit,
  onResetLimits,
}: BudgetManagerProps) {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="animate-fade-in-up space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Target className="h-5 w-5 text-emerald-400" />
            Budget Manager
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Set monthly limits · Hover a category to edit
          </p>
        </div>
        <button
          onClick={onResetLimits}
          className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-600/60 hover:text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* ── Tip banner ── */}
      {showTip && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
            <div>
              <p className="text-xs font-semibold text-blue-300">Pro Tip</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Hover any budget card and click the ✏️ icon to set a custom monthly limit.
                SpendWise automatically calculates how much you've spent this period.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTip(false)}
            className="mt-0.5 text-slate-600 hover:text-slate-400"
          >
            <ChevronRight className="h-4 w-4 rotate-[-90deg]" />
          </button>
        </div>
      )}

      {/* ── Summary bar ── */}
      <BudgetSummaryBar
        totalBudgeted={totalBudgeted}
        totalSpent={totalSpentAgainstBudget}
        overBudgetCount={overBudgetCount}
      />

      {/* ── Budget grid ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {budgets.map(budget => (
          <BudgetRow
            key={budget.category}
            budget={budget}
            onUpdate={val => onUpdateLimit(budget.category, val)}
          />
        ))}
      </div>
    </div>
  );
}
