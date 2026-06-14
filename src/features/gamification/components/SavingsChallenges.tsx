import React from 'react';
import { Target, Zap, Coffee, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: React.ReactNode;
  progress: number;
  color: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SavingsChallenges({ onNavigate }: { onNavigate?: (view: any) => void }) {
  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'No Dining Out Week',
      description: 'Avoid restaurants and cafes for 7 days.',
      reward: '+50 XP',
      icon: <Utensils size={18} />,
      progress: 65,
      color: 'var(--teal)',
    },
    {
      id: '2',
      title: 'Subscription Audit',
      description: 'Cancel one unused subscription.',
      reward: 'Badge: Smart Saver',
      icon: <Zap size={18} />,
      progress: 0,
      color: '#8b5cf6',
    },
    {
      id: '3',
      title: 'Caffeine Break',
      description: 'Limit coffee spending to ₹200 this week.',
      reward: '+20 XP',
      icon: <Coffee size={18} />,
      progress: 90,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-[var(--teal)]" />
          <h3 className="font-manrope font-bold text-[var(--text-primary)] text-sm">
            Savings Challenges
          </h3>
        </div>
        <button
          onClick={() => onNavigate?.('goals')}
          className="text-[length:var(--fs-overline)] font-bold text-[var(--teal)] hover:underline bg-transparent border-none cursor-pointer"
        >
          VIEW ALL
        </button>
      </div>

      <div className="p-5 space-y-4">
        {challenges.map(c => (
          <motion.div key={c.id} whileHover={{ x: 4 }} className="group cursor-pointer">
            <div className="flex items-start gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}20`, color: c.color }}
              >
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[length:var(--fs-caption)] font-bold text-[var(--text-primary)] truncate">
                    {c.title}
                  </h4>
                  <span className="text-[length:var(--fs-overline)] font-bold px-1.5 py-0.5 rounded-full bg-[var(--surface-card)]/5 text-[var(--text-muted)] whitespace-nowrap">
                    {c.reward}
                  </span>
                </div>
                <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                  {c.description}
                </p>
              </div>
            </div>

            <div className="relative h-1.5 w-full bg-[var(--surface-input)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.progress}%` }}
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ background: c.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
