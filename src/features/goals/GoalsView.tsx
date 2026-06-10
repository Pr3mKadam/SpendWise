import { useState, useEffect, useMemo } from 'react';
import { Target, Plus, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SavingsGoal, GoalStatus } from '@/types';
import { GoalModal, GoalFormData } from '@/features/goals/components/GoalModal';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { GoalsSummary } from '@/features/goals/components/GoalsSummary';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { useGamification } from '@/features/gamification/hooks/useGamification';
import { suggestGoals } from '@/features/goals/utils/suggestGoals';

import { useIsMobile } from '@/hooks/useMediaQuery';
import GoalsViewMobile from '@/features/goals/GoalsViewMobile';

interface GoalStats {
  activeCount: number;
  achievedCount: number;
  totalTarget: number;
  totalSaved: number;
  overallPercent: number;
  monthlyCommitted: number;
}

type GoalInput = Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>;

interface GoalsViewProps {
  goals: SavingsGoal[];
  stats: GoalStats;
  onAdd: (data: GoalInput) => void;
  onUpdate: (id: string, data: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  currency?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions?: any[];
}

export default function GoalsView({
  goals,
  stats,
  onAdd,
  onUpdate,
  onDelete,
  onContribute,
  currency = '$',
  transactions = [],
}: GoalsViewProps) {
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
  const [showAdd, setShowAdd] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [hofOpen, setHofOpen] = useState(false);
  const { streak, level } = useGamification(transactions);

  const suggestions = useMemo(() => suggestGoals(transactions, goals), [transactions, goals]);

  useEffect(() => {
    const handleOpenAdd = () => setShowAdd(true);
    window.addEventListener('open-add-goal', handleOpenAdd);
    return () => window.removeEventListener('open-add-goal', handleOpenAdd);
  }, []);

  const handleAdd = (form: GoalFormData) => {
    onAdd({
      name: form.name.trim(),
      emoji: form.emoji,
      targetAmount: parseFloat(form.targetAmount) || 0,
      savedAmount: parseFloat(form.savedAmount) || 0,
      targetDate: form.targetDate,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      color: form.color,
    } satisfies GoalInput);
    setShowAdd(false);
  };

  const handleEdit = (form: GoalFormData) => {
    if (!editGoal) return;
    onUpdate(editGoal.id, {
      name: form.name.trim(),
      emoji: form.emoji,
      targetAmount: parseFloat(form.targetAmount) || 0,
      savedAmount: parseFloat(form.savedAmount) || 0,
      targetDate: form.targetDate,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      color: form.color,
    });
    setEditGoal(null);
  };

  // Sort: active first (on-track, at-risk, paused), then achieved
  const ORDER: Record<GoalStatus, number> = { 'on-track': 0, 'at-risk': 1, paused: 2, achieved: 3 };
  const activeGoals = goals
    .filter(g => g.status !== 'achieved')
    .sort((a, b) => (ORDER[a.status] ?? 0) - (ORDER[b.status] ?? 0));
  const achievedGoals = goals.filter(g => g.status === 'achieved');

  if (isMobile) {
    return (
      <>
        <GoalsViewMobile
          goals={goals}
          stats={stats}
          onAdd={() => setShowAdd(true)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onContribute={onContribute}
          currency={currency}
          transactions={transactions}
          streak={streak}
          level={level}
        />
        {showAdd && (
          <GoalModal onSave={handleAdd} onClose={() => setShowAdd(false)} currency={currency} />
        )}
        {editGoal && (
          <GoalModal
            initial={{
              name: editGoal.name,
              emoji: editGoal.emoji,
              targetAmount: String(editGoal.targetAmount),
              savedAmount: String(editGoal.savedAmount),
              targetDate: editGoal.targetDate,
              monthlyContribution: String(editGoal.monthlyContribution),
              color: editGoal.color,
            }}
            onSave={handleEdit}
            onClose={() => setEditGoal(null)}
            currency={currency}
          />
        )}
      </>
    );
  }

  return (
    <div className="view-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
            className="flex items-center gap-2.5"
          >
            <Target size={22} style={{ color: 'var(--teal)' }} />
            Savings Goals
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            Track and achieve your financial milestones
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{
            background: 'var(--teal)',
            fontFamily: 'var(--font-inter)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && <GoalsSummary stats={stats} currency={currency} />}

      {/* Active Goals grid */}
      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: '#f5f7fa' }}
          >
            <Target size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            No goals yet
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            Create your first savings goal to start tracking
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{
              background: 'var(--teal)',
              fontFamily: 'var(--font-inter)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Create first goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {activeGoals.map(g => (
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

      {/* ── AI-Suggested Goals ── */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <h3
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Suggested for you
            </h3>
          </div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
            {suggestions.map(s => (
              <div
                key={s.title}
                className="card flex flex-col gap-2 p-4"
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.emoji}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {s.title}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--teal)',
                  }}
                >
                  ₹{Math.round(s.targetAmount).toLocaleString('en-IN')}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                  }}
                >
                  {s.reason}
                </p>
                <button
                  onClick={() => {
                    onAdd({
                      name: s.title,
                      emoji: s.emoji,
                      targetAmount: Math.round(s.targetAmount),
                      savedAmount: 0,
                      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                      monthlyContribution: Math.round(s.targetAmount / 12),
                      color: '#14b8a6',
                    });
                  }}
                  className="mt-1 w-full rounded-xl py-2 text-xs font-bold text-white"
                  style={{
                    background: 'var(--teal)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Create this goal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hall of Fame — Achieved Goals ── */}
      {achievedGoals.length > 0 && (
        <div className="mt-4 space-y-3">
          <button
            className="goals-hof-header w-full"
            onClick={() => setHofOpen(o => !o)}
            aria-expanded={hofOpen}
          >
            <Trophy size={16} />
            <span>
              🏆 Hall of Fame — {achievedGoals.length} Goal{achievedGoals.length !== 1 ? 's' : ''}{' '}
              Achieved
            </span>
            <span className="ml-auto">
              {hofOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {hofOpen && (
              <motion.div
                key="hof"
                initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 pt-1">
                  {achievedGoals.map(g => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Achievement Badge Gallery */}
      <div className="mt-2">
        <BadgeGallery
          transactions={transactions}
          streak={streak}
          level={level}
          goals={goals}
          currency={currency}
        />
      </div>

      {/* Add modal */}
      {showAdd && (
        <GoalModal onSave={handleAdd} onClose={() => setShowAdd(false)} currency={currency} />
      )}

      {/* Edit modal */}
      {editGoal && (
        <GoalModal
          initial={{
            name: editGoal.name,
            emoji: editGoal.emoji,
            targetAmount: String(editGoal.targetAmount),
            savedAmount: String(editGoal.savedAmount),
            targetDate: editGoal.targetDate,
            monthlyContribution: String(editGoal.monthlyContribution),
            color: editGoal.color,
          }}
          onSave={handleEdit}
          onClose={() => setEditGoal(null)}
          currency={currency}
        />
      )}
    </div>
  );
}
