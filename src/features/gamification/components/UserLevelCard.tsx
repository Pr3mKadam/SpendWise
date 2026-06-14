import { motion } from 'framer-motion';
import { Trophy, Sparkles, Flame, Award } from 'lucide-react';

interface UserLevelCardProps {
  level: number;
  rank: string;
  currentLevelXP: number;
  xpProgress: number;
  XP_PER_LEVEL: number;
  streak: number;
  totalXPToday: number;
  completedCount: number;
}

export function UserLevelCard({
  level,
  rank,
  currentLevelXP,
  xpProgress,
  XP_PER_LEVEL,
  streak,
  totalXPToday,
  completedCount,
}: UserLevelCardProps) {
  return (
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
          <span className="text-teal-200 text-[length:var(--fs-overline)] font-bold uppercase tracking-wider">
            Level
          </span>
        </motion.div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
              {rank}
            </span>
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
            <div className="h-2.5 bg-[var(--surface-card)]/10 rounded-full overflow-hidden">
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
  );
}

