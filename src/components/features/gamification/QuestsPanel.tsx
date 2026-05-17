import React, { useMemo, useState } from 'react';
import { Award, Zap, CheckCircle, RefreshCw, Sparkles, Coffee, BookOpen, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../lib/haptic';
import { generateQuests } from '../../../utils/insights/advisor';
import { Transaction } from '../../../types';
import { useQuestReset } from '../../../hooks/useQuestReset';

interface QuestsPanelProps {
  transactions: Transaction[];
}

export function QuestsPanel({ transactions }: QuestsPanelProps) {
  const generatedQuests = useMemo(() => generateQuests(transactions), [transactions]);
  const { isCompleted, completeQuest, totalXPToday, completedCount } = useQuestReset();
  const [xpPop, setXpPop] = useState<{ id: string, amount: string } | null>(null);

  const quests = generatedQuests.map(q => {
    let icon = <CheckCircle size={18} />;
    let color = 'var(--teal)';
    
    if (q.type === 'category') {
      icon = <Coffee size={18} />;
      color = '#f59e0b';
    } else if (q.type === 'budget') {
      icon = <Zap size={18} />;
      color = '#ef4444';
    } else if (q.type === 'uncategorized') {
      icon = <BookOpen size={18} />;
      color = '#8b5cf6';
    } else if (q.type === 'streak') {
      icon = <Award size={18} />;
      color = '#10b981';
    } else if (q.type === 'savings') {
      icon = <TrendingUp size={18} />;
      color = '#06b6d4';
    } else if (q.type === 'logging') {
      icon = <RefreshCw size={18} />;
      color = '#6366f1';
    }
    
    return {
      ...q,
      completed: isCompleted(q.id),
      icon,
      color
    };
  });

  const handleQuestClick = (questId: string, reward: string) => {
    if (isCompleted(questId)) return;
    haptic.success();
    const numericXP = parseInt(reward.replace(/\D/g, '')) || 0;
    completeQuest(questId, numericXP);
    
    setXpPop({ id: questId, amount: reward });
    setTimeout(() => setXpPop(null), 1500);
  };

  return (
    <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--teal)]" />
          <div>
            <h3 className="font-manrope font-bold text-[var(--text-primary)] text-sm">Daily Quests</h3>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter">{completedCount}/{quests.length} completed</p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-[12px] font-bold text-[var(--teal)] font-inter">+{totalXPToday} XP</span>
           <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter uppercase tracking-wider">Today</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {quests.map((q) => (
          <motion.div 
            key={q.id}
            whileHover={!q.completed ? { x: 4 } : {}}
            className={`group relative ${q.completed ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
            onClick={() => handleQuestClick(q.id, q.reward)}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ 
                  background: q.completed ? 'rgba(255,255,255,0.05)' : `${q.color}20`, 
                  color: q.completed ? 'var(--text-muted)' : q.color 
                }}
              >
                {q.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-[length:var(--fs-caption)] font-bold truncate ${q.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                    {q.title}
                  </h4>
                  <span className={`text-[length:var(--fs-overline)] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${q.completed ? 'bg-white/5 text-[var(--text-muted)]' : 'bg-[var(--teal)]/10 text-[var(--teal)]'}`}>
                    {q.completed ? 'Done' : q.reward}
                  </span>
                </div>
                <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5 line-clamp-1">{q.description}</p>
              </div>
            </div>

            {/* XP Pop Animation */}
            <AnimatePresence>
              {xpPop?.id === q.id && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -20, scale: 1.2 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="absolute right-0 top-0 font-bold text-[var(--teal)] text-sm z-10 pointer-events-none"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  {xpPop.amount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
