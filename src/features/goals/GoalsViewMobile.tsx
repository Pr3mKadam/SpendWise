import React from 'react';
import { Target, Plus, Award, ChevronRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { haptic } from '@/lib/haptic';

interface GoalsViewMobileProps {
  goals: SavingsGoal[];
  stats: {
    activeCount: number;
    achievedCount: number;
    totalTarget: number;
    totalSaved: number;
    overallPercent: number;
  };
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  currency: string;
  transactions: any[];
  streak: number;
  level: number;
}

export default function GoalsViewMobile({
  goals,
  stats,
  onAdd,
  onUpdate,
  onDelete,
  onContribute,
  currency,
  transactions,
  streak,
  level
}: GoalsViewMobileProps) {
  // Sort: active first, then achieved
  const sorted = [...goals].sort((a, b) => {
    const order = { 'on-track': 0, 'at-risk': 1, 'paused': 2, 'achieved': 3 };
    return (order[a.status as keyof typeof order] ?? 0) - (order[b.status as keyof typeof order] ?? 0);
  });

  return (
    <div className="view-enter space-y-6 pb-20">
      {/* 1. Slim Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Savings</h2>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {stats.activeCount} Active · {stats.achievedCount} Achieved
          </p>
        </div>
        <button 
          onClick={() => { haptic.medium(); onAdd(); }}
          className="w-10 h-10 rounded-2xl bg-[var(--teal)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 2. Visual Progress Summary */}
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase">Overall Progress</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{stats.overallPercent}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase">Total Saved</p>
            <p className="text-sm font-bold text-[var(--teal)]">{currency}{stats.totalSaved.toLocaleString()}</p>
          </div>
        </div>
        <div className="h-2 w-full bg-[var(--surface-input)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--teal)] to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${stats.overallPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Goals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">Your Goals</h3>
        </div>

        {goals.length === 0 ? (
          <div className="bg-[var(--surface-card)] border border-dashed border-[var(--border)] rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-[var(--surface-input)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={28} className="text-[var(--text-muted)]" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">No goals yet</h4>
            <p className="text-xs text-[var(--text-muted)] mb-4">Start your savings journey today!</p>
            <button 
              onClick={onAdd}
              className="px-6 py-2 bg-[var(--teal)] text-white rounded-xl text-xs font-bold"
            >
              Add First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={(amt) => onContribute(goal.id, amt)}
                onEdit={() => {}} // Handle edit in main view
                onDelete={() => onDelete(goal.id)}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Badges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">Achievements</h3>
          <button className="text-[length:var(--fs-overline)] font-bold text-[var(--teal)] uppercase tracking-widest flex items-center gap-1">
            View All <ChevronRight size={10} />
          </button>
        </div>
        <BadgeGallery
          transactions={transactions}
          streak={streak}
          level={level}
          goals={goals}
          currency={currency}
        />
      </div>
    </div>
  );
}
