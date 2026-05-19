import { motion } from 'framer-motion';
import { Lock, Check, Clock, Star, ChevronRight } from 'lucide-react';
import { Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';

export interface LessonCardProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  onClick: () => void;
}

export function LessonCard({ lesson, completed, locked, onClick }: LessonCardProps) {
  const cfg = CATEGORY_CONFIG[lesson.category];
  const savedProgress = localStorage.getItem(`sw_lesson_progress_${lesson.id}`);
  const currentPara = savedProgress ? parseInt(savedProgress, 10) : 0;
  const progress = Math.round(((currentPara) / (lesson.body.length - 1)) * 100);

  return (
    <motion.div
      whileHover={!locked ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={!locked ? onClick : undefined}
      className={`relative rounded-2xl p-5 transition-all ${locked ? 'opacity-50' : 'cursor-pointer'} overflow-hidden group`}
      style={{
        background: 'var(--surface-card)',
        border: `1.5px solid ${completed ? lesson.color + '40' : 'var(--border)'}`,
        boxShadow: completed ? `0 4px 20px ${lesson.color}15` : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Progress Bar (if started but not completed) */}
      {!completed && !locked && progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--surface-input)]">
          <div className="h-full" style={{ width: `${progress}%`, background: lesson.color }} />
        </div>
      )}

      {/* Completion glow */}
      {completed && <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${lesson.color}, transparent 70%)` }} />}

      {/* Locked overlay */}
      {locked && (
        <div className="absolute top-4 right-4">
          <Lock size={14} style={{ color: 'var(--text-dim)' }} />
        </div>
      )}

      {/* Completed badge */}
      {completed && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: lesson.color }}>
          <Check size={12} className="text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110" style={{ background: lesson.color + '12' }}>
          {lesson.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[length:var(--fs-overline)] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: lesson.color + '12', color: lesson.color }}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={9} /> {lesson.readingTime}m
            </span>
            <span className="text-[length:var(--fs-overline)] font-bold text-amber-500 flex items-center gap-1">
              <Star size={9} className="fill-amber-500" /> +{lesson.xpReward} XP
            </span>
          </div>
          <h4 className="font-manrope font-bold text-[15px] text-[var(--text-primary)] leading-snug">{lesson.title}</h4>
          <p className="font-inter text-[12px] text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">{lesson.summary}</p>
          {lesson.level > 1 && (
            <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-dim)] mt-2">Unlocks at Level {lesson.level}</p>
          )}
        </div>
        {!locked && (
          <ChevronRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
    </motion.div>
  );
}

export default LessonCard;
