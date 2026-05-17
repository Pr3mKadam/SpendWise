# SpendWise — Production Roadmap

> **Deep codebase analysis · All source files reviewed · May 17, 2026**
> Version 1.8 → Production 2.0+

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Critical Bugs — Fix Immediately](#3-critical-bugs--fix-immediately)
4. [Medium Bugs — Fix Soon](#4-medium-bugs--fix-soon)
5. [User-Reported Issues (15)](#5-user-reported-issues-15)
6. [Production Gaps](#6-production-gaps)
7. [Missing Features & Dashboards](#7-missing-features--dashboards)
8. [Phased Roadmap](#8-phased-roadmap)
9. [Priority Matrix](#9-priority-matrix)
10. [Quick Wins — Do Today](#10-quick-wins--do-today)
11. [Antigravity Master Prompt](#11-antigravity-master-prompt)
12. [Recommended Antigravity Skills](#12-recommended-antigravity-skills)
13. [Safe Editing Rules](#13-safe-editing-rules)

---

## 1. Project Overview

| Property | Value |
|---|---|
| **Type** | Progressive Web App (PWA) · Single Page App |
| **Tagline** | Local-first personal finance tracker with AI |
| **Current Phase** | 1.8 (stable demo) |
| **Target Phase** | 2.0 (production launch) |
| **Deployment** | Netlify (`finance-manager.netlify.app`) |
| **Users** | Consumer (India-first) |
| **Language** | English (en-IN locale) |
| **Default Currency** | ₹ INR |

### Views / Screens (23 total)

Dashboard · Analytics · History · Budget · Goals · Reports · Recurring · Subscriptions · Portfolio · Shared Wallets · Bank Sync · AI Advisor · Education · Gamification · Profile · Parental Control · Auth · Settings

> Every view has a **Mobile variant** (`*ViewMobile.tsx`) with responsive switching at the `xl` breakpoint via `useIsMobile()`.

---

## 2. Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool |
| Tailwind CSS | v4 | Utility styling |
| Framer Motion | 12 | Animations |
| Recharts | 3 | Charts & graphs |
| Lucide React | latest | Icons |
| react-hot-toast | latest | Toast notifications |
| react-virtuoso | latest | Virtualised lists |

### Storage & State
| Package | Version | Purpose |
|---|---|---|
| Zustand | 5 | Global state (4 slices) |
| Dexie.js | 4 | IndexedDB ORM |
| dexie-export-import | latest | Backup/restore |
| Web Crypto API | native | AES-256-GCM encryption |
| PBKDF2 | native | Key derivation (100k iterations) |

### AI & Services
| Package | Version | Purpose |
|---|---|---|
| Gemini 1.5 Flash | API | NLP, OCR, voice, advisor |
| Tesseract.js | 7 | Local OCR fallback |
| PeerJS | 1.5 | WebRTC P2P sync |
| Web Speech API | native | Voice commands |

### Tooling
| Package | Version | Purpose |
|---|---|---|
| vite-plugin-pwa | latest | PWA manifest + service worker |
| Workbox | latest | Offline caching (sw.js) |
| Vitest | 4 | Unit tests |
| happy-dom | latest | Test DOM environment |
| canvas-confetti | latest | Level-up celebration |

### State Store Slices
```
src/store/
  index.ts              ← Zustand store composition + dexieStorage adapter
  slices/
    financeSlice.ts     ← Transactions, budgets, categories, balance
    portfolioSlice.ts   ← Assets, liabilities, net worth
    gamificationSlice.ts← XP, levels, quests, badges, streak
    parentalSlice.ts    ← PIN, child mode, parental settings
```

---

## 3. Critical Bugs — Fix Immediately

> 🔴 These cause data loss, security issues, or completely broken features.

---

### BUG-01 · Authentication is Fake
**File:** `src/hooks/useAuth.tsx` (lines 35–43)

**Problem:**
- `useAuth` auto-creates a guest user with a random ID if no stored user found
- `AuthView.tsx` `handleSubmit` only does `localStorage.setItem + window.location.reload()`
- No password hashing, no token validation, no real sessions
- Anyone can "sign in" with any email string — no server check

**Fix:**
```typescript
// Wire the already-written Supabase service:
// src/services/supabase.ts already has signInWithEmail() and signUpWithEmail()
// They just need to be called from useAuth instead of the localStorage fake

// In useAuth.tsx — replace handleSignIn:
const signIn = async (email: string, password: string) => {
  const result = await supabaseRequest('auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (result.access_token) {
    sessionStorage.setItem(STORAGE_KEYS.SUPABASE_SESSION, result.access_token);
    setUser({ id: result.user.id, email: result.user.email });
  }
};
```

---

### BUG-02 · Goals Stored in Plaintext localStorage
**File:** `src/hooks/useGoals.ts` (line 5 — `GOALS_KEY = 'spendwise_goals_v1'`)

**Problem:**
- Goals bypass the AES-256-GCM encrypted IDB store entirely
- Stored as plaintext in `localStorage`
- Lost when `resetData()` is called (wipes Zustand but not localStorage)
- `db.goals` table already exists in `src/db/db.ts` — completely unused

**Fix:**
```typescript
// Create src/store/slices/goalsSlice.ts — add GoalsSlice to the store
// The existing dexieStorage adapter encrypts automatically
// Then update useGoals.ts to read from useStore() instead of localStorage
```

---

### BUG-03 · Shared Wallets in Plaintext localStorage
**File:** `src/hooks/useSharedWallets.ts` (line 21 — `'spendwise_shared_wallets_v2'`)

**Problem:** Group financial data, expense splits, member info — all plaintext. This is worse than individual data because it exposes other people's financial information.

**Fix:** Same as BUG-02 — create a `SharedSlice` in Zustand persisted through `dexieStorage`.

---

### BUG-04 · Razorpay Secret Key in Plaintext localStorage
**File:** `src/components/views/BankSyncView.tsx` + `src/constants/index.ts` (`STORAGE_KEYS.RZP_SECRET`)

**Problem:**
- Razorpay secret key (authorises real payments) stored in plaintext localStorage
- Old key remains after "migration" to encrypted store
- Any XSS or malicious browser extension can steal it

**Fix:**
```typescript
// Remove ALL plaintext localStorage fallbacks for API keys
// Always read through Zustand → dexieStorage (encrypted)
// One-time migration: read old key → encrypt → delete old key
// Long-term: Route Razorpay calls through Supabase Edge Function
// Secret never touches the client browser
```

---

### BUG-05 · Balance Trend Chart Shows Inverted Movements
**File:** `src/hooks/useTransactions.ts` — `balanceTrend` useMemo (~lines 130–155)

**Problem:** Sign error in the rolling-balance reconstruction loop. Debits appear as increases and credits appear as decreases. The 14-day chart is backwards.

**Fix (30 minutes):**
```typescript
// WRONG:
runningBalance -= (tx.type === 'credit' ? amount : -amount);

// CORRECT:
runningBalance += tx.type === 'credit' ? -amount : amount;
```

---

### BUG-06 · categorySpending.percent Always Returns 0
**File:** `src/hooks/useTransactions.ts` — `categorySpending` useMemo (~line 75)

**Problem:** `percent: 0` is hardcoded and never recalculated. Every spending donut tooltip, analytics percentage, and category breakdown shows 0%.

**Fix (30 minutes):**
```typescript
const totalDebitAmount = Array.from(map.values()).reduce((a, b) => a + b, 0);

return Array.from(map.entries())
  .map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: mergedColors[name] || '#14b8a6',
    percent: totalDebitAmount > 0                          // ← was always 0
      ? Math.round((value / totalDebitAmount) * 100)
      : 0,
  }))
  .sort((a, b) => b.value - a.value);
```

---

### BUG-07 · Voice Command Categories Don't Match App Categories
**File:** `src/services/VoiceService.ts` (Gemini prompt, line ~28)

**Problem:**

| Prompt says (wrong) | App actually uses |
|---|---|
| Bills | Utilities |
| Investment | Business |
| Others | *(doesn't exist)* |
| *(missing)* | Subscriptions |
| *(missing)* | Travel |

Voice-added transactions silently get wrong categories.

**Fix (1 hour):**
```typescript
// Update the Gemini prompt string to use exact DefaultCategory values:
`category must be one of: Food, Subscriptions, Transport, Entertainment,
 Shopping, Utilities, Health, Travel, Education, Business, Income`
```

---

### BUG-08 · addContribution Stale Closure Bug
**File:** `src/hooks/useGoals.ts` (~line 70)

**Problem:** `addContribution` reads `goals` from the render-time closure. Two rapid contributions read stale state and the second overwrites the first.

**Fix:**
```typescript
const addContribution = useCallback(async (id: string, amount: number) => {
  setGoals(prev => {                              // ← functional update = no stale closure
    const existing = prev.find(g => g.id === id);
    if (!existing) return prev;
    const newSaved = Math.min(existing.savedAmount + amount, existing.targetAmount);
    const next = prev.map(g =>
      g.id === id
        ? { ...g, savedAmount: Math.round(newSaved * 100) / 100,
               status: computeStatus({ ...g, savedAmount: newSaved }) }
        : g
    );
    saveGoals(next);
    return next;
  });
}, []);  // No deps — pure functional update, no stale closure possible
```

---

### BUG-09 · Merchant Memory in Plaintext localStorage
**File:** `src/utils/razorpaySync.ts` (`MEMORY_KEY = 'spendwise_merchant_memory'`)

**Problem:** Merchant name → category mappings in plaintext. Merchant names are financial PII (reveals where you shop, eat, travel).

**Fix:** Move merchant memory into the Zustand store persisted through `dexieStorage`.

---

### BUG-10 · resetLimits() and toggleRollover() Not Implemented
**File:** `src/types/state.ts` (declared) + `src/store/slices/financeSlice.ts` (missing)

**Problem:** `BudgetState` interface declares both methods. Neither is in `financeSlice.ts`. Calling either throws `TypeError: store.resetLimits is not a function`. `useBudgets` hook also doesn't expose `toggleRollover`.

**Fix:**
```typescript
// Add to financeSlice.ts:
resetLimits: () => set(state => ({
  budgets: state.budgets.map(b => ({ ...b, spent: 0 })),
})),

toggleRollover: (categoryId: string) => set(state => ({
  budgets: state.budgets.map(b =>
    b.category === categoryId ? { ...b, rollover: !b.rollover } : b
  ),
})),
```

---

## 4. Medium Bugs — Fix Soon

> 🟡 Incorrect behaviour that users will notice but doesn't cause data loss.

---

### BUG-11 · MonthlyStats.topCategory and categoryDistribution Always Undefined
**File:** `src/hooks/useTransactions.ts` — `monthlyStats` useMemo

**Problem:** Both fields declared in `MonthlyStats` type but never computed. AI Advisor and Reports views silently get `undefined`.

**Fix:** Compute both fields inside `monthlyStats` useMemo:
```typescript
const sorted = Object.entries(catMap).sort(([,a],[,b]) => b - a);
return {
  // ...existing fields...
  topCategory: sorted[0]?.[0],
  categoryDistribution: Object.fromEntries(sorted),
};
```

---

### BUG-12 · forecastNextMonth Inflated on 1st of Month
**File:** `src/utils/insights/forecast.ts`

**Problem:** `daysElapsed = 1` on the 1st → burn rate × 30 = wildly inflated forecast shown on the 1st of every month.

**Fix:**
```typescript
const MIN_DAYS = 5; // Need at least 5 days of data for reliable forecast
if (daysElapsed < MIN_DAYS) {
  return { forecast: null, confidence: 'low', reason: 'Insufficient data — check back after day 5' };
}
```

---

### BUG-13 · Education Lessons Not Personalised by userRole
**File:** `src/data/lessons.ts` + `src/components/views/EducationView.tsx`

**Problem:** `userRole` from onboarding (`student/professional/business`) is stored in config but never used to filter lessons. Student and CEO see identical content.

**Fix:** Filter lessons array by `userRole` tag before rendering. Each lesson in `lessons.ts` needs a `roles: string[]` field.

---

### BUG-14 · PWA Install Prompt Never Works on iOS
**File:** `src/hooks/usePWAInstall.ts` + `index.html`

**Problem:** `beforeinstallprompt` is Android Chrome only. iOS uses a different flow. Missing critical Apple meta tags in `index.html`.

**Fix — `index.html`:**
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SpendWise">
<link rel="apple-touch-icon" href="/icons/pwa-192x192.png">
<link rel="apple-touch-startup-image" href="/icons/pwa-512x512.png">
```

**Fix — `usePWAInstall.ts`:**
```typescript
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (isIOS) setShowIOSGuide(true); // Show "tap Share → Add to Home Screen"
```

---

### BUG-15 · Notifications Stored Outside Encrypted Store
**File:** `src/hooks/useNotifications.ts`

**Problem:** `spendwise_read_notifications_v1` and `spendwise_snoozed_notifications_v1` in plain localStorage. Notification content references budget amounts (financial PII).

**Fix:** Consolidate into Zustand `NotificationSlice` persisted through `dexieStorage`.

---

### BUG-16 · Voice Router Stale Navigate Callback
**File:** `src/lib/voiceCommands/commandRouter.ts` + `src/hooks/useMasterVoice.ts`

**Problem:** `navigate` callback passed to `executeCommand()` can become stale if the component re-renders between voice initiation and execution.

**Fix:**
```typescript
// In useMasterVoice.ts — use a stable ref:
const navigateRef = useRef(navigate);
useEffect(() => { navigateRef.current = navigate; }, [navigate]);

// Pass navigateRef.current (not navigate) to executeCommand
```

---

### BUG-17 · Default Balance Hardcoded as ₹5,200
**File:** `src/constants/index.ts` (`FINANCE_DEFAULTS.INITIAL_BALANCE = 5200`)

**Problem:** If onboarding save fails silently, new users start with ₹5,200. Should be `0`.

**Fix:** Change `INITIAL_BALANCE: 5200` → `INITIAL_BALANCE: 0`

---

## 5. User-Reported Issues (15)

> From handwritten notes + app screenshots · May 16–17, 2026

---

### Issue 1 · Privacy Mode Button Not Working
**Root cause:** `togglePrivacy()` updates `parentalState.hideBalances` in store, but Dashboard/Header reads a stale local state copy. Toggle and read are disconnected.

**Fix:** In `MainShell.tsx`:
```typescript
const privacyEnabled = useStore(state => state.parentalState.hideBalances);
const togglePrivacy  = useStore(state => state.togglePrivacy);
// Pass both to Header and all balance-displaying components
```

In every balance display:
```tsx
<span style={{ filter: privacyEnabled ? 'blur(8px)' : 'none', transition: 'filter 0.2s' }}>
  {formatCurrency(balance)}
</span>
```

---

### Issue 2 · Fake 3/5-Day Streak on First Login
**Root cause:** Fake auth creates random guest IDs. All sessions share the same IDB. Dev sessions accumulated streak days in that shared IDB. New "first login" reads old streak data.

**Fix — Stable device ID (immediate):**
```typescript
// useAuth.tsx — use stable device ID instead of random:
const stableId = localStorage.getItem('spendwise_device_id')
  || ('device_' + Math.random().toString(36).substr(2, 12));
localStorage.setItem('spendwise_device_id', stableId);
```

**Fix — Correct streak logic:**
```typescript
// gamificationSlice.ts — checkStreak():
const diffDays = Math.round((curr - last) / 86400000);
if (diffDays === 1) newStreak = state.streak + 1; // consecutive ✓
else if (diffDays > 1) newStreak = 1;             // broken
else return state;                                  // same day
```

---

### Issue 3 · Quick Add Not Working
**Root cause:** `processNaturalLanguageExpense()` returns `null` when Gemini key is missing and local heuristic also fails. UI has no null-guard — crashes silently.

**Fix in `MagicInput.tsx`:**
```typescript
if (!result) {
  const amount = parseFloat(input.replace(/[^0-9.]/g, '')) || 0;
  setPrediction({
    merchant: input.trim(), category: 'Shopping',
    amount, type: 'debit', confidence: 0.3,
  });
  setScanStatus('⚠️ Could not fully parse — please review below');
  return;
}
```

---

### Issue 4 · Snap Receipt: "Failed to parse receipt with Gemini"
**Root cause:** `OCRService.ts` throws immediately without Gemini key. Tesseract.js fallback (already installed) is never attempted.

**Fix — Add Tesseract fallback:**
```typescript
// After Gemini try/catch, add:
const { createWorker } = await import('tesseract.js');
const worker = await createWorker('eng');
const { data: { text } } = await worker.recognize(imageFile);
await worker.terminate();
// Then parse text for amount, date, merchant
```

---

### Issue 5 · Which Notifications Go to OS Notification Bar?
**Root cause:** Currently zero OS notifications. Everything is in-app toast only. Web Push API not implemented.

**Fix — Phase 1 (basic browser notifications):**
```typescript
// src/utils/pushNotification.ts (new file)
export async function requestNotificationPermission() {
  if (Notification.permission !== 'default') return Notification.permission === 'granted';
  return (await Notification.requestPermission()) === 'granted';
}

export function sendBrowserNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/icons/pwa-192x192.png' });
}
```

Trigger notifications for: budget 80% used · anomaly detected · goal target date approaching · subscription renewal tomorrow.

---

### Issue 6 · Phone Number Field Has No Verification
**Root cause:** No SMS provider configured. It's a plain text field.

**Immediate fix:** Mark as "Unverified" with a label badge.

**Real fix (Phase 2.0):** Supabase phone OTP via Twilio:
```typescript
await supabase.auth.signInWithOtp({ phone: '+91XXXXXXXXXX' });
await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
```

---

### Issue 7 · Login / Signup: Old Data Is Gone
**Root cause:** `signOut()` calls `window.location.reload()` which creates a NEW random guest ID. New ID sees empty store.

**Fix:** Use stable device ID (see Issue 2 fix). Also fix `signOut`:
```typescript
const signOut = useCallback(async () => {
  localStorage.removeItem('spendwise_user');
  // Do NOT remove 'spendwise_device_id' — preserves data linkage
  window.location.reload();
}, []);
```

---

### Issue 8 · Quick Add Shows "+$0 DEBIT" (3 bugs in 1)

**Bug A — Wrong currency ($):**
```typescript
// CurrencyContext.tsx — initialise synchronously from config:
const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
  try {
    const raw = localStorage.getItem('spendwise_config_v1');
    if (raw) { const c = JSON.parse(raw); if (c.currency) return c.currency; }
  } catch {}
  return '₹'; // Default INR, not $
});
```

**Bug B — Amount = 0 (NLP parser doesn't handle "5000RS" format):**
```typescript
// src/utils/parsers/nlp.ts — extend amount regex:
const amountMatch =
  text.match(/(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i) ||   // ₹500 / RS 500
  text.match(/\b([\d,]+\.?\d*)\s*(?:rs\.?|inr|rupees?)\b/i) || // 500rs
  text.match(/([\d,]+\.?\d*)/);                           // plain number
```

**Bug C — DEBIT when it should be CREDIT:**
```typescript
// Add income keyword detection to local NLP fallback:
const isCredit = /\b(income|salary|received|credited|earned|bonus|refund|cashback)\b/i.test(text);
return { ..., type: isCredit ? 'credit' : 'debit' };
```

---

### Issue 9 · Parental "Show Linking QR" Doesn't Show QR

**Root cause:** No QR library installed. Button is a stub.

**Fix — Step 1: Add to `index.html`:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

**Fix — Step 2: Create `LinkingQRModal.tsx`:**
```typescript
// In useEffect when modal opens:
new window.QRCode(qrRef.current, {
  text: JSON.stringify({ type: 'spendwise_child_link', parentId: user.id }),
  width: 200, height: 200,
});
```

---

### Issue 10 · Where Does Child Scan the QR?
**Root cause:** No child-side scanner exists anywhere in the app.

**Fix:** Add a "Link to Parent Account" button in `AuthView.tsx` that opens a camera-based QR scanner using `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` + `jsqr` for decoding.

---

### Issue 11 · Mic: "No Speech Detected" on Laptop
**Root cause:** Desktop Chrome fires `onend` within ~0.5s of silence (before user finishes speaking). Mobile has longer timeout. `continuous: false` also stops recording after first speech segment.

**Fix in `useMasterVoice.ts`:**
```typescript
recognition.continuous = true;    // Keep listening until manually stopped
recognition.interimResults = true; // Capture partial speech
recognition.lang = 'en-IN';        // Better for Indian accents

const MIN_LISTEN_MS = 2500;
const startTime = Date.now();

recognition.onend = async () => {
  const elapsed = Date.now() - startTime;
  if (!finalTranscript.trim() && elapsed < MIN_LISTEN_MS) {
    try { recognition.start(); return; } catch {} // Restart if too quick
  }
  // ... rest of logic
};
```

---

### Issue 12 · Shared Wallet "Share QR" Doesn't Show QR
**Root cause:** Same as Issue 9 — no QR library.

**Fix:** Reuse the QRCode CDN script from Issue 9 fix. Create an inline `GroupQRModal` component in `SharedTabs.tsx` that encodes `spendwise://join-group?id={groupId}`.

---

### Issue 13 · Shared Money "Invite via Email" Not Working
**Root cause:** No email sending service configured. The invite is stored locally but nothing is sent.

**Immediate fix — Use `mailto:` link:**
```typescript
const subject = encodeURIComponent(`Join my SpendWise group: ${groupName}`);
const body = encodeURIComponent(
  `Join "${groupName}" on SpendWise.\nGroup ID: ${groupId}`
);
window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
```

**Also add:** Copy invite link button → `navigator.clipboard.writeText(inviteLink)`.

**Real fix (Phase 2.0):** Supabase Edge Function + Resend API (3,000 free emails/month).

---

### Issue 14 · AI Advisor Not Working
**Root cause:** `getFinancialAdvice()` needs `VITE_GEMINI_API_KEY`. Without it, Gemini fails and the local fallback returns null/incomplete response. UI has no graceful handling.

**Fix — Ensure local fallback always returns advice:**
```typescript
// At end of advisor.ts — always run local engine as final fallback:
function generateLocalAdvice(stats: FinancialStats): string {
  if (stats.savingsRate < 0)
    return `## ⚠️ Spending More Than Earning\n...`;
  if (stats.savingsRate < 20)
    return `## 💡 Savings Opportunity\n...`;
  return `## ✅ Great Financial Health\n...`;
}
```

**Also add:** Show a "Using local engine — add Gemini API key for AI advice" banner when key is missing.

---

### Issue 15 · UPI Sync Not Proper
**Root cause:** UPI string parser regex doesn't cover all Indian bank formats (PhonePe/GPay/Paytm all differ). No review step before import.

**Fix — Improved parser covering all major Indian formats:**
```typescript
export function parseUPIDescription(desc: string) {
  const patterns = [
    /UPI\/(?:CR|DR)\/[^\/]+\/([^\/]+)\//i,  // PhonePe
    /UPI-([A-Z0-9\s]+)-[a-z@]/i,             // GPay / HDFC
    /PAYTM\/UPI\/([^\/]+)\//i,               // Paytm
    /TO\s+([A-Z\s]{3,30})\s+REF/i,          // Generic
  ];
  // ... try each pattern, extract merchant + UPI VPA + amount
}
```

**Also add:** Show a review table before importing so users can correct categories before saving.

---

## 6. Production Gaps

### A. Authentication & Sessions

| Gap | Status | Fix |
|---|---|---|
| Real auth (Supabase) | ❌ Fake | Wire `supabase.ts` → `useAuth` |
| Token refresh | ❌ Missing | Refresh JWT before 1hr expiry |
| Google OAuth | ❌ Missing | Supabase OAuth config |
| Row-Level Security | ❌ Not run | Run SQL in Supabase dashboard |
| WebAuthn / Biometric | ❌ PIN only | `navigator.credentials.get()` |
| MFA / TOTP | ❌ Hardcoded false | Supabase MFA AMR claim |
| Rate limiting (client) | ❌ Missing | Exponential backoff on login |

---

### B. Data Architecture

| Gap | Status | Fix |
|---|---|---|
| Goals in encrypted IDB | ❌ localStorage | Create `GoalsSlice` |
| Shared wallets in encrypted IDB | ❌ localStorage | Create `SharedSlice` |
| Notifications in encrypted IDB | ❌ localStorage | Create `NotificationSlice` |
| Merchant memory in encrypted IDB | ❌ localStorage | Move to Zustand slice |
| Supabase bidirectional sync | ❌ Written but not wired | Call `syncAll()` post-login |
| Legacy data migration | ❌ Missing | Auto-migrate on first load |

---

### C. Payment Services

| Gap | Status | Fix |
|---|---|---|
| Razorpay (server-side) | ⚠️ Client-exposed | Supabase Edge Function proxy |
| Setu Account Aggregator | ❌ Not built | India bank import (RBI-approved) |
| Plaid | ❌ UI stub only | Wire Plaid Link SDK |
| UPI deep link | ❌ Missing | `upi://pay?...` intent URL |
| Razorpay webhook | ❌ Missing | Edge Function → auto-import paid |

---

### D. Security Hardening

| Gap | Status | Fix |
|---|---|---|
| CSP headers | ❌ Missing | `connect-src` limited to known domains |
| API key proxy | ❌ Client-exposed | Supabase Edge Functions for Gemini + Razorpay |
| Key rotation | ❌ Missing | Re-encrypt IDB when PIN changes |
| Audit log | ❌ Missing | Append-only IDB log (login/export/delete) |
| Subresource Integrity | ❌ Missing | `integrity` attr on CDN scripts |

---

### E. UX & Accessibility

| Gap | Status | Fix |
|---|---|---|
| ARIA roles | ❌ Zero in custom components | Add role + aria-label everywhere |
| Focus trap in modals | ❌ Missing | `focus-trap-react` or custom hook |
| Keyboard navigation | ❌ Missing | `tabIndex` + `onKeyDown` |
| Reduced motion | ❌ Missing | Wrap Motion in `useReducedMotion()` |
| Color contrast | ⚠️ Barely passes | `--text-muted` → `#475569` |
| iOS PWA tags | ❌ Missing | 5 Apple meta tags in `index.html` |
| Loading skeletons | ⚠️ Inconsistent | Add to Portfolio, Goals, Shared views |

---

### F. Testing

| Coverage | Status | Target |
|---|---|---|
| Unit tests | 3 files only | 30+ files |
| Component tests | 0 | All major components |
| Integration tests | 0 | All hooks with mocked IDB |
| E2E tests (Playwright) | 0 | Login → add tx → export flow |
| CI pipeline | ❌ Missing | GitHub Actions: lint + test + build |

---

## 7. Missing Features & Dashboards

### Dashboards to Add

| Dashboard | Components Exist? | Work Needed |
|---|---|---|
| Monthly Statement | `generateMonthlyReport()` (markdown only) | PDF with opening/closing balance |
| Financial Health Report Card | `HealthScoreChart` + `HealthIndexCard` | Unify into single report screen |
| Tax Estimator (dedicated) | `TaxPredictor.tsx` (buried in Analytics) | Promote to dedicated view |
| Subscription Intelligence | `SubscriptionManager` | Add annual cost + price creep + cancel ROI |
| Net Worth (dedicated) | `PortfolioView` (partial) | Full assets vs liabilities with trend |
| Cash Flow Statement | `CashFlowWaterfall.tsx` | Wire to dedicated view |

### Features to Add

| Feature | Priority | Notes |
|---|---|---|
| Split transaction | High | One tx → multiple categories |
| Duplicate transaction detection | High | Same amount ±1 min → flag |
| Multi-currency live rates | Medium | `open.er-api.com` (free) |
| Web Push notifications | High | Budget alerts, anomaly, goal risk |
| Auto-categorisation ML | High | TF.js on-device after 50+ transactions |
| Recurring bill detection | High | Auto-detect from patterns |
| Parental QR linking | High | Issues 9 + 10 — completely missing |
| Child-side QR scanner | High | No scanner exists |
| Email invites (real) | Medium | Supabase + Resend |

---

## 8. Phased Roadmap

---

### Phase 2.0 — Production Launch
**Timeline:** 3–4 weeks | **Focus:** Fix + Secure

```
[ ] BUG-01 → BUG-10 — All critical bugs fixed
[ ] Issue 1–15 — All user-reported bugs fixed
[ ] Real Supabase auth (email + Google OAuth)
[ ] Consolidate ALL localStorage → encrypted IDB
[ ] Supabase Edge Functions as API key proxy (Gemini + Razorpay)
[ ] CSP headers + SRI on CDN assets
[ ] iOS PWA meta tags
[ ] Accessibility pass (ARIA + keyboard nav + focus traps)
[ ] Vercel/Netlify deployment with proper cache headers
[ ] GitHub Actions CI: lint → test → build → deploy
[ ] Unit tests: encryption, crdt, commandParser, nlp, all store slices
```

---

### Phase 2.1 — Smart Finance Engine
**Timeline:** 4–6 weeks | **Focus:** AI + Data Quality

```
[ ] Auto-categorisation (TF.js on-device ML after 50+ transactions)
[ ] Setu Account Aggregator — real Indian bank statement import
[ ] Recurring bill detection with one-tap "Add to Subscriptions"
[ ] Smart savings automation ("set aside ₹X every payday")
[ ] Duplicate transaction detection (same amount ± 1 min)
[ ] Split transaction across multiple categories
[ ] Multi-currency with live exchange rates (open.er-api.com)
[ ] Supabase bidirectional sync — wired end-to-end
[ ] Web Push notifications (budget alerts, anomaly, goal risk)
[ ] UPI SMS parser (Android — auto-import from bank SMS)
```

---

### Phase 2.2 — Social & Collaboration
**Timeline:** 3–4 weeks | **Focus:** Shared Features

```
[ ] Replace PeerJS P2P with Supabase Realtime (shared wallets)
[ ] Bill splitting — equal or custom ratio + settlement tracking
[ ] Family Plan — 1 primary + 5 linked members
[ ] Social savings challenges — invite friends, leaderboard
[ ] Shareable read-only monthly report link
[ ] Real email invites (Supabase Edge Function + Resend)
[ ] Parental QR linking + child-side scanner (complete flow)
```

---

### Phase 2.3 — Wealth Builder
**Timeline:** 4–5 weeks | **Focus:** Investment & Goals

```
[ ] Investment portfolio tracker — stocks, MF, ETFs with live NSE prices
[ ] SIP planner with step-up SIP calculator
[ ] Debt avalanche / snowball payoff planner
[ ] Emergency fund calculator (6-month expense target)
[ ] FIRE number / retirement calculator
[ ] Insurance gap analyser
[ ] India tax estimator — old vs new regime side-by-side
[ ] Dedicated Net Worth dashboard
[ ] Monthly PDF statement generator
```

---

### Phase 2.4 — Advanced AI
**Timeline:** 3–4 weeks | **Focus:** Proactive Intelligence

```
[ ] Multi-turn AI advisor chat (persistent context — Anthropic Claude API)
[ ] Proactive Web Push notifications (budget, anomaly, goal risk)
[ ] Receipt auto-import via email forwarding (Supabase email hook)
[ ] Spend forecast with seasonality detection
[ ] WhatsApp bot ("spent 500 on food" → auto-adds transaction)
[ ] Spending personality deep-dive (not just archetype label)
```

---

### Phase 2.5 — Platform Expansion
**Timeline:** 6–8 weeks | **Focus:** New Surfaces

```
[ ] React Native app (shared store + utils, UI layer rebuilt)
[ ] Browser extension (Chrome/Firefox — auto-capture online purchases)
[ ] CA / Accountant mode — manage multiple clients' finances
[ ] Tally / QuickBooks / Zoho export formats
[ ] Public API (OAuth-secured) for third-party integrations
```

---

## 9. Priority Matrix

| Priority | Item | File(s) | Effort | Impact | Act Now? |
|---|---|---|---|---|---|
| **P0** | BUG-01: Real auth | `useAuth.tsx` + `supabase.ts` | 2 days | 🔴 Critical | ✅ |
| **P0** | BUG-02: Goals → encrypted | `useGoals.ts` + new slice | 4h | 🔴 Critical | ✅ |
| **P0** | BUG-04: Razorpay secret | `BankSyncView.tsx` | 2h | 🔴 Security | ✅ |
| **P0** | BUG-05: Balance chart reversed | `useTransactions.ts` | 30m | 🔴 Wrong data | ✅ |
| **P0** | BUG-06: percent = 0 | `useTransactions.ts` | 30m | 🔴 Wrong data | ✅ |
| **P0** | Issue 8: $0 DEBIT | `CurrencyContext` + `nlp.ts` | 2h | 🔴 Broken UX | ✅ |
| **P0** | Issue 7: Data loss on re-login | `useAuth.tsx` | 45m | 🔴 Data loss | ✅ |
| **P1** | BUG-03: Shared wallets → encrypted | new slice | 1 day | 🟠 Security | Soon |
| **P1** | BUG-07: Voice categories | `VoiceService.ts` | 1h | 🟠 Wrong data | ✅ |
| **P1** | Issue 1: Privacy mode | `MainShell.tsx` | 1h | 🟠 Broken UX | ✅ |
| **P1** | Issue 2: Fake streak | `gamificationSlice.ts` | 30m | 🟠 Wrong data | ✅ |
| **P1** | Issue 3: Quick Add | `MagicInput.tsx` | 45m | 🟠 Core feature | ✅ |
| **P1** | Issue 4: Receipt scan | `OCRService.ts` | 2h | 🟠 Core feature | ✅ |
| **P1** | Issue 11: Mic on laptop | `useMasterVoice.ts` | 1h | 🟠 Core feature | ✅ |
| **P1** | Issue 13: Email invite | `SharedModals.tsx` | 1h | 🟠 Broken UX | ✅ |
| **P1** | Issue 14: AI Advisor | `advisor.ts` | 1.5h | 🟠 Core feature | ✅ |
| **P1** | Supabase bidirectional sync | `syncEngine.ts` | 2 days | 🟠 Cloud backup | Sprint 1 |
| **P1** | Edge Function API proxy | New Edge Functions | 1 day | 🟠 Security | Sprint 1 |
| **P2** | CSP headers | `vite.config.ts` / Netlify | 2h | 🟡 Security | Sprint 2 |
| **P2** | iOS PWA meta tags | `index.html` | 15m | 🟡 ~50% of users | ✅ |
| **P2** | BUG-10: Missing store actions | `financeSlice.ts` | 1h | 🟡 Crash risk | ✅ |
| **P2** | Issue 9+12: QR codes | New modal components | 2h | 🟡 Stub feature | Sprint 2 |
| **P2** | ARIA + keyboard nav | All components | 3 days | 🟡 Compliance | Sprint 2 |
| **P2** | Unit test suite | `src/__tests__/` | 3 days | 🟡 Reliability | Sprint 2 |
| **P3** | Auto-categorisation ML | New `src/ml/` module | 1 week | 🟢 UX | Phase 2.1 |
| **P3** | Setu AA bank import | New service | 2 weeks | 🟢 India market | Phase 2.1 |
| **P3** | Supabase Realtime (shared) | `syncEngine.ts` | 1 week | 🟢 Reliability | Phase 2.2 |
| **P3** | WhatsApp bot | Supabase Edge Function | 1 week | 🟢 India UX | Phase 2.4 |
| **P4** | React Native app | New project | 6 weeks | 🔵 Mobile | Phase 2.5 |
| **P4** | Browser extension | New project | 2 weeks | 🔵 Auto-capture | Phase 2.5 |

---

## 10. Quick Wins — Do Today

Each fix below takes under 30 minutes and directly resolves a real user-facing bug.

---

### QW-1 · Fix categorySpending percent (30 min)
**File:** `src/hooks/useTransactions.ts`
```typescript
// Add before the .map():
const totalDebitAmount = Array.from(map.values()).reduce((a, b) => a + b, 0);

// In the .map(), change percent:
percent: totalDebitAmount > 0 ? Math.round((value / totalDebitAmount) * 100) : 0,
```

---

### QW-2 · Fix balance trend reversal (30 min)
**File:** `src/hooks/useTransactions.ts`
```typescript
// WRONG:
runningBalance -= (tx.type === 'credit' ? amount : -amount);
// CORRECT:
runningBalance += tx.type === 'credit' ? -amount : amount;
```

---

### QW-3 · Fix voice command categories (1 hour)
**File:** `src/services/VoiceService.ts`
```typescript
// Update the Gemini prompt — change category list to:
`category must be one of: Food, Subscriptions, Transport, Entertainment,
 Shopping, Utilities, Health, Travel, Education, Business, Income`
```

---

### QW-4 · Fix addContribution stale closure (20 min)
**File:** `src/hooks/useGoals.ts`
```typescript
const addContribution = useCallback(async (id: string, amount: number) => {
  setGoals(prev => {
    const existing = prev.find(g => g.id === id);
    if (!existing) return prev;
    const newSaved = Math.min(existing.savedAmount + amount, existing.targetAmount);
    const next = prev.map(g =>
      g.id === id
        ? { ...g, savedAmount: Math.round(newSaved * 100) / 100,
               status: computeStatus({ ...g, savedAmount: newSaved }) }
        : g
    );
    saveGoals(next);
    return next;
  });
}, []); // No deps — pure functional update
```

---

### QW-5 · iOS PWA meta tags (15 min)
**File:** `index.html`
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SpendWise">
<link rel="apple-touch-icon" href="/icons/pwa-192x192.png">
<link rel="apple-touch-startup-image" href="/icons/pwa-512x512.png">
```

---

### QW-6 · Fix default currency from $ to ₹ (20 min)
**File:** `src/contexts/CurrencyContext.tsx`
```typescript
const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
  try {
    const raw = localStorage.getItem('spendwise_config_v1');
    if (raw) { const c = JSON.parse(raw); if (c.currency) return c.currency; }
  } catch {}
  return '₹'; // ← change from '$' to '₹'
});
```

---

### QW-7 · Fix default initial balance (5 min)
**File:** `src/constants/index.ts`
```typescript
// Change:
INITIAL_BALANCE: 5200,
// To:
INITIAL_BALANCE: 0,
```

---

### QW-8 · Add QRCode CDN for all QR features (5 min)
**File:** `index.html`
```html
<!-- Add in <head> — fixes Issues 9, 10, 12 all at once -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

---

## 11. Antigravity Master Prompt

> Copy this entire prompt and paste it at the start of any AI coding session on SpendWise. It gives the AI full project context so it generates accurate, idiomatic code without repeating known mistakes.

```
You are an expert full-stack TypeScript engineer working on SpendWise,
a production-grade personal finance PWA.

## Tech Stack
- React 19 + TypeScript 5.9, Vite 7, Tailwind CSS v4
- State: Zustand 5 with custom Dexie.js (IndexedDB) persistence adapter
- ALL financial data encrypted via AES-256-GCM through dexieStorage adapter
- DB: Dexie v4 — tables: transactions, goals, budgets, customCategories,
  sharedWalletEntries, sharedExpenses, householdSettings, assets, liabilities, config, keyval
- Cloud: Supabase — auth + sync in src/services/supabase.ts (NOT YET wired to useAuth)
- AI: Gemini 1.5 Flash for NLP/OCR/voice/advisor. ALL calls need local fallbacks.
- Animations: Framer Motion 12 | Icons: Lucide React | Charts: Recharts 3
- PWA: vite-plugin-pwa + Workbox service worker

## Design System (NEVER override)
- CSS variables: --teal (#14b8a6), --bg, --surface-card, --text-primary,
  --text-secondary, --text-muted, --border, --shadow-card, --radius-card
- Fonts: Manrope (var(--font-manrope)) for headings, Inter (var(--font-inter)) for body
- Dark mode: class .dark on <html>. All vars have dark overrides.
- Card pattern: className="card" (defined in src/index.css)
- Brand color: #14b8a6 (teal). Use var(--teal), never hardcode.

## File Structure
src/
  components/common/         # Header, Sidebar, NavTabs, Modal, etc.
  components/common/ui/      # Button, Input, Select, Modal, Icons (atomic)
  components/features/       # ai/, analytics/, budgets/, gamification/, goals/, etc.
  components/views/          # Full-page views + Mobile variants (*ViewMobile.tsx)
  components/layout/         # MainShell, ViewRenderer, AppModals
  hooks/                     # useTransactions, useBudgets, useGoals, etc.
  store/                     # Zustand store (index.ts + slices/)
  db/                        # Dexie database (db.ts, migration.ts, backup.ts)
  lib/                       # encryption.ts, crdt.ts, syncEngine.ts, voiceCommands/
  services/                  # supabase.ts, OCRService.ts, VoiceService.ts
  utils/                     # insights/, parsers/, merchantMapper.ts, razorpaySync.ts
  types/                     # finance.ts, state.ts, ui.ts, shared.ts
  contexts/                  # CurrencyContext.tsx
  constants/                 # index.ts (STORAGE_KEYS, FINANCE_DEFAULTS, FEATURES)

## Architecture Rules (follow strictly)
1. ALL financial data MUST persist through Zustand → dexieStorage (encrypted).
   NEVER use localStorage.setItem directly for financial data.
2. Zustand mutations: useStore.getState().action() outside React;
   useStore(state => state.action) inside React.
3. Every new view MUST have a Mobile variant. Switch via useIsMobile().
4. ALL external API calls (Gemini, Razorpay) MUST have a local fallback.
   The feature must work without the API key being set.
5. Use existing types from src/types/ before creating new ones.
6. Use existing UI primitives from src/components/common/ui/.
7. Animations: Framer Motion motion components only. Never CSS @keyframes
   for component transitions.
8. Loading states: show SkeletonLoader (src/components/common/SkeletonLoader.tsx).
9. No 'any' types except where truly unavoidable — add a comment explaining why.
10. Add aria-label and role to all interactive elements.

## Known Bugs — Do NOT Propagate These Patterns
- useGoals.ts uses localStorage → BUG. Always use Zustand store instead.
- useSharedWallets.ts uses localStorage → BUG. Same fix needed.
- categorySpending.percent is always 0 → BUG. Compute percent yourself if needed.
- MonthlyStats.topCategory is undefined → BUG. Null-check before reading.
- resetLimits() not implemented in store → BUG. Do not call it.
- VoiceService.ts has wrong category names → BUG. Use exact DefaultCategory values.
- CurrencyContext defaults to '$' → BUG. Default should be '₹'.
- INITIAL_BALANCE = 5200 → BUG. Should be 0.

## Exact Category Names (DefaultCategory type in src/types/finance.ts)
Food | Subscriptions | Transport | Entertainment | Shopping
Utilities | Health | Travel | Education | Business | Income

## Gemini API Call Pattern (ALWAYS follow this — with local fallback)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (apiKey) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text; // success
  } catch { /* fall through to local fallback */ }
}
// LOCAL FALLBACK ALWAYS HERE — feature must work without Gemini

## Adding a New Zustand Slice
// src/store/slices/mySlice.ts
import { StateCreator } from 'zustand';
import { SpendWiseStore } from '../index';

export interface MySlice {
  myData: SomeType[];
  addItem: (item: SomeType) => void;
}

export const createMySlice: StateCreator<
  SpendWiseStore, [['zustand/persist', unknown]], [], MySlice
> = (set) => ({
  myData: [],
  addItem: (item) => set(state => ({ myData: [...state.myData, item] })),
});
// Then: add MySlice to SpendWiseStore type and createMySlice to useStore in src/store/index.ts

## Feature Implementation Checklist
Before writing any code, verify:
[ ] Required types exist in src/types/ (don't create duplicates)
[ ] Required store actions exist (don't duplicate)
[ ] Using existing UI primitives from src/components/common/ui/
[ ] Mobile view variant added if new view
[ ] Gemini API call has local fallback
[ ] New state persists through Zustand (not localStorage)
[ ] TypeScript strict — no 'any'
[ ] aria-label on all interactive elements
[ ] Loading state handled (SkeletonLoader or spinner)
[ ] Error state handled (don't fail silently)
```

---

## 12. Recommended Antigravity Skills

> Skills are context files you add to your AI coding assistant project so it generates better, more accurate SpendWise code every time.

---

### SKILL-01 · `spendwise-architecture`
**Triggers:** Any code generation in SpendWise project

**What it contains:**
- Complete file structure map
- Design system CSS variables (exact values)
- All 4 Zustand slice interfaces (typed)
- Dexie table schema
- The `dexieStorage` adapter explanation
- The `CurrencyContext` API
- All `STORAGE_KEYS` constants
- The `DefaultCategory` union type
- Known bugs reference list

**Why it's needed:** Without this, AI generates code using `localStorage` for new state (like Goals and SharedWallets already incorrectly do). This skill prevents the most common category of bugs in SpendWise.

---

### SKILL-02 · `spendwise-gemini-patterns`
**Triggers:** Any AI feature, voice command, OCR, NLP, advisor

**What it contains:**
- Standard Gemini API call template (with local fallback)
- Exact model name: `gemini-1.5-flash`
- Prompt templates for: NLP parser, OCR, voice commands, advisor, category classification
- Correct `DefaultCategory` names for prompts
- Tesseract.js fallback pattern for OCR
- Local rule-based fallback patterns for NLP and advisor

**Why it's needed:** AI assistants frequently generate Gemini calls without fallbacks, use wrong model names, or generate prompts with category names that don't match the app's type system. This skill prevents all three.

---

### SKILL-03 · `spendwise-component-patterns`
**Triggers:** Creating or editing any React component

**What it contains:**
- Card component pattern (`className="card"` usage)
- Mobile/Desktop view switching pattern (`useIsMobile()`)
- Animation pattern (Framer Motion `motion` + `AnimatePresence`)
- Loading state pattern (`SkeletonLoader` usage)
- Toast pattern (`react-hot-toast` with SpendWise styling)
- Modal pattern (with focus trap requirement)
- Form pattern (no `<form>` tag — use button onClick)
- ARIA requirements for each component type

**Why it's needed:** Without this, AI generates components with hardcoded colors, missing mobile variants, CSS @keyframes instead of Framer Motion, and no ARIA attributes.

---

### SKILL-04 · `spendwise-voice-commands`
**Triggers:** Any change to voice commands, mic button, speech recognition

**What it contains:**
- Complete list of 30+ supported voice intents
- `commandRouter.ts` intent-to-action mapping
- `VoiceService.ts` Gemini prompt template
- `useMasterVoice.ts` state machine (idle → listening → processing → done)
- Correct `recognition.continuous = true` and `lang = 'en-IN'` settings
- The `executeCommand()` function signature
- Known bug: navigate callback staleness (useRef pattern)

**Why it's needed:** Voice system is the most complex feature. Without this skill, AI breaks the state machine, adds duplicate intents, or forgets the stale-navigate bug.

---

### SKILL-05 · `spendwise-security`
**Triggers:** Any feature involving data persistence, auth, API keys, payments

**What it contains:**
- Encryption flow: Zustand → `dexieStorage` → AES-256-GCM → IndexedDB
- What is and isn't encrypted (known gaps)
- PBKDF2 key derivation config (100k iterations, SHA-256)
- `STORAGE_KEYS` constants — which are safe vs sensitive
- API key proxy pattern (Edge Function template)
- Razorpay secret key rules (never client-side after Phase 2.0)
- Auth token storage rules (sessionStorage, not localStorage)

**Why it's needed:** Most critical skill. Without it, AI generates new `localStorage.setItem` calls for financial data, repeating the Goals and SharedWallets bugs.

---

### SKILL-06 · `spendwise-india-finance`
**Triggers:** Any feature involving payments, bank import, currency, tax, UPI

**What it contains:**
- Indian number formatting (lakhs/crores — `toLocaleString('en-IN')`)
- UPI string formats for PhonePe, GPay, Paytm, HDFC, ICICI, SBI
- Indian tax slabs (old regime vs new regime, FY 2025-26)
- Common Indian expense categories and merchant names
- Setu Account Aggregator API overview
- Razorpay API reference (order create, payment fetch, webhook)
- INR as default currency (symbol: ₹, code: INR)

**Why it's needed:** AI assistants default to US financial conventions. SpendWise is India-first. This skill ensures tax calculations use Indian slabs, UPI parsing covers all Indian bank formats, and amounts display in Indian number format.

---

### SKILL-07 · `spendwise-testing`
**Triggers:** Any test file, CI config, or `vitest` usage

**What it contains:**
- Vitest + happy-dom setup
- How to mock Dexie IDB in tests
- How to mock the Zustand store
- How to mock Gemini API calls
- Existing test file examples (`anomaly.test.ts`, `forecast.test.ts`)
- Test coverage targets per module
- Playwright E2E test patterns for SpendWise flows

**Why it's needed:** Without this, AI-generated tests import wrong mock libraries, fail to mock IDB correctly, or write tests that pass in isolation but fail in CI.

---

### SKILL-08 · `spendwise-parental`
**Triggers:** Any change to parental controls, teen mode, chore system, child linking

**What it contains:**
- Parental slice state shape (full TypeScript interface)
- PIN gate flow (how `ParentalPinGate` wraps the view)
- Teen mode vs Child mode differences
- Chore verification flow
- QR linking flow (parent generates → child scans)
- Approval queue data structure
- Spending limit enforcement points

**Why it's needed:** Parental controls are complex and have multiple interconnected states. AI frequently breaks the PIN gate when editing this module.

---

### Skills Priority Order

| Priority | Skill | Add When |
|---|---|---|
| 1 | `spendwise-architecture` | Day 1 — add to every session |
| 2 | `spendwise-security` | Day 1 — prevents most dangerous bugs |
| 3 | `spendwise-gemini-patterns` | Before any AI feature work |
| 4 | `spendwise-india-finance` | Before any payment/currency work |
| 5 | `spendwise-component-patterns` | Before any UI component work |
| 6 | `spendwise-voice-commands` | Before any voice feature work |
| 7 | `spendwise-testing` | Before writing any test |
| 8 | `spendwise-parental` | Before any parental feature work |

---

## 13. Safe Editing Rules

> Follow these every time you use an AI coding assistant on SpendWise.

```
✅ Fix ONE bug per session — test in browser before starting the next
✅ Only change the specific lines shown in the fix
✅ Add new files rather than rewriting existing ones
✅ If adding a feature, check src/types/ for existing types first
✅ If adding state, check the Zustand store for existing actions first
✅ Test on both mobile (Chrome DevTools) and desktop after every change
✅ Check dark mode after any style change

❌ Never rename existing files
❌ Never change import paths of working features
❌ Never use localStorage.setItem for financial data
❌ Never make Gemini/Razorpay calls without a local fallback
❌ Never hardcode '#14b8a6' — use var(--teal)
❌ Never install an npm package without checking if it's already installed
❌ Never rewrite a whole component to fix one behaviour
❌ Never batch multiple bug fixes in a single AI session
```

---

## Appendix: File Quick Reference

### Most-Edited Files (in order of change frequency)
```
src/hooks/useTransactions.ts     ← Core data hook (5 known bugs here)
src/hooks/useGoals.ts            ← Goals (needs migration to Zustand)
src/hooks/useAuth.tsx            ← Auth (needs real Supabase wiring)
src/store/slices/financeSlice.ts ← Finance state (missing 2 actions)
src/services/VoiceService.ts     ← Voice (wrong categories)
src/services/OCRService.ts       ← Receipt scan (missing Tesseract fallback)
src/utils/parsers/nlp.ts         ← NLP parser (weak regex for Indian formats)
src/utils/insights/advisor.ts   ← AI Advisor (broken fallback)
src/contexts/CurrencyContext.tsx ← Currency (wrong default $)
src/constants/index.ts           ← Constants (INITIAL_BALANCE = 5200)
index.html                       ← Missing iOS PWA tags + QRCode CDN
```

### Key Type Locations
```
src/types/finance.ts   → Transaction, Category, DefaultCategory, Budget, Goal
src/types/state.ts     → SpendWiseStore, FinanceState, BudgetState, GamificationState
src/types/ui.ts        → ModalProps, ViewProps, ChartData
src/types/shared.ts    → SharedWallet, SharedExpense, Member
```

### Environment Variables Required
```bash
VITE_GEMINI_API_KEY=        # Gemini 1.5 Flash — NLP, OCR, voice, advisor
VITE_SUPABASE_URL=          # Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Supabase anon/public key
VITE_RAZORPAY_KEY_ID=       # Razorpay key ID (public — safe client-side)
# NEVER put RAZORPAY_KEY_SECRET in .env — use Edge Function only
```

---

*Last updated: May 17, 2026 · Based on full source analysis of SpendWise v1.8*
