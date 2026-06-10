# SpendWise — Roadmap

Current state: 48,970 LOC TypeScript across 19 feature modules, 322 source files.

---

## Phase 1 — Tech Debt & Cleanup

### ESLint
- [ ] Fix 23 `react-hooks/set-state-in-effect` errors — refactor effects that call setState synchronously (hydrate, matchMedia, form defaults, etc.)

### Build
- [ ] Fix 1 circular chunk warning (`vendor-lucide -> vendor-db -> vendor-lucide`)
- [ ] Fix 3 mixed static/dynamic import warnings (tesseract.js in OCRService.ts/ocr.ts, react-hot-toast in useAuth.tsx/App.tsx/useUPIReturn.tsx, db.ts in useAuth.tsx/backup.ts/migration.ts/store/index.ts)

### Inline Styles → Tailwind
- [ ] Migrate ~1,200 inline style objects to Tailwind classes — static token lookups like `{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }` should be CSS utility classes

### Dead Code
- [ ] Consider removing `migrateLegacyLocalStorage()` from `store/index.ts` — one-shot migration, no-op after first run
- [ ] Audit unused exports across all feature modules

### Duplicate Logic Consolidation
- [ ] Merge recurring pattern detection: `useRecurring.ts` and `useSubscriptions.ts` both do similar merchant grouping / interval detection — extract to shared utility
- [ ] Merge merchant category heuristics: `razorpaySync.ts` and `OCRService.ts` both have keyword→category mapping
- [ ] Consolidate export code: `utils/export.ts` (CSV/JSON) vs `core/exportPDF.ts` (PDF) — unify interface
- [ ] Deduplicate nudge rendering: duplicated in `DashboardView.tsx` and `DashboardViewMobile.tsx`

### Hardcoded Strings → Constants
- [ ] Move all localStorage key strings to `STORAGE_KEYS` constant (many direct uses like `'spendwise_user'`, `'spendwise_device_id'`)
- [ ] Extract repeated label strings ("Recent transactions", "Total balance") into constants
- [ ] Extract analysis/report text templates

---

## Phase 2 — Testing

### Unit Tests (Vitest)
- [ ] `src/features/transactions/store/financeSlice.ts` — CRUD operations, budget limits, subscriptions
- [ ] `src/features/gamification/store/gamificationSlice.ts` — XP accumulation, level ups, quests
- [ ] `src/features/portfolio/store/portfolioSlice.ts` — asset/liability CRUD
- [ ] `src/hooks/useBudgets.ts` — budget calculations, category spending
- [ ] `src/hooks/useNotifications.ts` — notification generation, filtering, snoozing
- [ ] `src/core/voiceCommands/commandParser.ts` — NL intent extraction
- [ ] `src/utils/date.ts` — date formatting edge cases

### Integration Tests
- [ ] Store persistence — Zustand + Dexie round-trip
- [ ] Encryption layer — encrypt/decrypt round-trip with PBKDF2

### E2E Coverage Gaps
- [ ] Error states — API failures, offline mode, invalid input
- [ ] Edge cases — empty states, large datasets, rapid clicks
- [ ] Accessibility — tab order, focus management, screen reader output

---

## Phase 3 — Performance

### Component Optimization
- [ ] Add `React.memo()` to all list-item components: `TransactionRow`, `PatternCard`, `BudgetRow`, `GoalCard`, `NotificationItem`
- [ ] Virtualize long lists: chat messages (`AdvisorView`), notifications (`NotificationCenter`), transaction history
- [ ] Code-split large files: `SharedModals.tsx` (892 lines → per-modal chunks), `BudgetManager.tsx` (638 lines)
- [ ] Memoize expensive computations in `useGamification`, `useRecurring`, `useBudgets`

### Re-render Reduction
- [ ] Memoize dashboard child components to prevent cascading re-renders on every transaction change
- [ ] Add `useMemo` / `React.memo` to `BudgetManager` budget rows
- [ ] Stabilize callback references passed to list item components

---

## Phase 4 — Accessibility

### Keyboard Navigation
- [ ] Focus trapping in all modals
- [ ] Arrow-key navigation in transaction lists, date pickers, category dropdowns
- [ ] Return focus to trigger element on modal close

### Screen Reader
- [ ] `aria-live` regions for dynamic updates (transaction added, budget exceeded, goal complete)
- [ ] Alt text / `aria-label` on all icon-only buttons and stat card icons
- [ ] `role` attributes on interactive cards (goal cards, subscription cards)
- [ ] Text equivalents for color-only indicators (budget safe/warning/danger)

### WCAG Compliance
- [ ] Audit color contrast ratios — inline CSS variables may fail WCAG 2.1 AA
- [ ] Add visible focus indicators on all interactive elements
- [ ] Test with screen reader (VoiceOver / NVDA)

---

## Phase 5 — Security

### Storage Hardening
- [ ] Move auth tokens from `localStorage` to `sessionStorage` or in-memory only
- [ ] Move sensitive user data (`spendwise_user`) to encrypted IndexedDB
- [ ] Audit all 131 localStorage/sessionStorage usages for sensitivity

### XSS Mitigation
- [ ] Audit `dangerouslySetInnerHTML` usage (currently 0 instances — confirm on PRs)
- [ ] Sanitize Gemini markdown output in `ReportsView.tsx` (uses `react-markdown` which can render arbitrary HTML)
- [ ] Sanitize OCR results and merchant names before rendering

### Authentication
- [ ] Hardened guest mode — stable device-bound identity
- [ ] SHA-256 PIN hashing → upgrade to PBKDF2/argon2 (optional, local-only)
- [ ] Session token rotation

---

## Phase 6 — Feature Enhancements

### High Priority
- [ ] **Add loading skeletons** — History view, Profile view, Shared Wallets, Advisor chat, Portfolio, Education, Reports (currently only dashboard has skeletons)
- [ ] **Push notifications** — service worker push for bill reminders, budget alerts
- [ ] **Scheduled transactions** — UI for future-dated one-time transactions (existing `useAutomations` covers recurring only)
- [ ] **Transaction splitting** — split a single transaction across multiple categories
- [ ] **Advanced transaction search** — date range, amount range, tags, merchant in history view
- [ ] **Spending limits per day/week** — currently monthly-only budgeting
- [ ] **Receipt image attachment** — store receipt images alongside transactions

### Medium Priority
- [ ] **Empty states** — dedicated empty state components for Budget (no budgets set), Goals, Portfolio, Subscriptions, Education, Shared Wallets
- [ ] **Bill reminders** — email/SMS reminders for upcoming bills (via Supabase Edge Function)
- [ ] **Investment tracking** — stock/mutual fund/ETF integration with price feeds
- [ ] **Debt payoff planner** — snowball/avalanche calculator with projections
- [ ] **Recurring transaction editor** — dedicated UI to edit/delete frequency rules
- [ ] **Multi-account support** — switch between multiple user profiles
- [ ] **Data import formats** — bank statement PDF import, OFX/QFX import
- [ ] **Shared budgets** — household-wide budget that all shared wallet members contribute to

### Low Priority
- [ ] **Optimistic UI** — instantly reflect transaction adds/deletes before backend confirms
- [ ] **Tax calculator** — estimate tax liability, generate tax reports
- [ ] **Internationalization (i18n)** — extract all UI strings to locale files
- [ ] **Dark mode scheduler** — automatic dark mode based on sunrise/sunset
- [ ] **Receipt gallery** — browse all scanned receipts with images
- [ ] **Spending limits per category per week** — granular budget periods
- [ ] **Custom categories** — user-defined category hierarchy (subcategories, groups)
- [ ] **Web responsive layout** — desktop-first views as an alternative to mobile-first

---

## Phase 7 — Architecture

### Routing
- [ ] Replace `window.location.pathname` routing with `react-router-dom` (already in deps)
- [ ] Add route-level code splitting along feature boundaries

### Store
- [ ] Break up `store/index.ts` monolith — slice composition should own persistence config
- [ ] Decouple `useAppState.ts` — orchestrator hook calling 7 sub-hooks is tightly coupled

### Code Organization
- [ ] Clear feature boundary between `transactions`, `subscriptions`, and `recurring` — all three manage overlapping state
- [ ] Standardize API layer — `src/core/api/` has `gemini.ts`, `supabase.ts` but OCR, Razorpay, Setu live elsewhere
- [ ] Improve testability — extract side effects from hooks into injectable services
- [ ] Migrate `import.meta.env.VITE_*` access to a typed config service (currently scattered across files)

---

## Completed (✓)

### ESLint
- ✓ `no-console` (9→0) — switched to `console.warn`/`console.error`
- ✓ `no-empty` (2→0) — comments on empty catches
- ✓ `no-useless-escape` (27→0) — cleaned regex character classes
- ✓ `no-useless-assignment` (7→0) — removed dead initializers
- ✓ `react-refresh/only-export-components` (9→0) — presumably resolved by other fixes
- ✓ `react-hooks/exhaustive-deps` (19→0) — all deps arrays complete
- ✓ `react-hooks/immutability` (1→0)
- ✓ `react-hooks/purity` (10→0) — suppressed intentional `Date.now()`/`Math.random()` calls
- ✓ `react-hooks/refs` (1→0) — moved ref mutation to useEffect
- ✓ `preserve-caught-error` (5→0) — added `{ cause: e }` to rethrows
- ✓ `@typescript-eslint/no-explicit-any` (33→0) — typed or suppressed

### Bugs
- ✓ `resetLimits` now clears all budgets (`{}`) instead of zeroing each category
- ✓ Dead duplicate hooks deleted (5 files with zero importers)
- ✓ `@ts-nocheck` removed from `useSharedWallets.ts`
- ✓ `@ts-ignore` removed from `MagicInput.tsx` (SpeechRecognition types)
- ✓ TypeScript compiles cleanly (`npx tsc --noEmit`)
- ✓ Vite build succeeds
- ✓ All 33 tests pass

### Test Fixes
- ✓ forecast.test.ts confidence assertions with early-month guard (added `refDate`)
- ✓ 2 pre-existing test failures fixed

### Architecture
- ✓ Global Window augmentation for SpeechRecognition in `src/types/dom.ts`
- ✓ Static `VIEWS` array moved to module level in `CommandPalette.tsx`
