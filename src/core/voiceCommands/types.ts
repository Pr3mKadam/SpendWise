/**
 * Voice Command Types — SpendWise Master Voice Engine
 * Defines all intents, entities, and result structures.
 */

export type VoiceIntent =
  | 'BUDGET_UPDATE'
  | 'BUDGET_DELETE'
  | 'BUDGET_RESET'
  | 'BUDGET_SETTINGS_UPDATE'
  | 'TRANSACTION_ADD'
  | 'TRANSACTION_UPDATE'
  | 'TRANSACTION_DELETE'
  | 'LIABILITY_ADD'
  | 'LIABILITY_PAY'
  | 'LIABILITY_DELETE'
  | 'PORTFOLIO_UPDATE'
  | 'PORTFOLIO_ADJUST'
  | 'PORTFOLIO_DELETE'
  | 'GOAL_ADD'
  | 'GOAL_UPDATE'
  | 'GOAL_DELETE'
  | 'SUBSCRIPTION_ADD'
  | 'SUBSCRIPTION_UPDATE'
  | 'SUBSCRIPTION_DELETE'
  | 'RECURRING_ADD'
  | 'RECURRING_DELETE'
  | 'REPORT_EXPORT'
  | 'QUERY_REPORT'
  | 'BATCH_TRANSACTIONS'
  | 'TRANSACTION_BULK_DELETE'
  | 'TRANSACTION_BULK_UPDATE'
  | 'SETTINGS_TOGGLE'
  | 'PARENTAL_TOGGLE'
  | 'PARENTAL_LIMIT_SET'
  | 'PARENTAL_RESTRICT_CATEGORY'
  | 'PARENTAL_APPROVE_TX'
  | 'PARENTAL_DENY_TX'
  | 'SESSION_LOCK'
  | 'DATA_QUERY'
  | 'QUEST_ACTION'
  | 'QUEST_CLAIM'
  | 'SEARCH_ACTION'
  | 'NAVIGATE'
  | 'UNDO_ACTION'
  | 'HELP'
  | 'UNKNOWN';

export type AppView =
  | 'dashboard'
  | 'analytics'
  | 'budget'
  | 'goals'
  | 'shared'
  | 'history'
  | 'sync'
  | 'profile'
  | 'portfolio'
  | 'subscriptions';

export interface VoiceEntities {
  category?: string; // "food", "transport", "fuel"
  amount?: number; // 1200, 200000
  targetAmount?: number; // for goal deposits, liability payments
  previousAmount?: number; // for "from X to Y" patterns
  name?: string; // merchant, liability name, goal name
  period?: string; // "yesterday", "today", "this month"
  ticker?: string; // investment name / symbol
  view?: AppView; // for navigation commands
  frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
  type?: 'debit' | 'credit';
  items?: Array<{ amount?: number; category?: string; name?: string }>; // for batching
  settingKey?: string; // "dark mode", "privacy", "currency"
  settingValue?: string; // "on", "off", "usd", "inr"
  searchQuery?: string; // "rent", "starbucks"
  actionType?: string; // "start", "check", "claim"
}

export interface VoiceCommand {
  intent: VoiceIntent;
  entities: VoiceEntities;
  confidence: number; // 0–1
  rawTranscript: string;
  summary: string; // human-readable description of action
}

export interface CommandResult {
  success: boolean;
  message: string;
  undoable?: boolean;
}
