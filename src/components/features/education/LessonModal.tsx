import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, X, Check, Trophy } from 'lucide-react';
import { Lesson } from '../../../data/lessons';
import { CATEGORY_CONFIG } from './categoryConfig';

export interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  completed: boolean;
}

export function LessonModal({ lesson, onClose, onComplete, completed }: LessonModalProps) {
  const [currentPara, setCurrentPara] = useState(() => {
    const saved = localStorage.getItem(`sw_lesson_progress_${lesson.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleNextPara = () => {
    if (currentPara < lesson.body.length - 1) {
      const next = currentPara + 1;
      setCurrentPara(next);
      localStorage.setItem(`sw_lesson_progress_${lesson.id}`, next.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: 'var(--surface-card)', boxShadow: '0 40px 120px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-start gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: lesson.color + '15' }}>
            {lesson.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: lesson.color + '15', color: lesson.color }}>
                {CATEGORY_CONFIG[lesson.category].label}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Clock size={10} /> {lesson.readingTime} min read
              </span>
            </div>
            <h3 className="font-manrope font-black text-xl text-[var(--text-primary)] leading-tight">{lesson.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-xs text-amber-500">
              <Star size={12} className="fill-amber-500" /> +{lesson.xpReward} XP
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'var(--surface-input)', border: 'none', cursor: 'pointer' }}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {lesson.body.slice(0, currentPara + 1).map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === currentPara ? 0.08 : 0 }}
              className="font-inter text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              {para}
            </motion.p>
          ))}

          {currentPara < lesson.body.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNextPara}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all text-white mt-4"
              style={{ background: lesson.color, border: 'none', cursor: 'pointer' }}
            >
              Continue Reading
            </motion.button>
          )}

          {currentPara === lesson.body.length - 1 && (
            <div className="rounded-2xl p-5 mt-4" style={{ background: lesson.color + '0A', border: `1px solid ${lesson.color}20` }}>
              <p className="font-inter font-bold text-xs uppercase tracking-wider mb-3" style={{ color: lesson.color }}>Key Takeaways</p>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: lesson.color }} />
                    <span className="font-inter text-sm text-[var(--text-primary)]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <p className="text-xs text-[var(--text-muted)]">Reading boosts your financial intelligence score</p>
          {completed ? (
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--teal)]">
              <Trophy size={16} /> Completed!
            </div>
          ) : currentPara === lesson.body.length - 1 ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: lesson.color, border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${lesson.color}40` }}
            >
              <Star size={14} /> Claim +{lesson.xpReward} XP
            </button>
          ) : (
            <div className="text-xs font-bold text-[var(--text-muted)]">
              {Math.round(((currentPara + 1) / lesson.body.length) * 100)}% Read
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default LessonModal;
