// ─── Core transaction types ────────────────────────────────────────────────────

export interface Transaction {
  id:           string;
  date:         string;
  amount:       number;
  category:     Category;
  merchant:     string;
  type:         'credit' | 'debit';
  description?: string;  // raw user input text
  isNew?:       boolean; // entry animation flag
  isRecurring?: boolean; // detected as a recurring charge
  confidence?:  number;  // AI parse confidence 0.0–1.0
  aiParsed?:    boolean; // true when parsed by Anthropic API
}

// ─── Budget types ──────────────────────────────────────────────────────────────

export interface Budget {
  category:  Category;
  limit:     number;
  spent:     number;
  percent:   number;
  remaining: number;
  status:    'safe' | 'warning' | 'danger';
}

// ─── Monthly stats ─────────────────────────────────────────────────────────────

export interface MonthlyStats {
  totalIncome:      number;
  totalExpenses:    number;
  savingsRate:      number;
  netCashFlow:      number;
  avgDailySpend:    number;
  transactionCount: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface MonthlyHistoryPoint {
  month:    string;
  income:   number;
  expenses: number;
  savings:  number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export type Category =
  | 'Food'
  | 'Subscriptions'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Income';

// ─── Navigation ───────────────────────────────────────────────────────────────

export type AppView = 'dashboard' | 'budget' | 'analytics' | 'history' | 'goals';

// ─── Chart data ───────────────────────────────────────────────────────────────

export interface BalanceDataPoint {
  date:       string;
  balance:    number;
  projected?: boolean;
}

export interface CategorySpend {
  name:     string;
  value:    number;
  color:    string;
  percent?: number;
}

// ─── Phase 3: Spending Velocity Alert ─────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface SpendingAlert {
  id:         string;
  severity:   AlertSeverity;
  title:      string;
  message:    string;
  category?:  Category;
  actionLabel?: string;
  createdAt:  number; // timestamp
  dismissed:  boolean;
}

// ─── Phase 3: Recurring Transaction Pattern ───────────────────────────────────

export interface RecurringPattern {
  merchant:      string;
  category:      Category;
  avgAmount:     number;
  frequency:     'weekly' | 'monthly' | 'annual';
  lastSeen:      string; // ISO date
  nextExpected:  string; // ISO date
  occurrences:   number;
  totalSpent:    number;
}

// ─── Phase 3: App Notification ────────────────────────────────────────────────

export type NotificationType = 'alert' | 'recurring' | 'goal' | 'insight' | 'budget';

export interface AppNotification {
  id:        string;
  type:      NotificationType;
  title:     string;
  message:   string;
  icon:      string;       // emoji icon
  severity:  AlertSeverity;
  read:      boolean;
  timestamp: number;
  link?:     AppView;      // which tab to navigate to
}

// ─── Phase 3: Savings Goal ────────────────────────────────────────────────────

export type GoalStatus = 'on-track' | 'at-risk' | 'achieved' | 'paused';

export interface SavingsGoal {
  id:           string;
  name:         string;
  emoji:        string;
  targetAmount: number;
  savedAmount:  number;
  targetDate:   string;    // ISO date YYYY-MM-DD
  monthlyContribution: number;
  status:       GoalStatus;
  color:        string;    // hex color for UI accent
  createdAt:    string;    // ISO date
}

// ─── Phase 3: Theme ───────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light';
