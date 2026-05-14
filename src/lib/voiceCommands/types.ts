/**
 * Voice Command Types — SpendWise Master Voice Engine
 * Defines all intents, entities, and result structures.
 */

export type VoiceIntent =
  | 'BUDGET_UPDATE'
  | 'TRANSACTION_ADD'
  | 'LIABILITY_ADD'
  | 'PORTFOLIO_UPDATE'
  | 'GOAL_ADD'
  | 'SUBSCRIPTION_ADD'
  | 'REPORT_EXPORT'
  | 'QUERY_REPORT'
  | 'BATCH_TRANSACTIONS'
  | 'SETTINGS_TOGGLE'
  | 'DATA_QUERY'
  | 'TRANSACTION_DELETE'
  | 'QUEST_ACTION'
  | 'SEARCH_ACTION'
  | 'NAVIGATE'
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
  category?: string;       // "food", "transport", "fuel"
  amount?: number;         // 1200, 200000
  previousAmount?: number; // for "from X to Y" patterns
  name?: string;           // merchant, liability name, goal name
  period?: string;         // "yesterday", "today", "this month"
  ticker?: string;         // investment name / symbol
  view?: AppView;          // for navigation commands
  frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
  type?: 'debit' | 'credit';
  items?: Array<{ amount?: number; category?: string; name?: string }>; // for batching
  settingKey?: string;     // "dark mode", "privacy", "currency"
  settingValue?: string;   // "on", "off", "usd", "inr"
  searchQuery?: string;    // "rent", "starbucks"
  actionType?: string;     // "start", "check", "claim"
}

export interface VoiceCommand {
  intent: VoiceIntent;
  entities: VoiceEntities;
  confidence: number;      // 0–1
  rawTranscript: string;
  summary: string;         // human-readable description of action
}

export interface CommandResult {
  success: boolean;
  message: string;
  undoable?: boolean;
}
