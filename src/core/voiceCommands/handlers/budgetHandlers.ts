import { useStore } from '@/store';
import { Category } from '@/types';
import { IntentHandler, formatCurrency } from './types';

export const handleBudgetUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { category, amount } = command.entities;
  if (!category) return { success: false, message: 'Which budget category should I update?' };
  if (!amount || amount <= 0)
    return { success: false, message: `What amount should I set for ${category}?` };

  store.setBudget(category as Category, amount);
  return {
    success: true,
    message: `✅ ${category} budget set to ${formatCurrency(amount)}`,
    undoable: true,
  };
};

export const handleBudgetDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { category, amount } = command.entities;
  let targetCategory = category;

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
};

export const handleBudgetReset: IntentHandler = () => {
  const store = useStore.getState();
  store.resetBudgets();
  return { success: true, message: `🗑️ All budgets have been reset.`, undoable: true };
};

export const handleBudgetSettingsUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { period, settingValue } = command.entities;
  if (period) {
    if (['weekly', 'biweekly', 'monthly'].includes(period)) {
      store.updateBudgetSettings({ period: period as 'weekly' | 'biweekly' | 'monthly' });
      return { success: true, message: `✅ Budget period set to ${period}.`, undoable: true };
    }
  } else if (settingValue) {
    const rollover = settingValue === 'on';
    store.updateBudgetSettings({ rolloverEnabled: rollover });
    return {
      success: true,
      message: `✅ Budget rollover ${rollover ? 'enabled' : 'disabled'}.`,
      undoable: true,
    };
  }
  return {
    success: false,
    message: "I couldn't understand the budget setting you want to change.",
  };
};
