import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import { createGamificationSlice, GamificationSlice } from './gamificationSlice';

function createTestStore() {
  const store = createStore<Record<string, unknown>>()((set, get, api) => ({
    ...(
      createGamificationSlice as unknown as (
        s: typeof set,
        g: typeof get,
        a: typeof api
      ) => GamificationSlice
    )(set, get, api),
  }));
  return store as unknown as StoreApi<GamificationSlice>;
}

describe('gamificationSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('addXP', () => {
    it('starts at 0 XP, level 1, Novice', () => {
      const s = store.getState();
      expect(s.totalXP).toBe(0);
      expect(s.level).toBe(1);
      expect(s.rank).toBe('Novice');
    });

    it('adds XP and triggers level-up at 1000 XP', () => {
      store.getState().addXP(1000);
      const s = store.getState();
      expect(s.totalXP).toBe(1000);
      expect(s.level).toBe(2);
      expect(s.showLevelUp).toBe(true);
    });

    it('promotes to Saver at level 2 (1000 XP)', () => {
      store.getState().addXP(1000);
      expect(store.getState().rank).toBe('Saver');
    });

    it('promotes to Budget Baron at level 5 (5000 XP)', () => {
      store.getState().addXP(5000);
      expect(store.getState().rank).toBe('Budget Baron');
    });

    it('promotes to Wealth Wizard at level 10 (10000 XP)', () => {
      store.getState().addXP(10000);
      expect(store.getState().rank).toBe('Wealth Wizard');
    });

    it('promotes to Infinity Tycoon at level 20 (20000 XP)', () => {
      store.getState().addXP(20000);
      expect(store.getState().rank).toBe('Infinity Tycoon');
    });

    it('accumulates XP across multiple calls', () => {
      store.getState().addXP(300);
      store.getState().addXP(400);
      store.getState().addXP(500);
      expect(store.getState().totalXP).toBe(1200);
      expect(store.getState().level).toBe(2);
    });

    it('sets showLevelUp only on level increase', () => {
      store.getState().addXP(500);
      expect(store.getState().showLevelUp).toBe(false);
      store.getState().addXP(500);
      expect(store.getState().showLevelUp).toBe(true);
    });

    it('dismissLevelUp resets showLevelUp', () => {
      store.getState().addXP(2000);
      expect(store.getState().showLevelUp).toBe(true);
      store.getState().dismissLevelUp();
      expect(store.getState().showLevelUp).toBe(false);
    });
  });

  describe('checkStreak', () => {
    beforeEach(() => {
      // Reset lastLoginDate so streak starts fresh
      store.setState({ lastLoginDate: null, streak: 0 });
    });

    it('sets streak to 1 on first login', () => {
      store.getState().checkStreak();
      const s = store.getState();
      expect(s.streak).toBe(1);
      expect(s.lastLoginDate).not.toBeNull();
    });

    it('increments streak when called on consecutive days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().substring(0, 10);

      store.setState({ lastLoginDate: yStr, streak: 5 });
      store.getState().checkStreak();

      expect(store.getState().streak).toBe(6);
    });

    it('resets streak to 1 if more than 1 day gap', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      store.setState({
        lastLoginDate: twoDaysAgo.toISOString().substring(0, 10),
        streak: 10,
      });
      store.getState().checkStreak();

      expect(store.getState().streak).toBe(1);
    });

    it('does not change streak if called multiple times the same day', () => {
      store.getState().checkStreak();
      const afterFirst = store.getState().streak;

      store.getState().checkStreak();
      expect(store.getState().streak).toBe(afterFirst);
    });
  });

  describe('quests', () => {
    it('has 3 default quests initially', () => {
      expect(store.getState().quests).toHaveLength(3);
    });

    it('updates quest progress', () => {
      store.getState().updateQuestProgress('q1', 50);
      expect(store.getState().quests.find(q => q.id === 'q1')?.progress).toBe(50);
    });

    it('marks a quest as completed and grants XP', () => {
      const initialXP = store.getState().totalXP;
      const q1 = store.getState().quests.find(q => q.id === 'q1')!;
      const expectedXP = q1.xpReward;

      store.getState().completeQuest('q1');

      expect(store.getState().quests.find(q => q.id === 'q1')?.completed).toBe(true);
      expect(store.getState().quests.find(q => q.id === 'q1')?.progress).toBe(100);
      expect(store.getState().totalXP).toBe(initialXP + expectedXP);
    });

    it('does not grant XP twice for the same quest', () => {
      store.getState().completeQuest('q1');
      const xpAfterFirst = store.getState().totalXP;

      store.getState().completeQuest('q1');
      expect(store.getState().totalXP).toBe(xpAfterFirst);
    });

    it('resets all quests', () => {
      store.getState().completeQuest('q1');
      store.getState().completeQuest('q2');

      store.getState().resetQuests();

      for (const q of store.getState().quests) {
        expect(q.completed).toBe(false);
        expect(q.progress).toBe(0);
      }
    });
  });
});
