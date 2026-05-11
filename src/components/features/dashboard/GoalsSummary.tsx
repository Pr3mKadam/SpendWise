import { Plus, Target } from 'lucide-react';
import Card from '../../common/Card';
import { AppView } from '../../../types';

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
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Target size={28} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: TEXT_MUTED }}>No goals yet</p>
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
