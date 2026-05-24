This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
- Pay special attention to the Repository Description. These contain important context and guidelines specific to this project.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*.tsx, src/**/*.ts, src/index.css, CODEBASE_MAP.md
- Files matching these patterns are excluded: **/*.test.ts, **/*.test.tsx, **/*.spec.ts, **/*.d.ts, src/vite-env.d.ts, node_modules/**, dist/**, .git/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# User Provided Header
SpendWise Codebase - AI Context File
Tech: React 18 + TypeScript + Vite + Tailwind v4 + Zustand + Dexie + Supabase
Theme: CSS variables via :root.dark class. Date util: formatLocalYYYYMMDD from src/utils/date.ts

# Directory Structure
```
CODEBASE_MAP.md
src/app/App.tsx
src/app/AppModals.tsx
src/app/hooks/useAppEnvironment.ts
src/app/hooks/useAppNavigation.ts
src/app/hooks/useAppTheme.ts
src/app/hooks/usePWAInstall.ts
src/app/hooks/useShakeFeedback.ts
src/app/hooks/useVoiceMic.ts
src/app/MainShell.tsx
src/app/ViewRenderer.tsx
src/constants/index.ts
src/contexts/CurrencyContext.tsx
src/data/currencies.ts
src/data/lessons.ts
src/data/mockData.ts
src/data/portfolioConfig.ts
src/db/backup.ts
src/db/db.ts
src/db/migration.ts
src/features/advisor/AdvisorView.tsx
src/features/advisor/AdvisorViewMobile.tsx
src/features/advisor/components/ChatInput.tsx
src/features/advisor/components/ChatMessageList.tsx
src/features/advisor/types.ts
src/features/ai/components/AIInputTools.tsx
src/features/ai/components/MagicInput.tsx
src/features/ai/components/ReceiptScanner.tsx
src/features/ai/components/SpendingPersonality.tsx
src/features/analytics/AnalyticsView.tsx
src/features/analytics/AnalyticsViewMobile.tsx
src/features/analytics/components/AnalyticsPrimitives.tsx
src/features/analytics/components/AnomalyDetector.tsx
src/features/analytics/components/BalanceChart.tsx
src/features/analytics/components/CashFlowWaterfall.tsx
src/features/analytics/components/CategoryAnalyzer.tsx
src/features/analytics/components/CategoryBreakdownList.tsx
src/features/analytics/components/HealthIndexCard.tsx
src/features/analytics/components/HealthScoreChart.tsx
src/features/analytics/components/IncomeExpensesChart.tsx
src/features/analytics/components/PeerComparison.tsx
src/features/analytics/components/PredictiveForecasting.tsx
src/features/analytics/components/SavingsTrendChart.tsx
src/features/analytics/components/SpendingDonut.tsx
src/features/analytics/components/SpendingForecast.tsx
src/features/analytics/components/SpendingHeatmap.tsx
src/features/analytics/components/TaxPredictor.tsx
src/features/analytics/components/TopMerchants.tsx
src/features/analytics/hooks/useHealthHistory.ts
src/features/auth/AuthView.tsx
src/features/auth/components/BiometricLock.tsx
src/features/budget/BudgetView.tsx
src/features/budget/BudgetViewMobile.tsx
src/features/budget/components/BudgetAlertToast.tsx
src/features/budget/components/BudgetCategoryCard.tsx
src/features/budget/components/BudgetCategoryCardMobile.tsx
src/features/budget/components/BudgetManager.tsx
src/features/budget/components/BudgetRow.tsx
src/features/budget/components/BudgetSummary.tsx
src/features/budget/components/BudgetSummaryBar.tsx
src/features/budget/components/BudgetSummaryMobile.tsx
src/features/budget/components/PeriodSelector.tsx
src/features/budget/components/RolloverToggle.tsx
src/features/budget/components/SmartBudgetSuggestions.tsx
src/features/budget/hooks/useAlerts.ts
src/features/budget/hooks/useBudgetManager.ts
src/features/dashboard/components/AIInsights.tsx
src/features/dashboard/components/ChartTooltip.tsx
src/features/dashboard/components/DailyStats.tsx
src/features/dashboard/components/DashboardHeader.tsx
src/features/dashboard/components/DashboardHero.tsx
src/features/dashboard/components/DashboardHeroDesktop.tsx
src/features/dashboard/components/DashboardHeroMobile.tsx
src/features/dashboard/components/FinanceChart.tsx
src/features/dashboard/components/GoalsSummary.tsx
src/features/dashboard/components/MetricCards.tsx
src/features/dashboard/components/MetricCardsDesktop.tsx
src/features/dashboard/components/MetricCardsMobile.tsx
src/features/dashboard/components/MobileBalanceHero.tsx
src/features/dashboard/components/MobileRecentTransactions.tsx
src/features/dashboard/components/PremiumCard.tsx
src/features/dashboard/components/QuickAddPanel.tsx
src/features/dashboard/components/RecentTransactions.tsx
src/features/dashboard/components/SafeToSpend.tsx
src/features/dashboard/components/SnapCardRow.tsx
src/features/dashboard/components/StatCard.tsx
src/features/dashboard/components/WeeklyDigestCard.tsx
src/features/dashboard/DashboardView.tsx
src/features/dashboard/DashboardViewMobile.tsx
src/features/dashboard/hooks/useDashboardData.ts
src/features/education/components/categoryConfig.tsx
src/features/education/components/EducationCards.tsx
src/features/education/components/LessonCard.tsx
src/features/education/components/LessonModal.tsx
src/features/education/EducationView.tsx
src/features/gamification/components/BadgeGallery.tsx
src/features/gamification/components/LevelProgress.tsx
src/features/gamification/components/LevelUpModal.tsx
src/features/gamification/components/QuestCompletionOverlay.tsx
src/features/gamification/components/QuestsPanel.tsx
src/features/gamification/components/RoundUpVault.tsx
src/features/gamification/components/SavingsChallenges.tsx
src/features/gamification/components/SocialLeaderboard.tsx
src/features/gamification/components/StreakShareCard.tsx
src/features/gamification/components/UserLevelCard.tsx
src/features/gamification/components/WealthCity.tsx
src/features/gamification/GamificationView.tsx
src/features/gamification/hooks/useGamification.ts
src/features/gamification/hooks/useQuestReset.ts
src/features/goals/components/constants.ts
src/features/goals/components/ContributeModal.tsx
src/features/goals/components/GoalCard.tsx
src/features/goals/components/GoalModal.tsx
src/features/goals/components/GoalsSummary.tsx
src/features/goals/components/ProgressRing.tsx
src/features/goals/components/utils.ts
src/features/goals/GoalsView.tsx
src/features/goals/GoalsViewMobile.tsx
src/features/goals/hooks/useGoals.ts
src/features/onboarding/components/OnboardingModal.tsx
src/features/onboarding/components/OnboardingSidebar.tsx
src/features/onboarding/components/OnboardingStep1.tsx
src/features/onboarding/components/OnboardingStep2.tsx
src/features/onboarding/components/OnboardingStep3.tsx
src/features/parental/components/ChildQRScanner.tsx
src/features/parental/components/LinkingQRModal.tsx
src/features/parental/components/ParentalActivity.tsx
src/features/parental/components/ParentalControlGate.tsx
src/features/parental/components/ParentalDashboard.tsx
src/features/parental/components/ParentalLockScreen.tsx
src/features/parental/components/ParentalSettingsCard.tsx
src/features/parental/components/ParentalSetupFlow.tsx
src/features/parental/components/PendingApprovals.tsx
src/features/parental/hooks/useParentalManager.ts
src/features/parental/ParentalView.tsx
src/features/portfolio/components/AddModal.tsx
src/features/portfolio/components/AllocationDonut.tsx
src/features/portfolio/components/DebtPlanner.tsx
src/features/portfolio/components/EntryCard.tsx
src/features/portfolio/components/FutureWealthSimulator.tsx
src/features/portfolio/components/MobilePortfolioHero.tsx
src/features/portfolio/components/NetWorthEvolution.tsx
src/features/portfolio/components/PortfolioHeader.tsx
src/features/portfolio/components/PortfolioInsights.tsx
src/features/portfolio/components/PortfolioLists.tsx
src/features/portfolio/components/PortfolioSummaryBanner.tsx
src/features/portfolio/components/WealthTree.tsx
src/features/portfolio/hooks/usePortfolio.ts
src/features/portfolio/PortfolioView.tsx
src/features/portfolio/PortfolioViewMobile.tsx
src/features/profile/components/AccessibilitySection.tsx
src/features/profile/components/CurrencySelector.tsx
src/features/profile/components/DataManagement.tsx
src/features/profile/components/FamilySafetySection.tsx
src/features/profile/components/NotificationsSection.tsx
src/features/profile/components/ProfileForm.tsx
src/features/profile/components/ProfileHeader.tsx
src/features/profile/components/ResetConfirmModal.tsx
src/features/profile/components/RestoreModal.tsx
src/features/profile/components/SecureExportModal.tsx
src/features/profile/components/useProfileView.ts
src/features/profile/ProfileView.tsx
src/features/profile/ProfileViewMobile.tsx
src/features/recurring/hooks/useAutomations.ts
src/features/recurring/hooks/useRecurring.ts
src/features/recurring/RecurringView.tsx
src/features/reports/ReportsView.tsx
src/features/shared/components/SharedGroups.tsx
src/features/shared/components/SharedModals.tsx
src/features/shared/components/SharedOverview.tsx
src/features/shared/components/SharedTabs.tsx
src/features/shared/hooks/useSharedWallets.ts
src/features/shared/SharedView.tsx
src/features/subscriptions/components/AddSubscriptionModal.tsx
src/features/subscriptions/components/PriceHikeDetector.tsx
src/features/subscriptions/components/SubscriptionCalendar.tsx
src/features/subscriptions/components/SubscriptionManager.tsx
src/features/subscriptions/hooks/useSubscriptionManager.ts
src/features/subscriptions/hooks/useSubscriptions.ts
src/features/sync/BankSyncView.tsx
src/features/sync/components/CloudSync.tsx
src/features/sync/components/CSVImporter.tsx
src/features/sync/components/PayForm.tsx
src/features/sync/components/RazorpayLink.tsx
src/features/sync/components/SelectSource.tsx
src/features/sync/components/SyncDashboard.tsx
src/features/sync/components/UPILink.tsx
src/features/transactions/components/BulkActionHeader.tsx
src/features/transactions/components/DeleteConfirmModal.tsx
src/features/transactions/components/HistoryToolbar.tsx
src/features/transactions/components/historyTypes.ts
src/features/transactions/components/SortBtn.tsx
src/features/transactions/components/TransactionFilters.tsx
src/features/transactions/components/TransactionList.tsx
src/features/transactions/components/TransactionRow.tsx
src/features/transactions/HistoryView.tsx
src/features/transactions/HistoryViewMobile.tsx
src/features/transactions/hooks/useTransactionHistory.ts
src/hooks/useAppState.ts
src/hooks/useAuth.tsx
src/hooks/useBudgets.ts
src/hooks/useCategories.tsx
src/hooks/useCountUp.ts
src/hooks/useMasterVoice.ts
src/hooks/useMediaQuery.ts
src/hooks/useNotifications.ts
src/hooks/usePrefersReducedMotion.ts
src/hooks/usePWAInstall.ts
src/hooks/useTheme.ts
src/hooks/useTransactions.ts
src/hooks/useUPIReturn.tsx
src/index.css
src/insights/advisor.ts
src/insights/anomaly.ts
src/insights/budgetSuggestions.ts
src/insights/forecast.ts
src/insights/healthScore.ts
src/insights/reporting.ts
src/lib/crdt.ts
src/lib/encryption.ts
src/lib/exportPDF.ts
src/lib/haptic.ts
src/lib/motion.ts
src/lib/security.ts
src/lib/syncEngine.ts
src/lib/voiceCommands/commandParser.ts
src/lib/voiceCommands/commandRouter.ts
src/lib/voiceCommands/fallbackPatterns.ts
src/lib/voiceCommands/handlers/assetHandlers.ts
src/lib/voiceCommands/handlers/budgetHandlers.ts
src/lib/voiceCommands/handlers/index.ts
src/lib/voiceCommands/handlers/navigationHandlers.ts
src/lib/voiceCommands/handlers/queryHandlers.ts
src/lib/voiceCommands/handlers/settingsHandlers.ts
src/lib/voiceCommands/handlers/subscriptionHandlers.ts
src/lib/voiceCommands/handlers/transactionHandlers.ts
src/lib/voiceCommands/handlers/types.ts
src/lib/voiceCommands/tts.ts
src/lib/voiceCommands/types.ts
src/main.tsx
src/parsers/common.ts
src/parsers/csv.ts
src/parsers/nlp.ts
src/parsers/ocr.ts
src/parsers/upi.ts
src/parsers/voice.ts
src/services/gemini.ts
src/services/OCRService.ts
src/services/supabase.ts
src/services/VoiceService.ts
src/shell/AlertBanner.tsx
src/shell/CommandPalette.tsx
src/shell/components/ConfirmDialog.tsx
src/shell/components/DesktopSidebar.tsx
src/shell/components/HistoryPanel.tsx
src/shell/components/IconNavItem.tsx
src/shell/components/MicTranscript.tsx
src/shell/components/MissingEntityPrompt.tsx
src/shell/components/MobileDrawer.tsx
src/shell/components/OnboardingTooltip.tsx
src/shell/components/ResultMessage.tsx
src/shell/components/WaveformVisualizer.tsx
src/shell/CustomCategoriesModal.tsx
src/shell/FeedbackModal.tsx
src/shell/Header.tsx
src/shell/IOSInstallModal.tsx
src/shell/MasterMic.tsx
src/shell/navigation.ts
src/shell/NavTabs.tsx
src/shell/NotificationCenter.tsx
src/shell/OfflineIndicator.tsx
src/shell/PrivacyShield.tsx
src/shell/PullToRefresh.tsx
src/shell/QuickAddModal.tsx
src/shell/ServiceWorkerToast.tsx
src/shell/Sidebar.tsx
src/store/index.ts
src/store/slices/financeSlice.ts
src/store/slices/gamificationSlice.ts
src/store/slices/parentalSlice.ts
src/store/slices/portfolioSlice.ts
src/store/slices/securedSlice.ts
src/types/dom.ts
src/types/finance.ts
src/types/gamification.ts
src/types/index.ts
src/types/portfolio.ts
src/types/shared.ts
src/types/state.ts
src/types/sync.ts
src/types/ui.ts
src/ui/Alert.tsx
src/ui/Avatar.tsx
src/ui/Button.tsx
src/ui/Card.tsx
src/ui/CategoryDropdown.tsx
src/ui/EmptyState.tsx
src/ui/ErrorBoundary.tsx
src/ui/Icons.tsx
src/ui/Input.tsx
src/ui/Modal.tsx
src/ui/PinInput.tsx
src/ui/Portal.tsx
src/ui/Select.tsx
src/ui/SkeletonLoader.tsx
src/ui/StatusPill.tsx
src/ui/Toggle.tsx
src/utils/avatar.ts
src/utils/cn.ts
src/utils/date.ts
src/utils/export.ts
src/utils/imageUtils.ts
src/utils/import.ts
src/utils/merchantMapper.ts
src/utils/pushNotification.ts
src/utils/razorpaySync.ts
src/utils/share.ts
src/utils/upiPayment.ts
```

# Files

## File: CODEBASE_MAP.md
````markdown
# SpendWise — Codebase Map
> **AI Context File** — Read this FIRST before touching any file. Update after every session.
> Last updated: 2026-05-24

---

## 🏗️ Architecture Overview

```
src/
├── app/               # Root app bootstrapping
├── features/          # Feature modules (19 domains)
├── shell/             # Layout chrome: Header, Sidebar, modals
├── ui/                # Shared primitive UI components
├── store/             # Zustand global state + slices
├── hooks/             # Global reusable hooks
├── db/                # Dexie (IndexedDB) schema + backup
├── utils/             # Pure utility functions
├── parsers/           # CSV / OCR receipt parsers
├── services/          # External API services
├── lib/               # Tiny utilities (haptic, etc.)
├── types/             # Global TypeScript types
├── constants/         # App-wide constants
├── data/              # Mock/seed data
├── insights/          # AI insight helpers
└── index.css          # Design system + CSS tokens
```

---

## 🎨 Design System (`src/index.css`)

### CSS Variables — LIGHT mode (`:root`)
| Token | Value |
|-------|-------|
| `--bg` | `#f8fafc` |
| `--surface-card` | `#ffffff` |
| `--surface-input` | `#f1f5f9` |
| `--card` | `var(--surface-card)` ← alias |
| `--card-border` | `var(--border)` ← alias |
| `--bg-secondary` | `var(--surface-input)` ← alias |
| `--text` | `var(--text-primary)` ← alias |
| `--text-primary` | `#0f172a` |
| `--text-secondary` | `#475569` |
| `--text-muted` | `#64748b` |
| `--teal` | `#14b8a6` |
| `--teal-light` | `#2dd4bf` |
| `--teal-dim` | `rgba(20,184,166,0.12)` |
| `--border` | `rgba(0,0,0,0.06)` |
| `--sidebar-bg` | `#1e293b` |
| `--sidebar-text` | `rgba(255,255,255,0.8)` |
| `--red` | `#ef4444` |
| `--green` | `#10b981` |
| `--amber` | `#f59e0b` |
| `--blue` | `#3b82f6` |
| `--purple` | `#8b5cf6` |

### CSS Variables — DARK mode (`:root.dark`)
| Token | Value |
|-------|-------|
| `--bg` | `#121826` |
| `--surface-card` | `#1e2536` |
| `--surface-input` | `#273043` |
| `--text-primary` | `#f8fafc` |
| `--text-secondary` | `#e2e8f0` |
| `--border` | `#2d3748` |
| `--sidebar-bg` | `#0e131d` |

### Dark mode activation
- Class-based: `document.documentElement.classList.toggle('dark')`
- Set by: `src/app/App.tsx` line ~84 and `src/app/hooks/useAppTheme.ts`
- Tailwind: `@custom-variant dark (&:where(.dark, .dark *))`

### Key CSS Utilities
- `.animate-fade-in-up` → `animation: fade-in-up 220ms ease-out forwards`
- `.card` → base card styles
- `.hide-scrollbar` → hides scrollbar cross-browser

---

## 🐚 Shell (`src/shell/`)

### `Header.tsx`
- **Props:** `activeView, unreadCount, onToggleNotifications, onNavigate, currency, currentBalance, theme, onToggleTheme, config, onOpenSearch, isPrivacyEnabled, onTogglePrivacy, onExport, setSearchQuery`
- **Theme icon logic:** Shows `<Moon>` when dark, `<Sun>` when light (fixed 2026-05-24)
- **Mobile bg:** hardcoded gradient `#0f1c35 → #0d2d3f → #0b3d3a`
- **Desktop bg:** `var(--surface-card)`

### `Sidebar.tsx`
- **Props:** `activeView, onViewChange, overBudgetCount, config, showInstall, onInstall, theme, onToggleTheme, onOpenQuickAdd`
- Renders `<DesktopSidebar>` + mobile bottom nav + `<MobileDrawer>`
- Nav items filtered by: `isKidMode`, `userRole` (student/business/professional)

### `shell/components/DesktopSidebar.tsx`
- Icon-only sidebar, 56px wide, fixed left
- Logo: `<Coins>` icon in teal gradient square

### `shell/components/MobileDrawer.tsx`
- Bottom sheet, `z-[70]`, framer-motion spring animation
- Theme toggle: shows Moon (dark) / Sun (light) icon + "Dark Mode" label with proper toggle slider (fixed 2026-05-24)
- Toggle slider: `left: theme === 'dark' ? 'calc(100% - 16px)' : '4px'`

### `shell/components/IconNavItem.tsx`
- Renders single nav icon button with tooltip

### `shell/navigation.ts`
- Exports: `ALL_NAV_ITEMS`, `MOBILE_BOTTOM_IDS`

### `Header.tsx` — Subcomponents rendered:
- `<MasterMic variant="header">` — voice command mic
- `<Bell>` notification button
- User avatar → navigates to `'profile'`

### Other Shell files
| File | Purpose |
|------|---------|
| `CommandPalette.tsx` | Cmd+K search palette |
| `CustomCategoriesModal.tsx` | Category management modal |
| `QuickAddModal.tsx` | FAB quick-add transaction |
| `NotificationCenter.tsx` | Notification drawer |
| `MasterMic.tsx` | Global voice assistant |
| `AlertBanner.tsx` | Top alert strip |
| `PrivacyShield.tsx` | Privacy blur overlay |
| `FeedbackModal.tsx` | Feedback form |

---

## 🧩 UI Primitives (`src/ui/`)

| File | Exports | Key classes/tokens |
|------|---------|-------------------|
| `Button.tsx` | `<Btn v="primary\|ghost\|danger">` | `bg-[var(--teal)]`, `ghost` uses `var(--card-border)` |
| `Input.tsx` | `<Inp>`, `<Field>` | `bg-[var(--bg)]`, `border-[var(--card-border)]`, `text-[var(--text)]` |
| `Select.tsx` | `<Sel>` | Same tokens as Input |
| `Modal.tsx` | `<Modal show onClose>` | Portal-based, backdrop blur |
| `Card.tsx` | `<Card>` | `var(--surface-card)` bg |
| `Alert.tsx` | `<Err msg>`, `<Warn msg>` | Red/amber variants |
| `Avatar.tsx` | `<Avatar>` | `bg-[var(--card-border)]` |
| `Icons.tsx` | `<Ico.Spin>`, etc. | SVG icon set |
| `Toggle.tsx` | `<Toggle>` | Boolean toggle switch |
| `CategoryDropdown.tsx` | `<CategoryDropdown>` | Category picker |
| `EmptyState.tsx` | `<EmptyState>` | Empty placeholder |
| `SkeletonLoader.tsx` | `<Skeleton*>` | Loading skeletons |
| `PinInput.tsx` | `<PinInput>` | PIN entry |
| `Portal.tsx` | `<Portal>` | `ReactDOM.createPortal` |
| `StatusPill.tsx` | `<StatusPill>` | Status badge |

> ⚠️ `--card`, `--card-border`, `--bg-secondary`, `--text` are **aliases** defined in `:root`. They exist from 2026-05-24 fix. Use them in Tailwind as `bg-[var(--card)]` etc.

---

## 🗄️ State Management (`src/store/`)

### `store/index.ts`
- Zustand store combining all slices
- Key selectors: `useStore()`, `useStore(s => s.transactions)`, etc.
- Persists to `localStorage` via `zustand/middleware/persist`
- On load: migrates legacy `spendwise_dark_mode` localStorage key

### Store Slices (`store/slices/`)
| Slice | State managed |
|-------|--------------|
| `financeSlice.ts` | `transactions[]`, `budgets[]`, goals, currency |
| `gamificationSlice.ts` | XP, level, quests, achievements |
| `parentalSlice.ts` | `isTeenMode`, `hideAnalytics`, PIN |
| `portfolioSlice.ts` | Assets, net worth. `lastUpdated` uses `formatLocalYYYYMMDD` |
| `securedSlice.ts` | Encrypted sensitive data |

---

## 🎣 Global Hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useAuth.tsx` | Supabase auth: `user`, `signOut`, `signIn` |
| `useTransactions.ts` | CRUD for transactions |
| `useBudgets.ts` | Budget read/write |
| `useCategories.tsx` | Category list with custom cats |
| `useNotifications.ts` | Notification state |
| `useTheme.ts` | `isDark`, `toggleTheme` |
| `useAppState.ts` | Derived app-level state |
| `useMasterVoice.ts` | Voice command processing |
| `useUPIReturn.tsx` | UPI deep-link return handler |
| `usePWAInstall.ts` | PWA install prompt |
| `useMediaQuery.ts` | Responsive breakpoint |
| `useCountUp.ts` | Animated number counter |
| `usePrefersReducedMotion.ts` | Accessibility motion pref |

### `app/hooks/`
| Hook | Purpose |
|------|---------|
| `useAppTheme.ts` | Reads `prefs.darkMode`, toggles `document.documentElement.classList.add/remove('dark')`, returns `theme: 'light'\|'dark'` |
| `useAppNavigation.ts` | View routing logic |
| `useAppEnvironment.ts` | Platform detection (iOS/Android/PWA) |
| `useShakeFeedback.ts` | Shake-to-feedback gesture |
| `useVoiceMic.ts` | Mic permission + stream |
| `usePWAInstall.ts` | PWA install event capture |

---

## 📦 Database (`src/db/`)

| File | Purpose |
|------|---------|
| `db.ts` | Dexie DB schema: `transactions`, `categories`, `wallets`, `sharedGroups`, etc. |
| `backup.ts` | Export/import DB via `dexie-export-import`. File name uses `formatLocalYYYYMMDD`. Import triggers `window.location.reload()`. |
| `migration.ts` | Schema version migrations |

---

## 🔧 Utilities (`src/utils/`)

| File | Key exports | Notes |
|------|------------|-------|
| `date.ts` | `formatLocalYYYYMMDD(date?)` | **CANONICAL** date utility. Always use this instead of `new Date().toISOString().split('T')[0]` |
| `export.ts` | `exportToCSV`, `exportToPDF` | File names use `formatLocalYYYYMMDD` |
| `import.ts` | `importFromCSV` | CSV parsing wrapper |
| `merchantMapper.ts` | `getMerchantInfo(name)` | Maps merchant names → categories/logos |
| `upiPayment.ts` | UPI deep-link generation | Intent URLs for Indian payment apps |
| `razorpaySync.ts` | Razorpay transaction sync | API calls (simulated/demo) |
| `cn.ts` | `cn(...classes)` | clsx + tailwind-merge |
| `share.ts` | `shareData()` | Web Share API |
| `avatar.ts` | `getInitials(name)` | Avatar initial generator |
| `imageUtils.ts` | Image compression utils | |
| `pushNotification.ts` | Push subscription helper | |

> ⚠️ **Rule:** All date generation MUST use `formatLocalYYYYMMDD` from `src/utils/date.ts`

---

## 🚀 App Bootstrap (`src/app/`)

### `App.tsx`
- Entry: sets dark mode class on `<html>`, applies preferences
- Lines ~83-84: `document.documentElement.setAttribute('data-theme', ...)` + `classList.add('dark')`

### `MainShell.tsx`
- Main layout: `<Header> + <Sidebar> + <main content>`
- Wires up all shell props (theme, nav, notifications)

### `ViewRenderer.tsx`
- Switch/router for all 19 feature views
- Maps `AppView` string → React component

### `AppModals.tsx`
- Global modal registry (rendered at app root level)

---

## 🌟 Features (`src/features/`)

### `dashboard/`
| File | Purpose |
|------|---------|
| `DashboardView.tsx` | Desktop dashboard (charts, KPIs, spend summary) |
| `DashboardViewMobile.tsx` | Mobile optimized dashboard |
| `components/` | Cards, chart wrappers, spend rings |
| `hooks/` | Dashboard-specific computed data |

### `shared/` — Group Wallets + P2P Sync
| File | Purpose |
|------|---------|
| `SharedView.tsx` | Main view: group selector, tab bar, P2P status |
| `components/SharedModals.tsx` | All group modals: Create/Invite/Wallet/Expense/Goal/QR/Connect |
| `components/SharedTabs.tsx` | WalletTab, ExpensesTab, GoalsTab, MembersTab, ActivityTab |
| `components/SharedGroups.tsx` | GroupSelector, InviteBanner, EmptyState |
| `components/SharedOverview.tsx` | Group hero card (balance, stats) |
| `hooks/useSharedWallets.ts` | All P2P logic: WebRTC, group CRUD, sync state |

**P2P Sync status in SharedView:**
- `sw.syncState`: `'connecting' | 'connected' | 'disconnected'`
- `sw.connectedPeers`: number
- `sw.localPeerId`: local WebRTC peer ID (slice 0-8 shown in UI)

### `sync/`
| File | Purpose |
|------|---------|
| `BankSyncView.tsx` | Bank/UPI sync UI — CSV import + simulated bank connect |
| `components/SyncDashboard.tsx` | Sync status dashboard |
| `components/CSVImporter.tsx` | CSV mapping + import UI |
| `components/UPILink.tsx` | UPI payment link generator |

### `transactions/`
| File | Purpose |
|------|---------|
| `HistoryView.tsx` | Desktop transaction history |
| `HistoryViewMobile.tsx` | Mobile transaction list |
| `components/TransactionRow.tsx` | Single transaction row |
| `components/TransactionList.tsx` | Virtualized list |
| `components/TransactionFilters.tsx` | Filter/search bar |
| `components/HistoryToolbar.tsx` | Bulk actions toolbar |
| `components/BulkActionHeader.tsx` | Bulk select mode header |
| `components/DeleteConfirmModal.tsx` | Delete confirmation |
| `components/SortBtn.tsx` | Sort control |

### `budget/`
- `BudgetView.tsx` — Budget overview
- `components/BudgetManager.tsx` — Add/edit budget categories

### `analytics/`
- `AnalyticsView.tsx` — Charts: spending trends, category breakdown

### `portfolio/`
- `PortfolioView.tsx` — Net worth tracker (assets + liabilities)
- `components/WealthTree.tsx` — Visual asset tree

### `goals/`
- Goal tracking (savings targets)

### `subscriptions/`
- `components/SubscriptionManager.tsx` — Subscription tracker
- `components/AddSubscriptionModal.tsx` — Add/edit subscription

### `advisor/`
- AI chat advisor
- `components/ChatMessageList.tsx` — Chat UI

### `profile/`
- `ProfileView.tsx` — Settings + profile
- `components/useProfileView.ts` — Profile logic hook

### `auth/`
- Login/signup flows

### `onboarding/`
- `components/OnboardingModal.tsx` — Exports `SpendWiseConfig` type

### `parental/`
- Kid/teen mode controls

### `education/`
- `EducationView.tsx` — Financial literacy content

### `gamification/`
- Quests, XP, achievements

### `reports/`
- Report generation

### `recurring/`
- `RecurringView.tsx` — Recurring transaction management

### `ai/`
- AI-related helpers

---

## 📐 Types (`src/types/`)

Key types (from `types/index.ts` or similar):
```ts
type AppView = 'dashboard' | 'analytics' | 'budget' | 'history' | 'goals' |
               'shared' | 'sync' | 'profile' | 'portfolio' | 'subscriptions' |
               'advisor' | 'education' | 'quests' | 'parental' | 'reports' | 'recurring';

type Transaction = { id, amount, type: 'income'|'expense', category, date, note, ... }
type Budget = { id, category, amount, spent, period }
type SpendWiseConfig = { name, userRole: 'student'|'professional'|'business', currency, ... }
```

---

## 📡 Parsers (`src/parsers/`)
| File | Purpose |
|------|---------|
| `csv.ts` | CSV → Transaction[] parser. Uses `formatLocalYYYYMMDD`. |
| `ocr.ts` | Receipt image → Transaction OCR. Uses `formatLocalYYYYMMDD`. |

---

## 📋 Key Rules & Patterns

### Date Handling
```ts
// ✅ CORRECT
import { formatLocalYYYYMMDD } from '@/utils/date';
const today = formatLocalYYYYMMDD();

// ❌ WRONG (timezone drift risk)
const today = new Date().toISOString().split('T')[0];
```

### Theme Toggle
```ts
// In useAppTheme.ts:
document.documentElement.classList.add('dark');    // enable dark
document.documentElement.classList.remove('dark'); // enable light
// Header reads: theme === 'dark' → shows Moon icon, clicking → switches to light
```

### CSS Variable Usage in Tailwind
```tsx
// ✅ Use aliases:
className="bg-[var(--card)] border-[var(--card-border)] text-[var(--text)]"
// ✅ Use explicit tokens:
className="bg-[var(--surface-card)] text-[var(--text-primary)]"
```

### Modal Pattern
```tsx
// All modals use src/ui/Modal.tsx:
<Modal show={showXxx} onClose={() => setXxx(false)}>
  ...content
</Modal>
```

### Store Access Pattern
```ts
const store = useStore();
const { transactions, budgets } = store;
// Or with selector:
const transactions = useStore(s => s.transactions);
```

---

## 🔄 Change Log (Recent Sessions)

### 2026-05-24
- **`src/index.css`**: Added missing CSS variable aliases: `--card`, `--card-border`, `--bg-secondary`, `--text` to `:root`
- **`src/shell/Header.tsx`**: Fixed theme icon — now shows `<Moon>` in dark mode, `<Sun>` in light mode
- **`src/shell/components/MobileDrawer.tsx`**: Fixed dark mode toggle label ("Dark Mode" always visible), fixed slider positioning logic (`left: calc(100% - 16px)` when dark)
- **`src/utils/export.ts`**: Migrated to `formatLocalYYYYMMDD`
- **`src/db/backup.ts`**: Migrated to `formatLocalYYYYMMDD`
- **`src/store/slices/portfolioSlice.ts`**: Migrated to `formatLocalYYYYMMDD`
- **`src/parsers/csv.ts`**: Migrated to `formatLocalYYYYMMDD`
- **`src/parsers/ocr.ts`**: Migrated to `formatLocalYYYYMMDD`
- **`src/data/mockData.ts`**: Migrated to `formatLocalYYYYMMDD`

---

## ⚡ Quick File Lookup

| What you want to change | File to edit |
|------------------------|-------------|
| Theme toggle button | `shell/Header.tsx` (L180-193) |
| Mobile "More" drawer | `shell/components/MobileDrawer.tsx` |
| Desktop sidebar icons | `shell/components/DesktopSidebar.tsx` |
| Nav items list | `shell/navigation.ts` |
| CSS color tokens | `src/index.css` (`:root` / `:root.dark`) |
| Dark mode class toggle | `app/App.tsx` L83-84, `app/hooks/useAppTheme.ts` |
| Add new route/view | `app/ViewRenderer.tsx` + `shell/navigation.ts` |
| Global state | `store/index.ts` + `store/slices/*.ts` |
| Shared P2P wallets | `features/shared/hooks/useSharedWallets.ts` |
| Shared wallet UI | `features/shared/SharedView.tsx` |
| Transaction list | `features/transactions/HistoryView.tsx` |
| Date utilities | `utils/date.ts` |
| Primitive button/input | `ui/Button.tsx`, `ui/Input.tsx`, `ui/Select.tsx` |
| Modals (shared) | `features/shared/components/SharedModals.tsx` |
````

## File: src/app/hooks/useAppEnvironment.ts
````typescript
import { useState, useEffect } from 'react';
⋮----
export function useAppEnvironment()
⋮----
const handleOnline = ()
const handleOffline = ()
⋮----
const handleViewportResize = () =>
````

## File: src/app/hooks/useAppNavigation.ts
````typescript
import { useState, useEffect, useCallback } from 'react';
import { AppView } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface UseAppNavigationProps {
  initialView: AppView;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  showCategoriesModal: boolean;
  setShowCategoriesModal: (show: boolean) => void;
}
⋮----
export function useAppNavigation({
  initialView,
  showQuickAdd,
  setShowQuickAdd,
  showNotifications,
  setShowNotifications,
  showCommandPalette,
  setShowCommandPalette,
  showCategoriesModal,
  setShowCategoriesModal,
}: UseAppNavigationProps)
⋮----
// Sync URL with active view and maintain proper history state object
⋮----
const handlePopState = (e: PopStateEvent) =>
⋮----
// If we popped and had a modal open, close it
⋮----
// Update activeView based on state
⋮----
// Handle PWA shortcuts or deep links
const handleUrlParams = () =>
⋮----
// Clean up URL without refreshing
⋮----
// Also listen for visibility changes (when resuming from background)
const handleVisibilityChange = () =>
⋮----
// Edge Swipe Detection (Android Style Navigation)
⋮----
const edgeThreshold = 30; // 30px from edge
⋮----
const handleTouchStart = (e: TouchEvent) =>
⋮----
const handleTouchEnd = (e: TouchEvent) =>
⋮----
if (duration < 300) { // Fast swipe
// Swipe from Left Edge -> Right (Back)
⋮----
// Sync state with browser history for back-button support
⋮----
// Only push if we haven't already (simple check)
````

## File: src/app/hooks/useAppTheme.ts
````typescript
import { useCallback, useEffect } from 'react';
import { useStore } from '@/store';
import { AppView } from '@/types';
⋮----
export function useAppTheme(activeView: AppView)
````

## File: src/app/hooks/usePWAInstall.ts
````typescript
import { useState, useEffect } from 'react';
⋮----
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
⋮----
prompt(): Promise<void>;
⋮----
export function usePWAInstall()
⋮----
const handleBeforeInstallPrompt = (e: Event) =>
⋮----
const handleInstallClick = async () =>
````

## File: src/app/hooks/useShakeFeedback.ts
````typescript
import { useEffect } from 'react';
import { useStore } from '@/store';
import { haptic } from '@/lib/haptic';
⋮----
export function useShakeFeedback(
  setShowFeedback: (show: boolean) => void,
  addNotification: (notif: any) => void
)
⋮----
// Shake Detection for Feedback & AI Assistant
⋮----
const threshold = 18; // Slightly higher threshold for fewer false positives
⋮----
const handleMotion = (e: DeviceMotionEvent) =>
⋮----
// Shake detected!
⋮----
// Show feedback modal instead of just switching view
````

## File: src/app/hooks/useVoiceMic.ts
````typescript
/**
 * useVoiceMic — orchestrates voice-mic UI state for MasterMic.
 *
 * Wraps useMasterVoice and adds:
 *  - Space-bar push-to-talk shortcut
 *  - History panel toggle with outside-click dismiss
 *  - First-use onboarding state
 *  - FAB click handler
 */
⋮----
import { useEffect, useState, useCallback } from 'react';
import { useMasterVoice } from '@/hooks/useMasterVoice';
import { AppView } from '@/types';
⋮----
interface UseVoiceMicOptions {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
export function useVoiceMic(options: UseVoiceMicOptions)
⋮----
// ── Space-bar shortcut ───────────────────────────────────────────────────
⋮----
const onDown = (e: KeyboardEvent) =>
const onUp = (e: KeyboardEvent) =>
⋮----
// ── Close history on outside click ───────────────────────────────────────
⋮----
const fn = ()
⋮----
// ── FAB click handler ────────────────────────────────────────────────────
⋮----
// ── Onboarding dismiss ──────────────────────────────────────────────────
⋮----
// voice state
⋮----
// UI state
⋮----
// handlers
````

## File: src/features/advisor/components/ChatInput.tsx
````typescript
import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
⋮----
interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
  dynamicQuickActions: string[];
}
⋮----
setInput(action);
⋮----
{/* Voice Listening Overlay */}
⋮----
onChange=
⋮----
onClick=
````

## File: src/features/advisor/components/ChatMessageList.tsx
````typescript
import React from 'react';
import { Bot, User, Zap } from 'lucide-react';
import { Message } from '../types';
⋮----
````

## File: src/features/advisor/types.ts
````typescript
export interface MessageData {
  action?: 'CREATE_BUDGET' | 'VIEW_ANALYTICS' | 'SET_GOAL';
  balance?: number;
  expenses?: number;
  topCategory?: string;
  savingsRate?: string;
}
⋮----
export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  type?: 'text' | 'action_card' | 'briefing';
  data?: MessageData;
  streaming?: boolean;
}
````

## File: src/features/analytics/components/CategoryBreakdownList.tsx
````typescript
import { CategorySpend, AppView } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/lib/haptic';
⋮----
interface CategoryBreakdownListProps {
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency: string;
  onNavigate?: (view: AppView, category?: string) => void;
}
⋮----
onClick=
````

## File: src/features/analytics/components/IncomeExpensesChart.tsx
````typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { MonthlyHistoryPoint } from '@/types';
import { ChartTooltip } from '@/features/analytics/components/AnalyticsPrimitives';
⋮----
interface IncomeExpensesChartProps {
  monthlyHistory: MonthlyHistoryPoint[];
  currency: string;
}
````

## File: src/features/analytics/components/SavingsTrendChart.tsx
````typescript
import { LineChart, Line, ReferenceLine, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyHistoryPoint } from '@/types';
import { SavingsTooltip } from '@/features/analytics/components/AnalyticsPrimitives';
⋮----
interface SavingsTrendChartProps {
  monthlyHistory: MonthlyHistoryPoint[];
  currency: string;
  latestMonth: MonthlyHistoryPoint | null;
}
````

## File: src/features/budget/components/BudgetCategoryCard.tsx
````typescript
import { motion } from 'framer-motion';
import { Target, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Category } from '@/types';
⋮----
interface BudgetCategoryCardProps {
  b: {
    category: Category;
    limit: number;
    spent: number;
    remaining: number;
    percent: number;
    status: 'good' | 'warning' | 'danger';
  };
  currency: string;
  onEdit: (category: Category, limit: string) => void;
  onRemove: (category: Category) => void;
}
⋮----
onClick=
````

## File: src/features/budget/components/BudgetCategoryCardMobile.tsx
````typescript
import { motion } from 'framer-motion';
import { Target, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Category } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface BudgetCategoryCardMobileProps {
  b: {
    category: Category;
    limit: number;
    spent: number;
    remaining: number;
    percent: number;
    status: 'good' | 'warning' | 'danger';
  };
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  onEdit: (category: string, limit: number) => void;
  onRemove: (category: Category) => void;
}
⋮----
{/* Background progress indicator (subtle) */}
⋮----
onClick=
````

## File: src/features/budget/components/BudgetSummary.tsx
````typescript
import { motion } from 'framer-motion';
⋮----
interface BudgetSummaryProps {
  currency: string;
  totalBudgeted: number;
  overallBudgetPercent: number;
}
````

## File: src/features/budget/components/BudgetSummaryMobile.tsx
````typescript
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
⋮----
interface BudgetSummaryMobileProps {
  currency: string;
  totalBudgeted: number;
  overallBudgetPercent: number;
}
⋮----
{/* Abstract background shapes */}
````

## File: src/features/dashboard/components/AIInsights.tsx
````typescript
import { BrainCircuit, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
⋮----
interface AIInsightsProps {
  insights: {
    topCat: [string, number] | undefined;
    topCatChange: number | null;
    savingsRate: number;
    totalExpensesChange: number | null;
  };
  transactionsCount: number;
  currency: string;
}
````

## File: src/features/dashboard/components/DashboardHeader.tsx
````typescript
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface DashboardHeaderProps {
  config: SpendWiseConfig | null;
  isMobile: boolean;
  streak: number;
}
````

## File: src/features/dashboard/components/MobileBalanceHero.tsx
````typescript
import { TrendingDown, TrendingUp } from 'lucide-react';
⋮----
interface MobileBalanceHeroProps {
  currentBalance: number;
  currency: string;
  hideBalances: boolean;
  trendUp: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
}
⋮----
{/* Top row: label + trend */}
⋮----
{/* Balance numeral */}
⋮----
{/* Income / Spent chips */}
````

## File: src/features/dashboard/components/MobileRecentTransactions.tsx
````typescript
import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Transaction, AppView } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface MobileRecentTransactionsProps {
  recentTransactions: Transaction[];
  onNavigate: (view: AppView) => void;
  currency: string;
}
⋮----
{/* Section header */}
⋮----
{/* Transaction rows */}
⋮----
{/* Category emoji badge */}
⋮----
{/* Name + category */}
⋮----
{/* Amount */}
````

## File: src/features/dashboard/components/SnapCardRow.tsx
````typescript
import React from 'react';
import { Target, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
// ─── Snap-row card ────────────────────────────────────────────────────────────
⋮----
interface SnapCardProps {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactNode;
  onClick: () => void;
}
⋮----
// ─── Container ────────────────────────────────────────────────────────────────
⋮----
onClick=
````

## File: src/features/dashboard/hooks/useDashboardData.ts
````typescript
import { useMemo } from 'react';
import { Transaction } from '@/types';
import { FinanceState } from '@/types/state';
⋮----
export function useDashboardData(
  transactions: Transaction[],
  monthlyStats: FinanceState['monthlyStats'],
  monthlyHistory: FinanceState['monthlyHistory'],
  balanceTrend: FinanceState['balanceTrend'],
)
⋮----
// Chart Data
⋮----
// Recent Merchants
⋮----
// Recent Transactions (Desktop)
⋮----
// Recent Transactions (Mobile)
⋮----
// Balance Trend Percentage
⋮----
// Balance Trend Direction (Mobile)
⋮----
// Savings Rate
⋮----
// Subscription Spend (Mobile)
⋮----
// AI Insights
````

## File: src/features/gamification/components/UserLevelCard.tsx
````typescript
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Flame, Award } from 'lucide-react';
⋮----
interface UserLevelCardProps {
  level: number;
  rank: string;
  currentLevelXP: number;
  xpProgress: number;
  XP_PER_LEVEL: number;
  streak: number;
  totalXPToday: number;
  completedCount: number;
}
⋮----
{/* Background glow */}
⋮----
{/* Level badge */}
⋮----
{/* Stats */}
⋮----
{/* XP bar */}
````

## File: src/features/onboarding/components/OnboardingSidebar.tsx
````typescript
import { Shield, TrendingUp, Target, Zap } from 'lucide-react';
````

## File: src/features/onboarding/components/OnboardingStep1.tsx
````typescript
import React, { RefObject } from 'react';
import { Check, ArrowRight } from 'lucide-react';
⋮----
export type CurrencySymbol = '$' | '£' | '€' | '₹';
⋮----
interface OnboardingStep1Props {
  step: number;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  rawValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  focused: boolean;
  setFocused: (f: boolean) => void;
  isValid: boolean;
  handleNextStep: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}
````

## File: src/features/onboarding/components/OnboardingStep2.tsx
````typescript
import React from 'react';
import { ArrowRight } from 'lucide-react';
⋮----
export type UserRole = 'student' | 'professional' | 'business';
⋮----
interface OnboardingStep2Props {
  step: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  setStep: (step: 1 | 2 | 3) => void;
}
⋮----
onClick=
````

## File: src/features/onboarding/components/OnboardingStep3.tsx
````typescript
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserRole } from './OnboardingStep2';
⋮----
interface OnboardingStep3Props {
  step: number;
  name: string;
  setName: (v: string) => void;
  userRole: UserRole;
  occupation: string;
  setOccupation: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  monthlyGoal: string;
  setMonthlyGoal: (v: string) => void;
  handleFinalSubmit: () => void;
}
⋮----
onChange=
````

## File: src/features/portfolio/components/MobilePortfolioHero.tsx
````typescript
import { Sparkles } from 'lucide-react';
⋮----
interface MobilePortfolioHeroProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
}
⋮----
export function MobilePortfolioHero({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
}: MobilePortfolioHeroProps)
````

## File: src/features/portfolio/components/PortfolioHeader.tsx
````typescript
import { TrendingUp, BarChart2, BrainCircuit, Zap, Plus } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface PortfolioHeaderProps {
  config: SpendWiseConfig | null;
  activeTab: 'overview' | 'simulation' | 'debt';
  setActiveTab: (tab: 'overview' | 'simulation' | 'debt') => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
}
⋮----
onClick=
````

## File: src/features/portfolio/components/PortfolioInsights.tsx
````typescript
import { BrainCircuit, TrendingUp, Sparkles } from 'lucide-react';
import AllocationDonut from '@/features/portfolio/components/AllocationDonut';
import NetWorthEvolution from '@/features/portfolio/components/NetWorthEvolution';
import { WealthTree } from '@/features/portfolio/components/WealthTree';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface PortfolioInsightsProps {
  financeState: any;
  currency: string;
  healthScore: number;
  savingsRate: number;
  config: SpendWiseConfig | null;
  allocationByType: any[];
  totalAssets: number;
  netWorth: number;
}
⋮----
export function PortfolioInsights({
  financeState,
  currency,
  healthScore,
  savingsRate,
  config,
  allocationByType,
  totalAssets,
  netWorth,
}: PortfolioInsightsProps)
````

## File: src/features/portfolio/components/PortfolioLists.tsx
````typescript
import { Landmark, Zap, ShieldAlert } from 'lucide-react';
import EntryCard from '@/features/portfolio/components/EntryCard';
import { getAssetCfg, getLiabilityCfg } from '@/data/portfolioConfig';
⋮----
function fmt(n: number, currency: string)
⋮----
interface PortfolioListsProps {
  assets: any[];
  liabilities: any[];
  totalLiabilities: number;
  currency: string;
  deleteAsset: (id: string) => void;
  deleteLiability: (id: string) => void;
  setModal: (modal: 'asset' | 'liability' | null) => void;
}
⋮----
onDelete=
````

## File: src/features/portfolio/components/PortfolioSummaryBanner.tsx
````typescript
import { Sparkles } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
function fmt(n: number, currency: string)
⋮----
interface PortfolioSummaryBannerProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
  config: SpendWiseConfig | null;
}
⋮----
export function PortfolioSummaryBanner({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
  config,
}: PortfolioSummaryBannerProps)
````

## File: src/features/profile/components/FamilySafetySection.tsx
````typescript
import React from 'react';
import { ShieldCheck } from 'lucide-react';
⋮----
interface FamilySafetySectionProps {
  onNavigate?: (view: any) => void;
}
````

## File: src/features/profile/components/ProfileHeader.tsx
````typescript
import React, { RefObject } from 'react';
import { User, Camera } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface ProfileHeaderProps {
  avatar: string | null;
  name: string;
  occupation: string;
  location: string;
  config: SpendWiseConfig | null;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
⋮----
<button onClick=
````

## File: src/features/shared/components/SharedGroups.tsx
````typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Ico } from '@/ui/Icons';
import { haptic } from '@/lib/haptic';
⋮----
const relTime = (d: string) =>
⋮----
export function InviteBanner({ invites, onAccept, onDecline }: {
  invites: { memberId: string; groupId: string; groupName: string; groupPurpose: string; invitedAt: string }[];
onAccept: (id: string)
⋮----
onClick=
⋮----
export function EmptyState(
⋮----
<div onClick=
````

## File: src/features/shared/components/SharedOverview.tsx
````typescript
import { motion } from 'framer-motion';
import { Users, Sparkles, Wallet, Target } from 'lucide-react';
import { haptic } from '@/lib/haptic';
⋮----
interface SharedOverviewProps {
  groupName: string;
  purposeConfig: { bg: string; border: string; text: string };
  purpose: string;
  tab: string;
  setTab: (tab: any) => void;
  currency: string;
  walletBalance: number;
  membersCount: number;
  goalsCount: number;
}
⋮----
onClick=
````

## File: src/features/transactions/components/TransactionFilters.tsx
````typescript
import React from 'react';
import { Search, Filter, X, Calendar, IndianRupee } from 'lucide-react';
import { Category } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
export type TypeFilter = 'all' | 'credit' | 'debit';
⋮----
export interface TransactionFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  showDateFilter: boolean;
  setShowDateFilter: React.Dispatch<React.SetStateAction<boolean>>;
  dateFrom: string;
  setDateFrom: (s: string) => void;
  dateTo: string;
  setDateTo: (s: string) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (t: TypeFilter) => void;
  categoryFilter: Category | 'All';
  setCategoryFilter: (c: Category | 'All') => void;
  allCategories: Category[];
  mergedIcons: Record<string, string>;
  hasFilters: boolean;
  clearFilters: () => void;
  // Amount range
  amountMin?: string;
  setAmountMin?: (v: string) => void;
  amountMax?: string;
  setAmountMax?: (v: string) => void;
  showAmountFilter?: boolean;
  setShowAmountFilter?: React.Dispatch<React.SetStateAction<boolean>>;
}
⋮----
// Amount range
⋮----
<button onClick=
⋮----
haptic.light();
setShowDateFilter(s
⋮----
onClick=
⋮----
setTypeFilter(t);
⋮----
setCategoryFilter(cat as Category | 'All');
````

## File: src/features/transactions/hooks/useTransactionHistory.ts
````typescript
import { useState, useMemo, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import type { SortKey, SortDir, TypeFilter } from '@/features/transactions/components/historyTypes';
⋮----
export type DisplayRow =
  | { type: 'header'; date: string; subtotal: number }
  | { type: 'tx'; tx: Transaction };
⋮----
export function useTransactionHistory(transactions: Transaction[], initialSearchQuery: string = '')
⋮----
const handleSort = (key: SortKey) =>
⋮----
const clearFilters = () =>
````

## File: src/hooks/useCountUp.ts
````typescript
import { useEffect, useRef, useState } from 'react';
⋮----
/**
 * Animates a number from its previous value to the new target value.
 * Uses requestAnimationFrame for smooth, performant animation.
 *
 * @param target   The destination number to animate to
 * @param duration Animation duration in ms (default: 600)
 * @returns        The current animated display value
 */
export function useCountUp(target: number, duration = 600): number
⋮----
// Cancel any in-progress animation
⋮----
// No animation needed if value unchanged
⋮----
function step(timestamp: number)
⋮----
// Ease-out cubic: decelerates as it approaches target
````

## File: src/lib/voiceCommands/handlers/assetHandlers.ts
````typescript
import { useStore } from '@/store';
import { IntentHandler, formatCurrency, shortId, todayISO } from './types';
import { Transaction } from '@/types';
⋮----
// LIABILITY HANDLERS
export const handleLiabilityAdd: IntentHandler = (
⋮----
export const handleLiabilityPay: IntentHandler = (
⋮----
export const handleLiabilityDelete: IntentHandler = (
⋮----
// PORTFOLIO HANDLERS
export const handlePortfolioUpdate: IntentHandler = (
⋮----
export const handlePortfolioAdjust: IntentHandler = (
⋮----
export const handlePortfolioDelete: IntentHandler = (
⋮----
// GOAL HANDLERS
export const handleGoalAdd: IntentHandler = (
⋮----
export const handleGoalUpdate: IntentHandler = (
⋮----
export const handleGoalDelete: IntentHandler = (
````

## File: src/lib/voiceCommands/handlers/budgetHandlers.ts
````typescript
import { useStore } from '@/store';
import { Category } from '@/types';
import { IntentHandler, formatCurrency } from './types';
⋮----
export const handleBudgetUpdate: IntentHandler = (
⋮----
export const handleBudgetDelete: IntentHandler = (
⋮----
export const handleBudgetReset: IntentHandler = () =>
⋮----
export const handleBudgetSettingsUpdate: IntentHandler = (
````

## File: src/lib/voiceCommands/handlers/index.ts
````typescript

````

## File: src/lib/voiceCommands/handlers/navigationHandlers.ts
````typescript
import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';
⋮----
export const handleNavigate: IntentHandler = (
⋮----
export const handleSearchAction: IntentHandler = (
⋮----
export const handleReportExport: IntentHandler = (
⋮----
export const handleHelp: IntentHandler = () =>
⋮----
export const handleUndoAction: IntentHandler = () =>
⋮----
export const handleQuestAction: IntentHandler = (
⋮----
export const handleQuestClaim: IntentHandler = (
````

## File: src/lib/voiceCommands/handlers/queryHandlers.ts
````typescript
import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';
⋮----
export const handleDataQuery: IntentHandler = (
⋮----
export const handleQueryReport: IntentHandler = (
````

## File: src/lib/voiceCommands/handlers/settingsHandlers.ts
````typescript
import { IntentHandler, formatCurrency } from './types';
import { useStore } from '@/store';
import { Category } from '@/types';
⋮----
export const handleSettingsToggle: IntentHandler = (
⋮----
export const handleParentalToggle: IntentHandler = (
⋮----
export const handleParentalLimitSet: IntentHandler = (
⋮----
export const handleParentalRestrictCategory: IntentHandler = (
⋮----
export const handleParentalApproveTx: IntentHandler = (
⋮----
export const handleParentalDenyTx: IntentHandler = (
⋮----
export const handleSessionLock: IntentHandler = () =>
````

## File: src/lib/voiceCommands/handlers/subscriptionHandlers.ts
````typescript
import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';
⋮----
export const handleSubscriptionAdd: IntentHandler = (
⋮----
export const handleSubscriptionUpdate: IntentHandler = (
⋮----
export const handleSubscriptionDelete: IntentHandler = (
````

## File: src/lib/voiceCommands/handlers/transactionHandlers.ts
````typescript
import { useStore } from '@/store';
import { Transaction, Category } from '@/types';
import { IntentHandler, formatCurrency, shortId, todayISO, yesterdayISO } from './types';
⋮----
export const handleTransactionAdd: IntentHandler = (
⋮----
export const handleTransactionDelete: IntentHandler = (
⋮----
export const handleTransactionUpdate: IntentHandler = (
⋮----
export const handleBatchTransactions: IntentHandler = (
⋮----
export const handleTransactionBulkDelete: IntentHandler = (
⋮----
export const handleTransactionBulkUpdate: IntentHandler = (
⋮----
export const handleRecurringAdd: IntentHandler = (
⋮----
export const handleRecurringDelete: IntentHandler = (
````

## File: src/lib/voiceCommands/handlers/types.ts
````typescript
import { VoiceCommand, CommandResult } from '@/lib/voiceCommands/types';
import { AppView } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface CommandContext {
  command: VoiceCommand;
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
export type IntentHandler = (context: CommandContext) => Promise<CommandResult> | CommandResult;
⋮----
// Utility functions
export function formatCurrency(amount: number): string
⋮----
// ignore
⋮----
export function shortId(): string
⋮----
export function todayISO(): string
⋮----
export function yesterdayISO(): string
````

## File: src/shell/components/ConfirmDialog.tsx
````typescript
import { AlertTriangle } from 'lucide-react';
⋮----
interface ConfirmDialogProps {
  summary: string;
  onConfirm: () => void;
  onCancel: () => void;
}
````

## File: src/shell/components/DesktopSidebar.tsx
````typescript
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Settings, LogOut, DownloadCloud } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/lib/haptic';
import { IconNavItem, Sep } from './IconNavItem';
⋮----
interface DesktopSidebarProps {
  activeView: AppView;
  navigate: (view: AppView) => void;
  coreItems: any[];
  wealthItems: any[];
  toolItems: any[];
  overBudgetCount: number;
  showInstall?: boolean;
  onInstall?: () => void;
  signOut: () => void;
}
⋮----
onClick=
⋮----
if (signOutRef.current)
const rect = signOutRef.current.getBoundingClientRect();
setSignOutTipTop(rect.top + rect.height / 2);
````

## File: src/shell/components/HistoryPanel.tsx
````typescript
import { CheckCircle2, XCircle } from 'lucide-react';
import { HistoryEntry } from '@/hooks/useMasterVoice';
⋮----
onClick=
````

## File: src/shell/components/IconNavItem.tsx
````typescript
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface IconNavItemProps {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}
⋮----
const handleEnter = () =>
const handleLeave = () =>
````

## File: src/shell/components/MicTranscript.tsx
````typescript
interface MicTranscriptProps {
  transcript: string;
}
⋮----
export function MicTranscript(
````

## File: src/shell/components/MissingEntityPrompt.tsx
````typescript
interface MissingEntityPromptProps {
  prompt: string;
}
````

## File: src/shell/components/MobileDrawer.tsx
````typescript
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, DownloadCloud, Settings, LogOut } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: AppView;
  navigate: (view: AppView) => void;
  mobileDrawerItems: any[];
  overBudgetCount: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  showInstall?: boolean;
  onInstall?: () => void;
  signOut: () => void;
}
⋮----
onClick=
````

## File: src/shell/components/OnboardingTooltip.tsx
````typescript
interface OnboardingTooltipProps {
  onDismiss: () => void;
}
````

## File: src/shell/components/ResultMessage.tsx
````typescript
interface ResultMessageProps {
  result: { success: boolean; message: string };
}
````

## File: src/shell/components/WaveformVisualizer.tsx
````typescript
interface WaveformVisualizerProps {
  barCount?: number;
}
````

## File: src/shell/navigation.ts
````typescript
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Target,
  PieChart, TrendingUp, RefreshCw, Users, SmartphoneNfc,
  Bot, GraduationCap, Trophy, Shield, FileText
} from 'lucide-react';
import { AppView } from '@/types';
````

## File: src/utils/cn.ts
````typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
⋮----
export function cn(...inputs: ClassValue[])
````

## File: src/utils/date.ts
````typescript
/**
 * date.ts — Timezone-safe local date utilities
 */
⋮----
/**
 * Formats a Date object as a local YYYY-MM-DD string,
 * avoiding the UTC date-shifting bug caused by .toISOString().
 */
export function formatLocalYYYYMMDD(d: Date): string
````

## File: src/app/App.tsx
````typescript
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useAuth } from '@/hooks/useAuth';
import AuthView from '@/features/auth/AuthView';
import { MainShell } from '@/app/MainShell';
import { AppView } from '@/types';
import { STORAGE_KEYS, FINANCE_DEFAULTS } from '@/constants';
import { useStore } from '@/store';
⋮----
// Apply Dark Mode
⋮----
// Apply Font Size
⋮----
// Apply High Contrast
⋮----
const setConfig = (newConfig: SpendWiseConfig) =>
````

## File: src/app/AppModals.tsx
````typescript
import React from 'react';
import NotificationCenter from '@/shell/NotificationCenter';
import CustomCategoriesModal from '@/shell/CustomCategoriesModal';
import CommandPalette from '@/shell/CommandPalette';
import LevelUpModal from '@/features/gamification/components/LevelUpModal';
import PrivacyShield from '@/shell/PrivacyShield';
import { OfflineIndicator } from '@/shell/OfflineIndicator';
import { BudgetAlertToast } from '@/features/budget/components/BudgetAlertToast';
import { AppView, Transaction, Category } from '@/types';
⋮----
interface AppModalsProps {
  store: any;
  appState: any;
  userId: string | null;
  currency: string;
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  showCategoriesModal: boolean;
  setShowCategoriesModal: (v: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean) => void;
  handleViewChange: (v: AppView) => void;
}
⋮----
export const AppModals: React.FC<AppModalsProps> = ({
  store,
  appState,
  userId,
  currency,
  showNotifications,
  setShowNotifications,
  showCategoriesModal,
  setShowCategoriesModal,
  showCommandPalette,
  setShowCommandPalette,
  handleViewChange,
}) =>
⋮----
handleViewChange(view);
setShowNotifications(false);
⋮----
cloudMode=
````

## File: src/app/ViewRenderer.tsx
````typescript
import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '@/types';
import { SkeletonLoader } from '@/ui/SkeletonLoader';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import AlertBanner from '@/shell/AlertBanner';
⋮----
// Lazy loaded views
⋮----
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { SpendWiseStore, ParentalControlState } from '@/store';
import { AppState } from '@/types/state';
⋮----
interface ViewRendererProps {
  activeView: AppView;
  appState: AppState;
  store: SpendWiseStore;
  pcSettings: ParentalControlState;
  onNavigate: (view: AppView) => void;
  onAdd: (tx: Transaction) => void;
  onPDFReport: () => void;
  config: SpendWiseConfig | null;
  setConfig: (config: SpendWiseConfig) => void;
  resetData: () => Promise<void>;
  userId: string | null;
  onManageCategories?: () => void;
  voiceSearchQuery?: string;
}
⋮----
const ViewWrapper: React.FC<
⋮----
onCategoryChange=
⋮----
financeState.addTransactions(txs);
⋮----
onResetData=
⋮----
// Handled by App.tsx through setConfig, but let's make sure it's saved
// The parent handles saving in App.tsx
⋮----
{/* Alias: transactions → HistoryView */}
⋮----
{/* Alias: settings → ProfileView */}
````

## File: src/data/currencies.ts
````typescript

````

## File: src/features/ai/components/AIInputTools.tsx
````typescript
import { Loader2, Camera, Mic } from 'lucide-react';
import { RefObject } from 'react';
// import removed
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store';
import { parseVoiceLocally } from '@/parsers/voice';
import { compressImage } from '@/utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '@/parsers/ocr';
⋮----
{/* ── Snap Receipt ─────────────────────────────────────────── */}
⋮----
{/* ── Magic Mic ─────────────────────────────────────────────── */}
<button
          type="button"
onClick=
⋮----
{/* Live scan/voice status hint */}
````

## File: src/features/ai/components/MagicInput.tsx
````typescript
import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Loader2, Check, X, Mic, Camera, Paperclip } from 'lucide-react';
import { processNaturalLanguageExpense } from '@/parsers/nlp';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types';
import { AIInputTools } from '@/features/ai/components/AIInputTools';
import { compressImage } from '@/utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '@/parsers/ocr';
import { parseVoiceLocally } from '@/parsers/voice';
import { parseVoiceWithGemini } from '@/services/VoiceService';
import { useCurrency } from '@/contexts/CurrencyContext';
import ReceiptScanner from '@/features/ai/components/ReceiptScanner';
import { haptic } from '@/lib/haptic';
import { predictCategory } from '@/utils/merchantMapper';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface MagicInputProps {
  onAdd: (transaction: Transaction) => void;
  externalInput?: string;
  onInputChange?: (val: string) => void;
  transactions?: Transaction[];
  onFocus?: () => void;
  autoFocus?: boolean;
}
⋮----
const handleProcess = async () =>
⋮----
// Dismiss soft keyboard on mobile devices immediately
⋮----
// Fallback: create a minimal transaction from the raw text
⋮----
// Intelligent Default: If merchant matches history, suggest previous category
⋮----
const handleConfirm = () =>
⋮----
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleVoiceInput = () =>
⋮----
// @ts-ignore
⋮----
{/* Scan Status Overlay */}
⋮----
{/* Quick Suggestions */}
⋮----
onClick=
⋮----
onExtracted=
````

## File: src/features/ai/components/ReceiptScanner.tsx
````typescript
import React, { useState, useRef, useEffect } from 'react';
import { processReceipt } from '@/services/OCRService';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: { merchant: string; amount: number; date: string }) => void;
}
⋮----
// Cropping & Resizing State (percentages)
⋮----
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
// Custom pointer down handler for drag and resize
const handlePointerDown = (e: React.TouchEvent | React.MouseEvent, action: string) =>
⋮----
// Global pointer move and up handlers for smooth touch/mouse resizing
⋮----
const handleMove = (e: TouchEvent | MouseEvent) =>
⋮----
const maxDx = initCrop.width - 20; // min width 20%
const maxDy = initCrop.height - 20; // min height 20%
⋮----
const handleUp = () =>
⋮----
// Helper to draw cropped image to canvas and export new File
const cropImageToFile = async (dataUrl: string, cropArea:
⋮----
const processImage = async () =>
⋮----
onClick=
⋮----
{/* Flawless Interactive Crop Box Overlay */}
⋮----
{/* Center Drag Area */}
⋮----
onMouseDown=
⋮----
{/* Top-Left Corner Handle */}
⋮----
{/* Top-Right Corner Handle */}
⋮----
{/* Bottom-Left Corner Handle */}
⋮----
{/* Bottom-Right Corner Handle */}
````

## File: src/features/ai/components/SpendingPersonality.tsx
````typescript
import { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, Target, Quote } from 'lucide-react';
import { getSpendingPersonality } from '@/insights/reporting';
import { Transaction } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface SpendingPersonalityProps {
  transactions: Transaction[];
}
⋮----
const analyze = async () =>
````

## File: src/features/analytics/AnalyticsView.tsx
````typescript
import { useMemo } from 'react';
import { FINANCE_DEFAULTS } from '@/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ReferenceLine, CartesianGrid,
} from 'recharts';
import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, Receipt } from 'lucide-react';
import { MonthlyHistoryPoint, MonthlyStats, CategorySpend, Transaction, AppView } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { TaxPredictor } from '@/features/analytics/components/TaxPredictor';
import { AnomalyDetector } from '@/features/analytics/components/AnomalyDetector';
import { SpendingForecast } from '@/features/analytics/components/SpendingForecast';
import { calculateHealthScore } from '@/insights/healthScore';
import { PeerComparison } from '@/features/analytics/components/PeerComparison';
import { CashFlowWaterfall } from '@/features/analytics/components/CashFlowWaterfall';
import { HealthScoreChart } from '@/features/analytics/components/HealthScoreChart';
import SpendingDonut from '@/features/analytics/components/SpendingDonut';
import BalanceChart from '@/features/analytics/components/BalanceChart';
import SpendingHeatmap from '@/features/analytics/components/SpendingHeatmap';
import { haptic } from '@/lib/haptic';
import { CategoryAnalyzer } from '@/features/analytics/components/CategoryAnalyzer';
import { ChartTooltip, SavingsTooltip, StatCard } from '@/features/analytics/components/AnalyticsPrimitives';
import { TopMerchants } from '@/features/analytics/components/TopMerchants';
import { HealthIndexCard } from '@/features/analytics/components/HealthIndexCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AnalyticsViewMobile from '@/features/analytics/AnalyticsViewMobile';
import { IncomeExpensesChart } from '@/features/analytics/components/IncomeExpensesChart';
import { SavingsTrendChart } from '@/features/analytics/components/SavingsTrendChart';
import { CategoryBreakdownList } from '@/features/analytics/components/CategoryBreakdownList';
⋮----
interface AnalyticsViewProps {
  monthlyHistory:   MonthlyHistoryPoint[];
  monthlyStats:     MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent:       number;
  currency?:        string;
  transactions?:    Transaction[];
  onNavigate?:      (view: AppView, category?: string) => void;
  config?:          any;
}
⋮----
{/* AI Financial Health Index */}
⋮----
{/* Page Header */}
⋮----
{/* Mini Stats */}
⋮----
{/* Income vs Expenses Bar Chart */}
⋮----
{/* Two column: Savings trend + Category breakdown */}
⋮----
{/* Net Savings Line */}
⋮----
{/* Category Breakdown */}
⋮----
{/* Category Intelligence */}
⋮----
{/* Spending Donut + Balance */}
⋮----
{/* Spending Heatmap */}
⋮----
{/* Top Merchants */}
⋮----
{/* Tax Liability Predictor */}
⋮----
{/* Anomaly Detection */}
⋮----
{/* Spending Forecast */}
⋮----
{/* Peer Comparison */}
⋮----
{/* Cash Flow Waterfall */}
⋮----
{/* Financial Health Score History */}
````

## File: src/features/analytics/AnalyticsViewMobile.tsx
````typescript
import React from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Zap, Target, PieChart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { MonthlyStats, CategorySpend, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/lib/haptic';
⋮----
interface AnalyticsViewMobileProps {
  monthlyStats:     MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent:       number;
  currency:        string;
  transactions:    Transaction[];
}
⋮----
// Calculate some quick insights
⋮----
{/* Month Progress Card */}
⋮----
{/* Category Breakdown Section */}
⋮----
{/* AI Intelligence Micro-Cards */}
````

## File: src/features/analytics/components/AnalyticsPrimitives.tsx
````typescript
/** Shared chart tooltip for bar/line charts */
⋮----
/** Savings-specific tooltip */
⋮----
/** Mini KPI card */
````

## File: src/features/analytics/components/AnomalyDetector.tsx
````typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '@/types/finance';
import { detectAnomalies } from '@/insights/anomaly';
import { AlertTriangle, Sparkles } from 'lucide-react';
⋮----
interface AnomalyDetectorProps {
  transactions: Transaction[];
  currency: string;
}
````

## File: src/features/analytics/components/CashFlowWaterfall.tsx
````typescript
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Activity } from 'lucide-react';
````

## File: src/features/analytics/components/CategoryAnalyzer.tsx
````typescript
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import { CategorySpend, Transaction } from '@/types';
import { haptic } from '@/lib/haptic';
import { useCategories } from '@/hooks/useCategories';
⋮----
interface CategoryAnalyzerProps {
  categorySpending: CategorySpend[];
  transactions: Transaction[];
  currency: string;
  userRole?: string;
}
⋮----
export function CategoryAnalyzer(
⋮----
// 1. Identify Highest Spending
⋮----
// Historical Comparison for Top Category
⋮----
// 2. Trend Analysis (Simulated for demo, but could be real if we had monthlyHistory)
// For now, let's look for weekend vs weekday patterns in the top category
⋮----
// 3. Subscription Insight
⋮----
// 4. Persona Specific Insights
⋮----
// 5. Category Limits
````

## File: src/features/analytics/components/HealthIndexCard.tsx
````typescript
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
⋮----
interface HealthResult {
  score: number;
  grade: string;
  color: string;
  breakdown: Record<string, number>;
  recommendations: string[];
}
⋮----
{/* Gauge */}
````

## File: src/features/analytics/components/HealthScoreChart.tsx
````typescript
/**
 * HealthScoreChart.tsx
 * Line chart showing Financial Health Score over the past N days.
 */
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { useHealthHistory } from '@/features/analytics/hooks/useHealthHistory';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface Props {
  currentScore: number;
}
⋮----
function CustomTooltip(
⋮----
// Always include today
⋮----
{/* Legend */}
````

## File: src/features/analytics/components/PeerComparison.tsx
````typescript
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Users } from 'lucide-react';
import { CategorySpend } from '@/types';
⋮----
// Generate mock peer data based on user spending
⋮----
peer: cat.value * (0.8 + Math.random() * 0.5), // +/- ~20-30%
````

## File: src/features/analytics/components/PredictiveForecasting.tsx
````typescript
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface PredictiveForecastingProps {
  transactions: Transaction[];
  currency: string;
  currentBalance: number;
}
⋮----
// Calculate daily spend rate from last 30 days
⋮----
// Build chart points: actual (past) + projected (future)
⋮----
// Reconstruct past balance by replaying transactions day-by-day this month
⋮----
const bal = currentBalance + (dayOfMonth - d) * dailyNetRate * -1; // approximate
⋮----
// Project remaining days
⋮----
// Scenarios
⋮----
{/* KPI strip */}
⋮----
{/* Chart */}
⋮----
{/* Solid line for historical */}
⋮----
{/* Scenarios — only shown when there is actual spend data */}
````

## File: src/features/analytics/components/SpendingForecast.tsx
````typescript
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Transaction } from '@/types';
import { forecastNextMonth } from '@/insights/forecast';
⋮----
interface SpendingForecastProps {
  transactions: Transaction[];
  currency?: string;
}
⋮----
const fmt = (n: number)
⋮----
{/* Header */}
⋮----
{/* Summary bar */}
⋮----
{/* Predicted Income */}
⋮----
{/* Predicted Spend */}
⋮----
{/* Savings */}
⋮----
{/* Current month snapshot */}
⋮----
{/* Category breakdown */}
````

## File: src/features/analytics/components/SpendingHeatmap.tsx
````typescript
import { useMemo } from 'react';
import { CategorySpend } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface SpendingHeatmapProps {
  transactions: { date: string; amount: number; type: string }[];
  currency?: string;
}
⋮----
function getDayColor(amount: number, max: number): string
⋮----
if (ratio < 0.2) return '#dcfce7'; // lightest green
⋮----
if (ratio < 0.6) return '#fb923c'; // orange
if (ratio < 0.8) return '#ef4444'; // red
return '#b91c1c'; // darkest red
⋮----
function getDayColorDark(amount: number, max: number): string
⋮----
// R3-A fix: compute isDark inside useMemo so it re-evaluates on theme changes
⋮----
// Build a map of date → total debit spending
⋮----
// Build weeks array (rows = day of week 0-6, cols = weeks)
⋮----
const startDow = firstDay.getDay(); // 0=Sun
⋮----
// Pad start
⋮----
// Split into weeks (chunks of 7)
⋮----
{/* Legend */}
⋮----
{/* Day of week header */}
⋮----
{/* Calendar grid */}
⋮----
{/* Tooltip on hover */}
````

## File: src/features/analytics/components/TaxPredictor.tsx
````typescript
import React from 'react';
import { motion } from 'framer-motion';
import { CategorySpend } from '@/types';
⋮----
interface TaxPredictorProps {
  income: number;
  categorySpending: CategorySpend[];
  currency: string;
}
⋮----
export function TaxPredictor(
⋮----
// Simple progressive tax simulation (e.g., 10% up to 50k, 20% up to 100k, 30% above)
const calculateTax = (amt: number) =>
⋮----
// Identify deductible spending (e.g., Health, Charities - simulated)
````

## File: src/features/analytics/components/TopMerchants.tsx
````typescript
import { Store } from 'lucide-react';
⋮----
interface Props {
  transactions: any[];
  currency: string;
}
````

## File: src/features/analytics/hooks/useHealthHistory.ts
````typescript
/**
 * Health Score History Hook
 * Stores a daily snapshot of the health score in localStorage so we can
 * chart it over time in the Analytics view.
 */
import { useEffect, useMemo } from 'react';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface HealthHistoryPoint {
  date: string; // YYYY-MM-DD
  score: number;
}
⋮----
date: string; // YYYY-MM-DD
⋮----
export function useHealthHistory(currentScore: number): HealthHistoryPoint[]
⋮----
// Load existing history once
⋮----
// Append today's snapshot (de-duped by date)
⋮----
} catch { /* ignore */ }
````

## File: src/features/auth/AuthView.tsx
````typescript
import { useState, useEffect } from 'react';
import {
  Mail, Lock, Wallet, Coins, ArrowRight, Loader2, User, Phone,
  Eye, EyeOff, CheckCircle2, TrendingUp, ShieldCheck, Zap, Star,
  ChevronRight,
} from 'lucide-react';
import { ChildQRScanner } from '@/features/parental/components/ChildQRScanner';
import { useAuth } from '@/hooks/useAuth';
⋮----
// ── Feature list shown on left panel ────────────────────────────
⋮----
// ── Main component ───────────────────────────────────────────────
⋮----
const handleSubmit = async (e: React.FormEvent) =>
⋮----
const handleChildScanSuccess = (parentId: string) =>
⋮----
} catch { /* ignore */ }
⋮----
const switchMode = () =>
⋮----
<button type="button" tabIndex=
````

## File: src/features/auth/components/BiometricLock.tsx
````typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';
import { haptic } from '@/lib/haptic';
⋮----
interface BiometricLockProps {
  onUnlocked: () => void;
  appName?: string;
}
⋮----
export const BiometricLock: React.FC<BiometricLockProps> = ({ 
  onUnlocked, 
  appName = "SpendWise" 
}) =>
⋮----
// Auto-start scanning on mount
⋮----
const startScan = async () =>
⋮----
// Check if WebAuthn is available
⋮----
// Check if platform authenticator is available (e.g., FaceID/Fingerprint)
⋮----
// Get the stored credential ID (set during biometric enrollment)
⋮----
// First time — enroll the biometric credential
⋮----
authenticatorAttachment: 'platform',  // device biometric only
⋮----
// Subsequent logins — verify with stored credential
⋮----
// Fallback simulation:
⋮----
{/* Background Glow */}
⋮----
{/* Animated Rings */}
````

## File: src/features/budget/BudgetView.tsx
````typescript
import React, { useState } from 'react';
import { Target, TrendingUp, AlertCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { SmartBudgetSuggestions } from '@/features/budget/components/SmartBudgetSuggestions';
import { BudgetSummary } from '@/features/budget/components/BudgetSummary';
import { BudgetCategoryCard } from '@/features/budget/components/BudgetCategoryCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import BudgetViewMobile from '@/features/budget/BudgetViewMobile';
⋮----
const handleAdd = () =>
⋮----
{/* Smart Budget Suggestions */}
⋮----
{/* Header Summary */}
⋮----
{/* Budget List */}
⋮----
<button onClick=
⋮----
setSelectedCategory(cat);
setLimitAmount(limit);
setIsAdding(true);
````

## File: src/features/budget/BudgetViewMobile.tsx
````typescript
import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit2, Check, X, ArrowLeft, MoreVertical, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { haptic } from '@/lib/haptic';
import { BudgetSummaryMobile } from '@/features/budget/components/BudgetSummaryMobile';
import { BudgetCategoryCardMobile } from '@/features/budget/components/BudgetCategoryCardMobile';
⋮----
interface BudgetViewMobileProps {
  currency: string;
}
⋮----
const handleAdd = () =>
⋮----
const handleEdit = (category: string, limit: number) =>
⋮----
{/* Summary Header */}
⋮----
{/* Action Bar */}
⋮----
{/* Add/Edit Budget Form */}
⋮----
onClick=
⋮----
{/* Budget List */}
````

## File: src/features/budget/components/BudgetAlertToast.tsx
````typescript
import { useEffect, useRef } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
⋮----
interface BudgetAlertToastProps {
  currency?: string;
}
⋮----
const ALERT_KEY = (cat: string, level: '80' | '100') => `spendwise_budget_alert_$
⋮----
function getContainer()
⋮----
function showToast(message: string, color: string, icon: string)
⋮----
// Inject keyframe once
⋮----
function escapeHtml(str: string): string
⋮----
export function BudgetAlertToast(
⋮----
} catch { /* ignore */ }
⋮----
} catch { /* ignore */ }
⋮----
return null; // Renders toasts imperatively via DOM
````

## File: src/features/budget/components/BudgetManager.tsx
````typescript
import {
  Target, TrendingUp, RotateCcw, RefreshCw, Shield,
  X, Tag as TagIcon, Calendar, Plus, Check,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Budget, BudgetPeriod, Category, Transaction, BudgetSuggestion } from '@/types';
import { useBudgetManager } from '@/features/budget/hooks/useBudgetManager';
import { PeriodSelector } from '@/features/budget/components/PeriodSelector';
import { RolloverToggle } from '@/features/budget/components/RolloverToggle';
import { BudgetSummaryBar } from '@/features/budget/components/BudgetSummaryBar';
import { BudgetRow } from '@/features/budget/components/BudgetRow';
⋮----
interface BudgetManagerProps {
  budgets:                 Budget[];
  totalBudgeted:           number;
  totalSpentAgainstBudget: number;
  overBudgetCount:         number;
  period:                  BudgetPeriod;
  periodLabel:             string;
  rolloverEnabled:         boolean;
  onUpdateLimit:           (category: Category, limit: number) => void;
  onDeleteLimit:           (category: Category) => void;
  onResetLimits:           () => void;
  onChangePeriod:          (p: BudgetPeriod) => void;
  onToggleRollover:        () => void;
  onManageCategories?:     () => void;
  currency?:               string;
  transactions?:           Transaction[];
}
⋮----
export default function BudgetManager({
  budgets, totalBudgeted, totalSpentAgainstBudget, overBudgetCount,
  period, periodLabel, rolloverEnabled,
  onUpdateLimit, onDeleteLimit, onResetLimits, onChangePeriod, onToggleRollover,
  onManageCategories, currency = '$', transactions = [],
}: BudgetManagerProps)
⋮----
{/* Page Header */}
⋮----
{/* Controls */}
⋮----
{/* Period selector */}
⋮----
{/* Rollover toggle */}
⋮----
{/* Add Budget button */}
⋮----
{/* Categories button */}
⋮----
{/* ── AI Budget Suggestions ───────────────────────────────── */}
⋮----
{/* ── Add Budget Form Panel ───────────────────────────────── */}
⋮----
onClick=
⋮----
{/* Rollover explainer tip */}
⋮----
<button onClick=
⋮----
{/* Period tip (when rollover is off) */}
⋮----
{/* Summary */}
⋮----
{/* Empty state */}
⋮----
{/* Budget grid */}
⋮----
onDelete=
````

## File: src/features/budget/components/BudgetRow.tsx
````typescript
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, RefreshCw, Link } from 'lucide-react';
import { Budget } from '@/types';
import { useCategories } from '@/hooks/useCategories';
⋮----
type BudgetStatus = 'safe' | 'warning' | 'danger';
⋮----
onClick=
````

## File: src/features/budget/components/BudgetSummaryBar.tsx
````typescript
import { Shield, RefreshCw, AlertTriangle, Flame, Star, Award } from 'lucide-react';
import { Budget } from '@/types';
⋮----
// Gamification Milestones
⋮----
{/* Gamification Badges */}
````

## File: src/features/budget/components/PeriodSelector.tsx
````typescript
import { BudgetPeriod } from '@/types';
````

## File: src/features/budget/components/RolloverToggle.tsx
````typescript
import { RefreshCw } from 'lucide-react';
````

## File: src/features/budget/components/SmartBudgetSuggestions.tsx
````typescript
import { useState, useMemo } from 'react';
import { Lightbulb, X, Check, TrendingDown } from 'lucide-react';
import { Transaction, Category } from '@/types';
⋮----
interface SmartBudgetSuggestionsProps {
  transactions: Transaction[];
  existingBudgets: Record<string, number>;
  onAccept: (category: Category, amount: number) => void;
  currency?: string;
}
⋮----
interface Suggestion {
  category: Category;
  avgMonthlySpend: number;
  suggestedLimit: number;
  months: number;
}
⋮----
// Group debit transactions by category and month
⋮----
// Aggregate avg spend per category across months
⋮----
.filter(([cat]) => !existingBudgets[cat]) // only suggest for unbudgeted categories
⋮----
// Suggest ~10% below avg to encourage saving
⋮----
.filter(s => s.months >= 1 && s.avgMonthlySpend > 200) // only meaningful categories
⋮----
onClick=
````

## File: src/features/budget/hooks/useAlerts.ts
````typescript
import { useMemo, useCallback, useState } from 'react';
import { Transaction, SpendingAlert, AlertSeverity, Budget, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
function loadDismissed(): Set<string>
⋮----
} catch { /* ignore */ }
⋮----
function saveDismissed(ids: Set<string>)
⋮----
} catch { /* ignore */ }
⋮----
// ─── Alert generators ─────────────────────────────────────────────────────────
⋮----
function makeId(...parts: (string | number)[]): string
⋮----
function alert(
  id: string,
  severity: AlertSeverity,
  title: string,
  message: string,
  category?: Category,
  actionLabel?: string,
): SpendingAlert
⋮----
function median(nums: number[]): number
⋮----
export interface UseAlertsExtras {
  currency?:             string;
  predictedEndOfMonth?:  number;
  daysLeftInMonth?:      number;
}
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useAlerts(
  transactions: Transaction[],
  currentBalance: number,
  budgets: Budget[],
  dailySpendRate: number,
  extras?: UseAlertsExtras,
)
⋮----
// ── Generate all alerts from current state ─────────────────────────────────
⋮----
// R3-B fix: fmt helpers defined inside useMemo to avoid stale-closure issues
⋮----
const fmt = (n: number, fractionDigits = 2)
const fmt0 = (n: number)
⋮----
// 0. Predictive: month-end balance trajectory
⋮----
// 1. Low balance warning
⋮----
// 2. Critically low balance
⋮----
// 3. Negative balance
⋮----
// 4. High daily spend rate (velocity)
⋮----
// 5. Budget breaches
⋮----
// 6. Spending spike — today vs daily average
⋮----
// 7. Large single transaction (absolute + relative threshold)
⋮----
// 8. Unusual vs your median in that category (30d)
⋮----
// 9. Weekend note
⋮----
// ── Filter out dismissed alerts ────────────────────────────────────────────
⋮----
// ── Actions ────────────────────────────────────────────────────────────────
````

## File: src/features/budget/hooks/useBudgetManager.ts
````typescript
import { useState, useMemo } from 'react';
import { Category, Transaction, Budget, BudgetSuggestion } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { generateBudgetSuggestions } from '@/insights/budgetSuggestions';
⋮----
interface UseBudgetManagerOptions {
  budgets:       Budget[];
  transactions:  Transaction[];
  onUpdateLimit: (category: Category, limit: number) => void;
}
⋮----
export function useBudgetManager(
⋮----
// UI state
⋮----
// Derived data
⋮----
// Handlers
function handleApplySuggestion(category: string, limit: number)
⋮----
function handleApplyAll()
⋮----
function handleAddBudget()
⋮----
// state
⋮----
// derived
⋮----
// handlers
⋮----
// constants
````

## File: src/features/dashboard/components/ChartTooltip.tsx
````typescript
export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
}
⋮----
export function ChartTooltip(
````

## File: src/features/dashboard/components/DailyStats.tsx
````typescript
import Card from '@/ui/Card';
⋮----
interface DailyStatsProps {
  currency: string;
  dailySpendRate: number;
  streak: number;
  transactionCount: number;
}
````

## File: src/features/dashboard/components/DashboardHero.tsx
````typescript
import React from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import DashboardHeroDesktop from '@/features/dashboard/components/DashboardHeroDesktop';
import DashboardHeroMobile from '@/features/dashboard/components/DashboardHeroMobile';
import { MonthlyStats, BalanceDataPoint } from '@/types';
⋮----
interface DashboardHeroProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  monthlyStats: MonthlyStats;
  balanceTrend: BalanceDataPoint[];
  healthScore: number;
  currency?: string;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}
⋮----
export default function DashboardHero(props: DashboardHeroProps)
````

## File: src/features/dashboard/components/FinanceChart.tsx
````typescript
import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '@/ui/Card';
import ChartTooltip from '@/features/dashboard/components/ChartTooltip';
⋮----
interface FinanceChartProps {
  chartData: Array<{
    month: string;
    Income: number;
    Expenses: number;
  }>;
  currency: string;
}
````

## File: src/features/dashboard/components/GoalsSummary.tsx
````typescript
import { Plus, Target } from 'lucide-react';
import Card from '@/ui/Card';
import { AppView } from '@/types';
⋮----
interface GoalsSummaryProps {
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    emoji: string;
    color?: string;
  }>;
  onNavigate: (view: AppView) => void;
}
⋮----
onClick=
````

## File: src/features/dashboard/components/MetricCards.tsx
````typescript
import { useIsMobile } from '@/hooks/useMediaQuery';
import MetricCardsDesktop from '@/features/dashboard/components/MetricCardsDesktop';
import MetricCardsMobile from '@/features/dashboard/components/MetricCardsMobile';
import { MonthlyStats } from '@/types';
⋮----
interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality:     'low' | 'medium' | 'high';
    expectedChange:  number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}
⋮----
export default function MetricCards(props: MetricCardsProps)
````

## File: src/features/dashboard/components/MetricCardsDesktop.tsx
````typescript
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats } from '@/types';
import { useStore } from '@/store';
⋮----
interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality:     'low' | 'medium' | 'high';
    expectedChange:  number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}
````

## File: src/features/dashboard/components/MetricCardsMobile.tsx
````typescript
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { MonthlyStats } from '@/types';
import { useStore } from '@/store';
⋮----
interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality:     'low' | 'medium' | 'high';
    expectedChange:  number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}
⋮----
// Keep subtext shorter for mobile
````

## File: src/features/dashboard/components/PremiumCard.tsx
````typescript
import { motion } from 'framer-motion';
⋮----
interface PremiumCardProps {
  currentBalance: number;
  currency: string;
}
⋮----
export default function PremiumCard(
⋮----
{/* Decorative shimmer */}
⋮----
{/* Decorative circles */}
````

## File: src/features/dashboard/components/QuickAddPanel.tsx
````typescript
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import MagicInput from '@/features/ai/components/MagicInput';
import { Transaction } from '@/types';
⋮----
interface QuickAddPanelProps {
  onAdd: (transaction: Transaction) => void;
  recentMerchants?: string[];
  onQuickInput?: (text: string) => void;
  dashboardInput?: string;
  setDashboardInput?: (val: string) => void;
  transactions?: Transaction[];
}
⋮----
export default function QuickAddPanel({ 
  onAdd, 
  recentMerchants = [], 
  onQuickInput,
  dashboardInput,
  setDashboardInput,
  transactions
}: QuickAddPanelProps)
⋮----
{/* Panel Header */}
⋮----
{/* MagicInput handles all 3 modes internally */}
````

## File: src/features/dashboard/components/RecentTransactions.tsx
````typescript
import { Transaction, AppView } from '@/types';
import Card from '@/ui/Card';
import { WalletCards } from 'lucide-react';
import { initials, avatarColor } from '@/utils/avatar';
⋮----
interface RecentTransactionsProps {
  recentTx: Transaction[];
  onNavigate: (view: AppView) => void;
  hideBalances: boolean;
  currency: string;
}
````

## File: src/features/dashboard/components/SafeToSpend.tsx
````typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface SafeToSpendProps {
  transactions: Transaction[];
  currency: string;
  currentBalance: number;
}
⋮----
// Monthly income (credits this month)
⋮----
// Estimate monthly fixed costs (recurring debits)
⋮----
// Target: save 20% of income
⋮----
const essentialBuffer = avgMonthlySpend * 0.3; // 30% for fixed costs remaining
⋮----
// Status
⋮----
{/* Background glow */}
⋮----
{/* Big number */}
⋮----
{/* Progress bar */}
⋮----
{/* Mini stats */}
````

## File: src/features/dashboard/components/StatCard.tsx
````typescript
import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/ui/Card';
import { haptic } from '@/lib/haptic';
⋮----
export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  hideBalances?: boolean;
}
⋮----
onClick=
````

## File: src/features/education/components/categoryConfig.tsx
````typescript
import { BookOpen, TrendingUp, Shield, Sparkles, Zap } from 'lucide-react';
````

## File: src/features/education/components/EducationCards.tsx
````typescript
import React, { useState } from 'react';
import { BookOpen, Target, Shield, Zap, ArrowRight, TrendingUp, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface EducationTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}
⋮----
const handlePrev = ()
⋮----
{/* Progress Bar */}
````

## File: src/features/education/components/LessonCard.tsx
````typescript
import { motion } from 'framer-motion';
import { Lock, Check, Clock, Star, ChevronRight } from 'lucide-react';
import { Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';
⋮----
export interface LessonCardProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  onClick: () => void;
}
⋮----
{/* Progress Bar (if started but not completed) */}
⋮----
{/* Completion glow */}
⋮----
{/* Locked overlay */}
⋮----
{/* Completed badge */}
````

## File: src/features/education/components/LessonModal.tsx
````typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, X, Check, Trophy } from 'lucide-react';
import { Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';
⋮----
export interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  completed: boolean;
}
⋮----
const handleNextPara = () =>
⋮----
const handleAnswer = (index: number) =>
⋮----
{/* Header */}
⋮----
{/* Body */}
⋮----
{/* Footer */}
````

## File: src/features/education/EducationView.tsx
````typescript
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Clock, Star, Trophy, Sparkles, Check } from 'lucide-react';
import { useStore } from '@/store';
import { Transaction } from '@/types';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
import { LESSONS, Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';
import LessonModal from '@/features/education/components/LessonModal';
import LessonCard from '@/features/education/components/LessonCard';
⋮----
// ─── Lesson Data ─────────────────────────────────────────────────────────────
⋮----
// ─── Lesson Modal ─────────────────────────────────────────────────────────────
⋮----
// ─── Lesson Card ─────────────────────────────────────────────────────────────
⋮----
// ─── Main View ────────────────────────────────────────────────────────────────
⋮----
const handleComplete = (lesson: Lesson) =>
⋮----
// Personalized insight from spending data
⋮----
{/* ── Header ── */}
⋮----
{/* ── Progress Hero ── */}
⋮----
{/* ── Personalized Tip & Simulation Lab ── */}
⋮----
<button onClick=
⋮----
{/* ── Filter Tabs ── */}
⋮----
{/* ── Lessons Grid ── */}
⋮----
onClick=
⋮----
{/* ── Completion Banner ── */}
````

## File: src/features/gamification/components/BadgeGallery.tsx
````typescript
/**
 * BadgeGallery.tsx
 * Full achievement badge showcase — unlocked + locked badges with earn criteria.
 */
import { useMemo } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/haptic';
⋮----
interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  criteria: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}
⋮----
interface Props {
  transactions: any[];
  streak: number;
  level: number;
  goals: any[];
  currency?: string;
}
⋮----
function computeBadges(props: Props): Badge[]
⋮----
{/* Header */}
⋮----
{/* Progress bar */}
⋮----
{/* Hover tooltip */}
````

## File: src/features/gamification/components/LevelProgress.tsx
````typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
import { AppView } from '@/types/ui';
⋮----
{/* Daily XP — live from quest completions */}
⋮----
{/* XP Multiplier */}
⋮----
onClick=
````

## File: src/features/gamification/components/LevelUpModal.tsx
````typescript
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, Building2, Landmark, Castle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
⋮----
interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  rank: string;
}
⋮----
const randomInRange = (min: number, max: number)
⋮----
const getRankIcon = () =>
⋮----
{/* Glowing background orbs */}
````

## File: src/features/gamification/components/QuestCompletionOverlay.tsx
````typescript
import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import confetti from 'canvas-confetti';
⋮----
// Find quests that are 100% but not yet "celebrated"
⋮----
const handleClose = () =>
````

## File: src/features/gamification/components/QuestsPanel.tsx
````typescript
import React, { useMemo, useState } from 'react';
import { Award, Zap, CheckCircle, RefreshCw, Sparkles, Coffee, BookOpen, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/haptic';
import { generateQuests } from '@/insights/advisor';
import { Transaction } from '@/types';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
⋮----
interface QuestsPanelProps {
  transactions: Transaction[];
}
⋮----
const handleQuestClick = (questId: string, reward: string) =>
⋮----
{/* XP Pop Animation */}
````

## File: src/features/gamification/components/RoundUpVault.tsx
````typescript
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Sparkles, X, ChevronRight } from 'lucide-react';
import { Transaction } from '@/types';
import { useStore } from '@/store';
⋮----
interface RoundUpVaultProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
const handleSweep = () =>
⋮----
const handleReset = () =>
⋮----
{/* Vault total */}
⋮----
{/* Pending sweep */}
⋮----
{/* History toggle */}
⋮----
onClick=
````

## File: src/features/gamification/components/SavingsChallenges.tsx
````typescript
import React from 'react';
import { Target, Zap, ShieldCheck, Coffee, Utensils, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
⋮----
interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: React.ReactNode;
  progress: number;
  color: string;
}
````

## File: src/features/gamification/components/SocialLeaderboard.tsx
````typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { useStore } from '@/store';
⋮----
// Mock leaderboard data (in a real app this would come from a backend)
⋮----
type SortKey = 'xp' | 'level' | 'streak' | 'savingsRate';
⋮----
{/* Sort tabs */}
⋮----
{/* Leaderboard rows */}
⋮----
{/* Avatar */}
⋮----
{/* Info */}
⋮----
{/* Sort value */}
````

## File: src/features/gamification/components/StreakShareCard.tsx
````typescript
/**
 * StreakShareCard.tsx
 * A shareable streak card — renders a canvas/div that can be screenshot-shared.
 * Uses navigator.share or clipboard fallback.
 */
import { useRef, useState } from 'react';
import { Share2, Camera, Flame, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/haptic';
⋮----
interface Props {
  streak: number;
  level: number;
  levelName: string;
  savingsRate: number;
  currency?: string;
}
⋮----
export function StreakShareCard(
⋮----
const handleShare = async () =>
⋮----
} catch { /* user cancelled */ }
⋮----
setOpen(true);
haptic.light();
⋮----
{/* Close */}
⋮----
{/* Card preview */}
⋮----
{/* Background glow */}
⋮----
{/* Logo */}
⋮----
{/* Flame */}
⋮----
{/* Stats row */}
⋮----
{/* Actions */}
⋮----
onClick=
````

## File: src/features/gamification/components/WealthCity.tsx
````typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Landmark, TreePine, Construction, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { haptic } from '@/lib/haptic';
import { useEffect, useRef } from 'react';
⋮----
// Determine city stage
⋮----
{/* Dynamic Sky */}
⋮----
{/* Grid Pattern */}
⋮----
{/* City Title */}
⋮----
{/* Ground */}
⋮----
{/* Buildings */}
⋮----
{/* Floating Stats */}
````

## File: src/features/gamification/GamificationView.tsx
````typescript
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Target, Award, Flame, Star, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { AppView, Transaction } from '@/types';
import LevelProgress from '@/features/gamification/components/LevelProgress';
import { QuestsPanel } from '@/features/gamification/components/QuestsPanel';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { SavingsChallenges } from '@/features/gamification/components/SavingsChallenges';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
import { UserLevelCard } from '@/features/gamification/components/UserLevelCard';
import { getSpendingPersonality } from '@/insights/advisor';
⋮----
type Tab = 'overview' | 'quests' | 'badges' | 'challenges';
⋮----
interface GamificationViewProps {
  transactions: Transaction[];
  goals: any[];
  currency?: string;
  onNavigate: (view: AppView) => void;
}
⋮----
{/* ── Hero banner ── */}
⋮----
{/* ── Tab bar ── */}
⋮----
{/* ── Tab content ── */}
⋮----
{/* Personality Card */}
⋮----
{/* Quick-action tiles */}
⋮----
{/* Quests preview */}
````

## File: src/features/gamification/hooks/useGamification.ts
````typescript
import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/types';
import { useStore } from '@/store';
import { useCategories } from '@/hooks/useCategories';
⋮----
export function useGamification(transactions: Transaction[])
⋮----
// 1. Calculate Daily Streak (delegated to store)
⋮----
// 2. Calculate Health Score (0-100)
⋮----
// 3. Calculate XP and Levels
⋮----
// Base XP from historical actions
⋮----
// Budget Adherence Bonus
⋮----
// Level = floor(sqrt(xp / 250)) + 1
⋮----
// XP math for progress bar
````

## File: src/features/gamification/hooks/useQuestReset.ts
````typescript
/**
 * useQuestReset.ts
 * Manages daily quest state with automatic midnight reset.
 * Quests completed today are persisted in localStorage keyed by date.
 * On the next day, all completions reset.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface QuestProgress {
  date: string;                   // YYYY-MM-DD — the day this applies to
  completed: Record<string, boolean>; // questId → completed
  claimedXP: number;              // total XP claimed today
}
⋮----
date: string;                   // YYYY-MM-DD — the day this applies to
completed: Record<string, boolean>; // questId → completed
claimedXP: number;              // total XP claimed today
⋮----
const TODAY = ()
⋮----
function load(): QuestProgress
⋮----
// Reset if it's a new day
⋮----
function save(state: QuestProgress)
⋮----
try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
⋮----
export function useQuestReset()
⋮----
// Midnight auto-reset
⋮----
if (prev.completed[questId]) return prev; // already done
⋮----
// Add XP to the global store for Level calculation
````

## File: src/features/goals/components/constants.ts
````typescript
import { GoalStatus } from '@/types';
import { CheckCircle2, TrendingUp, AlertTriangle, PauseCircle } from 'lucide-react';
````

## File: src/features/goals/components/ContributeModal.tsx
````typescript
import { useState } from 'react';
import { Zap } from 'lucide-react';
import Portal from '@/ui/Portal';
import { SavingsGoal } from '@/types';
````

## File: src/features/goals/components/GoalModal.tsx
````typescript
import { useState } from 'react';
import { Target, X } from 'lucide-react';
import Portal from '@/ui/Portal';
import { GOAL_EMOJIS, GOAL_COLORS } from '@/features/goals/components/constants';
⋮----
export interface GoalFormData {
  name:                string;
  emoji:               string;
  targetAmount:        string;
  savedAmount:         string;
  targetDate:          string;
  monthlyContribution: string;
  color:               string;
}
⋮----
function defaultForm(): GoalFormData
⋮----
const set = (key: keyof GoalFormData)
⋮----
const validate = (): boolean =>
⋮----
const handleSave = () =>
⋮----
onChange=
⋮----
<input type="number" min=
⋮----
<input type="date" value=
````

## File: src/features/goals/components/GoalsSummary.tsx
````typescript

````

## File: src/features/goals/components/ProgressRing.tsx
````typescript
export function ProgressRing({
  percent,
  color,
  size = 80,
}: {
  percent: number;
  color:   string;
  size?:   number;
})
````

## File: src/features/goals/components/utils.ts
````typescript
export function daysUntil(dateStr: string): number
⋮----
export function formatDate(dateStr: string): string
````

## File: src/features/goals/GoalsViewMobile.tsx
````typescript
import React from 'react';
import { Target, Plus, Award, ChevronRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { haptic } from '@/lib/haptic';
⋮----
interface GoalsViewMobileProps {
  goals: SavingsGoal[];
  stats: {
    activeCount: number;
    achievedCount: number;
    totalTarget: number;
    totalSaved: number;
    overallPercent: number;
  };
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  currency: string;
  transactions: any[];
  streak: number;
  level: number;
}
⋮----
// Sort: active first, then achieved
⋮----
{/* 1. Slim Header */}
⋮----
onClick=
⋮----
{/* 2. Visual Progress Summary */}
⋮----
{/* 3. Goals List */}
⋮----
onContribute=
onEdit={() => {}} // Handle edit in main view
⋮----
{/* 4. Badges Section */}
````

## File: src/features/goals/hooks/useGoals.ts
````typescript
import { useCallback, useMemo } from 'react';
import { SavingsGoal, GoalStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
function computeStatus(goal: SavingsGoal): GoalStatus
⋮----
export function useGoals()
⋮----
// BUG-08 fix: use functional update — avoids stale closure when called rapidly
````

## File: src/features/onboarding/components/OnboardingModal.tsx
````typescript
import { useState, useRef, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { OnboardingSidebar } from '@/features/onboarding/components/OnboardingSidebar';
import { OnboardingStep1, CurrencySymbol } from '@/features/onboarding/components/OnboardingStep1';
import { OnboardingStep2, UserRole } from '@/features/onboarding/components/OnboardingStep2';
import { OnboardingStep3 } from '@/features/onboarding/components/OnboardingStep3';
⋮----
// ─── Types ─────────────────────────────────────────────────────────────────────
⋮----
export interface SpendWiseConfig {
  initialBalance: number;
  currency: string;
  name?: string;
  balanceAnchorNet?: number;
  onboardingComplete: boolean;
  createdAt: string;
  phone?: string;
  occupation?: string;
  monthlyGoal?: number;
  location?: string;
  userRole: UserRole;
}
⋮----
// ─── Helpers ───────────────────────────────────────────────────────────────────
⋮----
export function loadConfig(): SpendWiseConfig | null
⋮----
function saveConfig(config: SpendWiseConfig): void
⋮----
// ─── Component ─────────────────────────────────────────────────────────────────
⋮----
interface OnboardingModalProps {
  onComplete: (config: SpendWiseConfig) => void;
  preferredName?: string;
  preferredPhone?: string;
}
⋮----
export default function OnboardingModal(
⋮----
const [currency, setCurrency] = useState<CurrencySymbol>('₹'); // Default to ₹ as per user audio
⋮----
// Advanced fields
⋮----
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleNextStep = () =>
⋮----
const handleFinalSubmit = () =>
⋮----
const handleKeyDown = (e: React.KeyboardEvent) =>
````

## File: src/features/parental/components/ChildQRScanner.tsx
````typescript
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
⋮----
interface ChildQRScannerProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (parentId: string) => void;
}
⋮----
/* verbose= */ false
⋮----
// ignore scan errors (they happen every frame)
````

## File: src/features/parental/components/LinkingQRModal.tsx
````typescript
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
⋮----
interface LinkingQRModalProps {
  show: boolean;
  onClose: () => void;
}
⋮----
export function LinkingQRModal(
⋮----
qrRef.current.innerHTML = ''; // Clear previous
⋮----
const tryRender = (attempts = 0) =>
⋮----
setTimeout(() => tryRender(attempts + 1), 200); // retry every 200ms, up to 3s
⋮----
// Fallback: show the raw data as text the child can type
````

## File: src/features/parental/components/ParentalActivity.tsx
````typescript
import React from 'react';
import { ClipboardList, Star, Shield, Lock, Smartphone, MoreHorizontal } from 'lucide-react';
````

## File: src/features/parental/components/ParentalControlGate.tsx
````typescript
import { useState } from 'react';
import { Lock, Baby, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { PinInput } from '@/ui/PinInput';
⋮----
const handleUnlock = async () =>
````

## File: src/features/parental/components/ParentalDashboard.tsx
````typescript
import React from 'react';
import { PendingApprovals } from '@/features/parental/components/PendingApprovals';
import { ChoreVerification, DeviceLinkingCard } from '@/features/parental/components/ParentalActivity';
import { ParentalSettingsCard } from '@/features/parental/components/ParentalSettingsCard';
import { Transaction } from '@/types';
import { LinkingQRModal } from '@/features/parental/components/LinkingQRModal';
import { Shield } from 'lucide-react';
⋮----
import { ParentalControlState } from '@/store';
⋮----
interface ParentalDashboardProps {
  pendingTransactions: Transaction[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
  lockSession: () => void;
  removePin: () => void;
}
⋮----
````

## File: src/features/parental/components/ParentalLockScreen.tsx
````typescript
import React from 'react';
import { Lock } from 'lucide-react';
import { PinInput } from '@/ui/PinInput';
⋮----
interface ParentalLockScreenProps {
  unlockPin: string;
  setUnlockPin: (pin: string) => void;
  unlockError: string;
  setUnlockError: (error: string) => void;
  handleUnlock: () => void;
}
⋮----
export const ParentalLockScreen: React.FC<ParentalLockScreenProps> = ({
  unlockPin,
  setUnlockPin,
  unlockError,
  setUnlockError,
  handleUnlock
}) =>
````

## File: src/features/parental/components/ParentalSettingsCard.tsx
````typescript
import React from 'react';
import { Shield, Lock, Bell, AlertTriangle, Trash2 } from 'lucide-react';
⋮----
import { ParentalControlState } from '@/store';
⋮----
interface ParentalSettingsCardProps {
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
  lockSession: () => void;
  removePin: () => void;
}
⋮----
checked=
````

## File: src/features/parental/components/ParentalSetupFlow.tsx
````typescript
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Save, Lock, Camera } from 'lucide-react';
import { PinInput } from '@/ui/PinInput';
import { ChildQRScanner } from '@/features/parental/components/ChildQRScanner';
⋮----
interface ParentalSetupFlowProps {
  setupStep: 'welcome' | 'pin' | 'limits';
  setSetupStep: (step: 'welcome' | 'pin' | 'limits') => void;
  newPin: string;
  setNewPin: (pin: string) => void;
  pinError: string;
  handleSetPin: () => void;
  completeSetup: () => void;
  settings: any;
  updateSettings: (updates: any) => void;
}
⋮----
onClick=
⋮----
onSuccess=
⋮----
onChange=
````

## File: src/features/parental/components/PendingApprovals.tsx
````typescript
import React from 'react';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import { Transaction } from '@/types';
⋮----
interface PendingApprovalsProps {
  pendingTransactions: Transaction[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}
⋮----
onClick=
````

## File: src/features/parental/hooks/useParentalManager.ts
````typescript
import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Transaction } from '@/types';
⋮----
export function useParentalManager()
⋮----
// Setup state
⋮----
// Unlocking state
⋮----
const handleUnlock = async () =>
⋮----
const handleSetPin = async () =>
⋮----
const handleApprove = (id: string) =>
⋮----
const handleReject = (id: string) =>
⋮----
const updateSettings = (updates: Partial<typeof settings>) =>
⋮----
const lockSession = ()
const removePin = ()
⋮----
const completeSetup = () =>
````

## File: src/features/parental/ParentalView.tsx
````typescript
import React from 'react';
import { useParentalManager } from '@/features/parental/hooks/useParentalManager';
import { ParentalLockScreen } from '@/features/parental/components/ParentalLockScreen';
import { ParentalSetupFlow } from '@/features/parental/components/ParentalSetupFlow';
import { ParentalDashboard } from '@/features/parental/components/ParentalDashboard';
import { Shield } from 'lucide-react';
⋮----
export const ParentalView: React.FC = () =>
````

## File: src/features/portfolio/components/AddModal.tsx
````typescript
import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import Portal from '@/ui/Portal';
import { ASSET_TYPES, LIABILITY_TYPES } from '@/data/portfolioConfig';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
export interface AddModalProps {
  mode: 'asset' | 'liability';
  currency: string;
  onAdd: (data: any) => void;
  onClose: () => void;
  config: SpendWiseConfig | null;
}
⋮----
// Students usually don't have mortgages or business loans, but prioritize student loans
⋮----
// Prioritize business loans
⋮----
} else { // Assets
⋮----
// Prioritize education fund
⋮----
// Prioritize business assets
⋮----
const handleSubmit = () =>
````

## File: src/features/portfolio/components/AllocationDonut.tsx
````typescript
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ASSET_TYPES } from '@/data/portfolioConfig';
⋮----
export interface AllocationDonutProps {
  allocationByType: any[];
  total: number;
  currency: string;
}
⋮----
function fmt(n: number, currency: string)
````

## File: src/features/portfolio/components/DebtPlanner.tsx
````typescript
import React, { useState, useMemo } from 'react';
import { ShieldAlert, Zap, TrendingDown, Calendar, ArrowRight, BrainCircuit, Info } from 'lucide-react';
import { LiabilityEntry } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface DebtPlannerProps {
  liabilities: LiabilityEntry[];
  currency: string;
  monthlyExtra?: number; // How much extra the user can pay each month
  userRole?: string;
}
⋮----
monthlyExtra?: number; // How much extra the user can pay each month
⋮----
type PayoffStrategy = 'avalanche' | 'snowball';
⋮----
minPayment: l.minPayment || Math.max(l.balance * 0.02, 500), // Default 2% or 500
⋮----
// Comparison Logic
⋮----
const simulate = (strat: PayoffStrategy) =>
⋮----
const MAX_MONTHS = 600; // 50 years limit
⋮----
// 1. Pay minimums and apply interest
⋮----
// 2. Extra payment
⋮----
{/* Strategy Selector */}
⋮----
onClick=
⋮----
{/* Quick Stats */}
⋮----
{/* Repayment Order */}
⋮----
{/* Advisor Context */}
````

## File: src/features/portfolio/components/EntryCard.tsx
````typescript
import React from 'react';
import { Trash2 } from 'lucide-react';
⋮----
export interface EntryCardProps {
  label: string;
  icon: React.ReactNode;
  iconEmoji?: string;
  color: string;
  balance: number;
  currency: string;
  type?: string;
  onDelete: () => void;
}
⋮----
function getConsistentTrend(label: string): string
⋮----
const value = (Math.abs(hash % 500) / 100) - 1.5; // -1.5 to 3.5
⋮----
function fmt(n: number, currency: string)
⋮----
export function EntryCard({
  label, icon, iconEmoji, color, balance, currency, type, onDelete,
}: EntryCardProps)
````

## File: src/features/portfolio/components/FutureWealthSimulator.tsx
````typescript
import { useState, useMemo } from 'react';
import { TrendingUp, PieChart, Landmark, ArrowRight, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
⋮----
interface FutureWealthSimulatorProps {
  currentBalance: number;
  monthlySavings: number;
  currency?: string;
}
⋮----
const [expectedROI, setExpectedROI] = useState(7); // 7% annual return
⋮----
{/* Header */}
⋮----
{/* Controls */}
⋮----
onChange=
⋮----
{/* Stats Summary & Result */}
⋮----
{/* Chart */}
````

## File: src/features/portfolio/components/WealthTree.tsx
````typescript
import React from 'react';
import { motion } from 'framer-motion';
⋮----
interface WealthTreeProps {
  score: number; // 0 to 100
  savingsRate: number; // percentage
  role?: string;
}
⋮----
score: number; // 0 to 100
savingsRate: number; // percentage
⋮----
// Tree state: 0-20: Seed, 21-40: Sprout, 41-60: Small Tree, 61-80: Healthy Tree, 81-100: Lush Tree
⋮----
const getScale = () =>
⋮----
const getLeaves = () =>
⋮----
{/* Pot */}
⋮----
{/* Trunk */}
⋮----
{/* Leaves / Canopy */}
⋮----
{/* Floating Sparks if score is high */}
````

## File: src/features/portfolio/hooks/usePortfolio.ts
````typescript
import { AssetType } from '@/types';
import { useStore } from '@/store';
⋮----
export function usePortfolio()
⋮----
// ── Computed ─────────────────────────────────────────────────────────────────
⋮----
// Allocation by type
````

## File: src/features/portfolio/PortfolioView.tsx
````typescript
import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import FutureWealthSimulator from '@/features/portfolio/components/FutureWealthSimulator';
import DebtPlanner from '@/features/portfolio/components/DebtPlanner';
import AddModal from '@/features/portfolio/components/AddModal';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useIsMobile } from '@/hooks/useMediaQuery';
import PortfolioViewMobile from '@/features/portfolio/PortfolioViewMobile';
import { PortfolioHeader } from '@/features/portfolio/components/PortfolioHeader';
import { PortfolioSummaryBanner } from '@/features/portfolio/components/PortfolioSummaryBanner';
import { PortfolioInsights } from '@/features/portfolio/components/PortfolioInsights';
import { PortfolioLists } from '@/features/portfolio/components/PortfolioLists';
⋮----
// ─── Main ─────────────────────────────────────────────────────────────────────
⋮----
interface PortfolioViewProps {
  currency?: string;
  financeState: any;
  config: SpendWiseConfig | null;
}
⋮----
// Calculate Wealth Health Score (simplified)
⋮----
// Use monthlyStats from financeState for more accurate "Monthly" numbers
⋮----
onClose=
⋮----
onAddLiability=
````

## File: src/features/portfolio/PortfolioViewMobile.tsx
````typescript
import React from 'react';
import {
  Plus,
  BarChart2,
  BrainCircuit,
  Zap,
  PieChart,
  Wallet,
  ShieldAlert,
} from 'lucide-react';
import NetWorthEvolution from '@/features/portfolio/components/NetWorthEvolution';
import FutureWealthSimulator from '@/features/portfolio/components/FutureWealthSimulator';
import DebtPlanner from '@/features/portfolio/components/DebtPlanner';
import EntryCard from '@/features/portfolio/components/EntryCard';
import AllocationDonut from '@/features/portfolio/components/AllocationDonut';
import { MobilePortfolioHero } from '@/features/portfolio/components/MobilePortfolioHero';
import { haptic } from '@/lib/haptic';
⋮----
interface PortfolioViewMobileProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
  assets: any[];
  liabilities: any[];
  activeTab: 'overview' | 'simulation' | 'debt';
  setActiveTab: (tab: 'overview' | 'simulation' | 'debt') => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
  onDeleteAsset: (id: string) => void;
  onDeleteLiability: (id: string) => void;
  allocationByType: any[];
  financeState: any;
  config: any;
  healthScore: number;
  savingsRate: number;
}
⋮----
{/* 1. Sticky Mini-Tab Selector */}
⋮----
haptic.light();
setActiveTab(tab.id as any);
⋮----
{/* Action Quick-Links */}
⋮----
haptic.medium();
onAddAsset();
⋮----
{/* Asset/Liability Lists */}
⋮----
onDeleteAsset(asset.id);
⋮----
onDeleteLiability(liability.id);
````

## File: src/features/profile/components/AccessibilitySection.tsx
````typescript
import { Sun, Moon, Type, Smartphone } from 'lucide-react';
import type { FontSizeKey } from '@/features/profile/components/useProfileView';
⋮----
function ToggleRow({ label, desc, checked, onChange, icon }: {
label: string; desc: string; checked: boolean; onChange: (v: boolean)
⋮----
<input type="checkbox" className="sr-only peer" checked=
⋮----
interface AccessibilitySectionProps {
  darkMode:         boolean; onDarkMode:         (v: boolean) => void;
  highContrast:     boolean; onHighContrast:     (v: boolean) => void;
  hapticsEnabled:   boolean; onHaptics:          (v: boolean) => void;
  shakeEnabled:     boolean; onShake:            (v: boolean) => void;
  fontSize:    FontSizeKey;  FONT_SIZES:  readonly FontSizeKey[];
  FONT_LABELS: Record<FontSizeKey, string>; onFontSize: (s: FontSizeKey) => void;
}
⋮----
{/* Dark Mode */}
⋮----
{/* Font Size */}
````

## File: src/features/profile/components/CurrencySelector.tsx
````typescript
import { Globe } from 'lucide-react';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { COMMON_CURRENCIES } from '@/data/currencies';
⋮----
interface CurrencySelectorProps {
  activeCurrency: string;
  baseCurrency: string;
  onSelect: (code: string) => void;
}
````

## File: src/features/profile/components/DataManagement.tsx
````typescript
import { useRef } from 'react';
import { Download, Trash2, Lock, DownloadCloud } from 'lucide-react';
import { Transaction } from '@/types';
⋮----
interface DataManagementProps {
  transactions: Transaction[];
  onExportCSV: () => void;
  onOpenResetConfirm: () => void;
  onOpenSecureExport: () => void;
  onOpenRestore: () => void;
  onRawDBExport: () => void;
  onRawDBImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportTransactions: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
⋮----
interface DataCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  titleColor?: string;
  description: React.ReactNode;
  borderColor?: string;
  children: React.ReactNode;
}
⋮----
{/* Export CSV */}
⋮----
{/* Danger Zone */}
⋮----
{/* Secure Backup — full width */}
⋮----
{/* Raw DB Backup - Dev Only */}
⋮----
{/* Transaction-only Import */}
````

## File: src/features/profile/components/NotificationsSection.tsx
````typescript
import { Bell } from 'lucide-react';
⋮----
interface NotificationsSectionProps {
  notifPermission:       NotificationPermission;
  onRequestPermission:   () => void;
  onTestNotification:    () => void;
}
````

## File: src/features/profile/components/ProfileForm.tsx
````typescript
import { useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
⋮----
interface ProfileFormField {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}
⋮----
interface ProfileFormProps {
  fields: ProfileFormField[];
  currency: string;
  onSave: () => void;
  showSavedMsg: boolean;
}
⋮----
onChange=
⋮----
onFocus=
````

## File: src/features/profile/components/ResetConfirmModal.tsx
````typescript
import React from 'react';
import { Trash2 } from 'lucide-react';
⋮----
export interface ResetConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}
````

## File: src/features/profile/components/RestoreModal.tsx
````typescript
import React, { useState } from 'react';
import { DownloadCloud, Lock } from 'lucide-react';
⋮----
export interface RestoreModalProps {
  onClose: () => void;
  onRestore: (file: File, password: string) => void;
  isRestoring: boolean;
}
⋮----
const handleRestore = () =>
⋮----
onClose();
setPassword('');
setFile(null);
````

## File: src/features/profile/components/SecureExportModal.tsx
````typescript
import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
⋮----
export interface SecureExportModalProps {
  onClose: () => void;
  onExport: (password: string) => void;
  isExporting: boolean;
}
⋮----
const handleExport = () =>
⋮----
onClose();
setPassword('');
````

## File: src/features/profile/components/useProfileView.ts
````typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { exportCSV } from '@/utils/export';
import { parseTransactionsJSON } from '@/utils/import';
import { Transaction } from '@/types';
import { encryptData, decryptData } from '@/lib/encryption';
import { useStore } from '@/store';
import { downloadDatabaseBackup, importDatabase } from '@/db/backup';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { haptic } from '@/lib/haptic';
⋮----
export type FontSizeKey = typeof FONT_SIZES[number];
⋮----
export function useProfileView(
  config: SpendWiseConfig | null,
  onUpdateConfig: (cfg: SpendWiseConfig) => void,
  addNotification?: (n: any) => void,
)
⋮----
// Preferences from secure store
⋮----
// Sync DOM with font size (in case it wasn't caught globally)
⋮----
// Handlers
const handleFontSize = (size: FontSizeKey) =>
const handleDarkMode = (on: boolean) =>
const toggleHighContrast = (checked: boolean) =>
const toggleHaptics = (enabled: boolean) =>
const toggleShake = (enabled: boolean) =>
const requestNotifPermission = async () =>
const testNotification = () =>
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleSecureExport = async (password: string) =>
const handleRestore = async (file: File, password: string) =>
const handleRawDBExport  = async () =>
const handleRawDBImport  = async (e: React.ChangeEvent<HTMLInputElement>) =>
const handleImportTransactions = async (e: React.ChangeEvent<HTMLInputElement>) =>
const handleCurrencySelect = (code: CurrencyCode) =>
⋮----
// form fields
⋮----
// modals
⋮----
// avatar
⋮----
// accessibility
⋮----
// handlers
````

## File: src/features/recurring/hooks/useAutomations.ts
````typescript
import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { RecurringTransaction, Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
function getNextDate(dateStr: string, frequency: RecurringTransaction['frequency']): string
⋮----
export function useAutomations()
⋮----
// Use a ref to ensure we only run this once per mount, or avoid infinite loops if state updates trigger re-renders
⋮----
// While the next occurrence is today or in the past
⋮----
// Create a transaction for this occurrence
⋮----
// Calculate the next one
````

## File: src/features/recurring/hooks/useRecurring.ts
````typescript
import { useMemo } from 'react';
import { Transaction, RecurringPattern } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// ─── Constants ─────────────────────────────────────────────────────────────────
⋮----
const MIN_OCCURRENCES = 2; // need at least 2 hits to flag as recurring
⋮----
// ─── Date helpers ──────────────────────────────────────────────────────────────
⋮----
function addDays(date: string, days: number): string
⋮----
function daysBetween(a: string, b: string): number
⋮----
function detectFrequency(avgDays: number): RecurringPattern['frequency']
⋮----
function normalise(name: string): string
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useRecurring(transactions: Transaction[]): RecurringPattern[]
⋮----
// Group debits by normalised merchant name
⋮----
// Sort chronologically
⋮----
// Calculate average days between occurrences
⋮----
// Only flag as recurring if gap is reasonably consistent (CV < 0.5)
⋮----
if (cv > 0.6 && txs.length < 4) return; // too irregular to be "recurring"
⋮----
const priceCreep = lastAmount > avgPrevAmount * 1.05; // 5% threshold
⋮----
merchant:     sorted[0].merchant, // use original casing
⋮----
// Sort by total spent descending
````

## File: src/features/recurring/RecurringView.tsx
````typescript
import { useState } from 'react';
import { RefreshCw, Calendar, TrendingUp, Clock, Zap, LayoutGrid } from 'lucide-react';
import { RecurringPattern, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { SubscriptionCalendar } from '@/features/subscriptions/components/SubscriptionCalendar';
import { PriceHikeDetector } from '@/features/subscriptions/components/PriceHikeDetector';
⋮----
interface RecurringViewProps {
  patterns: RecurringPattern[];
  currency?: string;
  transactions?: Transaction[];
}
⋮----
// ─── Frequency badge ──────────────────────────────────────────────────────────
⋮----
// ─── Days until next ──────────────────────────────────────────────────────────
⋮----
function daysUntil(dateStr: string): number
⋮----
function formatDate(dateStr: string): string
⋮----
// ─── Pattern card ─────────────────────────────────────────────────────────────
⋮----
{/* Top accent */}
⋮----
{/* Category icon */}
⋮----
{/* Merchant + frequency badge */}
⋮----
{/* Category + occurrences */}
⋮----
{/* Amount */}
⋮----
{/* Next expected */}
⋮----
Next: <span style=
⋮----
// ─── Empty state ──────────────────────────────────────────────────────────────
⋮----
// ─── Summary stats bar ────────────────────────────────────────────────────────
⋮----
// ─── Main component ───────────────────────────────────────────────────────────
⋮----
// Build calendar-friendly subscription list from recurring patterns
⋮----
{/* Header */}
⋮----
{/* View toggle */}
⋮----
{/* Price Hike Detection */}
````

## File: src/features/reports/ReportsView.tsx
````typescript
import React, { useRef, useState } from 'react';
import { FileText, Sparkles, Download, Share2, Calendar, Loader2, Printer } from 'lucide-react';
import { generateMonthlyReport } from '@/insights/reporting';
⋮----
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Transaction, MonthlyStats } from '@/types';
⋮----
interface ReportsViewProps {
  transactions: Transaction[];
  currency: string;
  monthlyStats: MonthlyStats;
}
⋮----
const handleGenerate = async () =>
⋮----
const handleDownloadMD = () =>
⋮----
const handlePrintPDF = () =>
⋮----
// Simple sanitization to prevent XSS via print window (SEC-10)
const sanitizeHtml = (html: string): string =>
⋮----
const handleShare = async () =>
````

## File: src/features/shared/components/SharedModals.tsx
````typescript
import React, { useState, useEffect, useRef } from 'react';
import { Copy, Share2, Check, Info, Users } from 'lucide-react';
import { Modal } from '@/ui/Modal';
import { Btn } from '@/ui/Button';
import { Field, Inp } from '@/ui/Input';
import { Sel } from '@/ui/Select';
import { Err, Ok } from '@/ui/Alert';
import { EmojiBtn } from '@/ui/Avatar';
import { Ico } from '@/ui/Icons';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// Constants
⋮----
export function CreateGroupModal({ show, onClose, onSubmit, userName }: {
show: boolean; onClose: ()
⋮----
function reset()
⋮----
async function submit(e: React.FormEvent)
⋮----
<Modal show=
⋮----
// @ts-ignore
⋮----
// Mailto fallback
⋮----
<Inp type="email" placeholder="friend@example.com" value=
⋮----
<Inp type="number" min="0.01" step="0.01" placeholder="0.00" value=
⋮----
<Inp type="date" value=
⋮----
<Field label=
⋮----
<Field label="Date"><Inp type="date" value=
⋮----
onChange=
⋮----
<Field label="Target Amount"><Inp type="number" min="1" placeholder="50000" value=
<Field label="Target Date"><Inp type="date" value=
⋮----
const fmt = (v: number) => `$
⋮----
function handleCopyPeerId()
⋮----
function handleCopyCode()
⋮----
function handleCopyLink()
⋮----
function submit(e: React.FormEvent)
⋮----
{/* Info box explaining automatic group-based syncing */}
⋮----
{/* Accordion trigger for legacy Peer ID direct connections */}
⋮----
<Btn full v="primary" type="submit" disabled=
````

## File: src/features/shared/components/SharedTabs.tsx
````typescript
import React from 'react';
import { motion } from 'framer-motion';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { Ico } from '@/ui/Icons';
import { Avatar } from '@/ui/Avatar';
import { StatusPill } from '@/ui/StatusPill';
import { Activity, Plus, ArrowRight, Sparkles } from 'lucide-react';
⋮----
const fmt = (v: number, currency: string) => `$
⋮----
// Settlement logic
⋮----
{/* Balances Board */}
⋮----
{/* Settlements Suggestion Panel */}
⋮----
{/* Expenses Log */}
⋮----
Target: <span className="font-semibold text-[var(--text-primary)]">
⋮----
onClick=
````

## File: src/features/shared/hooks/useSharedWallets.ts
````typescript
/**
 * useSharedWallets.ts
 *
 * Changes from original:
 *  1. Calls syncEngine.joinGroup(selectedGroupId) whenever the selected group changes
 *     so the Supabase Realtime channel is correctly subscribed.
 *  2. Removes the broken PeerJS-specific connectToPeer return value
 *     (replaced with a no-op that shows a toast instead).
 *  3. inviteMember now also calls the send-invite Edge Function so a real
 *     email is delivered via Resend (falls back silently if Supabase not configured).
 *
 * Everything else (CRDT, data shapes, return API) is identical to the original.
 */
⋮----
// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SharedGroup, SharedGroupMember, SharedWalletEntry,
  SharedExpense, SharedExpenseSplit, SharedGoal,
  SharedGoalContribution, SharedStorage, mergeSharedStorage
} from '@/lib/crdt';
import { syncEngine, SyncState } from '@/lib/syncEngine';
import { useStore } from '@/store';
import { isSupabaseConfigured } from '@/services/supabase';
⋮----
export interface PendingInvite {
  memberId:     string;
  groupId:      string;
  groupName:    string;
  groupPurpose: string;
  invitedAt:    string;
}
⋮----
// ─── Real email invite via Supabase Edge Function ────────────────────────────
⋮----
async function sendInviteEmail(params: {
  to:        string;
  toName:    string;
  groupName: string;
  groupId:   string;
  fromName:  string;
}): Promise<void>
⋮----
if (!isSupabaseConfigured) return; // skip silently in offline mode
⋮----
// Errors are swallowed — the invite is still stored locally.
// The mailto: fallback in InviteModal handles the UX.
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useSharedWallets(
  userId:    string | null,
  userEmail: string | null = null,
  userName:  string        = 'A friend',
)
⋮----
// ── Sync engine wiring ────────────────────────────────────────────
⋮----
// Malformed packet — ignore
⋮----
// ── Join the Supabase Realtime channel for the selected group ─────
⋮----
// ── Broadcast our state when newly connected ──────────────────────
⋮----
}, [connectedPeers, syncState]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── Derived slices ────────────────────────────────────────────────
⋮----
// Auto-select first group
⋮----
// Pending invites for current user
⋮----
// Wallet balance
⋮----
// Split balances
⋮----
// ── Mutate helper ─────────────────────────────────────────────────
⋮----
const markDeleted = (prev: SharedStorage, id: string): SharedStorage => (
⋮----
const uid = ()
⋮----
// ── Actions ───────────────────────────────────────────────────────
⋮----
// Fire real email (non-blocking)
⋮----
.catch(() => { /* InviteModal mailto: fallback still shown */ });
⋮----
channelHint:  `shared-wallet:${groupId}`, // tell joiner which RT channel to use
⋮----
// Data
⋮----
// Sync state (now Supabase Realtime, not PeerJS)
⋮----
/**
     * connectToPeer — kept for UI compat but is now a no-op.
     * Supabase Realtime handles multi-peer automatically via joinGroup().
     * The ConnectCohortModal can be removed from the UI or repurposed
     * to show a "Share group QR to invite others" message.
     */
⋮----
// No-op — all peers sharing the same groupId are already connected
// via the Supabase Realtime channel "shared-wallet:{groupId}".
⋮----
// Actions
````

## File: src/features/subscriptions/components/AddSubscriptionModal.tsx
````typescript
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '@/store';
import { useCategories } from '@/hooks/useCategories';
import { RecurringFrequency, Category } from '@/types';
⋮----
interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}
⋮----
const handleSubmit = (e: React.FormEvent) =>
⋮----
// Reset and close
⋮----
onChange=
````

## File: src/features/subscriptions/components/PriceHikeDetector.tsx
````typescript
import React, { useMemo, useState } from 'react';
import { AlertTriangle, TrendingUp, Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types';
⋮----
interface PriceHikeDetectorProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
interface HikeAlert {
  merchant: string;
  oldAmount: number;
  newAmount: number;
  changePct: number;
  lastDate: string;
}
⋮----
function CancellationEmail(
⋮----
const handleCopy = () =>
⋮----
<button onClick=
````

## File: src/features/subscriptions/components/SubscriptionCalendar.tsx
````typescript
/**
 * SubscriptionCalendar.tsx
 * Monthly grid view showing when each subscription bill hits.
 */
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
⋮----
interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay?: number; // day of month (1-31)
  emoji?: string;
  color?: string;
}
⋮----
billingDay?: number; // day of month (1-31)
⋮----
interface Props {
  subscriptions: Subscription[];
  currency?: string;
}
⋮----
// Build bill map: day → subscriptions
⋮----
const prev = () =>
const next = () =>
⋮----
{/* Header */}
⋮----
{/* Nav */}
⋮----
{/* Day Headers */}
⋮----
{/* Grid */}
````

## File: src/features/subscriptions/hooks/useSubscriptionManager.ts
````typescript
import { useMemo } from 'react';
import { RecurringPattern } from '@/types';
import { useStore } from '@/store';
⋮----
function daysUntil(dateStr: string): number
⋮----
export function useSubscriptionManager(patterns: RecurringPattern[])
````

## File: src/features/subscriptions/hooks/useSubscriptions.ts
````typescript
import { useMemo, useEffect } from 'react';
import { useStore } from '@/store';
import { Transaction, RecurringPattern } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export function useSubscriptions()
⋮----
// Auto-detector logic
⋮----
// Group by merchant
⋮----
// Sort by date
⋮----
// Calculate average interval (days)
⋮----
// If interval is roughly 30 days (month) or 7 days (week) or 365 days (year)
⋮----
priceCreep: lastTx.amount > avgAmount + 10 // small buffer
⋮----
}, [transactions]); // Run when transactions change
````

## File: src/features/sync/BankSyncView.tsx
````typescript
import { useState, useEffect } from 'react';
import {
  Brain, CheckCircle2, Sparkles, Loader2, AlertCircle
} from 'lucide-react';
import { Transaction, LinkedAccount, FinanceProvider, Category, SyncView, WizardStep } from '@/types';
import { UPI_PROVIDERS, generateRealisticMocks } from '@/parsers/upi';
import { initiateRazorpayPayment, parseUPIPayment, rememberMerchant, parseUPIDescription, loadMerchantMemory } from '@/utils/razorpaySync';
import { predictCategory } from '@/utils/merchantMapper';
import { useStore } from '@/store';
import { Category as CategoryType } from '@/types';
⋮----
import SyncDashboard from '@/features/sync/components/SyncDashboard';
import SelectSource from '@/features/sync/components/SelectSource';
import UPILink from '@/features/sync/components/UPILink';
import RazorpayLink from '@/features/sync/components/RazorpayLink';
import PayForm from '@/features/sync/components/PayForm';
⋮----
interface BankSyncViewProps {
  onAutoAddTransactions: (txs: Transaction[]) => void;
  recentTransactions?: Transaction[];
  currency?: string;
  onNavigate?: (view: any) => void;
}
⋮----
// Load Razorpay account from store on mount
⋮----
// Count merchant memory entries from secure storage
⋮----
const handleUPILinkSuccess = (provider: typeof UPI_PROVIDERS[0], id: string) =>
⋮----
const handlePay = (amount: number, description: string) =>
⋮----
const applyCorrection = () =>
⋮----
// BUG-15 fix: use merchant name as fallback key when no UPI VPA is available
⋮----
// BUG-15 fix: update the existing transaction instead of re-adding (was causing duplicates)
⋮----
/** Mock sync for non-Razorpay providers with Step-by-Step feedback and Review */
const handleMockSync = async (acc: LinkedAccount) =>
⋮----
// Step 1: Parse UPI strings
⋮----
// Step 2: Bulk categorise using existing merchant memory & merchantMapper
⋮----
const handleConfirmImport = () =>
⋮----
const handleCategoryChange = (txId: string, newCat: Category) =>
⋮----
const handleSyncAccount = (acc: LinkedAccount) =>
⋮----
const formatDate = (iso: string)
⋮----
const handleRazorpayConnect = (keyId: string, secret: string) =>
⋮----
<button onClick=
````

## File: src/features/sync/components/CSVImporter.tsx
````typescript
import React, { useState, useCallback, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, FileText, X } from 'lucide-react';
import { Transaction, Category } from '@/types';
import { parseCSVLocally } from '@/parsers/csv';
⋮----
interface CSVImporterProps {
  onImport: (transactions: Transaction[]) => void;
}
⋮----
type MappingKey = 'date' | 'merchant' | 'amount' | 'category' | 'type' | 'skip';
interface ColumnMapping { [colIndex: number]: MappingKey; }
⋮----
// ── Helpers ───────────────────────────────────────────────────────────────────
⋮----
function parseCSVLine(line: string): string[]
⋮----
function guessMapping(headers: string[]): ColumnMapping
⋮----
function parseDate(raw: string): string
⋮----
function guessCategory(raw: string): Category
⋮----
// ── Component ─────────────────────────────────────────────────────────────────
⋮----
type Step = 'upload' | 'mapping' | 'preview' | 'done';
⋮----
const reset = () =>
⋮----
const buildPreview = async () =>
⋮----
onDragOver=
onDragLeave=
onDrop=
onClick=
⋮----
<button onClick=
````

## File: src/features/sync/components/PayForm.tsx
````typescript
import React, { useState } from 'react';
import { ArrowLeft, Zap, Smartphone, ChevronRight, Info, Send } from 'lucide-react';
import { UPI_APP_INTENTS, initiateUPIPayment } from '@/utils/upiPayment';
import { initiateRazorpayPayment } from '@/utils/razorpaySync';
import { useStore } from '@/store';
⋮----
export interface PayFormProps {
  onSetView: (view: any) => void;
  onPay: (amount: number, description: string) => void;
  currency: string;
}
⋮----
type PayMode = 'select' | 'upi-id' | 'razorpay';
⋮----
const validateVPA = (v: string)
⋮----
const handleUPIAppPay = (appId: string) =>
⋮----
const pa = payeeVPA.trim() || 'merchant@upi'; // fallback for generic any-app intent
⋮----
// If specific app, build app-specific URL
⋮----
// Save pending payment + open UPI intent using the correct urlScheme
⋮----
const handleQuickAnyUPI = () =>
⋮----
const handleRazorpay = () =>
⋮----
onClick=
⋮----
{/* ── Amount Input (always visible) ───────────────────────────── */}
⋮----
onChange=
⋮----
{/* ── Mode: Select ────────────────────────────────────────────── */}
⋮----
{/* Native UPI — send to UPI ID */}
⋮----
{/* Quick UPI App Chooser — each major app */}
⋮----
// Quick pay: no VPA needed, opens app generically
⋮----
pa: 'pay@upi', // placeholder — user enters in the app
⋮----
{/* Razorpay fallback */}
⋮----
{/* ── Mode: UPI ID Entry ─────────────────────────────────────── */}
⋮----
{/* Choose which UPI app to open */}
⋮----
{/* ── Mode: Razorpay ────────────────────────────────────────── */}
````

## File: src/features/sync/components/RazorpayLink.tsx
````typescript
import React, { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
⋮----
export interface RazorpayLinkProps {
  onSetView: (view: any) => void;
  onConnect: (keyId: string, secret: string) => void;
}
⋮----
export function RazorpayLink(
⋮----
const handleSubmit = (e: React.FormEvent) =>
⋮----
<button onClick=
````

## File: src/features/sync/components/SelectSource.tsx
````typescript
import React from 'react';
import { ArrowLeft, Landmark, Zap, UploadCloud, ChevronRight } from 'lucide-react';
import { SyncView } from '@/types';
⋮----
export interface SelectSourceProps {
  onSetView: (view: SyncView) => void;
}
⋮----
<button onClick=
````

## File: src/features/sync/components/SyncDashboard.tsx
````typescript
import React from 'react';
import {
  Landmark, Zap, MoreVertical, TrendingDown, Hash, Sparkles, Brain,
  SmartphoneNfc, Link2, History, CreditCard, Clock, RefreshCw, Activity, Users
} from 'lucide-react';
import { Transaction, LinkedAccount, SyncView } from '@/types';
import { UPI_PROVIDERS } from '@/parsers/upi';
import CSVImporter from '@/features/sync/components/CSVImporter';
import { CloudSync } from '@/features/sync/components/CloudSync';
import { useSharedWallets } from '@/features/shared/hooks/useSharedWallets';
import { useAuth } from '@/hooks/useAuth';
⋮----
export interface SyncDashboardProps {
  totalUPISpend: number;
  aiParsedCount: number;
  merchantMemoryCount: number;
  accounts: LinkedAccount[];
  recentTransactions: Transaction[];
  syncingAccountId: string | null;
  onSyncAccount: (acc: LinkedAccount) => void;
  onSetView: (view: SyncView) => void;
  currency: string;
  onAutoAddTransactions: (txs: Transaction[]) => void;
  onNavigate?: (view: any) => void;
}
⋮----
const formatDate = (iso: string)
⋮----
{/* Header */}
⋮----
onClick=
⋮----
{/* Stats Row */}
⋮----
{/* Connected Sources */}
⋮----
<button onClick=
⋮----
{/* Shared Wallets */}
⋮----
if (onNavigate) onNavigate('shared');
⋮----
{/* Recent Payments */}
⋮----
<Clock size=
````

## File: src/features/sync/components/UPILink.tsx
````typescript
import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { UPI_PROVIDERS } from '@/parsers/upi';
⋮----
export interface UPILinkProps {
  onSetView: (view: any) => void;
  onUPILinkSuccess: (provider: typeof UPI_PROVIDERS[0], id: string) => void;
}
⋮----
type WizardStep = 'upi-select' | 'upi-credentials' | 'upi-connecting' | 'upi-success';
⋮----
const handleVerifyAndLink = () =>
⋮----
<button onClick=
⋮----
<button key=
````

## File: src/features/transactions/components/BulkActionHeader.tsx
````typescript
import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Category } from '@/types';
import { CategoryDropdown } from '@/ui/CategoryDropdown';
⋮----
export interface BulkActionHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkCategoryChange: (newCategory: Category) => void;
  onBulkDelete: () => void;
}
````

## File: src/features/transactions/components/DeleteConfirmModal.tsx
````typescript
import { AlertCircle } from 'lucide-react';
⋮----
interface DeleteConfirmModalProps {
  deleteConfirmId: string | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}
````

## File: src/features/transactions/components/HistoryToolbar.tsx
````typescript
import { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Transaction } from '@/types';
import { haptic } from '@/lib/haptic';
import { exportCSV, exportJSON } from '@/utils/export';
⋮----
interface HistoryToolbarProps {
  filtered:      Transaction[];
  currency:      string;
  onImportClick?: () => void;
  onPDFReport?:   () => void;
  onImportJSON:  (e: React.ChangeEvent<HTMLInputElement>) => void;
}
⋮----
const tealBtn = (d: boolean) => (
⋮----
onClick=
⋮----
style=
````

## File: src/features/transactions/components/historyTypes.ts
````typescript
export type SortKey    = 'date' | 'amount' | 'merchant' | 'category';
export type SortDir    = 'asc'  | 'desc';
export type TypeFilter = 'all'  | 'credit' | 'debit';
````

## File: src/features/transactions/components/SortBtn.tsx
````typescript
import { ChevronUp, ChevronDown } from 'lucide-react';
import { haptic } from '@/lib/haptic';
import type { SortKey, SortDir } from '@/features/transactions/components/historyTypes';
⋮----
interface SortBtnProps {
  label:   string;
  field:   SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort:  (k: SortKey) => void;
}
⋮----
export function SortBtn(
⋮----
onClick=
````

## File: src/features/transactions/components/TransactionList.tsx
````typescript
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { AlertCircle } from 'lucide-react';
import { SortBtn } from './SortBtn';
import TransactionRow from './TransactionRow';
import { DisplayRow } from '../hooks/useTransactionHistory';
import { Transaction, Category } from '@/types';
import type { SortKey, SortDir } from './historyTypes';
⋮----
export interface TransactionListProps {
  filtered: Transaction[];
  displayRows: DisplayRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onDelete?: (id: string) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  sortKey: SortKey;
  sortDir: SortDir;
  handleSort: (key: SortKey) => void;
  virtuosoRef?: React.Ref<React.ElementRef<typeof Virtuoso>>;
}
⋮----
else setSelectedIds(new Set(filtered.map(t
````

## File: src/hooks/useMediaQuery.ts
````typescript
import { useState, useEffect } from 'react';
⋮----
export function useMediaQuery(query: string): boolean
⋮----
const listener = ()
⋮----
export function useIsMobile(): boolean
⋮----
// Common breakpoint for mobile devices
````

## File: src/hooks/usePrefersReducedMotion.ts
````typescript
import { useState, useEffect } from 'react';
⋮----
export function usePrefersReducedMotion()
⋮----
const listener = (event: MediaQueryListEvent) =>
````

## File: src/hooks/useUPIReturn.tsx
````typescript
/**
 * useUPIReturn Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects when the user returns from a UPI payment app and processes the result.
 *
 * Detection strategy (multi-layered):
 * 1. On mount: Check current URL for UPI return params
 * 2. On `visibilitychange`: App resumes — check pending payment, ask user
 * 3. On `pageshow` (bfcache restore): Same as above
 */
⋮----
import React, { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  parseUPIReturnParams,
  getPendingUPIPayment,
  clearPendingUPIPayment,
  upiResultToTransaction,
  UPIPaymentResult,
  PendingUPIPayment,
} from '@/utils/upiPayment';
import { Transaction } from '@/types';
⋮----
interface UseUPIReturnOptions {
  onTransactionAdded: (txs: Transaction[]) => void;
  onPaymentDetected?: (result: UPIPaymentResult) => void;
}
⋮----
function cleanURLParams()
⋮----
async function addUPITransaction(
  result: UPIPaymentResult,
  onTransactionAdded: (txs: Transaction[]) => void
)
⋮----
const handleYes = async () =>
⋮----
const handleNo = () =>
⋮----
// Strategy 1: URL params on mount (immediate redirect return from UPI app)
⋮----
// Strategy 2: visibilitychange — app resumes after switching from UPI app
⋮----
const onVisibilityChange = () =>
⋮----
// Only act if the app was hidden for at least 1 second
⋮----
// Strategy 3: pageshow event (back navigation / bfcache restore)
⋮----
const onPageShow = (e: PageTransitionEvent) =>
````

## File: src/insights/anomaly.ts
````typescript
import { Transaction } from '@/types/finance';
⋮----
export interface AnomalyResult {
  transaction: Transaction;
  reason: string;
  zScore: number;
}
⋮----
export function detectAnomalies(transactions: Transaction[]): AnomalyResult[]
⋮----
// Group by category
⋮----
if (txs.length < 3) return; // Need at least 3 to calculate stdDev meaningfully
⋮----
// If amount is > mean + 2*stdDev AND amount > 2 * mean (to avoid flagging small variations)
⋮----
// Sort by Z-score descending
````

## File: src/insights/budgetSuggestions.ts
````typescript
import { Transaction, BudgetSuggestion } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
/**
 * Analyzes last 3 months of spending to suggest smart budget limits.
 * Applies the 110% rule: suggest 10% buffer above average for most categories,
 * or 90% for categories that look reducible.
 */
export function generateBudgetSuggestions(transactions: Transaction[]): BudgetSuggestion[]
⋮----
// Group by category
⋮----
const month = t.date.slice(0, 7); // YYYY-MM
⋮----
// Need at least 2 months of data or 3+ transactions for confidence
⋮----
// Essentials: set exact average (can't really cut these)
⋮----
// Discretionary: suggest 90% of average to encourage reduction
⋮----
// Others: 110% buffer
⋮----
suggestedLimit: Math.max(suggestedLimit, 100), // minimum ₹100
⋮----
// Sort by avg spend descending
````

## File: src/insights/forecast.ts
````typescript
import { Transaction, Category } from '@/types';
⋮----
export interface CategoryForecast {
  category: Category;
  avgMonthly: number;
  lastMonth: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  trendPct: number;
}
⋮----
export interface SpendingForecast {
  predictedTotal: number;
  predictedIncome: number;
  predictedSavings: number;
  categoryForecasts: CategoryForecast[];
  confidence: 'high' | 'medium' | 'low';
  confidenceReason: string;
  daysRemaining: number;
  spentSoFar: number;
  runRate: number; // projected spend if current rate continues
}
⋮----
runRate: number; // projected spend if current rate continues
⋮----
/**
 * Pure local forecast — zero API calls.
 * Uses a simple weighted average (recent months weigh more)
 * and a "burn rate" extrapolation for the current month.
 */
export function forecastNextMonth(transactions: Transaction[], referenceDate: Date = new Date()): SpendingForecast
⋮----
// Group transactions by YYYY-MM
⋮----
// Sort months ascending, exclude current month from historical average
⋮----
const months = historicalMonths.slice(-6); // last 6 completed months
⋮----
// Weighted average (last month = 3x, second to last = 2x, rest = 1x)
⋮----
// Per-category weighted averages
⋮----
// Pad shorter arrays with 0
⋮----
// Build category forecasts
⋮----
// Sort by predicted spend descending
⋮----
// Income forecast from historical credit months
⋮----
// Current month spending (so far)
⋮----
// Run-rate: if we continue spending at current pace (with minimum telemetry guard of 5 days)
⋮----
// Graceful fallback to predicted total if historical data is available, otherwise simple projection
````

## File: src/insights/healthScore.ts
````typescript
import { Transaction, CategorySpend, MonthlyStats } from '@/types';
⋮----
export interface HealthScoreResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  breakdown: {
    savings: number;    // 0-100
    stability: number;  // 0-100
    discipline: number; // 0-100
    emergency: number;  // 0-100
  };
  recommendations: string[];
}
⋮----
savings: number;    // 0-100
stability: number;  // 0-100
discipline: number; // 0-100
emergency: number;  // 0-100
⋮----
export function calculateHealthScore(
  transactions: Transaction[],
  monthlyStats: MonthlyStats,
  categorySpending: CategorySpend[],
  currentBalance: number
): HealthScoreResult
⋮----
// 1. Savings Rate Score (40% weight)
// Target: 20% or more savings rate
⋮----
// 2. Stability Score (30% weight)
// Variability in spending week over week (simulated or based on history)
// For now, use daily spend rate vs balance
⋮----
const stabilityScore = Math.min(100, (daysOfRunway / 90) * 100); // 90 days of runway = 100%
⋮----
// 3. Discipline Score (20% weight)
// Ratio of needs vs wants (Wants: Entertainment, Travel, Dining)
⋮----
// Target: Wants < 30% of total spending
⋮----
// 4. Emergency Fund Score (10% weight)
// Target: 3 months of average monthly expenses
⋮----
// Final Weighted Score
⋮----
recommendations: recommendations.slice(0, 2), // Top 2 recommendations
````

## File: src/insights/reporting.ts
````typescript
import { Transaction } from "@/types";
⋮----
export async function generateMonthlyReport(month: string, transactions: Transaction[]): Promise<string>
⋮----
export async function getSpendingPersonality(transactions: Transaction[]): Promise<
````

## File: src/lib/crdt.ts
````typescript
export interface SharedGroup {
  id: string;
  name: string;
  purpose: string;
  created_by: string;
}
⋮----
export interface SharedGroupMember {
  id: string;
  group_id: string;
  user_id?: string;
  invited_email?: string;
  display_name: string;
  emoji: string;
  role: string;
  status: string;
  invited_at: string;
  joined_at?: string;
}
⋮----
export interface SharedWalletEntry {
  id: string;
  group_id: string;
  member_id: string;
  kind: 'contribution' | 'spend_from_pot' | 'withdrawal';
  amount: number;
  label: string;
  date: string;
}
⋮----
export interface SharedExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  share_percent: number;
}
⋮----
export interface SharedExpense {
  id: string;
  group_id: string;
  paid_by_member_id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  splits?: SharedExpenseSplit[];
}
⋮----
export interface SharedGoalContribution {
  id: string;
  goal_id: string;
  member_id: string;
  amount: number;
  date: string;
  note?: string;
}
⋮----
export interface SharedGoal {
  id: string;
  group_id: string;
  name: string;
  emoji: string;
  target_amount: number;
  target_date: string;
  color: string;
  contributions?: SharedGoalContribution[];
}
⋮----
export interface SharedStorage {
  groups: SharedGroup[];
  members: SharedGroupMember[];
  walletEntries: SharedWalletEntry[];
  expenses: SharedExpense[];
  goals: SharedGoal[];
  deleted_ids: string[]; // Tombstones
}
⋮----
deleted_ids: string[]; // Tombstones
⋮----
// LWW Union by ID, with Tombstone filtering
export function mergeSharedStorage(local: SharedStorage, remote: SharedStorage): SharedStorage
⋮----
const unionById = <T extends
⋮----
// Insert local first
⋮----
// Overwrite with remote (remote wins conflicts in basic LWW)
⋮----
// Filter out deleted items
````

## File: src/lib/encryption.ts
````typescript
/**
 * WebCrypto-based encryption for SpendWise backups.
 * Uses AES-GCM for authenticated encryption and PBKDF2 for key derivation.
 */
⋮----
export async function encryptData(data: string, password: string): Promise<string>
⋮----
// Combine salt + iv + content into a single Buffer/Array
⋮----
// Convert to Base64 for export
⋮----
export async function decryptData(encryptedBase64: string, password: string): Promise<string>
````

## File: src/lib/haptic.ts
````typescript
/**
 * Utility for native-like haptic feedback on Android/iOS
 * Only works if the device supports the Vibration API
 */
const isEnabled = () =>
⋮----
/**
   * Light impact (e.g. navigation, selection change)
   */
⋮----
/**
   * Medium impact (e.g. opening a modal, button toggle)
   */
⋮----
/**
   * Heavy impact (e.g. shake detection)
   */
⋮----
/**
   * Success feedback (e.g. transaction added)
   */
⋮----
// Short double pulse
⋮----
/**
   * Warning/Error feedback
   */
⋮----
// Longer pulse
````

## File: src/lib/motion.ts
````typescript
/**
 * SpendWise — Shared Framer Motion tokens
 * Import these presets in any animated component to ensure consistent timing.
 */
⋮----
import type { Transition, Variants } from 'framer-motion';
⋮----
// ─── Spring presets ────────────────────────────────────────────────────────────
⋮----
/** Crisp, snappy response — best for navigation & view transitions */
⋮----
/** Gentle, bouncy — best for cards, FABs, badge pops */
⋮----
/** Smooth, heavy response — best for bottom sheets & modals */
⋮----
// ─── Tween presets ────────────────────────────────────────────────────────────
⋮----
/** Subtle micro-animation for stat counter reveals */
⋮----
/** Reveal-style — best for card mount, fade-ups */
⋮----
/** Slow, emphasis — best for hero numbers */
⋮----
// ─── Shared variant factories ─────────────────────────────────────────────────
⋮----
/** Fade up from bottom — use for list items with a `delay` override */
⋮----
/** Scale in from 95% — use for modals and cards */
⋮----
/** Slide in from right — use for view transitions */
⋮----
/** Staggered children container */
export const staggerContainer = (staggerChildren = 0.05): Variants => (
````

## File: src/lib/security.ts
````typescript
/**
 * Simple SHA-256 hash implementation for strings
 * Uses Web Crypto API when available, falls back to a basic hash if not (though Web Crypto is widely supported now)
 */
⋮----
function getPinSalt(): string
⋮----
export async function hashPin(pin: string): Promise<string>
⋮----
const data = `${salt}:${pin}`;  // salt + pin before hashing
⋮----
export async function verifyPinHash(pin: string, hash: string): Promise<boolean>
⋮----
const computed = await hashPin(pin);  // uses same device salt automatically
⋮----
// Fallback: try old unsalted hash for backward compatibility/migration
⋮----
// Optional: We can upgrade the hash to salted in the store in the calling context,
// but at least verification succeeds without locking the user out.
````

## File: src/lib/syncEngine.ts
````typescript
/**
 * syncEngine.ts — Supabase Realtime P2P sync
 *
 * REPLACES the PeerJS implementation entirely.
 * PeerJS relies on a public signaling server (0.peerjs.com) that is
 * frequently blocked in India and overloaded globally.
 *
 * Supabase Realtime uses WebSockets through our own Supabase project —
 * same domain, already authenticated, no third-party dependency.
 *
 * ARCHITECTURE:
 *   • Each SpendWise client joins a Supabase Realtime channel named
 *     "shared-wallet:{groupId}" when a group is selected.
 *   • Mutations are broadcast to all other clients in the same channel.
 *   • CRDT merge handles conflicts — same as before.
 *   • localPeerId is kept for backward compat (= Supabase socket ID).
 */
⋮----
import { joinRoom, Room } from '@trystero-p2p/mqtt';
⋮----
export type SyncState = 'disconnected' | 'connecting' | 'connected';
⋮----
type DataCallback     = (data: any) => void;
type StateCallback    = (state: SyncState, peers: number) => void;
⋮----
class SyncEngine
⋮----
constructor()
⋮----
public init()
⋮----
public joinGroup(groupId: string)
⋮----
// ── Local Cross-Tab Sync via BroadcastChannel ──
⋮----
// Skip messages sent from ourselves
⋮----
// ── Global P2P Sync via MQTT WebRTC ──
⋮----
// Use secure WebSockets on public brokers for discovery/signaling with fallback support
⋮----
public broadcast(data: any)
⋮----
// 1. Broadcast globally via WebRTC
⋮----
// 2. Broadcast locally to other tabs
⋮----
public connect(remotePeerId: string)
⋮----
public onData(cb: DataCallback)
⋮----
public onStateChange(cb: StateCallback)
⋮----
public get connectedPeers(): number
⋮----
private leaveChannel()
⋮----
private notifyState(state: SyncState)
````

## File: src/lib/voiceCommands/tts.ts
````typescript
/**
 * Text-to-Speech utility — SpendWise Voice Engine
 * Wraps the Web Speech Synthesis API for result readback.
 * Uses Indian English voice preference when available.
 */
⋮----
function loadVoice()
⋮----
// Prefer en-IN, then en-GB, then any English
⋮----
// Voices load asynchronously on first call
⋮----
export function speak(text: string, options?:
⋮----
// Cancel any pending speech
⋮----
export function cancelSpeech()
````

## File: src/parsers/common.ts
````typescript
import { Category } from "@/types";
⋮----
// ─── Merchant → Category map ────────────────────────────────────────────────
⋮----
// ... (rest of food remains same)
⋮----
// ── Transport ─────────────────────────────────────────────────────────────
⋮----
// ── Travel (Tourist Places, Hotels, etc.) ──────────────────────────────────
⋮----
// ── Shopping ──────────────────────────────────────────────────────────────
⋮----
// ── Subscriptions & Telecom ───────────────────────────────────────────────
⋮----
// ── Entertainment & Movies ────────────────────────────────────────────────
⋮----
// ── Utilities & Bills ─────────────────────────────────────────────────────
⋮----
// ── Health, Medical & Pharmacy ──────────────────────────────────────────
⋮----
// ── Income ────────────────────────────────────────────────────────────────
⋮----
// ─── Regex patterns for high-specificity matching ────────────────────────────
⋮----
export function inferCategory(text: string): Category
⋮----
// 1. Food regex patterns — catches dish names
⋮----
// 2. Transport regex patterns — catches operator codes
⋮----
// 3. Travel regex patterns
⋮----
// 4. Medical regex patterns
⋮----
// 5. Full keyword map — substring match
⋮----
// 4. Smart fallback — if no shopping signals present, lean toward Food
⋮----
export function inferType(text: string, amount?: number): 'credit' | 'debit'
⋮----
export function toTitleCase(str: string): string
````

## File: src/parsers/csv.ts
````typescript
import { Transaction, Category } from "@/types";
import { VALID_CATEGORIES, inferCategory, inferType, toTitleCase } from "@/parsers/common";
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export function parseCSVLocally(csvContent: string): Transaction[]
⋮----
const parseRow = (line: string): string[] =>
````

## File: src/parsers/nlp.ts
````typescript
import { callGemini } from "@/services/gemini";
import { Category } from "@/types";
⋮----
export interface AIParseResult {
  merchant: string;
  category: Category;
  amount?: number;
  date?: string;
  type?: 'credit' | 'debit';
  confidence: number;
}
⋮----
/**
 * Uses Gemini AI (if key present) or local heuristics to analyze a transaction string.
 * Supports extracting multiple transactions from a single sentence (e.g., "500 on food 700 on travel 800 on subscription").
 */
export async function processNaturalLanguageExpense(text: string, currencyContext?: string): Promise<AIParseResult[] | null>
⋮----
// Local Heuristics Fallback for multiple items (Highly advanced tokenizer)
⋮----
// Find all number occurrences in the text (e.g., 500, 700, 1,200.50)
⋮----
// Helper to determine credit and category
const analyzeItem = (desc: string, fullText: string):
⋮----
// Check explicit debit categories first
⋮----
// Explicit credit keywords that guarantee credit
⋮----
// Ambiguous credit keywords (got, get, received, win, won, gain, profit, gift)
// If these exist AND no debit category matched, it's credit/income! E.g. "I got 2000 rs"
⋮----
// Assign final category
⋮----
// We have multiple numbers! Determine if it's Amount-First or Description-First
⋮----
// Single number or fallback splitting by "and", "&", ",", ";", "+"
````

## File: src/parsers/ocr.ts
````typescript
import Tesseract from 'tesseract.js';
import { Transaction } from "@/types";
import { MERCHANT_CATEGORY_MAP } from "@/parsers/common";
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export async function recognizeReceipt(imageBase64: string): Promise<string>
⋮----
// Optional progress logging
⋮----
export function parseOfflineReceipt(rawText: string): Partial<Transaction> &
⋮----
// 1. Find Total Amount (Prioritize "total" over "subtotal")
⋮----
// Check for line items
⋮----
// 2. Find Merchant (Skip address, phone, and store metadata lines)
⋮----
// 3. Find Category
⋮----
// Final check against merchant category map
````

## File: src/parsers/upi.ts
````typescript
/**
 * upi.ts — Complete UPI / Bank Sync Engine
 *
 * Covers:
 *  1. UPI string parser — all 12 Indian bank SMS formats
 *  2. CSV bank statement importer — HDFC, SBI, ICICI, Axis, Kotak column mapping
 *  3. Razorpay payment fetch — real API call via Supabase proxy
 *  4. Merchant → category memory with learning
 *  5. Duplicate detection — same amount ±60 seconds
 */
⋮----
import { Transaction, DefaultCategory } from "../types";
import { useStore } from "../store";
⋮----
// ─── Types ────────────────────────────────────────────────────────────────────
⋮----
export interface ParsedUPITransaction {
  id:            string;
  merchant:      string;
  amount:        number;
  type:          "debit" | "credit";
  category:      DefaultCategory;
  date:          string;
  upiId?:        string;
  bankRef?:      string;
  rawText:       string;
  confidence:    "high" | "medium" | "low";
}
⋮----
export interface ReviewTransaction extends ParsedUPITransaction {
  isDuplicate:   boolean;
  selected:      boolean;
}
⋮----
// ─── Category Keyword Map ─────────────────────────────────────────────────────
⋮----
// Food & Dining
⋮----
// Transport
⋮----
// Shopping
⋮----
// Subscriptions
⋮----
// Utilities
⋮----
// Health
⋮----
// Education
⋮----
// Entertainment
⋮----
// Travel
⋮----
// Business / Income
⋮----
function detectCategory(merchant: string): DefaultCategory
⋮----
// Check merchant memory (user corrections take priority)
⋮----
// Keyword match
⋮----
return "Shopping"; // safe default
⋮----
function learnMerchant(merchant: string, category: DefaultCategory)
⋮----
// ─── UPI String Parser ────────────────────────────────────────────────────────
// Handles all major Indian bank SMS + UPI notification formats
⋮----
// PhonePe: "UPI/CR/PhonePe/SWIGGY INDIA/payment@okicici"
// PhonePe: "UPI/DR/PhonePe/MERCHANT NAME/vpa@ybl"
⋮----
// HDFC SMS: "Rs 350.00 debited from A/c XX1234 on 19-05-26 to UPI-SWIGGY-swiggy@ic"
⋮----
// SBI: "Your A/c XX1234 debited by INR 350.00 on 19/05/26. UPI Ref: 123456789012"
⋮----
// ICICI: "ICICI Bank Acct XX1234 debited with Rs.350.00 on 19-May-26; UPI:swiggy@ic"
⋮----
// Axis Bank: "INR 350.00 debited from Axis Bank Acct XX1234 towards UPI/SWIGGY/payment@upi"
⋮----
// Paytm: "PAYTM/UPI/merchant@paytm/MERCHANT NAME"
⋮----
// Generic UPI VPA pattern: anything@bank
⋮----
function parseIndianDate(dateStr: string): string
⋮----
// DD/MM/YY or DD-MM-YY
⋮----
// DD-Mon-YY: 19-May-26
⋮----
/**
 * parseUPIString — Parse a single UPI notification / bank SMS string
 */
export function parseUPIString(text: string): ParsedUPITransaction | null
⋮----
// Run all patterns
⋮----
// Extract amount if not yet found
⋮----
// Extract merchant from UPI ID if still missing
⋮----
// Detect type from keywords if not set by pattern
⋮----
// Detect date from text if still today
⋮----
/**
 * parseMultipleUPIStrings — Parse a block of text containing multiple UPI notifications
 * (e.g. paste from SMS inbox). Each line / double-newline = one transaction.
 */
export function parseMultipleUPIStrings(bulkText: string): ParsedUPITransaction[]
⋮----
// Split by blank lines or lines that look like new SMS starts
⋮----
// ─── Duplicate Detector ───────────────────────────────────────────────────────
⋮----
export function markDuplicates(
  parsed:   ParsedUPITransaction[],
  existing: Transaction[]
): ReviewTransaction[]
⋮----
// ─── CSV Bank Statement Importer ──────────────────────────────────────────────
⋮----
interface ColumnMap {
  date:     string | number;
  narration: string | number;
  debit?:   string | number;
  credit?:  string | number;
  amount?:  string | number;
  type?:    string | number;
  balance?: string | number;
}
⋮----
// Column mappings for major Indian banks (header-row detection)
⋮----
headers: [],  // fallback — used if no profile matches
⋮----
function detectBankProfile(headers: string[]): (typeof BANK_COLUMN_PROFILES)[0]
⋮----
return BANK_COLUMN_PROFILES[BANK_COLUMN_PROFILES.length - 1]; // Generic
⋮----
function getCol(row: string[], headers: string[], key: string | number): string
⋮----
/**
 * parseCSVStatement — Import a CSV bank statement and return parsed transactions.
 * @param csvText   Raw CSV text from File reader
 * @param bankHint  Optional bank name hint ("HDFC", "SBI", "ICICI", etc.)
 */
export function parseCSVStatement(csvText: string, bankHint?: string): ParsedUPITransaction[]
⋮----
// Find the header row (first line with recognisable column names)
⋮----
// Parse CSV (handles quoted fields with commas inside)
const parseRow = (line: string): string[] =>
⋮----
// Try extracting UPI VPA from narration
⋮----
// Extract merchant name from narration
⋮----
// Strip common bank boilerplate
⋮----
.replace(/\d{10,}/g, "")          // remove long ref numbers
.replace(/[A-Z0-9]{20,}/g, "")    // remove long reference strings
⋮----
// ─── Razorpay Live Transaction Fetch ─────────────────────────────────────────
⋮----
/**
 * fetchRazorpayTransactions — Fetch real payments from Razorpay via Supabase proxy.
 *
 * The Edge Function `razorpay-proxy` makes the server-side API call
 * (so the secret key never leaves the server). Install it:
 *   supabase functions deploy razorpay-proxy
 *   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
 *   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxx
 */
export async function fetchRazorpayTransactions(
  from?: Date,
  to?:   Date
): Promise<ParsedUPITransaction[]>
⋮----
amount:     p.amount / 100,            // Razorpay stores in paise
type:       "credit" as const,         // received payment = credit
⋮----
// ─── Merchant Category Learning ───────────────────────────────────────────────
⋮----
/** Call this when user manually changes a category in the review table */
export function saveMerchantCorrection(merchant: string, category: DefaultCategory)
⋮----
// ─── Convert to App Transaction ──────────────────────────────────────────────
⋮----
export function toAppTransaction(p: ParsedUPITransaction, currency = "₹"): Omit<Transaction, "id">
⋮----
export function generateRealisticMocks(): ParsedUPITransaction[]
⋮----
const count = Math.floor(Math.random() * 5) + 5; // 5 to 9 transactions
⋮----
// Generate dates within the last 14 days
⋮----
// Sort by date descending
````

## File: src/parsers/voice.ts
````typescript
import { Category } from "@/types";
import { Transaction } from "@/types";
⋮----
export function parseVoiceLocally(transcript: string, date: string): Partial<Transaction>
⋮----
// Extract amount
⋮----
// Extract category
⋮----
// Extract merchant - very simple logic
````

## File: src/shell/AlertBanner.tsx
````typescript
import { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { SpendingAlert, AlertSeverity } from '@/types';
⋮----
interface AlertBannerProps {
  alerts:       SpendingAlert[];
  onDismiss:    (id: string) => void;
  onDismissAll: () => void;
}
⋮----
{/* Header row */}
⋮----
onClick=
````

## File: src/shell/CommandPalette.tsx
````typescript
import { useState, useEffect, useRef } from 'react';
import { Search, Compass, DollarSign, Activity, FileText, Target, Wallet, RefreshCw, User, PiggyBank, ArrowRight, X } from 'lucide-react';
import { AppView, Transaction } from '@/types';
import Portal from '@/ui/Portal';
⋮----
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  transactions: Transaction[];
  currency: string;
}
⋮----
// Filter Views
⋮----
// Filter Transactions (max 5)
⋮----
const handleKeyDown = (e: KeyboardEvent) =>
⋮----
// If selected transaction, navigate to history (or we could open edit modal if we had one)
⋮----
onClose(); // In a future iteration, we can deep-link into a history filter.
⋮----
setQuery(e.target.value);
setSelectedIndex(0);
````

## File: src/shell/CustomCategoriesModal.tsx
````typescript
import { useState } from 'react';
import { X, Plus, Trash2, Edit3, Tag as TagIcon } from 'lucide-react';
import { CustomCategoryDef, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
⋮----
interface CustomCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: CustomCategoryDef[];
  onAdd: (def: Omit<CustomCategoryDef, 'id'>) => void;
  onUpdate: (id: string, def: Partial<CustomCategoryDef>) => void;
  onDelete: (id: string) => void;
  transactions?: Transaction[];
  onReassign?: (oldCategoryName: string, newCategoryName: string) => void;
}
⋮----
'#f43f5e', // Rose
'#ec4899', // Pink
'#a855f7', // Purple
'#6366f1', // Indigo
'#3b82f6', // Blue
'#0ea5e9', // Sky
'#06b6d4', // Cyan
'#14b8a6', // Teal
'#10b981', // Emerald
'#22c55e', // Green
'#eab308', // Yellow
'#f59e0b', // Amber
'#f97316', // Orange
'#ef4444', // Red
'#64748b', // Slate
⋮----
// Form state
⋮----
const handleStartAdd = () =>
⋮----
const handleStartEdit = (cat: CustomCategoryDef) =>
⋮----
const handleSave = () =>
⋮----
const handleDeleteAttempt = (cat: CustomCategoryDef) =>
⋮----
// Check if any transactions exist for this category
⋮----
// Auto-select first available alternative category
⋮----
const handleConfirmReassign = () =>
⋮----
{/* Header */}
⋮----
{/* Content */}
⋮----
// REASSIGNMENT VIEW
⋮----
<button onClick=
⋮----
// LIST VIEW
⋮----
// EDIT VIEW
⋮----
color: '#14b8a6', // Default teal
````

## File: src/shell/FeedbackModal.tsx
````typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Star, Bug, Zap } from 'lucide-react';
import { haptic } from '@/lib/haptic';
⋮----
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; message: string; rating: number }) => void;
}
⋮----
const handleSubmit = (e: React.FormEvent) =>
⋮----
// Simulate API call
````

## File: src/shell/IOSInstallModal.tsx
````typescript
import { X, Share, PlusSquare, ArrowUp } from 'lucide-react';
⋮----
interface IOSInstallModalProps {
  onClose: () => void;
}
⋮----
{/* Close button */}
⋮----
{/* Glow effect */}
⋮----
{/* Title */}
⋮----
{/* Steps */}
⋮----
{/* Step 1 */}
⋮----
{/* Step 2 */}
⋮----
{/* Step 3 */}
⋮----
{/* Action Button */}
````

## File: src/shell/MasterMic.tsx
````typescript
/**
 * MasterMic — SpendWise Universal Voice Command FAB (Phase 2)
 *
 * Floating mic button with:
 *  - Animated waveform bars (listening)
 *  - Live transcript + intent badge
 *  - Confirmation dialog for large-amount commands
 *  - Missing-entity prompt display
 *  - Command history panel (last 10)
 *  - Result card with TTS readback (handled by hook)
 *  - ARIA live region for screen readers
 *  - Space-bar shortcut
 */
⋮----
import {
  Mic, Loader2, CheckCircle2, XCircle, Sparkles,
  AlertTriangle, History, ChevronRight,
} from 'lucide-react';
import { MicState } from '@/hooks/useMasterVoice';
import { useVoiceMic } from '@/app/hooks/useVoiceMic';
⋮----
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { MicTranscript } from './components/MicTranscript';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ResultMessage } from './components/ResultMessage';
import { MissingEntityPrompt } from './components/MissingEntityPrompt';
import { HistoryPanel } from './components/HistoryPanel';
import { OnboardingTooltip } from './components/OnboardingTooltip';
⋮----
import { AppView } from '@/types';
⋮----
interface MasterMicProps {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
  variant?: 'fab' | 'header';
}
⋮----
// ── Visual config per state ──────────────────────────────────────────────────
⋮----
// ── Main Component ───────────────────────────────────────────────────────────
⋮----
{/* ── ARIA live region (screen readers) ───────────────────────── */}
⋮----
{/* ── Overlay panel ───────────────────────────────────────────── */}
⋮----
{/* Live transcript */}
⋮----
{/* Missing entity prompt */}
⋮----
{/* Confirmation dialog */}
⋮----
{/* ── History panel ────────────────────────────────────────────── */}
⋮----
{/* ── Trigger button ────────────────────────────────────────────── */}
⋮----
{/* Header Mobile Glass Style */}
⋮----
{/* Header Desktop Surface Style */}
⋮----
{/* Success/Error Dot */}
⋮----
{/* ── Status Strip (FAB only) ────────────────────────────────────── */}
⋮----
{/* History toggle */}
⋮----
{/* Label chip */}
⋮----
{/* Next action hint */}
⋮----
{/* Help toggle (idle state only) */}
⋮----
onClick=
⋮----
{/* ── Onboarding Tooltip (FAB only) ────────────────────────────────────────── */}
````

## File: src/shell/NavTabs.tsx
````typescript
import { AppView } from '@/types';
⋮----
interface NavTabsProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
}
⋮----
// Mobile responsive hiding is maintained, desktop matches the new layout rules
⋮----
{/* Desktop Tabs */}
⋮----
{/* Mobile Bottom Nav */}
⋮----
{/* Active Indicator on Mobile */}
````

## File: src/shell/NotificationCenter.tsx
````typescript
import { useEffect, useRef, useState } from 'react';
import { X, Bell, CheckCheck, ExternalLink, Sparkles, AlarmClock } from 'lucide-react';
import { AppNotification, AlertSeverity, AppView } from '@/types';
⋮----
interface NotificationCenterProps {
  notifications:      AppNotification[];
  unreadCount:        number;
  isOpen:             boolean;
  onClose:            () => void;
  onMarkRead:         (id: string) => void;
  onMarkAllRead:      () => void;
  onNavigate:         (view: AppView) => void;
  onSnooze?:          (id: string, hours: number) => void;
  cloudMode?:         boolean;
}
⋮----
function severityBorderColor(s: AlertSeverity): string
⋮----
function relativeTime(ts: number): string
⋮----
const handleClick = (e: React.MouseEvent) =>
⋮----
// Don't navigate if clicking snooze button
⋮----
{/* Snooze dropdown */}
⋮----
const panelRef = useRef<HTMLDivElement>(null);
⋮----
useEffect(() =>
⋮----
const fn = (e: MouseEvent) =>
⋮----
{/* Backdrop */}
⋮----
{/* Panel */}
⋮----
{/* Header */}
⋮----
{/* Content */}
⋮----
{/* AI Insights Summary */}
⋮----
{/* Footer */}
````

## File: src/shell/OfflineIndicator.tsx
````typescript
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
export function OfflineIndicator()
⋮----
const handleOnline = ()
const handleOffline = ()
````

## File: src/shell/PrivacyShield.tsx
````typescript
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
⋮----
interface PrivacyShieldProps {
  onUnlock?: () => void;
  isLocked?: boolean;
}
⋮----
// Check if user has already unlocked this tab session
⋮----
// If they already unlocked in this browser session, don't show the shield again on mount
⋮----
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
⋮----
try { sessionStorage.removeItem(SESSION_UNLOCKED_KEY); } catch { /* ignore */ }
⋮----
try { sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true'); } catch { /* ignore */ }
⋮----
const MIN_HIDDEN_MS = 30_000; // Only lock if tab was hidden for >30 seconds
⋮----
const handleVisibilityChange = () =>
⋮----
// Only lock if the tab was actually away for >30 seconds (not just a route change)
⋮----
const handleActivity = ()
````

## File: src/shell/PullToRefresh.tsx
````typescript
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { haptic } from '@/lib/haptic';
⋮----
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}
⋮----
const handleTouchStart = (e: TouchEvent) =>
⋮----
const handleTouchMove = (e: TouchEvent) =>
⋮----
// Linear dampening
⋮----
// Haptic feedback when crossing threshold
⋮----
// Prevent scroll
⋮----
const handleTouchEnd = async () =>
⋮----
{/* Refresh Indicator */}
````

## File: src/shell/ServiceWorkerToast.tsx
````typescript
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/haptic';
⋮----
const close = () =>
⋮----
onClick=
````

## File: src/types/dom.ts
````typescript
/**
 * Centralized DOM and Global Type Definitions
 * Used to eliminate 'as any' casts for browser-specific APIs
 */
⋮----
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
⋮----
prompt(): Promise<void>;
⋮----
export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
⋮----
export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
⋮----
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  handler: (response: { razorpay_payment_id?: string }) => void;
  modal: {
    ondismiss: () => void;
  };
}
⋮----
export interface RazorpayInstance {
  open(): void;
}
⋮----
open(): void;
⋮----
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}
⋮----
start(): void;
stop(): void;
abort(): void;
⋮----
interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    MSStream?: any;
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
⋮----
interface Navigator {
    share(data?: ShareData): Promise<void>;
  }
⋮----
share(data?: ShareData): Promise<void>;
````

## File: src/types/shared.ts
````typescript
export type HouseholdPurpose = 'roommates' | 'friends' | 'family' | 'other';
⋮----
export interface HouseholdMember {
  id:   string;
  name: string;
  emoji: string;
  relation?: string;
}
⋮----
export interface HouseholdSettings {
  name:    string;
  purpose: HouseholdPurpose;
  members: HouseholdMember[];
}
⋮----
export type SharedWalletEntryKind = 'contribution' | 'spend_from_pot' | 'withdrawal';
⋮----
export interface SharedWalletEntry {
  id:        string;
  date:      string;
  kind:      SharedWalletEntryKind;
  amount:    number;
  memberId:  string;
  label:     string;
  createdAt: string;
}
⋮----
export interface SharedExpenseSplit {
  memberId:     string;
  sharePercent: number;
}
⋮----
export interface SharedExpense {
  id:              string;
  date:            string;
  label:           string;
  category:        string;
  amount:          number;
  paidByMemberId:  string;
  splits:          SharedExpenseSplit[];
  createdAt:       string;
}
⋮----
export interface SharedGoalContribution {
  id:       string;
  date:     string;
  memberId: string;
  amount:   number;
  note?:    string;
}
⋮----
export interface SharedSavingsGoal {
  id:           string;
  name:         string;
  emoji:        string;
  targetAmount: number;
  targetDate:   string;
  color:        string;
  memberIds:    string[];
  contributions: SharedGoalContribution[];
  createdAt:    string;
}
````

## File: src/types/sync.ts
````typescript
export type SyncView = 
  | 'dashboard' 
  | 'select-source' 
  | 'upi-link' 
  | 'plaid-link' 
  | 'rzp-link' 
  | 'web3-link' 
  | 'pay-form' 
  | 'pay-parsing' 
  | 'pay-success' 
  | 'pay-correction' 
  | 'csv';
⋮----
export type WizardStep = 
  | 'upi-select' 
  | 'upi-credentials' 
  | 'upi-connecting' 
  | 'upi-success';
````

## File: src/ui/Alert.tsx
````typescript
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
⋮----
export function Err(
⋮----
export function Ok(
````

## File: src/ui/Avatar.tsx
````typescript
import React from 'react';
⋮----
export function Avatar(
⋮----
export function EmojiBtn(
````

## File: src/ui/Button.tsx
````typescript
import React from 'react';
⋮----
type BtnVariant = 'primary' | 'ghost' | 'danger' | 'dashed';
⋮----
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  v?: BtnVariant;
  full?: boolean;
}
⋮----
export function Btn(
````

## File: src/ui/Card.tsx
````typescript
import { memo } from 'react';
import { motion } from 'framer-motion';
⋮----
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glass?: boolean;
}
````

## File: src/ui/CategoryDropdown.tsx
````typescript
import { useState, useRef, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Category } from '@/types';
⋮----
interface CategoryDropdownProps {
  value: string;
  onChange: (newCategory: string) => void;
  className?: string;
  placeholder?: string;
}
⋮----
export function CategoryDropdown(
⋮----
function handleClickOutside(event: MouseEvent)
⋮----
// Also check if the click is outside the portal dropdown
⋮----
function handleScroll()
⋮----
width: 192, // w-48 = 12rem = 192px
⋮----
// Use absolute positioning with dynamic top or bottom relying on space
⋮----
onClick=
````

## File: src/ui/EmptyState.tsx
````typescript
import React from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
⋮----
interface EmptyStateProps {
  // New flexible props:
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: { label: string; icon?: React.ReactNode; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  // Legacy props (keep for backward compat):
  onAction?: () => void;
  message?: string;
  subMessage?: string;
}
⋮----
// New flexible props:
⋮----
// Legacy props (keep for backward compat):
⋮----
onAction, message, subMessage  // legacy
⋮----
// Resolve props — new takes priority over legacy:
````

## File: src/ui/ErrorBoundary.tsx
````typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
⋮----
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
⋮----
interface State {
  hasError: boolean;
  error: Error | null;
}
⋮----
public static getDerivedStateFromError(error: Error): State
⋮----
public componentDidCatch(error: Error, errorInfo: ErrorInfo)
⋮----
// Automatically reload on Vite chunk loading errors
````

## File: src/ui/Icons.tsx
````typescript
import React from 'react';
⋮----
interface IcoProps { className?: string; size?: number; }
````

## File: src/ui/Input.tsx
````typescript
import React from 'react';
⋮----
export function Field(
⋮----
export function Inp(props: React.InputHTMLAttributes<HTMLInputElement>)
````

## File: src/ui/PinInput.tsx
````typescript
import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
⋮----
function PinDot(
⋮----
const press = (d: string) =>
````

## File: src/ui/Portal.tsx
````typescript
import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
⋮----
export default function Portal(
````

## File: src/ui/Select.tsx
````typescript
import React from 'react';
⋮----
export function Sel(
````

## File: src/ui/StatusPill.tsx
````typescript
import React from 'react';
⋮----
export function StatusPill(
````

## File: src/ui/Toggle.tsx
````typescript
import React from 'react';
⋮----
export function Toggle(
⋮----
onClick=
````

## File: src/utils/avatar.ts
````typescript
export function initials(name: string)
⋮----
export function avatarColor(name: string)
````

## File: src/utils/imageUtils.ts
````typescript
/**
 * imageUtils.ts
 * Client-side image compression before sending to Gemini API.
 * Reduces image size dramatically to avoid token limits and speed up requests.
 */
⋮----
/**
 * Compresses a base64-encoded image by resizing it to a max dimension
 * and reducing JPEG quality. Returns a new base64 string (WITHOUT the data: prefix).
 */
export async function compressImage(
  base64DataUrl: string,
  maxDimension = 800,
  quality = 0.75
): Promise<
⋮----
// Scale down to maxDimension if needed
````

## File: src/utils/pushNotification.ts
````typescript
export async function requestNotificationPermission(): Promise<boolean>
⋮----
export function sendBrowserNotification(title: string, body: string, icon = '/icons/pwa-192x192.png')
````

## File: src/utils/upiPayment.ts
````typescript
/**
 * UPI Payment Intent Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds native `upi://` deep links that open any installed UPI app on Android
 * (GPay, PhonePe, Paytm, BHIM, etc.) and handles the payment return flow.
 *
 * When user completes payment in the UPI app, it calls the pn (payment notice)
 * URL which can be a page on our domain with query params, or we check URL
 * params on visibilitychange (app resumed) / pageshow.
 *
 * UPI deep link spec:
 *   upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE&tr=TXNREF
 */
⋮----
import { Transaction, Category } from '@/types';
import { parseUPIPayment } from '@/utils/razorpaySync';
⋮----
export interface UPIPaymentParams {
  /** Payee VPA — the merchant's UPI ID e.g. merchant@upi */
  pa: string;
  /** Payee name shown in UPI app */
  pn: string;
  /** Amount in INR (decimal string) */
  am: number;
  /** Transaction note / memo */
  tn?: string;
  /** Transaction reference — generated by us to track the payment */
  tr?: string;
}
⋮----
/** Payee VPA — the merchant's UPI ID e.g. merchant@upi */
⋮----
/** Payee name shown in UPI app */
⋮----
/** Amount in INR (decimal string) */
⋮----
/** Transaction note / memo */
⋮----
/** Transaction reference — generated by us to track the payment */
⋮----
export interface UPIPaymentResult {
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'SUBMITTED';
  transactionId: string;
  transactionRef: string;
  responseCode: string;
  amount: number;
  pa: string;
  pn: string;
  tn: string;
}
⋮----
/** Storage key to persist pending UPI payment metadata across redirect */
⋮----
/** How long (ms) to keep a pending payment before considering it abandoned */
const PENDING_TTL = 15 * 60 * 1000; // 15 minutes
⋮----
export interface PendingUPIPayment {
  tr: string;          // transaction reference
  pa: string;          // payee VPA
  pn: string;          // payee name
  am: number;          // amount
  tn: string;          // note / description
  ts: number;          // timestamp millis when initiated
}
⋮----
tr: string;          // transaction reference
pa: string;          // payee VPA
pn: string;          // payee name
am: number;          // amount
tn: string;          // note / description
ts: number;          // timestamp millis when initiated
⋮----
/**
 * Build a UPI intent URL.
 * Returns both a upi:// URL (works on Android apps) and a web-intent URL.
 */
export function buildUPIUrl(params: UPIPaymentParams, scheme?: string):
⋮----
url: returnUrl,   // merchant callback (not all apps support this)
mc: '0000',        // merchant category code — generic
⋮----
/**
 * Save pending payment to localStorage so we can retrieve it
 * after the user returns from the UPI app.
 */
export function savePendingUPIPayment(payment: PendingUPIPayment)
⋮----
/** Retrieve and clear the saved pending UPI payment */
export function getPendingUPIPayment(): PendingUPIPayment | null
⋮----
export function clearPendingUPIPayment()
⋮----
/**
 * Parse UPI return query parameters from current URL.
 * UPI apps append: Status, txnId, txnRef, responseCode, ApprovalRefNo
 * We also add our own params: upi_status, upi_tr, upi_am, upi_pa, upi_pn, upi_tn
 */
export function parseUPIReturnParams(): UPIPaymentResult | null
⋮----
// Check our own params (appended when we open upi:// with the returnUrl trick)
⋮----
// No UPI params at all
⋮----
/**
 * Convert a UPI payment result into a SpendWise Transaction.
 * Calls AI categorisation for the merchant/note.
 */
export async function upiResultToTransaction(result: UPIPaymentResult): Promise<Transaction>
⋮----
/**
 * Opens a UPI intent link. On Android it launches the UPI app chooser.
 * On desktop/web it offers a fallback.
 */
export function openUPIIntent(upiUrl: string): void
⋮----
// Direct redirect is the safest, most robust way on mobile browsers (Chrome, Safari, etc.)
// It avoids "double intent" triggers and matches browser security policies.
⋮----
// On desktop, try iframe first so we don't navigate to an invalid scheme page
⋮----
// Fallback if iframe didn't prompt anything
⋮----
/**
 * All-in-one: initiate a UPI payment.
 * Saves the pending payment, builds URL, opens intent.
 */
export function initiateUPIPayment(params: UPIPaymentParams, scheme?: string): string
⋮----
// Save pending payment for return detection
⋮----
// Open UPI app
⋮----
/** List of common UPI-enabled apps with their deep link app packages (Android) */
````

## File: src/app/MainShell.tsx
````typescript
import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';
⋮----
import Sidebar from '@/shell/Sidebar';
import Header from '@/shell/Header';
import type { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ViewRenderer } from '@/app/ViewRenderer';
import { useAppState } from '@/hooks/useAppState';
import { useAutomations } from '@/features/recurring/hooks/useAutomations';
import { useStore } from '@/store';
import ServiceWorkerToast from '@/shell/ServiceWorkerToast';
import { haptic } from '@/lib/haptic';
import { useUPIReturn } from '@/hooks/useUPIReturn';
import { Shield } from 'lucide-react';
⋮----
import { useAppEnvironment } from '@/app/hooks/useAppEnvironment';
import { usePWAInstall } from '@/app/hooks/usePWAInstall';
import { useAppTheme } from '@/app/hooks/useAppTheme';
import { useAppNavigation } from '@/app/hooks/useAppNavigation';
import { useShakeFeedback } from '@/app/hooks/useShakeFeedback';
⋮----
interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  (config: SpendWiseConfig) => void;
  userId:     string | null;
  initialView?: AppView;
}
⋮----
// ── Global UPI Return Detection ─────────────────────────────────────────
⋮----
// Safety check: ensure tx is a valid transaction object, not a browser event
⋮----
// If privacy is active and we want to disable it, simulate biometric check
⋮----
// Simulate "Authenticating..."
⋮----
const handleGlobalKeyDown = (e: KeyboardEvent) =>
⋮----
const handleQuickAddEvent = () =>
⋮----
// Handle incoming share target at startup:
⋮----
{/* WCAG: Skip to Content Link */}
⋮----
<ParentalPinGate onContinueAsKid=
⋮----
<KidModeBanner onParentLogin=
⋮----
onContinueAsKid=
⋮----
onOpenQuickAdd=
⋮----
resetData=
⋮----
{/* Floating Action Button handled by Sidebar */}
⋮----
onSubmit=
````

## File: src/db/backup.ts
````typescript
import { exportDB, importDB } from 'dexie-export-import';
import { db } from '@/db/db';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
/**
 * Exports the entire Dexie database to a JSON Blob.
 */
export const exportDatabase = async (): Promise<Blob> =>
⋮----
/**
 * Downloads the exported database as a JSON file.
 */
export const downloadDatabaseBackup = async () =>
⋮----
/**
 * Imports a JSON file into the Dexie database, overwriting existing data.
 */
export const importDatabase = async (file: File) =>
⋮----
// Overwrite existing data
await db.delete(); // Delete current DB
await db.open(); // Re-open fresh DB
⋮----
// After importing Dexie tables, we need to refresh the Zustand store
// Since Zustand's persist reads from db.keyval on init, we can force a reload
````

## File: src/db/db.ts
````typescript
import Dexie, { Table } from 'dexie';
import { 
  Transaction, 
  CustomCategoryDef, 
  Budget, 
  SavingsGoal, 
  SharedWalletEntry,
  SharedExpense,
  HouseholdSettings,
  AssetEntry,
  LiabilityEntry
} from '@/types';
⋮----
export interface AppConfig {
  id: string; // usually 'app-config'
  theme: 'dark' | 'light';
  onboardingCompleted: boolean;
  currency: string;
}
⋮----
id: string; // usually 'app-config'
⋮----
export class SpendWiseDatabase extends Dexie
⋮----
householdSettings!: Table<HouseholdSettings, string>; // Since id is optional in HouseholdSettings, we might use a fixed key
⋮----
constructor()
⋮----
// Define tables and indexes
// Note: only index fields you want to query by.
// '&id' means it's a primary key and unique.
⋮----
budgets: 'category', // category string is unique enough for budget (since it maps to Category type)
⋮----
householdSettings: 'name', // or some fixed id
````

## File: src/db/migration.ts
````typescript
import { db } from '@/db/db';
import { useStore } from '@/store';
⋮----
export const runDexieMigration = async () =>
⋮----
// Check if Dexie has any transactions
⋮----
// Try to read from localStorage
⋮----
// We can use a transaction to ensure all or nothing
````

## File: src/features/advisor/AdvisorView.tsx
````typescript
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Bot, Send, User, Sparkles, TrendingDown, TrendingUp, AlertTriangle, X, Trash2, Mic, MicOff, Zap } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { SpendingPersonality } from '@/types';
import { getFinancialAdvice, getSpendingPersonality, ConversationMessage } from '@/insights/advisor';
import { useCurrency } from '@/contexts/CurrencyContext';
import EducationCards from '@/features/education/components/EducationCards';
import { SpeechRecognition, SpeechRecognitionEvent } from '@/types/dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AdvisorViewMobile from '@/features/advisor/AdvisorViewMobile';
import { isSupabaseConfigured } from '@/services/supabase';
⋮----
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import { Message, MessageData } from './types';
⋮----
interface AdvisorViewProps {
  onNavigate?: (view: any) => void;
}
⋮----
// Persist messages in localStorage
⋮----
} catch { /* ignore */ }
⋮----
// Persist messages whenever they change
⋮----
} catch { /* ignore */ }
⋮----
setIsLoading(true); // show typing dots before first token
⋮----
// Map messages to ConversationMessage format
⋮----
// Finalise: extract [ACTION:...] tag and set proper type
⋮----
// Proactive Daily Briefing
⋮----
// Auto-send after voice input
⋮----
const toggleListening = () =>
⋮----
const handleAnalyzePersonality = async () =>
⋮----
const handleClearChat = () =>
⋮----
{/* Sidebar - Desktop Only */}
⋮----
{/* Quick Stats Mini-Card */}
⋮----
{/* Main Chat Area */}
⋮----
{/* Header */}
⋮----
{/* Personality Card */}
⋮----
onClick=
⋮----
{/* Empty state for new users */}
⋮----
{/* Messages */}
⋮----
{/* Insights Bar */}
⋮----
{/* Quick Actions & Input */}
````

## File: src/features/advisor/AdvisorViewMobile.tsx
````typescript
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Mic, MicOff, Trash2, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/contexts/CurrencyContext';
import { haptic } from '@/lib/haptic';
⋮----
interface AdvisorViewMobileProps {
  messages: any[];
  onSend: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  toggleListening: () => void;
  onClearChat: () => void;
  monthlyStats: any;
  dynamicQuickActions: string[];
  hasGemini: boolean;
  onNavigate?: (view: any) => void;
}
⋮----
const handleSend = () =>
⋮----
{/* 1. Header */}
⋮----
onClick=
⋮----
{/* 2. Chat Area */}
⋮----

⋮----
{/* 3. Quick Actions */}
⋮----
{/* 4. Input Area */}
⋮----
onChange=
````

## File: src/features/analytics/components/BalanceChart.tsx
````typescript
import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts';
import { BalanceDataPoint } from '@/types';
import { useStore } from '@/store';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
⋮----
interface BalanceChartProps {
  data: BalanceDataPoint[];
  currency?: string;
}
⋮----
{/* Visually hidden screen reader summary */}
⋮----
{/* Header */}
⋮----
{/* Legend */}
````

## File: src/features/analytics/components/SpendingDonut.tsx
````typescript
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySpend } from '@/types';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
⋮----
interface SpendingDonutProps {
  data: CategorySpend[];
  totalSpent: number;
  currency?: string;
}
⋮----
{/* Visually hidden screen reader summary */}
⋮----
{/* Category list — Finebank style row list */}
````

## File: src/features/dashboard/components/DashboardHeroDesktop.tsx
````typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Shield } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats, BalanceDataPoint } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface DashboardHeroProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  monthlyStats: MonthlyStats;
  balanceTrend: BalanceDataPoint[];
  healthScore: number;
  currency?: string;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}
⋮----
function getGreeting(): string
⋮----
function getHealthLabel(score: number):
⋮----
export default function DashboardHeroDesktop({
  currentBalance,
  monthlyStats,
  balanceTrend,
  healthScore,
  currency = '₹',
  hideBalances = false,
  onTogglePrivacy,
}: DashboardHeroProps)
⋮----
? 'linear-gradient(135deg, #064e3b 0%, #022c22 40%, #0f172a 100%)' // Emerald glow
⋮----
? 'linear-gradient(135deg, #042f2e 0%, #0f172a 60%, #020617 100%)' // Teal/Slate glow
⋮----
? 'linear-gradient(135deg, #451a03 0%, #1e1b4b 65%, #0f172a 100%)' // Amber/Indigo glow
: 'linear-gradient(135deg, #450a0a 0%, #0f172a 70%, #020617 100%)', // Burgundy glow
⋮----
{/* Glossy overlay */}
⋮----
{/* Animated mesh overlay - Keep on desktop */}
⋮----
{/* Subtle grid pattern */}
⋮----
{/* Content */}
⋮----
{/* Top row: greeting + sparkline */}
⋮----
{/* Greeting chip */}
⋮----
{/* Balance label */}
⋮----
{/* Big animated number */}
⋮----
{/* Trend indicator */}
⋮----
{/* Sparkline & Privacy Toggle */}
⋮----
e.stopPropagation();
onTogglePrivacy();
haptic.light();
⋮----
{/* Divider */}
⋮----
{/* Bottom row: mini-stats + health bar */}
⋮----
{/* Mini stats */}
⋮----
{/* Income */}
⋮----
{/* Divider */}
⋮----
{/* Expenses */}
⋮----
{/* Divider */}
⋮----
{/* Net */}
⋮----
{/* Health score bar */}
````

## File: src/features/dashboard/components/DashboardHeroMobile.tsx
````typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Shield } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats, BalanceDataPoint } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface DashboardHeroProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  monthlyStats: MonthlyStats;
  balanceTrend: BalanceDataPoint[];
  healthScore: number;
  currency?: string;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}
⋮----
function getHealthLabel(score: number):
⋮----
export default function DashboardHeroMobile({
  currentBalance,
  monthlyStats,
  balanceTrend,
  healthScore,
  currency = '₹',
  hideBalances = false,
  onTogglePrivacy,
}: DashboardHeroProps)
⋮----
? 'linear-gradient(135deg, #064e3b 0%, #022c22 45%, #0f172a 100%)' // Emerald
⋮----
? 'linear-gradient(135deg, #042f2e 0%, #0f172a 70%, #020617 100%)' // Teal/Slate
⋮----
? 'linear-gradient(135deg, #451a03 0%, #1e1b4b 65%, #0f172a 100%)' // Amber/Indigo
: 'linear-gradient(135deg, #450a0a 0%, #0f172a 75%, #020617 100%)', // Burgundy
⋮----
{/* Simplified Mobile Content */}
⋮----
{/* Top: Balance and Actions */}
⋮----
e.stopPropagation();
onTogglePrivacy();
haptic.medium();
⋮----
{/* Divider */}
⋮----
{/* Middle: Mini Stats */}
⋮----
{/* Bottom: Health Score */}
````

## File: src/features/dashboard/components/WeeklyDigestCard.tsx
````typescript
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface WeeklyDigestCardProps {
  transactions: Transaction[];
  currency?: string;
}
⋮----
interface Insight {
  id: string;
  type: 'alert' | 'positive' | 'neutral' | 'tip';
  title: string;
  description: string;
  metric?: string;
  badge?: string;
  icon: any;
  color: string;
}
⋮----
// ─── 1. Category surges & totals ──────────────────────────────────────────
⋮----
// Insight A: General spend trend comparison
⋮----
// Insight B: Top category surge
⋮----
// ─── 2. Weekend Spike analysis ────────────────────────────────────────────
⋮----
// ─── 3. No-Spend Streak analysis ──────────────────────────────────────────
⋮----
// ─── 4. Default Smart Tips if empty ───────────────────────────────────────
⋮----
const handleNext = () =>
⋮----
const handlePrev = () =>
⋮----
{/* Dynamic Metric Display */}
````

## File: src/features/dashboard/DashboardView.tsx
````typescript
import { useState, lazy, Suspense, useMemo } from 'react';
import { AppView } from '@/types';
import { FinanceState } from '@/types/state';
import { useTransactions } from '@/hooks/useTransactions';
import { useGamification } from '@/features/gamification/hooks/useGamification';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import LevelProgress from '@/features/gamification/components/LevelProgress';
import DashboardHero from '@/features/dashboard/components/DashboardHero';
import MagicInput from '@/features/ai/components/MagicInput';
import PullToRefresh from '@/shell/PullToRefresh';
import { haptic } from '@/lib/haptic';
import StatCard from '@/features/dashboard/components/StatCard';
import { Sparkles, TrendingUp, TrendingDown, Wallet, Target, ChevronDown, ChevronUp } from 'lucide-react';
⋮----
import RecentTransactions from '@/features/dashboard/components/RecentTransactions';
import GoalsSummary from '@/features/dashboard/components/GoalsSummary';
import DailyStats from '@/features/dashboard/components/DailyStats';
import { SafeToSpend } from '@/features/dashboard/components/SafeToSpend';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useIsMobile } from '@/hooks/useMediaQuery';
import DashboardViewMobile from '@/features/dashboard/DashboardViewMobile';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { AIInsights } from '@/features/dashboard/components/AIInsights';
import { useBudgets } from '@/hooks/useBudgets';
import { getProactiveNudge } from '@/insights/advisor';
⋮----
// Lazy load non-critical/heavy components
⋮----
const WidgetSkeleton = ()
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────
⋮----
const handleRefresh = async () =>
⋮----
{/* Header */}
⋮----
{/* AI Insights - Hidden on mobile unless expanded to save space */}
⋮----
<button onClick=
⋮----
{/* Core Dashboard Hero */}
⋮----
{/* ── LEFT COLUMN ─────────────────────────────────────────── */}
⋮----
{/* Level Progress */}
⋮----
{/* Stat Cards - Hidden on Mobile because DashboardHeroMobile already shows this data! */}
⋮----
{/* Weekly Digest - Desktop or Expanded Mobile */}
⋮----
{/* Quick Add Panel - Very important, keep prominent */}
⋮----
onQuickInput=
⋮----
{/* Recent Transactions - Keep prominent */}
⋮----
{/* Mobile "Show More" Button */}
⋮----
onClick=
⋮----
{/* Expanded Mobile / Standard Desktop Widgets */}
⋮----
{/* Hide the rest of the right column on mobile unless expanded */}
````

## File: src/features/dashboard/DashboardViewMobile.tsx
````typescript
import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView } from '@/types';
import { FinanceState } from '@/types/state';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { haptic } from '@/lib/haptic';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { getProactiveNudge } from '@/insights/advisor';
import { useGamification } from '@/features/gamification/hooks/useGamification';
⋮----
import { MobileBalanceHero } from './components/MobileBalanceHero';
import { SnapCardRow } from './components/SnapCardRow';
import { MobileRecentTransactions } from './components/MobileRecentTransactions';
⋮----
// Lazy-load heavy components so they don't block initial paint
⋮----
// ─── Types ────────────────────────────────────────────────────────────────────
⋮----
interface DashboardViewMobileProps {
  financeState:     FinanceState;
  onAdd:            (tx: any) => void;
  currency:         string;
  onNavigate:       (view: AppView) => void;
  hideBalances?:    boolean;
  config:           SpendWiseConfig | null;
}
⋮----
// ─── Main component ───────────────────────────────────────────────────────────
⋮----
// Pull data for snap row
⋮----
// ── Render ────────────────────────────────────────────────────────────────
⋮----
{/* ── 1. Balance hero card ───────────────────────────────────────── */}
⋮----
{/* ── 1.5. Proactive Nudge ───────────────────────────────────────── */}
⋮----
<button onClick=
⋮----
{/* ── 2. Horizontal snap row ─────────────────────────────────────── */}
⋮----
{/* ── 3. Recent Transactions ─────────────────────────────────────── */}
⋮----
{/* ── 4. Gamification progress (lazy) ───────────────────────────── */}
⋮----
{/* ── 5. Quick Add bottom sheet ──────────────────────────────────── */}
⋮----
onClick=
⋮----
{/* Drag handle */}
⋮----
onAdd=
````

## File: src/features/goals/components/GoalCard.tsx
````typescript
import { useEffect, useState } from 'react';
import { Calendar, DollarSign, Plus, Edit3, Trash2, Coins, Clock, Target } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { ProgressRing } from '@/features/goals/components/ProgressRing';
import { STATUS_CONFIG } from '@/features/goals/components/constants';
import { daysUntil, formatDate } from '@/features/goals/components/utils';
import { ContributeModal } from '@/features/goals/components/ContributeModal';
import confetti from 'canvas-confetti';
⋮----
const ROUNDUP_KEY = (id: string) => `spendwise_roundup_$
const MILESTONE_KEY = (id: string) => `spendwise_milestone_$
⋮----
// Persist round-up toggle per goal in localStorage
⋮----
const toggleRoundUp = () =>
⋮----
try { localStorage.setItem(ROUNDUP_KEY(goal.id), String(next)); } catch { /* ignore */ }
⋮----
const handleContribute = (amount: number) =>
⋮----
// Milestone confetti at 25%, 50%, 75%
⋮----
try { localStorage.setItem(MILESTONE_KEY(goal.id), JSON.stringify(fired)); } catch { /* ignore */ }
⋮----
break; // one at a time
⋮----
// Time to completion estimate
⋮----
// Estimated monthly round-up savings: avg ₹0.40 spare change × ~25 transactions/month
const estMonthlyRoundUp = 10; // conservative ₹10/mo estimate
⋮----
{/* Colour tint background (§5 GoalCard gradient tint) */}
⋮----
{/* Countdown + time estimate row */}
⋮----
{/* Round-up active indicator */}
⋮----
onClick=
⋮----
onClose=
````

## File: src/features/goals/GoalsView.tsx
````typescript
import { useState, useEffect } from 'react';
import { Target, Plus, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SavingsGoal, GoalStatus } from '@/types';
import { GoalModal, GoalFormData } from '@/features/goals/components/GoalModal';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { GoalsSummary } from '@/features/goals/components/GoalsSummary';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { useGamification } from '@/features/gamification/hooks/useGamification';
⋮----
import { useIsMobile } from '@/hooks/useMediaQuery';
import GoalsViewMobile from '@/features/goals/GoalsViewMobile';
⋮----
interface GoalStats {
  activeCount:      number;
  achievedCount:    number;
  totalTarget:      number;
  totalSaved:       number;
  overallPercent:   number;
  monthlyCommitted: number;
}
⋮----
type GoalInput = Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>;
⋮----
interface GoalsViewProps {
  goals:        SavingsGoal[];
  stats:        GoalStats;
  onAdd:        (data: GoalInput) => void;
  onUpdate:     (id: string, data: Partial<SavingsGoal>) => void;
  onDelete:     (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  currency?:    string;
  transactions?: any[];
}
⋮----
const handleOpenAdd = ()
⋮----
const handleAdd = (form: GoalFormData) =>
⋮----
const handleEdit = (form: GoalFormData) =>
⋮----
// Sort: active first (on-track, at-risk, paused), then achieved
⋮----
{/* Header */}
⋮----
{/* Summary stats */}
⋮----
{/* Active Goals grid */}
⋮----
onContribute=
⋮----
{/* ── Hall of Fame — Achieved Goals ── */}
⋮----
{/* Achievement Badge Gallery */}
⋮----
{/* Add modal */}
````

## File: src/features/portfolio/components/NetWorthEvolution.tsx
````typescript
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Transaction } from '@/types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
⋮----
interface NetWorthEvolutionProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
// Sort transactions by date
⋮----
// Group by date to show balance at end of each day
⋮----
// Only show percentage when initial is meaningful (abs > 10); cap at ±999%
⋮----
: null; // null = not meaningful enough to show
````

## File: src/features/profile/ProfileView.tsx
````typescript
import { User, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { exportCSV } from '@/utils/export';
import { Transaction } from '@/types';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import IOSInstallModal from '@/shell/IOSInstallModal';
⋮----
import ProfileForm from '@/features/profile/components/ProfileForm';
import { CurrencySelector } from '@/features/profile/components/CurrencySelector';
import { DataManagement } from '@/features/profile/components/DataManagement';
import SecureExportModal from '@/features/profile/components/SecureExportModal';
import RestoreModal from '@/features/profile/components/RestoreModal';
import ResetConfirmModal from '@/features/profile/components/ResetConfirmModal';
import { AccessibilitySection } from '@/features/profile/components/AccessibilitySection';
import { NotificationsSection } from '@/features/profile/components/NotificationsSection';
import { useProfileView } from '@/features/profile/components/useProfileView';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { FamilySafetySection } from '@/features/profile/components/FamilySafetySection';
⋮----
interface ProfileViewProps {
  config:         SpendWiseConfig | null;
  onUpdateConfig: (cfg: SpendWiseConfig) => void;
  onResetData:    () => void;
  transactions:   Transaction[];
  onNavigate?:    (view: any) => void;
  addNotification?: (notif: any) => void;
}
⋮----
import { useIsMobile } from '@/hooks/useMediaQuery';
import ProfileViewMobile from '@/features/profile/ProfileViewMobile';
⋮----
onAvatarClick=
⋮----
onOpenSecureExport=
onOpenRestore=
⋮----

⋮----
{/* Header */}
⋮----
{/* Avatar Upload */}
⋮----
{/* Profile Form */}
⋮----
{/* Currency Selector */}
⋮----
{/* Data Management */}
⋮----
onOpenResetConfirm=
⋮----
{/* Accessibility */}
⋮----
{/* Family & Safety */}
⋮----
{/* Notifications */}
⋮----
{/* App Footer */}
⋮----
{/* Modals */}
````

## File: src/features/profile/ProfileViewMobile.tsx
````typescript
import React from 'react';
import { 
  User, ShieldCheck, DownloadCloud, CheckCircle2, Camera, 
  ChevronRight, Globe, Bell, Smartphone, Database, Lock, 
  Smartphone as PhoneIcon, MapPin, Briefcase, CreditCard
} from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { haptic } from '@/lib/haptic';
⋮----
interface ProfileViewMobileProps {
  name: string;
  avatar: string | null;
  occupation: string;
  location: string;
  monthlyGoal: string;
  currency: string;
  config: SpendWiseConfig | null;
  onAvatarClick: () => void;
  onNavigate: (view: string) => void;
  isAppInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  triggerInstall: () => void;
  // Sections (Passed as pre-rendered components for simplicity/state management)
  profileForm: React.ReactNode;
  currencySelector: React.ReactNode;
  dataManagement: React.ReactNode;
  accessibility: React.ReactNode;
  notifications: React.ReactNode;
  transactionsCount: number;
}
⋮----
// Sections (Passed as pre-rendered components for simplicity/state management)
⋮----
{/* 1. Profile Hero */}
⋮----
onClick=
⋮----
{/* 2. Quick Stats Grid */}
⋮----
{/* 3. Settings Sections */}
⋮----
{/* Personal Details */}
⋮----
{/* Preferences & Localization */}
⋮----
{/* Accessibility & Experience */}
⋮----
{/* Family & Controls */}
⋮----
{/* Data Management */}
⋮----
{/* Notifications */}
⋮----
{/* 4. App Info & Install */}
````

## File: src/features/subscriptions/components/SubscriptionManager.tsx
````typescript
import { useState } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign, Calendar, Plus, Zap, Clock } from 'lucide-react';
import { RecurringPattern } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import AddSubscriptionModal from '@/features/subscriptions/components/AddSubscriptionModal';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SubscriptionCalendar } from '@/features/subscriptions/components/SubscriptionCalendar';
import { useSubscriptionManager } from '@/features/subscriptions/hooks/useSubscriptionManager';
⋮----
interface SubscriptionManagerProps {
  patterns:  RecurringPattern[];
  currency?: string;
}
⋮----
function getServiceColor(name: string): string
⋮----
function getServiceInitials(name: string): string
⋮----
{/* Header */}
⋮----
onClick=
⋮----
{/* Stat Cards */}
⋮----
{/* Upcoming this week alert */}
⋮----
{/* Calendar View */}
⋮----
{/* Annual Summary */}
````

## File: src/features/sync/components/CloudSync.tsx
````typescript
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, CloudOff, LogIn, LogOut, RefreshCw, CheckCircle2,
  AlertTriangle, Lock, Mail, Eye, EyeOff, Loader2, Database,
  ArrowUpDown, Wifi, WifiOff
} from 'lucide-react';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  syncAll,
  pushGamification,
  SupabaseUser,
} from '@/services/supabase';
import { useStore } from '@/store';
import { Transaction } from '@/types';
⋮----
function loadSession(): SupabaseUser | null
function saveSession(u: SupabaseUser | null)
⋮----
interface CloudSyncProps {
  transactions: Transaction[];
  onPullTransactions: (txs: Transaction[]) => void;
}
⋮----
function formatSyncTime(dateStr: string | null): string
⋮----
const handleAuth = async (isSignUp: boolean) =>
⋮----
const handleSignOut = async () =>
⋮----
if (user) { try { await signOut(user.access_token); } catch { /**/ } }
⋮----
<code className="text-[length:var(--fs-overline)] font-mono text-[var(--teal)] block break-all whitespace-pre-wrap">VITE_SUPABASE_URL=https://xxx.supabase.co</code>
⋮----
{/* Header */}
⋮----
{/* Auth Forms */}
⋮----
onChange=
⋮----
onClick=
⋮----
{/* Not signed in — CTA */}
⋮----
<button onClick=
⋮----
{/* Signed in — sync panel */}
⋮----
{/* Stats strip */}
⋮----
{/* Sync result */}
⋮----
{/* Info footer */}
````

## File: src/features/transactions/components/TransactionRow.tsx
````typescript
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, X, Tag } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Transaction, Category } from '@/types';
import { CategoryDropdown } from '@/ui/CategoryDropdown';
import { haptic } from '@/lib/haptic';
import { useCategories } from '@/hooks/useCategories';
⋮----
export interface TransactionRowProps {
  tx: Transaction;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onDelete?: (id: string) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
}
⋮----
// Long press handling for mobile native feel
⋮----
const startPress = () =>
⋮----
const endPress = () =>
⋮----
onClick=
⋮----
haptic.success();
onCategoryChange?.(tx.id, cat);
setShowCategorySwapper(false);
⋮----
{/* Background Actions (Delete on Left drag, Category on Right drag) */}
⋮----
{/* Swiping Right → Reveals Category trigger on the left */}
⋮----
{/* Swiping Left → Reveals Delete trigger on the right */}
⋮----
if (onDelete) onDelete(tx.id);
````

## File: src/features/transactions/HistoryView.tsx
````typescript
import { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from '@/shell/PullToRefresh';
import { haptic } from '@/lib/haptic';
import { useStore } from '@/store';
⋮----
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import BulkActionHeader from '@/features/transactions/components/BulkActionHeader';
import { HistoryToolbar } from '@/features/transactions/components/HistoryToolbar';
import { DeleteConfirmModal } from '@/features/transactions/components/DeleteConfirmModal';
import { useTransactionHistory } from '@/features/transactions/hooks/useTransactionHistory';
import { useIsMobile } from '@/hooks/useMediaQuery';
import HistoryViewMobile from '@/features/transactions/HistoryViewMobile';
⋮----
// Re-export types for consumers that still import from this file
⋮----
interface HistoryViewProps {
  transactions:          Transaction[];
  onCategoryChange?:     (id: string, newCategory: Category) => void;
  onBulkCategoryChange?: (ids: string[], newCategory: Category) => void;
  onDelete?:             (id: string) => void;
  onBulkDelete?:         (ids: string[]) => void;
  onImportClick?:        () => void;
  onPDFReport?:          () => void;
  currency?:             string;
  initialSearchQuery?:   string;
}
⋮----
// Create a visible subset of transactions that excludes pending deletes
⋮----
// Auto-commit on unmount
⋮----
const handleInterceptDelete = (id: string) =>
⋮----
const handleUndoDelete = () =>
⋮----
const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleRefresh = async () =>
⋮----
{/* Page Header */}
⋮----
{/* Table Card */}
⋮----
onBulkDelete=
⋮----
{/* Floating Undo Delete Toast Overlay */}
⋮----
{/* Import Toast */}
⋮----
onConfirm=
````

## File: src/features/transactions/HistoryViewMobile.tsx
````typescript
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { Virtuoso } from 'react-virtuoso';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  ChevronRight,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/lib/haptic';
import EmptyState from '@/ui/EmptyState';
import TransactionRow from './components/TransactionRow';
⋮----
interface HistoryViewMobileProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  currency?: string;
  onCategoryChange?: (id: string, newCategory: Category) => void;
}
⋮----
type DisplayRow =
    | { type: 'header'; date: string; subtotal: number }
    | { type: 'tx'; tx: Transaction };
⋮----
const handleRowClick = (tx: Transaction) =>
⋮----
// Detail view or edit could go here
⋮----
{/* 1. Header with Quick Stats */}
⋮----
{/* Search Bar */}
⋮----
onChange=
⋮----
{/* 2. Category Chips */}
⋮----
onClick=
⋮----
selected=
⋮----
setSelectedIds(prev => {
                    const next = new Set(prev);
````

## File: src/hooks/useTheme.ts
````typescript
import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '@/types';
⋮----
function loadTheme(): ThemeMode
⋮----
// Respect system preference on first visit
⋮----
} catch { /* ignore */ }
⋮----
// ─── Apply theme to <html> element ────────────────────────────────────────────
// We toggle a class on <html> that CSS variables are keyed to.
⋮----
function applyTheme(mode: ThemeMode)
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useTheme()
⋮----
// Apply on mount and whenever theme changes
⋮----
} catch { /* ignore */ }
````

## File: src/insights/advisor.ts
````typescript
/**
 * advisor.ts — Greatly Improved SpendWise AI Advisor
 *
 * Improvements over original:
 *  1. Multi-turn conversation context — Gemini receives the last 6 messages
 *     so follow-up questions ("why?" "what should I cut?") work correctly.
 *  2. Full financial briefing sent to Gemini — not just totals, but category
 *     breakdown, top merchants, month-over-month trend, savings rate trend,
 *     subscription burn, and anomaly flag count.
 *  3. Proactive nudge engine — returns a nudge string when urgent conditions
 *     are met (over-budget, goal falling behind, streak at risk, large anomaly).
 *  4. Spending personality — 7 archetypes with 7-day challenges.
 *  5. Local fallback is now a full rule engine (20+ rules) that covers all
 *     common financial question types with specific, data-driven answers.
 *  6. Action tags extended: ADD_TRANSACTION, VIEW_BUDGET, VIEW_GOALS,
 *     VIEW_SUBSCRIPTIONS, VIEW_HISTORY, EXPORT_REPORT added.
 */
⋮----
import { callGemini } from "../services/gemini";
import { Transaction } from "../types";
⋮----
// ─── Types ────────────────────────────────────────────────────────────────────
⋮----
export interface ConversationMessage {
  role:    "user" | "model";
  content: string;
}
⋮----
export interface FinancialBriefing {
  totalIncome:       number;
  totalSpent:        number;
  net:               number;
  savingsRate:       number;
  topCategories:     { name: string; amount: number; percent: number }[];
  topMerchants:      { name: string; amount: number }[];
  subscriptionTotal: number;
  transactionCount:  number;
  avgDailySpend:     number;
  largestExpense:    { merchant: string; amount: number; category: string } | null;
  unusualCount:      number;   // anomaly count
  monthLabel:        string;
}
⋮----
unusualCount:      number;   // anomaly count
⋮----
export interface GeneratedQuest {
  id:          string;
  title:       string;
  description: string;
  reward:      string;
  type:        "category" | "uncategorized" | "budget" | "streak" | "savings" | "logging";
  completed:   boolean;
}
⋮----
export interface SpendingPersonalityResult {
  archetype:   string;
  emoji:       string;
  description: string;
  challenge:   string;
  tip:         string;
}
⋮----
// ─── Financial Briefing Builder ───────────────────────────────────────────────
⋮----
export function buildBriefing(
  transactions: Transaction[],
  currency = "₹"
): FinancialBriefing
⋮----
// Use all transactions (not just this month) for richer context
⋮----
// Category breakdown
⋮----
// Top merchants
⋮----
// Subscription spend
⋮----
// Daily average (last 30 days)
⋮----
// Largest single expense
⋮----
unusualCount: 0, // caller can pass actual anomaly count if available
⋮----
// ─── System Prompt Builder ────────────────────────────────────────────────────
⋮----
function buildSystemPrompt(briefing: FinancialBriefing, currency: string): string
⋮----
// ─── Main Advisor Function ────────────────────────────────────────────────────
⋮----
/**
 * getFinancialAdvice
 * @param query        - The user's current message
 * @param transactions - All transactions
 * @param history      - Previous messages in the conversation (for multi-turn context)
 * @param currency     - Currency symbol (default ₹)
 */
export async function getFinancialAdvice(
  query:        string,
  transactions: Transaction[],
  history:      ConversationMessage[] = [],
  currency = "₹"
): Promise<string>
⋮----
// ── Try Gemini with full conversation context ─────────────────────
⋮----
// Build multi-turn contents array
⋮----
// Keep last 6 messages for context (3 user + 3 model turns)
⋮----
// Inject system context as the first user turn + model acknowledgement
⋮----
// Current user message
⋮----
// Pass system instruction via system_instruction field (Gemini 2.0 supports this)
⋮----
// Fall through to local engine
⋮----
// ── Local rule-based fallback (20+ rules) ────────────────────────
⋮----
// ─── Local Advisor (Full Rule Engine) ────────────────────────────────────────
⋮----
function localAdvisor(
  query:    string,
  b:        FinancialBriefing,
  currency: string
): string
⋮----
const C    = (v: number) => `$
⋮----
// Guard: no data
⋮----
// ── Topic detection ───────────────────────────────────────────────
⋮----
// Budget / deficit
⋮----
// Savings / save more
⋮----
// Spending breakdown / where did my money go
⋮----
// Largest expense
⋮----
// Subscriptions
⋮----
// Health score / financial health
⋮----
// Income
⋮----
// Export / report
⋮----
// Goals
⋮----
// Anomaly / unusual
⋮----
// Merchant-specific questions
⋮----
// EMI / loan / debt
⋮----
// Tax
⋮----
// Advice / tips / help
⋮----
// Non-finance question guard
⋮----
// General catch-all
⋮----
// ─── Proactive Nudge Engine ───────────────────────────────────────────────────
⋮----
export interface ProactiveNudge {
  message: string;
  action:  string;
  urgency: "low" | "medium" | "high";
}
⋮----
/**
 * Returns the single most urgent nudge, or null if everything is fine.
 * Call this on dashboard load to surface a contextual alert strip.
 */
export function getProactiveNudge(
  transactions: Transaction[],
  budgets:      Record<string, { limit: number; spent: number }>,
  goals:        { name: string; savedAmount: number; targetAmount: number; targetDate: string }[],
  streak:       number,
  currency = "₹"
): ProactiveNudge | null
⋮----
// 1. Critical deficit
⋮----
// 2. Budget nearly exceeded (>90%)
⋮----
// 3. Goal falling behind
⋮----
// 4. Streak at risk (no transaction logged today)
⋮----
// 5. High subscription spend (>15% of income)
⋮----
return null; // All good — show nothing
⋮----
// ─── Spending Personality ─────────────────────────────────────────────────────
⋮----
export function getSpendingPersonality(
  transactions: Transaction[],
  currency = "₹"
): SpendingPersonalityResult
⋮----
// Not enough data
⋮----
// Personality detection logic
⋮----
// ─── Quest Generator (unchanged from original, kept here for co-location) ─────
⋮----
export function generateQuests(
  transactions: Transaction[],
  currency = "₹"
): GeneratedQuest[]
````

## File: src/lib/exportPDF.ts
````typescript
import { Transaction, MonthlyStats, Budget, SavingsGoal } from '@/types';
⋮----
interface PDFReportData {
  transactions: Transaction[];
  monthlyStats:  MonthlyStats;
  budgets:       Budget[];
  goals:         SavingsGoal[];
  currency:      string;
  month:         string; // e.g. "April 2026"
}
⋮----
month:         string; // e.g. "April 2026"
⋮----
// ─── Inline styles (no external CSS needed for print window) ───────────────────
⋮----
function fmt(currency: string, amount: number): string
⋮----
function pct(val: number, total: number): string
⋮----
// ─── Category aggregation ──────────────────────────────────────────────────────
⋮----
function aggregateByCategory(txs: Transaction[]):
⋮----
// ─── HTML template ─────────────────────────────────────────────────────────────
⋮----
function buildHTML(data: PDFReportData): string
⋮----
// ── Transaction rows (top 20 for PDF readability) ──────────────────────────
⋮----
// ── Budget rows ────────────────────────────────────────────────────────────
⋮----
// ── Goals rows ─────────────────────────────────────────────────────────────
⋮----
// ── Category breakdown rows ────────────────────────────────────────────────
⋮----
// ─── Public API ────────────────────────────────────────────────────────────────
⋮----
export function generatePDFReport(data: PDFReportData): void
⋮----
// Give browser a moment to render before auto-focusing
````

## File: src/services/supabase.ts
````typescript
/**
 * SpendWise — Supabase Integration Layer
 *
 * Production-ready Supabase client + sync utilities.
 * To activate: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *
 * SQL Schema (run once in Supabase SQL editor):
 * ──────────────────────────────────────────────
 * create table if not exists public.transactions (
 *   id           text primary key,
 *   user_id      uuid references auth.users(id) on delete cascade,
 *   date         text not null,
 *   amount       numeric not null,
 *   type         text not null check (type in ('debit','credit')),
 *   category     text not null,
 *   merchant     text not null,
 *   description  text,
 *   tags         text[],
 *   confidence   numeric,
 *   ai_parsed    boolean default false,
 *   created_at   timestamptz default now()
 * );
 *
 * create table if not exists public.gamification (
 *   user_id      uuid primary key references auth.users(id) on delete cascade,
 *   total_xp     int default 0,
 *   level        int default 1,
 *   streak       int default 0,
 *   last_active  text,
 *   updated_at   timestamptz default now()
 * );
 *
 * -- Row-level security
 * alter table public.transactions enable row level security;
 * create policy "own rows" on public.transactions
 *   using (auth.uid() = user_id);
 *
 * alter table public.gamification enable row level security;
 * create policy "own row" on public.gamification
 *   using (auth.uid() = user_id);
 */
⋮----
import { Transaction } from '@/types';
⋮----
// ─── Config ──────────────────────────────────────────────────────────────────
⋮----
// ─── Lightweight REST client (no npm package required) ───────────────────────
async function supabaseRequest(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<any>
⋮----
// ─── Auth ─────────────────────────────────────────────────────────────────────
⋮----
export interface SupabaseUser {
  id: string;
  email: string;
  access_token: string;
}
⋮----
export async function signUpWithEmail(email: string, password: string): Promise<SupabaseUser>
⋮----
export async function signInWithEmail(email: string, password: string): Promise<SupabaseUser>
⋮----
export async function signOut(token: string): Promise<void>
⋮----
// ─── Transactions ─────────────────────────────────────────────────────────────
⋮----
/** Upload local transactions to Supabase (upsert on id conflict) */
export async function pushTransactions(
  transactions: Transaction[],
  userId: string,
  token: string,
): Promise<void>
⋮----
// Batch in chunks of 500
⋮----
/** Pull all transactions for user from Supabase */
export async function pullTransactions(
  userId: string,
  token: string,
  since?: string, // ISO date string
): Promise<Transaction[]>
⋮----
since?: string, // ISO date string
⋮----
// ─── Gamification sync ────────────────────────────────────────────────────────
⋮----
export interface GamificationState {
  totalXP: number;
  level: number;
  streak: number;
  lastActive: string;
}
⋮----
export async function pushGamification(
  state: GamificationState,
  userId: string,
  token: string,
): Promise<void>
⋮----
export async function pullGamification(
  userId: string,
  token: string,
): Promise<GamificationState | null>
⋮----
// ─── Full sync (bidirectional) ────────────────────────────────────────────────
⋮----
export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}
⋮----
/**
 * Bidirectional sync:
 * 1. Push all local transactions not in cloud
 * 2. Pull all cloud transactions not in local
 * Returns counts for UI feedback
 */
export async function syncAll(
  localTransactions: Transaction[],
  userId: string,
  token: string,
  lastSyncDate?: string,
): Promise<
⋮----
// Push local → cloud
⋮----
// Pull cloud → local
````

## File: src/shell/Header.tsx
````typescript
import React from 'react';
import { Bell, ChevronRight, Moon, Sun, User, Search, Eye, EyeOff } from 'lucide-react';
import { AppView } from '@/types';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { MasterMic } from '@/shell/MasterMic';
⋮----
interface HeaderProps {
  activeView:            AppView;
  unreadCount:           number;
  onToggleNotifications: () => void;
  onNavigate:            (view: AppView) => void;
  currency:              string;
  currentBalance:        number;
  theme:                 'light' | 'dark';
  onToggleTheme:         () => void;
  config?:               SpendWiseConfig | null;
  onOpenSearch?:         () => void;
  isPrivacyEnabled?:     boolean; // Kept for backwards compatibility if needed
  onTogglePrivacy?:      () => void; // Kept for backwards compatibility if needed
  onExport?:             () => void;
  setSearchQuery?:       (q: string) => void;
}
⋮----
isPrivacyEnabled?:     boolean; // Kept for backwards compatibility if needed
onTogglePrivacy?:      () => void; // Kept for backwards compatibility if needed
⋮----
function getGreeting()
⋮----
/* ── helpers for responsive styles ── */
⋮----
{/* ─── MOBILE background: flat high-performance gradient (no separate compositing blur layers) ─── */}
⋮----
{/* ─── DESKTOP background: plain white/card ─── */}
⋮----
{/* ─── Content row ─── */}
⋮----
{/* Left — Greeting / Page Title */}
⋮----
onNavigate('dashboard');
⋮----
{/* Mobile: white bold text - Simplified for Dashboard to save space */}
⋮----
{/* Desktop: themed text */}
⋮----
{/* Mobile date */}
⋮----
{/* Desktop date */}
⋮----
{/* Right — Action buttons */}
⋮----
{/* Theme toggle - Visible on all viewports */}
⋮----
{/* Privacy toggle - Visible on all devices */}
⋮----
{/* Global Search */}
⋮----
onOpenSearch?.();
⋮----
{/* Master Voice Mic */}
⋮----
{/* Notification bell */}
⋮----
{/* User Avatar */}
⋮----
/* Mobile: white ring; desktop: teal glow */
⋮----
{/* Tooltip */}
````

## File: src/shell/QuickAddModal.tsx
````typescript
import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import MagicInput from '@/features/ai/components/MagicInput';
import { Transaction } from '@/types';
import { haptic } from '@/lib/haptic';
⋮----
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
  transactions: Transaction[];
}
⋮----
{/* Backdrop */}
⋮----
{/* Modal Container */}
⋮----
{/* Focus Trap Anchor (Top) */}
⋮----
// Focus the close button if tabbed backwards from modal start
⋮----
{/* Pull Bar (Android/iOS style) - Click & drag trigger */}
⋮----
{/* Header */}
⋮----
haptic.light();
onClose();
⋮----
{/* Body */}
⋮----
haptic.success();
onAdd(tx);
⋮----
{/* Bottom keyboard spacer */}
⋮----
{/* Focus Trap Anchor (Bottom) */}
⋮----
// Focus the magic input if tabbed forward from modal end
````

## File: src/store/slices/portfolioSlice.ts
````typescript
import { StateCreator } from 'zustand';
import { AssetEntry, LiabilityEntry } from '@/types';
import { SpendWiseStore } from '@/store/index';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface PortfolioSlice {
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  addAsset: (asset: Omit<AssetEntry, 'id' | 'lastUpdated'>) => void;
  updateAsset: (id: string, data: Partial<AssetEntry>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<LiabilityEntry, 'id' | 'lastUpdated'>) => void;
  updateLiability: (id: string, data: Partial<LiabilityEntry>) => void;
  deleteLiability: (id: string) => void;
}
⋮----
export const createPortfolioSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], PortfolioSlice> = (set) => (
````

## File: src/types/state.ts
````typescript
import { Transaction, Category, MonthlyStats, MonthlyHistoryPoint, CategorySpend, BalanceDataPoint, RecurringPattern, SavingsGoal, Budget, BudgetPeriod } from '@/types/finance';
import { SpendingAlert, AppNotification, AppView } from '@/types/ui';
import { SpendWiseStore, ParentalControlState } from '@/store';
import { CustomCategoryDef } from '@/types/index';
⋮----
export interface FinanceState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  addTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkUpdateTransactionsCategory: (ids: string[], newCategory: Category) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  resetData: () => void;
  currentBalance: number;
  predictedEndOfMonth: number;
  categorySpending: CategorySpend[];
  totalSpent: number;
  balanceTrend: BalanceDataPoint[];
  dailySpendRate: number;
  monthlyStats: MonthlyStats;
  monthlyHistory: MonthlyHistoryPoint[];
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality: 'low' | 'medium' | 'high';
    expectedChange: number;
  };
  topCategory: CategorySpend | null;
}
⋮----
export interface BudgetState {
  budgets: Record<string, number>;
  budgetStats: Budget[];
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  totalBudgeted: number;
  overallBudgetPercent: number;
  monthlyExpenses: number;
  budgetSettings: {
    period: BudgetPeriod;
    rolloverEnabled: boolean;
  };
  updateBudgetSettings: (settings: Partial<BudgetState['budgetSettings']>) => void;
  resetBudgets: () => void;
  resetLimits: () => void;
  totalSpentAgainstBudget: number;
  overBudgetCount: number;
  periodLabel: string;
  updatePeriod: (p: BudgetPeriod) => void;
  toggleRollover: () => void;
}
⋮----
export interface GoalsState {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (id: string, amount: number) => Promise<void>;
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  goalStats: {
    onTrack: number;
    atRisk: number;
    achieved: number;
  };
  stats: {
    activeCount: number;
    achievedCount: number;
    totalTarget: number;
    totalSaved: number;
    overallPercent: number;
    monthlyCommitted: number;
  };
}
⋮----
export interface CategoryState {
  customCategories: CustomCategoryDef[];
  allCategories: string[];
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  addCustomCategory: (def: Omit<CustomCategoryDef, 'id'>) => void;
  updateCustomCategory: (id: string, def: Partial<CustomCategoryDef>) => void;
  deleteCustomCategory: (id: string) => void;
  suggestedCategories: string[];
  categoryLimits: Record<string, number>;
}
⋮----
export interface AlertState {
  alerts: SpendingAlert[];
  alertCount: number;
  dangerCount: number;
  warningCount: number;
  dismissAlert: (id: string) => void;
  dismissAll: () => void;
  clearDismissed: () => void;
}
⋮----
export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  snoozeNotification: (id: string, hours?: number) => void;
  dismissNotification: (id: string) => void;
}
⋮----
export interface AppState {
  currency: string;
  transactions: Transaction[];
  financeState: FinanceState;
  budgetState: BudgetState;
  goalsState: GoalsState;
  categoryState: CategoryState;
  recurringData: RecurringPattern[];
  alertState: AlertState;
  notifState: NotificationState;
  parentalState: ParentalControlState;
}
````

## File: src/ui/Modal.tsx
````typescript
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
⋮----
/**
 * Focusable element selectors for the focus-trap implementation.
 * We avoid a full package dependency and implement a lightweight trap inline.
 */
⋮----
// Prevent body scroll and trap focus
⋮----
// Save the element that triggered the modal so we can restore focus on close
⋮----
// Focus the first focusable element inside the modal
⋮----
// Restore focus to the triggering element
⋮----
// Handle Escape key + focus-trap on Tab
⋮----
const handleKeyDown = (e: KeyboardEvent) =>
⋮----
// Shift+Tab → wrap to last
⋮----
// Tab → wrap to first
⋮----
{/* Backdrop */}
⋮----
{/* Card */}
````

## File: src/ui/SkeletonLoader.tsx
````typescript
import React from 'react';
⋮----
type SkeletonVariant = 'dashboard' | 'list' | 'chart' | 'goals' | 'budget' | 'analytics';
⋮----
interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  className?: string;
}
⋮----
// ─── Reusable shimmer block ───────────────────────────────────────────────────
⋮----
// ─── Variant renderers ────────────────────────────────────────────────────────
⋮----
{/* Hero card */}
⋮----
{/* Stat row */}
⋮----
{/* Two col layout */}
⋮----
{/* Bar chart skeleton */}
⋮----
{/* Legend */}
⋮----
{/* Summary bar */}
⋮----
{/* Budget rows */}
⋮----
{/* Tabs */}
⋮----
{/* Donut + bar grid */}
⋮----
{/* Heatmap placeholder */}
⋮----
// ─── Main export ──────────────────────────────────────────────────────────────
````

## File: src/utils/export.ts
````typescript
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export function exportCSV(transactions: Transaction[])
⋮----
export function exportJSON(transactions: Transaction[])
````

## File: src/utils/import.ts
````typescript
import { Transaction } from '@/types';
⋮----
/**
 * Validates and parses a JSON file containing an array of transactions.
 * Returns the valid transactions and any errors encountered.
 */
export async function parseTransactionsJSON(file: File): Promise<
⋮----
// Basic validation
````

## File: src/utils/share.ts
````typescript
import { Transaction } from '@/types';
⋮----
export const shareTransactions = async (transactions: Transaction[], currency: string = '$') =>
````

## File: src/data/lessons.ts
````typescript
export interface Lesson {
  id: string;
  title: string;
  summary: string;
  readingTime: number; // minutes
  xpReward: number;
  level: number;  // min level to unlock
  icon: string;
  color: string;
  category: 'budgeting' | 'investing' | 'debt' | 'mindset' | 'advanced';
  body: string[];  // paragraphs
  keyTakeaways: string[];
  roles?: ('student' | 'professional' | 'business')[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}
⋮----
readingTime: number; // minutes
⋮----
level: number;  // min level to unlock
⋮----
body: string[];  // paragraphs
````

## File: src/data/mockData.ts
````typescript
import { Transaction, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// ─── Helpers ──────────────────────────────────────────────────────────────────
⋮----
function daysAgo(n: number): string
⋮----
/** Replaces ALL occurrences of every {key} in a template string */
export function applyTemplate(
  template: string,
  vars: Record<string, string | number>
): string
⋮----
// Use a global regex so ALL occurrences are replaced
⋮----
// ─── Category Metadata ────────────────────────────────────────────────────────
⋮----
// ─── Initial Mock Transactions ─────────────────────────────────────────────────
⋮----
/** Net effect of bundled demo transactions (for balance anchor when using sample data). */
⋮----
/** Category keyword detection map */
⋮----
// ─── Main Parser ───────────────────────────────────────────────────────────────
⋮----
export function parseTransaction(text: string): Transaction
⋮----
// --- Amount extraction ---
// Handles: "$45", "$1,200.50", "45.99", "USD 45"
⋮----
// --- Income detection ---
⋮----
// --- Category detection ---
⋮----
// --- Merchant detection ---
// Try: "at <Merchant>", quoted name, or fallback to map
⋮----
// ─── AI Insight Templates ──────────────────────────────────────────────────────
// Uses {placeholder} syntax — applyTemplate() replaces ALL occurrences safely
````

## File: src/data/portfolioConfig.ts
````typescript
import { AssetType, LiabilityType } from '@/types';
⋮----
export function getAssetCfg(type: AssetType)
⋮----
export function getLiabilityCfg(type: LiabilityType)
````

## File: src/features/shared/SharedView.tsx
````typescript
import React, { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { useSharedWallets } from '@/features/shared/hooks/useSharedWallets';
import { useAuth } from '@/hooks/useAuth';
import { SharedGoal } from '@/features/shared/hooks/useSharedWallets';
⋮----
import { Ico } from '@/ui/Icons';
import { Btn } from '@/ui/Button';
import { Err } from '@/ui/Alert';
import { CreateGroupModal, InviteModal, WalletModal, ExpenseModal, GoalModal, ContribModal, GroupQRModal, ConnectCohortModal } from '@/features/shared/components/SharedModals';
import { WalletTab, ExpensesTab, GoalsTab, MembersTab, ActivityTab } from '@/features/shared/components/SharedTabs';
import { SharedOverview } from '@/features/shared/components/SharedOverview';
import { InviteBanner, EmptyState, GroupSelector } from '@/features/shared/components/SharedGroups';
import { Activity, Share2, Scan, Plus, Users, Target, Wallet } from 'lucide-react';
import { haptic } from '@/lib/haptic';
⋮----
type Tab = 'wallet' | 'expenses' | 'goals' | 'members' | 'activity';
⋮----
function ArrowRightLeftIcon(
⋮----
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
⋮----
constructor(props:
super(props);
⋮----
if (this.state.error)
⋮----
<EmptyState onCreateGroup=
⋮----
onClick=
⋮----
<CreateGroupModal show=
⋮----
<GroupQRModal     show=
````

## File: src/lib/voiceCommands/fallbackPatterns.ts
````typescript
/**
 * Fallback Patterns — SpendWise Master Voice Engine
 *
 * Contains regex patterns for local command parsing when Gemini is unavailable.
 */
⋮----
import { VoiceCommand, VoiceIntent, VoiceEntities, AppView } from '@/lib/voiceCommands/types';
⋮----
// Utility for Indian Number Parsing and Category normalization is still in main commandParser.ts
// We import them from there in the actual implementation, but here we define the patterns.
⋮----
export interface Pattern {
  intent: VoiceIntent;
  regex: RegExp;
  extract: (match: RegExpMatchArray, transcript: string, helpers: any) => VoiceEntities;
  summarize: (entities: VoiceEntities) => string;
  confidence: number;
}
⋮----
// ── HELP ───────────────────────────────────────────────────────────────────
⋮----
// ── REPORT EXPORT ───────────────────────────────────────────────────────────
⋮----
// ── QUERY REPORT ────────────────────────────────────────────────────────────
⋮----
// ── BUDGET UPDATE ───────────────────────────────────────────────────────────
⋮----
// Matches "set budget for food to 500" OR "500 on budget for food" OR "burget 500 for food"
⋮----
// Avoid capturing the action verb as category
⋮----
// ── TRANSACTION ADD ─────────────────────────────────────────────────────────
⋮----
// Now even more flexible: matches "200 on food" or "paid 200" or "food 200"
⋮----
// ── UNDO LAST COMMAND ────────────────────────────────────────────────────────
⋮----
// ── NAVIGATE ────────────────────────────────────────────────────────────────
⋮----
// ── SETTINGS TOGGLE ────────────────────────────────────────────────────────
````

## File: src/lib/voiceCommands/types.ts
````typescript
/**
 * Voice Command Types — SpendWise Master Voice Engine
 * Defines all intents, entities, and result structures.
 */
⋮----
export type VoiceIntent =
  | 'BUDGET_UPDATE'
  | 'BUDGET_DELETE'
  | 'BUDGET_RESET'
  | 'BUDGET_SETTINGS_UPDATE'
  | 'TRANSACTION_ADD'
  | 'TRANSACTION_UPDATE'
  | 'TRANSACTION_DELETE'
  | 'LIABILITY_ADD'
  | 'LIABILITY_PAY'
  | 'LIABILITY_DELETE'
  | 'PORTFOLIO_UPDATE'
  | 'PORTFOLIO_ADJUST'
  | 'PORTFOLIO_DELETE'
  | 'GOAL_ADD'
  | 'GOAL_UPDATE'
  | 'GOAL_DELETE'
  | 'SUBSCRIPTION_ADD'
  | 'SUBSCRIPTION_UPDATE'
  | 'SUBSCRIPTION_DELETE'
  | 'RECURRING_ADD'
  | 'RECURRING_DELETE'
  | 'REPORT_EXPORT'
  | 'QUERY_REPORT'
  | 'BATCH_TRANSACTIONS'
  | 'TRANSACTION_BULK_DELETE'
  | 'TRANSACTION_BULK_UPDATE'
  | 'SETTINGS_TOGGLE'
  | 'PARENTAL_TOGGLE'
  | 'PARENTAL_LIMIT_SET'
  | 'PARENTAL_RESTRICT_CATEGORY'
  | 'PARENTAL_APPROVE_TX'
  | 'PARENTAL_DENY_TX'
  | 'SESSION_LOCK'
  | 'DATA_QUERY'
  | 'QUEST_ACTION'
  | 'QUEST_CLAIM'
  | 'SEARCH_ACTION'
  | 'NAVIGATE'
  | 'UNDO_ACTION'
  | 'HELP'
  | 'UNKNOWN';
⋮----
export type AppView =
  | 'dashboard'
  | 'analytics'
  | 'budget'
  | 'goals'
  | 'shared'
  | 'history'
  | 'sync'
  | 'profile'
  | 'portfolio'
  | 'subscriptions';
⋮----
export interface VoiceEntities {
  category?: string;       // "food", "transport", "fuel"
  amount?: number;         // 1200, 200000
  targetAmount?: number;   // for goal deposits, liability payments
  previousAmount?: number; // for "from X to Y" patterns
  name?: string;           // merchant, liability name, goal name
  period?: string;         // "yesterday", "today", "this month"
  ticker?: string;         // investment name / symbol
  view?: AppView;          // for navigation commands
  frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
  type?: 'debit' | 'credit';
  items?: Array<{ amount?: number; category?: string; name?: string }>; // for batching
  settingKey?: string;     // "dark mode", "privacy", "currency"
  settingValue?: string;   // "on", "off", "usd", "inr"
  searchQuery?: string;    // "rent", "starbucks"
  actionType?: string;     // "start", "check", "claim"
}
⋮----
category?: string;       // "food", "transport", "fuel"
amount?: number;         // 1200, 200000
targetAmount?: number;   // for goal deposits, liability payments
previousAmount?: number; // for "from X to Y" patterns
name?: string;           // merchant, liability name, goal name
period?: string;         // "yesterday", "today", "this month"
ticker?: string;         // investment name / symbol
view?: AppView;          // for navigation commands
⋮----
items?: Array<{ amount?: number; category?: string; name?: string }>; // for batching
settingKey?: string;     // "dark mode", "privacy", "currency"
settingValue?: string;   // "on", "off", "usd", "inr"
searchQuery?: string;    // "rent", "starbucks"
actionType?: string;     // "start", "check", "claim"
⋮----
export interface VoiceCommand {
  intent: VoiceIntent;
  entities: VoiceEntities;
  confidence: number;      // 0–1
  rawTranscript: string;
  summary: string;         // human-readable description of action
}
⋮----
confidence: number;      // 0–1
⋮----
summary: string;         // human-readable description of action
⋮----
export interface CommandResult {
  success: boolean;
  message: string;
  undoable?: boolean;
}
````

## File: src/services/gemini.ts
````typescript
import { isSupabaseConfigured } from '@/services/supabase';
⋮----
interface GeminiCallParams {
  contents: any[];
  generationConfig?: any;
  system_instruction?: any;
}
⋮----
/**
 * Universal Gemini caller for SpendWise.
 * Dynamically routes queries:
 * 1. Safe Production Proxy: Calls Supabase Edge Function proxy (GAP-B) if Supabase is configured.
 * 2. Local Fallback: Direct call to Google APIs if local VITE_GEMINI_API_KEY is present in dev.
 */
export async function callGemini(params: GeminiCallParams): Promise<any>
⋮----
/**
 * Streaming Gemini caller — yields text chunks as they arrive from the API.
 * Falls back to a single-chunk yield when streaming is not available (e.g. Supabase proxy).
 */
⋮----
// Supabase proxy doesn't support SSE streaming — fall back to batch call and yield full text
⋮----
// Each SSE event is separated by "\n\n"; lines starting with "data: " carry the JSON
⋮----
// Incomplete JSON chunk — skip
````

## File: src/shell/Sidebar.tsx
````typescript
import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { AppView } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/lib/haptic';
import { useStore } from '@/store';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ALL_NAV_ITEMS, MOBILE_BOTTOM_IDS } from './navigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileDrawer } from './components/MobileDrawer';
⋮----
interface SidebarProps {
  activeView:      AppView;
  onViewChange:    (view: AppView) => void;
  overBudgetCount: number;
  showInstall?:    boolean;
  onInstall?:      () => void;
  config:          SpendWiseConfig | null;
  theme?:          'light' | 'dark';
  onToggleTheme?:  () => void;
  onOpenQuickAdd?: () => void;
}
⋮----
export default function Sidebar({
  activeView, onViewChange, overBudgetCount, config,
  showInstall, onInstall, theme, onToggleTheme, onOpenQuickAdd,
}: SidebarProps)
⋮----
// Close drawer on view change
⋮----
// Lock scroll when drawer open
⋮----
// Filter nav items based on user role and mode
⋮----
const navigate = (view: AppView) =>
⋮----
{/* Desktop spacer — keeps main content from sitting under sidebar */}
⋮----
{/* MOBILE — bottom nav */}
⋮----
{/* Left 2 items */}
⋮----
{/* Centre FAB */}
⋮----
{/* Right 2 items */}
⋮----
{/* More button */}
````

## File: src/store/slices/securedSlice.ts
````typescript
import { StateCreator } from 'zustand';
import { SavingsGoal } from '@/types';
import { SharedStorage } from '@/lib/crdt';
import { SpendWiseStore } from '@/store/index';
⋮----
export interface VaultData {
  total: number;
  count: number;
  history: { date: string; amount: number; merchant: string }[];
  sweptIds?: string[];
}
⋮----
export interface UserPreferences {
  fontSize: string;
  darkMode: boolean;
  highContrast: boolean;
  hapticsEnabled: boolean;
  shakeEnabled: boolean;
  biometricEnabled: boolean;
  avatar: string | null;
}
⋮----
export interface SecuredSlice {
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) => void;
  
  sharedData: SharedStorage;
  setSharedData: (data: SharedStorage | ((prev: SharedStorage) => SharedStorage)) => void;
  
  merchantMemory: Record<string, { merchant: string; category: string }>;
  setMerchantMemory: (
    mem:
      | Record<string, { merchant: string; category: string }>
      | ((
          prev: Record<string, { merchant: string; category: string }>
        ) => Record<string, { merchant: string; category: string }>)
  ) => void;
  
  readNotificationIds: string[];
  setReadNotificationIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  
  snoozedNotifications: Record<string, number>;
  setSnoozedNotifications: (
    snoozed: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;

  // BUG-02 fix: Round-Up Vault moved from localStorage to encrypted IDB
  roundUpVault: VaultData;
  setRoundUpVault: (vault: VaultData | ((prev: VaultData) => VaultData)) => void;

  userPreferences: UserPreferences;
  setUserPreferences: (
    prefs: UserPreferences | ((prev: UserPreferences) => UserPreferences)
  ) => void;
}
⋮----
// BUG-02 fix: Round-Up Vault moved from localStorage to encrypted IDB
⋮----
export const createSecuredSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  SecuredSlice
> = (set) => (
⋮----
// BUG-02 fix: vault migrated from localStorage to encrypted IDB
````

## File: src/types/gamification.ts
````typescript
import { Category } from "@/types/finance";
⋮----
export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  xpReward: number;
  category?: Category;
  targetAmount?: number;
  progress: number;
  completed: boolean;
  type: 'saving' | 'spending' | 'habit' | 'milestone';
  icon: string;
}
⋮----
export type Rank = 'Novice' | 'Saver' | 'Budget Baron' | 'Wealth Wizard' | 'Infinity Tycoon';
⋮----
export interface GamificationStats {
  totalXP: number;
  level: number;
  rank: Rank;
  streak: number;
  lastActive: string;
}
````

## File: src/types/index.ts
````typescript
export interface CustomCategoryDef {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthlyLimit?: number;
}
````

## File: src/types/portfolio.ts
````typescript
export type AssetType = 'bank' | 'investment' | 'crypto' | 'property' | 'business' | 'education' | 'other';
export type LiabilityType = 'loan' | 'credit_card' | 'mortgage' | 'student_loan' | 'business_loan' | 'other';
export type FinanceProvider = 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'bhim' | 'razorpay' | 'plaid' | 'web3' | 'other';
⋮----
export interface AssetEntry {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
  lastUpdated: string;
}
⋮----
export interface LiabilityEntry {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  interestRate?: number; // Annual percentage rate
  minPayment?: number;
  currency?: string;
  icon?: string;
  lastUpdated: string;
}
⋮----
interestRate?: number; // Annual percentage rate
⋮----
export interface LinkedAccount {
  id: string;
  provider: FinanceProvider;
  upiId: string;
  linkedAt: string;
  lastSynced: string;
  status: 'active' | 'error' | 'disconnected';
}
````

## File: src/utils/merchantMapper.ts
````typescript
import { Category } from '@/types';
⋮----
/**
 * Smart Merchant Mapper
 * Automatically predicts categories based on merchant names
 */
⋮----
// Food & Dining
⋮----
// Shopping
⋮----
// Transport
⋮----
// Entertainment
⋮----
// Utilities
⋮----
// Professional / Business
⋮----
// Education
⋮----
export function predictCategory(merchant: string): Category
⋮----
// Exact matches
⋮----
// Partial matches
⋮----
// Default fallback based on keywords
````

## File: src/constants/index.ts
````typescript
/**
 * SpendWise — Global Constants
 * Single source of truth for all magic strings, numbers, and feature flags.
 */
⋮----
// ─── localStorage Keys ────────────────────────────────────────────────────────
⋮----
// ─── Financial Defaults ───────────────────────────────────────────────────────
⋮----
PRICE_HIKE_THRESHOLD:     0.10,   // 10% increase triggers alert
⋮----
// ─── Gamification Thresholds ──────────────────────────────────────────────────
⋮----
XP_LEVEL_MULTIPLIER:  100,       // level N requires N * 100 XP
⋮----
// ─── Feature Flags ────────────────────────────────────────────────────────────
// Set these via .env (VITE_FEATURE_*) for runtime configuration.
// BUG-M01 fix: guard `window` access so this module is safe to import in tests / edge workers
⋮----
// ─── App Metadata ─────────────────────────────────────────────────────────────
````

## File: src/contexts/CurrencyContext.tsx
````typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants';
⋮----
export type CurrencyCode = '$' | '€' | '£' | '₹' | '¥' | 'A$' | 'C$' | 'AED';
⋮----
interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  activeCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  format: (amount: number, currency?: CurrencyCode) => string;
  setActiveCurrency: (code: CurrencyCode) => void;
}
⋮----
// Simulated rates relative to USD (1.0)
⋮----
export const CurrencyProvider: React.FC<
⋮----
} catch { /* ignore */ }
return '₹'; // Default to Rupees as requested
⋮----
} catch { /* ignore */ }
⋮----
const handleConfigChange = () =>
⋮----
} catch { /* ignore */ }
⋮----
const convert = (amount: number, from: CurrencyCode = baseCurrency, to: CurrencyCode = activeCurrency) =>
⋮----
// Convert to USD first, then to target
⋮----
const format = (amount: number, currency: CurrencyCode = activeCurrency) =>
⋮----
}).format(converted).replace(/[A-Z]{3}/, currency); // Replace ISO with our custom symbol if needed
⋮----
const getISOCode = (code: CurrencyCode): string =>
⋮----
export const useCurrency = () =>
````

## File: src/hooks/useCategories.tsx
````typescript
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CustomCategoryDef } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/data/mockData';
import { useStore } from '@/store';
⋮----
interface CategoryContextType {
  customCategories: CustomCategoryDef[];
  allCategories: string[];
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  addCustomCategory: (def: Omit<CustomCategoryDef, 'id'>) => void;
  updateCustomCategory: (id: string, def: Partial<CustomCategoryDef>) => void;
  deleteCustomCategory: (id: string) => void;
  suggestedCategories: string[];
  categoryLimits: Record<string, number>;
}
⋮----
export function CategoryProvider(
⋮----
} catch { /* ignore */ }
⋮----
const hashStr = (str: string) =>
⋮----
export function useCategories()
````

## File: src/hooks/useMasterVoice.ts
````typescript
/**
 * useMasterVoice — SpendWise Master Voice Input Hook (Phase 2)
 *
 * Manages the Web Speech API recording lifecycle:
 *  - Streams interim transcript text
 *  - Validates missing entities before execution
 *  - Requires confirmation for large-amount commands (>₹50k)
 *  - Maintains a 10-entry command history with undo support
 *  - Reads back results via TTS (Web Speech Synthesis)
 *  - Enforces 800ms cooldown between activations
 */
⋮----
import { useState, useRef, useCallback } from 'react';
import { parseVoiceCommand, getMissingEntityPrompt, requiresConfirmation } from '@/lib/voiceCommands/commandParser';
import { executeCommand } from '@/lib/voiceCommands/commandRouter';
import { VoiceCommand, CommandResult } from '@/lib/voiceCommands/types';
import { speak } from '@/lib/voiceCommands/tts';
import { haptic } from '@/lib/haptic';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}
⋮----
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
⋮----
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
  abort(): void;
}
⋮----
start(): void;
stop(): void;
abort(): void;
⋮----
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}
⋮----
export type MicState = 'idle' | 'listening' | 'processing' | 'confirm' | 'awaiting' | 'success' | 'error';
⋮----
export interface HistoryEntry {
  command: VoiceCommand;
  result: CommandResult;
  timestamp: number;
}
⋮----
import { AppView } from '@/types';
⋮----
interface UseMasterVoiceOptions {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
interface UseMasterVoiceReturn {
  state: MicState;
  transcript: string;
  command: VoiceCommand | null;
  result: CommandResult | null;
  missingPrompt: string | null;
  pendingConfirm: VoiceCommand | null;
  history: HistoryEntry[];
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  confirm: () => void;
  cancelConfirm: () => void;
  undo: () => void;
  reset: () => void;
}
⋮----
// SpeechRecognition types handled via (window as any)
⋮----
export function useMasterVoice(
⋮----
// ── Helpers ───────────────────────────────────────────────────────────────
⋮----
// ── Public API ────────────────────────────────────────────────────────────
⋮----
/** Execute a parsed command, handle TTS, history, and auto-reset. */
⋮----
// Handle undo via special NAVIGATE view='UNDO'
⋮----
// Pop the last entry (visual only — store undo is TODO Phase 3)
⋮----
// TTS readback
⋮----
/** Confirm a pending high-value command. */
⋮----
/** Undo the most recent successful command (exposed for UI button too). */
⋮----
// Check mic permission first
⋮----
} catch { /* permissions API not supported, proceed anyway */ }
⋮----
// Cooldown guard
⋮----
// Clear previous run
⋮----
try { recognition.start(); return; } catch { /* already stopped */ }
⋮----
// Missing entity check
⋮----
// Confirmation required for large amounts
⋮----
return; // Don't auto-reset — wait for user
````

## File: src/hooks/useNotifications.ts
````typescript
import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { AppNotification, SpendingAlert, RecurringPattern, SavingsGoal, AlertSeverity } from '@/types';
import { sendBrowserNotification } from '@/utils/pushNotification';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// ─── Icon mapping ──────────────────────────────────────────────────────────────
⋮----
function severityIcon(s: AlertSeverity): string
⋮----
function freqIcon(f: RecurringPattern['frequency']): string
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useNotifications(
  alerts:    SpendingAlert[],
  recurring: RecurringPattern[],
  goals:     SavingsGoal[],
)
⋮----
// ── Build unified notification list ────────────────────────────────────────
⋮----
// 1. Spending alerts
⋮----
// 2. Upcoming recurring charges (due in next 7 days)
⋮----
// 3. Goal milestone notifications
⋮----
// 4. Custom transient notifications
⋮----
// Filter out currently snoozed
⋮----
// Sort: unread first, then by timestamp desc
⋮----
// ── Actions ────────────────────────────────────────────────────────────────
⋮----
/** Snooze a notification for `hours` hours (default 1h) */
⋮----
// Also mark as read so it doesn't show on un-snooze in unread bucket
⋮----
/** Permanently dismiss a notification (only for custom ones) */
⋮----
// Also mark snoozed forever
````

## File: src/hooks/usePWAInstall.ts
````typescript
import { useState, useEffect } from 'react';
import { BeforeInstallPromptEvent } from '@/types/dom';
⋮----
export function usePWAInstall()
⋮----
const handleBeforeInstallPrompt = (e: Event) =>
⋮----
// Prevent the mini-infobar from appearing on mobile
⋮----
// Stash the event so it can be triggered later.
⋮----
const handleAppInstalled = () =>
⋮----
// Log install to analytics or clear state
⋮----
// Check if it's already installed globally (standalone mode)
⋮----
const triggerInstall = async () =>
⋮----
// Show the install prompt
⋮----
// Wait for the user to respond to the prompt
⋮----
// We've used the prompt, and can't use it again, throw it away
````

## File: src/hooks/useTransactions.ts
````typescript
import { useMemo, useCallback } from 'react';
import { CategorySpend, MonthlyStats, BalanceDataPoint, Transaction, Category, MonthlyHistoryPoint } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
import { FINANCE_DEFAULTS } from '@/constants';
⋮----
export function useTransactions(initialBalance: number = DEFAULT_BALANCE)
⋮----
// BUG-06 fix: compute total so percent is not always 0
⋮----
// Filter transactions for the current calendar month
⋮----
// BUG-11 fix: compute topCategory and categoryDistribution (were always undefined)
⋮----
// Get all unique months from transactions
⋮----
const monthStr = tx.date.substring(0, 7); // YYYY-MM
⋮----
// Sort months and take the last 6
⋮----
// Sort transactions by date once
⋮----
// While the transaction date is after the current day, subtract/add it back from running balance
// BUG-05 fix: was inverted — credits appeared as increases when unwinding (they should decrease the earlier balance)
````

## File: src/lib/voiceCommands/commandParser.ts
````typescript
/**
 * Voice Command Parser — SpendWise Master Voice Engine
 *
 * Primary parsing is handled via Gemini (parseMasterVoiceWithGemini).
 * This file provides the fallback local parser and validation logic.
 */
⋮----
import { VoiceCommand, VoiceIntent, VoiceEntities, AppView } from '@/lib/voiceCommands/types';
import { FALLBACK_PATTERNS } from '@/lib/voiceCommands/fallbackPatterns';
⋮----
// ─── Indian Number Parser ─────────────────────────────────────────────────────
⋮----
export function parseIndianNumber(text: string): number | null
⋮----
// ─── Category Normalizer ──────────────────────────────────────────────────────
⋮----
export function normalizeCategory(raw: string): string
⋮----
// ─── Navigation Map ───────────────────────────────────────────────────────────
⋮----
// ─── Main Parser ──────────────────────────────────────────────────────────────
⋮----
/**
 * Validates that required entities are present.
 */
export function getMissingEntityPrompt(command: VoiceCommand): string | null
⋮----
/** True if this command should require explicit confirmation */
export function requiresConfirmation(command: VoiceCommand): boolean
⋮----
/** Fallback local regex parser */
export function parseVoiceCommand(transcript: string): VoiceCommand
````

## File: src/store/slices/gamificationSlice.ts
````typescript
import { StateCreator } from 'zustand';
import { Quest } from '@/types';
import { SpendWiseStore } from '@/store/index';
⋮----
export interface GamificationSlice {
  quests: Quest[];
  totalXP: number;
  level: number;
  rank: string;
  streak: number;
  lastLoginDate: string | null;
  showLevelUp: boolean;
  addXP: (amount: number) => void;
  dismissLevelUp: () => void;
  updateQuestProgress: (id: string, progress: number) => void;
  completeQuest: (id: string) => void;
  resetQuests: () => void;
  checkStreak: () => void;
}
⋮----
export const createGamificationSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], GamificationSlice> = (set, get) => (
⋮----
if (state.lastLoginDate === today) return state; // Already checked today ✓
⋮----
let newStreak = 1; // Always start at 1 (today counts)
⋮----
newStreak = state.streak + 1; // Genuine consecutive day
⋮----
return state; // Same day, no change
⋮----
// diffDays > 1: streak broken, newStreak stays 1
````

## File: src/store/slices/parentalSlice.ts
````typescript
import { StateCreator } from 'zustand';
import { Transaction, Category } from '@/types';
import { SpendWiseStore, ParentalControlState } from '@/store/index';
import { hashPin, verifyPinHash } from '@/lib/security';
⋮----
export interface ParentalSlice {
  parentalState: ParentalControlState;
  setTeenMode: (enabled: boolean, pin?: string) => void;
  setMonthlyLimit: (limit: number | null) => void;
  toggleRestrictedCategory: (category: Category) => void;
  updateParentalSettings: (updates: Partial<ParentalControlState>) => void;
  removePin: () => void;
  unlockSession: () => void;
  lockSession: () => void;
  requestTransactionApproval: (tx: Transaction) => void;
  approveTransaction: (id: string) => void;
  denyTransaction: (id: string) => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  togglePrivacy: () => void;
}
⋮----
export const createParentalSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], ParentalSlice> = (set, get) => (
````

## File: src/types/ui.ts
````typescript
import { Category } from "@/types/finance";
⋮----
export type AppView =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'analytics'
  | 'history'
  | 'settings'
  | 'goals'
  | 'quests'
  | 'inventory'
  | 'shop'
  | 'badges'
  | 'shared'
  | 'sync'
  | 'profile'
  | 'parental'
  | 'portfolio'
  | 'subscriptions'
  | 'advisor'
  | 'education'
  | 'reports'
  | 'gamification';
⋮----
export type AlertSeverity = 'info' | 'warning' | 'danger';
⋮----
export interface SpendingAlert {
  id:         string;
  severity:   AlertSeverity;
  title:      string;
  message:    string;
  category?:  Category;
  actionLabel?: string;
  createdAt:  number;
  dismissed:  boolean;
}
⋮----
export type NotificationType = 'alert' | 'recurring' | 'goal' | 'insight' | 'budget' | 'subscription';
⋮----
export interface AppNotification {
  id:        string;
  type:      NotificationType;
  title:     string;
  message:   string;
  icon:      string;
  severity:  AlertSeverity;
  read:      boolean;
  timestamp: number;
  link?:     AppView;
}
⋮----
export type ThemeMode = 'dark' | 'light';
````

## File: src/types/finance.ts
````typescript
export type DefaultCategory =
  | 'Food'
  | 'Subscriptions'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Travel'
  | 'Education'
  | 'Business'
  | 'Income';
⋮----
export type Category = DefaultCategory | (string & {});
⋮----
export interface Transaction {
  id:           string;
  date:         string;
  amount:       number;
  category:     Category;
  merchant:     string;
  type:         'credit' | 'debit';
  description?: string;
  isNew?:       boolean;
  isRecurring?: boolean;
  confidence?:  number;
  aiParsed?:    boolean;
  tags?:        string[];
  originalCategory?: string;
  status?:      'completed' | 'pending_approval';
}
⋮----
export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly';
⋮----
export interface BudgetConfig {
  period:          BudgetPeriod;
  rolloverEnabled: boolean;
}
⋮----
export type BudgetConfidence = 'high' | 'medium' | 'low';
⋮----
export interface CategorySpend {
  name:     Category;
  value:    number;
  color:    string;
  percent:  number;
}
⋮----
export interface BalanceDataPoint {
  date:       string;
  balance:    number;
  projected?: boolean;
}
⋮----
export interface BudgetSuggestion {
  category: Category;
  suggestedLimit: number;
  confidence: BudgetConfidence;
  reasoning: string;
  avgSpend?: number;
}
⋮----
export interface Budget {
  category:       Category;
  limit:          number;
  baseLimit:      number;
  rolloverAmount: number;
  spent:          number;
  percent:        number;
  remaining:      number;
  status:         'safe' | 'warning' | 'danger';
}
⋮----
export interface MonthlyStats {
  totalIncome:      number;
  totalExpenses:    number;
  savingsRate:      number;
  netCashFlow:      number;
  avgDailySpend:    number;
  transactionCount: number;
  topCategory?:      string;
  categoryDistribution?: Record<string, number>;
}
⋮----
export interface MonthlyHistoryPoint {
  month:    string;
  income:   number;
  expenses: number;
  savings:  number;
}
⋮----
export interface RecurringPattern {
  merchant:      string;
  category:      Category;
  avgAmount:     number;
  frequency:     'daily' | 'weekly' | 'monthly' | 'annual';
  lastSeen:      string;
  nextExpected:  string;
  occurrences:   number;
  totalSpent:    number;
  priceCreep?:   boolean;
  isTrial?:      boolean;
  trialEndsAt?:  string;
}
⋮----
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'annual';
⋮----
export interface RecurringTransaction {
  id:            string;
  merchant:      string;
  amount:        number;
  category:      Category;
  frequency:     RecurringFrequency;
  lastProcessed: string | null;
  nextOccurrence: string; // ISO date string YYYY-MM-DD
  isTrial?:      boolean;
  trialEndsAt?:  string;
}
⋮----
nextOccurrence: string; // ISO date string YYYY-MM-DD
⋮----
export type GoalStatus = 'on-track' | 'at-risk' | 'achieved' | 'paused';
⋮----
export interface SavingsGoal {
  id:           string;
  name:         string;
  emoji:        string;
  targetAmount: number;
  savedAmount:  number;
  targetDate:   string;
  monthlyContribution: number;
  status:       GoalStatus;
  color:        string;
  createdAt:    string;
}
⋮----
export interface SpendingPersonality {
  archetype: string;
  description: string;
  traits: string[];
  advice: string;
}
````

## File: src/lib/voiceCommands/commandRouter.ts
````typescript
/**
 * Voice Command Router — SpendWise Master Voice Engine
 *
 * Routes parsed VoiceCommand objects to the correct Zustand store actions.
 * Handles all intents: budget updates, transactions, liabilities, portfolio,
 * goals, subscriptions, navigation, and PDF report export.
 */
⋮----
import { VoiceCommand, CommandResult } from '@/lib/voiceCommands/types';
import { AppView } from '@/types';
import { IntentHandler } from './handlers/types';
⋮----
// Map of intents to their respective handlers
⋮----
// Navigation & UI
⋮----
// Queries
⋮----
// Transactions
⋮----
// Budgets
⋮----
// Liabilities
⋮----
// Portfolio
⋮----
// Goals
⋮----
// Subscriptions
⋮----
// Gamification (Quests)
⋮----
// Parental & Settings
⋮----
/**
 * Execute a parsed VoiceCommand against the Zustand store.
 * Returns a CommandResult with success status and user-facing message.
 */
export async function executeCommand(
  command: VoiceCommand,
  navigate: (view: AppView) => void,
  onExport: () => void,
  toggleTheme: () => void,
  setSearchQuery?: (q: string) => void,
): Promise<CommandResult>
⋮----
// Fallback for unknown intents
````

## File: src/services/OCRService.ts
````typescript
import { callGemini } from '@/services/gemini';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: string;
  category?: string;
  rawText: string;
}
⋮----
export const processReceipt = async (imageFile: File): Promise<OCRResult> =>
⋮----
// Convert file to base64
⋮----
// Tesseract.js fallback (Highly advanced heuristic extraction)
⋮----
// 1. Find Total Amount (Prioritize "total" over "subtotal")
⋮----
// 2. Find Merchant (Skip address, phone, and store metadata lines)
⋮----
// 3. Find Date
⋮----
// R4 fix: use formatLocalYYYYMMDD for parsed receipt dates too
⋮----
// 4. Find Category
⋮----
function fileToBase64(file: File): Promise<string>
````

## File: src/hooks/useAppState.ts
````typescript
import { useCallback, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useAlerts } from '@/features/budget/hooks/useAlerts';
import { useRecurring } from '@/features/recurring/hooks/useRecurring';
import { useNotifications } from '@/hooks/useNotifications';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useCategories } from '@/hooks/useCategories';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { FINANCE_DEFAULTS } from '@/constants';
import { Budget, BudgetPeriod } from '@/types';
import { useStore } from '@/store';
⋮----
export function useAppState(config: SpendWiseConfig | null)
⋮----
// Exclude pending-approval transactions from balance & budget calculations
⋮----
// Budget derived state & handlers
````

## File: src/services/VoiceService.ts
````typescript
import { callGemini } from '@/services/gemini';
import type { Category } from '@/types';
import type { VoiceCommand } from '@/lib/voiceCommands/types';
⋮----
export interface VoiceParsedTransaction {
  amount: number;
  category: Category;
  merchant: string;
  type: 'credit' | 'debit';
  date: string;
  recurring?: string;
}
⋮----
export const parseVoiceWithGemini = async (text: string, today: string): Promise<VoiceParsedTransaction> =>
⋮----
export const parseMasterVoiceWithGemini = async (text: string, today: string): Promise<VoiceCommand> =>
````

## File: src/store/slices/financeSlice.ts
````typescript
import { StateCreator } from 'zustand';
import { Transaction, Category, RecurringPattern, RecurringTransaction } from '@/types';
import { SpendWiseStore } from '@/store/index';
⋮----
export interface BudgetSettings {
  period: 'weekly' | 'biweekly' | 'monthly';
  rolloverEnabled: boolean;
}
⋮----
export interface FinanceSlice {
  transactions: Transaction[];
  indexedData: {
    byCategory: Record<string, Transaction[]>;
    byMonth: Record<string, Transaction[]>;
  };
  budgets: Record<string, number>;
  budgetSettings: BudgetSettings;
  subscriptions: RecurringPattern[];
  recurringTransactions: RecurringTransaction[];
  razorpayKeys: { keyId: string, keySecret: string } | null;

  addTransaction: (tx: Transaction) => void;
  addTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkUpdateTransactionsCategory: (ids: string[], newCategory: Category) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  resetBudgets: () => void;
  resetLimits: () => void;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => void;
  toggleRollover: () => void;
  addSubscription: (sub: RecurringPattern) => void;
  updateSubscription: (merchant: string, data: Partial<RecurringPattern>) => void;
  deleteSubscription: (merchant: string) => void;
  addRecurringTransaction: (rt: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, data: Partial<RecurringTransaction>) => void;
  removeRecurringTransaction: (id: string) => void;
  setRazorpayKeys: (keys: { keyId: string, keySecret: string } | null) => void;
  reindex: () => void;
}
⋮----
export const createFinanceSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], FinanceSlice> = (set, get) => (
⋮----
// Parental control logic is moved to combined store or handled via actions
````

## File: src/hooks/useAuth.tsx
````typescript
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { useStore } from '@/store';
import { isSupabaseConfigured, signInWithEmail, signUpWithEmail } from '@/services/supabase';
⋮----
export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}
⋮----
export interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  authReady: boolean;
  mfaRequired: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
}
⋮----
export const AuthProvider = (
⋮----
// Use a STABLE guest ID tied to the device, not random each time
⋮----
// Reset gamification for new guest so streak starts at 0
⋮----
// Do NOT remove spendwise_device_id — keeps data stable
// Do NOT remove transactions — they're in IDB and tied to device
// Do NOT remove CONFIG (spendwise_config_v1) — user prefs/name/currency must survive sign-out
⋮----
// BUG-08 fix: use full-email-based stable id (not just prefix) to avoid collisions
⋮----
// BUG-08 fix: use full-email-based stable id (not just prefix) to avoid collisions
⋮----
export const useAuth = (): AuthContextType =>
````

## File: src/hooks/useBudgets.ts
````typescript
import { useMemo } from 'react';
import { useStore } from '@/store';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export function useBudgets()
⋮----
// Determine the start date of the current period
⋮----
startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
⋮----
startDate.setDate(now.getDate() - 14); // Last 14 days
⋮----
startDate.setDate(1); // Start of month
⋮----
const endDateStr      = formatLocalYYYYMMDD(now); // today — never include future dates
⋮----
// Compute period spending per category
⋮----
// Merge explicit store budgets with implicit category limits
````

## File: src/utils/razorpaySync.ts
````typescript
import { Transaction, Category } from '@/types';
import { processNaturalLanguageExpense } from '@/parsers/nlp';
import { useStore } from '@/store';
⋮----
// ─── Merchant Memory (Phase 8.3) ────────────────────────────────────────────
export type MerchantMemory = Record<string, { merchant: string; category: string }>;
⋮----
export function loadMerchantMemory(): MerchantMemory
⋮----
/** After AI parse or manual correction — remember this UPI VPA mapping. */
export function rememberMerchant(upiVPA: string, merchant: string, category: string)
⋮----
export function parseUPIDescription(description: string):
⋮----
// PhonePe: "UPI/CR/PhonePe/MERCHANT_NAME/9876543210@ybl"
// GPay:    "UPI-MERCHANTNAME-gpay@okaxis-AXIS..."
// Paytm:   "PAYTM/UPI/merchant@paytm/DESCRIPTION"
// HDFC:    "UPI-CR-MERCHANTNAME-123456@upi"
// NEFT:    "NEFT/IMPS" (not UPI, ignore)
⋮----
const vpaMatch = description.match(/[\w.\-]+@[\w]+/);         // UPI VPA: name@bank
⋮----
// Extract merchant name — try multiple patterns:
⋮----
/UPI\/(?:CR|DR)\/[^\/]+\/([^\/]+)\//i,   // PhonePe pattern
/UPI-([A-Z0-9\s]+)-[a-z@]/i,              // GPay/HDFC pattern
/PAYTM\/UPI\/([^\/]+)\//i,                // Paytm pattern
/TO\s+([A-Z\s]{3,30})\s+REF/i,           // Generic TO NAME REF
⋮----
if (!merchant && upiId) merchant = upiId.split('@')[0]; // Fallback to VPA prefix
⋮----
/**
 * Parse a UPI payment description with Gemini AI.
 * Falls back to simple keyword heuristics if Gemini is unavailable.
 * Uses merchant memory to skip repeat AI calls for known VPAs.
 */
export async function parseUPIPayment(
  description: string,
  upiVPA = '',
): Promise<
⋮----
// 1 — Check merchant memory first (Phase 8.3)
⋮----
aiParsed: false, // from memory — no AI call
⋮----
// 2 — Attempt AI Analysis
⋮----
// 3 — Offline Heuristics Parse (Fallback)
⋮----
export interface RazorpayAuth {
  keyId: string;
  keySecret?: string;
}
⋮----
/**
 * Fetches recent captured payments from Razorpay API via secure backend proxy or mock fallback.
 */
export async function fetchRazorpayTransactions(auth: RazorpayAuth): Promise<Transaction[]>
⋮----
// Fallback to secure mock if no proxy URL is configured (preventing client-side secret exposure)
⋮----
// Return simulated transactions
⋮----
function processPaymentsToTransactions(payments: any[]): Transaction[]
⋮----
// ─── UPI Payment Checkout ───────────────────────────────────────────────────
⋮----
export interface RazorpayPaymentOptions {
  keyId: string;
  amount: number;         // in rupees — converted to paise internally
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  onSuccess: (details: RazorpayPaymentResult) => void;
  onFailure?: (error: any) => void;
}
⋮----
amount: number;         // in rupees — converted to paise internally
⋮----
export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  amount: number;         // in rupees
  description: string;
  method: string;
}
⋮----
amount: number;         // in rupees
⋮----
// Razorpay types are now in src/types/dom.ts
⋮----
/** Opens the Razorpay checkout popup for a UPI payment. */
export async function initiateRazorpayPayment(opts: RazorpayPaymentOptions): Promise<void>
⋮----
amount: Math.round(opts.amount * 100), // convert to paise
````

## File: src/main.tsx
````typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
⋮----
import App from "@/app/App";
import { AuthProvider } from "@/hooks/useAuth";
import { CategoryProvider } from "@/hooks/useCategories";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
⋮----
import { registerSW } from 'virtual:pwa-register';
import { runDexieMigration } from '@/db/migration';
⋮----
// Register service worker for PWA (immediate: ensures update on next visit)
⋮----
// Run one-time migration from legacy localStorage → IndexedDB on first load
⋮----
// Preferences are now restored via the encrypted Zustand store inside App.tsx
````

## File: src/store/index.ts
````typescript
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Transaction, Category } from '@/types';
import { db } from '@/db/db';
import { createFinanceSlice, FinanceSlice } from '@/store/slices/financeSlice';
import { createPortfolioSlice, PortfolioSlice } from '@/store/slices/portfolioSlice';
import { createGamificationSlice, GamificationSlice } from '@/store/slices/gamificationSlice';
import { createParentalSlice, ParentalSlice } from '@/store/slices/parentalSlice';
import { createSecuredSlice, SecuredSlice } from '@/store/slices/securedSlice';
⋮----
// Helper functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string
⋮----
function base64ToArrayBuffer(base64: string): ArrayBuffer
⋮----
// Derive Key from Password
async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>)
⋮----
async function encryptString(text: string, password: string): Promise<string>
⋮----
async function decryptString(encryptedJson: string, password: string): Promise<string>
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// Encryption key management — security-hardened
// Strategy:
//   • A stable device-specific random UUID (the "seed") is stored in localStorage.
//   • This key protects local database records from being readable off-device,
//     acting as a hardware-bound boundary.
//   • Note: Because it is persisted on disk, it does not fully defend against
//     XSS attacks or malicious browser extensions on this specific device.
// ─────────────────────────────────────────────────────────────────────────────
⋮----
function getOrCreateSessionSeed(): string
⋮----
// NOTE: This seed lives in localStorage (device-persistent).
// It protects data from being readable without this device's seed,
// but does NOT protect against XSS or malicious extensions on this device.
⋮----
// Compose a stable password from the session seed
// (In a production app you would use OPAQUE or a PIN-derived key here.)
⋮----
// Custom storage for IndexedDB using Dexie
⋮----
// Session seed mismatch is expected if the browser clears sessionStorage but keeps IndexedDB
// We log a warning instead of an error to keep the console clean and clear the stale data.
⋮----
export interface ParentalControlState {
  enabled: boolean;
  isTeenMode: boolean;
  ageGroup: 'child' | 'teen' | 'adult';
  parentPinHash: string | null;
  parentId?: string | null;
  monthlyLimit: number | null;
  restrictedCategories: Category[];
  pendingTransactions: Transaction[];
  hideBalances: boolean;
  hideAnalytics: boolean;
  blockAddTransactions: boolean;
  sessionUnlocked: boolean;
  requireApproval: boolean;
  notifyOnAllSpending?: boolean;
  notifyOnLowBalance?: boolean;
  blockAdultContent?: boolean;
  restrictLateNightSpending?: boolean;
}
⋮----
export type SpendWiseStore = FinanceSlice & PortfolioSlice & GamificationSlice & ParentalSlice & SecuredSlice & {
  resetData: () => void;
  restoreBackup: (data: any) => void;
  privacyEnabled: boolean;
  togglePrivacy: () => void;
};
⋮----
// ─── Automatic Legacy LocalStorage Migration ──────────────────────────────────
function migrateLegacyLocalStorage(store: SpendWiseStore)
⋮----
// 1. Migrate Savings Goals
⋮----
// 2. Migrate Shared Wallets
⋮----
// 3. Migrate Merchant Memory
⋮----
// 4. Migrate Notifications
⋮----
// 5. Migrate Razorpay Keys
⋮----
// 6. Migrate Round-Up Vault
⋮----
// 7. Migrate User Preferences
⋮----
// Run the migration immediately
````

## File: src/index.css
````css
/* ── Custom xs breakpoint (480px) for Tailwind v4 ── */
@custom-variant xs (@media (min-width: 480px));
⋮----
/* ── Enable class-based dark mode for Tailwind v4 ── */
⋮----
/* ═══════════════════════════════════════════════
   FINEBANK DESIGN SYSTEM — TOKENS
   Dark sidebar + Light content + Teal accent
═══════════════════════════════════════════════ */
⋮----
@layer base {
⋮----
:root {
⋮----
/* ── Sidebar ── */
⋮----
/* ── Main Content Area ── */
⋮----
/* ── Text ── */
⋮----
/* ── Chart & Graph Tokens ── */
⋮----
/* ── Teal Brand Accent ── */
⋮----
/* ── Semantic Colors (for light BG) ── */
⋮----
/* ── Glassmorphism ── */
⋮----
/* ── Border ── */
⋮----
/* ── Brand Gradient ── */
⋮----
/* ── Card Shadow ── */
⋮----
/* ── Radii ── */
⋮----
/* ── Fonts ── */
⋮----
/* ── Mobile Font Scale ── */
⋮----
/* ── Spacing Scale ── */
⋮----
/* ── Icon Size Tokens ── */
⋮----
:root.dark {
⋮----
/* ── Shadows ── */
⋮----
/* ── Dim semantic colors for darker BG ── */
⋮----
/* ── Recharts Customization ── */
.recharts-cartesian-grid-horizontal line,
⋮----
.recharts-text {
⋮----
.recharts-tooltip-cursor {
⋮----
*, *::before, *::after {
⋮----
/* Prevent blue tap highlight on mobile/Android */
⋮----
/* Make app feel native by preventing bounce/overscroll */
html, body {
⋮----
/* Prevent text selection on UI elements */
⋮----
/* Re-enable text selection for actual readable content */
p, h1, h2, h3, h4, h5, h6, span.selectable, input, textarea, select, [contenteditable] {
⋮----
/* Prevent double-tap to zoom on interactive elements */
button, a, input, select, textarea {
⋮----
/* Only transition specific properties on interaction, not everything globally */
button, a, .btn-tactile, .card-hover, .input-field {
⋮----
/* Don't transition transforms/opacity — that would break animations */
.animate-float, .animate-shimmer, .animate-pulse-glow,
⋮----
html, body, #root {
⋮----
body {
⋮----
/* Smooth momentum scrolling on iOS/Android */
⋮----
.high-contrast {
⋮----
/* ── High Contrast Overrides ── */
⋮----
:root.dark.high-contrast {
⋮----
/* ── Dark High Contrast Overrides ── */
⋮----
*, ::before, ::after {
⋮----
/* ═══════════════════════════════════════════════
   LAYOUT — Sidebar + Content Shell
═══════════════════════════════════════════════ */
.app-shell {
⋮----
/* ═══════════════════════════════════════════════
   TYPOGRAPHY UTILITIES
═══════════════════════════════════════════════ */
@layer utilities {
⋮----
.text-display {
@media (min-width: 640px) { .text-display { font-size: 38px; } }
⋮----
.btn-tactile {
⋮----
/* Material Ripple Simulation */
.btn-tactile::after {
⋮----
.btn-tactile:active::after {
⋮----
.surface-glass {
⋮----
@apply backdrop-blur-xl;
⋮----
.overscroll-contain {
⋮----
.text-headline {
@media (min-width: 640px) { .text-headline { font-size: 20px; } }
⋮----
.text-title {
⋮----
.text-body {
⋮----
.text-label {
⋮----
.text-caption {
⋮----
/* ── Card ── */
.card {
⋮----
.glass-card {
⋮----
.glass-panel {
⋮----
/* ── Teal Primary Button ── */
.primary-button {
.primary-button:hover:not(:disabled) {
.primary-button:active:not(:disabled) { transform: scale(0.98); }
.primary-button:disabled { opacity: 0.4; cursor: not-allowed; }
⋮----
/* ── Ghost button ── */
.ghost-button {
⋮----
/* Premium Animations */
⋮----
.premium-shimmer {
⋮----
.animate-float {
⋮----
.pulse-teal {
.ghost-button:hover { background: var(--teal-dim); }
⋮----
/* ── Input field ── */
.input-field {
.input-field::placeholder { color: var(--text-dim); }
.input-field:focus {
⋮----
/* Autofill override */
input:-webkit-autofill,
⋮----
/* ── Badge pill ── */
.badge-pill {
⋮----
/* ── Card hover ── */
.card-hover {
.card-hover:hover {
⋮----
/* ── Teal stat number ── */
.stat-number {
⋮----
/* ── Hide scrollbar utility ── */
.hide-scrollbar {
.hide-scrollbar::-webkit-scrollbar {
⋮----
/* ═══════════════════════════════════════════════
   SCROLLBAR
═══════════════════════════════════════════════ */
* {
::-webkit-scrollbar       { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: var(--radius-pill); }
::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
⋮----
/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
⋮----
.view-enter  { animation: fade-in-up 220ms ease-out forwards; }
.tx-enter    { animation: fade-in-up 300ms ease-out forwards; }
.modal-enter { animation: scale-in   200ms ease-out forwards; }
.animate-scale-in { animation: scale-in 150ms ease-out forwards; }
.animate-fade-in-up { animation: fade-in-up 220ms ease-out forwards; }
.animate-fade-in { animation: fade-in 200ms ease-out forwards; }
.animate-slide-in-right { animation: slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-shimmer {
.animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
⋮----
.animate-blink { animation: blink 0.9s step-end infinite; }
⋮----
/* ═══════════════════════════════════════════════
   MOBILE NAV SPACER
═══════════════════════════════════════════════ */
.mobile-nav-spacer { height: calc(70px + env(safe-area-inset-bottom)); }
@media (min-width: 768px) { .mobile-nav-spacer { height: 0; } }
⋮----
/* numeric alignment */
.tabular-nums { font-variant-numeric: tabular-nums; }
⋮----
/* ═══════════════════════════════════════════════
   MOBILE DASHBOARD OVERRIDES
   Prevent overflow, scale down heavy components, and optimize GPU
═══════════════════════════════════════════════ */
⋮----
/* Android / Mobile GPU Optimizations */
⋮----
/* Reduce blur intensity on mobile to save GPU cycles on Android */
⋮----
/* Flatter shadows on mobile */
⋮----
/* Disable heavy continuous animations on mobile to save battery and stop lag */
.animate-float, .animate-pulse-glow, .premium-shimmer {
⋮----
/* On very small phones (<480px), hide the hero sparkline */
⋮----
.hero-sparkline { display: none !important; }
⋮----
/* Stat card font clamp for narrow phones */
⋮----
.stat-value-text {
⋮----
/* Ensure dashboard never exceeds viewport width */
.dashboard-root {
⋮----
/* Android safe-area bottom padding */
.safe-pb {
⋮----
/* ═══════════════════════════════════════════════
   DASHBOARD LAYOUT — GUARANTEED SINGLE COLUMN
   Hard override for mobile regardless of Tailwind
═══════════════════════════════════════════════ */
⋮----
/* Force the outer two-column container to stack */
.dashboard-cols {
/* Ensure both columns are full width */
.dashboard-cols > * {
/* Stat cards: force 2 columns max on mobile */
.stat-grid {
/* FORCE SINGLE COLUMN END */
⋮----
.view-enter {
⋮----
/* ── Hide scrollbar on snap row (cross-browser) ───────────────────────────── */
.no-scrollbar {
.no-scrollbar::-webkit-scrollbar {
⋮----
/* ── Visual Viewport keyboard inset (fixes FAB hiding behind keyboard) ────── */
⋮----
/* ── Mobile bottom-nav safe-area padding ──────────────────────────────────── */
.pb-safe {
⋮----
/* ── Snap row card hover on desktop ──────────────────────────────────────── */
⋮----
.snap-card-hover:hover {
⋮----
/* ── Dark mode hero glow (§2 Dashboard) ──────────────────────────────────── */
:root.dark .hero-glow-dark {
⋮----
/* ── Skeleton shimmer for charts ─────────────────────────────────────────── */
⋮----
.skeleton-wave {
:root.dark .skeleton-wave {
⋮----
/* ── Danger Zone (§15 Profile / Settings) ────────────────────────────────── */
.danger-zone {
:root.dark .danger-zone {
⋮----
/* ── Amount colour coding (§6 Transactions) ──────────────────────────────── */
.amount-debit  { color: var(--red) !important; }
.amount-credit { color: var(--teal) !important; }
⋮----
/* ── Daily subtotal date header ──────────────────────────────────────────── */
.tx-date-header {
.tx-date-header .subtotal {
⋮----
/* ── Undo toast ──────────────────────────────────────────────────────────── */
.undo-toast {
.undo-toast button {
⋮----
/* ── Goal Hall of Fame section ───────────────────────────────────────────── */
.goals-hof-header {
⋮----
/* ── GoalCard gradient tint ──────────────────────────────────────────────── */
.goal-card-tint {
````
