# ROADMAP.md - SpendWise Evolution

## Status: ACTIVE
**Current Phase**: 1.8 (Advanced Analytics & UX Polish)

---

## Phase 1: Local-First Foundations

### Phase 1.5: Local-First Migration ✅
- [x] **State Management**: Implemented Zustand store (`src/store/index.ts`).
- [x] **Backend Decoupling**: Removed all Supabase and Convex dependencies.
- [x] **Context Refactor**: Removed `AuthContext` and `ParentalControlContext` in favor of Zustand hooks.
- [x] **UI Restructuring**: Reorganized components into `features/` and `views/` directories.
- [x] **Persistence**: Basic `localStorage` synchronization for transactions and config.

### Phase 1.6: DIY Local Persistence ✅
- [x] **Robust Storage**: Implemented IndexedDB (Dexie.js) for large datasets.
- [x] **Data Migration**: Utility to migrate from `localStorage` to the new DB.
- [x] **Backup/Restore**: JSON export/import + encrypted `.swb` backup format.
- [x] **Encryption**: Client-side AES-256-GCM encryption via Web Crypto API.

### Phase 1.7: Premium AI + Privacy ✅
- [x] **OCR Upgrade**: Gemini 1.5 Flash receipt parsing (with Tesseract fallback).
- [x] **Voice Commands**: Gemini-powered natural language parser + local rule fallback.
- [x] **AI Financial Advisor**: Personalized Gemini insights with local heuristic fallback.
- [x] **Anomaly Detection**: Local Z-score–based spending anomaly detector (zero API).
- [x] **Security Audit**: API key moved to encrypted store; audit docs generated.

### Phase 1.8: Advanced Analytics & UX Polish ✅
- [x] **Tax Predictor**: Finalized Tax Liability Estimator module in AnalyticsView.
- [x] **Spending Forecast**: Local weighted-average next-month forecast (zero API).
- [x] **Soundscape**: Atmospheric audio mounted in MainShell.
- [x] **DashboardView Refactor**: Extracted 10 sub-components; full memoization.
- [x] **ProfileView Refactor**: Extracted ProfileForm, CurrencySelector, DataManagement.
- [x] **Mobile Responsive**: xl-breakpoint-first layouts across all views.
- [x] **Gamification**: WealthCity, QuestsPanel, SavingsChallenges, LevelProgress.

---

## Phase 2: Elite Wealth & Production Polish

### Phase 2.0: Production Launch 🚀
- [ ] **Security Hardening**: Migrate Razorpay/Gemini key storage to encrypted KeyVault pattern.
- [ ] **Compliance**: Final GDPR/CCPA review of local data handling and export flows.
- [ ] **Testing Suite**: Unit + integration tests for crypto, forecast, and anomaly utilities.
- [ ] **Bundle Optimization**: Code-split analytics vendor chunks further.
- [ ] **Deployment**: Finalize Vercel PWA configuration with cache headers.

### Phase 2.1: Community & Sharing (Planned) 📅
- [ ] **Shared Expense Spaces**: P2P bill-splitting with encrypted QR share links.
- [ ] **Export Templates**: PDF monthly statement generator (local, html-to-pdf).
- [ ] **Widget API**: Expose read-only financial snapshot for external dashboards.

---

## Legend
- ✅ Completed
- 🚀 Current Task
- 🛠️ In Progress
- 📅 Planned
