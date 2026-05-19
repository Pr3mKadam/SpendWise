import { StateCreator } from 'zustand';
import { Quest } from '@/types';
import { SpendWiseStore } from '@/store/index';

export interface GamificationSlice {
  quests: Quest[];
  totalXP: number;
  level: number;
  rank: string;
  streak: number;
  lastLoginDate: string | null;
  showLevelUp: boolean;
  addXP: (amount: number) => void;
  dismissLevelUp: () => void;
  updateQuestProgress: (id: string, progress: number) => void;
  completeQuest: (id: string) => void;
  resetQuests: () => void;
  checkStreak: () => void;
}

const XP_PER_LEVEL = 1000;

export const createGamificationSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], GamificationSlice> = (set, get) => ({
  quests: [
    {
      id: 'q1',
      title: 'Coffee Break',
      description: 'Spend less than ₹200 on coffee this week.',
      reward: '+50 XP',
      xpReward: 50,
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
      reward: '+200 XP',
      xpReward: 200,
      progress: 0,
      completed: false,
      type: 'saving',
      icon: '💰'
    },
    {
      id: 'q3',
      title: 'Receipt Master',
      description: 'Scan 5 receipts using the Vision OCR.',
      reward: '+100 XP',
      xpReward: 100,
      progress: 0,
      completed: false,
      type: 'habit',
      icon: '📸'
    }
  ],
  totalXP: 0,
  level: 1,
  rank: 'Novice',
  streak: 0,
  lastLoginDate: null,
  showLevelUp: false,

  checkStreak: () => set((state) => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    if (state.lastLoginDate === today) return state; // Already checked today ✓

    let newStreak = 1; // Always start at 1 (today counts)
    let xpBonus = 0;

    if (state.lastLoginDate) {
      const last = new Date(state.lastLoginDate + 'T00:00:00');
      const curr = new Date(today + 'T00:00:00');
      const diffDays = Math.round((curr.getTime() - last.getTime()) / 86400000);

      if (diffDays === 1) {
        newStreak = state.streak + 1; // Genuine consecutive day
        xpBonus = 10;
      } else if (diffDays === 0) {
        return state; // Same day, no change
      }
      // diffDays > 1: streak broken, newStreak stays 1
    }

    if (xpBonus > 0) setTimeout(() => get().addXP(xpBonus), 0);
    return { streak: newStreak, lastLoginDate: today };
  }),

  addXP: (amount) => set((state) => {
    const newXP = state.totalXP + amount;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > state.level;
    
    let newRank = state.rank;
    if (newLevel >= 20) newRank = 'Infinity Tycoon';
    else if (newLevel >= 10) newRank = 'Wealth Wizard';
    else if (newLevel >= 5) newRank = 'Budget Baron';
    else if (newLevel >= 2) newRank = 'Saver';

    return { 
      totalXP: newXP, 
      level: newLevel, 
      rank: newRank,
      showLevelUp: leveledUp || state.showLevelUp 
    };
  }),

  dismissLevelUp: () => set({ showLevelUp: false }),

  updateQuestProgress: (id, progress) => set((state) => ({
    quests: state.quests.map(q => q.id === id ? { ...q, progress } : q)
  })),

  completeQuest: (id) => {
    const quest = get().quests.find(q => q.id === id);
    if (quest && !quest.completed) {
      set((state) => ({
        quests: state.quests.map(q => q.id === id ? { ...q, completed: true, progress: 100 } : q)
      }));
      get().addXP(quest.xpReward);
    }
  },

  resetQuests: () => set((state) => ({
    quests: state.quests.map(q => ({ ...q, completed: false, progress: 0 }))
  })),
});
