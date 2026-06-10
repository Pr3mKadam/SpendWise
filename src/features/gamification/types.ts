import { Category } from '@/types/finance';

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  xpReward: number;
  category?: Category;
  targetAmount?: number;
  progress: number;
  completed: boolean;
  type: 'saving' | 'spending' | 'habit' | 'milestone';
  icon: string;
}

export type Rank = 'Novice' | 'Saver' | 'Budget Baron' | 'Wealth Wizard' | 'Infinity Tycoon';

export interface GamificationStats {
  totalXP: number;
  level: number;
  rank: Rank;
  streak: number;
  lastActive: string;
}
