# SpendWise Feature Roadmap

> This roadmap outlines the evolution of SpendWise into a comprehensive personal financial ecosystem.
> Each phase builds on the last while preserving the premium UI and core UX principles.

---

## ✅ Phase 1: Core Dashboard (Complete)
*Foundation: Data model, AI transaction parsing, spending overview.*

- [x] **Transaction Engine** — Add, delete, and persist transactions via Supabase.
- [x] **AI Magic Input** — Natural-language transaction parser powered by Claude AI.
- [x] **Spending Donut** — Category breakdown with animated chart.
- [x] **Balance Chart (Wealth Horizon)** — 30-day balance trend with projected end-of-month.
- [x] **Metric Cards** — Live stats: current balance, top category, savings rate, avg daily spend.
- [x] **Multi-Currency Support** — Select native currency in onboarding; symbols propagate everywhere.

---

## ✅ Phase 2: Intelligence & Budgets (Complete)
*Focus: Giving users actionable financial insight.*

- [x] **Budget Manager** — Per-category limits with safe/warning/danger status rings.
- [x] **AI Coach** — Context-aware spending tips derived from live category data.
- [x] **Analytics View** — Monthly income vs. expenses bar chart + category performance table.
- [x] **Transaction History** — Full sortable and filterable transaction log with CSV-style view.
- [x] **Spending Velocity Alerts** — Banner alerts triggered when spending pace exceeds budget.
- [x] **Recurring Detector** — Automatically identifies and flags subscription/recurring patterns.

---

## ✅ Phase 3: Ecosystem Features (Complete)
*Focus: Goals, notifications, and a polished multi-tab experience.*

- [x] **Savings Goals** — Create, contribute to, and track progress toward financial milestones.
- [x] **Notification Center** — Unified inbox for alerts, budget warnings, and goal milestones.
- [x] **Light / Dark Mode** — Full dual-theme toggle with CSS variable system.
- [x] **Supabase Authentication** — Email/password login with session management and auth gate.
- [x] **Onboarding Modal** — First-run wizard: name, currency, initial balance, and profile setup.
- [x] **Sidebar Navigation** — Collapsible sidebar with over-budget badge counter.

---

## 🚧 Phase 4: Power User Features (Next Up — Short-term)
*Focus: Removing friction and giving users deeper control.*

### 4.1 Data Portability
- [ ] **CSV Export** — Download full transaction history as a `.csv` file, filtered by date range or category.
- [ ] **PDF Monthly Report** — Generate a beautifully styled monthly summary (income, expenses, goals, net cash flow) exportable as a PDF.
- [ ] **Import via CSV** — Bulk-import transactions from a bank-exported CSV using an auto-mapping wizard.

### 4.2 Transaction Enrichment
- [ ] **Custom Categories** — Create, rename, and color-code custom categories beyond the 8 defaults. Persist to Supabase.
- [ ] **Receipt Attachment** — Optionally attach a photo or PDF receipt to any transaction (stored in Supabase Storage).
- [ ] **Transaction Tags** — Free-form tags (e.g. `#work`, `#vacation`) for flexible cross-category filtering.
- [ ] **Split Transactions** — Divide a single transaction across multiple categories (e.g. a grocery run split into Food + Household).

### 4.3 Budget Evolution
- [ ] **Budget Rollover** — Optionally carry over unspent budget from the previous month instead of resetting.
- [ ] **Flexible Budget Periods** — Weekly or bi-weekly budgets in addition to the current monthly cycle.
- [ ] **Budget Templates** — Save and re-apply a full budget layout (e.g. "Student" or "Freelancer" preset).

---

## 📅 Phase 5: Social & Security (Mid-term)
*Focus: Sharing, collaboration, and protecting sensitive data.*

### 5.1 Security
- [ ] **Two-Factor Authentication (2FA)** — TOTP or SMS second factor via Supabase Auth MFA.
- [ ] **Session Management Dashboard** — View and revoke active login sessions from any device.
- [ ] **Data Encryption at Rest** — Client-side encryption of sensitive fields (amounts, merchants) before Supabase sync, using a user-held key.

### 5.2 Profile & Personalization
- [ ] **Profile Page** — Dedicated `/profile` view: change display name, avatar (upload via Supabase Storage), email, currency, and password.
- [ ] **Goal Emoji & Color Picker** — Rich emoji/color palette expanded to 50+ theme options.
- [ ] **Custom Dashboard Layout** — Drag-and-drop card reordering on the overview screen (persisted per user).

### 5.3 Shared Finances
- [ ] **Shared Wallets** — Invite a partner by email; sync specific categories (e.g. Rent, Groceries) in real time via Supabase Realtime subscriptions.
- [ ] **Expense Splitting** — Log a shared transaction and automatically calculate each person's share; send a "you owe me" reminder.
- [ ] **Bill Reminders** — Dedicated "Upcoming Bills" section in the Notification Center for fixed recurring costs, with push notification support.

---

## 🔌 Phase 6: Automation & Bank Connectivity (Power Users)
*Focus: Eliminating manual data entry entirely.*

### 6.1 Bank Integration
- [ ] **Plaid Link** — OAuth connection to 10,000+ banks; auto-import real transactions on a daily schedule.
- [ ] **Sync History** — View the last sync timestamp, resolve duplicates, and approve/reject auto-imported transactions.
- [ ] **Account Balance Aggregation** — Show balances from all connected accounts in the MetricCards area.

### 6.2 Subscriptions Intelligence
- [ ] **Subscription Manager Tab** — Dedicated view listing all detected subscriptions, their cost, and next billing date.
- [ ] **Cancellation Alerts** — Flag subscriptions that have increased in price since last month.
- [ ] **Annual Subscription Cost** — Show total yearly spend on subscriptions in one stat.

### 6.3 Mobile PWA
- [ ] **PWA Manifest & Service Worker** — Make SpendWise installable on iOS/Android home screens.
- [ ] **Offline Mode** — Queue transactions locally when offline; sync when connectivity resumes.
- [ ] **Push Notifications** — Budget warnings and bill reminders delivered to the device even when the app is closed.

---

## 🌐 Phase 7: Financial Ecosystem (Long-term)
*Focus: SpendWise as a complete personal finance command center.*

### 7.1 Investment Tracking
- [ ] **Portfolio Tab** — Track stocks, ETFs, crypto, or retirement fund balances alongside spending.
- [ ] **Net Worth Calculator** — Aggregate all assets (bank accounts, investments, property) minus liabilities (loans, credit) into one trend line.
- [ ] **Asset Allocation Donut** — Visual breakdown of portfolio mix by asset class.

### 7.2 Tax Intelligence
- [ ] **Tax-Deductible Tags** — One-tap flag for business / deductible transactions.
- [ ] **Annual Tax Summary** — Aggregate all flagged transactions by category, exportable to PDF for your accountant.
- [ ] **Mileage Tracker** — Log work-related trips with distance and auto-calculate deductible mileage cost.

### 7.3 Gamification
- [ ] **Streaks & Badges** — Reward consistent logging, staying under budget, or hitting savings goals with unlockable badges.
- [ ] **Monthly Challenge** — Opt-in monthly spending challenges (e.g. "No takeaway in July") with a progress ring.
- [ ] **Financial Health Score** — A single 0–100 score updated monthly, factoring in savings rate, budget adherence, and goal progress.

---

## 🏗️ Technical Debt & Infrastructure
*Ongoing work that enables all phases above.*

- [ ] **Supabase Row-Level Security Audit** — Review all RLS policies to ensure strict per-user data isolation.
- [ ] **E2E Test Suite** — Playwright tests for core flows: login, add transaction, budget alert, goal contribution.
- [ ] **Performance Profiling** — Virtualise the TransactionList for users with 1,000+ transactions.
- [ ] **i18n / Localisation** — Abstract all display strings for future translation; format dates and numbers per locale.
- [ ] **CI/CD Pipeline** — GitHub Actions: lint → typecheck → test → deploy to Vercel on every merge to `main`.

---

## 🎨 UI Design Philosophy
*Principles that keep every phase visually cohesive.*

1. **Tabular Growth** — New features are added as sidebar tabs; the Overview dashboard stays clean.
2. **Adaptive Detail** — Use slide-over Drawer menus to surface complexity only when requested.
3. **Visual Consistency** — Strictly use established CSS variables (`--teal`, `--accent`, `--surface-card`, `--bg`).
4. **Motion Budget** — Every animation must serve a purpose (entry, state change, feedback). No animation for its own sake.
5. **Mobile First** — Every new component must be fully usable on a 375px viewport before desktop polish is added.

---

## 🗓️ Suggested Sprint Order

| Sprint | Focus | Phases |
|--------|-------|--------|
| S1 | CSV Export + PDF Report | 4.1 |
| S2 | Custom Categories + Tags | 4.2 |
| S3 | Budget Rollover + Templates | 4.3 |
| S4 | Profile Page + 2FA | 5.1 + 5.2 |
| S5 | Shared Wallets + Bill Reminders | 5.3 |
| S6 | PWA + Offline Mode | 6.3 |
| S7 | Subscription Manager + Plaid | 6.1 + 6.2 |
| S8 | Investment Tracking + Net Worth | 7.1 |
| S9 | Tax Intelligence + Gamification | 7.2 + 7.3 |
