import { GoalStatus } from '@/types';
import { CheckCircle2, TrendingUp, AlertTriangle, PauseCircle } from 'lucide-react';

export const STATUS_CONFIG: Record<GoalStatus, {
  label:   string;
  icon:    typeof CheckCircle2;
  color:   string;
  bg:      string;
}> = {
  'on-track': { label: 'On Track',  icon: TrendingUp,    color: 'var(--teal)',       bg: 'rgba(20,184,166,0.12)'   },
  'at-risk':  { label: 'At Risk',   icon: AlertTriangle, color: 'var(--amber)',      bg: 'rgba(245,158,11,0.12)'    },
  'achieved': { label: 'Achieved',  icon: CheckCircle2,  color: 'var(--purple)',     bg: 'rgba(139,92,246,0.12)'    },
  'paused':   { label: 'Paused',    icon: PauseCircle,   color: 'var(--text-muted)', bg: '#f5f7fa'                  },
};

export const GOAL_EMOJIS = ['🛡️','✈️','🏠','💻','🚗','🎓','💍','🏋️','🎸','🌍','🛸','💎'];
export const GOAL_COLORS = ['#10b981','#3b82f6','#a855f7','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];
