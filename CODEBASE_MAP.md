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
