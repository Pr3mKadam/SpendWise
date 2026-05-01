import { Category } from "./finance";

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  category?: Category;
  targetAmount?: number;
  progress: number;
  completed: boolean;
  type: 'saving' | 'spending' | 'habit';
  icon: string;
}
