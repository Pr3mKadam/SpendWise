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

    // ── BUDGET DELETE ─────────────────────────────────────────────────────────
    case 'BUDGET_DELETE': {
      const { category, amount } = command.entities;
      let targetCategory = category;
      
      // If no category was explicitly mentioned, try to find a budget matching the amount
      if (!targetCategory && amount) {
        const matchingCategory = Object.keys(store.budgets).find(cat => store.budgets[cat] === amount);
        if (matchingCategory) {
          targetCategory = matchingCategory;
        }
      }

      if (!targetCategory) return { success: false, message: 'Which budget category should I delete?' };
      
      store.removeBudget(targetCategory as string);
      return {
        success: true,
        message: `✅ Deleted budget for ${targetCategory}.`,
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

    // ── TRANSACTION UPDATE ────────────────────────────────────────────────────
    case 'TRANSACTION_UPDATE': {
      const { category, name } = command.entities;
      const lastTx = store.transactions[store.transactions.length - 1];
      if (!lastTx) return { success: false, message: "I couldn't find any recent transactions to update." };
      if (!category) return { success: false, message: "What category should I change it to?" };
      
      store.updateTransactionCategory(lastTx.id, category as Category);
      return { 
        success: true, 
        message: `🔄 Changed last transaction's category to ${category}.`,
        undoable: true
      };
    }

    // ── LIABILITY PAY ─────────────────────────────────────────────────────────
    case 'LIABILITY_PAY': {
      const { amount, name } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'How much did you pay?' };
      if (!name) return { success: false, message: 'Which liability did you pay?' };
      
      const liability = store.liabilities.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
      if (!liability) return { success: false, message: `I couldn't find a liability named ${name}.` };
      
      store.updateLiability(liability.id, { balance: Math.max(0, liability.balance - amount) });
      
      // Also add a transaction for the payment
      const tx: Transaction = {
        id: shortId(),
        merchant: `Payment to ${liability.name}`,
        amount: amount,
        type: 'debit',
        category: 'Miscellaneous',
        date: todayISO(),
        description: `Voice payment`,
        tags: ['voice', 'liability_payment'],
      };
      store.addTransaction(tx);
      
      return {
        success: true,
        message: `✅ Recorded ₹${amount.toLocaleString('en-IN')} payment towards ${liability.name}.`,
        undoable: true,
      };
    }

    // ── LIABILITY DELETE ──────────────────────────────────────────────────────
    case 'LIABILITY_DELETE': {
      const { name } = command.entities;
      if (!name) return { success: false, message: 'Which liability should I delete?' };
      const liability = store.liabilities.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
      if (!liability) return { success: false, message: `I couldn't find a liability named ${name}.` };
      
      store.deleteLiability(liability.id);
      return { success: true, message: `🗑️ Deleted liability: ${liability.name}.`, undoable: true };
    }

    // ── PORTFOLIO DELETE ──────────────────────────────────────────────────────
    case 'PORTFOLIO_DELETE': {
      const { ticker, name } = command.entities;
      const target = ticker || name;
      if (!target) return { success: false, message: 'Which asset should I delete?' };
      const asset = store.assets.find(a => a.name.toLowerCase().includes(target.toLowerCase()));
      if (!asset) return { success: false, message: `I couldn't find an asset named ${target}.` };
      
      store.deleteAsset(asset.id);
      return { success: true, message: `🗑️ Deleted asset: ${asset.name}.`, undoable: true };
    }

    // ── GOAL UPDATE ───────────────────────────────────────────────────────────
    case 'GOAL_UPDATE': {
      const { amount, targetAmount, name } = command.entities;
      if (!name) return { success: false, message: 'Which goal should I update?' };
      
      const goal = store.assets.find(a => a.type === 'other' && a.name.toLowerCase().includes(name.toLowerCase()));
      if (!goal) return { success: false, message: `I couldn't find a goal named ${name}.` };
      
      if (amount && amount > 0) {
        // Adding to the goal balance
        store.updateAsset(goal.id, { balance: goal.balance + amount });
        
        const tx: Transaction = {
          id: shortId(),
          merchant: `Deposit to ${goal.name}`,
          amount: amount,
          type: 'debit',
          category: 'Miscellaneous',
          date: todayISO(),
          description: `Voice goal deposit`,
          tags: ['voice', 'goal_deposit'],
        };
        store.addTransaction(tx);
        
        return { success: true, message: `✅ Added ₹${amount.toLocaleString('en-IN')} to ${goal.name}.`, undoable: true };
      } else if (targetAmount && targetAmount > 0) {
         // Changing the target amount? We don't have a target amount field in asset. We could return a message.
         return { success: false, message: `I can add money to the goal, but changing the target isn't supported yet.` };
      }
      
      return { success: false, message: `What amount should I add to ${name}?` };
    }

    // ── GOAL DELETE ───────────────────────────────────────────────────────────
    case 'GOAL_DELETE': {
      const { name } = command.entities;
      if (!name) return { success: false, message: 'Which goal should I delete?' };
      const goal = store.assets.find(a => a.type === 'other' && a.name.toLowerCase().includes(name.toLowerCase()));
      if (!goal) return { success: false, message: `I couldn't find a goal named ${name}.` };
      
      store.deleteAsset(goal.id);
      return { success: true, message: `🗑️ Deleted goal: ${goal.name}.`, undoable: true };
    }

    // ── SUBSCRIPTION UPDATE ───────────────────────────────────────────────────
    case 'SUBSCRIPTION_UPDATE': {
      const { name, amount, frequency } = command.entities;
      if (!name) return { success: false, message: 'Which subscription should I update?' };
      
      const sub = store.subscriptions.find(s => s.merchant.toLowerCase().includes(name.toLowerCase()));
      if (!sub) return { success: false, message: `I couldn't find a subscription for ${name}.` };
      
      store.updateSubscription(sub.merchant, {
        avgAmount: amount || sub.avgAmount,
        frequency: frequency || sub.frequency,
      });
      return { success: true, message: `🔄 Updated subscription: ${sub.merchant}.`, undoable: true };
    }

    // ── SUBSCRIPTION DELETE ───────────────────────────────────────────────────
    case 'SUBSCRIPTION_DELETE': {
      const { name } = command.entities;
      if (!name) return { success: false, message: 'Which subscription should I delete?' };
      
      const sub = store.subscriptions.find(s => s.merchant.toLowerCase().includes(name.toLowerCase()));
      if (!sub) return { success: false, message: `I couldn't find a subscription for ${name}.` };
      
      store.deleteSubscription(sub.merchant);
      return { success: true, message: `🗑️ Deleted subscription: ${sub.merchant}.`, undoable: true };
    }
    
    // ── RECURRING ADD ─────────────────────────────────────────────────────────
    case 'RECURRING_ADD': {
      const { amount, name, frequency, type } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'What is the recurring amount?' };
      store.addRecurringTransaction({
        id: shortId(),
        merchant: name || 'Recurring Transaction',
        amount: amount,
        category: 'Miscellaneous',
        frequency: frequency || 'monthly',
        lastProcessed: null,
        nextOccurrence: todayISO()
      });
      return {
        success: true,
        message: `✅ Recurring ${type === 'credit' ? 'income' : 'expense'} "${name || 'Transaction'}" of ₹${amount.toLocaleString('en-IN')}/${frequency || 'month'} added.`,
        undoable: false,
      };
    }
    
    // ── RECURRING DELETE ──────────────────────────────────────────────────────
    case 'RECURRING_DELETE': {
      const { name } = command.entities;
      if (!name) return { success: false, message: 'Which recurring transaction should I delete?' };
      
      const rt = store.recurringTransactions.find(r => r.merchant.toLowerCase().includes(name.toLowerCase()));
      if (!rt) return { success: false, message: `I couldn't find a recurring transaction for ${name}.` };
      
      store.removeRecurringTransaction(rt.id);
      return { success: true, message: `🗑️ Deleted recurring transaction: ${rt.merchant}.`, undoable: true };
    }

    // ── PARENTAL TOGGLE ───────────────────────────────────────────────────────
    case 'PARENTAL_TOGGLE': {
      const { settingValue } = command.entities;
      if (settingValue === 'on') {
        if (!store.parentalState.parentPinHash) {
          return { success: false, message: `You need to set up a Parent PIN first in settings.` };
        }
        store.setTeenMode(true);
        return { success: true, message: `🛡️ Teen mode enabled.` };
      } else if (settingValue === 'off') {
        store.setTeenMode(false);
        store.unlockSession();
        return { success: true, message: `🔓 Teen mode disabled.` };
      }
      return { success: false, message: `Do you want to turn teen mode on or off?` };
    }

    // ── PARENTAL LIMIT SET ────────────────────────────────────────────────────
    case 'PARENTAL_LIMIT_SET': {
      const { amount } = command.entities;
      if (!amount || amount <= 0) return { success: false, message: 'What should the monthly limit be?' };
      store.setMonthlyLimit(amount);
      return { success: true, message: `🛡️ Monthly spending limit set to ₹${amount.toLocaleString('en-IN')}.`, undoable: true };
    }
    
    // ── QUEST CLAIM ───────────────────────────────────────────────────────────
    case 'QUEST_CLAIM': {
      const { name } = command.entities;
      const quest = store.quests?.find(q => !q.completed && q.progress >= 100 && (!name || q.title.toLowerCase().includes(name.toLowerCase())));
      if (!quest) return { success: false, message: `I couldn't find any completed quests to claim right now.` };
      
      store.completeQuest(quest.id);
      return { success: true, message: `🎉 Claimed reward for quest: ${quest.title}! You earned ${quest.xpReward} XP.`, undoable: false };
    }

    // ── UNDO ACTION ───────────────────────────────────────────────────────────
    case 'UNDO_ACTION': {
      return { success: true, message: `Attempting to undo the last action...`, undoable: false };
    }

    // ── PORTFOLIO ADJUST ──────────────────────────────────────────────────────
    case 'PORTFOLIO_ADJUST': {
      const { ticker, name, amount } = command.entities;
      const target = ticker || name;
      if (!target) return { success: false, message: 'Which asset should I update?' };
      if (amount === undefined) return { success: false, message: `What should I set the value of ${target} to?` };
      
      const asset = store.assets.find(a => a.name.toLowerCase().includes(target.toLowerCase()));
      if (!asset) return { success: false, message: `I couldn't find an asset named ${target}.` };
      
      store.updateAsset(asset.id, { balance: amount });
      return { success: true, message: `✅ Updated ${asset.name} value to ₹${amount.toLocaleString('en-IN')}.`, undoable: true };
    }

    // ── BUDGET RESET ──────────────────────────────────────────────────────────
    case 'BUDGET_RESET': {
      store.resetBudgets();
      return { success: true, message: `🗑️ All budgets have been reset.`, undoable: true };
    }

    // ── BUDGET SETTINGS UPDATE ────────────────────────────────────────────────
    case 'BUDGET_SETTINGS_UPDATE': {
      const { period, settingValue } = command.entities;
      if (period) {
        if (['weekly', 'biweekly', 'monthly'].includes(period)) {
          store.updateBudgetSettings({ period: period as 'weekly' | 'biweekly' | 'monthly' });
          return { success: true, message: `✅ Budget period set to ${period}.`, undoable: true };
        }
      } else if (settingValue) {
        const rollover = settingValue === 'on';
        store.updateBudgetSettings({ rolloverEnabled: rollover });
        return { success: true, message: `✅ Budget rollover ${rollover ? 'enabled' : 'disabled'}.`, undoable: true };
      }
      return { success: false, message: 'I couldn\'t understand the budget setting you want to change.' };
    }

    // ── TRANSACTION BULK DELETE ───────────────────────────────────────────────
    case 'TRANSACTION_BULK_DELETE': {
      const { category, period } = command.entities;
      if (!category) return { success: false, message: 'Which category of transactions should I delete?' };
      
      const transactions = store.transactions;
      const now = new Date();
      
      const toDelete = transactions.filter(t => {
        if (t.category.toLowerCase() !== category.toLowerCase()) return false;
        if (period) {
          const tDate = new Date(t.date);
          if (period === 'month' && (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear())) return false;
          if (period === 'today' && t.date !== todayISO()) return false;
        }
        return true;
      });
      
      if (toDelete.length === 0) return { success: false, message: `No transactions found to delete for ${category}.` };
      
      store.bulkDeleteTransactions(toDelete.map(t => t.id));
      return { success: true, message: `🗑️ Deleted ${toDelete.length} transactions in ${category}.`, undoable: true };
    }

    // ── TRANSACTION BULK UPDATE ───────────────────────────────────────────────
    case 'TRANSACTION_BULK_UPDATE': {
      const { category, name } = command.entities; // "Change all {category} to {name}"
      if (!category || !name) return { success: false, message: 'Please specify the old category and the new category.' };
      
      // Need to find matching old category to exactly match SpendWise categories
      // For simplicity, we just pass string values, financeSlice accepts string
      store.bulkReassignCategory(category, name);
      return { success: true, message: `🔄 Reassigned all ${category} transactions to ${name}.`, undoable: true };
    }

    // ── PARENTAL RESTRICT CATEGORY ────────────────────────────────────────────
    case 'PARENTAL_RESTRICT_CATEGORY': {
      const { category } = command.entities;
      if (!category) return { success: false, message: 'Which category should I restrict?' };
      store.toggleRestrictedCategory(category as Category);
      return { success: true, message: `🛡️ Toggled restriction for ${category} in teen mode.`, undoable: true };
    }

    // ── PARENTAL APPROVE TX ───────────────────────────────────────────────────
    case 'PARENTAL_APPROVE_TX': {
      const { amount, name } = command.entities;
      const pending = store.parentalState.pendingTransactions;
      if (pending.length === 0) return { success: false, message: 'There are no pending transactions to approve.' };
      
      let targetTx = pending[0]; // Default to the first one
      if (amount || name) {
        const found = pending.find(t => 
          (amount && t.amount === amount) || 
          (name && t.merchant.toLowerCase().includes(name.toLowerCase()))
        );
        if (found) targetTx = found;
      }
      
      store.approveTransaction(targetTx.id);
      return { success: true, message: `✅ Approved transaction for ${targetTx.merchant}.`, undoable: false };
    }

    // ── PARENTAL DENY TX ──────────────────────────────────────────────────────
    case 'PARENTAL_DENY_TX': {
      const { amount, name } = command.entities;
      const pending = store.parentalState.pendingTransactions;
      if (pending.length === 0) return { success: false, message: 'There are no pending transactions to deny.' };
      
      let targetTx = pending[0];
      if (amount || name) {
        const found = pending.find(t => 
          (amount && t.amount === amount) || 
          (name && t.merchant.toLowerCase().includes(name.toLowerCase()))
        );
        if (found) targetTx = found;
      }
      
      store.denyTransaction(targetTx.id);
      return { success: true, message: `🚫 Denied transaction for ${targetTx.merchant}.`, undoable: false };
    }

    // ── SESSION LOCK ──────────────────────────────────────────────────────────
    case 'SESSION_LOCK': {
      store.lockSession();
      return { success: true, message: `🔒 Session locked.`, undoable: false };
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
