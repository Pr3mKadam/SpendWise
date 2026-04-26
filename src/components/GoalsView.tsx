import { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { SavingsGoal, GoalStatus } from '../types';
import { GoalModal, GoalFormData } from './goals/GoalModal';
import { GoalCard } from './goals/GoalCard';
import { GoalsSummary } from './goals/GoalsSummary';

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
