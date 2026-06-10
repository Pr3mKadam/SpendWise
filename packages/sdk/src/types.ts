export interface AnalyticsConfig {
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    type: 'credit' | 'debit';
  }>;
  currency: string;
  theme?: Record<string, string>;
  onBudgetAlert?: (alert: { category: string; spent: number; limit: number }) => void;
}
