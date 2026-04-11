import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BriefcaseBusiness, Flame, ChevronRight } from 'lucide-react';
import { CategorySpend } from '../types';
import { professionalInsights, savageInsights, applyTemplate, CATEGORY_ICONS } from '../data/mockData';

interface AICoachProps {
  topCategory:      CategorySpend | null;
  totalSpent:       number;
  categorySpending: CategorySpend[];
  currency?:        string;
}

export default function AICoach({ topCategory, totalSpent, categorySpending, currency = '$' }: AICoachProps) {
  const [isRoastMode, setIsRoastMode] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [isAnimating, setIsAnimating]   = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (animTimer.current) { clearTimeout(animTimer.current); animTimer.current = null; }
  }, []);

  const cycleInsight = useCallback(() => {
    clearTimer();
    setIsAnimating(true);
    animTimer.current = setTimeout(() => { setInsightIndex(p => p + 1); setIsAnimating(false); }, 200);
  }, [clearTimer]);

  useEffect(() => {
    clearTimer();
    setIsAnimating(true);
    animTimer.current = setTimeout(() => { setInsightIndex(0); setIsAnimating(false); }, 200);
    return clearTimer;
  }, [isRoastMode, clearTimer]);

  const insight = useMemo(() => {
    if (!topCategory) return 'Add your first transaction to get personalized AI insights!';
    const pool     = isRoastMode ? savageInsights : professionalInsights;
    const template = pool[insightIndex % pool.length];
    const percent    = totalSpent > 0 ? Math.round((topCategory.value / totalSpent) * 100) : 0;
    return applyTemplate(template, {
      category: topCategory.name, amount: topCategory.value.toFixed(0), percent,
      cap: Math.round(topCategory.value * 0.8), savings: Math.round(topCategory.value * 0.2),
      benchmark: percent > 30 ? 25 : 20, annualized: Math.round(topCategory.value * 12), currency,
    });
  }, [isRoastMode, insightIndex, topCategory, totalSpent, currency]);

  const accentColor = isRoastMode ? 'var(--red)' : 'var(--teal)';
  const accentDim   = isRoastMode ? 'var(--red-dim)' : 'var(--teal-dim)';

  return (
    <div className="card px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex w-8 h-8 items-center justify-center rounded-xl" style={{ background: accentDim }}>
            {isRoastMode ? <Flame size={15} style={{ color: accentColor }} /> : <BriefcaseBusiness size={15} style={{ color: accentColor }} />}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Coach</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {isRoastMode ? '🔥 Savage Mode' : '💡 Professional Mode'}
            </p>
          </div>
        </div>
        <button onClick={cycleInsight} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mode Toggle — Finebank pill toggle */}
      <div className="flex rounded-xl p-1 mb-4" style={{ background: '#f5f7fa' }}>
        <button
          onClick={() => setIsRoastMode(false)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-inter)',
            background: !isRoastMode ? 'var(--surface-card)' : 'transparent',
            color: !isRoastMode ? 'var(--teal)' : 'var(--text-muted)',
            boxShadow: !isRoastMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <BriefcaseBusiness size={13} />
          Professional
        </button>
        <button
          onClick={() => setIsRoastMode(true)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-inter)',
            background: isRoastMode ? 'var(--surface-card)' : 'transparent',
            color: isRoastMode ? 'var(--red)' : 'var(--text-muted)',
            boxShadow: isRoastMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Flame size={13} />
          Savage Mode
        </button>
      </div>

      {/* Insight text */}
      <div
        className="rounded-xl px-4 py-3 mb-4 transition-opacity"
        style={{ background: accentDim, opacity: isAnimating ? 0 : 1, transition: 'opacity 200ms' }}
      >
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {insight}
        </p>
      </div>

      {/* Category progress bars */}
      {categorySpending.length > 0 && (
        <div className="space-y-3">
          {categorySpending.slice(0, 3).map(cat => (
            <div key={cat.name} className="flex items-center gap-3">
              <span style={{ fontSize: '16px' }}>{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.percent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.percent}%`, background: 'var(--teal)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
