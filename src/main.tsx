import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./hooks/useCategories";
import { CurrencyProvider } from "./contexts/CurrencyContext";

import { registerSW } from 'virtual:pwa-register';
import { runDexieMigration } from './db/migration';

// Register service worker for PWA (immediate: ensures update on next visit)
registerSW({ immediate: true });

// Run one-time migration from legacy localStorage → IndexedDB on first load
runDexieMigration().catch(err =>
  console.warn('[SpendWise] Dexie migration skipped or failed:', err)
);

// ── Restore user preferences before first paint ───────────────────────────────
(function restorePreferences() {
  // Dark mode
  const theme = localStorage.getItem('spendwise_theme');
  if (theme === 'dark') document.documentElement.classList.add('dark');

  // Font size
  const fontSizeClasses = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
  const savedFont = localStorage.getItem('spendwise_font_size');
  if (savedFont && fontSizeClasses.includes(savedFont)) {
    document.documentElement.classList.add(savedFont);
  }

  // High contrast
  if (localStorage.getItem('spendwise_high_contrast') === 'true') {
    document.documentElement.classList.add('high-contrast');
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <CategoryProvider>
          <App />
        </CategoryProvider>
      </CurrencyProvider>
    </AuthProvider>
  </StrictMode>
);
