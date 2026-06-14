import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '@/types';

const STORAGE_KEY = 'spendwise_theme_v1';

function loadTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Respect system preference on first visit
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  } catch { /* silently ignore — non-critical */ }
  return 'dark';
}

// ─── Apply theme to <html> element ────────────────────────────────────────────
// We toggle a class on <html> that CSS variables are keyed to.

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* silently ignore — non-critical */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setDark = useCallback(() => setTheme('dark'), []);
  const setLight = useCallback(() => setTheme('light'), []);

  return { theme, toggleTheme, setDark, setLight, isDark: theme === 'dark' };
}
