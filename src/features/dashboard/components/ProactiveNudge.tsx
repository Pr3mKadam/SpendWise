import { memo } from 'react';
import { AppView } from '@/types';
import { ProactiveNudge as NudgeData } from '@/features/analytics/insights/advisor';

interface Props {
  nudge: NudgeData | null;
  onNavigate: (view: AppView) => void;
  className?: string;
}

const ProactiveNudge = memo(function ProactiveNudge({ nudge, onNavigate, className = '' }: Props) {
  if (!nudge) return null;

  const urgencyStyles = {
    high: 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400',
    medium: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    low: 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400',
  };

  const icons = { high: '⚠️', medium: '💡', low: '🔥' };

  return (
    <div
      className={`rounded-2xl p-4 flex items-start gap-3 border ${urgencyStyles[nudge.urgency]} ${className}`}
    >
      <span className="text-xl mt-0.5">{icons[nudge.urgency]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium leading-snug">{nudge.message}</p>
      </div>
      <button
        onClick={() =>
          onNavigate(
            nudge.action.toLowerCase().replace('create_', '').replace('view_', '') as AppView
          )
        }
        className="text-xs font-bold shrink-0 mt-0.5 hover:underline active:scale-95 transition-transform"
      >
        Fix →
      </button>
    </div>
  );
});

export default ProactiveNudge;
