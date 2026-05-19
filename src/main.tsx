import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/app/App";
import { AuthProvider } from "@/hooks/useAuth";
import { CategoryProvider } from "@/hooks/useCategories";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

import { registerSW } from 'virtual:pwa-register';
import { runDexieMigration } from '@/db/migration';

// Register service worker for PWA (immediate: ensures update on next visit)
registerSW({ immediate: true });

// Run one-time migration from legacy localStorage → IndexedDB on first load
runDexieMigration().catch(err =>
  console.warn('[SpendWise] Dexie migration skipped or failed:', err)
);

// Preferences are now restored via the encrypted Zustand store inside App.tsx

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
