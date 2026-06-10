export type DefaultCategory =
  | 'Food'
  | 'Subscriptions'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Travel'
  | 'Education'
  | 'Business'
  | 'Income'
  | 'Debt'
  | 'Investment';

export type Category = DefaultCategory | (string & {});

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: Category;
  merchant: string;
  type: 'credit' | 'debit';
  description?: string;
  isNew?: boolean;
  isRecurring?: boolean;
  confidence?: number;
  aiParsed?: boolean;
  tags?: string[];
  originalCategory?: string;
  splits?: TransactionSplit[];
  receiptUrl?: string;
  status?: 'posted' | 'scheduled' | 'completed' | 'pending_approval';
  deletedAt?: string;
  updatedAt?: string;
  originalCurrency?: string;
  exchangeRate?: number;
  createdAt?: string;
}

export interface TransactionSplit {
  label: string;
  category: Category;
  amount: number;
}

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly';

export interface BudgetConfig {
  period: BudgetPeriod;
  rolloverEnabled: boolean;
}

export type BudgetConfidence = 'high' | 'medium' | 'low';

export interface CategorySpend {
  name: Category;
  value: number;
  color: string;
  percent: number;
}

export interface BalanceDataPoint {
  date: string;
  balance: number;
  projected?: boolean;
}

export interface BudgetSuggestion {
  category: Category;
  suggestedLimit: number;
  confidence: BudgetConfidence;
  reasoning: string;
  avgSpend?: number;
}

export interface Budget {
  category: Category;
  limit: number;
  baseLimit: number;
  rolloverAmount: number;
  spent: number;
  percent: number;
  remaining: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  netCashFlow: number;
  avgDailySpend: number;
  transactionCount: number;
  topCategory?: string;
  categoryDistribution?: Record<string, number>;
}

export interface MonthlyHistoryPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface RecurringPattern {
  merchant: string;
  category: Category;
  avgAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual';
  lastSeen: string;
  nextExpected: string;
  occurrences: number;
  totalSpent: number;
  priceCreep?: boolean;
  isTrial?: boolean;
  trialEndsAt?: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export type MandateFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type MandateStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type MandateType = 'emi' | 'sip' | 'subscription' | 'insurance' | 'other';

export interface UPIMandate {
  id: string;
  umr: string;
  merchant: string;
  amount: number;
  frequency: MandateFrequency;
  status: MandateStatus;
  startDate: string;
  nextDebit: string;
  lastDebit?: string;
  provider: string;
  category: DefaultCategory;
  type: MandateType;
}

export interface RecurringTransaction {
  id: string;
  merchant: string;
  amount: number;
  category: Category;
  frequency: RecurringFrequency;
  lastProcessed: string | null;
  nextOccurrence: string; // ISO date string YYYY-MM-DD
  isTrial?: boolean;
  trialEndsAt?: string;
}

export type GoalStatus = 'on-track' | 'at-risk' | 'achieved' | 'paused';

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  monthlyContribution: number;
  status: GoalStatus;
  color: string;
  createdAt: string;
}

export interface SpendingPersonality {
  archetype: string;
  description: string;
  traits: string[];
  advice: string;
}

export interface RemittanceRecord {
  fromCurrency: string;
  toAmount: number;
  rate: number;
  fee: number;
  date: string;
  method: string;
}

export interface CreditScore {
  score: number;
  date: string;
  factors: CreditScoreFactor[];
}

export interface CreditScoreFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface LoanEligibility {
  bankName: string;
  loanType: string;
  maxAmount: number;
  interestRate: string;
  probability: 'high' | 'medium' | 'low';
}
