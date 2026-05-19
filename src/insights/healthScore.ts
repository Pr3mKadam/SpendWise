import { Transaction, CategorySpend, MonthlyStats } from '@/types';

export interface HealthScoreResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  breakdown: {
    savings: number;    // 0-100
    stability: number;  // 0-100
    discipline: number; // 0-100
    emergency: number;  // 0-100
  };
  recommendations: string[];
}

export function calculateHealthScore(
  transactions: Transaction[],
  monthlyStats: MonthlyStats,
  categorySpending: CategorySpend[],
  currentBalance: number
): HealthScoreResult {
  // 1. Savings Rate Score (40% weight)
  // Target: 20% or more savings rate
  const savingsRate = monthlyStats.savingsRate;
  const savingsScore = Math.min(100, (savingsRate / 20) * 100);

  // 2. Stability Score (30% weight)
  // Variability in spending week over week (simulated or based on history)
  // For now, use daily spend rate vs balance
  const dailySpend = monthlyStats.avgDailySpend;
  const daysOfRunway = dailySpend > 0 ? currentBalance / dailySpend : 365;
  const stabilityScore = Math.min(100, (daysOfRunway / 90) * 100); // 90 days of runway = 100%

  // 3. Discipline Score (20% weight)
  // Ratio of needs vs wants (Wants: Entertainment, Travel, Dining)
  const wantsCategories = ['Entertainment', 'Dining', 'Shopping', 'Travel', 'Hobbies'];
  const totalSpent = categorySpending.reduce((acc, c) => acc + c.value, 0);
  const wantsSpent = categorySpending
    .filter(c => wantsCategories.includes(c.name))
    .reduce((acc, c) => acc + c.value, 0);
  
  const wantsRatio = totalSpent > 0 ? wantsSpent / totalSpent : 0;
  // Target: Wants < 30% of total spending
  const disciplineScore = Math.max(0, 100 - (wantsRatio > 0.3 ? (wantsRatio - 0.3) * 200 : 0));

  // 4. Emergency Fund Score (10% weight)
  // Target: 3 months of average monthly expenses
  const monthlyExpenses = monthlyStats.totalExpenses;
  const targetEmergencyFund = monthlyExpenses * 3;
  const emergencyScore = targetEmergencyFund > 0 ? Math.min(100, (currentBalance / targetEmergencyFund) * 100) : 100;

  // Final Weighted Score
  const finalScore = Math.round(
    (savingsScore * 0.4) +
    (stabilityScore * 0.3) +
    (disciplineScore * 0.2) +
    (emergencyScore * 0.1)
  );

  let grade: HealthScoreResult['grade'] = 'F';
  let color = 'var(--red)';

  if (finalScore >= 90) { grade = 'A+'; color = 'var(--teal)'; }
  else if (finalScore >= 80) { grade = 'A'; color = 'var(--teal)'; }
  else if (finalScore >= 70) { grade = 'B'; color = 'var(--teal)'; }
  else if (finalScore >= 60) { grade = 'C'; color = 'var(--amber)'; }
  else if (finalScore >= 40) { grade = 'D'; color = 'var(--orange)'; }

  const recommendations: string[] = [];
  if (savingsScore < 70) recommendations.push("Increase your savings rate by setting up an automated transfer of 5% more this month.");
  if (stabilityScore < 70) recommendations.push("Your liquidity is low. Aim to build a 3-month cash runway to handle emergencies.");
  if (disciplineScore < 80) recommendations.push("Discretionary spending is high. Consider the '24-hour rule' before making non-essential purchases.");
  if (emergencyScore < 100) recommendations.push(`Build your emergency fund to $${(monthlyExpenses * 3).toLocaleString()} for full security.`);

  return {
    score: finalScore,
    grade,
    color,
    breakdown: {
      savings: Math.round(savingsScore),
      stability: Math.round(stabilityScore),
      discipline: Math.round(disciplineScore),
      emergency: Math.round(emergencyScore),
    },
    recommendations: recommendations.slice(0, 2), // Top 2 recommendations
  };
}
