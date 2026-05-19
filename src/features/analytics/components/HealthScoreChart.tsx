/**
 * HealthScoreChart.tsx
 * Line chart showing Financial Health Score over the past N days.
 */
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { useHealthHistory } from '@/features/analytics/hooks/useHealthHistory';

interface Props {
  currentScore: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value as number;
  const color = score >= 80 ? '#14b8a6' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="card px-4 py-3 shadow-lg text-center">
      <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{score}</p>
      <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)]">Health Score</p>
    </div>
  );
}

export function HealthScoreChart({ currentScore }: Props) {
  const rawHistory = useHealthHistory(currentScore);

  const data = useMemo(() => {
    // Always include today
    const today = new Date().toISOString().split('T')[0];
    const hasToday = rawHistory.some(p => p.date === today);
    const history = hasToday
      ? rawHistory
      : [...rawHistory, { date: today, score: currentScore }];

    return history.slice(-30).map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: p.score,
    }));
  }, [rawHistory, currentScore]);

  const scoreColor = currentScore >= 80 ? '#14b8a6' : currentScore >= 60 ? '#f59e0b' : '#ef4444';
  const axisStyle = { fontSize: 11, fill: '#a0aec0', fontFamily: 'var(--font-inter)' };

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${scoreColor}20` }}>
          <ShieldCheck size={18} style={{ color: scoreColor }} />
        </div>
        <div className="flex-1">
          <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Health Score History
          </h3>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Your financial wellness over the last 30 days
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black tabular-nums" style={{ color: scoreColor, fontFamily: 'var(--font-manrope)' }}>
            {currentScore}
          </p>
          <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Today
          </p>
        </div>
      </div>

      {data.length < 2 ? (
        <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">
          Come back tomorrow to see your score trend 📈
        </div>
      ) : (
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} width={32} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={80} stroke="#14b8a6" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={scoreColor}
                strokeWidth={2.5}
                dot={{ fill: scoreColor, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: scoreColor, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
        {[
          { color: '#14b8a6', label: 'Excellent (80+)' },
          { color: '#f59e0b', label: 'Good (60–79)' },
          { color: '#ef4444', label: 'Needs Work (<60)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[length:var(--fs-overline)] font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
