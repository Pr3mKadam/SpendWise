import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { useStore } from '@/store';

// Mock leaderboard data (in a real app this would come from a backend)
const MOCK_FRIENDS = [
  { name: 'Aditya K.', avatar: '🧑‍💻', level: 12, xp: 12340, streak: 21, savingsRate: 34, badge: '🏆' },
  { name: 'Priya M.',  avatar: '👩‍🎨', level: 9,  xp: 9100,  streak: 14, savingsRate: 28, badge: '🥈' },
  { name: 'Rahul S.',  avatar: '👨‍🔬', level: 7,  xp: 7200,  streak: 7,  savingsRate: 22, badge: '🥉' },
  { name: 'Sneha T.',  avatar: '👩‍🏫', level: 5,  xp: 5050,  streak: 3,  savingsRate: 18, badge: '⭐' },
  { name: 'Karan P.',  avatar: '🧑‍🚀', level: 4,  xp: 4300,  streak: 0,  savingsRate: 12, badge: '🔸' },
];

type SortKey = 'xp' | 'level' | 'streak' | 'savingsRate';

export function SocialLeaderboard() {
  const [sortKey, setSortKey] = React.useState<SortKey>('xp');
  const userLevel = useStore(s => s.level);
  const userXP    = useStore(s => s.totalXP);
  const userRank  = useStore(s => s.rank);
  const userStreak = useStore(s => s.streak);

  const you = { name: 'You', avatar: '😊', level: userLevel, xp: userXP, streak: userStreak, savingsRate: 20, badge: '✨' };

  const allEntries = useMemo(() => {
    const combined = [...MOCK_FRIENDS, you];
    return combined.sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [sortKey, userLevel, userXP, userStreak]);

  const youRank = allEntries.findIndex(e => e.name === 'You') + 1;

  const tabs: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: 'xp',         label: 'XP',      icon: Zap },
    { key: 'level',      label: 'Level',   icon: Star },
    { key: 'streak',     label: 'Streak',  icon: TrendingUp },
    { key: 'savingsRate',label: 'Savings', icon: Trophy },
  ];

  const medalColors = ['#f59e0b', '#94a3b8', '#cd7f32'];

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-sm text-[var(--text-primary)]">Social Leaderboard</h3>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mt-0.5">
              You're ranked #{youRank} of {allEntries.length}
            </p>
          </div>
        </div>
        <span className="text-[length:var(--fs-overline)] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
          {userRank}
        </span>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1.5 mb-4 bg-[var(--surface-input)] p-1 rounded-xl border border-[var(--border)]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSortKey(t.key)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[length:var(--fs-overline)] font-bold transition-all border-none cursor-pointer"
            style={{
              background: sortKey === t.key ? 'var(--teal)' : 'transparent',
              color: sortKey === t.key ? '#fff' : 'var(--text-muted)',
            }}
          >
            <t.icon size={10} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-2">
        {allEntries.map((entry, i) => {
          const isYou = entry.name === 'You';
          const rank = i + 1;
          return (
            <motion.div
              key={entry.name}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isYou ? 'bg-[var(--teal-dim)] border border-[var(--teal)]/30' : 'bg-[var(--surface-input)] border border-[var(--border)]'}`}
            >
              {/* Rank */}
              <div className="w-6 shrink-0 text-center">
                {rank <= 3 ? (
                  <span style={{ fontSize: 16 }}>{['🥇','🥈','🥉'][rank-1]}</span>
                ) : (
                  <span className="text-xs font-bold text-[var(--text-muted)]">#{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg ${isYou ? 'bg-[var(--teal)]/20' : 'bg-[var(--surface-card)]'}`}>
                {entry.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-bold truncate ${isYou ? 'text-[var(--teal)]' : 'text-[var(--text-primary)]'}`}>
                    {entry.name}
                  </p>
                  {isYou && <span className="text-[8px] font-bold bg-[var(--teal)] text-white px-1.5 py-0.5 rounded-full">YOU</span>}
                </div>
                <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter">Lvl {entry.level} · {entry.streak}d streak</p>
              </div>

              {/* Sort value */}
              <div className="text-right shrink-0">
                <p className="font-manrope font-bold text-sm tabular-nums" style={{ color: isYou ? 'var(--teal)' : 'var(--text-primary)' }}>
                  {sortKey === 'xp'          ? `${entry.xp.toLocaleString()} XP`
                  : sortKey === 'level'      ? `L${entry.level}`
                  : sortKey === 'streak'     ? `${entry.streak}d`
                  : `${entry.savingsRate}%`}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] text-center mt-4 font-inter">
        🌐 Connect friends to see real data — demo shows sample leaderboard
      </p>
    </div>
  );
}
