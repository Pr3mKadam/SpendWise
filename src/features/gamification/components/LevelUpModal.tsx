import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, Building2, Landmark, Castle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  rank: string;
}

export default function LevelUpModal({ isOpen, onClose, level, rank }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getRankIcon = () => {
    if (level >= 10) return <Castle size={48} className="text-amber-500" />;
    if (level >= 5) return <Landmark size={48} className="text-blue-500" />;
    return <Building2 size={48} className="text-teal-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[32px] p-8 text-center shadow-2xl border border-white/20 dark:border-gray-800/50 overflow-hidden"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
          >
            {/* Glowing background orbs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />

            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg relative"
              >
                <Trophy size={48} className="text-white" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-3xl bg-amber-400/30 -z-10 blur-md"
                />
              </motion.div>
            </div>

            <div className="mt-12 space-y-2">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-amber-500 font-bold tracking-widest uppercase text-xs"
              >
                New Level Achieved!
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-extrabold text-gray-900 dark:text-white"
              >
                Level {level}
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center gap-3">
                {getRankIcon()}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Promoted to</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{rank}</h3>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Star size={80} className="text-amber-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 space-y-4"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your WealthCity is growing! New infrastructure has been unlocked for your kingdom.
              </p>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-teal-500/20"
              >
                Continue Journey{' '}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
