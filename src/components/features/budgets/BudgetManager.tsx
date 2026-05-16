import {
  Target, TrendingUp, RotateCcw, RefreshCw, Shield,
  X, Tag as TagIcon, Calendar, Plus, Check,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Budget, BudgetPeriod, Category, Transaction, BudgetSuggestion } from '../../../types';
import { useBudgetManager } from './hooks/useBudgetManager';
import { PeriodSelector } from './components/PeriodSelector';
import { RolloverToggle } from './components/RolloverToggle';
import { BudgetSummaryBar } from './components/BudgetSummaryBar';
import { BudgetRow } from './components/BudgetRow';

interface BudgetManagerProps {
  budgets:                 Budget[];
  totalBudgeted:           number;
  totalSpentAgainstBudget: number;
  overBudgetCount:         number;
  period:                  BudgetPeriod;
  periodLabel:             string;
  rolloverEnabled:         boolean;
  onUpdateLimit:           (category: Category, limit: number) => void;
  onDeleteLimit:           (category: Category) => void;
  onResetLimits:           () => void;
  onChangePeriod:          (p: BudgetPeriod) => void;
  onToggleRollover:        () => void;
  onManageCategories?:     () => void;
  currency?:               string;
  transactions?:           Transaction[];
}

export default function BudgetManager({
  budgets, totalBudgeted, totalSpentAgainstBudget, overBudgetCount,
  period, periodLabel, rolloverEnabled,
  onUpdateLimit, onDeleteLimit, onResetLimits, onChangePeriod, onToggleRollover,
  onManageCategories, currency = '$', transactions = [],
}: BudgetManagerProps) {
  const {
    showTip, setShowTip,
    showAddForm, setShowAddForm,
    addCategory, setAddCategory,
    addLimit, setAddLimit,
    showSuggestions, setShowSuggestions,
    appliedSuggestions,
    availableCategories,
    suggestions,
    unappliedSuggestions,
    handleApplySuggestion,
    handleApplyAll,
    handleAddBudget,
    CONFIDENCE_COLOR,
    CONFIDENCE_LABEL,
  } = useBudgetManager({ budgets, transactions, onUpdateLimit });

  const existingCategories = new Set(budgets.map(b => b.category));

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
                {suggestions.map((s: BudgetSuggestion) => {
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
                {availableCategories.map((c: string) => (
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
              onDelete={() => onDeleteLimit(budget.category)}
              currency={currency}
              rolloverEnabled={rolloverEnabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
