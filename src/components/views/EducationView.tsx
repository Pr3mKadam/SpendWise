import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, TrendingUp, Shield, Zap, Play, Lock,
  ChevronRight, Star, Clock, Trophy, Sparkles, X, Check
} from 'lucide-react';
import { useStore } from '../../store';
import { Transaction } from '../../types';

// ─── Lesson Data ─────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  summary: string;
  readingTime: number; // minutes
  xpReward: number;
  level: number;  // min level to unlock
  icon: string;
  color: string;
  category: 'budgeting' | 'investing' | 'debt' | 'mindset' | 'advanced';
  body: string[];  // paragraphs
  keyTakeaways: string[];
}

const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'The 50/30/20 Rule',
    summary: 'A simple, battle-tested framework for managing income across needs, wants, and savings.',
    readingTime: 4,
    xpReward: 100,
    level: 1,
    icon: '🧮',
    color: '#14b8a6',
    category: 'budgeting',
    body: [
      'The 50/30/20 rule was popularized by Senator Elizabeth Warren in her book "All Your Worth." It divides your after-tax income into three clear buckets.',
      '50% goes to NEEDS: rent, groceries, utilities, minimum debt payments. These are things you truly cannot live without. If this bucket exceeds 50%, it\'s a signal to find ways to reduce fixed costs.',
      '30% goes to WANTS: dining out, subscriptions, entertainment, hobbies. These bring joy but are discretionary. This is where most overspending occurs.',
      '20% goes to SAVINGS & DEBT REPAYMENT: emergency fund, investments, and paying down debt aggressively beyond minimums. This is your future wealth engine.',
    ],
    keyTakeaways: [
      'Track needs vs wants separately in SpendWise.',
      'A single category review can reveal hidden leakage.',
      'Automate your 20% on payday before you can spend it.',
    ]
  },
  {
    id: 'l2',
    title: 'Compound Interest: The 8th Wonder',
    summary: 'Understand exponential growth and why starting today—not tomorrow—is the most important financial decision.',
    readingTime: 5,
    xpReward: 150,
    level: 1,
    icon: '📈',
    color: '#6366f1',
    category: 'investing',
    body: [
      'Albert Einstein reportedly called compound interest the "eighth wonder of the world." Whether he said it or not, the math is indisputable: small, consistent investments grow into fortunes given enough time.',
      'The formula is: A = P(1 + r/n)^(nt). But what matters is the intuition. Invest ₹10,000 today at 12% annually. In 10 years it becomes ₹31,058. In 30 years? ₹299,599. The growth is not linear—it\'s exponential.',
      'The critical variable is TIME. Starting at 25 vs. 35 can mean the difference of ₹1 crore or more at retirement. Every year you delay is exponentially costly.',
      'Index funds (like Nifty 50) have historically delivered ~12% CAGR. Even simple SIPs in index funds, if started early, will outperform most actively managed portfolios over 20+ years.',
    ],
    keyTakeaways: [
      'Start investing TODAY, even if the amount is small.',
      'Increase SIP by 10% every year as your income grows.',
      'Never withdraw from investments for non-emergencies.',
    ]
  },
  {
    id: 'l3',
    title: 'The Debt Avalanche vs. Snowball',
    summary: 'Two proven strategies for eliminating debt. One optimizes for math, the other for psychology.',
    readingTime: 3,
    xpReward: 100,
    level: 1,
    icon: '⛰️',
    color: '#ef4444',
    category: 'debt',
    body: [
      'If you have multiple debts, you need a strategy. Two methods dominate personal finance advice: Avalanche and Snowball. Both work. The difference is what drives them.',
      'The Avalanche Method: Order your debts by interest rate from highest to lowest. Pay minimums on all debts, then throw every extra rupee at the highest-rate debt. Mathematically optimal—you pay less interest overall.',
      'The Snowball Method: Order debts by balance from smallest to largest. Pay off the smallest first, then "roll" that freed-up payment into the next. Psychologically powerful—quick wins keep you motivated.',
      'Research shows most people achieve better long-term outcomes with Snowball because they actually stick to it. The "best" plan is the one you follow consistently.',
    ],
    keyTakeaways: [
      'Use the Debt Lab in Portfolio → Debt Lab to simulate both.',
      'Either method works if followed consistently.',
      'Hybrid: use snowball for motivation until you get momentum.',
    ]
  },
  {
    id: 'l4',
    title: 'Emergency Fund: Your Financial Immune System',
    summary: 'Why 3-6 months of expenses in liquid savings is the single most important financial safety net.',
    readingTime: 4,
    xpReward: 120,
    level: 2,
    icon: '🛡️',
    color: '#f59e0b',
    category: 'mindset',
    body: [
      'An emergency fund is cash—not investments—set aside exclusively for genuine emergencies: job loss, medical events, urgent repairs. It is the foundation on which all other financial planning is built.',
      'Without an emergency fund, any unexpected expense forces you to use credit cards (high interest) or break investments (compounding penalty). This creates a debt spiral that can set you back years.',
      'The standard target is 3-6 months of ESSENTIAL expenses (not income). If you have variable income, high job insecurity, or dependents, aim for 9-12 months.',
      'Keep the emergency fund in a high-yield savings account or liquid mutual fund. Not in stocks, not in crypto, not in FDs you can\'t break instantly.',
    ],
    keyTakeaways: [
      'Calculate your monthly essential expenses first.',
      'Build it before you start investing aggressively.',
      'Never use it for planned expenses—that\'s what budgeting is for.',
    ]
  },
  {
    id: 'l5',
    title: 'Tax-Loss Harvesting',
    summary: 'An advanced strategy where you sell losing positions to offset taxable gains, lowering your tax bill.',
    readingTime: 6,
    xpReward: 200,
    level: 5,
    icon: '🏦',
    color: '#8b5cf6',
    category: 'advanced',
    body: [
      'Tax-loss harvesting (TLH) is the practice of selling investments at a loss to offset capital gains taxes owed on other investments that have appreciated.',
      'In India, Short-Term Capital Gains (STCG) on equity are taxed at 15%, and Long-Term Capital Gains (LTCG) above ₹1L are taxed at 10%. By strategically booking losses, you can neutralize these taxes.',
      'Example: You have ₹1L profit from selling stocks. You also have a mutual fund down ₹40,000. Selling the MF and re-buying it (after 30+ days to avoid wash-sale equivalents) crystallizes the ₹40,000 loss, reducing your taxable gain to ₹60,000.',
      'Important: In India, there is no formal wash-sale rule (unlike the US), but SEBI and IT departments increasingly scrutinize quick re-purchase strategies. Consult a chartered accountant before implementing TLH at scale.',
    ],
    keyTakeaways: [
      'Review your portfolio before March 31 each financial year.',
      'Prioritize harvesting STCL as it offsets higher-taxed STCG.',
      'Keep detailed records of all transactions for ITR filing.',
    ]
  },
  {
    id: 'l6',
    title: 'The Psychology of Spending',
    summary: 'Why smart people make irrational money decisions—and cognitive biases that cost you thousands.',
    readingTime: 5,
    xpReward: 130,
    level: 2,
    icon: '🧠',
    color: '#ec4899',
    category: 'mindset',
    body: [
      'Personal finance is 20% math and 80% behavior. Understanding why you spend the way you do is more valuable than any budgeting spreadsheet.',
      'Present Bias: Humans systematically prefer smaller, sooner rewards over larger, later ones. This is why we choose ₹500 today over ₹5,000 in 10 years. Most impulse purchases are driven by present bias.',
      'The Latte Factor: Coined by David Bach, it describes how small, recurring purchases (coffee, snacks, streaming services) add up to enormous sums over time. ₹150/day on coffee = ₹54,750/year = ₹5.4L over 10 years.',
      'Loss Aversion: Losses feel roughly 2.5x more painful than equivalent gains feel pleasurable. This drives risk-avoidance in investing and anchoring to purchase prices when selling assets.',
      'The solution is not willpower—it\'s systems. Automate savings, use friction (waiting periods) for big purchases, and track everything (which is exactly what SpendWise is built for).',
    ],
    keyTakeaways: [
      'Implement a 48-hour rule for any unplanned purchase over ₹2,000.',
      'Set up automatic SIPs to bypass present bias entirely.',
      'Use your SpendWise category data to spot behavioral patterns.',
    ]
  },
  {
    id: 'l7',
    title: 'Systematic Investment Plan (SIP)',
    summary: 'The power of rupee cost averaging and disciplined investing.',
    readingTime: 4,
    xpReward: 150,
    level: 3,
    icon: '🔄',
    color: '#3b82f6',
    category: 'investing',
    body: [
      'A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly (e.g., monthly) in a mutual fund. It removes the need to time the market.',
      'Rupee Cost Averaging: By investing a fixed amount, you buy more units when the market is low and fewer units when it is high. Over time, this averages out your cost of investment.',
      'Power of Compounding: Just like compound interest, SIPs benefit from returns on your returns. The longer you stay invested, the more pronounced this effect becomes.',
      'Discipline: SIPs automate your investing, ensuring you pay yourself first before spending on wants.'
    ],
    keyTakeaways: [
      'Start an SIP as early as possible.',
      'Automate your SIP deduction right after salary day.',
      'Do not stop your SIP during market downturns.'
    ]
  },
  {
    id: 'l8',
    title: 'Term Insurance Essentials',
    summary: 'Why term insurance is the only life insurance you actually need.',
    readingTime: 5,
    xpReward: 120,
    level: 2,
    icon: '☂️',
    color: '#0ea5e9',
    category: 'mindset',
    body: [
      'Term insurance provides life cover for a specified term. If the insured passes away during this period, the nominee receives the sum assured. It is pure protection—no investment component.',
      'Why not Endowment or ULIPs? Investment-linked insurance policies mix insurance with investment, offering poor returns (usually 4-6%) and high mortality charges. Keep your insurance and investments separate.',
      'Coverage Amount: A general rule of thumb is 15-20 times your annual income, plus any outstanding debt like home loans.',
      'Buy Early: Premiums are locked in based on your age at the time of purchase. Buying at 25 instead of 35 can save you lakhs in premiums over the policy term.'
    ],
    keyTakeaways: [
      'Buy term insurance if you have financial dependents.',
      'Opt for regular pay until your retirement age.',
      'Do not mix insurance and investment.'
    ]
  },
  {
    id: 'l9',
    title: 'Tax Saving with ELSS',
    summary: 'Save tax under Section 80C while building equity wealth.',
    readingTime: 5,
    xpReward: 180,
    level: 4,
    icon: '🧾',
    color: '#10b981',
    category: 'investing',
    body: [
      'Equity Linked Savings Scheme (ELSS) is a mutual fund category that qualifies for tax deduction up to ₹1.5 Lakh under Section 80C of the Income Tax Act.',
      'Lock-in Period: ELSS funds have a mandatory lock-in period of 3 years—the shortest among all 80C options (PPF is 15 years, FD is 5 years).',
      'Growth Potential: Since ELSS invests primarily in equity, it offers higher potential returns compared to traditional fixed-income tax savers, beating inflation over the long term.',
      'SIP over Lumpsum: It is best to invest in ELSS via SIP to benefit from rupee cost averaging instead of a last-minute rush in March.'
    ],
    keyTakeaways: [
      'ELSS is an excellent tax-saving tool for young professionals.',
      'The 3-year lock-in applies to each individual SIP installment.',
      'Don\'t just look at the tax savings; treat it as a long-term investment.'
    ]
  },
  {
    id: 'l10',
    title: 'National Pension System (NPS)',
    summary: 'Secure your retirement and get additional tax benefits.',
    readingTime: 6,
    xpReward: 150,
    level: 4,
    icon: '👴',
    color: '#6366f1',
    category: 'advanced',
    body: [
      'NPS is a voluntary retirement savings scheme backed by the Government of India. It offers a mix of equity, corporate bonds, and government securities.',
      'Tax Benefits: Contributions up to ₹1.5L are covered under 80C. More importantly, an additional ₹50,000 deduction is available under Section 80CCD(1B), bringing the total possible deduction to ₹2 Lakhs.',
      'Low Cost: NPS has some of the lowest fund management charges globally (0.01%), meaning more of your money grows for you.',
      'Withdrawal Rules: At age 60, you can withdraw up to 60% of the corpus tax-free. The remaining 40% must be used to purchase an annuity to provide a regular pension.'
    ],
    keyTakeaways: [
      'Use NPS to claim the extra ₹50k tax deduction.',
      'Opt for the Active Choice and maximize your equity exposure (up to 75%) if you are young.',
      'Remember, the primary goal of NPS is a locked-in retirement corpus.'
    ]
  },
  {
    id: 'l11',
    title: 'The F&O Trap',
    summary: 'Why 90% of retail traders lose money in Futures & Options.',
    readingTime: 4,
    xpReward: 250,
    level: 5,
    icon: '⚠️',
    color: '#ef4444',
    category: 'mindset',
    body: [
      'Futures and Options (F&O) are derivative instruments designed for hedging risk, not for gambling. However, retail participation has surged due to the illusion of quick wealth.',
      'The Reality: According to SEBI, 9 out of 10 individual traders in the equity F&O segment incurred net losses. The average loss was over ₹1.1 Lakh.',
      'Leverage is a Double-Edged Sword: F&O allows you to control large positions with little capital. While gains are magnified, losses are equally magnified, capable of wiping out your entire capital in minutes.',
      'Transaction Costs: Frequent trading racks up massive brokerage fees, STT, exchange charges, and GST. Even if you break even on trades, fees can turn you into a net loser.'
    ],
    keyTakeaways: [
      'Avoid F&O trading entirely if you are building long-term wealth.',
      'Invest time in your career and passive index funds instead.',
      'If you must trade, treat it as entertainment money, not an investment.'
    ]
  }
];

const CATEGORY_CONFIG = {
  budgeting: { label: 'Budgeting', icon: <BookOpen size={14} />, color: '#14b8a6' },
  investing: { label: 'Investing', icon: <TrendingUp size={14} />, color: '#6366f1' },
  debt: { label: 'Debt', icon: <Shield size={14} />, color: '#ef4444' },
  mindset: { label: 'Mindset', icon: <Sparkles size={14} />, color: '#ec4899' },
  advanced: { label: 'Advanced', icon: <Zap size={14} />, color: '#8b5cf6' },
};

// ─── Lesson Modal ─────────────────────────────────────────────────────────────

function LessonModal({ lesson, onClose, onComplete, completed }: {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  completed: boolean;
}) {
  const [currentPara, setCurrentPara] = useState(() => {
    const saved = localStorage.getItem(`sw_lesson_progress_${lesson.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleNextPara = () => {
    if (currentPara < lesson.body.length - 1) {
      const next = currentPara + 1;
      setCurrentPara(next);
      localStorage.setItem(`sw_lesson_progress_${lesson.id}`, next.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: 'var(--surface-card)', boxShadow: '0 40px 120px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-start gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: lesson.color + '15' }}>
            {lesson.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: lesson.color + '15', color: lesson.color }}>
                {CATEGORY_CONFIG[lesson.category].label}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Clock size={10} /> {lesson.readingTime} min read
              </span>
            </div>
            <h3 className="font-manrope font-black text-xl text-[var(--text-primary)] leading-tight">{lesson.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-xs text-amber-500">
              <Star size={12} className="fill-amber-500" /> +{lesson.xpReward} XP
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'var(--surface-input)', border: 'none', cursor: 'pointer' }}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {lesson.body.slice(0, currentPara + 1).map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === currentPara ? 0.08 : 0 }}
              className="font-inter text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              {para}
            </motion.p>
          ))}

          {currentPara < lesson.body.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNextPara}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all text-white mt-4"
              style={{ background: lesson.color, border: 'none', cursor: 'pointer' }}
            >
              Continue Reading
            </motion.button>
          )}

          {currentPara === lesson.body.length - 1 && (
            <div className="rounded-2xl p-5 mt-4" style={{ background: lesson.color + '0A', border: `1px solid ${lesson.color}20` }}>
              <p className="font-inter font-bold text-xs uppercase tracking-wider mb-3" style={{ color: lesson.color }}>Key Takeaways</p>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: lesson.color }} />
                    <span className="font-inter text-sm text-[var(--text-primary)]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <p className="text-xs text-[var(--text-muted)]">Reading boosts your financial intelligence score</p>
          {completed ? (
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--teal)]">
              <Trophy size={16} /> Completed!
            </div>
          ) : currentPara === lesson.body.length - 1 ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: lesson.color, border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${lesson.color}40` }}
            >
              <Star size={14} /> Claim +{lesson.xpReward} XP
            </button>
          ) : (
            <div className="text-xs font-bold text-[var(--text-muted)]">
              {Math.round(((currentPara + 1) / lesson.body.length) * 100)}% Read
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Lesson Card ─────────────────────────────────────────────────────────────

function LessonCard({ lesson, completed, locked, onClick }: {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  const cfg = CATEGORY_CONFIG[lesson.category];
  const savedProgress = localStorage.getItem(`sw_lesson_progress_${lesson.id}`);
  const currentPara = savedProgress ? parseInt(savedProgress, 10) : 0;
  const progress = Math.round(((currentPara) / (lesson.body.length - 1)) * 100);

  return (
    <motion.div
      whileHover={!locked ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={!locked ? onClick : undefined}
      className={`relative rounded-2xl p-5 transition-all ${locked ? 'opacity-50' : 'cursor-pointer'} overflow-hidden group`}
      style={{
        background: 'var(--surface-card)',
        border: `1.5px solid ${completed ? lesson.color + '40' : 'var(--border)'}`,
        boxShadow: completed ? `0 4px 20px ${lesson.color}15` : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Progress Bar (if started but not completed) */}
      {!completed && !locked && progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--surface-input)]">
          <div className="h-full" style={{ width: `${progress}%`, background: lesson.color }} />
        </div>
      )}

      {/* Completion glow */}
      {completed && <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${lesson.color}, transparent 70%)` }} />}

      {/* Locked overlay */}
      {locked && (
        <div className="absolute top-4 right-4">
          <Lock size={14} style={{ color: 'var(--text-dim)' }} />
        </div>
      )}

      {/* Completed badge */}
      {completed && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: lesson.color }}>
          <Check size={12} className="text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110" style={{ background: lesson.color + '12' }}>
          {lesson.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: lesson.color + '12', color: lesson.color }}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-[9px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={9} /> {lesson.readingTime}m
            </span>
            <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
              <Star size={9} className="fill-amber-500" /> +{lesson.xpReward} XP
            </span>
          </div>
          <h4 className="font-manrope font-bold text-[15px] text-[var(--text-primary)] leading-snug">{lesson.title}</h4>
          <p className="font-inter text-[12px] text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">{lesson.summary}</p>
          {lesson.level > 1 && (
            <p className="text-[10px] font-bold text-[var(--text-dim)] mt-2">Unlocks at Level {lesson.level}</p>
          )}
        </div>
        {!locked && (
          <ChevronRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
    </motion.div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function EducationView({
  currency,
  financeState,
  addNotification
}: {
  currency: string;
  financeState: any;
  addNotification?: (notif: any) => void;
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

  const filtered = useMemo(() => {
    return LESSONS.filter(l => filter === 'all' || l.category === filter);
  }, [filter]);

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

  const totalXPAvailable = LESSONS.reduce((s, l) => s + l.xpReward, 0);
  const earnedXP = LESSONS.filter(l => completedLessons.has(l.id)).reduce((s, l) => s + l.xpReward, 0);
  const completionPct = Math.round((completedLessons.size / LESSONS.length) * 100);

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
              Financial Education Center
            </h2>
            <p className="text-caption mt-1">Master money concepts. Earn XP. Build wealth.</p>
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
                <p className="font-inter text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Your Progress</p>
                <p className="font-manrope font-black text-4xl text-white">{completionPct}%</p>
                <p className="font-inter text-sm text-white/60 mt-1">{completedLessons.size} of {LESSONS.length} lessons</p>
              </div>
              <div className="h-14 w-px bg-white/10 hidden sm:block" />
              <div>
                <p className="font-inter text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">XP Earned</p>
                <p className="font-manrope font-black text-4xl text-white">{earnedXP.toLocaleString()}</p>
                <p className="font-inter text-sm text-white/60 mt-1">of {totalXPAvailable.toLocaleString()} available</p>
              </div>
              <div className="h-14 w-px bg-white/10 hidden sm:block" />
              <div>
                <p className="font-inter text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Current Level</p>
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

        {/* ── Personalized Tip ── */}
        <div className="card p-5 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border-teal-500/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center shrink-0">
            <Sparkles size={18} style={{ color: 'var(--teal)' }} />
          </div>
          <div>
            <p className="font-manrope font-bold text-sm text-[var(--text-primary)] mb-1">
              Personalized for your spending
            </p>
            <p className="font-inter text-xs text-[var(--text-secondary)] leading-relaxed">
              Your top spending category is <strong>{topCategory}</strong>. We recommend starting with the{' '}
              <button onClick={() => setActiveLesson(LESSONS.find(l => l.id === 'l1')!)} className="text-[var(--teal)] font-bold underline underline-offset-2 bg-transparent border-none cursor-pointer">
                50/30/20 Rule
              </button>{' '}
              to create a structured budget around it.
            </p>
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
        {completedLessons.size === LESSONS.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 text-center bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20"
          >
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-manrope font-black text-2xl text-[var(--text-primary)] mb-2">Financial Scholar!</h3>
            <p className="font-inter text-sm text-[var(--text-secondary)]">You've completed all lessons. Your financial IQ has leveled up significantly.</p>
          </motion.div>
        )}
      </div>
    </>
  );
}
