import { useState } from 'react';
import {
  Target, Plus, Trash2, TrendingUp, Calendar,
  CheckCircle2, AlertTriangle, PauseCircle, Edit3,
  DollarSign, X, Zap,
} from 'lucide-react';
import { SavingsGoal, GoalStatus } from '../types';

// ─── Goal status config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<GoalStatus, {
  label:   string;
  icon:    typeof CheckCircle2;
  color:   string;
  bg:      string;
}> = {
  'on-track': { label: 'On Track',  icon: TrendingUp,    color: 'var(--teal)',       bg: 'rgba(20,184,166,0.12)'   },
  'at-risk':  { label: 'At Risk',   icon: AlertTriangle, color: 'var(--amber)',      bg: 'rgba(245,158,11,0.12)'    },
  'achieved': { label: 'Achieved',  icon: CheckCircle2,  color: 'var(--purple)',     bg: 'rgba(139,92,246,0.12)'    },
  'paused':   { label: 'Paused',    icon: PauseCircle,   color: 'var(--text-muted)', bg: '#f5f7fa'                  },
};

// ─── SVG progress ring ────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  color,
  size = 80,
}: {
  percent: number;
  color:   string;
  size?:   number;
}) {
  const r          = (size - 10) / 2;
  const circ       = 2 * Math.PI * r;
  const offset     = circ - (Math.min(percent, 100) / 100) * circ;
  const center     = size / 2;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={center} cy={center} r={r} fill="none" stroke="#f0f2f5" strokeWidth={6} />
      <circle
        cx={center} cy={center} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  );
}

// ─── Days until target ────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Add/Edit Goal Modal ──────────────────────────────────────────────────────

const GOAL_EMOJIS = ['🛡️','✈️','🏠','💻','🚗','🎓','💍','🏋️','🎸','🌍','🛸','💎'];
const GOAL_COLORS = ['#10b981','#3b82f6','#a855f7','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];

interface GoalFormData {
  name:                string;
  emoji:               string;
  targetAmount:        string;
  savedAmount:         string;
  targetDate:          string;
  monthlyContribution: string;
  color:               string;
}

function defaultForm(): GoalFormData {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return {
    name:                '',
    emoji:               '🎯',
    targetAmount:        '',
    savedAmount:         '0',
    targetDate:          d.toISOString().split('T')[0],
    monthlyContribution: '',
    color:               '#10b981',
  };
}

function GoalModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<GoalFormData>;
  onSave:   (data: GoalFormData) => void;
  onClose:  () => void;
  currency: string;
}) {
  const [form, setForm] = useState<GoalFormData>({ ...defaultForm(), ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  const set = (key: keyof GoalFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim())                             errs.name          = 'Goal name is required';
    if (!form.targetAmount || Number(form.targetAmount) <= 0) errs.targetAmount  = 'Enter a valid target amount';
    if (!form.targetDate)                              errs.targetDate    = 'Select a target date';
    if (!form.monthlyContribution || Number(form.monthlyContribution) < 0) errs.monthlyContribution = 'Enter monthly contribution';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={onClose} />

      <div className="card relative w-full max-w-md animate-scale-in overflow-hidden rounded-2xl">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, var(--teal), var(--blue))` }} />

        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="flex items-center gap-2">
              <Target size={18} style={{ color: 'var(--teal)' }} />
              {initial ? 'Edit Goal' : 'New Savings Goal'}
            </h3>
            <button onClick={onClose} className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={15} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Emoji + Name row */}
            <div className="flex gap-3">
              {/* Emoji picker */}
              <div className="flex-shrink-0">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Icon</label>
                <div className="flex flex-wrap w-28 gap-1 rounded-xl p-1.5" style={{ background: '#f5f7fa' }}>
                  {GOAL_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setForm(p => ({ ...p, emoji: e }))}
                      className="h-7 w-7 rounded-lg text-sm transition-all hover:bg-white"
                      style={{ background: form.emoji === e ? 'var(--surface-card)' : 'transparent', boxShadow: form.emoji === e ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Goal Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Emergency Fund"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
                {errors.name && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errors.name}</p>}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Accent Color</label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(p => ({ ...p, color: c }))}
                    className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: c, outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>

            {/* Target + Saved amounts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Target ({currency}) *</label>
                <input type="number" min={1} value={form.targetAmount} onChange={set('targetAmount')}
                  placeholder="10000"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
                {errors.targetAmount && <p className="mt-1 text-[10px] text-red-400">{errors.targetAmount}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Already Saved ({currency})</label>
                <input type="number" min={0} value={form.savedAmount} onChange={set('savedAmount')}
                  placeholder="0"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
              </div>
            </div>

            {/* Target Date + Monthly */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Target Date *</label>
                <input type="date" value={form.targetDate} onChange={set('targetDate')}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
                {errors.targetDate && <p className="mt-1 text-[10px] text-red-400">{errors.targetDate}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>Monthly ({currency}) *</label>
                <input type="number" min={0} value={form.monthlyContribution} onChange={set('monthlyContribution')}
                  placeholder="500"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
                {errors.monthlyContribution && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errors.monthlyContribution}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: '#f5f7fa', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--teal)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
              <Target size={15} />
              {initial ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contribute Modal ─────────────────────────────────────────────────────────

function ContributeModal({
  goal,
  onContribute,
  onClose,
}: {
  goal:         SavingsGoal;
  onContribute: (amount: number) => void;
  onClose:      () => void;
  currency:     string;
}) {
  const [amount, setAmount] = useState('');
  const remaining = goal.targetAmount - goal.savedAmount;
  const parsed    = parseFloat(amount);
  const isValid   = !isNaN(parsed) && parsed > 0 && parsed <= remaining;

  const quickAmts = [goal.monthlyContribution, 50, 100, 200].filter(a => a > 0 && a <= remaining);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div className="card relative w-full max-w-sm animate-scale-in overflow-hidden rounded-2xl">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${goal.color}, transparent)` }} />
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <span style={{ fontSize: '28px' }}>{goal.emoji}</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{goal.name}</h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>{currency}{remaining.toFixed(0)} remaining</p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {[...new Set(quickAmts)].map(a => (
              <button key={a} onClick={() => setAmount(String(a))}
                className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: '1.5px solid #edf2f7', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
                +{currency}{a}
              </button>
            ))}
            <button onClick={() => setAmount(String(remaining.toFixed(2)))}
              className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
              style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1.5px solid var(--teal-glow)', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}>
              Full {currency}{remaining.toFixed(0)}
            </button>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{currency}</span>
            <input
              type="number" min={1} max={remaining} step={0.01}
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none"
              style={{ background: '#f5f7fa', border: '1.5px solid transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--teal)'; }}
              onBlur={e => { e.target.style.borderColor = 'transparent'; }}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: '#f5f7fa', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={() => { if (isValid) { onContribute(parsed); onClose(); } }}
              disabled={!isValid}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'var(--teal)', fontFamily: 'var(--font-inter)', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed' }}>
              <Zap size={15} />
              Contribute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  onContribute,
  onEdit,
  onDelete,
}: {
  goal:         SavingsGoal;
  onContribute: (amount: number) => void;
  onEdit:       () => void;
  onDelete:     () => void;
  currency:     string;
}) {
  const [showContribute, setShowContribute] = useState(false);
  const statusCfg = STATUS_CONFIG[goal.status];
  const StatusIcon = statusCfg.icon;
  const pct        = goal.targetAmount > 0
    ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
    : 0;
  const days  = daysUntil(goal.targetDate);
  const isAchieved = goal.status === 'achieved';

  return (
    <>
      <div className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 card card-hover ${isAchieved ? 'opacity-80' : ''}`}>
        {/* Top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-70"
          style={{ background: `linear-gradient(90deg, ${goal.color}, transparent)` }}
        />

        {/* Achieved shimmer overlay */}
        {isAchieved && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div className="animate-shimmer absolute inset-0 opacity-30" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          {/* Left: ring + info */}
          <div className="flex items-center gap-4">
            {/* Progress ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing percent={pct} color={goal.color} size={72} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg leading-none">{goal.emoji}</span>
                <span className="text-[10px] font-bold text-white">{pct}%</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{goal.name}</h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currency}{goal.savedAmount.toLocaleString()} saved of {currency}{goal.targetAmount.toLocaleString()}
              </p>
              <span
                className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: statusCfg.bg, color: statusCfg.color, fontFamily: 'var(--font-inter)' }}
              >
                <StatusIcon size={10} />
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onEdit}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{ background: '#f5f7fa', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
              <Edit3 size={13} />
            </button>
            <button onClick={onDelete}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{ background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: '#f0f2f5' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>

        {/* Footer: target date + monthly + contribute button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3" style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {isAchieved ? '🎉 Achieved!' : days > 0 ? `${days}d left` : formatDate(goal.targetDate)}
            </span>
            {goal.monthlyContribution > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {currency}{goal.monthlyContribution}/mo
              </span>
            )}
          </div>

          {!isAchieved && (
            <button
              onClick={() => setShowContribute(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1.5px solid var(--teal-glow)', fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
            >
              <Plus size={11} />
              Contribute
            </button>
          )}
        </div>
      </div>

      {showContribute && (
        <ContributeModal
          goal={goal}
          onContribute={onContribute}
          onClose={() => setShowContribute(false)}
          currency={currency}
        />
      )}
    </>
  );
}

// ─── Summary stats ────────────────────────────────────────────────────────────

function GoalsSummary({
  stats,
}: {
  stats: {
    activeCount: number; achievedCount: number;
    totalTarget: number; totalSaved: number;
    overallPercent: number; monthlyCommitted: number;
  };
  currency: string;
}) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: 'Active Goals',      value: String(stats.activeCount),                                  color: 'var(--teal)'   },
        { label: 'Achieved',          value: String(stats.achievedCount),                                 color: 'var(--purple)' },
        { label: 'Total Target',      value: `${currency}${stats.totalTarget.toLocaleString()}`,          color: 'var(--blue)'   },
        { label: 'Monthly Committed', value: `${currency}${stats.monthlyCommitted.toLocaleString()}/mo`,  color: 'var(--amber)'  },
      ].map(s => (
        <div key={s.label} className="card px-4 py-3">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</p>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main GoalsView ───────────────────────────────────────────────────────────

interface GoalStats {
  activeCount:      number;
  achievedCount:    number;
  totalTarget:      number;
  totalSaved:       number;
  overallPercent:   number;
  monthlyCommitted: number;
}

type GoalInput = Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>;

interface GoalsViewProps {
  goals:        SavingsGoal[];
  stats:        GoalStats;
  onAdd:        (data: GoalInput) => void;
  onUpdate:     (id: string, data: Partial<SavingsGoal>) => void;
  onDelete:     (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  currency?:    string;
}

export default function GoalsView({ goals, stats, onAdd, onUpdate, onDelete, onContribute, currency = '$' }: GoalsViewProps) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);

  const handleAdd = (form: GoalFormData) => {
    onAdd({
      name:                form.name.trim(),
      emoji:               form.emoji,
      targetAmount:        parseFloat(form.targetAmount)        || 0,
      savedAmount:         parseFloat(form.savedAmount)         || 0,
      targetDate:          form.targetDate,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      color:               form.color,
    } satisfies GoalInput);
    setShowAdd(false);
  };

  const handleEdit = (form: GoalFormData) => {
    if (!editGoal) return;
    onUpdate(editGoal.id, {
      name:                form.name.trim(),
      emoji:               form.emoji,
      targetAmount:        parseFloat(form.targetAmount)        || 0,
      savedAmount:         parseFloat(form.savedAmount)         || 0,
      targetDate:          form.targetDate,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      color:               form.color,
    });
    setEditGoal(null);
  };

  // Sort: active first (on-track, at-risk, paused), then achieved
  const sorted = [...goals].sort((a, b) => {
    const order: Record<GoalStatus, number> = { 'on-track': 0, 'at-risk': 1, 'paused': 2, 'achieved': 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="view-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }} className="flex items-center gap-2.5">
            <Target size={22} style={{ color: 'var(--teal)' }} />
            Savings Goals
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Track and achieve your financial milestones
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'var(--teal)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && <GoalsSummary stats={stats} currency={currency} />}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#f5f7fa' }}>
            <Target size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>No goals yet</h3>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Create your first savings goal to start tracking</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'var(--teal)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} />
            Create first goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              onContribute={amt => onContribute(g.id, amt)}
              onEdit={() => setEditGoal(g)}
              onDelete={() => onDelete(g.id)}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <GoalModal onSave={handleAdd} onClose={() => setShowAdd(false)} currency={currency} />
      )}

      {/* Edit modal */}
      {editGoal && (
        <GoalModal
          initial={{
            name:                editGoal.name,
            emoji:               editGoal.emoji,
            targetAmount:        String(editGoal.targetAmount),
            savedAmount:         String(editGoal.savedAmount),
            targetDate:          editGoal.targetDate,
            monthlyContribution: String(editGoal.monthlyContribution),
            color:               editGoal.color,
          }}
          onSave={handleEdit}
          onClose={() => setEditGoal(null)}
          currency={currency}
        />
      )}
    </div>
  );
}
