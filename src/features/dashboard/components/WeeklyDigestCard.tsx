import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface WeeklyDigestCardProps {
  transactions: Transaction[];
  currency?: string;
}

interface Insight {
  id: string;
  type: 'alert' | 'positive' | 'neutral' | 'tip';
  title: string;
  description: string;
  metric?: string;
  badge?: string;
  icon: any;
  color: string;
}

export function WeeklyDigestCard({ transactions, currency = '₹' }: WeeklyDigestCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    if (!transactions.length) return [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const tWeekStr = formatLocalYYYYMMDD(oneWeekAgo);
    const prevWeekStr = formatLocalYYYYMMDD(twoWeeksAgo);

    // ─── 1. Category surges & totals ──────────────────────────────────────────
    let thisWeekSpent = 0;
    let prevWeekSpent = 0;
    const catThisWeek: Record<string, number> = {};
    const catPrevWeek: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type !== 'debit') return;
      if (tx.date >= tWeekStr) {
        thisWeekSpent += tx.amount;
        catThisWeek[tx.category] = (catThisWeek[tx.category] || 0) + tx.amount;
      } else if (tx.date >= prevWeekStr && tx.date < tWeekStr) {
        prevWeekSpent += tx.amount;
        catPrevWeek[tx.category] = (catPrevWeek[tx.category] || 0) + tx.amount;
      }
    });

    // Insight A: General spend trend comparison
    if (thisWeekSpent > 0 && prevWeekSpent > 0) {
      const pct = ((thisWeekSpent - prevWeekSpent) / prevWeekSpent) * 100;
      if (pct < -5) {
        list.push({
          id: 'spend_down',
          type: 'positive',
          title: 'Significant Spending Reduction',
          description: `Your spending this week decreased by ${Math.abs(pct).toFixed(0)}% compared to last week! Your financial health is improving strongly.`,
          metric: `${currency}${(prevWeekSpent - thisWeekSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Saved`,
          icon: Award,
          color: 'var(--teal)',
        });
      } else if (pct > 10) {
        list.push({
          id: 'spend_up',
          type: 'alert',
          title: 'Spike in Weekly Spending',
          description: `Your spending this week is ${pct.toFixed(0)}% higher than last week. Let's review if there was any impulsive spending.`,
          metric: `+${currency}${(thisWeekSpent - prevWeekSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          icon: AlertTriangle,
          color: 'var(--red)',
        });
      }
    }

    // Insight B: Top category surge
    Object.entries(catThisWeek).forEach(([cat, val]) => {
      const prevVal = catPrevWeek[cat] || 0;
      if (prevVal > 0 && val > prevVal * 1.3) {
        const diff = val - prevVal;
        list.push({
          id: `surge_${cat}`,
          type: 'tip',
          title: `Surge in ${cat} Spending`,
          description: `You spent ${currency}${diff.toLocaleString('en-IN', { maximumFractionDigits: 0 })} more on ${cat} than last week. Consider setting a budget limit for it.`,
          badge: 'Budget Warning',
          icon: TrendingUp,
          color: 'var(--amber)',
        });
      }
    });

    // ─── 2. Weekend Spike analysis ────────────────────────────────────────────
    let weekendSpent = 0;
    let weekdaySpent = 0;
    transactions.forEach((tx) => {
      if (tx.type !== 'debit' || tx.date < tWeekStr) return;
      const day = new Date(tx.date).getDay();
      if (day === 0 || day === 6) {
        weekendSpent += tx.amount;
      } else {
        weekdaySpent += tx.amount;
      }
    });

    const totalSpent = weekendSpent + weekdaySpent;
    if (totalSpent > 100 && weekendSpent > totalSpent * 0.45) {
      list.push({
        id: 'weekend_spike',
        type: 'alert',
        title: 'Weekend Spending Spike',
        description: `You spent ${((weekendSpent / totalSpent) * 100).toFixed(0)}% of your weekly budget on the weekend. Stay mindful when going out.`,
        metric: `${currency}${weekendSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Spent`,
        icon: Zap,
        color: '#8b5cf6',
      });
    }

    // ─── 3. No-Spend Streak analysis ──────────────────────────────────────────
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return formatLocalYYYYMMDD(d);
    }).reverse();

    const spendPerDay = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.type === 'debit') {
        spendPerDay.set(tx.date, (spendPerDay.get(tx.date) || 0) + tx.amount);
      }
    });

    let currentStreak = 0;
    let maxStreak = 0;
    last14Days.forEach((dayStr) => {
      const spent = spendPerDay.get(dayStr) || 0;
      if (spent === 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    if (maxStreak >= 2) {
      list.push({
        id: 'no_spend_streak',
        type: 'positive',
        title: 'No-Spend Streak Achieved',
        description: `Over the past 14 days, you achieved a fantastic record of ${maxStreak} consecutive zero-spending days! Keep up the momentum.`,
        badge: 'Building Wealth',
        icon: Flame,
        color: '#f59e0b',
      });
    }

    // ─── 4. Default Smart Tips if empty ───────────────────────────────────────
    if (list.length === 0) {
      list.push({
        id: 'default_tip',
        type: 'neutral',
        title: 'Preparing Financial Insights',
        description: 'SpendWise is analyzing your spending trends. Keep tracking your transactions to unlock highly personalized financial insights!',
        icon: Sparkles,
        color: 'var(--teal)',
      });
    }

    return list;
  }, [transactions, currency]);

  if (!insights.length) return null;

  const currentInsight = insights[currentIndex % insights.length];
  const Icon = currentInsight.icon;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <div
      className="card relative overflow-hidden p-5 flex gap-4 items-start select-none"
      style={{
        border: '1.5px solid var(--border)',
        borderLeft: `4px solid ${currentInsight.color}`,
        minHeight: '120px',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500"
        style={{ background: `${currentInsight.color}15` }}
      >
        <Icon size={18} style={{ color: currentInsight.color }} />
      </div>

      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 800,
              color: currentInsight.color,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Smart Insight
          </span>
          {insights.length > 1 && (
            <span
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {currentIndex + 1} of {insights.length}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {currentInsight.title}
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '12.5px',
                color: 'var(--text-muted)',
                marginTop: '3px',
                lineHeight: 1.4,
              }}
            >
              {currentInsight.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Metric Display */}
        {(currentInsight.metric || currentInsight.badge) && (
          <div className="mt-3 flex items-center gap-2">
            {currentInsight.metric && (
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: currentInsight.color,
                  background: `${currentInsight.color}10`,
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                {currentInsight.metric}
              </span>
            )}
            {currentInsight.badge && (
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'var(--surface-input)',
                  padding: '3.5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                }}
              >
                {currentInsight.badge}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {insights.length > 1 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button
            onClick={handlePrev}
            className="p-1 rounded-lg hover:bg-[var(--surface-input)] active:scale-90 border-none bg-transparent cursor-pointer text-[var(--text-muted)]"
            aria-label="Previous insight"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-lg hover:bg-[var(--surface-input)] active:scale-90 border-none bg-transparent cursor-pointer text-[var(--text-muted)]"
            aria-label="Next insight"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
