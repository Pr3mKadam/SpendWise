import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, RefreshCw, Link } from 'lucide-react';
import { Budget } from '../../../../types';
import { useCategories } from '../../../../hooks/useCategories';

type BudgetStatus = 'safe' | 'warning' | 'danger';

const STATUS_CONFIG: Record<BudgetStatus, { color: string; label: string; bg: string; text: string; icon: React.ElementType }> = {
  safe:    { color: '#14b8a6', label: 'On Track',    bg: 'rgba(20,184,166,0.1)',  text: '#14b8a6', icon: CheckCircle2 },
  warning: { color: '#f59e0b', label: 'Watch Out',   bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', icon: AlertTriangle },
  danger:  { color: '#ef4444', label: 'Over Budget', bg: 'rgba(239,68,68,0.1)',  text: '#ef4444', icon: AlertTriangle },
};

function BudgetEditRow({ budget, onSave, onCancel, onDelete, currency }: {
  budget: Budget; onSave: (v: number) => void; onCancel: () => void; onDelete: () => void; currency: string;
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
      <div style={{ flex: 1 }} />
      <button onClick={onDelete}
        className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1 transition-colors"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
        Delete
      </button>
    </div>
  );
}

export function BudgetRow({ budget, onUpdate, onDelete, currency, rolloverEnabled }: {
  budget: Budget; onUpdate: (l: number) => void; onDelete: () => void; currency: string; rolloverEnabled: boolean;
}) {
  const { mergedColors, mergedIcons, categoryLimits } = useCategories();
  const [editing, setEditing] = useState(false);
  const isSynced = categoryLimits[budget.category] !== undefined;
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
              {isSynced && (
                <span 
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight"
                  style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid var(--teal-glow)' }}
                  title="Limit synced from Category Settings"
                >
                  <Link size={8} /> Synced
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
          onDelete={() => { onDelete(); setEditing(false); }}
          currency={currency}
        />
      )}
    </div>
  );
}
