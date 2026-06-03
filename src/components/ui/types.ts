import { Category } from '@/types/finance';

export type AppView =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'analytics'
  | 'history'
  | 'settings'
  | 'goals'
  | 'quests'
  | 'inventory'
  | 'shop'
  | 'badges'
  | 'shared'
  | 'sync'
  | 'profile'
  | 'parental'
  | 'portfolio'
  | 'subscriptions'
  | 'advisor'
  | 'education'
  | 'reports'
  | 'gamification';

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface SpendingAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  category?: Category;
  actionLabel?: string;
  createdAt: number;
  dismissed: boolean;
}

export type NotificationType =
  | 'alert'
  | 'recurring'
  | 'goal'
  | 'insight'
  | 'budget'
  | 'subscription';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  severity: AlertSeverity;
  read: boolean;
  timestamp: number;
  link?: AppView;
}

export type ThemeMode = 'dark' | 'light';
