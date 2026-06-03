export interface Lesson {
  id: string;
  title: string;
  summary: string;
  readingTime: number; // minutes
  xpReward: number;
  level: number; // min level to unlock
  icon: string;
  color: string;
  category: 'budgeting' | 'investing' | 'debt' | 'mindset' | 'advanced';
  body: string[]; // paragraphs
  keyTakeaways: string[];
  roles?: ('student' | 'professional' | 'business')[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'The 50/30/20 Rule',
    summary:
      'A simple, battle-tested framework for managing income across needs, wants, and savings.',
    readingTime: 4,
    xpReward: 100,
    level: 1,
    icon: '🧮',
    color: '#14b8a6',
    category: 'budgeting',
    body: [
      'The 50/30/20 rule was popularized by Senator Elizabeth Warren in her book "All Your Worth." It divides your after-tax income into three clear buckets.',
      "50% goes to NEEDS: rent, groceries, utilities, minimum debt payments. These are things you truly cannot live without. If this bucket exceeds 50%, it's a signal to find ways to reduce fixed costs.",
      '30% goes to WANTS: dining out, subscriptions, entertainment, hobbies. These bring joy but are discretionary. This is where most overspending occurs.',
      '20% goes to SAVINGS & DEBT REPAYMENT: emergency fund, investments, and paying down debt aggressively beyond minimums. This is your future wealth engine.',
    ],
    keyTakeaways: [
      'Track needs vs wants separately in SpendWise.',
      'A single category review can reveal hidden leakage.',
      'Automate your 20% on payday before you can spend it.',
    ],
    roles: ['student', 'professional'],
    quiz: {
      question:
        'Under the 50/30/20 rule, which category should not exceed 30% of your after-tax income?',
      options: [
        'Needs (Rent, Groceries)',
        'Wants (Dining out, Hobbies)',
        'Savings & Investments',
        'Debt Repayment',
      ],
      correctIndex: 1,
      explanation:
        '30% of your income is allocated to Wants. This gives you room to enjoy life without jeopardizing your financial security.',
    },
  },
  {
    id: 'l2',
    title: 'Compound Interest: The 8th Wonder',
    summary:
      'Understand exponential growth and why starting today—not tomorrow—is the most important financial decision.',
    readingTime: 5,
    xpReward: 150,
    level: 1,
    icon: '📈',
    color: '#6366f1',
    category: 'investing',
    body: [
      'Albert Einstein reportedly called compound interest the "eighth wonder of the world." Whether he said it or not, the math is indisputable: small, consistent investments grow into fortunes given enough time.',
      "The formula is: A = P(1 + r/n)^(nt). But what matters is the intuition. Invest ₹10,000 today at 12% annually. In 10 years it becomes ₹31,058. In 30 years? ₹299,599. The growth is not linear—it's exponential.",
      'The critical variable is TIME. Starting at 25 vs. 35 can mean the difference of ₹1 crore or more at retirement. Every year you delay is exponentially costly.',
      'Index funds (like Nifty 50) have historically delivered ~12% CAGR. Even simple SIPs in index funds, if started early, will outperform most actively managed portfolios over 20+ years.',
    ],
    keyTakeaways: [
      'Start investing TODAY, even if the amount is small.',
      'Increase SIP by 10% every year as your income grows.',
      'Never withdraw from investments for non-emergencies.',
    ],
    roles: ['student', 'professional', 'business'],
    quiz: {
      question: 'What is the most critical variable in the compound interest formula?',
      options: [
        'The initial principal amount',
        'The interest rate',
        'The frequency of compounding',
        'Time (The number of years invested)',
      ],
      correctIndex: 3,
      explanation:
        'While all factors matter, Time (t) is the exponent in the formula. Its effect is exponential, making early starts drastically more powerful than higher interest rates later.',
    },
  },
  {
    id: 'l3',
    title: 'The Debt Avalanche vs. Snowball',
    summary:
      'Two proven strategies for eliminating debt. One optimizes for math, the other for psychology.',
    readingTime: 3,
    xpReward: 100,
    level: 1,
    icon: '⛰️',
    color: '#ef4444',
    category: 'debt',
    body: [
      'If you have multiple debts, you need a strategy. Two methods dominate personal finance advice: Avalanche and Snowball. Both work. The difference is what drives them.',
      'The Avalanche Method: Order your debts by interest rate from highest to lowest. Pay minimums on all debts, then throw every extra rupee at the highest-rate debt. Mathematically optimal—you pay less interest overall.',
      'The Snowball Method: Order debts by balance from smallest to largest. Pay off the smallest first, then "roll" that freed-up payment into the next. Psychologically powerful—quick wins keep you motivated.',
      'Research shows most people achieve better long-term outcomes with Snowball because they actually stick to it. The "best" plan is the one you follow consistently.',
    ],
    keyTakeaways: [
      'Use the Debt Lab in Portfolio → Debt Lab to simulate both.',
      'Either method works if followed consistently.',
      'Hybrid: use snowball for motivation until you get momentum.',
    ],
    roles: ['student', 'professional'],
  },
  {
    id: 'l4',
    title: 'Emergency Fund: Your Financial Immune System',
    summary:
      'Why 3-6 months of expenses in liquid savings is the single most important financial safety net.',
    readingTime: 4,
    xpReward: 120,
    level: 2,
    icon: '🛡️',
    color: '#f59e0b',
    category: 'mindset',
    body: [
      'An emergency fund is cash—not investments—set aside exclusively for genuine emergencies: job loss, medical events, urgent repairs. It is the foundation on which all other financial planning is built.',
      'Without an emergency fund, any unexpected expense forces you to use credit cards (high interest) or break investments (compounding penalty). This creates a debt spiral that can set you back years.',
      'The standard target is 3-6 months of ESSENTIAL expenses (not income). If you have variable income, high job insecurity, or dependents, aim for 9-12 months.',
      "Keep the emergency fund in a high-yield savings account or liquid mutual fund. Not in stocks, not in crypto, not in FDs you can't break instantly.",
    ],
    keyTakeaways: [
      'Calculate your monthly essential expenses first.',
      'Build it before you start investing aggressively.',
      "Never use it for planned expenses—that's what budgeting is for.",
    ],
    roles: ['student', 'professional', 'business'],
  },
  {
    id: 'l5',
    title: 'Tax-Loss Harvesting',
    summary:
      'An advanced strategy where you sell losing positions to offset taxable gains, lowering your tax bill.',
    readingTime: 6,
    xpReward: 200,
    level: 5,
    icon: '🏦',
    color: '#8b5cf6',
    category: 'advanced',
    body: [
      'Tax-loss harvesting (TLH) is the practice of selling investments at a loss to offset capital gains taxes owed on other investments that have appreciated.',
      'In India, Short-Term Capital Gains (STCG) on equity are taxed at 15%, and Long-Term Capital Gains (LTCG) above ₹1L are taxed at 10%. By strategically booking losses, you can neutralize these taxes.',
      'Example: You have ₹1L profit from selling stocks. You also have a mutual fund down ₹40,000. Selling the MF and re-buying it (after 30+ days to avoid wash-sale equivalents) crystallizes the ₹40,000 loss, reducing your taxable gain to ₹60,000.',
      'Important: In India, there is no formal wash-sale rule (unlike the US), but SEBI and IT departments increasingly scrutinize quick re-purchase strategies. Consult a chartered accountant before implementing TLH at scale.',
    ],
    keyTakeaways: [
      'Review your portfolio before March 31 each financial year.',
      'Prioritize harvesting STCL as it offsets higher-taxed STCG.',
      'Keep detailed records of all transactions for ITR filing.',
    ],
    roles: ['professional', 'business'],
  },
  {
    id: 'l6',
    title: 'The Psychology of Spending',
    summary:
      'Why smart people make irrational money decisions—and cognitive biases that cost you thousands.',
    readingTime: 5,
    xpReward: 130,
    level: 2,
    icon: '🧠',
    color: '#ec4899',
    category: 'mindset',
    body: [
      'Personal finance is 20% math and 80% behavior. Understanding why you spend the way you do is more valuable than any budgeting spreadsheet.',
      'Present Bias: Humans systematically prefer smaller, sooner rewards over larger, later ones. This is why we choose ₹500 today over ₹5,000 in 10 years. Most impulse purchases are driven by present bias.',
      'The Latte Factor: Coined by David Bach, it describes how small, recurring purchases (coffee, snacks, streaming services) add up to enormous sums over time. ₹150/day on coffee = ₹54,750/year = ₹5.4L over 10 years.',
      'Loss Aversion: Losses feel roughly 2.5x more painful than equivalent gains feel pleasurable. This drives risk-avoidance in investing and anchoring to purchase prices when selling assets.',
      "The solution is not willpower—it's systems. Automate savings, use friction (waiting periods) for big purchases, and track everything (which is exactly what SpendWise is built for).",
    ],
    keyTakeaways: [
      'Implement a 48-hour rule for any unplanned purchase over ₹2,000.',
      'Set up automatic SIPs to bypass present bias entirely.',
      'Use your SpendWise category data to spot behavioral patterns.',
    ],
    roles: ['student', 'professional', 'business'],
  },
  {
    id: 'l7',
    title: 'Systematic Investment Plan (SIP)',
    summary: 'The power of rupee cost averaging and disciplined investing.',
    readingTime: 4,
    xpReward: 150,
    level: 3,
    icon: '🔄',
    color: '#3b82f6',
    category: 'investing',
    body: [
      'A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly (e.g., monthly) in a mutual fund. It removes the need to time the market.',
      'Rupee Cost Averaging: By investing a fixed amount, you buy more units when the market is low and fewer units when it is high. Over time, this averages out your cost of investment.',
      'Power of Compounding: Just like compound interest, SIPs benefit from returns on your returns. The longer you stay invested, the more pronounced this effect becomes.',
      'Discipline: SIPs automate your investing, ensuring you pay yourself first before spending on wants.',
    ],
    keyTakeaways: [
      'Start an SIP as early as possible.',
      'Automate your SIP deduction right after salary day.',
      'Do not stop your SIP during market downturns.',
    ],
    roles: ['student', 'professional', 'business'],
  },
  {
    id: 'l8',
    title: 'Term Insurance Essentials',
    summary: 'Why term insurance is the only life insurance you actually need.',
    readingTime: 5,
    xpReward: 120,
    level: 2,
    icon: '☂️',
    color: '#0ea5e9',
    category: 'mindset',
    body: [
      'Term insurance provides life cover for a specified term. If the insured passes away during this period, the nominee receives the sum assured. It is pure protection—no investment component.',
      'Why not Endowment or ULIPs? Investment-linked insurance policies mix insurance with investment, offering poor returns (usually 4-6%) and high mortality charges. Keep your insurance and investments separate.',
      'Coverage Amount: A general rule of thumb is 15-20 times your annual income, plus any outstanding debt like home loans.',
      'Buy Early: Premiums are locked in based on your age at the time of purchase. Buying at 25 instead of 35 can save you lakhs in premiums over the policy term.',
    ],
    keyTakeaways: [
      'Buy term insurance if you have financial dependents.',
      'Opt for regular pay until your retirement age.',
      'Do not mix insurance and investment.',
    ],
    roles: ['professional', 'business'],
  },
  {
    id: 'l9',
    title: 'Tax Saving with ELSS',
    summary: 'Save tax under Section 80C while building equity wealth.',
    readingTime: 5,
    xpReward: 180,
    level: 4,
    icon: '🧾',
    color: '#10b981',
    category: 'investing',
    body: [
      'Equity Linked Savings Scheme (ELSS) is a mutual fund category that qualifies for tax deduction up to ₹1.5 Lakh under Section 80C of the Income Tax Act.',
      'Lock-in Period: ELSS funds have a mandatory lock-in period of 3 years—the shortest among all 80C options (PPF is 15 years, FD is 5 years).',
      'Growth Potential: Since ELSS invests primarily in equity, it offers higher potential returns compared to traditional fixed-income tax savers, beating inflation over the long term.',
      'SIP over Lumpsum: It is best to invest in ELSS via SIP to benefit from rupee cost averaging instead of a last-minute rush in March.',
    ],
    keyTakeaways: [
      'ELSS is an excellent tax-saving tool for young professionals.',
      'The 3-year lock-in applies to each individual SIP installment.',
      "Don't just look at the tax savings; treat it as a long-term investment.",
    ],
    roles: ['professional', 'business'],
  },
  {
    id: 'l10',
    title: 'National Pension System (NPS)',
    summary: 'Secure your retirement and get additional tax benefits.',
    readingTime: 6,
    xpReward: 150,
    level: 4,
    icon: '👴',
    color: '#6366f1',
    category: 'advanced',
    body: [
      'NPS is a voluntary retirement savings scheme backed by the Government of India. It offers a mix of equity, corporate bonds, and government securities.',
      'Tax Benefits: Contributions up to ₹1.5L are covered under 80C. More importantly, an additional ₹50,000 deduction is available under Section 80CCD(1B), bringing the total possible deduction to ₹2 Lakhs.',
      'Low Cost: NPS has some of the lowest fund management charges globally (0.01%), meaning more of your money grows for you.',
      'Withdrawal Rules: At age 60, you can withdraw up to 60% of the corpus tax-free. The remaining 40% must be used to purchase an annuity to provide a regular pension.',
    ],
    keyTakeaways: [
      'Use NPS to claim the extra ₹50k tax deduction.',
      'Opt for the Active Choice and maximize your equity exposure (up to 75%) if you are young.',
      'Remember, the primary goal of NPS is a locked-in retirement corpus.',
    ],
    roles: ['professional', 'business'],
  },
  {
    id: 'l11',
    title: 'The F&O Trap',
    summary: 'Why 90% of retail traders lose money in Futures & Options.',
    readingTime: 4,
    xpReward: 250,
    level: 5,
    icon: '⚠️',
    color: '#ef4444',
    category: 'mindset',
    body: [
      'Futures and Options (F&O) are derivative instruments designed for hedging risk, not for gambling. However, retail participation has surged due to the illusion of quick wealth.',
      'The Reality: According to SEBI, 9 out of 10 individual traders in the equity F&O segment incurred net losses. The average loss was over ₹1.1 Lakh.',
      'Leverage is a Double-Edged Sword: F&O allows you to control large positions with little capital. While gains are magnified, losses are equally magnified, capable of wiping out your entire capital in minutes.',
      'Transaction Costs: Frequent trading racks up massive brokerage fees, STT, exchange charges, and GST. Even if you break even on trades, fees can turn you into a net loser.',
    ],
    keyTakeaways: [
      'Avoid F&O trading entirely if you are building long-term wealth.',
      'Invest time in your career and passive index funds instead.',
      'If you must trade, treat it as entertainment money, not an investment.',
    ],
    roles: ['student', 'professional', 'business'],
  },
];
