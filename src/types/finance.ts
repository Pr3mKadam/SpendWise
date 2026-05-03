export type DefaultCategory =
  | 'Food'
  | 'Subscriptions'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Income';

export type Category = DefaultCategory | (string & {});

export interface Transaction {
  id:           string;
  date:         string;
  amount:       number;
  category:     Category;
  merchant:     string;
  type:         'credit' | 'debit';
  description?: string;
  isNew?:       boolean;
  isRecurring?: boolean;
  confidence?:  number;
  aiParsed?:    boolean;
  tags?:        string[];
  originalCategory?: string;
  status?:      'completed' | 'pending_approval';
}

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly';

export interface BudgetConfig {
  period:          BudgetPeriod;
  rolloverEnabled: boolean;
}

export interface Budget {
  category:       Category;
  limit:          number;
  baseLimit:      number;
  rolloverAmount: number;
  spent:          number;
  percent:        number;
  remaining:      number;
  status:         'safe' | 'warning' | 'danger';
}

export interface MonthlyStats {
  totalIncome:      number;
  totalExpenses:    number;
  savingsRate:      number;
  netCashFlow:      number;
  avgDailySpend:    number;
  transactionCount: number;
}

export interface MonthlyHistoryPoint {
  month:    string;
  income:   number;
  expenses: number;
  savings:  number;
}

export interface RecurringPattern {
  merchant:      string;
  category:      Category;
  avgAmount:     number;
  frequency:     'weekly' | 'monthly' | 'annual';
  lastSeen:      string;
  nextExpected:  string;
  occurrences:   number;
  totalSpent:    number;
  priceCreep?:   boolean;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id:            string;
  merchant:      string;
  amount:        number;
  category:      Category;
  frequency:     RecurringFrequency;
  lastProcessed: string | null;
  nextOccurrence: string; // ISO date string YYYY-MM-DD
}

export type GoalStatus = 'on-track' | 'at-risk' | 'achieved' | 'paused';

export interface SavingsGoal {
  id:           string;
  name:         string;
  emoji:        string;
  targetAmount: number;
  savedAmount:  number;
  targetDate:   string;
  monthlyContribution: number;
  status:       GoalStatus;
  color:        string;
  createdAt:    string;
}
