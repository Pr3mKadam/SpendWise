import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';

export const handleSubscriptionAdd: IntentHandler = ({ command }) => {
  const store = useStore.getState();
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
    message: `✅ Subscription "${name}" of ${formatCurrency(amount)}/${frequency || 'month'} added`,
    undoable: false,
  };
};

export const handleSubscriptionUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { name, amount, frequency } = command.entities;
  if (!name) return { success: false, message: 'Which subscription should I update?' };
  
  const sub = store.subscriptions.find(s => s.merchant.toLowerCase().includes(name.toLowerCase()));
  if (!sub) return { success: false, message: `I couldn't find a subscription for ${name}.` };
  
  store.updateSubscription(sub.merchant, {
    avgAmount: amount || sub.avgAmount,
    frequency: frequency || sub.frequency,
  });
  return { success: true, message: `🔄 Updated subscription: ${sub.merchant}.`, undoable: true };
};

export const handleSubscriptionDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { name } = command.entities;
  if (!name) return { success: false, message: 'Which subscription should I delete?' };
  
  const sub = store.subscriptions.find(s => s.merchant.toLowerCase().includes(name.toLowerCase()));
  if (!sub) return { success: false, message: `I couldn't find a subscription for ${name}.` };
  
  store.deleteSubscription(sub.merchant);
  return { success: true, message: `🗑️ Deleted subscription: ${sub.merchant}.`, undoable: true };
};
