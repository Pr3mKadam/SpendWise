import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import confetti from 'canvas-confetti';

export default function QuestCompletionOverlay() {
  const { quests, completeQuest } = useStore();
  const [completedQuest, setCompletedQuest] = useState<any>(null);

  useEffect(() => {
    // Find quests that are 100% but not yet "celebrated"
    const newlyCompleted = quests.find(q => q.progress >= 100 && !q.completed);
    if (newlyCompleted) {
      setCompletedQuest(newlyCompleted);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#0d9488', '#ffffff']
      });
    }
  }, [quests]);

  const handleClose = () => {
    if (completedQuest) {
      completeQuest(completedQuest.id);
      setCompletedQuest(null);
    }
  };

  return (
    <AnimatePresence>
      {completedQuest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
            className="relative max-w-md w-full bg-[var(--surface-card)] rounded-[40px] border border-[var(--teal)]/30 p-8 text-center shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--teal)] to-blue-500 rounded-t-full" />
            
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-6 relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--teal)] to-[#0d9488] rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-12 relative z-10">
                <Trophy size={48} className="text-white" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-[var(--teal)]/20 blur-3xl rounded-full scale-150" 
              />
            </div>

            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">Quest Complete!</h2>
            <p className="text-[var(--teal)] font-bold text-xl mb-4 uppercase tracking-tighter">
              {completedQuest.title}
            </p>
            
            <p className="text-[var(--text-muted)] font-medium mb-8">
              Amazing work! You've successfully completed this challenge and earned 500 wealth points. Your Wealth Tree is glowing!
            </p>

            <div className="space-y-3">
              <button 
                onClick={handleClose}
                className="w-full py-4 bg-[var(--teal)] text-white border-none rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                COLLECT REWARD <Sparkles size={20} />
              </button>
              
              <button 
                onClick={handleClose}
                className="w-full py-4 bg-[var(--surface-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl font-bold hover:bg-[var(--border)] transition-all flex items-center justify-center gap-2"
              >
                VIEW NEXT QUEST <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={16} className="text-[var(--teal)] fill-[var(--teal)] animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
