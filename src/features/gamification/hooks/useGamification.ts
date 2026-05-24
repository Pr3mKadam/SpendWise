import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/types';
import { useStore } from '@/store';
import { useCategories } from '@/hooks/useCategories';
import { formatLocalYYYYMMDD } from '@/utils/date';

export function useGamification(transactions: Transaction[]) {
  const store = useStore();
  const { categoryLimits } = useCategories();
  const streak = store.streak;
  const [healthScore, setHealthScore] = useState(0);

  // 1. Calculate Daily Streak (delegated to store)
  useEffect(() => {
    store.checkStreak();
  }, [store]);

  // 2. Calculate Health Score (0-100)
  useEffect(() => {
    if (transactions.length === 0) {
      setHealthScore(50);
      return;
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const income = monthlyTxs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const spend = monthlyTxs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

    let score = 50;

    if (income > 0) {
      const savingsRate = (income - spend) / income;
      if (savingsRate > 0.5) score += 40;
      else if (savingsRate > 0.3) score += 30;
      else if (savingsRate > 0.1) score += 20;
      else if (savingsRate > 0) score += 10;
      else score -= 20;
    }

    score += Math.min(streak * 2, 20);
    score += Math.min(monthlyTxs.length * 2, 20);

    const categorized = monthlyTxs.filter(t => t.category !== 'Other').length;
    const catRatio = categorized / (monthlyTxs.length || 1);
    score += catRatio * 20;

    setHealthScore(Math.min(Math.max(Math.round(score), 0), 100));
  }, [transactions, streak]);

  // 3. Calculate XP and Levels
  const { xp, level, xpToNextLevel, progress } = useMemo(() => {
    // Base XP from historical actions
    const transactionXP = transactions.length * 15;
    const streakXP = streak * 100;
    const healthXP = healthScore * 10;
    
    // Budget Adherence Bonus
    const currentMonthStr = formatLocalYYYYMMDD().substring(0, 7);
    const monthlyExpenses = transactions
      .filter(t => t.type === 'debit' && t.date.startsWith(currentMonthStr));
    
    const budgetAdherence = Object.entries(categoryLimits).reduce((acc, [cat, limit]) => {
      if (limit === 0) return acc;
      const spent = monthlyExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
      return spent <= limit ? acc + 100 : acc;
    }, 0);

    const totalXp = transactionXP + streakXP + healthXP + budgetAdherence;
    
    // Level = floor(sqrt(xp / 250)) + 1
    const currentLevel = Math.floor(Math.sqrt(totalXp / 250)) + 1;
    
    // XP math for progress bar
    const currentLevelBaseXP = 250 * Math.pow(currentLevel - 1, 2);
    const nextLevelBaseXP = 250 * Math.pow(currentLevel, 2);
    const xpGainedInLevel = totalXp - currentLevelBaseXP;
    const xpNeededForLevel = nextLevelBaseXP - currentLevelBaseXP;
    
    const levelProgress = Math.min(Math.max((xpGainedInLevel / xpNeededForLevel) * 100, 0), 100);

    return {
      xp: totalXp,
      level: currentLevel,
      xpToNextLevel: nextLevelBaseXP - totalXp,
      progress: Math.round(levelProgress)
    };
  }, [transactions, streak, healthScore, categoryLimits]);

  const savingsRate = useMemo(() => {
    const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const spend = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    if (income === 0) return 0;
    return Math.round(((income - spend) / income) * 100);
  }, [transactions]);

  const levelName = useMemo(() => {
    if (level >= 20) return 'Wealth Titan';
    if (level >= 15) return 'Financial Sage';
    if (level >= 10) return 'Money Master';
    if (level >= 5) return 'Smart Saver';
    return 'Budget Novice';
  }, [level]);

  return { streak, healthScore, savingsRate, xp, level, xpToNextLevel, progress, levelName };
}
