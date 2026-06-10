export type PlanTier = 'free' | 'pro' | 'family';

export function useFeatureFlag(feature: string): boolean {
  const plan = (localStorage.getItem('spendwise_plan') as PlanTier) || 'free';

  const FEATURE_MAP: Record<string, PlanTier[]> = {
    'ai-advisor': ['pro', 'family'],
    portfolio: ['pro', 'family'],
    'live-prices': ['pro', 'family'],
    'receipt-ocr': ['pro', 'family'],
    'tax-report': ['pro', 'family'],
    'advanced-analytics': ['pro', 'family'],
    'unlimited-goals': ['pro', 'family'],
    'unlimited-budgets': ['pro', 'family'],
    'parental-controls': ['family'],
    'child-profiles': ['family'],
  };

  return (FEATURE_MAP[feature] || ['free']).includes(plan);
}
