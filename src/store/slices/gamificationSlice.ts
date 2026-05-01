import { StateCreator } from 'zustand';
import { Quest } from '../../types';
import { SpendWiseStore } from '../index';

export interface GamificationSlice {
  quests: Quest[];
  updateQuestProgress: (id: string, progress: number) => void;
  completeQuest: (id: string) => void;
  resetQuests: () => void;
}

export const createGamificationSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], GamificationSlice> = (set) => ({
  quests: [
    {
      id: 'q1',
      title: 'Coffee Break',
      description: 'Spend less than ₹200 on coffee this week.',
      reward: '+20 XP',
      category: 'Food',
      targetAmount: 200,
      progress: 0,
      completed: false,
      type: 'spending',
      icon: '☕'
    },
    {
      id: 'q2',
      title: 'Savings Sprint',
      description: 'Save 20% of your income this month.',
      reward: 'Golden Leaf',
      progress: 0,
      completed: false,
      type: 'saving',
      icon: '💰'
    }
  ],
  updateQuestProgress: (id, progress) => set((state) => ({
    quests: state.quests.map(q => q.id === id ? { ...q, progress } : q)
  })),
  completeQuest: (id) => set((state) => ({
    quests: state.quests.map(q => q.id === id ? { ...q, completed: true, progress: 100 } : q)
  })),
  resetQuests: () => set((state) => ({
    quests: state.quests.map(q => ({ ...q, completed: false, progress: 0 }))
  })),
});
