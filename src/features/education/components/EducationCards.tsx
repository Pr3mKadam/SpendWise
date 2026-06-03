import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EducationTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

const TIPS: EducationTip[] = [
  {
    id: 'rule-72',
    title: 'The Rule of 72',
    summary: 'Estimate how long it takes to double your money.',
    content:
      "Divide 72 by your expected annual rate of return. For example, if you earn 7% interest, your money will double in about 10.3 years (72 / 7). It's a powerful mental model for understanding compound interest.",
    icon: <TrendingUp size={20} />,
    color: 'var(--teal)',
  },
  {
    id: 'emergency-fund',
    title: 'The 3-6 Month Rule',
    summary: 'The foundation of financial security.',
    content:
      'Always aim to keep 3 to 6 months of essential living expenses in a liquid, high-yield savings account. This "Emergency Fund" prevents you from going into debt when life happens.',
    icon: <Shield size={20} />,
    color: 'var(--blue)',
  },
  {
    id: '50-30-20',
    title: 'The 50/30/20 Rule',
    summary: 'A simple framework for budgeting.',
    content:
      'Allocate 50% of your income to Needs (rent, food), 30% to Wants (entertainment, dining out), and 20% to Savings and Debt Repayment. It ensures balance without over-restricting your lifestyle.',
    icon: <Target size={20} />,
    color: 'var(--purple)',
  },
  {
    id: 'lifestyle-creep',
    title: 'Defeat Lifestyle Creep',
    summary: "Why you don't feel richer after a raise.",
    content:
      'Lifestyle inflation occurs when your spending increases alongside your income. The secret? When you get a raise, automate 50% of it directly into savings before you even see it in your checking account.',
    icon: <Zap size={20} />,
    color: 'var(--amber)',
  },
];

export default function EducationCards() {
  const [index, setIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);

  const activeTip = TIPS[index];

  const handleNext = () => setIndex(i => (i + 1) % TIPS.length);
  const handlePrev = () => setIndex(i => (i - 1 + TIPS.length) % TIPS.length);

  return (
    <div className="card overflow-hidden group">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--teal)]" />
          Advisor Insights
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-input)] transition-colors text-[var(--text-muted)]"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[length:var(--fs-overline)] font-bold font-inter text-[var(--text-muted)] uppercase tracking-widest">
            {index + 1} / {TIPS.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-input)] transition-colors text-[var(--text-muted)]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[var(--teal)]/10"
                style={{ background: activeTip.color + '15', color: activeTip.color }}
              >
                {activeTip.icon}
              </div>
              <div>
                <h4 className="font-manrope font-bold text-base text-[var(--text-primary)] mb-1">
                  {activeTip.title}
                </h4>
                <p className="font-inter text-sm text-[var(--text-secondary)] leading-relaxed">
                  {activeTip.summary}
                </p>
              </div>
            </div>

            <div className="bg-[var(--surface-input)] rounded-2xl p-4 border border-[var(--border)]">
              <p className="font-inter text-xs text-[var(--text-muted)] leading-relaxed italic">
                "{activeTip.content}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter font-bold text-xs text-[var(--teal)] border border-[var(--teal)]/20 hover:bg-[var(--teal-dim)] transition-all">
          <Lightbulb size={14} />
          Learn more about {activeTip.title.split(' ')[0]}
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-[var(--surface-input)] relative">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[var(--teal)]"
          initial={{ width: 0 }}
          animate={{ width: `${((index + 1) / TIPS.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
}
