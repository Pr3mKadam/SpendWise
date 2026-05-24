import { useCallback, useEffect } from 'react';
import { useStore } from '@/store';
import { AppView } from '@/types';

const VIEW_COLORS: Record<AppView, string> = {
  dashboard: '#0f172a',
  analytics: '#f4f6fb',
  budget: '#ffffff',
  history: '#ffffff',
  goals: '#ffffff',
  portfolio: '#0f172a',
  sync: '#ffffff',
  profile: '#ffffff',
  parental: '#ffffff',
  shared: '#ffffff',
  subscriptions: '#ffffff',
  advisor: '#0f172a',
  education: '#ffffff',
  reports: '#ffffff',
  transactions: '#ffffff',
  settings: '#ffffff',
  quests: '#ffffff',
  inventory: '#ffffff',
  shop: '#ffffff',
  badges: '#ffffff',
  gamification: '#ffffff',
};

export function useAppTheme(activeView: AppView) {
  const prefs = useStore(s => s.userPreferences);
  const setUserPreferences = useStore(s => s.setUserPreferences);

  const theme: 'light' | 'dark' = prefs.darkMode ? 'dark' : 'light';

  const toggleTheme = useCallback(() => {
    setUserPreferences(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  }, [setUserPreferences]);

  useEffect(() => {
    const color = theme === 'dark' ? '#0f172a' : VIEW_COLORS[activeView] || '#ffffff';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      (meta as HTMLMetaElement).name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, [activeView, theme]);

  return { theme, toggleTheme };
}
