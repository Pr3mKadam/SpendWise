/**
 * Voice Command Router — SpendWise Master Voice Engine
 *
 * Routes parsed VoiceCommand objects to the correct Zustand store actions.
 * Handles all intents: budget updates, transactions, liabilities, portfolio,
 * goals, subscriptions, navigation, and PDF report export.
 */

import { VoiceCommand, CommandResult } from './types';
import { useStore } from '../../store';
import { Transaction, Category, AppView } from '../../types';

// Utility: generate a short unique id
function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// Utility: today's date as YYYY-MM-DD
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Utility: yesterday's date as YYYY-MM-DD
function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Execute a parsed VoiceCommand against the Zustand store.
 * Returns a CommandResult with success status and user-facing message.
 */
export async function executeCommand(
  command: VoiceCommand,
  navigate: (view: AppView) => void,
  onExport: () => void,
  toggleTheme: () => void,
  setSearchQuery?: (q: string) => void,
): Promise<CommandResult> {
  const store = useStore.getState();

  switch (command.intent) {

    // ── SETTINGS TOGGLE ────────────────────────────────────────────────────────
    case 'SETTINGS_TOGGLE': {
      const { settingKey, settingValue } = command.entities;
      if (settingKey === 'theme') {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        if (settingValue === 'toggle' || (settingValue === 'on' && currentTheme === 'light') || (settingValue === 'off' && currentTheme === 'dark')) {
          toggleTheme();
          return { success: true, message: `🌓 Theme switched to ${currentTheme === 'dark' ? 'light' : 'dark'} mode.` };
        }
        return { success: true, message: `Theme is already ${settingValue === 'on' ? 'dark' : 'light'}.` };
      }
      if (settingKey === 'privacy') {
        const target = settingValue === 'on' ? true : settingValue === 'off' ? false : !store.privacyEnabled;
        if (target !== store.privacyEnabled) {
          store.togglePrivacy();
          return { success: true, message: `🔒 Privacy mode ${target ? 'enabled' : 'disabled'}.` };
        }
        return { success: true, message: `Privacy is already ${target ? 'on' : 'off'}.` };
      }
      return { success: false, message: `I'm not sure how to change that setting yet.` };
    }

    // ── DATA QUERY ─────────────────────────────────────────────────────────────
    case 'DATA_QUERY': {
      const { searchQuery, period } = command.entities;
      const transactions = store.transactions;
      const now = new Date();
      
      const filtered = transactions.filter(t => {
        const tDate = new Date(t.date);
        const isThisMonth = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        const isToday = t.date === todayISO();
        
        if (period === 'month' && !isThisMonth) return false;
        if (period === 'today' && !isToday) return false;
        
        if (searchQuery?.startsWith('merchant_')) {
          const m = searchQuery.replace('merchant_', '').toLowerCase();
          return t.merchant.toLowerCase().includes(m);
        }
        if (searchQuery?.startsWith('category_')) {
          const c = searchQuery.replace('category_', '').toLowerCase();
          return t.category.toLowerCase() === c;
        }
        return true;
      });

      const total = filtered.reduce((sum, t) => sum + (t.type === 'debit' ? t.amount : -t.amount), 0);
      const absTotal = Math.abs(total);
      const pLabel = period === 'today' ? 'Today' : period === 'month' ? 'This month' : 'Total';
      
      if (searchQuery === 'balance') {
        const bal = transactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
        return { success: true, message: `💰 Your current balance is ₹${bal.toLocaleString('en-IN')}.` };
      }

      const entityLabel = searchQuery?.includes('_') ? searchQuery.split('_')[1] : searchQuery;
      return { 
        success: true, 
        message: `📊 ${pLabel} ${entityLabel}: ₹${absTotal.toLocaleString('en-IN')}.` 
      };
    }

    // ── SEARCH ACTION ──────────────────────────────────────────────────────────
    case 'SEARCH_ACTION': {
      const { searchQuery } = command.entities;
      if (!searchQuery) return { success: false, message: 'What should I search for?' };
      if (setSearchQuery) setSearchQuery(searchQuery);
      navigate('history');
      return { success: true, message: `🔍 Searching for "${searchQuery}" in history…` };
    }

    // ── QUEST ACTION ───────────────────────────────────────────────────────────
    case 'QUEST_ACTION': {
      const { actionType } = command.entities;
      if (actionType === 'check') {
        const streak = store.streak || 0;
        return { success: true, message: `🔥 You are on a ${streak} day streak! Keep it up.` };
      }
      navigate('dashboard'); // Assuming quests are visible here or we can trigger the panel
      return { success: true, message: `🎯 Opening your quests and challenges…` };
    }

    // ── TRANSACTION DELETE ──────────────────────────────────────────────────────
    case 'TRANSACTION_DELETE': {
      const { actionType } = command.entities;
      if (actionType === 'all') {
        // We'll just navigate to profile where reset is, or return a message asking to use the button for safety
        return { success: false, message: "⚠️ To reset all data, please use the 'Reset Data' button in your Profile for security." };
      }
      const lastTx = store.transactions[store.transactions.length - 1];
      if (!lastTx) return { success: false, message: "I couldn't find any transactions to delete." };
      
      // Zustand might not have a simple "delete last", we usually delete by ID
      // The store correctly has deleteTransaction from FinanceSlice
      store.deleteTransaction(lastTx.id);
      return { success: true, message: `🗑️ Deleted last transaction: ₹${lastTx.amount} at ${lastTx.merchant}.` };
      return { success: false, message: "I can see the last transaction, but I don't have permission to delete it yet." };
    }

    // ── BUDGET UPDATE ─────────────────────────────────────────────────────────
    case 'BUDGET_UPDATE': {
      const { category, amount } = command.entities;
      if (!category) return { success: false, message: 'Which budget category should I update?' };
      if (!amount || amount <= 0) return { success: false, message: `What amount should I set for ${category}?` };
      store.setBudget(category as Category, amount);
      return {
        success: true,
        message: `✅ ${category} budget set to ₹${amount.toLocaleString('en-IN')}`,
        undoable: true,
      };
    }

    // ── TRANSACTION ADD ───────────────────────────────────────────────────────
    case 'TRANSACTION_ADD': {
      const { amount, name, category, type, period } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'I couldn\'t catch the amount. Please try again.' };
      const date = period === 'yesterday' ? yesterdayISO() : todayISO();
      const tx: Transaction = {
        id:          shortId(),
        merchant:    name || (type === 'credit' ? 'Income' : 'Purchase'),
        amount:      amount,
        type:        type || 'debit',
        category:    (category as Category) || 'Miscellaneous',
        date,
        description: `Added via voice on ${new Date().toLocaleDateString('en-IN')}`,
        tags:        ['voice'],
      };
      store.addTransaction(tx);
      return {
        success: true,
        message: `✅ ${type === 'credit' ? 'Income' : 'Expense'} of ₹${amount.toLocaleString('en-IN')} added${name ? ` — ${name}` : ''}`,
        undoable: true,
      };
    }

    // ── LIABILITY ADD ─────────────────────────────────────────────────────────
    case 'LIABILITY_ADD': {
      const { amount, name } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'What is the loan amount?' };
      store.addLiability({
        name:        name || 'Loan',
        type:        'loan',
        balance:     amount,
      });
      return {
        success: true,
        message: `✅ Liability "${name || 'Loan'}" of ₹${amount.toLocaleString('en-IN')} added`,
        undoable: false,
      };
    }

    // ── PORTFOLIO UPDATE (add asset) ──────────────────────────────────────────
    case 'PORTFOLIO_UPDATE': {
      const { amount, ticker } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'What is the investment amount?' };
      store.addAsset({
        name:        ticker || 'Investment',
        type:        'investment',
        balance:     amount,
      });
      return {
        success: true,
        message: `✅ Investment "${ticker || 'Portfolio'}" of ₹${amount.toLocaleString('en-IN')} recorded`,
        undoable: false,
      };
    }

    // ── GOAL ADD ──────────────────────────────────────────────────────────────
    case 'GOAL_ADD': {
      const { amount, name } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'What is the savings target?' };
      // Goals are stored as assets of type 'goal'
      store.addAsset({
        name:        name || 'Savings Goal',
        type:        'other',
        balance:     0, // current saved amount starts at 0
      });
      return {
        success: true,
        message: `✅ Goal "${name || 'Savings Goal'}" created with target ₹${amount.toLocaleString('en-IN')}`,
        undoable: false,
      };
    }

    // ── SUBSCRIPTION ADD ──────────────────────────────────────────────────────
    case 'SUBSCRIPTION_ADD': {
      const { amount, name, frequency } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'What is the subscription cost?' };
      store.addSubscription({
        merchant:    name || 'Subscription',
        avgAmount:   amount,
        frequency:   frequency || 'monthly',
        category:    'Entertainment',
        lastSeen:     todayISO(),
        nextExpected: todayISO(),
        occurrences:  1,
        totalSpent:   amount,
      });
      return {
        success: true,
        message: `✅ Subscription "${name}" of ₹${amount.toLocaleString('en-IN')}/${frequency || 'month'} added`,
        undoable: false,
      };
    }

    // ── REPORT EXPORT ─────────────────────────────────────────────────────────
    case 'REPORT_EXPORT': {
      onExport();
      return { success: true, message: '📄 Generating your PDF report…' };
    }

    // ── NAVIGATE ──────────────────────────────────────────────────────────────
    case 'NAVIGATE': {
      const { view } = command.entities;
      if (!view) return { success: false, message: 'Which section should I open?' };
      navigate(view);
      return { success: true, message: `📍 Navigating to ${view}` };
    }

    // ── BATCH TRANSACTIONS ────────────────────────────────────────────────────
    case 'BATCH_TRANSACTIONS': {
      const { items } = command.entities;
      if (!items || items.length === 0) return { success: false, message: 'I couldn\'t find any expenses to add in that command.' };
      
      let addedCount = 0;
      for (const item of items) {
        if (item.amount && item.amount > 0) {
          const tx: Transaction = {
            id:          shortId(),
            merchant:    item.name || 'Purchase',
            amount:      item.amount,
            type:        'debit',
            category:    (item.category as Category) || 'Miscellaneous',
            date:        todayISO(),
            description: `Batch added via voice`,
            tags:        ['voice', 'batch'],
          };
          store.addTransaction(tx);
          addedCount++;
        }
      }
      
      return {
        success: true,
        message: `✅ Batch added: ${addedCount} expenses (${items.map(i => `₹${i.amount}`).join(', ')}).`,
        undoable: true,
      };
    }

    // ── QUERY REPORT ──────────────────────────────────────────────────────────
    case 'QUERY_REPORT': {
      const { period, category } = command.entities;
      const transactions = store.transactions;
      const now = new Date();
      
      // Filter transactions by period
      const filtered = transactions.filter(t => {
        const tDate = new Date(t.date);
        if (period === 'month') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        if (period === 'week') {
          const diff = now.getTime() - tDate.getTime();
          return diff >= 0 && diff <= 7 * 86400000;
        }
        if (period === 'today') return t.date === todayISO();
        return true;
      });

      const totalIncome  = filtered.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = filtered.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
      
      const pLabel = period === 'today' ? 'Today' : period === 'week' ? 'This week' : 'This month';
      
      if (category === 'Income') {
        return { success: true, message: `📊 ${pLabel}'s total income: ₹${totalIncome.toLocaleString('en-IN')}.` };
      }
      
      return { 
        success: true, 
        message: `📊 ${pLabel} overview: You spent ₹${totalExpense.toLocaleString('en-IN')}${totalIncome > 0 ? ` and earned ₹${totalIncome.toLocaleString('en-IN')}` : ''}.` 
      };
    }

    // ── HELP ──────────────────────────────────────────────────────────────────
    case 'HELP': {
      return {
        success: true,
        message: '📋 Supported Commands:\n' +
                 '• "Spent 500 on Food"\n' +
                 '• "Set Rent budget to 15000"\n' +
                 '• "Add 5 expenses" (Batch mode)\n' +
                 '• "Summarize this month"\n' +
                 '• "Navigate to Analytics"\n' +
                 '• "Export PDF report"',
      };
    }

    // ── UNKNOWN ───────────────────────────────────────────────────────────────
    default:
      return {
        success: false,
        message: `I didn't understand that command. Try "Help" to see what I can do!`,
      };
  }
}
