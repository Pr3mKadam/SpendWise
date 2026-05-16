import { Transaction } from "../../types";

/**
 * SpendWise Local Advisor Engine
 * Provides contextual financial advice based on transaction history without any cloud dependency.
 */
export async function getFinancialAdvice(query: string, transactions: Transaction[]): Promise<string> {
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');
  const totalSpent = debits.reduce((a, t) => a + t.amount, 0);
  const totalIncome = credits.reduce((a, t) => a + t.amount, 0);
  const net = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;

  // Analysis of top categories
  const byCategory: Record<string, number> = {};
  debits.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCategories[0];

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are a sophisticated financial advisor for SpendWise. 
The user is asking: "${query}"

Here is their current financial summary:
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Spent: ₹${totalSpent.toLocaleString()}
- Net Savings: ₹${net.toLocaleString()}
- Savings Rate: ${savingsRate}%
- Top Spending Category: ${topCat ? `${topCat[0]} (₹${topCat[1].toLocaleString()})` : 'N/A'}

Provide personalized, insightful, and actionable financial advice based on their query and data. 
Keep the response concise (2-3 paragraphs max), encouraging, and professional. 
Use markdown for formatting. 
If appropriate, you can include exactly one of the following action tags at the end of your response to give the user a quick action button:
[ACTION:CREATE_BUDGET]
[ACTION:VIEW_ANALYTICS]
[ACTION:SET_GOAL]

If the query is not related to finance, politely redirect them to ask about their budget or spending.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (error) {
      console.error("Gemini Advisor failed, falling back to local engine:", error);
    }
  }

  // Local Fallback Engine
  const q = query.toLowerCase();
  
  // Logic for nonsensical or unrelated queries
  const isFinancial = /spend|save|money|budget|burget|cost|income|buy|expense|transaction|worth|wealth|rich|poor|tax|debt/i.test(q);
  if (q.length < 3 || (!isFinancial && q.split(' ').length < 2)) {
    return "I am your SpendWise financial advisor. I cannot answer non-financial questions. How can I help you with your budget or spending today?";
  }

  // Savings Advice
  if (q.includes('save') || q.includes('saving')) {
    if (savingsRate < 10) {
      return `Your current savings rate is **${savingsRate}%**. To improve this, I recommend aiming for the 50/30/20 rule: 50% for needs, 30% for wants, and **20% for savings**. Try reducing your ${topCat ? topCat[0] : 'discretionary'} spending next week.\n\n[ACTION:SET_GOAL]`;
    }
    return `Great job! Your savings rate is **${savingsRate}%**, which is above the healthy 20% benchmark. To level up, consider moving your surplus into a high-yield investment or emergency fund.\n\n[ACTION:SET_GOAL]`;
  }

  // Largest expense queries
  if (q.includes('largest') || q.includes('biggest') || q.includes('highest') || q.includes('most expensive')) {
    if (debits.length === 0) return "You haven't logged any expenses yet.";
    const largest = debits.reduce((max, t) => t.amount > max.amount ? t : max, debits[0]);
    return `Your largest single expense recently was **${largest.merchant}** for **₹${largest.amount.toLocaleString()}** on ${new Date(largest.date).toLocaleDateString()}. This was categorized under **${largest.category}**.\n\n[ACTION:VIEW_ANALYTICS]`;
  }

  // Category specific queries
  if (q.includes('spend') || q.includes('expense') || q.includes('where')) {
    if (!topCat) return "You haven't logged enough transactions for me to analyze your spending yet. Start adding your daily expenses!";
    return `You've spent a total of **₹${totalSpent.toLocaleString()}** recently. Your biggest expense category is **${topCat[0]}** (₹${topCat[1].toLocaleString()}), accounting for **${Math.round((topCat[1] / totalSpent) * 100)}%** of your total spending.\n\n[ACTION:VIEW_ANALYTICS]`;
  }

  // Budget queries
  if (q.includes('budget')) {
    if (net < 0) {
      return `You're currently in a deficit of **₹${Math.abs(net).toLocaleString()}**. I suggest creating a strict 'Zero-Based Budget' where every rupee is assigned a job before the month starts to stop the leak.\n\n[ACTION:CREATE_BUDGET]`;
    }
    return `Your budget looks healthy with a **₹${net.toLocaleString()}** surplus. Have you considered setting up automated transfers to your savings goals to 'pay yourself first'?\n\n[ACTION:CREATE_BUDGET]`;
  }

  // General catch-all financial advice
  return `Based on your **${transactions.length} transactions**, you have a net balance of **₹${net.toLocaleString()}**. Your spending is most active in **${topCat ? topCat[0] : 'various categories'}**. Would you like to set a specific savings goal for next month?\n\n[ACTION:SET_GOAL]`;
}

export interface GeneratedQuest {
  id: string;
  title: string;
  description: string;
  reward: string;
  type: 'category' | 'uncategorized' | 'budget' | 'streak' | 'savings' | 'logging';
  completed: boolean;
}

export function generateQuests(transactions: Transaction[]): GeneratedQuest[] {
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');
  const totalSpent = debits.reduce((a, t) => a + t.amount, 0);
  const totalIncome = credits.reduce((a, t) => a + t.amount, 0);

  const byCategory: Record<string, number> = {};
  debits.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCategories[0];

  // Deterministic daily seed — rotates quest set each day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const allQuests: GeneratedQuest[] = [];

  // ── Static contextual quests (always eligible) ──────────────────────────

  // 1. Uncategorized cleanup
  const uncategorized = transactions.filter(t => !t.category || t.category === 'Uncategorized');
  if (uncategorized.length > 0) {
    allQuests.push({
      id: 'quest_uncat',
      title: 'Cleanup Crew',
      description: `Categorize ${uncategorized.length} uncategorized transaction${uncategorized.length > 1 ? 's' : ''}.`,
      reward: '+30 XP',
      type: 'uncategorized',
      completed: false
    });
  }

  // 2. Top category diet
  if (topCat) {
    allQuests.push({
      id: 'quest_topcat',
      title: `${topCat[0]} Diet`,
      description: `Avoid spending on ${topCat[0]} for the rest of today.`,
      reward: '+50 XP',
      type: 'category',
      completed: false
    });
  }

  // 3. Daily logging streak
  const loggedToday = transactions.filter(t => new Date(t.date) >= new Date(Date.now() - 86400000));
  if (loggedToday.length === 0) {
    allQuests.push({
      id: 'quest_log',
      title: 'Active Tracker',
      description: 'Log your first transaction today to keep your streak alive.',
      reward: '+20 XP',
      type: 'logging',
      completed: false
    });
  } else {
    allQuests.push({
      id: 'quest_streak',
      title: 'Streak Saver',
      description: `You've logged ${loggedToday.length} transaction${loggedToday.length > 1 ? 's' : ''} today. Keep it up!`,
      reward: '+40 XP',
      type: 'streak',
      completed: false
    });
  }

  // 4. Rainy day savings
  if (credits.length > 0) {
    allQuests.push({
      id: 'quest_savings',
      title: 'Rainy Day Fund',
      description: 'Transfer 10% of your recent income to a savings goal.',
      reward: '+60 XP',
      type: 'savings',
      completed: false
    });
  }

  // 5. Subscription audit
  const recurringCount = transactions.filter(t => t.tags?.includes('recurring')).length;
  if (recurringCount > 2) {
    allQuests.push({
      id: 'quest_sub_audit',
      title: 'Subscription Scout',
      description: 'Review and remove one subscription you no longer use.',
      reward: '+35 XP',
      type: 'logging',
      completed: false
    });
  }

  // 6. Income diversifier
  const incomeSources = new Set(credits.map(t => t.merchant)).size;
  if (incomeSources < 2) {
    allQuests.push({
      id: 'quest_income_boost',
      title: 'Income Explorer',
      description: 'Log a side-hustle or secondary income source today.',
      reward: '+75 XP',
      type: 'savings',
      completed: false
    });
  }

  // ── Rotating daily quests (always shown regardless of data) ─────────────

  const rotatingPool: GeneratedQuest[] = [
    {
      id: 'quest_no_spend',
      title: 'No-Spend Hour',
      description: 'Go 3 hours without a discretionary purchase.',
      reward: '+25 XP',
      type: 'streak',
      completed: false
    },
    {
      id: 'quest_budget_checkin',
      title: 'Budget Check-In',
      description: `Review your spending — you've spent ${totalSpent > 0 ? `₹${Math.round(totalSpent).toLocaleString('en-IN')}` : 'nothing'} this month.`,
      reward: '+20 XP',
      type: 'budget',
      completed: false
    },
    {
      id: 'quest_savings_rate',
      title: 'Savings Pulse',
      description: totalIncome > 0
        ? `Your current savings rate is ${Math.round(((totalIncome - totalSpent) / totalIncome) * 100)}%. Target 20%+.`
        : 'Log an income transaction to calculate your savings rate.',
      reward: '+30 XP',
      type: 'savings',
      completed: false
    },
    {
      id: 'quest_income_log',
      title: 'Paycheck Planner',
      description: 'Record all income sources you received this week.',
      reward: '+45 XP',
      type: 'logging',
      completed: false
    },
    {
      id: 'quest_weekly_review',
      title: 'Weekly Snapshot',
      description: 'Check your Analytics view for your top spending categories.',
      reward: '+15 XP',
      type: 'budget',
      completed: false
    },
    {
      id: 'quest_goal_progress',
      title: 'Goal Booster',
      description: 'Add any amount to one of your active savings goals.',
      reward: '+50 XP',
      type: 'savings',
      completed: false
    },
  ];

  // Pick 1 rotating quest per day (day-of-year cycles through the pool)
  const todayRotating = rotatingPool[dayOfYear % rotatingPool.length];

  // Only add if not already covered by a contextual quest with same ID
  if (!allQuests.find(q => q.id === todayRotating.id)) {
    allQuests.push(todayRotating);
  }

  // Return top 4 quests (prioritising contextual ones)
  return allQuests.slice(0, 4);
}
