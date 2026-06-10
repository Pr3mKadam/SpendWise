import { CreditScore, CreditScoreFactor, LoanEligibility } from '@/types';

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockScore(): CreditScore {
  const score = randomInRange(650, 850);
  const now = new Date();
  const date = now.toISOString().split('T')[0];

  const factors: CreditScoreFactor[] = [
    {
      name: 'Payment History',
      impact: score >= 750 ? 'positive' : score >= 600 ? 'neutral' : 'negative',
      description:
        score >= 750
          ? 'On-time payments: 100% — excellent track record ✓'
          : score >= 600
            ? 'On-time payments: 92% — occasional late payments detected ⚠️'
            : 'On-time payments: 78% — multiple late payments reported ✗',
    },
    {
      name: 'Credit Utilisation',
      impact: score >= 750 ? 'positive' : score >= 650 ? 'neutral' : 'negative',
      description:
        score >= 750
          ? 'Using 25% of available credit — well within recommended 30% limit ✓'
          : score >= 650
            ? 'Using 45% of available credit — approaching recommended limit ⚠️'
            : 'Using 72% of available credit — high utilisation dragging score down ✗',
    },
    {
      name: 'Age of Accounts',
      impact: score >= 700 ? 'positive' : 'neutral',
      description: `Average account age: ${(Math.random() * 5 + 1).toFixed(1)} years`,
    },
    {
      name: 'Account Mix',
      impact: score >= 700 ? 'positive' : 'neutral',
      description: `${randomInRange(2, 5)} credit cards, ${randomInRange(0, 2)} loan${randomInRange(0, 2) !== 1 ? 's' : ''}`,
    },
    {
      name: 'Recent Inquiries',
      impact: randomInRange(0, 2) <= 1 ? 'positive' : 'negative',
      description: `${randomInRange(0, 4)} inquiries in last 6 months`,
    },
  ];

  return { score, date, factors };
}

export async function fetchCreditScore(_consentId: string): Promise<CreditScore> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return generateMockScore();
}

export async function getScoreTrend(): Promise<{ month: string; score: number }[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const now = new Date();
  const trend: { month: string; score: number }[] = [];
  let baseScore = randomInRange(680, 720);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    baseScore += randomInRange(-15, 20);
    baseScore = Math.max(600, Math.min(900, baseScore));
    trend.push({ month: label, score: baseScore });
  }

  return trend;
}

export function analyzeScoreFactors(score: CreditScore): {
  positive: CreditScoreFactor[];
  negative: CreditScoreFactor[];
  neutral: CreditScoreFactor[];
} {
  return {
    positive: score.factors.filter(f => f.impact === 'positive'),
    negative: score.factors.filter(f => f.impact === 'negative'),
    neutral: score.factors.filter(f => f.impact === 'neutral'),
  };
}

export function estimateLoanEligibility(
  income: number,
  existingEMIs: number,
  score: number
): LoanEligibility[] {
  const monthlyIncome = income;
  const debtRatio = monthlyIncome > 0 ? existingEMIs / monthlyIncome : 1;
  const isGoodScore = score >= 750;
  const isOkScore = score >= 650;

  const results: LoanEligibility[] = [];

  if (isGoodScore) {
    results.push({
      bankName: 'Axis Bank',
      loanType: 'Personal Loan',
      maxAmount: Math.min(500000, monthlyIncome * 10),
      interestRate: '12%',
      probability: 'high',
    });
  } else if (isOkScore) {
    results.push({
      bankName: 'Axis Bank',
      loanType: 'Personal Loan',
      maxAmount: Math.min(250000, monthlyIncome * 5),
      interestRate: '14.5%',
      probability: 'medium',
    });
  } else {
    results.push({
      bankName: 'Axis Bank',
      loanType: 'Personal Loan',
      maxAmount: Math.min(100000, monthlyIncome * 2),
      interestRate: '18%',
      probability: 'low',
    });
  }

  if (isGoodScore && debtRatio < 0.4) {
    results.push({
      bankName: 'HDFC',
      loanType: 'Credit Card',
      maxAmount: Math.min(100000, monthlyIncome * 3),
      interestRate: '15%',
      probability: 'high',
    });
  } else if (isOkScore) {
    results.push({
      bankName: 'HDFC',
      loanType: 'Credit Card',
      maxAmount: Math.min(50000, monthlyIncome * 1.5),
      interestRate: '18%',
      probability: 'medium',
    });
  } else {
    results.push({
      bankName: 'HDFC',
      loanType: 'Credit Card',
      maxAmount: 25000,
      interestRate: '24%',
      probability: 'low',
    });
  }

  if (isGoodScore && debtRatio < 0.3) {
    results.push({
      bankName: 'SBI',
      loanType: 'Home Loan',
      maxAmount: Math.min(2500000, monthlyIncome * 60),
      interestRate: '8.5%',
      probability: 'medium',
    });
  } else {
    results.push({
      bankName: 'SBI',
      loanType: 'Home Loan',
      maxAmount: Math.min(1500000, monthlyIncome * 40),
      interestRate: '9.5%',
      probability: 'low',
    });
  }

  return results;
}
