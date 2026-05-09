import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { CategoryProvider } from "./hooks/useCategories";
import { CurrencyProvider } from "./contexts/CurrencyContext";

import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
registerSW({ immediate: true });

import { runDexieMigration } from './db/migration';
import { db } from './db/db';
import Dexie from 'dexie';

// TEST CODE FOR MIGRATION VERIFICATION
async function testMigration() {
  const flag = localStorage.getItem('test_migration_run_2');
  if (!flag) {
    console.log('Running test migration setup...');
    // Delete DB
    await Dexie.delete('SpendWiseDatabase');
    // Seed localStorage
    localStorage.setItem('spendwise-storage', JSON.stringify({
      state: {
        transactions: [
          { id: 'migrated-1', description: 'Migrated Coffee', amount: 10, date: '2026-05-08', category: 'Food', type: 'expense' }
        ]
      }
    }));
    localStorage.setItem('test_migration_run_2', 'true');
    console.log('Setup complete. Reloading page...');
    window.location.reload();
  }
}

testMigration().then(async () => {
  if (localStorage.getItem('test_migration_run_2') === 'true') {
    await runDexieMigration();
    // Verification log
    const count = await db.transactions.count();
    console.log('VERIFICATION_RESULT: db.transactions count =', count);
    if (count > 0) {
      const all = await db.transactions.toArray();
      console.log('VERIFICATION_RESULT: transactions =', JSON.stringify(all));
    }
  }
});

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
