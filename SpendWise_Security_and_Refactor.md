# SpendWise — Security Audit + Folder Restructure
**Analysis date:** May 19, 2026 · **Build:** v4 (latest zip)

---

# ═══ PART A — COMPLETE SECURITY AUDIT ═══

## Security Score by Layer

| Layer | Score | Status |
|-------|-------|--------|
| Encryption at rest | 7/10 | ⚠️ Session seed in wrong storage |
| API key protection | 9/10 | ✅ Edge Function proxy working |
| Authentication | 6/10 | ⚠️ Supabase token in localStorage, PIN unsalted |
| Data export | 6/10 | ⚠️ Raw export is unencrypted plaintext |
| Network security | 6/10 | ⚠️ No CSP, CORS wildcard on Edge Function |
| XSS protection | 7/10 | ⚠️ 3 innerHTML usages, one risky |
| Biometric auth | 2/10 | ❌ Completely fake — random number |
| Console leaks | 7/10 | ⚠️ 24 console.error/warn in production |
| **Overall** | **6.5/10** | Needs fixes before launch |

---

## 🔴 CRITICAL Security Issues

### SEC-01 · Session Seed Comment Lies — Stored in `localStorage`, Not `sessionStorage`
**File:** `src/store/index.ts` lines 83–100  
**Risk:** Any XSS attack or malicious browser extension reads the encryption key directly

The code comment says:
```
• A random device UUID (the "seed") is generated once and stored in
  sessionStorage (evicted when the tab closes — never persisted to disk)
```

The actual code:
```typescript
function getOrCreateSessionSeed(): string {
  let seed = localStorage.getItem(SESSION_SEED_KEY);  // ← localStorage, NOT sessionStorage
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem(SESSION_SEED_KEY, seed);      // ← persists forever on disk
  }
  return seed;
}
```

**Impact:** The encryption key for ALL user financial data (transactions, goals, budgets, salaries) lives in plaintext `localStorage` as `sw_session_seed`. Any JavaScript running on the page — including a malicious browser extension or XSS payload — can read `localStorage.getItem('sw_session_seed')` and decrypt the entire IndexedDB database.

**Fix — use `localStorage` intentionally but be honest about the security model:**
```typescript
// src/store/index.ts — replace getOrCreateSessionSeed():

// OPTION A (Recommended for current architecture):
// Keep localStorage but acknowledge it's a device-bound key, not a secret.
// The security model is: data is opaque without the key, and the key
// is tied to the device. It stops casual snooping but not targeted attacks.
// Add a clear comment:

function getOrCreateSessionSeed(): string {
  const KEY = 'sw_session_seed';
  // NOTE: This key lives in localStorage (device-persistent).
  // It protects data from being readable without this device's seed,
  // but does NOT protect against XSS or malicious extensions on this device.
  // For stronger protection: derive key from user's PIN via PBKDF2 instead.
  let seed = localStorage.getItem(KEY);
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem(KEY, seed);
  }
  return seed;
}

// OPTION B (Stronger — derive from PIN, set on first use):
// Store only a salt in localStorage. Derive the key from user's PIN + salt.
// This means data is unreadable without the PIN even if localStorage is read.
// Requires the user to enter their PIN on first app load each session.
// Implement in Phase 2.1 when proper auth is fully wired.
```

---

### SEC-02 · PIN Hash Has No Salt — Vulnerable to Rainbow Table
**File:** `src/utils/security.ts`  
**Risk:** Parental PIN can be cracked offline from the stored hash

```typescript
// Current — UNSALTED SHA-256:
export async function hashPin(pin: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(pin));
  // ...
}
```

A 4-digit PIN has only 10,000 possible values. The SHA-256 of every 4-digit PIN can be computed in milliseconds. Anyone who reads the `parentPinHash` from the Zustand store (stored in IDB) can crack the PIN immediately with a precomputed table.

**Fix — add a device-specific salt:**
```typescript
// src/utils/security.ts — replace hashPin and verifyPinHash:

const PIN_SALT_KEY = 'sw_pin_salt';

function getPinSalt(): string {
  let salt = localStorage.getItem(PIN_SALT_KEY);
  if (!salt) {
    salt = crypto.randomUUID();
    localStorage.setItem(PIN_SALT_KEY, salt);
  }
  return salt;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = getPinSalt();
  const data = `${salt}:${pin}`;  // salt + pin before hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  const computed = await hashPin(pin);  // uses same device salt automatically
  return computed === hash;
}
```

---

### SEC-03 · Biometric Lock is Completely Fake
**File:** `src/components/features/auth/BiometricLock.tsx` lines 33–45  
**Risk:** Users believe their app is biometrically locked but it isn't

```typescript
const startScan = () => {
  setStatus('scanning');
  setTimeout(() => {
    const isSuccess = Math.random() > 0.1 || attempts > 1;  // ← RANDOM NUMBER
    if (isSuccess) {
      setStatus('success');
      setTimeout(onUnlocked, 1000);
    }
  }, 1800);
};
```

There is no real biometric authentication. The "biometric lock" is a 1.8-second animation followed by a random number check. Users who enable "Biometric Lock" in settings believe their finances are protected by fingerprint/face ID, but anyone can unlock it by tapping twice.

**Fix — use the real WebAuthn API:**
```typescript
// src/components/features/auth/BiometricLock.tsx — replace startScan:

const startScan = async () => {
  setStatus('scanning');
  haptic.medium();

  try {
    // Check if WebAuthn is available
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported on this device');
    }

    // Get the stored credential ID (set during biometric enrollment)
    const credentialId = localStorage.getItem('sw_biometric_credential_id');
    
    if (!credentialId) {
      // First time — enroll the biometric credential
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'SpendWise', id: window.location.hostname },
          user: {
            id: new TextEncoder().encode('spendwise-user'),
            name: 'SpendWise User',
            displayName: 'SpendWise User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',  // device biometric only
            userVerification: 'required',
          },
          timeout: 60000,
        }
      }) as PublicKeyCredential;
      
      if (cred) {
        localStorage.setItem('sw_biometric_credential_id', btoa(String.fromCharCode(
          ...new Uint8Array((cred.rawId as ArrayBuffer))
        )));
        setStatus('success');
        haptic.success();
        setTimeout(onUnlocked, 800);
      }
    } else {
      // Subsequent logins — verify with stored credential
      const credIdBytes = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ type: 'public-key', id: credIdBytes }],
          userVerification: 'required',
          timeout: 60000,
        }
      });
      setStatus('success');
      haptic.success();
      setTimeout(onUnlocked, 800);
    }
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      setStatus('error');
      setAttempts(prev => prev + 1);
    } else {
      // WebAuthn not available — fall back to PIN
      setStatus('error');
    }
    haptic.error();
    setTimeout(() => setStatus('idle'), 2000);
  }
};
```

---

### SEC-04 · Raw Database Export is Completely Unencrypted
**File:** `src/db/backup.ts` line 10  
**Risk:** "Raw Export" downloads all financial data as readable JSON

```typescript
// Current:
const blob = await exportDB(db, { prettyJson: true });
// Downloads: spendwise_backup_2026-05-19.json — human-readable plaintext
```

The UI says *"Raw Database Export/Import (unencrypted) for testing"* but this is shown to all users in the Profile view. A user who clicks "Export" expecting their data to be safe gets a plaintext JSON file with every transaction, budget, salary, and PIN hash.

**Fix — encrypt the raw export too, or remove it from production UI:**
```typescript
// Option A: Remove from production UI (recommended)
// In DataManagement.tsx — hide raw export behind a dev flag:
{import.meta.env.DEV && (
  <button onClick={onRawDBExport}>Raw Export (Dev Only)</button>
)}

// Option B: Encrypt the raw export automatically:
export const downloadDatabaseBackup = async (password: string) => {
  const blob = await exportDB(db, { prettyJson: false }); // compact, not pretty
  const text = await blob.text();
  const encrypted = await encryptData(text, password);    // use lib/encryption.ts
  
  const encBlob = new Blob([encrypted], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(encBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spendwise_backup_${new Date().toISOString().split('T')[0]}.swb`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## 🟠 MEDIUM Security Issues

### SEC-05 · Supabase Access Token in `localStorage` Instead of `sessionStorage`
**File:** `src/hooks/useAuth.tsx` lines 106, 130  
**Risk:** JWT tokens (1-hour expiry) persist across browser sessions

```typescript
localStorage.setItem('spendwise_supabase_token', res.access_token);
```

JWT access tokens should not outlive a browser session. `localStorage` persists even after closing the browser. If a user's device is borrowed or shared, the previous user's Supabase token remains readable.

**Fix — move to `sessionStorage`:**
```typescript
// useAuth.tsx — change both occurrences:
sessionStorage.setItem('spendwise_supabase_token', res.access_token);

// services/gemini.ts — update read:
const sessionToken = sessionStorage.getItem('spendwise_supabase_token') || supabaseAnonKey;
```

---

### SEC-06 · Edge Function CORS Wildcard — Accepts Requests From Any Origin
**File:** `supabase/functions/gemini-proxy/index.ts` line 5  
**Risk:** Any website can proxy Gemini requests through your Supabase function

```typescript
'Access-Control-Allow-Origin': '*',  // ← any site can call this
```

**Fix — restrict to your deployment domain:**
```typescript
// supabase/functions/gemini-proxy/index.ts — replace corsHeaders:
const ALLOWED_ORIGINS = [
  'https://your-spendwise-domain.vercel.app',
  'http://localhost:5173',  // dev only
];

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin === o);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  // ... rest unchanged
```

---

### SEC-07 · `innerHTML` Used With User-Controlled Data in BudgetAlertToast
**File:** `src/components/features/budgets/BudgetAlertToast.tsx` line 52  
**Risk:** XSS if category name or merchant name contains HTML

```typescript
toast.innerHTML = `<span style="...">${icon}</span><span>${message}</span>`;
```

`message` comes from `"You've used 90% of your ${category} budget"`. Category names come from user input (custom categories). A category named `<img src=x onerror=alert(1)>` would execute JavaScript.

**Fix — use `textContent` instead of `innerHTML`:**
```typescript
const iconSpan = document.createElement('span');
iconSpan.style.cssText = 'font-size:18px;flex-shrink:0';
iconSpan.textContent = icon;

const msgSpan = document.createElement('span');
msgSpan.textContent = message;  // textContent escapes HTML automatically

toast.appendChild(iconSpan);
toast.appendChild(msgSpan);
```

---

### SEC-08 · 24 `console.error`/`console.warn` Calls in Production Code
**File:** Multiple — `lib/syncEngine.ts`, `services/OCRService.ts`, `services/VoiceService.ts`, `db/backup.ts`, etc.

`vite.config.ts` correctly strips `console.log` in production via `esbuild.drop`. But `drop` only removes `console.log` and `console.debug` — **`console.error` and `console.warn` still ship** because they're considered important operational signals. However, some of these leak internal data:

```typescript
// VoiceService.ts:
console.error('Failed to parse Gemini response as JSON:', resultText);
// ↑ resultText contains the raw Gemini API response, possibly with sensitive context

// OCRService.ts:
console.error('Gemini API structure mismatch:', data);
// ↑ data is the full API response object
```

**Fix — strip all console in production via vite.config.ts:**
```typescript
// vite.config.ts — update esbuild:
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
  // 'console' drops ALL console.* including .error and .warn
},
```
Then replace important operational errors with a silent error reporter pattern.

---

### SEC-09 · No Rate Limiting on Edge Function — Gemini API Cost Abuse
**File:** `supabase/functions/gemini-proxy/index.ts`  
**Risk:** Anyone with your Supabase anon key can call your Gemini proxy unlimited times

The function only checks that an auth header is present but does not verify it's a valid Supabase JWT. The anon key is visible in client-side code, so anyone can craft requests to your proxy and run up your Gemini bill.

**Fix — verify the JWT is a real Supabase token:**
```typescript
// supabase/functions/gemini-proxy/index.ts — add after authHeader check:
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Verify token:
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid or expired token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
// Continue with Gemini call...
```

---

### SEC-10 · `ReportsView.tsx` Puts Raw DOM `innerHTML` Into Print Window
**File:** `src/components/views/ReportsView.tsx` line 78  
**Risk:** XSS in printed reports if transaction data contains HTML

```typescript
${printRef.current.innerHTML}
```

`printRef` is a div that renders transaction data including merchant names. Same risk as SEC-07.

**Fix — use `innerText` or sanitise before printing:**
```typescript
// Use textContent-only rendering for the print version
// Or add a simple sanitizer:
const sanitize = (html: string) => 
  html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
```

---

## ✅ What's Secure

| Area | Implementation | Assessment |
|------|---------------|-----------|
| AES-256-GCM encryption | `lib/encryption.ts` — correct algorithm, random salt+IV per encrypt | ✅ Strong |
| PBKDF2 key derivation | 100,000 iterations, SHA-256 | ✅ Strong |
| Gemini API key | Server-side only in Supabase Edge Function env | ✅ Correct |
| Razorpay key | Stored in encrypted SecuredSlice (IDB) | ✅ Correct |
| Goals/Wallets/Notifications | All in SecuredSlice — encrypted IDB | ✅ Correct |
| `.env.local` gitignored | Confirmed in `.gitignore` | ✅ Correct |
| Backup `.swb` format | AES-256-GCM with user password via `SecureExportModal` | ✅ Strong |
| Edge Function auth check | Validates `Authorization` header present | ✅ Basic |
| Privacy Shield | 30s visibility timeout, sessionStorage unlock flag | ✅ Good |
| Session token cleanup | `signOut` removes Supabase token from localStorage | ✅ Correct |

---

## Security Fix Priority

| # | Issue | Risk | Fix Time | Do Now? |
|---|-------|------|----------|---------|
| 1 | SEC-03: Fake biometric auth | High — misleads users | 2 hours | ✅ Yes |
| 2 | SEC-04: Raw export unencrypted | High — data leak | 15 min | ✅ Yes |
| 3 | SEC-02: PIN unsalted SHA-256 | High — rainbow table | 20 min | ✅ Yes |
| 4 | SEC-07: innerHTML XSS in toast | High — user input | 10 min | ✅ Yes |
| 5 | SEC-01: Session seed in localStorage | Medium — known limitation | 30 min | Sprint 1 |
| 6 | SEC-05: JWT in localStorage | Medium — session leak | 5 min | ✅ Yes |
| 7 | SEC-06: CORS wildcard | Medium — API abuse | 10 min | ✅ Yes |
| 8 | SEC-08: console.error ships data | Medium — info leak | 5 min | ✅ Yes |
| 9 | SEC-09: No JWT verification in proxy | Medium — cost abuse | 30 min | Sprint 1 |
| 10 | SEC-10: innerHTML in print view | Low — same-site only | 15 min | Sprint 1 |
| 11 | Missing CSP (from v4 analysis) | High — XSS prevention | 10 min | ✅ Yes |

---
---

# ═══ PART B — FOLDER STRUCTURE AUDIT & REFACTOR PLAN ═══

## Current Structure Problems

### Problem 1 — 3 Types of Files Mixed in `components/common/`
`components/common/` has 20 files mixing:
- **True atoms** (EmptyState, SkeletonLoader, Portal) — should be in `ui/`
- **App-specific smart components** (QuickAddModal, MasterMic, CommandPalette, PrivacyShield) — should be in `features/`
- **Layout utilities** (NavTabs, Sidebar, Header) — belong in `layout/`

### Problem 2 — Duplicate Files
```
components/features/goals/GoalsSummary.tsx       ← original
components/features/dashboard/GoalsSummary.tsx   ← duplicate (different component?)

components/features/subscriptions/SubscriptionCalendar.tsx
components/features/subscriptions/components/SubscriptionCalendar.tsx  ← exact duplicate

components/views/PortfolioView.tsx  ← portfolio is now a feature with its own components
components/features/wealth/         ← should be features/portfolio/ to match the view
```

### Problem 3 — Feature Folders in Wrong Domain
```
components/features/advisor/EducationCards.tsx   ← education card in advisor folder
components/features/sync/PlaidLink.tsx           ← Plaid is US-only (app targets India)
components/features/sync/Web3Link.tsx            ← stub only, no implementation
```

### Problem 4 — `hooks/` at Root Has No Domain Organisation
22 hooks dumped at `src/hooks/` with no grouping. `useBudgetManager.ts` is inside `features/budgets/hooks/` (correct) while `useBudgets.ts` is in root `hooks/` (inconsistent).

### Problem 5 — `utils/` Mixes Concerns
`utils/` has: parsers (sub-folder), insights (sub-folder), then loose files mixing everything — `security.ts`, `share.ts`, `merchantMapper.ts`, `razorpaySync.ts`, `upiPayment.ts`, `pushNotification.ts`, `export.ts`, `import.ts`.

### Problem 6 — `lib/` vs `utils/` Distinction is Unclear
- `lib/` has: `encryption.ts`, `crdt.ts`, `exportPDF.ts`, `haptic.ts`, `syncEngine.ts`, `voiceCommands/`
- `utils/` has: `security.ts`, `export.ts`, `import.ts`
- `encryption.ts` and `security.ts` are related but in different folders
- `export.ts` (utils) and `exportPDF.ts` (lib) are related but split

---

## Proposed New Structure

```
src/
│
├── app/                          ← WAS: App.tsx + layout/
│   ├── App.tsx
│   ├── MainShell.tsx             ← was components/layout/
│   ├── ViewRenderer.tsx          ← was components/layout/
│   └── AppModals.tsx             ← was components/layout/
│
├── features/                     ← WAS: components/features/ (renamed, moved up)
│   ├── auth/
│   │   ├── AuthView.tsx          ← was components/views/AuthView.tsx
│   │   ├── BiometricLock.tsx     ← was components/features/auth/
│   │   └── hooks/
│   │       └── useAuth.tsx       ← was hooks/useAuth.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardView.tsx
│   │   ├── DashboardViewMobile.tsx
│   │   ├── components/           ← was components/features/dashboard/
│   │   │   ├── DashboardHero.tsx
│   │   │   ├── MetricCards.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   ├── QuickAddPanel.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useDashboard.ts   ← extract from DashboardView (too large)
│   │
│   ├── transactions/             ← WAS: features/history/ (rename to domain name)
│   │   ├── HistoryView.tsx
│   │   ├── HistoryViewMobile.tsx
│   │   ├── components/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionRow.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useHistoryView.ts ← was components/features/history/useHistoryView.ts
│   │
│   ├── budget/                   ← RENAME: budgets → budget (singular domain)
│   │   ├── BudgetView.tsx
│   │   ├── BudgetViewMobile.tsx
│   │   ├── components/
│   │   │   ├── BudgetManager.tsx
│   │   │   ├── BudgetRow.tsx
│   │   │   ├── BudgetSummaryBar.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useBudgetManager.ts
│   │
│   ├── goals/
│   │   ├── GoalsView.tsx
│   │   ├── GoalsViewMobile.tsx
│   │   ├── components/
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalModal.tsx
│   │   │   ├── ContributeModal.tsx
│   │   │   └── ProgressRing.tsx
│   │   └── hooks/
│   │       └── useGoals.ts       ← was hooks/useGoals.ts
│   │
│   ├── analytics/
│   │   ├── AnalyticsView.tsx
│   │   ├── AnalyticsViewMobile.tsx
│   │   └── components/           ← was components/features/analytics/
│   │       ├── BalanceChart.tsx
│   │       ├── SpendingDonut.tsx
│   │       └── ...
│   │
│   ├── advisor/                  ← WAS: split between features/advisor/ and views/
│   │   ├── AdvisorView.tsx
│   │   ├── AdvisorViewMobile.tsx
│   │   └── components/
│   │       └── EducationCards.tsx ← move here from wrong location
│   │
│   ├── education/
│   │   ├── EducationView.tsx
│   │   └── components/
│   │       ├── LessonCard.tsx
│   │       ├── LessonModal.tsx
│   │       └── categoryConfig.tsx
│   │
│   ├── gamification/
│   │   ├── GamificationView.tsx
│   │   └── components/
│   │       ├── QuestsPanel.tsx
│   │       ├── BadgeGallery.tsx
│   │       ├── WealthCity.tsx
│   │       └── ...
│   │
│   ├── portfolio/                ← RENAME: wealth → portfolio (matches view name)
│   │   ├── PortfolioView.tsx
│   │   ├── PortfolioViewMobile.tsx
│   │   └── components/           ← was components/features/wealth/
│   │       ├── AddModal.tsx
│   │       ├── DebtPlanner.tsx
│   │       └── ...
│   │
│   ├── shared/                   ← WAS: features/shared/ (keep as-is)
│   │   ├── SharedView.tsx
│   │   └── components/
│   │       ├── SharedModals.tsx
│   │       └── SharedTabs.tsx
│   │
│   ├── subscriptions/
│   │   ├── components/
│   │   │   ├── SubscriptionCalendar.tsx  ← keep ONE, delete duplicate
│   │   │   ├── SubscriptionManager.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useSubscriptions.ts
│   │
│   ├── sync/                     ← WAS: features/sync/ + views/BankSyncView
│   │   ├── BankSyncView.tsx
│   │   └── components/
│   │       ├── UPILink.tsx
│   │       ├── RazorpayLink.tsx
│   │       ├── CSVImporter.tsx
│   │       ├── SyncDashboard.tsx
│   │       └── SelectSource.tsx
│   │       # REMOVE: PlaidLink.tsx (US-only, stub)
│   │       # REMOVE: Web3Link.tsx (stub only)
│   │
│   ├── parental/
│   │   ├── ParentalView.tsx
│   │   └── components/           ← was components/features/parental/
│   │       ├── ParentalDashboard.tsx
│   │       ├── LinkingQRModal.tsx
│   │       └── ...
│   │
│   ├── profile/
│   │   ├── ProfileView.tsx
│   │   ├── ProfileViewMobile.tsx
│   │   └── components/           ← was components/features/profile/
│   │       ├── ProfileForm.tsx
│   │       ├── DataManagement.tsx
│   │       └── ...
│   │
│   ├── reports/
│   │   └── ReportsView.tsx
│   │
│   └── recurring/
│       └── RecurringView.tsx
│
├── ui/                           ← WAS: components/common/ui/ (promoted to top-level)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── Toggle.tsx
│   ├── Alert.tsx
│   ├── Avatar.tsx
│   ├── PinInput.tsx
│   ├── StatusPill.tsx
│   ├── Icons.tsx
│   ├── EmptyState.tsx            ← was components/common/EmptyState.tsx
│   ├── SkeletonLoader.tsx        ← was components/common/SkeletonLoader.tsx
│   ├── Card.tsx                  ← was components/common/Card.tsx
│   └── Portal.tsx                ← was components/common/Portal.tsx
│
├── shell/                        ← WAS: components/common/ (smart app-level components)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── NavTabs.tsx
│   ├── CommandPalette.tsx
│   ├── MasterMic.tsx
│   ├── NotificationCenter.tsx
│   ├── PrivacyShield.tsx
│   ├── QuickAddModal.tsx
│   ├── OfflineIndicator.tsx
│   ├── PullToRefresh.tsx
│   ├── ServiceWorkerToast.tsx
│   ├── AlertBanner.tsx
│   ├── FeedbackModal.tsx
│   └── IOSInstallModal.tsx
│
├── store/                        ← Keep as-is (already well structured)
│   ├── index.ts
│   └── slices/
│       ├── financeSlice.ts
│       ├── gamificationSlice.ts
│       ├── parentalSlice.ts
│       ├── portfolioSlice.ts
│       └── securedSlice.ts
│
├── services/                     ← Keep, add rate-limiter util
│   ├── gemini.ts
│   ├── supabase.ts
│   ├── OCRService.ts
│   └── VoiceService.ts
│
├── hooks/                        ← Keep shared hooks only (feature hooks move to feature/)
│   ├── useMediaQuery.ts
│   ├── useTheme.ts
│   ├── usePWAInstall.ts
│   ├── useCountUp.ts
│   ├── useAppState.ts
│   └── useTransactions.ts        ← stays here (used across many features)
│
├── lib/                          ← Pure utilities with no React dependencies
│   ├── encryption.ts
│   ├── security.ts               ← MOVE FROM utils/security.ts
│   ├── crdt.ts
│   ├── haptic.ts
│   ├── syncEngine.ts
│   └── voice/                    ← RENAME: voiceCommands → voice
│       ├── commandParser.ts
│       ├── commandRouter.ts
│       ├── fallbackPatterns.ts
│       ├── tts.ts
│       └── types.ts
│
├── parsers/                      ← PROMOTE: was utils/parsers/ (important enough)
│   ├── nlp.ts
│   ├── upi.ts
│   ├── csv.ts
│   ├── ocr.ts
│   ├── voice.ts
│   └── common.ts
│
├── insights/                     ← PROMOTE: was utils/insights/
│   ├── advisor.ts
│   ├── anomaly.ts
│   ├── forecast.ts
│   ├── healthScore.ts
│   ├── budgetSuggestions.ts
│   └── reporting.ts
│
├── db/                           ← Keep as-is (already clean)
│   ├── db.ts
│   ├── backup.ts
│   └── migration.ts
│
├── types/                        ← Keep, consolidate
│   ├── index.ts                  ← re-export everything
│   ├── finance.ts
│   ├── state.ts
│   ├── gamification.ts
│   ├── portfolio.ts
│   ├── shared.ts
│   ├── sync.ts
│   └── ui.ts
│   # REMOVE: dom.ts (tiny, merge into types/index.ts)
│
├── utils/                        ← Only truly misc utils remain
│   ├── cn.ts
│   ├── avatar.ts
│   ├── pushNotification.ts
│   ├── share.ts
│   ├── razorpaySync.ts           ← move to features/sync/ eventually
│   ├── upiPayment.ts             ← move to features/sync/
│   ├── export.ts                 ← move to features/reports/
│   └── import.ts                 ← move to features/sync/
│
├── data/                         ← Keep as-is
│   ├── currencies.ts
│   ├── lessons.ts
│   ├── mockData.ts
│   └── portfolioConfig.ts
│
├── constants/
│   └── index.ts
│
└── contexts/
    └── CurrencyContext.tsx
```

---

## Refactor Migration Guide

### Phase 1 — Zero-Risk Cleanup (Do First, 2 hours)
These changes have no import ripple effects — just file deletions and renames:

```bash
# 1. Delete exact duplicate files:
rm src/components/features/subscriptions/components/SubscriptionCalendar.tsx
# (keep src/components/features/subscriptions/SubscriptionCalendar.tsx)

# 2. Delete stubs that don't work:
rm src/components/features/sync/PlaidLink.tsx   # US-only, not implemented
rm src/components/features/sync/Web3Link.tsx    # stub, not implemented

# 3. Move misplaced file:
mv src/components/features/advisor/EducationCards.tsx \
   src/components/features/education/EducationCards.tsx
# Update the import in EducationView.tsx

# 4. Delete the duplicate GoalsSummary:
# Check which one DashboardView imports and which GoalsView imports
# Keep the one each view needs, delete the truly duplicate one
# (they may be intentionally different — check before deleting)
```

### Phase 2 — Promote `components/common/ui/` (1 hour)
```bash
# Move ui/ out of components/common/
mv src/components/common/ui/ src/ui/

# Update all imports — run this to find them:
grep -rn "from.*components/common/ui/" src/ --include="*.tsx" --include="*.ts"
# Replace each: 'from "../../components/common/ui/Button"' → 'from "@/ui/Button"'

# Add path alias to vite.config.ts (already has path alias setup):
# In resolve.alias:
'@/ui': path.resolve(__dirname, './src/ui'),
```

### Phase 3 — Separate `shell/` from `common/` (2 hours)
```bash
# Create the shell/ directory
mkdir src/shell

# Move smart app-level components:
mv src/components/common/Header.tsx          src/shell/
mv src/components/common/Sidebar.tsx         src/shell/
mv src/components/common/NavTabs.tsx         src/shell/
mv src/components/common/CommandPalette.tsx  src/shell/
mv src/components/common/MasterMic.tsx       src/shell/
mv src/components/common/NotificationCenter.tsx src/shell/
mv src/components/common/PrivacyShield.tsx   src/shell/
mv src/components/common/QuickAddModal.tsx   src/shell/
mv src/components/common/OfflineIndicator.tsx src/shell/
mv src/components/common/PullToRefresh.tsx  src/shell/
mv src/components/common/ServiceWorkerToast.tsx src/shell/
mv src/components/common/AlertBanner.tsx    src/shell/
mv src/components/common/FeedbackModal.tsx  src/shell/
mv src/components/common/IOSInstallModal.tsx src/shell/

# Move pure common components to ui/:
mv src/components/common/EmptyState.tsx     src/ui/
mv src/components/common/SkeletonLoader.tsx src/ui/
mv src/components/common/Card.tsx           src/ui/
mv src/components/common/Portal.tsx         src/ui/
mv src/components/common/ErrorBoundary.tsx  src/ui/

# Add aliases:
'@/shell': path.resolve(__dirname, './src/shell'),
```

### Phase 4 — Promote `insights/` and `parsers/` (30 min)
```bash
mv src/utils/insights/ src/insights/
mv src/utils/parsers/  src/parsers/

# Add aliases:
'@/insights': path.resolve(__dirname, './src/insights'),
'@/parsers':  path.resolve(__dirname, './src/parsers'),

# Update imports — find them:
grep -rn "from.*utils/insights/" src/ --include="*.ts" --include="*.tsx"
grep -rn "from.*utils/parsers/" src/  --include="*.ts" --include="*.tsx"
```

### Phase 5 — Move `security.ts` to `lib/` (5 min)
```bash
mv src/utils/security.ts src/lib/security.ts
# Update the one import in parentalSlice.ts:
# 'from "../../utils/security"' → 'from "../../lib/security"'
```

### Phase 6 — Feature Co-location (Optional, 4 hours)
Move hooks that belong to a single feature into that feature's folder:
```bash
# These hooks are only used by one feature:
mv src/hooks/useGoals.ts           src/features/goals/hooks/
mv src/hooks/useSharedWallets.ts   src/features/shared/hooks/
mv src/hooks/usePortfolio.ts       src/features/portfolio/hooks/
mv src/hooks/useRecurring.ts       src/features/recurring/hooks/
mv src/hooks/useSubscriptions.ts   src/features/subscriptions/hooks/
mv src/hooks/useGamification.ts    src/features/gamification/hooks/
mv src/hooks/useAlerts.ts          src/features/budget/hooks/
mv src/hooks/useAutomations.ts     src/features/recurring/hooks/
mv src/hooks/useHealthHistory.ts   src/features/analytics/hooks/
mv src/hooks/useQuestReset.ts      src/features/gamification/hooks/
```

---

## `vite.config.ts` Path Aliases to Add

```typescript
// vite.config.ts — in resolve.alias:
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/ui':       path.resolve(__dirname, './src/ui'),
    '@/shell':    path.resolve(__dirname, './src/shell'),
    '@/features': path.resolve(__dirname, './src/features'),
    '@/lib':      path.resolve(__dirname, './src/lib'),
    '@/insights': path.resolve(__dirname, './src/insights'),
    '@/parsers':  path.resolve(__dirname, './src/parsers'),
    '@/store':    path.resolve(__dirname, './src/store'),
    '@/types':    path.resolve(__dirname, './src/types'),
    '@/hooks':    path.resolve(__dirname, './src/hooks'),
    '@/services': path.resolve(__dirname, './src/services'),
    '@/db':       path.resolve(__dirname, './src/db'),
    '@/data':     path.resolve(__dirname, './src/data'),
    '@/constants':path.resolve(__dirname, './src/constants'),
  }
}
```

---

## Refactoring Safety Rules

**Always do in this order:**
1. Add the path alias to `vite.config.ts` first
2. Move the file
3. Update imports in the moved file itself
4. Search for all other files that import it (`grep -rn "from.*OldPath"`)
5. Update each import
6. Run `npm run build` — zero errors means success
7. Commit one phase at a time, never all phases together

**Never:**
- Rename a file AND move it in the same step (do one or the other)
- Move a file that has circular imports (check with `madge src/store/index.ts`)
- Move `store/index.ts` — everything depends on it, too risky

**Always verify after each phase:**
```bash
npm run build       # zero TypeScript errors
npm run test        # unit tests still pass
npx playwright test # E2E tests still pass
```
