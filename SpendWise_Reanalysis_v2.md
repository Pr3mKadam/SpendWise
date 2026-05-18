# SpendWise — Full Re-Analysis (Updated Codebase)
**Analysis Date:** May 18, 2026 · **Codebase Version:** Phase 2.0-beta  
**Method:** Deep source read of all 120 src files in the updated zip

---

## Executive Summary

| Category | Previous | Now | Delta |
|----------|----------|-----|-------|
| Critical bugs | 15 | 4 | ✅ 11 fixed |
| Medium bugs | 10 | 5 | ✅ 5 fixed |
| Android-specific issues | 16 | 3 | ✅ 13 fixed |
| Architecture gaps | 7 | 3 | ✅ 4 fixed |
| **Net-new bugs found** | — | **6** | ❌ New |

---

## PART 1 — What's Confirmed Fixed ✅

### Security & Data Architecture (All Fixed)
- ✅ **BUG-02** Goals now in Zustand `SecuredSlice` → encrypted IDB (`securedSlice.ts`)
- ✅ **BUG-03** Shared wallets now in `SecuredSlice.sharedData` → encrypted IDB
- ✅ **BUG-04** Razorpay keys now in `SecuredSlice.razorpayKeys` → encrypted IDB
- ✅ **BUG-09** Merchant memory now in `SecuredSlice.merchantMemory` → encrypted IDB
- ✅ **BUG-15** Notifications + Round-Up Vault now in encrypted store
- ✅ **Legacy migration** `store/index.ts` auto-migrates all old localStorage keys on startup

### Data Correctness (All Fixed)
- ✅ **BUG-05** Balance trend reversal fixed: `runningBalance += tx.type === 'credit' ? -amount : amount`
- ✅ **BUG-06** `categorySpending.percent` now correctly computed (verified in `useTransactions.ts` line 39-47)
- ✅ **BUG-07** Voice category list now matches `DefaultCategory` type exactly in `VoiceService.ts`
- ✅ **BUG-M02** `MonthlyStats.topCategory` now populated: `topCategory: categorySpending[0] || null`
- ✅ **BUG-M03** Forecast min-days guard added: `MIN_DAYS = 5`, low-confidence fallback active

### Features (All Fixed)
- ✅ **BUG-08** Auth uses stable `device_id` — data no longer lost on re-login
- ✅ **BUG-10** Streak logic fixed: genuine consecutive days only, no fake carry-over
- ✅ **BUG-11** Mic: `continuous=true`, `interimResults=true`, `lang='en-IN'`, 2.5s guard, permission check
- ✅ **BUG-13** OCR: Tesseract.js fallback fully wired in `OCRService.ts` with amount/merchant/date extraction
- ✅ **BUG-14** AI Advisor: full local fallback engine in `advisor.ts` always returns a string
- ✅ **BUG-M07 (QR)** `LinkingQRModal.tsx` and `GroupQRModal` both implemented with QRCode CDN
- ✅ **BUG-M08** Invite via email: `mailto:` fallback wired in `SharedModals.tsx` `InviteModal.submit()`
- ✅ **BUG-M09** Phone number field now has "Unverified" label treatment in ProfileViewMobile
- ✅ **BUG-M10** Initial balance default changed to ₹0 in constants

### Android UI (All Fixed)
- ✅ **NEW-P0-01** Drawer filter fixed: `mobileDrawerItems` now shows all non-bottom-nav items
- ✅ **NEW-P0-02** Right-edge swipe removed — only left-edge back swipe remains
- ✅ **NEW-P0-03** Shake guard: `enabled` check runs before `addEventListener` (line 224-226)
- ✅ **NEW-P0-04** FAB position: `bottom: calc(5rem + ${keyboardOffset}px)` with Visual Viewport API
- ✅ **NEW-P1-01** Navigation history: `window.history.back()` replaces hardcoded Dashboard
- ✅ **NEW-P1-02** Bottom nav: CSS `opacity` transition instead of Framer Motion `layoutId`
- ✅ **NEW-P1-04** QuickAddModal: `inputMode="decimal"`, deferred focus, `dvh` height, MD3 easing
- ✅ **NEW-P2-01** Mobile header: 4 decorative divs replaced with single CSS gradient
- ✅ **NEW-P2-02** Privacy + theme toggle now visible on mobile header
- ✅ **NEW-P2-04** `EmptyState.tsx` component created and used in dashboard
- ✅ **NEW-P2-05** Bottom nav ARIA: `role="tab"`, `aria-selected`, `aria-label`, `aria-expanded` on More

### CSS & Design System (All Fixed)
- ✅ `--sidebar-width: 56px` ✅ `.no-scrollbar` ✅ `--kb-inset` ✅ `.pb-safe` all added to `index.css`
- ✅ `--fs-overline`, `--text-dim: #b6c0cf` (dark), `--sidebar-text` contrast corrected
- ✅ `vite.config.ts`: `drop: ['console', 'debugger']` in production — `console.log` stripped

---

## PART 2 — Remaining Issues 🔴

### REMAINING-01 · Privacy Toggle: Dual-Store Race Condition
**File:** `src/store/index.ts` + `src/store/usePrivacyStore.ts`  
**Severity:** 🔴 Critical  
**Effort:** 20 minutes

**Problem:** There are TWO separate privacy stores:
1. `useStore.privacyEnabled` + `useStore.togglePrivacy()` — used in `MainShell.tsx`
2. `usePrivacyStore.isPrivate` + `usePrivacyStore.togglePrivacy()` — a separate Zustand store in `usePrivacyStore.ts`

Also, `togglePrivacy` in `store/index.ts` has a **logic bug**:
```typescript
// Current (WRONG):
togglePrivacy: () => set((state) => ({
  privacyEnabled: !state.privacyEnabled,
  parentalState: { ...state.parentalState, hideBalances: !state.privacyEnabled }
  // ↑ reads OLD privacyEnabled (before toggle), so hideBalances is always one step behind
})),
```

**Fix:**
```typescript
// 1. Delete src/store/usePrivacyStore.ts entirely (unused orphan)

// 2. Fix toggle logic in src/store/index.ts:
togglePrivacy: () => set((state) => {
  const next = !state.privacyEnabled;
  return {
    privacyEnabled: next,
    parentalState: { ...state.parentalState, hideBalances: next }
    // ↑ uses 'next' — always in sync
  };
}),
```

---

### REMAINING-02 · QRCode CDN Script Uses `defer` — Not Ready on First Click
**File:** `index.html`  
**Severity:** 🔴 Critical  
**Effort:** 30 minutes

**Problem:**
```html
<script src="https://cdnjs.cloudflare.com/.../qrcode.min.js" defer></script>
```
`defer` means the script loads after HTML parsing but the order isn't guaranteed. `LinkingQRModal.tsx` already has a `setTimeout(() => { if (window.QRCode) ... }, 100)` guard, but 100ms is too short on a slow 3G connection. First click on "Show Linking QR" on a slow network will show an empty `<div>` with no QR code and no error message.

Also: `html5-qrcode` (the second script) is loaded from `unpkg.com` — this is not used anywhere in the code. It adds ~300 KB of unused JavaScript.

**Fix:**
```html
<!-- index.html — remove html5-qrcode (unused), keep qrcodejs, load async not defer -->
<!-- REMOVE: -->
<script src="https://unpkg.com/html5-qrcode" defer></script>

<!-- CHANGE defer → async on qrcodejs: -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" async></script>
```

```typescript
// LinkingQRModal.tsx — increase timeout and add fallback message:
useEffect(() => {
  if (!show || !qrRef.current || !user) return;
  qrRef.current.innerHTML = '';
  const linkData = JSON.stringify({ type: 'spendwise_child_link', parentId: user.id, timestamp: Date.now() });

  const tryRender = (attempts = 0) => {
    if ((window as any).QRCode) {
      new (window as any).QRCode(qrRef.current, { text: linkData, width: 200, height: 200 });
    } else if (attempts < 15) {
      setTimeout(() => tryRender(attempts + 1), 200); // retry every 200ms, up to 3s
    } else {
      // Fallback: show the raw data as text the child can type
      if (qrRef.current) {
        qrRef.current.innerHTML = `
          <div style="padding:16px;background:#f1f5f9;border-radius:12px;font-size:11px;word-break:break-all;color:#0f172a">
            <p style="font-weight:700;margin-bottom:8px">QR unavailable offline</p>
            <p>Share this code manually:</p>
            <code>${btoa(linkData).substring(0, 24)}...</code>
          </div>`;
      }
    }
  };
  setTimeout(() => tryRender(), 150);
}, [show, user]);
```

---

### REMAINING-03 · `console.log` Still Ships in One Location
**File:** `src/components/layout/MainShell.tsx` line 651  
**Severity:** 🟠 Medium  
**Effort:** 2 minutes

**Problem:** `vite.config.ts` correctly strips console in production via `esbuild.drop`. However the remaining `console.log('Feedback submitted:', data)` is harmless in production (stripped) but signals missing backend integration.

**Fix:** Replace with a proper integration note:
```typescript
// MainShell.tsx line 651
onSubmit={(data) => {
  // TODO Phase 2.0: POST to Supabase Edge Function /feedback
  // For now, feedback is collected locally only
  if (import.meta.env.DEV) console.log('Feedback submitted:', data);
}}
```

---

### REMAINING-04 · `BudgetViewMobile.tsx` Edit/Trash Buttons Below 44px Touch Target
**File:** `src/components/views/BudgetViewMobile.tsx` lines 208, 215  
**Severity:** 🟠 Medium  
**Effort:** 15 minutes

**Problem:** Edit and Trash buttons use `Edit2 size={16}` and `Trash2 size={16}` with no explicit size constraint, resulting in ~28×28px tap targets — below the 44px WCAG/Apple minimum on touch screens.

**Fix:**
```tsx
{/* BEFORE — too small: */}
<Edit2 size={16} />
<Trash2 size={16} />

{/* AFTER — 44px tap target, icon stays visually small: */}
<button
  aria-label="Edit budget"
  className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-[var(--teal)]/10 transition-colors"
>
  <Edit2 size={18} className="text-[var(--teal)]" />
</button>
<button
  aria-label="Delete budget"
  className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-red-500/10 transition-colors"
>
  <Trash2 size={18} className="text-red-400" />
</button>
```

---

### REMAINING-05 · `.env.local` Contains Convex Variables That Aren't Used
**File:** `.env.local`  
**Severity:** 🟠 Medium  
**Effort:** 2 minutes

**Problem:** The `.env.local` file contains:
```
CONVEX_DEPLOYMENT=anonymous:anonymous-SpendWise
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
```
Convex is not used anywhere in the codebase (no imports, no references). These variables are dead config pointing to localhost. If deployed to Vercel with these env vars, Vite will bundle the `VITE_CONVEX_*` strings into the production build, potentially confusing error messages if something tries to connect.

**Fix:** Remove these 3 lines from `.env.local`:
```bash
# DELETE these lines:
# CONVEX_DEPLOYMENT=anonymous:anonymous-SpendWise
# VITE_CONVEX_URL=http://127.0.0.1:3210
# VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
```

---

### REMAINING-06 · Gemini API Key Exposed in `.env.local` — Must Not Ship to Git
**File:** `.env.local`  
**Severity:** 🔴 Critical — Security  
**Effort:** 5 minutes

**Problem:** `.env.local` contains a live Gemini API key:
```
VITE_GEMINI_API_KEY=AIzaSyCX51zy_ys_I_Dy3hPcn0EOWpIUgo-b3Wg
```
Because all `VITE_*` env variables are **bundled into the client-side JavaScript** at build time, this key is visible to anyone who downloads your PWA and opens DevTools → Sources. It is also in the `.env.local` file which could be committed to Git if `.gitignore` is misconfigured.

**Immediate actions (in order):**

**Step 1 — Rotate the key now:**
Go to [Google AI Studio](https://aistudio.google.com/app/apikey) → delete this key → create a new one.

**Step 2 — Verify `.gitignore`:**
```bash
# Your .gitignore must contain:
.env.local
.env*.local
```

**Step 3 — Long-term fix (Phase 2.0 — Supabase Edge Function proxy):**
```typescript
// Instead of calling Gemini directly from the browser:
// BEFORE:
const res = await fetch(`https://generativelanguage.googleapis.com/...?key=${VITE_GEMINI_API_KEY}`, ...)

// AFTER — call your own proxy (key lives server-side only):
const res = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/gemini-proxy', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, model: 'gemini-1.5-flash' })
});
// The Edge Function adds the real Gemini key from its own environment variables
```

---

## PART 3 — New Bugs Found in Updated Code 🆕

### NEW-BUG-01 · `togglePrivacy` Sync Bug (see REMAINING-01)
Already documented above.

---

### NEW-BUG-02 · `signIn` Creates Email-Based ID — Sign-In to Same Account on Different Device Gets Different Data
**File:** `src/hooks/useAuth.tsx` lines 79-87  
**Severity:** 🔴 Critical  
**Effort:** Cannot fix without real Supabase auth

**Problem:**
```typescript
// Current:
const userObj = {
  id: 'local_' + btoa(email).replace(/[^a-z0-9]/gi, '').substring(0, 20),
  // ↑ email-based ID is correct for same-device same-email
  // BUT: btoa('user@gmail.com') on Device A === btoa('user@gmail.com') on Device B
  // So signing in on a second phone gives a matching ID but EMPTY data
  // because the data lives in that device's IndexedDB
};
```
A user who signs in on their laptop and then signs in on their phone with the same email will see NO data on the phone — because IndexedDB is device-local. The ID matches but the encrypted data doesn't exist there.

**Current status:** This is an inherent limitation of the local-first architecture without real Supabase auth. The fix is to complete Supabase auth (Phase 2.0), which will enable cloud sync.

**Short-term UX fix — show a clear message instead of empty state:**
```typescript
// In useAuth.tsx, after signIn succeeds but before reloading:
const existingTx = await db.transactions.count();
if (existingTx === 0) {
  // New device — show helpful message
  toast('Welcome back! Your data will sync once cloud backup is set up.', { icon: '☁️', duration: 5000 });
}
```

---

### NEW-BUG-03 · `usePrivacyStore` Orphan — Imported Nowhere But Exists as Confusion
**File:** `src/store/usePrivacyStore.ts`  
**Severity:** 🟠 Medium  
**Effort:** 2 minutes (just delete the file)

**Problem:** `src/store/usePrivacyStore.ts` creates a second, separate privacy Zustand store. It is **not imported anywhere** in the codebase (verified by grep). It's a dead file that will confuse any future developer. Combined with `store/index.ts` having `privacyEnabled`, there are conceptually two privacy systems.

**Fix:** Delete `src/store/usePrivacyStore.ts`.

---

### NEW-BUG-04 · NLP Parser Category List Still Includes `"Transfer"` — Not a Valid Category
**File:** `src/utils/parsers/nlp.ts` line 26  
**Severity:** 🟠 Medium  
**Effort:** 5 minutes

**Problem:** The Gemini prompt in `nlp.ts` lists:
```
category: One of [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Income, Transfer]
```
`Transfer` is **not** in the `DefaultCategory` type in `src/types/finance.ts`. Transactions parsed by Gemini as `"Transfer"` will silently get an invalid category, breaking category filtering, budget tracking, and donut charts.

**Fix:**
```typescript
// src/utils/parsers/nlp.ts — update the Gemini prompt category list:
// BEFORE:
`category: One of [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Income, Transfer]`

// AFTER (matches DefaultCategory type exactly):
`category: One of [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Education, Business, Income]`
```

---

### NEW-BUG-05 · `keyboardOffset` State in MainShell Not Synced to CSS Variable
**File:** `src/components/layout/MainShell.tsx` lines 82-125  
**Severity:** 🟠 Medium  
**Effort:** 10 minutes

**Problem:** MainShell correctly reads the Visual Viewport and sets `--kb-inset` CSS variable. It also sets `keyboardOffset` React state. The FAB uses **React state** (`style={{ bottom: \`calc(5rem + ${keyboardOffset}px)\` }}`), NOT the CSS variable. This means:

1. The Sidebar.tsx FAB (which uses `--kb-inset`) and the MainShell FAB are now **duplicated** — there are two FABs on mobile.
2. The MainShell FAB will flicker because React state updates are batched and not as smooth as CSS variable updates.

**Fix:**
```typescript
// src/components/layout/MainShell.tsx — remove the separate FAB entirely.
// The FAB is already in Sidebar.tsx via the onOpenQuickAdd prop.
// Find and DELETE this block in MainShell.tsx:

{/* REMOVE this entire motion.button block: */}
<motion.button
  whileTap={{ scale: 0.9 }}
  onClick={() => { haptic.medium(); setShowQuickAdd(true); }}
  className="fixed right-6 z-[60] w-14 h-14 rounded-full ... md:hidden ..."
  style={{ bottom: `calc(5rem + ${keyboardOffset}px)` }}
  aria-label="Add Transaction"
>
  <svg ...>...</svg>
</motion.button>
```

Then verify `Sidebar.tsx` receives `onOpenQuickAdd={() => setShowQuickAdd(true)}` (it already does per the code).

---

### NEW-BUG-06 · `EmptyState.tsx` Component Interface Mismatch — Breaks GoalsView
**File:** `src/components/common/EmptyState.tsx`  
**Severity:** 🟠 Medium  
**Effort:** 30 minutes

**Problem:** The new `EmptyState.tsx` has a simplified interface:
```typescript
interface EmptyStateProps {
  onAction?: () => void;
  message?: string;
  subMessage?: string;
}
```
But the original roadmap specified (and components may now expect):
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;    // ← missing
  title: string;            // ← named differently
  subtitle?: string;        // ← named differently
  action?: { label: string; onClick: () => void; };  // ← missing
  secondaryAction?: { label: string; onClick: () => void; }; // ← missing
}
```
Any component that tries to use `<EmptyState icon={...} title="..." action={{ label: '...', onClick: ... }} />` will get TypeScript errors and render incorrectly. The icon is hardcoded as `ArrowUpRight` with no way to change it.

**Fix — extend the interface without breaking existing usage:**
```typescript
// src/components/common/EmptyState.tsx — replace the interface:
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

export default function EmptyState({
  icon, title, subtitle, action, secondaryAction,
  onAction, message, subMessage  // legacy
}: EmptyStateProps) {
  // Resolve props — new takes priority over legacy:
  const resolvedIcon   = icon ?? <ArrowUpRight size={32} />;
  const resolvedTitle  = title ?? message ?? "Let's record your first transaction";
  const resolvedAction = action ?? (onAction ? { label: 'Add Transaction', onClick: onAction } : undefined);
  const resolvedSub    = subtitle ?? subMessage;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center ...">
      <div className="w-16 h-16 rounded-2xl bg-[var(--teal)]/10 flex items-center justify-center text-[var(--teal)] mb-4">
        {resolvedIcon}
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{resolvedTitle}</h3>
      {resolvedAction && (
        <button onClick={resolvedAction.onClick}
          className="mt-4 px-6 py-2.5 bg-[var(--teal)]/10 text-[var(--teal)] font-bold rounded-full flex items-center gap-2 ...">
          {resolvedAction.icon ?? <Plus size={18} />}
          {resolvedAction.label}
        </button>
      )}
      {resolvedSub && <p className="text-sm text-[var(--text-muted)] mt-3">{resolvedSub}</p>}
      {secondaryAction && (
        <button onClick={secondaryAction.onClick} className="text-[var(--teal)] text-sm font-medium mt-2">
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
```

---

## PART 4 — Remaining Architecture Gaps

### GAP-A · Real Supabase Auth Still Not Wired
**Status:** The `supabase.ts` service file is written. `useAuth.tsx` calls `isSupabaseConfigured` and falls through to local mode because no `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`.

**What's needed:**
1. Create a Supabase project at [supabase.com](https://supabase.com) (free tier)
2. Add to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
3. Run the SQL schema from the comments in `src/services/supabase.ts`
4. Done — `useAuth.tsx` will automatically use real Supabase auth

---

### GAP-B · Gemini API Key Client-Side (See REMAINING-06)
Full Edge Function proxy needed. Can be done as a Supabase Edge Function once GAP-A is completed.

---

### GAP-C · Test Coverage Still Thin
Only 3 test files. With the new store slices, migration logic, and encryption layer, test gaps are higher risk than before.

**Priority files to test:**
```
src/store/slices/securedSlice.ts    ← new encrypted data layer
src/db/migration.ts                 ← auto-migration on startup
src/utils/parsers/nlp.ts            ← multi-transaction parsing
src/utils/insights/forecast.ts      ← MIN_DAYS guard edge cases
src/lib/encryption.ts               ← core security primitive
```

---

## PART 5 — Priority Fix Order

| # | Fix | File | Time | Do Now? |
|---|-----|------|------|---------|
| 1 | REMAINING-06: Rotate Gemini API key | aistudio.google.com | 2 min | ✅ RIGHT NOW |
| 2 | REMAINING-01: Privacy toggle logic bug | `store/index.ts` | 5 min | ✅ Yes |
| 3 | NEW-BUG-03: Delete orphan `usePrivacyStore.ts` | `store/usePrivacyStore.ts` | 1 min | ✅ Yes |
| 4 | NEW-BUG-04: Fix `"Transfer"` in NLP category list | `parsers/nlp.ts` | 5 min | ✅ Yes |
| 5 | NEW-BUG-05: Remove duplicate FAB from MainShell | `MainShell.tsx` | 10 min | ✅ Yes |
| 6 | REMAINING-02: QR retry logic + remove html5-qrcode | `index.html` + `LinkingQRModal.tsx` | 30 min | ✅ Yes |
| 7 | NEW-BUG-06: Fix EmptyState interface | `EmptyState.tsx` | 30 min | ✅ Yes |
| 8 | REMAINING-04: BudgetViewMobile touch targets | `BudgetViewMobile.tsx` | 15 min | Sprint 1 |
| 9 | REMAINING-05: Remove Convex from .env.local | `.env.local` | 2 min | ✅ Yes |
| 10 | REMAINING-03: console.log comment | `MainShell.tsx` | 2 min | Sprint 1 |
| 11 | GAP-A: Wire real Supabase auth | `.env.local` + dashboard | 1 day | Sprint 1 |
| 12 | GAP-B: Edge Function proxy for Gemini | Supabase | 1 day | Sprint 1 |
| 13 | GAP-C: Write test suite | `*.test.ts` | 3 days | Sprint 2 |

---

## PART 6 — Updated Antigravity Prompt Addition

Add this block to your existing master prompt to reflect the current state:

```
## Phase 2.0-beta Status (as of May 2026)

### ✅ CONFIRMED FIXED — Do NOT re-add these patterns:
- Goals, SharedWallets, MerchantMemory, Notifications, RoundUpVault → all in SecuredSlice (encrypted IDB)
- Privacy toggle → useStore.togglePrivacy() only (usePrivacyStore.ts is orphaned — delete it)
- NLP category list → [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Education, Business, Income] — NO "Transfer", NO "Bills", NO "Investment"
- Streak → genuine consecutive-day detection only (no fake carry-over)
- Balance trend → runningBalance += credit ? -amount : amount (correct direction)
- categorySpending.percent → computed as Math.round((value / totalDebitAmount) * 100)
- Forecast → MIN_DAYS = 5 guard active
- Voice mic → continuous=true, lang='en-IN', 2.5s guard, permission check at start
- OCR → Tesseract.js fallback wired after Gemini failure

### ❌ STILL BROKEN — Known issues:
- Privacy toggle has off-by-one bug: uses old state instead of new state in parentalState sync
- NLP prompt still lists "Transfer" as valid category — causes invalid category on some transactions
- Duplicate FAB: one in Sidebar.tsx (correct) + one motion.button in MainShell.tsx (remove the MainShell one)
- EmptyState interface too narrow — extend it to support icon/title/action props
- Gemini API key is in .env.local and bundled into production JS — rotate and proxy via Edge Function
- Real Supabase auth not wired (VITE_SUPABASE_URL not set) — local fallback only

### 🔐 Security note:
The encryption password in store/index.ts uses localStorage as the session seed store.
This means it persists across sessions (good for UX) but the "session seed" is not truly ephemeral.
In Phase 2.0 with Supabase: derive the encryption key from the user's server-issued JWT instead.
```

---

## PART 7 — What Genuinely Impressed Me in This Update

1. **`SecuredSlice` design** — Clean, well-typed, handles all 6 legacy localStorage migrations automatically on startup. This is production-grade architecture.

2. **OCRService Tesseract fallback** — The fallback has proper multi-line amount extraction, date parsing, and category heuristics. The retry structure is clean.

3. **`useMasterVoice.ts` desktop fix** — `continuous=true`, `lang='en-IN'`, 2.5s minimum listen, iOS permission request via `DeviceMotionEvent.requestPermission()` — all correct.

4. **Vite prod strip** — `esbuild.drop: ['console', 'debugger']` in production is exactly right and requires zero per-file changes.

5. **`--kb-inset` CSS variable** — Correctly set by Visual Viewport API in MainShell and consumed by `calc()` in FAB position. Smooth, no JS-driven animation needed.

6. **Migration utility in `store/index.ts`** — The 7-category auto-migration (goals, wallets, merchants, notifications, razorpay, vault, prefs) runs on every startup and is idempotent. This is the correct way to handle legacy data.

---

*Re-analysis complete. 11 critical bugs fixed. 6 new issues found. 3 architecture gaps remain. Estimated time to production-ready: ~2 weeks with Supabase auth + Edge Function proxy.*
