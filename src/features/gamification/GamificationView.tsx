import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Target, Award, Flame, Star, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { AppView, Transaction } from '@/types';
import LevelProgress from '@/features/gamification/components/LevelProgress';
import { QuestsPanel } from '@/features/gamification/components/QuestsPanel';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { SavingsChallenges } from '@/features/gamification/components/SavingsChallenges';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';

type Tab = 'overview' | 'quests' | 'badges' | 'challenges';

interface GamificationViewProps {
  transactions: Transaction[];
  goals: any[];
  currency?: string;
  onNavigate: (view: AppView) => void;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',    icon: Star },
  { id: 'quests',      label: 'Quests',      icon: Sparkles },
  { id: 'badges',      label: 'Badges',      icon: Award },
  { id: 'challenges',  label: 'Challenges',  icon: Target },
];

export default function GamificationView({ transactions, goals, currency = '₹', onNavigate }: GamificationViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const level  = useStore(s => s.level);
  const rank   = useStore(s => s.rank);
  const totalXP = useStore(s => s.totalXP);
  const streak = useStore(s => s.streak);
  const { completedCount, totalXPToday } = useQuestReset();

  const XP_PER_LEVEL   = 1000;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const xpProgress     = Math.round((currentLevelXP / XP_PER_LEVEL) * 100);

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0f172a 100%)',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at 80% 50%, rgba(20,184,166,0.6) 0%, transparent 60%)',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Level badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--teal), #0d9488)',
              boxShadow: '0 0 40px rgba(20,184,166,0.4)',
            }}
          >
            <span className="text-white font-manrope font-black text-3xl leading-none">{level}</span>
            <span className="text-teal-200 text-[length:var(--fs-overline)] font-bold uppercase tracking-wider">Level</span>
          </motion.div>

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-amber-400" />
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">{rank}</span>
            </div>
            <h1
              className="text-white font-manrope font-black text-2xl sm:text-3xl mb-3 leading-tight"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              Finance Quest
            </h1>

            {/* XP bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[length:var(--fs-overline)] font-bold text-teal-300/70 mb-1">
                <span>{currentLevelXP} XP</span>
                <span>{XP_PER_LEVEL} XP needed</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #14b8a6, #2dd4bf, #14b8a6)',
                    backgroundSize: '200% 100%',
                    boxShadow: '0 0 8px rgba(20,184,166,0.6)',
                  }}
                />
              </div>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-orange-400" />
                <span className="text-white/80 text-xs font-bold">{streak}d streak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-teal-300" />
                <span className="text-white/80 text-xs font-bold">+{totalXPToday} XP today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award size={13} className="text-purple-400" />
                <span className="text-white/80 text-xs font-bold">{completedCount} quests done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-2 p-1 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)]">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] px-2.5 rounded-xl text-[var(--fs-caption)] font-bold transition-all"
              style={{
                background: isActive ? 'var(--teal)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <LevelProgress onNavigate={onNavigate} />

              {/* Quick-action tiles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Daily Quests',
                    sub: `${completedCount} done today`,
                    icon: Sparkles,
                    color: '#14b8a6',
                    tab: 'quests' as Tab,
                  },
                  {
                    label: 'Badge Gallery',
                    sub: 'View achievements',
                    icon: Award,
                    color: '#8b5cf6',
                    tab: 'badges' as Tab,
                  },
                  {
                    label: 'Challenges',
                    sub: 'Active this week',
                    icon: Target,
                    color: '#f59e0b',
                    tab: 'challenges' as Tab,
                  },
                  {
                    label: 'Leaderboard',
                    sub: 'Coming soon',
                    icon: Trophy,
                    color: '#ef4444',
                    tab: 'overview' as Tab,
                  },
                ].map(tile => {
                  const Icon = tile.icon;
                  return (
                    <motion.button
                      key={tile.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => tile.tab !== 'overview' && setActiveTab(tile.tab)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-left w-full border border-[var(--border)]"
                      style={{
                        background: 'var(--surface-card)',
                        cursor: tile.tab === 'overview' ? 'default' : 'pointer',
                        border: 'none',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${tile.color}18`, color: tile.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{tile.label}</p>
                        <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)]">{tile.sub}</p>
                      </div>
                      {tile.tab !== 'overview' && (
                        <ChevronRight size={14} className="text-[var(--text-muted)] shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Quests preview */}
              <QuestsPanel transactions={transactions} />
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="space-y-4">
              <QuestsPanel transactions={transactions} />
              <SavingsChallenges onNavigate={onNavigate} />
            </div>
          )}

          {activeTab === 'badges' && (
            <BadgeGallery
              transactions={transactions}
              streak={streak}
              level={level}
              goals={goals}
              currency={currency}
            />
          )}

          {activeTab === 'challenges' && (
            <SavingsChallenges onNavigate={onNavigate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
