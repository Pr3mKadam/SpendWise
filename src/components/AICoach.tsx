import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Bot, Flame, BriefcaseBusiness, ChevronRight, Sparkles } from 'lucide-react';
import { CategorySpend } from '../types';
import { professionalInsights, savageInsights, applyTemplate, CATEGORY_ICONS } from '../data/mockData';

interface AICoachProps {
  topCategory:     CategorySpend | null;
  totalSpent:      number;
  categorySpending: CategorySpend[];
}

export default function AICoach({ topCategory, totalSpent, categorySpending }: AICoachProps) {
  const [isRoastMode, setIsRoastMode]   = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [isAnimating, setIsAnimating]   = useState(false);

  // Stable ref-based setTimeout to avoid memory leaks
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnimTimer = useCallback(() => {
    if (animTimer.current) {
      clearTimeout(animTimer.current);
      animTimer.current = null;
    }
  }, []);

  // Animate out → update index → animate in
  const cycleInsight = useCallback(() => {
    clearAnimTimer();
    setIsAnimating(true);
    animTimer.current = setTimeout(() => {
      setInsightIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 280);
  }, [clearAnimTimer]);

  // When mode changes, reset to first insight with animation
  useEffect(() => {
    clearAnimTimer();
    setIsAnimating(true);
    animTimer.current = setTimeout(() => {
      setInsightIndex(0);
      setIsAnimating(false);
    }, 280);
    // Cleanup on unmount or next effect run
    return clearAnimTimer;
  }, [isRoastMode, clearAnimTimer]);

  // Build the insight string using applyTemplate (fixes all {placeholder} replacements)
  const insight = useMemo(() => {
    if (!topCategory) {
      return 'Add your first transaction above to see spending insights here. ✨';
    }

    const pool     = isRoastMode ? savageInsights : professionalInsights;
    const template = pool[insightIndex % pool.length];

    const percent    = totalSpent > 0 ? Math.round((topCategory.value / totalSpent) * 100) : 0;
    const cap        = Math.round(topCategory.value * 0.8);
    const savings    = Math.round(topCategory.value * 0.2);
    const benchmark  = percent > 30 ? 25 : 20;
    const annualized = Math.round(topCategory.value * 12);

    return applyTemplate(template, {
      category:   topCategory.name,
      amount:     topCategory.value.toFixed(0),
      percent:    percent,
      cap:        cap,
      savings:    savings,
      benchmark:  benchmark,
      annualized: annualized,
    });
  }, [isRoastMode, insightIndex, topCategory, totalSpent]);

  const modeIsRoast = isRoastMode;

  return (
    <div
      className="animate-fade-in-up overflow-hidden rounded-2xl border transition-all duration-500"
      style={{
        animationDelay: '0.5s',
        background: modeIsRoast
          ? 'linear-gradient(135deg, rgba(127,29,29,0.35) 0%, rgba(15,23,42,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(6,78,59,0.35) 0%, rgba(15,23,42,0.95) 100%)',
        borderColor: modeIsRoast ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-700/30 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-500 ${
              modeIsRoast ? 'bg-red-500/20' : 'bg-emerald-500/20'
            }`}
          >
            {modeIsRoast ? (
              <Flame className="h-4 w-4 text-red-400" />
            ) : (
              <Bot className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Spending insights</h2>
            <p className="text-[10px] text-slate-500">
              {modeIsRoast ? '🔥 Savage mode' : '💡 From your categories & totals'}
            </p>
          </div>
        </div>

        {/* Next insight button */}
        <button
          onClick={cycleInsight}
          title="Next insight"
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
            modeIsRoast
              ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="px-4 pt-4 sm:px-5">
        <div className="relative flex items-center gap-1 rounded-xl bg-slate-800/50 p-1">
          {/* Sliding pill background */}
          <div
            className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-in-out"
            style={{
              left:       modeIsRoast ? 'calc(50% + 2px)' : '4px',
              background: modeIsRoast
                ? 'rgba(239,68,68,0.2)'
                : 'rgba(16,185,129,0.2)',
            }}
          />

          <button
            onClick={() => setIsRoastMode(false)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
              !modeIsRoast ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Professional
          </button>

          <button
            onClick={() => setIsRoastMode(true)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
              modeIsRoast ? 'text-red-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Savage Mode
          </button>
        </div>
      </div>

      {/* ── Insight Text ── */}
      <div className="px-4 py-4 sm:px-5">
        <div
          className="min-h-[3.5rem] transition-all duration-280"
          style={{
            opacity:   isAnimating ? 0 : 1,
            transform: isAnimating ? 'translateY(6px)' : 'translateY(0)',
          }}
        >
          <div className="flex gap-2">
            <Sparkles
              className={`mt-0.5 h-4 w-4 flex-shrink-0 transition-colors duration-500 ${
                modeIsRoast ? 'text-red-400' : 'text-emerald-400'
              }`}
            />
            <p
              className={`text-sm leading-relaxed ${
                modeIsRoast ? 'text-red-200/85' : 'text-emerald-100/85'
              }`}
            >
              {insight}
            </p>
          </div>
        </div>

        {/* ── Category Pills ── */}
        {categorySpending.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {categorySpending.slice(0, 5).map(cat => (
              <span
                key={cat.name}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: `${cat.color}18`,
                  color:           cat.color,
                  border:          `1px solid ${cat.color}30`,
                }}
              >
                <span>{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]}</span>
                {cat.name}
                <span className="ml-0.5 opacity-70">{cat.percent}%</span>
              </span>
            ))}
          </div>
        )}

        {/* ── Insight counter ── */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {(isRoastMode ? savageInsights : professionalInsights).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  clearAnimTimer();
                  setIsAnimating(true);
                  animTimer.current = setTimeout(() => {
                    setInsightIndex(i);
                    setIsAnimating(false);
                  }, 280);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === insightIndex % (isRoastMode ? savageInsights : professionalInsights).length
                    ? `w-4 ${modeIsRoast ? 'bg-red-400' : 'bg-emerald-400'}`
                    : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-600">
            {(insightIndex % (isRoastMode ? savageInsights : professionalInsights).length) + 1} /{' '}
            {(isRoastMode ? savageInsights : professionalInsights).length}
          </p>
        </div>
      </div>
    </div>
  );
}
