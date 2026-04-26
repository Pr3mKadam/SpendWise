import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';

export function useGamification(transactions: Transaction[]) {
  const [streak, setStreak] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  // 1. Calculate Daily Streak
  useEffect(() => {
    const lastLogin = localStorage.getItem('last_login_date');
    const today = new Date().toISOString().split('T')[0];
    const currentStreak = parseInt(localStorage.getItem('daily_streak') || '0', 10);

    if (lastLogin === today) {
      setStreak(currentStreak);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLogin === yesterdayStr) {
        const newStreak = currentStreak + 1;
        localStorage.setItem('daily_streak', newStreak.toString());
        localStorage.setItem('last_login_date', today);
        setStreak(newStreak);
      } else {
        localStorage.setItem('daily_streak', '1');
        localStorage.setItem('last_login_date', today);
        setStreak(1);
      }
    }
  }, []);

  // 2. Calculate Health Score (0-100)
  // Factors: 
  // - Savings Rate (Income vs Spend)
  // - Budget Adherence (not implemented yet, so we use spending vs income)
  // - Logging Consistency (Streak)
  useEffect(() => {
    if (transactions.length === 0) {
      setHealthScore(50); // Neutral starting point
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

    // Savings Rate Factor (Max 40 points)
    if (income > 0) {
      const savingsRate = (income - spend) / income;
      if (savingsRate > 0.5) score += 40;
      else if (savingsRate > 0.3) score += 30;
      else if (savingsRate > 0.1) score += 20;
      else if (savingsRate > 0) score += 10;
      else score -= 20; // Negative savings rate
    }

    // Streak Factor (Max 20 points)
    score += Math.min(streak * 2, 20);

    // Transaction Count (Active user) (Max 20 points)
    score += Math.min(monthlyTxs.length * 2, 20);

    // Data Quality (Categorization completeness) (Max 20 points)
    const categorized = monthlyTxs.filter(t => t.category !== 'Other').length;
    const catRatio = categorized / (monthlyTxs.length || 1);
    score += catRatio * 20;

    setHealthScore(Math.min(Math.max(Math.round(score), 0), 100));
  }, [transactions, streak]);

  const savingsRate = useMemo(() => {
    const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const spend = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    if (income === 0) return 0;
    return Math.round(((income - spend) / income) * 100);
  }, [transactions]);

  return { streak, healthScore, savingsRate };
}
