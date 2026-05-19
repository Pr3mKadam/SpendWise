import { Plus, Target } from 'lucide-react';
import Card from '@/ui/Card';
import { AppView } from '@/types';

const TEXT_PRIMARY = '#0f1117';
const TEXT_MUTED = '#9197a6';

interface GoalsSummaryProps {
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    emoji: string;
    color?: string;
  }>;
  onNavigate: (view: AppView) => void;
}

export default function GoalsSummary({ goals, onNavigate }: GoalsSummaryProps) {
  return (
    <Card style={{ padding: 18, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-manrope)' }}>My Goals</p>
        <button
          onClick={() => {
            onNavigate('goals');
            setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-goal')), 150);
          }}
          style={{
            width: 26, height: 26, borderRadius: 8, background: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={14} color="#6366f1" />
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
             <Target size={20} className="text-slate-400" />
          </div>
          <p className="text-[13px] font-bold text-[var(--text-primary)] mb-1">No goals yet</p>
          <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] max-w-[160px]">Create a goal to start saving.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.slice(0, 2).map(g => {
            const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
            return (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div className="flex items-center gap-2 truncate">
                    <span style={{ fontSize: 16 }}>{g.emoji}</span>
                    <span className="text-[12px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{g.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: g.color || '#6366f1' }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: '#f1f3f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: g.color || '#6366f1', borderRadius: 99, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
          {goals.length > 2 && (
            <button
              onClick={() => onNavigate('goals')}
              style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              +{goals.length - 2} more goals →
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
