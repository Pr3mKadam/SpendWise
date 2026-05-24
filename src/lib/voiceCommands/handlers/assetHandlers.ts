import { useStore } from '@/store';
import { IntentHandler, formatCurrency, shortId, todayISO } from './types';
import { Transaction } from '@/types';

// LIABILITY HANDLERS
export const handleLiabilityAdd: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, name } = command.entities;
  if (!amount || amount <= 0) return { success: false, message: 'What is the loan amount?' };
  store.addLiability({
    name:        name || 'Loan',
    type:        'loan',
    balance:     amount,
  });
  return {
    success: true,
    message: `✅ Liability "${name || 'Loan'}" of ${formatCurrency(amount)} added`,
    undoable: false,
  };
};

export const handleLiabilityPay: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, name } = command.entities;
  if (!amount || amount <= 0) return { success: false, message: 'How much did you pay?' };
  if (!name) return { success: false, message: 'Which liability did you pay?' };
  
  const liability = store.liabilities.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
  if (!liability) return { success: false, message: `I couldn't find a liability named ${name}.` };
  
  store.updateLiability(liability.id, { balance: Math.max(0, liability.balance - amount) });
  
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
    message: `✅ Recorded ${formatCurrency(amount)} payment towards ${liability.name}.`,
    undoable: true,
  };
};

export const handleLiabilityDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { name } = command.entities;
  if (!name) return { success: false, message: 'Which liability should I delete?' };
  const liability = store.liabilities.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
  if (!liability) return { success: false, message: `I couldn't find a liability named ${name}.` };
  
  store.deleteLiability(liability.id);
  return { success: true, message: `🗑️ Deleted liability: ${liability.name}.`, undoable: true };
};

// PORTFOLIO HANDLERS
export const handlePortfolioUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, ticker } = command.entities;
  if (!amount || amount <= 0) return { success: false, message: 'What is the investment amount?' };
  store.addAsset({
    name:        ticker || 'Investment',
    type:        'investment',
    balance:     amount,
  });
  return {
    success: true,
    message: `✅ Investment "${ticker || 'Portfolio'}" of ${formatCurrency(amount)} recorded`,
    undoable: false,
  };
};

export const handlePortfolioAdjust: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { ticker, name, amount } = command.entities;
  const target = ticker || name;
  if (!target) return { success: false, message: 'Which asset should I update?' };
  if (amount === undefined) return { success: false, message: `What should I set the value of ${target} to?` };
  
  const asset = store.assets.find(a => a.name.toLowerCase().includes(target.toLowerCase()));
  if (!asset) return { success: false, message: `I couldn't find an asset named ${target}.` };
  
  store.updateAsset(asset.id, { balance: amount });
  return { success: true, message: `✅ Updated ${asset.name} value to ${formatCurrency(amount)}.`, undoable: true };
};

export const handlePortfolioDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { ticker, name } = command.entities;
  const target = ticker || name;
  if (!target) return { success: false, message: 'Which asset should I delete?' };
  const asset = store.assets.find(a => a.name.toLowerCase().includes(target.toLowerCase()));
  if (!asset) return { success: false, message: `I couldn't find an asset named ${target}.` };
  
  store.deleteAsset(asset.id);
  return { success: true, message: `🗑️ Deleted asset: ${asset.name}.`, undoable: true };
};

// GOAL HANDLERS
export const handleGoalAdd: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, name } = command.entities;
  if (!amount || amount <= 0) return { success: false, message: 'What is the savings target?' };
  store.addAsset({
    name:        name || 'Savings Goal',
    type:        'other',
    balance:     0,
  });
  return {
    success: true,
    message: `✅ Goal "${name || 'Savings Goal'}" created with target ${formatCurrency(amount)}`,
    undoable: false,
  };
};

export const handleGoalUpdate: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { amount, targetAmount, name } = command.entities;
  if (!name) return { success: false, message: 'Which goal should I update?' };
  
  const goal = store.assets.find(a => a.type === 'other' && a.name.toLowerCase().includes(name.toLowerCase()));
  if (!goal) return { success: false, message: `I couldn't find a goal named ${name}.` };
  
  if (amount && amount > 0) {
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
    
    return { success: true, message: `✅ Added ${formatCurrency(amount)} to ${goal.name}.`, undoable: true };
  } else if (targetAmount && targetAmount > 0) {
     return { success: false, message: `I can add money to the goal, but changing the target isn't supported yet.` };
  }
  
  return { success: false, message: `What amount should I add to ${name}?` };
};

export const handleGoalDelete: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { name } = command.entities;
  if (!name) return { success: false, message: 'Which goal should I delete?' };
  const goal = store.assets.find(a => a.type === 'other' && a.name.toLowerCase().includes(name.toLowerCase()));
  if (!goal) return { success: false, message: `I couldn't find a goal named ${name}.` };
  
  store.deleteAsset(goal.id);
  return { success: true, message: `🗑️ Deleted goal: ${goal.name}.`, undoable: true };
};
