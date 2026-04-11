import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BriefcaseBusiness, Flame, ChevronRight, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { CategorySpend, MonthlyStats } from '../types';
import { professionalInsights, savageInsights, applyTemplate, CATEGORY_ICONS } from '../data/mockData';
import { generateCoachInsight, type CoachContext } from '../services/ai';

type ProjectionQuality = 'low' | 'medium' | 'high';

interface AICoachProps {
  topCategory:           CategorySpend | null;
  totalSpent:            number;
  categorySpending:      CategorySpend[];
  currency?:             string;
  currentBalance:        number;
  predictedEndOfMonth:   number;
  dailySpendRate:        number;
  monthlyStats:          MonthlyStats;
  projectionMeta:        {
    daysLeftInMonth: number;
    dataQuality:     ProjectionQuality;
  };
}

const HAS_GEMINI = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

export default function AICoach({
  topCategory,
  totalSpent,
  categorySpending,
  currency = '$',
  currentBalance,
  predictedEndOfMonth,
  dailySpendRate,
  monthlyStats,
  projectionMeta,
}: AICoachProps) {
  const [isRoastMode, setIsRoastMode] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [isAnimating, setIsAnimating]   = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [aiInsight, setAiInsight]   = useState<string | null>(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiRefresh, setAiRefresh]   = useState(0);

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

  const topCategoriesForCoach = useMemo(
    () =>
      categorySpending.slice(0, 5).map(c => ({
        name:    c.name,
        amount:  c.value,
        percent: c.percent,
      })),
    [categorySpending],
  );

  useEffect(() => {
    if (!HAS_GEMINI) {
      setAiInsight(null);
      setAiLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setAiLoading(true);
      const fullCtx: CoachContext = {
        currency,
        currentBalance,
        predictedEndOfMonth,
        totalSpentMonth:  monthlyStats.totalExpenses,
        totalIncomeMonth: monthlyStats.totalIncome,
        dailySpendRate,
        daysLeftInMonth:  projectionMeta.daysLeftInMonth,
        dataQuality:      projectionMeta.dataQuality,
        topCategories:    topCategoriesForCoach,
      };
      void generateCoachInsight(fullCtx).then(text => {
        if (cancelled) return;
        setAiInsight(text);
        setAiLoading(false);
      });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    currency,
    currentBalance,
    predictedEndOfMonth,
    dailySpendRate,
    monthlyStats.totalExpenses,
    monthlyStats.totalIncome,
    projectionMeta.daysLeftInMonth,
    projectionMeta.dataQuality,
    topCategoriesForCoach,
    aiRefresh,
  ]);

  const templateInsight = useMemo(() => {
    if (!topCategory) return 'Add your first transaction to get personalized insights!';
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

  const refreshAi = useCallback(() => setAiRefresh(x => x + 1), []);

  return (
    <div className="card px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex w-8 h-8 items-center justify-center rounded-xl" style={{ background: accentDim }}>
            {isRoastMode ? <Flame size={15} style={{ color: accentColor }} /> : <BriefcaseBusiness size={15} style={{ color: accentColor }} />}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Smart Coach</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {HAS_GEMINI ? 'AI insights on your behavior · end-of-month outlook' : 'Tips from your spending mix'}
            </p>
          </div>
        </div>
        <button type="button" onClick={cycleInsight} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }} aria-label="Next tip">
          <ChevronRight size={18} />
        </button>
      </div>

      {HAS_GEMINI && (
        <div
          className="rounded-xl px-4 py-3 mb-4"
          style={{ background: 'var(--teal-dim)', border: '1px solid rgba(20, 184, 166, 0.2)' }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI financial coach
              </span>
            </div>
            <button
              type="button"
              onClick={refreshAi}
              disabled={aiLoading}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold"
              style={{
                fontFamily: 'var(--font-inter)',
                color:      'var(--teal)',
                background: 'rgba(255,255,255,0.6)',
                border:     'none',
                cursor:     aiLoading ? 'wait' : 'pointer',
                opacity:    aiLoading ? 0.7 : 1,
              }}
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Refresh
            </button>
          </div>
          {aiLoading && !aiInsight ? (
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Analyzing your spending pattern…
            </p>
          ) : (
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {aiInsight ?? 'Add a few transactions for richer AI coaching. Quick tips below still apply.'}
            </p>
          )}
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
            Projection uses your month-to-date average daily spend and days left in the month ({projectionMeta.dataQuality} confidence from sample size).
          </p>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex rounded-xl p-1 mb-4" style={{ background: '#f5f7fa' }}>
        <button
          type="button"
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
          type="button"
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
          Savage mode
        </button>
      </div>

      {/* Template insight */}
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
        Quick tip
      </p>
      <div
        className="rounded-xl px-4 py-3 mb-4 transition-opacity"
        style={{ background: accentDim, opacity: isAnimating ? 0 : 1, transition: 'opacity 200ms' }}
      >
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {templateInsight}
        </p>
      </div>

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
