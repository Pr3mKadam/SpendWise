import { useState } from 'react';
import { Calendar, DollarSign, Plus, Edit3, Trash2 } from 'lucide-react';
import { SavingsGoal } from '../../../types';
import { ProgressRing } from './ProgressRing';
import { STATUS_CONFIG } from './constants';
import { daysUntil, formatDate } from './utils';
import { ContributeModal } from './ContributeModal';

export function GoalCard({
  goal,
  onContribute,
  onEdit,
  onDelete,
  currency,
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
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-70"
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

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: '#f0f2f5' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>

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
