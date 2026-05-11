import { useState, useMemo } from 'react';
import {
  Target, AlertTriangle, CheckCircle2, TrendingUp, Edit3, RotateCcw,
  Shield, X, Tag as TagIcon, Calendar, RefreshCw, Plus, Check, Award, Flame, Star,
  Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { Budget, BudgetPeriod, Category, Transaction } from '../../../types';
import { useCategories } from '../../../hooks/useCategories';
import { generateBudgetSuggestions } from '../../../utils/insights/budgetSuggestions';

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
  transactions?:           Transaction[];
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
          type="button"
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
      type="button"
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

  // Gamification Milestones
  const hasBudgets = budgets.length > 0;
  const isPerfect = hasBudgets && overBudgetCount === 0;
  const isFrugal = hasBudgets && pct > 0 && pct < 50;
  const isActive = hasBudgets && totalSpent > 0;

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

      {/* Gamification Badges */}
      {hasBudgets && (
        <div className="flex gap-2 mb-4 pb-4 overflow-x-auto hide-scrollbar" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isActive ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800'}`}>
            <Flame size={14} className={isActive ? 'text-amber-500' : 'text-gray-400'} />
            <span className="text-xs font-bold whitespace-nowrap">Active Tracker</span>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isPerfect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800'}`}>
            <Star size={14} className={isPerfect ? 'text-emerald-500' : 'text-gray-400'} />
            <span className="text-xs font-bold whitespace-nowrap">Flawless</span>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isFrugal ? 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-800/50 dark:border-gray-800'}`}>
            <Award size={14} className={isFrugal ? 'text-purple-500' : 'text-gray-400'} />
            <span className="text-xs font-bold whitespace-nowrap">Frugal Master</span>
          </div>
        </div>
      )}

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
  onManageCategories, currency = '$', transactions = [],
}: BudgetManagerProps) {
  const [showTip, setShowTip] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCategory, setAddCategory] = useState<Category | ''>('');
  const [addLimit, setAddLimit] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const { allCategories } = useCategories();
  const existingCategories = new Set(budgets.map(b => b.category));
  const availableCategories = allCategories.filter(c => !existingCategories.has(c as Category));

  const suggestions = useMemo(() => generateBudgetSuggestions(transactions), [transactions]);
  const unappliedSuggestions = suggestions.filter(s => !existingCategories.has(s.category as Category));

  const handleApplySuggestion = (category: string, limit: number) => {
    onUpdateLimit(category as Category, limit);
    setAppliedSuggestions(prev => new Set([...prev, category]));
  };

  const handleApplyAll = () => {
    unappliedSuggestions.forEach(s => onUpdateLimit(s.category as Category, s.suggestedLimit));
    setAppliedSuggestions(new Set(unappliedSuggestions.map(s => s.category)));
    setShowSuggestions(false);
  };

  const CONFIDENCE_COLOR = { high: '#14b8a6', medium: '#f59e0b', low: '#94a3b8' };
  const CONFIDENCE_LABEL = { high: 'Strong match', medium: 'Good estimate', low: 'Limited data' };

  const handleAddBudget = () => {
    const parsed = parseFloat(addLimit);
    if (addCategory && !isNaN(parsed) && parsed > 0) {
      onUpdateLimit(addCategory as Category, parsed);
      setAddCategory('');
      setAddLimit('');
      setShowAddForm(false);
    }
  };

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

          {/* Add Budget button */}
          <button
            type="button"
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: showAddForm ? 'var(--teal)' : 'var(--teal-dim)',
              color: showAddForm ? '#fff' : 'var(--teal)',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)'
            }}
          >
            <Plus size={15} /> Add Budget
          </button>

          {/* Categories button */}
          {onManageCategories && (
            <button
              type="button"
              onClick={onManageCategories}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <TagIcon size={14} /> Categories
            </button>
          )}

          {/* Reset */}
          <button
            type="button"
            onClick={onResetLimits}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* ── AI Budget Suggestions ───────────────────────────────── */}
      {transactions.length >= 5 && (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowSuggestions(v => !v)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold w-full transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(20,184,166,0.12) 100%)',
              border: '1.5px solid rgba(99,102,241,0.3)',
              color: '#818cf8',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
            }}
          >
            <Sparkles size={15} />
            <span>AI Budget Suggestions</span>
            <span
              className="ml-1 flex items-center justify-center h-5 min-w-[20px] rounded-full text-[10px] font-bold px-1"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
            >
              {unappliedSuggestions.length}
            </span>
            <span className="ml-auto">
              {showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>

          {showSuggestions && (
            <div
              className="mt-2 rounded-2xl p-4"
              style={{ background: 'var(--surface-card)', border: '1.5px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 20px rgba(99,102,241,0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    Smart Suggestions from Your History
                  </p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Based on 3 months of spending. Click to apply individual limits.
                  </p>
                </div>
                {unappliedSuggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyAll}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all"
                    style={{ background: '#818cf8', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}
                  >
                    <Check size={12} /> Apply All
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {suggestions.map(s => {
                  const isApplied = appliedSuggestions.has(s.category) || existingCategories.has(s.category as Category);
                  return (
                    <div
                      key={s.category}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                      style={{ background: isApplied ? 'rgba(20,184,166,0.06)' : 'var(--bg)', border: `1px solid ${isApplied ? 'rgba(20,184,166,0.2)' : 'var(--border)'}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {s.category}
                          </span>
                          <span
                            className="text-[9px] font-bold rounded-full px-1.5 py-0.5"
                            style={{ background: CONFIDENCE_COLOR[s.confidence] + '20', color: CONFIDENCE_COLOR[s.confidence] }}
                          >
                            {CONFIDENCE_LABEL[s.confidence]}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {s.reasoning}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 800, color: '#818cf8' }}>
                          {currency}{s.suggestedLimit.toLocaleString()}
                        </span>
                        {isApplied ? (
                          <span
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                            style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6' }}
                          >
                            <Check size={11} /> Applied
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplySuggestion(s.category, s.suggestedLimit)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Budget Form Panel ───────────────────────────────── */}
      {showAddForm && (
        <div
          className="mb-5 rounded-2xl p-5"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--teal)', boxShadow: '0 0 0 3px var(--teal-dim)' }}
        >
          <p style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '14px' }}>
            Set a new spending limit
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
                Category
              </label>
              <select
                value={addCategory}
                onChange={e => setAddCategory(e.target.value as Category)}
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Select a category…</option>
                {availableCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontFamily: 'var(--font-inter)' }}>
                Limit ({currency})
              </label>
              <input
                type="number"
                min={1}
                max={999999}
                placeholder="e.g. 5000"
                value={addLimit}
                onChange={e => setAddLimit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddBudget()}
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', outline: 'none' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddBudget}
                disabled={!addCategory || !addLimit || parseFloat(addLimit) <= 0}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
                style={{
                  background: (!addCategory || !addLimit || parseFloat(addLimit) <= 0) ? 'var(--surface-input)' : 'var(--teal)',
                  color: (!addCategory || !addLimit || parseFloat(addLimit) <= 0) ? 'var(--text-muted)' : '#fff',
                  border: 'none', cursor: (!addCategory || !addLimit || parseFloat(addLimit) <= 0) ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-inter)'
                }}
              >
                <Check size={14} /> Save
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddCategory(''); setAddLimit(''); }}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold"
                style={{ background: 'var(--surface-input)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Empty state */}
      {budgets.length === 0 && !showAddForm && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-16 px-8 text-center"
          style={{ background: 'var(--surface-card)', border: '1px dashed var(--border)' }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--teal-dim)' }}
          >
            <Shield size={28} style={{ color: 'var(--teal)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No budgets set yet
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.6, marginBottom: '20px' }}>
            Set spending limits per category to track your money and get over-budget alerts.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            style={{ background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
          >
            <Plus size={16} /> Set Your First Budget
          </button>
        </div>
      )}

      {/* Budget grid */}
      {budgets.length > 0 && (
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
      )}
    </div>
  );
}
