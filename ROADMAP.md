# SpendWise Feature Roadmap (Offline-First Edition)

> This roadmap outlines the evolution of SpendWise into a high-performance, privacy-focused personal financial ecosystem.
> We have recently pivoted to a **100% Offline-First AI** model. Foundation features (Core Dashboard, Local OCR, Local Voice Parsing, Supabase Auth) are complete.

---

## 🚀 Phase 1: Local AI & Data Friction Removal
**Status**: ✅ Complete
*Focus: Removing all friction from logging transactions using advanced browser-local processing.*
- [x] **Local Magic Mic** — Voice-to-transaction using native Web Speech API and client-side Regex NLP.
- [x] **Offline Snap Receipt** — Receipt scanning using WebAssembly-based Tesseract.js in the browser.
- [x] **Zero-API Bulk Editor** — Smart heuristics for auto-categorization without cloud AI.

---

## 🏗️ Phase 1.5: Backend Modernization (Convex Migration)
**Status**: 🏗️ In Planning
*Focus: Replacing Supabase with Convex for unified real-time backend and simplified logic.*
- [ ] **Core Setup** — Initialize Convex and define schema.
- [ ] **Auth Transition** — Move from Supabase Auth to Convex-compatible Auth.
- [ ] **Logic Migration** — Rewrite Supabase client calls as Convex functions.

---

## 🎮 Phase 2: Gamification & Behavioral Finance (Current Focus)
*Focus: Keeping users engaged and motivated to save money without relying on a conversational AI coach.*

### 2.1 The "Wealth Tree" & Visual Progress
- [ ] **Dynamic Savings Pet/Tree** — A visual element (like a plant or Tamagotchi) on the dashboard that thrives when you stay under budget and wilts when you overspend.
- [ ] **Unlockable Badges** — Achievements for milestones like "First $1,000 Saved," "Local Privacy Champion," or "Subscription Slayer."

### 2.2 Streaks & Financial Health Score
- [ ] **Daily Logging Streak** — Track consecutive days of opening the app (shown with a 🔥 icon).
- [ ] **Local Health Score Engine** — A dynamically calculated 0–100 score based on savings rate and budget adherence, processed entirely locally.

---

## 📈 Phase 3: Wealth & Subscriptions Ecosystem
*Focus: Moving from just tracking expenses to building long-term wealth.*

### 3.1 Offline-Smart Subscriptions
- [ ] **Subscription Auto-Detector** — Local heuristic engine that scans transaction history for recurring identical amounts and dates to identify subscriptions.
- [ ] **Price Creep Alerts** — Notify the user if a detected recurring bill increases from the previous month.

### 3.2 Portfolio Tracking
- [ ] **Assets Tab** — Track non-cash assets: Stocks, ETFs, Crypto, and Real Estate.
- [ ] **Net Worth Chart** — Aggregate liquid cash (from accounts) + assets - liabilities into a single "Wealth Horizon" chart.

---

## 🛡️ Phase 4: Privacy-First Portability & PWA
*Focus: Complete control over data, security, and true offline capability.*

### 4.1 Progressive Web App (PWA)
- [ ] **Offline Mode** — Implement Service Workers so the app loads and functions even with zero internet connection.
- [ ] **Installable Desktop/Mobile App** — Add web manifest for native-like installation.

### 4.2 Data Portability
- [ ] **Local Backup & Restore** — Export the entire local state to an encrypted JSON file, and restore from it.
- [ ] **Browser-Native PDF Export** — Download full transaction history or beautiful monthly reports for taxes, generated via client-side libraries.

---

## 👥 Phase 5: Social & Shared Finances (Optional Cloud)
*Focus: Managing money with partners, requiring opt-in cloud sync via Supabase.*

### 5.1 Shared Wallets
- [ ] **Wallet Invites** — Invite another Supabase user to join a specific wallet (e.g., "Household Fund").
- [ ] **Real-time Sync** — Transactions added by one partner instantly appear for the other using Supabase Realtime.

### 5.2 Split Expenses
- [ ] **"You Owe Me" Calculator** — Log a transaction and split it 50/50 or custom amounts.

---

## 🎨 UI Design Philosophy
*Principles that keep every phase visually cohesive.*

1. **Bento Grid Architecture** — High-level insights live on the main dashboard; deep dives live in their own tabs.
2. **Privacy First Visuals** — Highlight local processing with "Zero Data Leakage" indicators and padlocks.
3. **Adaptive Detail** — Use slide-over Drawer menus to surface complexity only when requested.
4. **Motion Budget** — Every animation must serve a purpose (entry, state change, feedback).
5. **Mobile First** — Every new component must be fully usable on a 375px viewport before desktop polish is added.
