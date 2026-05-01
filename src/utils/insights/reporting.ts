import { Transaction } from "../../types";

export async function generateMonthlyReport(month: string, transactions: Transaction[]): Promise<string> {
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');
  const totalSpent = debits.reduce((a, t) => a + t.amount, 0);
  const totalIncome = credits.reduce((a, t) => a + t.amount, 0);
  const net = totalIncome - totalSpent;

  const byCategory: Record<string, number> = {};
  debits.forEach(t => { byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount; });
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;

  const tips = [
    topCat ? `Cut **${topCat[0]}** by 20% to save ₹${Math.round(topCat[1] * 0.2).toLocaleString()}/mo.` : '',
    savingsRate < 20 ? 'Automate transfers to savings on payday (pay yourself first).' : 'Great savings rate! Consider increasing your SIP contribution.',
    debits.length > 30 ? 'High transaction volume — consolidate small purchases to reduce impulse spending.' : 'Log income sources to get a complete net-worth picture.',
  ].filter(Boolean);

  return `# SpendWise Report — ${month}

## 📊 Summary
| | Amount |
|---|---|
| **Income** | ₹${totalIncome.toLocaleString()} |
| **Expenses** | ₹${totalSpent.toLocaleString()} |
| **Net** | ₹${net.toLocaleString()} |
| **Savings Rate** | **${savingsRate}%** ${savingsRate >= 20 ? '🟢' : savingsRate >= 10 ? '🟡' : '🔴'} |

## 🏆 Category of the Month
${topCat ? `**${topCat[0]}** — ₹${topCat[1].toLocaleString()} (${Math.round((topCat[1]/totalSpent)*100)}% of expenses)` : 'No expense data yet.'}

## 💡 Top 3 Tips
${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## 📌 Observation
${debits.length === 0
  ? 'No expenses recorded this period. Start logging transactions to unlock insights!'
  : `You made **${debits.length} purchases** this month. ${net >= 0 ? '🎉 You spent less than you earned — great discipline!' : '⚠️ Expenses exceeded income. Review your largest categories.'}`}
`;
}

export async function getSpendingPersonality(transactions: Transaction[]): Promise<{
  archetype: string;
  description: string;
  traits: string[];
  advice: string;
}> {
  const debits = transactions.filter(t => t.type === 'debit');
  const byCategory: Record<string, number> = {};
  debits.forEach(t => { byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount; });

  if (debits.length === 0) {
    return {
      archetype: 'The Blank Canvas',
      description: 'Your spending story is just beginning. Log more transactions to reveal your archetype.',
      traits: ['Data-shy', 'New starter', 'Full potential'],
      advice: 'Log at least 10 transactions to unlock your spending personality.',
    };
  }

  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = top[0]?.[0] ?? 'Shopping';
  const topPct = total > 0 ? Math.round((top[0]?.[1] ?? 0) / total * 100) : 0;

  const ARCHETYPES: Record<string, { archetype: string; description: string; traits: string[]; advice: string }> = {
    Food: {
      archetype: 'The Urban Foodie',
      description: `You live to eat — ${topPct}% of your spending goes toward food and dining.`,
      traits: ['Culinary explorer', 'Social spender', 'Experience-driven'],
      advice: 'Try meal prepping 3 days a week to cut food spend by up to 30%.',
    },
    Transport: {
      archetype: 'The Commuter',
      description: `Getting around is your biggest investment — ${topPct}% on transport.`,
      traits: ['Always on the move', 'Time optimizer', 'Urban navigator'],
      advice: 'Explore monthly transit passes or carpooling to cut transport costs.',
    },
    Subscriptions: {
      archetype: 'The Subscription King',
      description: `You love the digital life — ${topPct}% on subscriptions and memberships.`,
      traits: ['Digital native', 'Content lover', 'Comfort-driven'],
      advice: 'Audit your subscriptions quarterly. Cancel anything unused for 2+ weeks.',
    },
    Entertainment: {
      archetype: 'The Experience Chaser',
      description: `Life is short — ${topPct}% goes to entertainment and experiences.`,
      traits: ['YOLO mindset', 'Social butterfly', 'Memory collector'],
      advice: 'Set a monthly entertainment budget cap and stick to it guilt-free.',
    },
    Shopping: {
      archetype: 'The Retail Explorer',
      description: `Shopping is your cardio — ${topPct}% spent on products and goods.`,
      traits: ['Deal hunter', 'Brand-conscious', 'Impulse-prone'],
      advice: 'Apply a 24-hour rule before non-essential purchases.',
    },
    Health: {
      archetype: 'The Wellness Warrior',
      description: `You invest in your body — ${topPct}% on health and fitness.`,
      traits: ['Health-conscious', 'Disciplined', 'Long-term thinker'],
      advice: 'Great habit! Track ROI on health spend by monitoring energy and productivity.',
    },
    Utilities: {
      archetype: 'The Pragmatic Planner',
      description: `Essentials first — ${topPct}% on utilities and living costs.`,
      traits: ['Responsible', 'Low-risk', 'Needs-focused'],
      advice: 'With essentials covered, redirect surplus to an investment SIP.',
    },
  };

  return ARCHETYPES[topCat] ?? {
    archetype: 'The Strategic Minimalist',
    description: 'Your spending is balanced and diversified across categories.',
    traits: ['Disciplined', 'Balanced', 'Thoughtful'],
    advice: 'Your balanced approach is great. Focus on growing your income streams next.',
  };
}
