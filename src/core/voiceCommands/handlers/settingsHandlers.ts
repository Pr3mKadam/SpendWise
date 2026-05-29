import { IntentHandler, formatCurrency } from './types';
import { useStore } from '@/store';
import { Category } from '@/types';

export const handleSettingsToggle: IntentHandler = ({ command, toggleTheme }) => {
  const store = useStore.getState();
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
};

export const handleParentalToggle: IntentHandler = ({ command }) => {
  const store = useStore.getState();
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
};

export const handleParentalLimitSet: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount } = command.entities;
  if (!amount || amount <= 0) return { success: false, message: 'What should the monthly limit be?' };
  store.setMonthlyLimit(amount);
  return { success: true, message: `🛡️ Monthly spending limit set to ${formatCurrency(amount)}.`, undoable: true };
};

export const handleParentalRestrictCategory: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { category } = command.entities;
  if (!category) return { success: false, message: 'Which category should I restrict?' };
  store.toggleRestrictedCategory(category as Category);
  return { success: true, message: `🛡️ Toggled restriction for ${category} in teen mode.`, undoable: true };
};

export const handleParentalApproveTx: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, name } = command.entities;
  const pending = store.parentalState.pendingTransactions;
  if (pending.length === 0) return { success: false, message: 'There are no pending transactions to approve.' };
  
  let targetTx = pending[0];
  if (amount || name) {
    const found = pending.find(t => 
      (amount && t.amount === amount) || 
      (name && t.merchant.toLowerCase().includes(name.toLowerCase()))
    );
    if (found) targetTx = found;
  }
  
  store.approveTransaction(targetTx.id);
  return { success: true, message: `✅ Approved transaction for ${targetTx.merchant}.`, undoable: false };
};

export const handleParentalDenyTx: IntentHandler = ({ command }) => {
  const store = useStore.getState();
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
};

export const handleSessionLock: IntentHandler = () => {
  const store = useStore.getState();
  store.lockSession();
  return { success: true, message: `🔒 Session locked.`, undoable: false };
};
