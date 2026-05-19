import { BookOpen, TrendingUp, Shield, Sparkles, Zap } from 'lucide-react';

export const CATEGORY_CONFIG = {
  budgeting: { label: 'Budgeting', icon: <BookOpen size={14} />, color: '#14b8a6' },
  investing: { label: 'Investing', icon: <TrendingUp size={14} />, color: '#6366f1' },
  debt: { label: 'Debt', icon: <Shield size={14} />, color: '#ef4444' },
  mindset: { label: 'Mindset', icon: <Sparkles size={14} />, color: '#ec4899' },
  advanced: { label: 'Advanced', icon: <Zap size={14} />, color: '#8b5cf6' },
};
