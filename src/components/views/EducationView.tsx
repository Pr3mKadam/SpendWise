import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Clock, Star, Trophy, Sparkles, Check } from 'lucide-react';
import { useStore } from '@/store';
import { Transaction } from '@/types';
import { SpendWiseConfig } from '@/components/features/onboarding/OnboardingModal';

import { LESSONS, Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/components/features/education/categoryConfig';
import LessonModal from '@/components/features/education/LessonModal';
import LessonCard from '@/components/features/education/LessonCard';


// ─── Lesson Data ─────────────────────────────────────────────────────────────



// ─── Lesson Modal ─────────────────────────────────────────────────────────────



// ─── Lesson Card ─────────────────────────────────────────────────────────────



// ─── Main View ────────────────────────────────────────────────────────────────

export default function EducationView({
  currency,
  financeState,
  addNotification,
  config
}: {
  currency: string;
  financeState: any;
  addNotification?: (notif: any) => void;
  config: SpendWiseConfig | null;
}) {
  const level = useStore(state => state.level);
  const totalXP = useStore(state => state.totalXP);
  const addXP = useStore(state => state.addXP);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sw_completed_lessons') || '[]')); }
    catch { return new Set(); }
  });
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)] as const;

  const activeRole = config?.userRole || 'professional';

  const roleLessons = useMemo(() => {
    return LESSONS.filter(l => !l.roles || l.roles.includes(activeRole));
  }, [activeRole]);

  const filtered = useMemo(() => {
    return roleLessons.filter(l => filter === 'all' || l.category === filter);
  }, [roleLessons, filter]);

  const handleComplete = (lesson: Lesson) => {
    if (completedLessons.has(lesson.id)) return;
    const next = new Set(completedLessons);
    next.add(lesson.id);
    setCompletedLessons(next);
    localStorage.setItem('sw_completed_lessons', JSON.stringify([...next]));
    addXP(lesson.xpReward);

    if (addNotification) {
      addNotification({
        type: 'alert',
        title: `+${lesson.xpReward} XP Earned!`,
        message: `You completed "${lesson.title}". Keep learning to level up!`,
        icon: '🧠',
        severity: 'info',
        link: 'education',
      });
    }
  };

  const completedRoleLessonsCount = useMemo(() => {
    return roleLessons.filter(l => completedLessons.has(l.id)).length;
  }, [roleLessons, completedLessons]);

  const totalXPAvailable = useMemo(() => {
    return roleLessons.reduce((s, l) => s + l.xpReward, 0);
  }, [roleLessons]);

  const earnedXP = useMemo(() => {
    return roleLessons.filter(l => completedLessons.has(l.id)).reduce((s, l) => s + l.xpReward, 0);
  }, [roleLessons, completedLessons]);

  const completionPct = useMemo(() => {
    return roleLessons.length > 0 
      ? Math.round((completedRoleLessonsCount / roleLessons.length) * 100)
      : 0;
  }, [completedRoleLessonsCount, roleLessons]);

  // Personalized insight from spending data
  const transactions: Transaction[] = financeState.transactions;
  const topCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'debit').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Food';
  }, [transactions]);

  return (
    <>
      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            lesson={activeLesson}
            onClose={() => setActiveLesson(null)}
            onComplete={() => { handleComplete(activeLesson); }}
            completed={completedLessons.has(activeLesson.id)}
          />
        )}
      </AnimatePresence>

      <div className="animate-fade-in-up space-y-8 pb-20">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-headline">
              <GraduationCap size={22} style={{ color: 'var(--teal)' }} />
              {config?.userRole === 'student' 
                ? 'Student Learning Path' 
                : config?.userRole === 'business'
                ? 'Business Wealth Academy'
                : 'Financial Education Center'}
            </h2>
            <p className="text-caption mt-1">
              {config?.userRole === 'student' 
                ? `Hey ${config.name}, master the basics of wealth building while you study!`
                : config?.userRole === 'business'
                ? `Hey ${config.name}, scale your business cash flow and optimize taxes!`
                : "Master money concepts. Earn XP. Build wealth."}
            </p>
          </div>
        </div>

        {/* ── Progress Hero ── */}
        <div className="rounded-3xl p-7 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          boxShadow: '0 12px 40px rgba(99,102,241,0.25)',
        }}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap size={140} color="white" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-8 mb-6">
              <div>
                <p className="font-inter text-[length:var(--fs-caption)] font-bold uppercase tracking-widest text-white/60 mb-1">Your Progress</p>
                <p className="font-manrope font-black text-4xl text-white">{completionPct}%</p>
                <p className="font-inter text-sm text-white/60 mt-1">{completedRoleLessonsCount} of {roleLessons.length} lessons</p>
              </div>
              <div className="h-14 w-px bg-white/10 hidden sm:block" />
              <div>
                <p className="font-inter text-[length:var(--fs-caption)] font-bold uppercase tracking-widest text-white/60 mb-1">XP Earned</p>
                <p className="font-manrope font-black text-4xl text-white">{earnedXP.toLocaleString()}</p>
                <p className="font-inter text-sm text-white/60 mt-1">of {totalXPAvailable.toLocaleString()} available</p>
              </div>
              <div className="h-14 w-px bg-white/10 hidden sm:block" />
              <div>
                <p className="font-inter text-[length:var(--fs-caption)] font-bold uppercase tracking-widest text-white/60 mb-1">Current Level</p>
                <p className="font-manrope font-black text-4xl text-white">{level}</p>
                <p className="font-inter text-sm text-white/60 mt-1">Keep learning to level up</p>
              </div>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)' }}
              />
            </div>
          </div>
        </div>

        {/* ── Personalized Tip & Simulation Lab ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border-teal-500/10 flex items-start gap-4 h-full">
            <div className="w-10 h-10 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center shrink-0">
              <Sparkles size={18} style={{ color: 'var(--teal)' }} />
            </div>
            <div>
              <p className="font-manrope font-bold text-sm text-[var(--text-primary)] mb-1">
                Personalized for your spending
              </p>
              <p className="font-inter text-xs text-[var(--text-secondary)] leading-relaxed">
                {config?.userRole === 'student' ? (
                  <>
                    Since you're in the <strong>Student</strong> persona, we've prioritized <strong>Debt Management</strong> and <strong>Budgeting</strong>. 
                    Avoid high-interest credit card debt and build emergency savings early!
                  </>
                ) : config?.userRole === 'business' ? (
                  <>
                    Since you're in the <strong>Business Owner</strong> persona, we've prioritized <strong>Tax Efficiency</strong> and <strong>Cash Flow</strong>. 
                    Master tax-loss harvesting and optimize your working capital!
                  </>
                ) : (
                  <>
                    Your top spending category is <strong>{topCategory}</strong>. We recommend starting with the{' '}
                    <button onClick={() => setActiveLesson(LESSONS.find(l => l.id === 'l1')!)} className="text-[var(--teal)] font-bold underline underline-offset-2 bg-transparent border-none cursor-pointer">
                      50/30/20 Rule
                    </button>{' '}
                    to create a structured budget around it.
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="card p-5 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/10 flex items-start gap-4 h-full cursor-not-allowed opacity-80" title="Unlocks at Level 10">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Trophy size={18} className="text-purple-500" />
            </div>
            <div>
              <div className="flex justify-between items-start mb-1">
                <p className="font-manrope font-bold text-sm text-[var(--text-primary)]">
                  Real-World Simulation Lab
                </p>
                <span className="text-[length:var(--fs-overline)] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full shrink-0 ml-2">Coming Soon</span>
              </div>
              <p className="font-inter text-xs text-[var(--text-secondary)] leading-relaxed mt-2">
                Test your skills in simulated environments like "Buying a Car" or "Market Crash". Earn massive XP for making the right choices under pressure.
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map(cat => {
            const cfg = cat === 'all' ? null : CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter font-bold text-xs whitespace-nowrap transition-all shrink-0"
                style={{
                  background: filter === cat ? (cfg?.color || 'var(--teal)') : 'var(--surface-card)',
                  color: filter === cat ? 'white' : 'var(--text-muted)',
                  border: `1.5px solid ${filter === cat ? 'transparent' : 'var(--border)'}`,
                  cursor: 'pointer',
                  boxShadow: filter === cat ? `0 4px 12px ${cfg?.color || 'var(--teal)'}30` : 'none',
                }}
              >
                {cfg?.icon}
                {cat === 'all' ? 'All Lessons' : cfg?.label}
              </button>
            );
          })}
        </div>

        {/* ── Lessons Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={completedLessons.has(lesson.id)}
              locked={level < lesson.level}
              onClick={() => setActiveLesson(lesson)}
            />
          ))}
        </div>

        {/* ── Completion Banner ── */}
        {completedRoleLessonsCount === roleLessons.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 text-center bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20"
          >
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-manrope font-black text-2xl text-[var(--text-primary)] mb-2">Financial Scholar!</h3>
            <p className="font-inter text-sm text-[var(--text-secondary)]">You've completed all lessons for your active path. Your financial IQ has leveled up significantly.</p>
          </motion.div>
        )}
      </div>
    </>
  );
}
