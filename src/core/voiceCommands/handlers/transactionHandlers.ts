import { useStore } from '@/store';
import { Transaction, Category } from '@/types';
import { IntentHandler, formatCurrency, shortId, todayISO, yesterdayISO } from './types';

export const handleTransactionAdd: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, name, category, type, period } = command.entities;
  if (!amount || amount <= 0)
    return { success: false, message: "I couldn't catch the amount. Please try again." };

  const date = period === 'yesterday' ? yesterdayISO() : todayISO();
  const tx: Transaction = {
    id: shortId(),
    merchant: name || (type === 'credit' ? 'Income' : 'Purchase'),
    amount: amount,
    type: type || 'debit',
    category: (category as Category) || 'Miscellaneous',
    date,
    description: `Added via voice on ${new Date().toLocaleDateString('en-IN')}`,
    tags: ['voice'],
  };
  store.addTransaction(tx);
  return {
    success: true,
    message: `✅ ${type === 'credit' ? 'Income' : 'Expense'} of ${formatCurrency(amount)} added${name ? ` — ${name}` : ''}`,
    undoable: true,
  };
};

export const handleTransactionDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { actionType } = command.entities;
  if (actionType === 'all') {
    return {
      success: false,
      message:
        "⚠️ To reset all data, please use the 'Reset Data' button in your Profile for security.",
    };
  }
  const lastTx = store.transactions[store.transactions.length - 1];
  if (!lastTx) return { success: false, message: "I couldn't find any transactions to delete." };

  store.deleteTransaction(lastTx.id);
  return {
    success: true,
    message: `🗑️ Deleted last transaction: ${formatCurrency(lastTx.amount)} at ${lastTx.merchant}.`,
  };
};

export const handleTransactionUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { category } = command.entities;
  const lastTx = store.transactions[store.transactions.length - 1];
  if (!lastTx)
    return { success: false, message: "I couldn't find any recent transactions to update." };
  if (!category) return { success: false, message: 'What category should I change it to?' };

  store.updateTransactionCategory(lastTx.id, category as Category);
  return {
    success: true,
    message: `🔄 Changed last transaction's category to ${category}.`,
    undoable: true,
  };
};

export const handleBatchTransactions: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { items } = command.entities;
  if (!items || items.length === 0)
    return { success: false, message: "I couldn't find any expenses to add in that command." };

  let addedCount = 0;
  for (const item of items) {
    if (item.amount && item.amount > 0) {
      const tx: Transaction = {
        id: shortId(),
        merchant: item.name || 'Purchase',
        amount: item.amount,
        type: 'debit',
        category: (item.category as Category) || 'Miscellaneous',
        date: todayISO(),
        description: `Batch added via voice`,
        tags: ['voice', 'batch'],
      };
      store.addTransaction(tx);
      addedCount++;
    }
  }

  return {
    success: true,
    message: `✅ Batch added: ${addedCount} expenses (${items.map(i => formatCurrency(i.amount || 0)).join(', ')}).`,
    undoable: true,
  };
};

export const handleTransactionBulkDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { category, period } = command.entities;
  if (!category)
    return { success: false, message: 'Which category of transactions should I delete?' };

  const transactions = store.transactions;
  const now = new Date();

  const toDelete = transactions.filter(t => {
    if (t.category.toLowerCase() !== category.toLowerCase()) return false;
    if (period) {
      const tDate = new Date(t.date);
      if (
        period === 'month' &&
        (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear())
      )
        return false;
      if (period === 'today' && t.date !== todayISO()) return false;
    }
    return true;
  });

  if (toDelete.length === 0)
    return { success: false, message: `No transactions found to delete for ${category}.` };

  store.bulkDeleteTransactions(toDelete.map(t => t.id));
  return {
    success: true,
    message: `🗑️ Deleted ${toDelete.length} transactions in ${category}.`,
    undoable: true,
  };
};

export const handleTransactionBulkUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { category, name } = command.entities;
  if (!category || !name)
    return { success: false, message: 'Please specify the old category and the new category.' };

  store.bulkReassignCategory(category, name);
  return {
    success: true,
    message: `🔄 Reassigned all ${category} transactions to ${name}.`,
    undoable: true,
  };
};

export const handleRecurringAdd: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, name, frequency, type } = command.entities;
  if (!amount || amount <= 0) return { success: false, message: 'What is the recurring amount?' };
  store.addRecurringTransaction({
    id: shortId(),
    merchant: name || 'Recurring Transaction',
    amount: amount,
    category: 'Miscellaneous',
    frequency: frequency || 'monthly',
    lastProcessed: null,
    nextOccurrence: todayISO(),
  });
  return {
    success: true,
    message: `✅ Recurring ${type === 'credit' ? 'income' : 'expense'} "${name || 'Transaction'}" of ${formatCurrency(amount)}/${frequency || 'month'} added.`,
    undoable: false,
  };
};

export const handleRecurringDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { name } = command.entities;
  if (!name) return { success: false, message: 'Which recurring transaction should I delete?' };

  const rt = store.recurringTransactions.find(r =>
    r.merchant.toLowerCase().includes(name.toLowerCase())
  );
  if (!rt)
    return { success: false, message: `I couldn't find a recurring transaction for ${name}.` };

  store.removeRecurringTransaction(rt.id);
  return {
    success: true,
    message: `🗑️ Deleted recurring transaction: ${rt.merchant}.`,
    undoable: true,
  };
};
