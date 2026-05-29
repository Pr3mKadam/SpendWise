import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Target,
  PieChart, TrendingUp, RefreshCw, Users, SmartphoneNfc,
  Bot, GraduationCap, Trophy, Shield, FileText
} from 'lucide-react';
import { AppView } from '@/types';

export const ALL_NAV_ITEMS = [
  { id: 'dashboard'     as AppView, label: 'Overview',      icon: LayoutDashboard },
  { id: 'analytics'     as AppView, label: 'Statistics',    icon: PieChart },
  { id: 'budget'        as AppView, label: 'Budget',        icon: Target },
  { id: 'history'       as AppView, label: 'Transactions',  icon: ArrowLeftRight },
  { id: 'goals'         as AppView, label: 'Goals',         icon: CreditCard },
  { id: 'portfolio'     as AppView, label: 'Net Worth',     icon: TrendingUp },
  { id: 'subscriptions' as AppView, label: 'Subscriptions', icon: RefreshCw },
  { id: 'shared'        as AppView, label: 'Shared',        icon: Users },
  { id: 'sync'          as AppView, label: 'UPI Sync',      icon: SmartphoneNfc },
  { id: 'advisor'       as AppView, label: 'AI Advisor',    icon: Bot },
  { id: 'education'     as AppView, label: 'Learn',         icon: GraduationCap },
  { id: 'quests'        as AppView, label: 'Quests',        icon: Trophy },
  { id: 'parental'      as AppView, label: 'Family',        icon: Shield },
  { id: 'reports'       as AppView, label: 'Reports',       icon: FileText },
];

/** Views shown in the mobile bottom tab bar (2 left + FAB + 2 right) */
export const MOBILE_BOTTOM_IDS = ['dashboard', 'budget', 'history', 'sync'];

/** Views that are too data-heavy for mobile — only navigable from the desktop sidebar */
export const DESKTOP_ONLY_IDS = ['analytics', 'portfolio', 'reports', 'education'];

