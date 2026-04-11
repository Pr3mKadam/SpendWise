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
  bgClass: string;
  textCls: string;
}> = {
  'on-track': { label: 'On Track',  icon: TrendingUp,    color: '#10b981', bgClass: 'bg-emerald-500/10', textCls: 'text-emerald-400' },
  'at-risk':  { label: 'At Risk',   icon: AlertTriangle, color: '#f59e0b', bgClass: 'bg-amber-500/10',   textCls: 'text-amber-400'   },
  'achieved': { label: 'Achieved',  icon: CheckCircle2,  color: '#a855f7', bgClass: 'bg-purple-500/10',  textCls: 'text-purple-400'  },
  'paused':   { label: 'Paused',    icon: PauseCircle,   color: '#64748b', bgClass: 'bg-slate-500/10',   textCls: 'text-slate-400'   },
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
      {/* Track */}
      <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(71,85,105,0.4)" strokeWidth={6} />
      {/* Progress */}
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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-blue-500" />

        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Target className="h-5 w-5 text-emerald-400" />
              {initial ? 'Edit Goal' : 'New Savings Goal'}
            </h3>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-800 hover:text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Emoji + Name row */}
            <div className="flex gap-3">
              {/* Emoji picker */}
              <div className="flex-shrink-0">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Icon</label>
                <div className="flex flex-wrap w-28 gap-1 rounded-xl border border-slate-700/60 bg-slate-800/50 p-1.5">
                  {GOAL_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setForm(p => ({ ...p, emoji: e }))}
                      className={`h-7 w-7 rounded-lg text-sm transition-all hover:bg-slate-700/60 ${form.emoji === e ? 'bg-slate-700 ring-1 ring-emerald-500/50' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Goal Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Emergency Fund"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {errors.name && <p className="mt-1 text-[10px] text-red-400">{errors.name}</p>}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Accent Color</label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Target + Saved amounts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Target ($) *</label>
                <input type="number" min={1} value={form.targetAmount} onChange={set('targetAmount')}
                  placeholder="10000"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {errors.targetAmount && <p className="mt-1 text-[10px] text-red-400">{errors.targetAmount}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Already Saved ($)</label>
                <input type="number" min={0} value={form.savedAmount} onChange={set('savedAmount')}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Target Date + Monthly */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Date *</label>
                <input type="date" value={form.targetDate} onChange={set('targetDate')}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {errors.targetDate && <p className="mt-1 text-[10px] text-red-400">{errors.targetDate}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Monthly ($) *</label>
                <input type="number" min={0} value={form.monthlyContribution} onChange={set('monthlyContribution')}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {errors.monthlyContribution && <p className="mt-1 text-[10px] text-red-400">{errors.monthlyContribution}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-white">
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-emerald-400">
              <Target className="h-4 w-4" />
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
}) {
  const [amount, setAmount] = useState('');
  const remaining = goal.targetAmount - goal.savedAmount;
  const parsed    = parseFloat(amount);
  const isValid   = !isNaN(parsed) && parsed > 0 && parsed <= remaining;

  const quickAmts = [goal.monthlyContribution, 50, 100, 200].filter(a => a > 0 && a <= remaining);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-in-up overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${goal.color}, transparent)` }} />
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{goal.emoji}</span>
            <div>
              <h3 className="text-base font-bold text-white">{goal.name}</h3>
              <p className="text-xs text-slate-500">${remaining.toFixed(0)} remaining to goal</p>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[...new Set(quickAmts)].map(a => (
              <button key={a} onClick={() => setAmount(String(a))}
                className="rounded-full border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400">
                +${a}
              </button>
            ))}
            <button onClick={() => setAmount(String(remaining.toFixed(2)))}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20">
              Full ${remaining.toFixed(0)}
            </button>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">$</span>
            <input
              type="number" min={1} max={remaining} step={0.01}
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 py-2.5 pl-8 pr-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-white">
              Cancel
            </button>
            <button
              onClick={() => { if (isValid) { onContribute(parsed); onClose(); } }}
              disabled={!isValid}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
              <Zap className="h-4 w-4" />
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
      <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5 transition-all duration-200 hover:border-slate-600/50 hover:bg-slate-800/50 ${isAchieved ? 'opacity-80' : ''}`}>
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
              <h3 className="text-base font-bold text-white">{goal.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                ${goal.savedAmount.toLocaleString()} saved of ${goal.targetAmount.toLocaleString()}
              </p>

              {/* Status badge */}
              <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusCfg.bgClass} ${statusCfg.textCls}`}>
                <StatusIcon className="h-2.5 w-2.5" />
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onEdit}
              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-700/50 hover:text-slate-400">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete}
              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-red-500/15 hover:text-red-400">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>

        {/* Footer: target date + monthly + contribute button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {isAchieved ? 'Achieved!' : days > 0 ? `${days}d left` : formatDate(goal.targetDate)}
            </span>
            {goal.monthlyContribution > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${goal.monthlyContribution}/mo
              </span>
            )}
          </div>

          {!isAchieved && (
            <button
              onClick={() => setShowContribute(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-700/40 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <Plus className="h-3 w-3" />
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
}) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: 'Active Goals',      value: String(stats.activeCount),                           color: 'text-emerald-400' },
        { label: 'Achieved',          value: String(stats.achievedCount),                          color: 'text-purple-400'  },
        { label: 'Total Target',      value: `$${stats.totalTarget.toLocaleString()}`,             color: 'text-blue-400'    },
        { label: 'Monthly Committed', value: `$${stats.monthlyCommitted.toLocaleString()}/mo`,    color: 'text-amber-400'   },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-slate-700/40 bg-slate-800/30 px-3 py-3">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-600">{s.label}</p>
          <p className={`text-sm font-bold sm:text-base ${s.color}`}>{s.value}</p>
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
}

export default function GoalsView({ goals, stats, onAdd, onUpdate, onDelete, onContribute }: GoalsViewProps) {
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
          <h1 className="flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
            <Target className="h-6 w-6 text-emerald-400" />
            Savings Goals
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Track and achieve your financial milestones
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && <GoalsSummary stats={stats} />}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60">
            <Target className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-400">No goals yet</h3>
          <p className="mt-1 text-sm text-slate-600">Create your first savings goal to start tracking</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
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
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <GoalModal onSave={handleAdd} onClose={() => setShowAdd(false)} />
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
        />
      )}
    </div>
  );
}
