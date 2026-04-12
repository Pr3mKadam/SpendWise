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
  tags?:        string[]; // Phase 4.2 custom tags
  status?:      'completed' | 'pending_approval'; // parental control gate
}

// ─── Budget types ──────────────────────────────────────────────────────────────

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly';

export interface BudgetConfig {
  period:          BudgetPeriod;
  rolloverEnabled: boolean;
}

export interface Budget {
  category:       Category;
  limit:          number;  // effective limit = baseLimit + rolloverAmount
  baseLimit:      number;  // the user-configured limit
  rolloverAmount: number;  // amount carried over from previous period
  spent:          number;
  percent:        number;
  remaining:      number;
  status:         'safe' | 'warning' | 'danger';
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

export interface CustomCategoryDef {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type AppView =
  | 'dashboard'
  | 'budget'
  | 'analytics'
  | 'history'
  | 'goals'
  | 'shared'
  | 'sync'
  | 'profile'
  | 'portfolio'
  | 'subscriptions';

// ─── Shared household (roommates, friends, family) — local-first ─────────────

export type HouseholdPurpose = 'roommates' | 'friends' | 'family' | 'other';

export interface HouseholdMember {
  id:   string;
  name: string;
  emoji: string;
  /** Optional label, e.g. "Mom", "Flatmate" */
  relation?: string;
}

export interface HouseholdSettings {
  name:    string;
  purpose: HouseholdPurpose;
  members: HouseholdMember[];
}

export type SharedWalletEntryKind = 'contribution' | 'spend_from_pot' | 'withdrawal';

/** Joint cash pot: contributions in, spends/withdrawals out */
export interface SharedWalletEntry {
  id:        string;
  date:      string;
  kind:      SharedWalletEntryKind;
  amount:    number;
  memberId:  string;
  label:     string;
  createdAt: string;
}

export interface SharedExpenseSplit {
  memberId:     string;
  sharePercent: number;
}

/** Split bill: who paid and each person’s fair share (%) */
export interface SharedExpense {
  id:              string;
  date:            string;
  label:           string;
  category:        string;
  amount:          number;
  paidByMemberId:  string;
  splits:          SharedExpenseSplit[];
  createdAt:       string;
}

export interface SharedGoalContribution {
  id:       string;
  date:     string;
  memberId: string;
  amount:   number;
  note?:    string;
}

/** Group savings target (trip, furniture, emergency jar, etc.) */
export interface SharedSavingsGoal {
  id:           string;
  name:         string;
  emoji:        string;
  targetAmount: number;
  targetDate:   string;
  color:        string;
  memberIds:    string[];
  contributions: SharedGoalContribution[];
  createdAt:    string;
}

// ─── Phase 6.1: Bank / UPI Integration ──────────────────────────────────────────

export type UPIProvider = 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'bhim' | 'other';

// ─── Phase 7.1: Portfolio / Net Worth ────────────────────────────────────────────

export type AssetType = 'bank' | 'investment' | 'crypto' | 'property' | 'other';
export type LiabilityType = 'loan' | 'credit_card' | 'mortgage' | 'other';

export interface AssetEntry {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
  lastUpdated: string; // ISO date
}

export interface LiabilityEntry {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  currency?: string;
  icon?: string;
  lastUpdated: string; // ISO date
}

export interface UPIAccount {
  id: string;
  provider: UPIProvider;
  upiId: string;
  linkedAt: string; // ISO date
  lastSynced: string; // ISO date
  status: 'active' | 'error' | 'disconnected';
}


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
