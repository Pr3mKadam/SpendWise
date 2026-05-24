export interface MessageData {
  action?: 'CREATE_BUDGET' | 'VIEW_ANALYTICS' | 'SET_GOAL';
  balance?: number;
  expenses?: number;
  topCategory?: string;
  savingsRate?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  type?: 'text' | 'action_card' | 'briefing';
  data?: MessageData;
  streaming?: boolean;
}
