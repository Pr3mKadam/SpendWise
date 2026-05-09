import React, { useMemo } from 'react';
import { Award, Zap, CheckCircle, RefreshCw, Sparkles, Coffee, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateQuests } from '../../../utils/insights/advisor';
import { Transaction } from '../../../types';

interface QuestsPanelProps {
  transactions: Transaction[];
}

export function QuestsPanel({ transactions }: QuestsPanelProps) {
  const generatedQuests = useMemo(() => generateQuests(transactions), [transactions]);

  const quests = generatedQuests.map(q => {
    let icon = <CheckCircle size={18} />;
    let color = 'var(--teal)';
    
    if (q.type === 'category') {
      icon = <Coffee size={18} />;
      color = '#f59e0b';
    } else if (q.type === 'budget') {
      icon = <Zap size={18} />;
      color = '#ef4444';
    }
    
    return {
      ...q,
      icon,
      color
    };
  });

  return (
    <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--teal)]" />
          <h3 className="font-manrope font-bold text-[var(--text-primary)] text-sm">Daily Quests</h3>
        </div>
        <button className="text-[10px] font-bold text-[var(--teal)] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
          <RefreshCw size={10} />
          REFRESH
        </button>
      </div>

      <div className="p-5 space-y-4">
        {quests.map((q) => (
          <motion.div 
            key={q.id}
            whileHover={{ x: 4 }}
            className="group cursor-pointer"
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
                  <h4 className={`text-[11px] font-bold truncate ${q.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                    {q.title}
                  </h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${q.completed ? 'bg-white/5 text-[var(--text-muted)]' : 'bg-[var(--teal)]/10 text-[var(--teal)]'}`}>
                    {q.completed ? 'Done' : q.reward}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{q.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
