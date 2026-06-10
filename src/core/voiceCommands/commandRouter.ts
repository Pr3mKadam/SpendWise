/**
 * Voice Command Router — SpendWise Master Voice Engine
 *
 * Routes parsed VoiceCommand objects to the correct Zustand store actions.
 * Handles all intents: budget updates, transactions, liabilities, portfolio,
 * goals, subscriptions, navigation, and PDF report export.
 */

import { VoiceCommand, CommandResult } from '@/core/voiceCommands/types';
import { AppView } from '@/types';
import { IntentHandler } from './handlers/types';
import * as Handlers from './handlers';

// Map of intents to their respective handlers
const intentMap: Record<string, IntentHandler> = {
  // Navigation & UI
  SETTINGS_TOGGLE: Handlers.handleSettingsToggle,
  NAVIGATE: Handlers.handleNavigate,
  SEARCH_ACTION: Handlers.handleSearchAction,
  REPORT_EXPORT: Handlers.handleReportExport,
  HELP: Handlers.handleHelp,
  UNDO_ACTION: Handlers.handleUndoAction,

  // Queries
  DATA_QUERY: Handlers.handleDataQuery,
  QUERY_REPORT: Handlers.handleQueryReport,

  // Transactions
  TRANSACTION_ADD: Handlers.handleTransactionAdd,
  TRANSACTION_DELETE: Handlers.handleTransactionDelete,
  TRANSACTION_UPDATE: Handlers.handleTransactionUpdate,
  BATCH_TRANSACTIONS: Handlers.handleBatchTransactions,
  TRANSACTION_BULK_DELETE: Handlers.handleTransactionBulkDelete,
  TRANSACTION_BULK_UPDATE: Handlers.handleTransactionBulkUpdate,
  RECURRING_ADD: Handlers.handleRecurringAdd,
  RECURRING_DELETE: Handlers.handleRecurringDelete,

  // Budgets
  BUDGET_UPDATE: Handlers.handleBudgetUpdate,
  BUDGET_DELETE: Handlers.handleBudgetDelete,
  BUDGET_RESET: Handlers.handleBudgetReset,
  BUDGET_SETTINGS_UPDATE: Handlers.handleBudgetSettingsUpdate,

  // Liabilities
  LIABILITY_ADD: Handlers.handleLiabilityAdd,
  LIABILITY_PAY: Handlers.handleLiabilityPay,
  LIABILITY_DELETE: Handlers.handleLiabilityDelete,

  // Portfolio
  PORTFOLIO_UPDATE: Handlers.handlePortfolioUpdate,
  PORTFOLIO_ADJUST: Handlers.handlePortfolioAdjust,
  PORTFOLIO_DELETE: Handlers.handlePortfolioDelete,

  // Goals
  GOAL_ADD: Handlers.handleGoalAdd,
  GOAL_UPDATE: Handlers.handleGoalUpdate,
  GOAL_DELETE: Handlers.handleGoalDelete,

  // Subscriptions
  SUBSCRIPTION_ADD: Handlers.handleSubscriptionAdd,
  SUBSCRIPTION_UPDATE: Handlers.handleSubscriptionUpdate,
  SUBSCRIPTION_DELETE: Handlers.handleSubscriptionDelete,

  // Gamification (Quests)
  QUEST_ACTION: Handlers.handleQuestAction,
  QUEST_CLAIM: Handlers.handleQuestClaim,

  // Parental & Settings
  PARENTAL_TOGGLE: Handlers.handleParentalToggle,
  PARENTAL_LIMIT_SET: Handlers.handleParentalLimitSet,
  PARENTAL_RESTRICT_CATEGORY: Handlers.handleParentalRestrictCategory,
  PARENTAL_APPROVE_TX: Handlers.handleParentalApproveTx,
  PARENTAL_DENY_TX: Handlers.handleParentalDenyTx,
  SESSION_LOCK: Handlers.handleSessionLock,
};

/**
 * Execute a parsed VoiceCommand against the Zustand store.
 * Returns a CommandResult with success status and user-facing message.
 */
export async function executeCommand(
  command: VoiceCommand,
  navigate: (view: AppView) => void,
  onExport: () => void,
  toggleTheme: () => void,
  setSearchQuery?: (q: string) => void
): Promise<CommandResult> {
  const handler = intentMap[command.intent];

  if (handler) {
    return await handler({ command, navigate, onExport, toggleTheme, setSearchQuery });
  }

  // Fallback for unknown intents
  return {
    success: false,
    message: `I didn't understand that command. Try "Help" to see what I can do!`,
  };
}
