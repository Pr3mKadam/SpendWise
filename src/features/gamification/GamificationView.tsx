import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Target, Award, Flame, Star, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { AppView, Transaction } from '@/types';
import LevelProgress from '@/features/gamification/components/LevelProgress';
import { QuestsPanel } from '@/features/gamification/components/QuestsPanel';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { SavingsChallenges } from '@/features/gamification/components/SavingsChallenges';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
import { UserLevelCard } from '@/features/gamification/components/UserLevelCard';
import { getSpendingPersonality } from '@/features/analytics/insights/advisor';
import EmptyState from '@/components/ui/EmptyState';

type Tab = 'overview' | 'quests' | 'badges' | 'challenges';

interface GamificationViewProps {
  transactions: Transaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals: any[];
  currency?: string;
  onNavigate: (view: AppView) => void;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Star },
  { id: 'quests', label: 'Quests', icon: Sparkles },
  { id: 'badges', label: 'Badges', icon: Award },
  { id: 'challenges', label: 'Challenges', icon: Target },
];

export default function GamificationView({
  transactions,
  goals,
  currency = '₹',
  onNavigate,
}: GamificationViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const level = useStore(s => s.level);
  const rank = useStore(s => s.rank);
  const totalXP = useStore(s => s.totalXP);
  const streak = useStore(s => s.streak);
  const { completedCount, totalXPToday } = useQuestReset();

  const XP_PER_LEVEL = 1000;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const xpProgress = Math.round((currentLevelXP / XP_PER_LEVEL) * 100);

  const personality = useMemo(
    () => getSpendingPersonality(transactions, currency),
    [transactions, currency]
  );

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No data yet"
        subtitle="Record your first transaction to unlock gamification features."
        onAction={() => onNavigate('transactions' as AppView)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero banner ── */}
      <UserLevelCard
        level={level}
        rank={rank}
        currentLevelXP={currentLevelXP}
        xpProgress={xpProgress}
        XP_PER_LEVEL={XP_PER_LEVEL}
        streak={streak}
        totalXPToday={totalXPToday}
        completedCount={completedCount}
      />

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

              {/* Personality Card */}
              <div
                className="card border border-[var(--border)] overflow-hidden"
                style={{ background: 'var(--surface-card)' }}
              >
                <div className="bg-gradient-to-r from-[var(--teal-dim)] to-transparent p-5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{personality.emoji}</span>
                    <div>
                      <p className="text-[length:var(--fs-overline)] text-[var(--teal)] font-bold uppercase tracking-wider">
                        Your Spending Personality
                      </p>
                      <h3 className="font-bold text-lg text-[var(--text-primary)]">
                        {personality.archetype}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                    {personality.description}
                  </p>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame size={16} className="text-orange-500" />
                      <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        7-Day Challenge
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm text-orange-700 dark:text-orange-400">
                      {personality.challenge}
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                      "{personality.tip}"
                    </p>
                  </div>
                </div>
              </div>

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
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {tile.label}
                        </p>
                        <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)]">
                          {tile.sub}
                        </p>
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

          {activeTab === 'challenges' && <SavingsChallenges onNavigate={onNavigate} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
