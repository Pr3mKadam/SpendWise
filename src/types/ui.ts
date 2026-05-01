import { Category } from "./finance";

export type AppView =
  | 'dashboard'
  | 'budget'
  | 'analytics'
  | 'history'
  | 'goals'
  | 'shared'
  | 'sync'
  | 'profile'
  | 'parental'
  | 'portfolio'
  | 'subscriptions'
  | 'advisor'
  | 'reports';

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface SpendingAlert {
  id:         string;
  severity:   AlertSeverity;
  title:      string;
  message:    string;
  category?:  Category;
  actionLabel?: string;
  createdAt:  number;
  dismissed:  boolean;
}

export type NotificationType = 'alert' | 'recurring' | 'goal' | 'insight' | 'budget' | 'subscription';

export interface AppNotification {
  id:        string;
  type:      NotificationType;
  title:     string;
  message:   string;
  icon:      string;
  severity:  AlertSeverity;
  read:      boolean;
  timestamp: number;
  link?:     AppView;
}

export type ThemeMode = 'dark' | 'light';

export interface BalanceDataPoint {
  date:       string;
  balance:    number;
  projected?: boolean;
}

export interface CategorySpend {
  name:     string;
  value:    number;
  color:    string;
  percent?: number;
}
