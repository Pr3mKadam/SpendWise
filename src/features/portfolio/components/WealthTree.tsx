import React from 'react';
import { motion } from 'framer-motion';

interface WealthTreeProps {
  score: number; // 0 to 100
  savingsRate: number; // percentage
  role?: string;
}

export function WealthTree({ score, savingsRate, role }: WealthTreeProps) {
  // Tree state: 0-20: Seed, 21-40: Sprout, 41-60: Small Tree, 61-80: Healthy Tree, 81-100: Lush Tree
  const stage =
    score <= 20
      ? 'seed'
      : score <= 40
        ? 'sprout'
        : score <= 60
          ? 'small'
          : score <= 80
            ? 'healthy'
            : 'lush';

  const getScale = () => {
    if (stage === 'seed') return 0.4;
    if (stage === 'sprout') return 0.6;
    if (stage === 'small') return 0.8;
    return 1;
  };

  const getLeaves = () => {
    const leafCount = Math.floor(score / 5);
    return Array.from({ length: leafCount });
  };

  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-end pb-4 bg-gradient-to-b from-transparent to-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--card-border)]">
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          {role === 'student'
            ? 'Study Fund Tree'
            : role === 'business'
              ? 'Capital Growth Tree'
              : 'Wealth Tree'}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
          <span className="text-xs font-bold text-[var(--text-primary)]">
            Level {Math.floor(score / 10)}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: getScale() }}
        className="relative flex flex-col items-center"
      >
        {/* Pot */}
        <div className="w-16 h-10 bg-stone-700 rounded-b-xl border-t-4 border-stone-600 shadow-lg relative z-10" />

        {/* Trunk */}
        <motion.div
          animate={{ height: score > 20 ? (score > 40 ? 60 : 40) : 10 }}
          className="w-3 bg-stone-800 rounded-full absolute bottom-8 z-0"
          style={{ transformOrigin: 'bottom' }}
        />

        {/* Leaves / Canopy */}
        {score > 40 && (
          <div className="absolute bottom-16 flex flex-wrap justify-center w-32 gap-1">
            {getLeaves().map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-4 h-4 rounded-full bg-[var(--teal)] shadow-sm"
                style={{
                  backgroundColor:
                    i % 3 === 0 ? 'var(--teal)' : i % 3 === 1 ? 'var(--green)' : '#0d9488',
                  marginTop: Math.random() * 10 - 5,
                  marginLeft: Math.random() * 10 - 5,
                }}
              />
            ))}
          </div>
        )}

        {/* Floating Sparks if score is high */}
        {score > 80 && (
          <div className="absolute -top-10 flex gap-4">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="w-1 h-1 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.div>

      <div className="mt-4 flex flex-col items-center">
        <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase">
          Growth Score
        </span>
        <span className="text-xl font-manrope font-bold text-[var(--text-primary)]">{score}%</span>
      </div>
    </div>
  );
}
