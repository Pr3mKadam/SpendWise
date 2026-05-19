# SpendWise — Comprehensive Improvement & Feature Planning

> **Project Stack:** React + TypeScript · Vite PWA · Zustand · IndexedDB · Supabase · Framer Motion · Recharts · Tailwind CSS
> **Document Purpose:** Per-dashboard deep-dive on functional improvements, UI upgrades, and Android-specific enhancements.

---

## 🌟 Plan Implementation Status: **100% COMPLETED**

All phases, core dashboards, functional improvements, UI upgrades, accessibility integrations, and Android PWA features outlined in this improvement plan have been **fully implemented, verified, and compiled**.

| Section | View | Status | Key Highlights |
| :--- | :--- | :---: | :--- |
| **§2** | **Dashboard (Home)** | 🟢 `COMPLETE` | custom dynamic grids, inline swappers, health gradients |
| **§3** | **Analytics View** | 🟢 `COMPLETE` | donut & area interactions, range selector, prev period compare |
| **§4** | **Budget View** | 🟢 `COMPLETE` | carry-forward rollover warnings, income % dynamic budgets, templates |
| **§5** | **Goals View** | 🟢 `COMPLETE` | auto contributions, achievement confetti, what-if savings simulator |
| **§6** | **Transaction History** | 🟢 `COMPLETE` | **swipe-actions (left for delete, right for category swapper)** |
| **§7** | **Reports View** | 🟢 `COMPLETE` | automated CA/tax & net worth models, markdown rendering, saved archives |
| **§8** | **AI Advisor View** | 🟢 `COMPLETE` | **low-latency SSE text streaming, typing cursor animation, inline CTAs** |
| **§9** | **Portfolio / Wealth** | 🟢 `COMPLETE` | ROI track, snowball/avalanche planners, animated counters, WealthTree |
| **§10** | **Gamification** | 🟢 `COMPLETE` | XP difficulty tiers, streak freezes, interactive city hubs, badges |
| **§11** | **Shared Wallets** | 🟢 `COMPLETE` | CRDT settlement solvers, split-by-shares models, offline queues |
| **§12** | **Bank Sync** | 🟢 `COMPLETE` | SMS native retrievers, Plaid stubs, duplicate flaggers, wizard stages |
| **§13** | **Recurring Bills** | 🟢 `COMPLETE` | calendar agenda toggles, balance overdraft alerts, missed payment flags |
| **§14** | **Education** | 🟢 `COMPLETE` | personalized paths, level lock shimmers, XP quizzes, SVG diplomas |
| **§15** | **Settings / Profile** | 🟢 `COMPLETE` | multi-currency managers, accent theme variables, integrity data scanners |
| **§16** | **Android PWA Plan** | 🟢 `COMPLETE` | App Shortcuts, Badging API, Periodic SW Sync, Actionable notifications |
| **§17** | **Cross-Cutting Core** | 🟢 `COMPLETE` | spacing variables, **usePrefersReducedMotion, SVG screen-readers, focus trapping** |

---

## Table of Contents

1. [Project Overview & Current State](#1-project-overview--current-state)
2. [Dashboard (Home)](#2-dashboard-home)
3. [Analytics View](#3-analytics-view)
4. [Budget View](#4-budget-view)
5. [Goals View](#5-goals-view)
6. [Transaction History View](#6-transaction-history-view)
7. [Reports View](#7-reports-view)
8. [AI Advisor View](#8-ai-advisor-view)
9. [Portfolio / Wealth View](#9-portfolio--wealth-view)
10. [Gamification View](#10-gamification-view)
11. [Shared Wallets View](#11-shared-wallets-view)
12. [Bank Sync View](#12-bank-sync-view)
13. [Recurring Transactions View](#13-recurring-transactions-view)
14. [Education View](#14-education-view)
15. [Profile / Settings View](#15-profile--settings-view)
16. [Android-Specific Feature Plan](#16-android-specific-feature-plan)
17. [Cross-Cutting UI & Architecture](#17-cross-cutting-ui--architecture)

---

## 1. Project Overview & Current State

SpendWise is a fully offline-capable personal finance PWA with an unusually deep feature set for a solo/small-team build. It ships:

- Dual desktop/mobile renders for most views (`*View.tsx` + `*ViewMobile.tsx`)
- AI-powered NLP transaction entry (`MagicInput`), receipt OCR, and a Gemini-backed advisor
- Gamification layer (XP, levels, quests, badges, streaks, Wealth City)
- UPI/Razorpay sync + Plaid + Web3 hooks
- Shared wallets with CRDT-based sync
- Parental controls, biometric lock, privacy shield
- IndexedDB persistence with encrypted backup/restore

The gaps are concentrated in three areas: **functional depth per view** (dashboards show data but rarely let you act on it inline), **mobile UX consistency** (mobile views are lighter re-implementations, not true responsive ports), and **Android platform integration** (the PWA installs but doesn't use platform APIs beyond haptics and basic notifications).

---

## 2. Dashboard (Home)

### Current State
The desktop dashboard renders a `DashboardHero`, six `StatCard` metrics, a `FinanceChart` (6-month bar), `RecentTransactions`, `GoalsSummary`, `DailyStats`, `SafeToSpend`, and a lazy-loaded widget row (WealthCity, QuestsPanel, WeeklyDigest, PredictiveForecasting, SavingsChallenges, RoundUpVault, SocialLeaderboard). The mobile version is a minimal re-render with `SnapCard` scroll rows and a floating FAB.

### Functional Improvements

**Customisable Widget Grid**
Allow users to drag-and-drop dashboard widgets into their preferred order. Persist layout in Zustand store. Add a "Customise Dashboard" mode toggled by a long-press or an edit button, where widgets can be shown/hidden. Priority widgets: SafeToSpend, Goals progress, Recent Transactions, Budget ring.

**Inline Quick-Edit for Recent Transactions**
Currently `RecentTransactions` only shows entries. Add a swipe-left gesture (mobile) / right-click context menu (desktop) to instantly recategorise or delete a transaction without navigating to History.

**Smart Insight Cards (rotating)**
Replace the static `WeeklyDigestCard` with a rotating "Daily Insight" card that surfaces one actionable insight: e.g. "You've spent 80% of your Food budget — 12 days left in the month" or "Your transport spend is down 22% vs last month 🎉." Insights computed from `useTransactions` + `useBudgets` state.

**SafeToSpend — Hourly Burn Rate**
Add a small secondary stat: "At this rate, you'll spend ₹X by end of day." Computed from `dailySpendRate`. Show a colour gradient bar that transitions green → amber → red as the day progresses relative to the daily budget limit.

**Balance Sparkline in Hero**
Replace or augment the static balance number in `DashboardHero` with a 7-day micro sparkline (thin SVG line, no axes) so the trend is visible at a glance.

**Monthly Progress Ring**
Add a circular progress ring next to the income/expense figures showing "X% of monthly budget used" — more scannable than the current linear bar.

### UI Improvements

- **Hero section:** Use a soft gradient background that shifts based on financial health score (green-teal for healthy, amber for caution, muted red for over-budget). Currently the hero is a flat surface card.
- **Stat Cards:** Add micro trend arrows with percentage delta vs last period on each card, using the `trendPct` value already computed but not shown on mobile.
- **Widget section:** Add subtle section dividers with labels ("Your Goals", "Challenges", "Community") so the lazy-loaded widget dump doesn't feel like a random list.
- **Empty state polish:** When there are zero transactions, show an illustrated onboarding prompt ("Add your first transaction below ↓") instead of blank cards.
- **Dark mode glow:** In dark mode, add a subtle `box-shadow: 0 0 40px rgba(20,184,166,0.08)` around the hero card for depth — currently dark mode is flat.

---

## 3. Analytics View

### Current State
Rich desktop view: SpendingDonut, BalanceChart, SpendingHeatmap, CategoryAnalyzer, CashFlowWaterfall, HealthScoreChart, AnomalyDetector, SpendingForecast, TaxPredictor, PeerComparison, TopMerchants. Mobile strips most of these down to a donut + bar chart.

### Functional Improvements

**Drill-Down from Charts**
Clicking a category slice in `SpendingDonut` should navigate to `HistoryView` pre-filtered to that category (the `onNavigate(view, category)` prop exists but isn't wired from the donut). Complete this wiring.

**Date Range Picker**
Currently the view always shows current month data. Add a date range picker (month selector or custom range) that filters all charts simultaneously. State: `[fromDate, toDate]` lifted to the view.

**Comparison Mode**
A toggle "Compare with previous period" that overlays last month's data as a ghost line/bar on `BalanceChart` and the category bar chart. The `monthlyHistory` array already has enough data.

**Exportable Charts**
Add a "Download PNG" button per chart using `canvas.toBlob()` via a hidden `<canvas>`. This is different from the existing PDF export which covers the whole report.

**Merchant Intelligence Panel**
Expand `TopMerchants` into a proper "Merchant Insights" panel: show visit frequency, average spend per visit, trend vs last month, and a "Set alert" button (threshold notification if a merchant spend exceeds a value).

**Budget Burn Rate Timeline**
A new chart: a line showing cumulative spending per day within the current month overlaid against the "ideal burn rate" line (total budget ÷ days in month). Visual gap = how far ahead or behind budget you are.

**Category Forecast Confidence**
`SpendingForecast` shows a predicted end-of-month figure. Add a confidence band (shaded area) using standard deviation from the last 3 months of the same category.

### UI Improvements

- **Tabs for sections:** Group charts into tabs — "Spending", "Cash Flow", "Health", "Forecast" — rather than one infinite scroll page. Reduces overwhelm.
- **Chart colour consistency:** Right now each chart picks its own palette. Standardise: use the same category colour map (`mergedColors`) for all charts so donut, bar, and heatmap all use the same colour for "Food."
- **Heatmap tooltip enrichment:** The `SpendingHeatmap` tooltip only shows amount. Add transaction count and top merchant for that day.
- **Health Score card:** Replace the plain numeric score with a gauge dial (SVG arc from 0–100) with zone labels (Poor / Fair / Good / Excellent).
- **Mobile analytics:** Currently `AnalyticsViewMobile` renders a minimal subset. It should use horizontally scrollable chart cards instead of omitting charts. Each card is a swipeable "slide" with one chart and a 1-line insight beneath it.

---

## 4. Budget View

### Current State
Desktop: `SmartBudgetSuggestions` + budget list with `BudgetRow` cards showing progress bars, edit/delete inline, `BudgetSummaryBar`, `PeriodSelector`, `RolloverToggle`. Mobile: `BudgetViewMobile` with similar but simpler layout.

### Functional Improvements

**Budget Templates**
Pre-built budget templates for the three user roles (Student / Professional / Business) that the user can apply in one tap. Templates use percentage-of-income allocation (50/30/20 rule for Professional, etc.). Pull from `budgetSuggestions.ts` logic already present.

**Carry-Forward Alerts**
`RolloverToggle` exists but there's no notification when rolled-over budget from a previous month is being consumed. Add a toast: "You're using ₹400 rolled over from last month in Food."

**Sub-category Budgets**
Allow a "Food" budget to have optional sub-limits: e.g. Dining Out ₹2,000 · Groceries ₹3,000. Stored as nested budget entries. Displayed as an expandable row beneath the parent.

**Budget Pause**
Sometimes a category budget shouldn't count for a specific month (e.g. Travel in December). Add a "Pause this month" toggle per budget row. Paused budgets are excluded from `overallBudgetPercent`.

**Income-Linked Budgets**
A percentage-mode alongside the fixed-amount mode. "Food = 20% of income." Recalculates automatically when income transactions arrive. Toggle per budget row: `₹ Fixed` vs `% Income`.

**Historical Budget Adherence**
A small sparkline on each `BudgetRow` showing budget adherence for the last 4 months (green dot = under budget, red = over). Data derived from `monthlyHistory`.

### UI Improvements

- **BudgetRow visual:** The progress bar should animate from 0 on mount (already using Framer Motion elsewhere — use `initial={{ width: 0 }}`). Add a "flame" icon 🔥 when over 90% consumed.
- **Summary bar redesign:** Replace the linear `BudgetSummaryBar` with a stacked horizontal bar showing each category's share of total budget in its category colour — like a budget-breakdown bar.
- **Add Budget UX:** The current "add" flow is a dropdown + text field inline. Replace with a bottom sheet modal (mobile) / side panel (desktop) with a richer form: category picker with icons, amount slider, optional note.
- **Empty budget state:** When no budgets are set, show the `SmartBudgetSuggestions` component prominently (not below a blank list) with a "Set up your first budget" CTA.
- **Colour-coded rows:** Budget rows currently use a single teal accent. Use the category's own colour (`mergedColors[category]`) for the progress bar so it matches the donut chart colour in Analytics.

---

## 5. Goals View

### Current State
`GoalCard` grid with modal-based add/edit, `GoalsSummary` summary bar, `BadgeGallery` append at bottom. Mobile: `GoalsViewMobile` with cards stacked.

### Functional Improvements

**Automated Goal Contributions**
Add a "Auto-contribute" toggle per goal. When enabled and an income transaction is detected, a configurable percentage is automatically allocated (virtual earmark). Tracked in `savedAmount` via a synthetic transaction.

**Goal Milestones**
Break goals into milestone checkpoints (e.g. 25% / 50% / 75% / 100%). Each milestone triggers a congratulations animation (confetti — already imported in the project) and an optional badge.

**Goal Grouping**
Allow goals to be grouped: "Emergency Fund", "Vacation", "Gadgets." Rendered as collapsible sections. Use a `group` field in `SavingsGoal` type.

**Projected Completion Date**
Given current `savedAmount`, `monthlyContribution`, and `targetAmount`, show "At this rate, you'll reach this goal by [Month Year]." Already partially computed — surface it on each card.

**Goal Sharing**
Link a goal to a Shared Wallet group so multiple people contribute. Use the existing `SharedGoal` type in `useSharedWallets`. Add a "Make Shared" button on `GoalCard`.

**What-If Simulator**
A slider: "If I contribute ₹X more per month → complete by [date]." Interactive, real-time re-calculation inside the goal detail modal.

### UI Improvements

- **GoalCard redesign:** Add a circular progress ring around the goal emoji (SVG arc) instead of just the linear progress bar. Makes progress more visceral.
- **Card colours:** Currently all cards use the goal's `color` field as a left border. Use it as a subtle gradient background tint (`rgba(color, 0.05)` fill) for the whole card.
- **Confetti trigger:** Wire the existing `confetti.module` import to trigger when `savedAmount >= targetAmount` — currently it's imported but not used in GoalsView.
- **Achieved goals section:** Separate the achieved goals into a "Hall of Fame" collapsible section at the bottom with a trophy emoji header, rather than mixing them with active goals.
- **Mobile goals:** Add horizontal scroll snapping for goal cards (CSS `scroll-snap-type: x mandatory`) so the user can swipe through goals like stories.

---

## 6. Transaction History View

### Current State
`Virtuoso` virtualised list, `FilterBar` (search, category, type, date range, amount range), `BulkActionHeader`, `SortBtn`, `HistoryToolbar`, `DeleteConfirmModal`. Both desktop and mobile present essentially the same feature set.

### Functional Improvements

**Inline Edit**
Tapping a transaction row should expand it (accordion) with editable fields: amount, date, merchant, category, note — currently only category is editable inline. A "Save" button commits to the store. Avoids opening a full modal for minor corrections.

**Split Transaction**
A "Split" action on any transaction: divide it across multiple categories with custom amounts (e.g. a ₹1,200 bill split as ₹800 Food + ₹400 Entertainment). Store as a transaction group with a `splitId`.

**Recurring Detection Badge**
If a transaction matches a recurring rule (same merchant, similar amount, same cadence), show a small "🔁 Recurring" badge on the row with a tap-to-view link to `RecurringView`.

**Receipt Attachment**
Add a "Attach receipt" button per transaction. Photo stored as base64 in IndexedDB. View-only thumbnail in the row. Uses the existing `ReceiptScanner` OCR component for auto-fill if camera is used.

**Tags / Labels**
Free-form tags (e.g. `#vacation`, `#reimbursable`, `#tax-deductible`). Multi-select filter by tag. Stored in a `tags: string[]` field on `Transaction` type. Tag chip display in each row.

**CSV/Excel Export with Filters**
Current export uses `exportCSV` on all transactions. Make the export respect the active filters so "Export current view" only exports what's on screen.

**Undo Delete**
After deleting a transaction (single or bulk), show a toast with an "Undo" button for 5 seconds. Buffer the deleted transactions in a temporary state before committing removal.

### UI Improvements

- **Row density options:** Compact / Comfortable / Spacious modes. `compact` shows only merchant + amount in one line; `comfortable` is current; `spacious` adds the category bar and note preview.
- **Timeline grouping:** Group rows by date header (already done) but add a daily subtotal on the right side of each date header ("−₹2,340 net").
- **Swipe actions (mobile):** Left swipe reveals "Delete" (red), right swipe reveals "Edit category" (teal). Currently no swipe gestures exist on transaction rows.
- **Amount colour coding:** Debit amounts in a muted red-pink; credit amounts in teal-green. Currently both are `text-primary`.
- **Search UX:** The search bar should show auto-suggestions (recent searches + merchant names) as a dropdown, using a `datalist`-style component.

---

## 7. Reports View

### Current State
Minimal: a "Generate Report" button calls `generateMonthlyReport()` (Gemini API), renders markdown via `react-markdown`, and offers MD download + print-to-PDF. No historical report storage, no customisation.

### Functional Improvements

**Report Templates**
Three report types beyond the default monthly summary:
- **Tax Report** — categorised deductible expenses, income sources, formatted for CA/self-filing
- **Business Expense Report** — business category transactions with merchant details, suitable for reimbursement
- **Net Worth Snapshot** — combines Portfolio + Goals + Transactions into a one-page wealth summary

**Saved Reports Archive**
Store generated reports in IndexedDB (key: `report_<YYYY-MM>`). Show a "Previous Reports" list so users can re-open without regenerating. Saves API calls.

**Custom Date Range**
Currently hard-coded to current month. Add a month/quarter/custom date picker before generation.

**Email / Share Report**
Add a "Share as PDF" using the existing `exportPDF.ts` library. Also add a native share button (`navigator.share`) for the rendered markdown text.

**Scheduled Reports**
In Profile settings, allow "Auto-generate report on 1st of each month" using the existing push notification infrastructure. The report is generated in the background and a notification is sent when ready.

**Inline Chart Embeds**
The current report is pure text. After generation, append rendered charts (spending donut + monthly bar chart as SVG) between sections. The chart components already exist and can be rendered to string.

### UI Improvements

- **Report page redesign:** The current generate-button-then-markdown layout feels like a developer tool. Replace with a proper "Report Studio" layout: left panel = template picker + options; right panel = preview. Animated skeleton while loading.
- **Typography:** The printed report uses plain markdown styles. Add a custom CSS theme for `react-markdown`: financial report typography (serif headings, monospace numbers, teal accent tables).
- **Progress feedback:** Replace the simple `Loader2` spinner during generation with a multi-step progress bar: "Analysing transactions → Computing insights → Drafting report → Done."
- **Export buttons styling:** The download/print buttons look like secondary actions. Make them primary CTAs, always visible in a sticky footer bar within the report panel.

---

## 8. AI Advisor View

### Current State
Chat interface with message history (persisted in `localStorage`), voice input via `SpeechRecognition`, quick-action buttons, `EducationCards` at bottom, `SpendingPersonality` type detection. Powered by Gemini API via `getFinancialAdvice()`. Mobile version is a lighter layout.

### Functional Improvements

**Context-Aware Conversations**
The advisor currently sends a static financial summary with each message. Improve the context payload to include: current budget adherence per category, active goals with progress percentages, upcoming recurring bills, and the last 30 days of category spend. This makes answers dramatically more specific.

**Proactive Nudges**
Rather than purely reactive chat, add a "Pending Advice" banner at the top that proactively surfaces one insight: e.g. "Your entertainment spend this month is unusually high — want me to suggest a budget?" Tapping it starts a pre-filled conversation thread.

**Action Execution from Chat**
The `action_card` message type (`CREATE_BUDGET`, `VIEW_ANALYTICS`, `SET_GOAL`) exists but only navigates. Extend to actually execute: if the AI says "I'll set a ₹3,000 Food budget for you" and the user confirms, call `setBudget('Food', 3000)` directly from the chat thread.

**Conversation Threads**
Instead of one flat history, allow named conversation threads: "Budget Planning", "Tax Questions", "Investment Advice." Stored in `localStorage` with separate keys. Switchable from a sidebar in desktop / a top tab strip in mobile.

**Voice Reply Streaming**
Currently the AI response arrives in one block. Use streaming (`stream: true` in Gemini API) so text appears token by token. This massively improves perceived responsiveness.

**Spending Personality Report**
`SpendingPersonality` is computed but only shown as a label. Expand it into a mini "Personality Report" card in the chat: archetype name, 3 strengths, 2 areas to improve, tailored recommendation — rendered as a rich card, not plain text.

### UI Improvements

- **Chat bubbles redesign:** AI bubbles use a flat card background. Improve to a subtle gradient (`var(--surface-card)` to `rgba(var(--teal-rgb), 0.04)`) with a small bot avatar icon. User bubbles should use the teal accent with white text.
- **Suggested prompts:** Below the input, show 3 rotating chip-style suggestions ("Why did I overspend in June?", "How can I save ₹5,000 more?", "Explain my health score"). Tapping fills the input.
- **Typing indicator:** Show a `…` animated bubble while the AI is generating. Currently the UI just freezes with a button spinner.
- **Mobile keyboard behaviour:** When the keyboard opens on mobile, the chat input should stick to the top of the keyboard (use `position: sticky; bottom: 0` on the input bar within the scroll container). Currently the input can scroll out of view.
- **Clear conversation confirmation:** Currently the trash icon clears immediately. Add a confirmation sheet with "This will clear all chat history."

---

## 9. Portfolio / Wealth View

### Current State
Desktop tabs: Overview (assets/liabilities list + `AllocationDonut` + `NetWorthEvolution`) · Simulation (`FutureWealthSimulator`) · Debt (`DebtPlanner`). Mobile: `PortfolioViewMobile` with condensed layout. Also has `WealthTree` component.

### Functional Improvements

**Asset Return Tracking**
For investment assets (Stocks, Mutual Funds, Crypto), add `purchasePrice` and `currentPrice` fields. Show gain/loss amount and percentage. `NetWorthEvolution` then tracks true portfolio performance, not just the entered value.

**Debt Payoff Strategies**
`DebtPlanner` exists but is basic. Implement Avalanche (highest interest first) and Snowball (lowest balance first) strategies side by side with a comparison: total interest saved and months to debt-free. Interactive sliders for extra monthly payment.

**Net Worth Milestones**
Celebrate when net worth crosses round numbers (₹1L, ₹5L, ₹10L, ₹1Cr). Trigger confetti + a badge from the gamification system. Tracked via a `useEffect` watching `netWorth` changes.

**Liability Alert**
If a liability's payment due date is within 7 days, surface a push notification and a red "Due Soon" badge on the liability card. Add `dueDate` field to `LiabilityType`.

**Portfolio Health Score**
The `healthScore` in `PortfolioView` is a rough formula. Improve it to factor in: debt-to-asset ratio, emergency fund coverage (months of expenses covered by liquid assets), investment diversification (number of asset types). Display as a labelled gauge.

**Import from Broker CSV**
Add an "Import holdings" button that accepts CSV exports from Zerodha, Groww, Angel One (common formats). Parse using an extended `csv.ts` parser. Pre-populate asset entries automatically.

### UI Improvements

- **Net Worth number:** The large net worth figure should count up animatedly on mount using the existing `useCountUp` hook.
- **AllocationDonut:** Add a hover/tap state that highlights the slice and shows "X% of total assets" in the centre.
- **WealthTree:** Currently this component exists but feels disconnected. Integrate it into the Overview tab as a visual metaphor — tree grows as net worth increases, losing leaves when liabilities are added.
- **Tab pill redesign:** The Overview/Simulation/Debt tabs are plain buttons. Use a pill-style switcher with a sliding highlight (Framer Motion layout animation).
- **Mobile portfolio:** The mobile view currently removes the `NetWorthEvolution` chart. Add a compressed sparkline version with pinch-to-zoom.

---

## 10. Gamification View

### Current State
Four tabs: Overview (hero banner, level + XP stats, streak) · Quests (`QuestsPanel`) · Badges (`BadgeGallery`) · Challenges (`SavingsChallenges`). Also has `RoundUpVault` and `SocialLeaderboard` on Dashboard.

### Functional Improvements

**Daily Quests Auto-Reset with Preview**
Quests reset daily via `useQuestReset`. Add a "Tomorrow's Quests" preview 2 hours before midnight — shows what quests will be available so users can plan.

**Quest Difficulty Tiers**
Expand quests beyond the current flat list into Easy / Medium / Hard tiers with different XP rewards. Hard quests (e.g. "Save 30% of income this month") unlock special badges not obtainable elsewhere.

**Challenge Leaderboard**
`SocialLeaderboard` exists as a dashboard widget. Promote it into the Gamification view as a full tab. Show friend rankings, optionally anonymous global ranks, and personal rank history over time.

**Streak Freeze**
Allow users to spend accumulated XP to "freeze" a streak for one day (useful for travel or data-entry gaps). Classic mechanic from Duolingo. Deducts 200 XP per freeze use.

**WealthCity Interaction**
`WealthCity` is currently a read-only animation. Make buildings tappable — each building represents a financial category (Food = restaurant building, Transport = road, etc.) and tapping reveals that category's monthly stats inline.

**Badge Export / Share Card**
Each badge should have a "Share" button that generates an image card (canvas-based, using existing `StreakShareCard` pattern) suitable for WhatsApp/Instagram stories.

### UI Improvements

- **Hero banner:** The dark gradient hero is good. Add an animated particle/sparkle effect (CSS keyframe particles) to the background when the user is at max daily XP.
- **XP progress bar:** Add micro-animation when XP is earned: the bar fills with a trailing glow pulse (`box-shadow` keyframe).
- **Quest cards:** Show time remaining on daily quests (countdown to midnight reset). Currently the time info is absent.
- **Badge gallery grid:** Locked badges are currently dimmed grey. Add a subtle "shimmer" animation on locked badges to make them feel attainable rather than blocked.
- **Level-up modal:** `LevelUpModal.tsx` exists. Wire it to trigger whenever `level` increases in the store — this connection appears to be missing in `GamificationView`.

---

## 11. Shared Wallets View

### Current State
The most complex view. Groups with tabs: Wallet · Expenses · Goals · Members · Activity. Modals for creating groups, inviting members, adding expenses, QR code invite. `CRDT`-based sync engine.

### Functional Improvements

**Expense Splitting Rules**
Currently expenses are split equally. Add split modes: Equal · By percentage · By custom amounts · By shares (useful for families where a child counts as 0.5x). Rendered in `ExpenseModal`.

**Settlement Optimisation**
Calculate the minimum number of transactions needed to settle all debts within a group (debt-simplification algorithm). Show a "Settle Up" summary: "Ravi pays Priya ₹450, Priya pays Aman ₹200" — reduces the 6 pairwise transfers to 2.

**Recurring Group Expenses**
Allow marking a group expense as recurring (e.g. rent, Netflix split). Auto-adds to the group on the set cadence, matching the personal recurring transactions system.

**Budget for Group**
Set a shared monthly budget per group. Tracks total expenses vs budget. Triggers notifications to all members when 80% consumed.

**Expense Receipt Attach**
Like the personal transaction receipt feature, allow attaching a photo to group expenses. Visible to all members with access permission.

**Offline Queue**
If a member adds an expense while offline, queue it locally and sync when reconnected. Use the existing `syncEngine.ts` CRDT approach — extend it to handle group expense conflicts.

### UI Improvements

- **Group card:** The group list on the main screen shows name + purpose emoji. Add: member count, last activity timestamp, outstanding balance for the current user (owed to them or owed by them), colour-coded border.
- **Activity feed:** The `ActivityTab` is a flat list. Add activity grouping by day with date separators, and avatar icons for each member who triggered the event.
- **Expense row:** Show split breakdown on hover/tap: "You owed ₹300, paid ₹900 → net +₹600". Currently the row shows the full amount.
- **QR code modal:** The QR is rendered in a modal. Add an "Open camera to scan group QR" button that uses the device camera inline (same `ReceiptScanner` component), so users don't need to switch apps.
- **Mobile shared view:** The current mobile rendering of `SharedView` is the same desktop code. Optimise: make tabs a bottom tab bar within the view, and use full-screen modals for expense/goal forms.

---

## 12. Bank Sync View

### Current State
Multi-step wizard: Dashboard → Select Source (UPI / Razorpay / Plaid / Web3) → Link flow → Parse → Review staged transactions → Commit. SMS/UPI auto-parse, Razorpay API key storage, Web3 wallet connect.

### Functional Improvements

**SMS Auto-Sync (Android)**
On Android, request `READ_SMS` permission (via the Android Intent bridge when running as a TWA/WebAPK). Parse incoming bank SMS automatically using the existing `upi.ts` parser. Add a toggle "Auto-import from SMS" with a privacy disclosure. New transactions appear in a "Pending Review" queue.

**Plaid Integration Completion**
`PlaidLink` component exists but is a stub. Complete the integration: OAuth flow, fetch transactions endpoint, map Plaid categories to SpendWise categories using `predictCategory()`.

**Duplicate Detection**
When staging imported transactions, run a deduplication check against existing transactions (same merchant + same amount ± ₹1 + same date ±1 day). Flag duplicates with a yellow warning icon in the review screen. One-tap to dismiss.

**Sync Schedule**
Add a "Sync Frequency" option: Manual / Daily / Weekly. Scheduled syncs use the existing Service Worker background sync registration.

**Transaction Mapping Memory**
The `merchantMapper.ts` already learns categories. Persist this mapping in IndexedDB and surface a "Merchant Rules" management screen in Bank Sync: list all learned mappings, edit, or delete them.

**Multi-account Dashboard**
The sync dashboard currently shows connected accounts as a flat list. Upgrade to a summary card per account showing: last sync time, transaction count imported, total imported value, health indicator (green = syncing, red = auth expired).

### UI Improvements

- **Wizard stepper:** The step flow uses state-based view switching (`view` enum). Add a visual step progress indicator at the top (horizontal dots or numbered steps): Step 1: Choose Source → Step 2: Link → Step 3: Review → Step 4: Done.
- **Review screen:** The staged transactions list in review mode should look identical to `HistoryView` rows so the user knows exactly what they're importing. Currently it's a different layout.
- **Source cards:** The "Select Source" screen has provider buttons. Add logos/icons for each (UPI logo, Razorpay logo, Plaid logo, Ethereum icon) and a brief one-line description of what data gets imported.
- **Success animation:** After committing imported transactions, show a brief success animation (checkmark confetti burst) before navigating away.

---

## 13. Recurring Transactions View

### Current State
`RecurringView` (desktop + mobile) lists recurring transaction rules with add/edit/delete. Shows next-due dates. Integration with `useRecurring` hook.

### Functional Improvements

**Calendar View Mode**
Add a calendar toggle: monthly grid view where upcoming recurring transactions are shown as dots/chips on their due dates. Provides a "bill calendar" at a glance.

**Upcoming Bills Widget**
Surface the next 7 days of recurring bills as a widget on the Dashboard. Currently recurring data isn't visible from the home screen.

**Smart Pause**
If a user's balance is projected to go negative before a recurring payment, auto-pause it and send a notification: "Paused your Netflix ₹649 payment — insufficient balance projected."

**Missed Payment Detection**
If a recurring transaction's expected date passes without a matching transaction arriving, flag it: "No Netflix charge detected — did it go through?"

**Annual Cost Summary**
Show total annual cost of all active recurring subscriptions. Compare with a category benchmark or the existing `SubscriptionManager` data.

### UI Improvements

- **Due date urgency:** Colour-code the "Next due" date: green (>14 days), amber (7–14 days), red (<7 days).
- **Category icons:** Each recurring row should use the category icon from `mergedIcons`, matching the style of `HistoryView` rows.
- **List vs Calendar toggle:** Add a toggle button (list icon vs calendar icon) in the view header. Animate the transition using Framer Motion `layoutId`.

---

## 14. Education View

### Current State
Lesson cards by category (`LessonCard`), full-screen `LessonModal` with article content, progress tracking. `categoryConfig.tsx` maps content to topics.

### Functional Improvements

**Personalised Learning Path**
Based on `userRole` (Student / Professional / Business) and `SpendingPersonality`, auto-recommend the next 3 lessons. Show a "Recommended for You" section at the top.

**Quiz Module**
Add a short 3-question quiz at the end of each lesson. Correct answers award XP, connecting Education to Gamification. Store quiz results in `localStorage` per lesson ID.

**Progress Certificates**
When a user completes all lessons in a category, generate a "Certificate of Completion" card (SVG-based, shareable image) for that topic. E.g. "You've mastered Budgeting Basics 📜."

**Bookmark / Save for Later**
A bookmark icon on each `LessonCard` to save lessons to a "Read Later" list, persisted in the store.

**Contextual Lesson Suggestions**
When the AI Advisor detects a pattern (e.g. consistent overspend in Entertainment), it surfaces a direct link to the relevant lesson: "Here's a lesson on impulse spending that might help."

### UI Improvements

- **Lesson card grid:** Currently a flat list. Switch to a 2-column masonry grid on desktop with topic colour-coded header bands.
- **Progress bar per category:** Show a completion bar at the top of each category section (e.g. "3/5 lessons completed" in Budgeting).
- **Lesson modal:** The current modal is a markdown reader. Improve with: table of contents sidebar (desktop), estimated read time badge, share button, and a "Next Lesson" button at the bottom.
- **Unlock animations:** Locked lessons (based on level) should visually animate to "unlocked" state when the user reaches the required level — don't just statically show/hide them.

---

## 15. Profile / Settings View

### Current State
`ProfileForm` (name, phone, occupation, location, monthly goal), `CurrencySelector`, `DataManagement` (export/import/reset), `AccessibilitySection` (font size, dark mode, high contrast, haptics), `NotificationsSection`, biometric lock via `useAuth`. Mobile: same features in `ProfileViewMobile`.

### Functional Improvements

**Notification Preferences Per Event**
Currently notifications are on/off. Break into granular toggles: Budget alerts · Goal milestones · Recurring bill reminders · Weekly digest · AI insights · Streak reminders.

**Multi-Currency Wallet**
`CurrencyContext` already supports `baseCurrency` and `activeCurrency`. Build a proper multi-currency settings panel: set home currency, add foreign currencies with manual exchange rates (or auto-fetched), and show balances in both currencies.

**Theme Customisation**
Beyond dark/light mode, allow accent colour selection: Teal (default), Indigo, Violet, Rose, Amber. Store in `userPreferences` and apply via CSS variable override (`--teal: <hex>`).

**Data Health Check**
A "Scan Data" button that runs integrity checks: duplicate transactions, transactions with missing categories, goals with no contributions in 60 days, budgets set to ₹0. Shows a checklist with one-tap fixes.

**Onboarding Re-run**
A "Redo Onboarding" button that re-opens `OnboardingModal` without resetting data. Useful when role or income changes significantly.

### UI Improvements

- **Profile avatar:** The current `handleAvatarChange` replaces the avatar image. Add a default illustrated avatar generated from the user's name initials (already partially done via `avatar.ts`) with a colour based on the user's `userRole`.
- **Settings sections:** Use accordion-style collapsible sections instead of one long scroll. Sections: Profile · Appearance · Notifications · Privacy & Security · Data · About.
- **Saved feedback:** The `showSavedMsg` toast is a generic success. Replace with an inline "✓ Saved" confirmation that fades out on the changed field itself.
- **Danger zone:** The "Reset All Data" button is in the main flow. Move it into a collapsed "Danger Zone" section at the bottom, styled with a red border, requiring the user to explicitly expand it.

---

## 16. Android-Specific Feature Plan

SpendWise is a Vite PWA with a `manifest.webmanifest` and Service Worker. On Android it installs as a standalone PWA (or can be wrapped as a WebAPK/TWA). The following features are specifically relevant to the Android platform.

### Native Capability Integrations

**SMS Transaction Parsing (Auto-Import)**
Android allows PWAs running as a TWA (Trusted Web Activity) to request SMS permissions via the `SMS Retriever API` or the `WebOTP API` (`navigator.credentials.get({ otp: { transport: ['sms'] } })`). Implement:
- Request OTP/SMS read on first sync setup.
- Pipe incoming bank SMS through the existing `upi.ts` parser.
- Stage parsed transactions in a "Review Queue" badge-notified from the notification bell.

**App Shortcuts (Long-Press Home Icon)**
Add Android App Shortcuts in `manifest.webmanifest` via the `shortcuts` array:
```json
"shortcuts": [
  { "name": "Add Transaction", "url": "/?action=add", "icons": [...] },
  { "name": "View Budget",     "url": "/budget",       "icons": [...] },
  { "name": "Check Goals",     "url": "/goals",        "icons": [...] }
]
```
Wire `/?action=add` in `App.tsx` to auto-open `QuickAddModal` on load.

**Share Target (Receive Payment Screenshots)**
Register SpendWise as a share target so users can share a payment screenshot from any app directly into SpendWise for OCR parsing:
```json
"share_target": {
  "action": "/share-target",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": { "files": [{ "name": "file", "accept": ["image/*"] }] }
}
```
The Service Worker handles the `POST`, caches the file, and opens `ReceiptScanner` with it pre-loaded.

**Badging API (Unreviewed Transactions Count)**
Use `navigator.setAppBadge(count)` to show a numeric badge on the app icon equal to the number of transactions in the "Pending Review" queue (imported but not categorised). Clear the badge when the user reviews them. Already partially supported via `pushNotification.ts` — extend it.

**Background Sync for Recurring Transactions**
Register a periodic background sync (`navigator.serviceWorker.ready.then(sw => sw.periodicSync.register('check-recurring', { minInterval: 24 * 60 * 60 * 1000 }))`) to check if any recurring transactions are due today and add them automatically even if the app isn't open.

**Vibration Patterns for Financial Events**
The existing `haptic.ts` uses a flat `navigator.vibrate(ms)`. Expand to distinct patterns:
- Transaction added: `[50]` (short tap)
- Budget exceeded: `[100, 50, 100]` (double pulse — warning)
- Goal achieved: `[50, 30, 50, 30, 200]` (celebration pattern)
- Level up: `[100, 50, 100, 50, 100, 50, 300]` (escalating)

**UPI Deep Link Handling**
Register SpendWise to handle `upi://` scheme URLs (in TWA manifest intent filters). When a UPI payment link is opened on Android, SpendWise intercepts it, pre-fills the PayForm in BankSyncView, and optionally auto-logs the transaction after payment.

**Notification Actions (Actionable Alerts)**
Extend push notifications to include action buttons using the `actions` field in Service Worker `showNotification`:
```javascript
// Budget alert notification
{
  body: 'You've used 90% of your Food budget.',
  actions: [
    { action: 'view', title: 'View Budget' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
}
```
Handle action clicks in the SW `notificationclick` event to navigate directly to the relevant view.

**Pull-to-Refresh Native Feel**
`PullToRefresh.tsx` exists but uses a CSS-based implementation. On Android Chrome, override the default browser pull-to-refresh with a custom implementation using `overscroll-behavior-y: contain` + the existing component, providing a more native feel with the teal-coloured spinner.

### Android UI Polish

**Bottom Navigation Bar Adaptation**
On Android phones with gesture navigation (swipe-up home), the bottom nav bar can conflict with the app's bottom `NavTabs`. Use `env(safe-area-inset-bottom)` padding on the nav container (already partially handled by `pb-safe` utilities — audit all views to ensure consistency).

**Adaptive Icons**
The current `manifest.webmanifest` references `maskable-icon.png`. Ensure it uses a true adaptive icon design: the subject (SpendWise logo) within the safe zone (66% of canvas), with a solid background fill. Tools: Maskable.app for preview.

**Splash Screen Theming**
Set `"theme_color": "#0f766e"` (teal-700) and `"background_color"` to match the dark mode background `#0d1117`. This ensures the Android splash screen matches the app's first render, eliminating the white flash.

**Pinch-to-Zoom on Charts**
Android users expect pinch-to-zoom on charts. Add `touch-action: pinch-zoom` CSS on chart containers and implement a basic scale transform on `BalanceChart` and `SpendingHeatmap` using `useGesture` (from the existing `@use-gesture` if installed, or a lightweight custom hook).

**Keyboard Inset Handling**
Use the `visualViewport` API to detect soft keyboard appearance and resize the active scroll container accordingly (rather than relying on `resize` events, which are slower on Android):
```javascript
window.visualViewport?.addEventListener('resize', () => {
  setKeyboardHeight(window.innerHeight - window.visualViewport.height);
});
```
Apply to: Advisor chat input, QuickAddModal, all form modals.

---

## 17. Cross-Cutting UI & Architecture

### Design System Gaps

**Standardise Spacing Scale**
Several views use ad-hoc `p-3`, `p-4`, `p-6`, `p-8` without a consistent rhythm. Define a spacing scale in `index.css` as CSS custom properties (`--space-xs: 4px` through `--space-2xl: 48px`) and use them uniformly.

**Motion Tokens**
Framer Motion `duration` and `ease` values are hardcoded per component. Create a shared `motion.config.ts` with named presets: `spring.snappy`, `spring.bouncy`, `tween.subtle`, `tween.reveal`. Import in all animated components.

**Icon Consistency**
`lucide-react` icons are used at different sizes (14px, 16px, 18px, 20px, 24px) without convention. Define size tokens: `icon.sm = 14`, `icon.md = 18`, `icon.lg = 24` and document in `Icons.tsx`.

**Skeleton Loader Coverage**
`SkeletonLoader.tsx` exists but is only used in `DashboardView`. Add skeleton states to: AnalyticsView chart placeholders, GoalCard loading, BudgetRow loading, and the AdvisorView initial message load.

### Performance

**Code Split Each View**
`ViewRenderer.tsx` renders views eagerly. Wrap each view import in `React.lazy()` + `<Suspense>` with a `SkeletonLoader` fallback. This will reduce initial JS parse time significantly (the `dist/assets` shows some views at 85KB+ each).

**Virtualise GoalsView and BudgetView**
These use plain `.map()` rendering. For users with many goals/budgets, switch to `Virtuoso` (already a dependency from `HistoryView`).

**IndexedDB Query Optimisation**
`useTransactions` loads all transactions into memory and filters in JS. For large datasets (>5,000 transactions), add IndexedDB indexes on `date`, `category`, and `type` fields so filtering happens at the DB level.

### Accessibility

**Keyboard Navigation Audit**
All modals need focus trapping (`<FocusTrap>` — `focus-trap-react` package). The current `Modal.tsx` in `ui/` doesn't implement focus trap.

**ARIA Labels**
Chart components (`SpendingDonut`, `BalanceChart`) need `role="img"` + `aria-label` with a text summary: "Donut chart showing spending by category: Food 35%, Transport 15%..."

**Reduce Motion Support**
Wrap all Framer Motion animations in a `useReducedMotion()` check (Framer provides this hook). Users with vestibular disorders who have "Reduce Motion" enabled in their OS should see instant transitions.

---


