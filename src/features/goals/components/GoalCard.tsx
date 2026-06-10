import { useEffect, useState, memo } from 'react';
import { Calendar, DollarSign, Plus, Edit3, Trash2, Coins, Clock, Target } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { ProgressRing } from '@/features/goals/components/ProgressRing';
import { STATUS_CONFIG } from '@/features/goals/components/constants';
import { daysUntil, formatDate } from '@/features/goals/components/utils';
import { ContributeModal } from '@/features/goals/components/ContributeModal';
import confetti from 'canvas-confetti';

const ROUNDUP_KEY = (id: string) => `spendwise_roundup_${id}`;
const MILESTONE_KEY = (id: string) => `spendwise_milestone_${id}`;

export const GoalCard = memo(function GoalCard({
  goal,
  onContribute,
  onEdit,
  onDelete,
  currency,
}: {
  goal: SavingsGoal;
  onContribute: (amount: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  currency: string;
}) {
  const [showContribute, setShowContribute] = useState(false);

  // Persist round-up toggle per goal in localStorage
  const [roundUpsEnabled, setRoundUpsEnabled] = useState(() => {
    try {
      return localStorage.getItem(ROUNDUP_KEY(goal.id)) === 'true';
    } catch {
      return false;
    }
  });

  const toggleRoundUp = () => {
    const next = !roundUpsEnabled;
    setRoundUpsEnabled(next);
    try {
      localStorage.setItem(ROUNDUP_KEY(goal.id), String(next));
    } catch {
      /* ignore */
    }
  };

  const handleContribute = (amount: number) => {
    onContribute(amount);
    if (goal.savedAmount + amount >= goal.targetAmount) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [goal.color, '#2dd4bf', '#3b82f6'],
      });
    }
  };

  // Milestone confetti at 25%, 50%, 75%
  const statusCfg = STATUS_CONFIG[goal.status];
  const StatusIcon = statusCfg.icon;
  const pct =
    goal.targetAmount > 0
      ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
      : 0;

  useEffect(() => {
    if (goal.status === 'achieved') return;
    const fired: number[] = (() => {
      try {
        return JSON.parse(localStorage.getItem(MILESTONE_KEY(goal.id)) || '[]');
      } catch {
        return [];
      }
    })();
    const MILESTONES = [25, 50, 75];
    for (const m of MILESTONES) {
      if (pct >= m && !fired.includes(m)) {
        fired.push(m);
        try {
          localStorage.setItem(MILESTONE_KEY(goal.id), JSON.stringify(fired));
        } catch {
          /* ignore */
        }
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.65 },
          colors: [goal.color, '#f59e0b', '#10b981'],
          scalar: 0.85,
        });
        break; // one at a time
      }
    }
  }, [pct, goal.id, goal.status, goal.color]);

  const days = daysUntil(goal.targetDate);
  const isAchieved = goal.status === 'achieved';

  // Time to completion estimate
  const remaining = goal.targetAmount - goal.savedAmount;
  const monthlyContrib = goal.monthlyContribution || 0;
  const monthsToGo = monthlyContrib > 0 ? Math.ceil(remaining / monthlyContrib) : null;

  // Estimated monthly round-up savings: avg ₹0.40 spare change × ~25 transactions/month
  const estMonthlyRoundUp = 10; // conservative ₹10/mo estimate

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 card card-hover ${isAchieved ? 'opacity-80' : ''}`}
      >
        {/* Colour tint background (§5 GoalCard gradient tint) */}
        <div className="goal-card-tint" style={{ background: goal.color }} aria-hidden="true" />

        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-70"
          style={{ background: `linear-gradient(90deg, ${goal.color}, transparent)` }}
        />

        {isAchieved && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div className="animate-shimmer absolute inset-0 opacity-30" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <ProgressRing percent={pct} color={goal.color} size={72} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg leading-none">{goal.emoji}</span>
                <span
                  className="text-[length:var(--fs-overline)] font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {pct}%
                </span>
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {goal.name}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                }}
              >
                {currency}
                {goal.savedAmount.toLocaleString()} saved of {currency}
                {goal.targetAmount.toLocaleString()}
              </p>
              <span
                className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--fs-overline)] font-semibold"
                style={{
                  background: statusCfg.bg,
                  color: statusCfg.color,
                  fontFamily: 'var(--font-inter)',
                }}
              >
                <StatusIcon size={10} />
                {statusCfg.label}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors bg-[var(--surface-input)] border-none cursor-pointer text-[var(--text-muted)] active:text-[var(--teal)] active:bg-white/5"
              aria-label={`Edit ${goal.name} goal`}
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors bg-red-500/10 border-none cursor-pointer text-red-500 active:bg-red-500/20"
              aria-label={`Delete ${goal.name} goal`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full"
          style={{ background: '#f0f2f5' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>

        {/* Countdown + time estimate row */}
        {!isAchieved && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {days > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--fs-overline)] font-semibold"
                style={{
                  background: days <= 30 ? 'var(--amber-dim)' : 'var(--teal-dim)',
                  color: days <= 30 ? 'var(--amber)' : 'var(--teal)',
                }}
              >
                <Clock size={9} />
                {days}d left
              </span>
            )}
            {monthsToGo !== null && !isAchieved && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--fs-overline)] font-semibold"
                style={{ background: 'rgba(139,92,246,0.08)', color: '#7c3aed' }}
              >
                <Target size={9} />~{monthsToGo} {monthsToGo === 1 ? 'month' : 'months'} to go
              </span>
            )}
          </div>
        )}

        {/* Round-up active indicator */}
        {roundUpsEnabled && !isAchieved && (
          <div
            className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[length:var(--fs-caption)] font-semibold"
            style={{ background: 'rgba(147,51,234,0.08)', color: '#7c3aed' }}
          >
            <Coins size={11} className="animate-pulse" />
            Round-Ups active · ~{currency}
            {estMonthlyRoundUp}/mo added automatically
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {isAchieved
                ? '🎉 Achieved!'
                : days > 0
                  ? `${days}d left`
                  : formatDate(goal.targetDate)}
            </span>
            {goal.monthlyContribution > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {currency}
                {goal.monthlyContribution}/mo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAchieved && (
              <button
                onClick={toggleRoundUp}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                  roundUpsEnabled
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                }`}
                title={
                  roundUpsEnabled
                    ? `Round-Ups ON — auto-saving ~${currency}${estMonthlyRoundUp}/mo`
                    : 'Enable Round-Ups to auto-invest spare change'
                }
              >
                <Coins size={12} className={roundUpsEnabled ? 'text-purple-500' : ''} />
                <span className="hidden sm:inline">Round-Ups</span>
              </button>
            )}

            {!isAchieved && (
              <button
                onClick={() => setShowContribute(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  background: 'var(--teal-dim)',
                  color: 'var(--teal)',
                  border: '1.5px solid var(--teal-glow)',
                  fontFamily: 'var(--font-inter)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={11} />
                Contribute
              </button>
            )}
          </div>
        </div>
      </div>

      {showContribute && (
        <ContributeModal
          goal={goal}
          onContribute={handleContribute}
          onClose={() => setShowContribute(false)}
          currency={currency}
        />
      )}
    </>
  );
});
GoalCard.displayName = 'GoalCard';
