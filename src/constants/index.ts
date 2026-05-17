/**
 * SpendWise — Global Constants
 * Single source of truth for all magic strings, numbers, and feature flags.
 */

// ─── localStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  CONFIG:            'spendwise_config_v1',
  THEME:             'spendwise_theme',
  HIGH_CONTRAST:     'spendwise_high_contrast',
  MERCHANT_MEMORY:   'spendwise_merchant_memory',
  RZP_KEY:           'spendwise_rzp_key',
  RZP_SECRET:        'spendwise_rzp_secret',
  SUPABASE_SESSION:  'spendwise_supabase_session_v1',
  LAST_SYNC:         'spendwise_last_sync_v1',
  ROUND_UP_VAULT:    'spendwise_roundup_vault_v1',
  QUEST_LAST_RESET:  'sw_quest_last_reset',
  NOTIFICATIONS:     'sw_notifications',
} as const;

// ─── Financial Defaults ───────────────────────────────────────────────────────
export const FINANCE_DEFAULTS = {
  INITIAL_BALANCE:          0,
  SUBSCRIPTION_WINDOW_DAYS: 30,
  SUBSCRIPTION_MIN_DAYS:    25,
  SUBSCRIPTION_MAX_DAYS:    35,
  PRICE_HIKE_THRESHOLD:     0.10,   // 10% increase triggers alert
  ROUND_UP_XP_REWARD:       15,
  DAILY_SPEND_WINDOW_DAYS:  30,
} as const;

// ─── Gamification Thresholds ──────────────────────────────────────────────────
export const GAMIFICATION = {
  XP_PER_TRANSACTION:   10,
  XP_PER_GOAL_COMPLETE: 50,
  XP_LEVEL_MULTIPLIER:  100,       // level N requires N * 100 XP
} as const;

// ─── Feature Flags ────────────────────────────────────────────────────────────
// Set these via .env (VITE_FEATURE_*) for runtime configuration.
export const FEATURES = {
  CLOUD_SYNC:  !!import.meta.env.VITE_SUPABASE_URL,
  PLAID_LIVE:  !!import.meta.env.VITE_PLAID_CLIENT_ID,
  VOICE_INPUT: 'speechRecognition' in window || 'webkitSpeechRecognition' in window,
} as const;

// ─── App Metadata ─────────────────────────────────────────────────────────────
export const APP = {
  NAME:    'SpendWise',
  VERSION: '4.0.0',
} as const;
