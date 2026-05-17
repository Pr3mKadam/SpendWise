# SpendWise — Full Production Roadmap

**Version:** 2026.05 · **Codebase Phase:** 1.8 · **Analysis Date:** May 17, 2026  
**Stack:** React 19 · TypeScript 5.9 · Vite 7 · Zustand 5 · Dexie 4 · Tailwind v4 · Supabase · Gemini 1.5 Flash

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Map](#2-tech-stack-map)
3. [All Screens & Views](#3-all-screens--views)
4. [Critical Bugs — Fix First](#4-critical-bugs--fix-first)
5. [Medium Bugs — Fix Soon](#5-medium-bugs--fix-soon)
6. [User-Reported Bugs (Handwritten Notes)](#6-user-reported-bugs-handwritten-notes)
7. [Production Gaps](#7-production-gaps)
8. [Quick Wins — Under 1 Day](#8-quick-wins--under-1-day)
9. [Phased Roadmap](#9-phased-roadmap)
10. [Antigravity Skills Roadmap](#10-antigravity-skills-roadmap)
11. [Master Prompt for AI Coding Assistants](#11-master-prompt-for-ai-coding-assistants)
12. [Priority Matrix](#12-priority-matrix)
13. [Safe Editing Rules](#13-safe-editing-rules)

---

## 1. Project Overview

SpendWise is a **local-first personal finance PWA** for Indian users. All data is stored on-device in AES-256-GCM encrypted IndexedDB. No cloud backend is required for core functionality. Gemini 1.5 Flash powers AI features with full local fallbacks.

| Attribute | Value |
|-----------|-------|
| Type | PWA · SPA · Local-first |
| Deployment | Vercel (finance-manager.netlify.app currently) |
| Primary Market | India (₹, UPI, Razorpay) |
| Auth Status | ⚠️ Fake localStorage auth — not production-ready |
| DB | Dexie v4 (IndexedDB) + Zustand 5 persist |
| Encryption | AES-256-GCM · PBKDF2 (100k iterations · SHA-256) |
| AI | Gemini 1.5 Flash · Tesseract.js v7 · Web Speech API |
| P2P | PeerJS 1.5 (WebRTC) for shared wallets |
| Phase | 1.8 complete · Phase 2.0 next |

---

## 2. Tech Stack Map

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool |
| Tailwind CSS | v4 | Styling |
| Framer Motion | 12 | Animations |
| Recharts | 3 | Charts |
| Lucide React | latest | Icons |
| react-hot-toast | latest | Toast notifications |
| react-virtuoso | latest | Virtualised lists |

### Storage & State
| Package | Version | Purpose |
|---------|---------|---------|
| Zustand | 5 | Global state |
| Dexie.js | 4 | IndexedDB ORM |
| dexie-export-import | latest | Backup/restore |
| Web Crypto API | native | AES-256-GCM encryption |

### AI & Integrations
| Package | Version | Purpose |
|---------|---------|---------|
| Gemini 1.5 Flash | API | NLP · OCR · Advisor · Voice |
| Tesseract.js | 7 | Local OCR fallback |
| PeerJS | 1.5 | P2P shared wallets |
| canvas-confetti | latest | Gamification celebrations |

### Tooling
| Package | Version | Purpose |
|---------|---------|---------|
| vite-plugin-pwa | latest | PWA + service worker |
| Workbox | latest | Offline caching strategy |
| Vitest | 4 | Unit testing |
| happy-dom | latest | DOM testing environment |

---

## 3. All Screens & Views

Every view has a **Mobile variant** (e.g., `DashboardView.tsx` + `DashboardViewMobile.tsx`) switched via `useIsMobile()` at the `xl` breakpoint.

| View | File | Status |
|------|------|--------|
| Dashboard | `DashboardView.tsx` | ✅ Working (balance chart bug) |
| Analytics | `AnalyticsView.tsx` | ✅ Working (percent bug) |
| Transaction History | `HistoryView.tsx` | ✅ Working |
| Budget Manager | `BudgetView.tsx` | ⚠️ `resetLimits` crash |
| Goals | `GoalsView.tsx` | ⚠️ Unencrypted localStorage |
| Reports | `ReportsView.tsx` | ✅ Working |
| Recurring Transactions | `RecurringView.tsx` | ✅ Working |
| Subscriptions | `SubscriptionView.tsx` | ✅ Working |
| Portfolio | `PortfolioView.tsx` | ✅ Working |
| Shared Wallets | `SharedView.tsx` | ⚠️ QR broken · invite broken |
| Bank Sync (UPI/Razorpay) | `BankSyncView.tsx` | ⚠️ Secret exposure |
| AI Advisor | `AIAdvisorView.tsx` | ❌ Broken without Gemini key |
| Financial Education | `EducationView.tsx` | ⚠️ Not personalised |
| Gamification | `GamificationView.tsx` | ⚠️ Fake streak |
| Profile / Settings | `ProfileView.tsx` | ⚠️ No phone OTP |
| Parental Controls | `ParentalView.tsx` | ⚠️ QR not working |
| Authentication | `AuthView.tsx` | ❌ Fake — no real auth |

---

## 4. Critical Bugs — Fix First

> Fix **one bug at a time**. Test in browser after each fix. Never batch multiple bug fixes.

---

### BUG-01 · Authentication is Fake

**File:** `src/hooks/useAuth.tsx` (lines 35–43)  
**Severity:** 🔴 Critical — Security  
**Effort:** 2 days

**Problem:**  
`useAuth` auto-creates a guest user if no stored user is found. `AuthView.tsx`'s `handleSubmit` only does `localStorage.setItem('spendwise_user', ...) + window.location.reload()`. No real password validation, no hashing, no session tokens. Anyone can sign up with any email string and gain access.

**Fix:**  
The `supabase.ts` service file is already fully written — it just needs to be wired to `useAuth`.

```typescript
// src/hooks/useAuth.tsx — replace fake signIn with:
const signIn = useCallback(async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  
  // Store token in sessionStorage (auto-cleared on tab close)
  sessionStorage.setItem(STORAGE_KEYS.SUPABASE_SESSION, data.session.access_token);
  setUser({
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name,
  });
}, []);
```

**Also required:**
- Set up Supabase project → get `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Add Google OAuth redirect URI in Supabase dashboard
- Run the RLS SQL policies already written in `supabase.ts` comments

---

### BUG-02 · Goals Stored in Plaintext localStorage

**File:** `src/hooks/useGoals.ts` (lines 5–12)  
**Severity:** 🔴 Critical — Security + Data Loss  
**Effort:** 4 hours

**Problem:**  
Goals are saved to `localStorage` key `spendwise_goals_v1` directly, bypassing the Dexie IndexedDB + AES-256-GCM store. Goals are lost on `resetData()` and stored in plaintext. The `db.goals` table exists in Dexie but is never used.

**Fix:**  
Create a `GoalsSlice` in Zustand and delete the hook's direct localStorage usage:

```typescript
// NEW: src/store/slices/goalsSlice.ts
export interface GoalsSlice {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (id: string, amount: number) => void;
}

export const createGoalsSlice: StateCreator<SpendWiseStore, [['zustand/persist', unknown]], [], GoalsSlice> = (set) => ({
  goals: [],
  addGoal: (goal) => set(state => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, updates) => set(state => ({
    goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
  })),
  deleteGoal: (id) => set(state => ({ goals: state.goals.filter(g => g.id !== id) })),
  addContribution: (id, amount) => set(state => ({
    goals: state.goals.map(g => g.id === id
      ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) }
      : g
    )
  })),
});
// Then merge into SpendWiseStore in src/store/index.ts
```

---

### BUG-03 · Shared Wallets Stored in Plaintext localStorage

**File:** `src/hooks/useSharedWallets.ts` (line 21)  
**Severity:** 🔴 Critical — Security  
**Effort:** 1 day

**Problem:**  
`localStorage.setItem('spendwise_shared_wallets_v2', ...)` — all group financial data, expense splits, and member info in plaintext. Group data is more sensitive than individual data because it exposes other people's financial information.

**Fix:**  
Same pattern as BUG-02 — create a `SharedSlice` in Zustand. The `db.sharedWalletEntries` and `db.sharedExpenses` tables already exist in Dexie.

---

### BUG-04 · Razorpay Secret Key in Plaintext localStorage

**File:** `src/components/views/BankSyncView.tsx` (lines 28–32)  
**Severity:** 🔴 Critical — Security  
**Effort:** 2 hours

**Problem:**  
`localStorage.getItem('spendwise_rzp_secret')` — Razorpay secret key (which can authorise real payments) stored in plaintext. Migration code moves it to encrypted store but leaves the old plaintext key until manually removed.

**Fix:**

```typescript
// src/components/views/BankSyncView.tsx — remove plaintext read entirely:
// BEFORE:
const key = useStore.getState().getRazorpayKey() || localStorage.getItem('spendwise_rzp_secret');

// AFTER:
const key = useStore.getState().getRazorpayKey(); // Only read from encrypted store

// Add a one-time migration on app startup (src/db/migration.ts):
export function migrateRazorpayKey() {
  const oldKey = localStorage.getItem('spendwise_rzp_secret');
  if (oldKey) {
    useStore.getState().setRazorpayKey(oldKey); // Stores encrypted in IDB
    localStorage.removeItem('spendwise_rzp_secret'); // Wipe immediately
  }
}
```

**Long-term:** Route all Razorpay API calls through a Supabase Edge Function. The secret key should never exist client-side at all.

---

### BUG-05 · Balance Trend Chart Shows Inverted Movements

**File:** `src/hooks/useTransactions.ts` — `balanceTrend` useMemo (~lines 130–155)  
**Severity:** 🔴 Critical — Wrong Data  
**Effort:** 30 minutes

**Problem:**  
Sign error in the rolling-balance reconstruction. For debit transactions going backwards: `runningBalance -= -amount` equals `runningBalance += amount` — wrong direction. Debits appear as gains, credits appear as losses.

**Fix:**

```typescript
// BEFORE (wrong):
runningBalance -= (tx.type === 'credit' ? amount : -amount);

// AFTER (correct):
runningBalance += tx.type === 'credit' ? -amount : amount;
```

---

### BUG-06 · categorySpending.percent Always Returns 0

**File:** `src/hooks/useTransactions.ts` — `categorySpending` useMemo (~line 75)  
**Severity:** 🔴 Critical — Wrong Data  
**Effort:** 30 minutes

**Problem:**  
Each `CategorySpend` object is created with `percent: 0` hardcoded and never recalculated. Spending Donut tooltips and Analytics category breakdowns always show 0%.

**Fix:**

```typescript
const totalDebitAmount = Array.from(map.values()).reduce((a, b) => a + b, 0);
return Array.from(map.entries())
  .map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: mergedColors[name] || '#14b8a6',
    percent: totalDebitAmount > 0 ? Math.round((value / totalDebitAmount) * 100) : 0, // ← was 0
  }))
  .sort((a, b) => b.value - a.value);
```

---

### BUG-07 · Privacy Mode Button Not Working

**File:** `src/components/layout/MainShell.tsx` + `src/components/common/Header.tsx`  
**Severity:** 🔴 Critical — Broken Feature  
**Effort:** 1 hour

**Problem:**  
`togglePrivacy()` in the parental slice modifies `parentalState.hideBalances`, but the Header and Dashboard read a different state path. The toggle fires but the UI never re-reads the updated value.

**Fix:**

```typescript
// src/components/layout/MainShell.tsx — ensure both read from same store path:
const privacyEnabled = useStore(state => state.parentalState.hideBalances);
const togglePrivacy  = useStore(state => state.togglePrivacy);

// Pass to Header:
<Header isPrivacyEnabled={privacyEnabled} onTogglePrivacy={togglePrivacy} />

// In DashboardView.tsx — blur all balance displays:
const privacyOn = useStore(state => state.parentalState.hideBalances);
<span style={{ filter: privacyOn ? 'blur(8px)' : 'none', transition: 'filter 0.2s' }}>
  {format(currentBalance)}
</span>
```

---

### BUG-08 · Old Data Lost on Re-Login

**File:** `src/hooks/useAuth.tsx`  
**Severity:** 🔴 Critical — Data Loss  
**Effort:** 45 minutes

**Problem:**  
Each "signup" creates a new guest user with a random ID. On sign-out + reload, a new random ID is created. The encrypted IDB data still exists but is now under a different user context, so the new session sees no data.

**Fix:**

```typescript
// src/hooks/useAuth.tsx — use a STABLE device ID instead of random each time:
useEffect(() => {
  const storedUser = localStorage.getItem('spendwise_user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  } else {
    // Generate once per device, never change it
    const stableId = localStorage.getItem('spendwise_device_id')
      || ('device_' + Math.random().toString(36).substr(2, 12));
    localStorage.setItem('spendwise_device_id', stableId);

    const guestUser = { id: stableId, email: 'guest@local' };
    localStorage.setItem('spendwise_user', JSON.stringify(guestUser));
    setUser(guestUser);
  }
  setAuthReady(true);
}, []);

// signOut — don't touch the stable device ID:
const signOut = useCallback(async () => {
  localStorage.removeItem('spendwise_user');
  // Do NOT remove spendwise_device_id
  window.location.reload();
}, []);
```

---

### BUG-09 · Quick Add Shows $0 DEBIT Instead of ₹5000 CREDIT

**File:** `src/contexts/CurrencyContext.tsx` + `src/utils/parsers/nlp.ts`  
**Severity:** 🔴 Critical — 3 bugs in one  
**Effort:** 2 hours

**Problem:**  
Three separate bugs compound:
1. `CurrencyContext` initialises synchronously as `'$'` before async config loads
2. NLP parser regex doesn't handle `"5000RS"` or `"5000rs"` Indian format
3. `"INCOME"` keyword not in type-detection — defaults to DEBIT

**Fix 1 — Currency default:**

```typescript
// src/contexts/CurrencyContext.tsx
const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
  try {
    const raw = localStorage.getItem('spendwise_config_v1');
    if (raw) {
      const config = JSON.parse(raw);
      if (config.currency) return config.currency as CurrencyCode;
    }
  } catch { /* ignore */ }
  return '₹'; // Default to Indian Rupees, not '$'
});
```

**Fix 2 — NLP parser amount extraction:**

```typescript
// src/utils/parsers/nlp.ts — handle Indian formats:
const amountMatch =
  text.match(/(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i) ||  // prefix: "RS 500", "₹500"
  text.match(/\b([\d,]+\.?\d*)\s*(?:rs\.?|inr|rupees?)\b/i) || // suffix: "500RS"
  text.match(/([\d,]+\.?\d*)/);                          // plain number fallback

const amount = amountMatch
  ? parseFloat(amountMatch[1].replace(/,/g, ''))
  : undefined;
```

**Fix 3 — Type detection:**

```typescript
// src/utils/parsers/nlp.ts — add credit/debit keyword detection:
const isCredit = /\b(income|salary|received|credited|earned|bonus|refund|cashback|reward)\b/i.test(text);

return {
  merchant,
  category,
  amount,
  type: isCredit ? 'credit' : 'debit', // was hardcoded 'debit'
  confidence: 0.6,
};
```

---

### BUG-10 · Mic "No Speech Detected" on Desktop/Laptop

**File:** `src/hooks/useMasterVoice.ts`  
**Severity:** 🔴 Critical — Broken Feature  
**Effort:** 1 hour

**Problem:**  
On desktop Chrome, `SpeechRecognition` fires `onend` within ~0.5 seconds of silence, triggering "no speech detected" before the user finishes speaking. Mobile has a longer default timeout. Also: no microphone permission check before starting.

**Fix:**

```typescript
// src/hooks/useMasterVoice.ts — add before recognition.start():
recognition.continuous = true;      // Keep listening until manually stopped
recognition.interimResults = true;  // Show partial results
recognition.lang = 'en-IN';         // Indian English — better for Indian accents

// Add 2.5 second minimum listen time:
const MIN_LISTEN_MS = 2500;
const startTime = Date.now();

recognition.onend = async () => {
  const elapsed = Date.now() - startTime;
  const transcript = finalTranscriptRef.current;

  // If stopped too fast with no speech, restart once (mic warmup)
  if (!transcript.trim() && elapsed < MIN_LISTEN_MS) {
    try { recognition.start(); return; } catch { /* already stopped */ }
  }

  if (!transcript.trim()) {
    setResult({ success: false, message: 'No speech detected. Check microphone permissions.' });
    setState('error');
    scheduleReset(3000);
    return;
  }
  // ... rest of existing onend logic
};

// Add permission check at start:
const permResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
if (permResult.state === 'denied') {
  setResult({ success: false, message: '🎙️ Microphone blocked. Enable in browser settings → Privacy → Microphone.' });
  setState('error');
  return;
}
```

---

### BUG-11 · Fake 3/5-Day Streak on First Login

**File:** `src/store/slices/gamificationSlice.ts`  
**Severity:** 🔴 Critical — Bad UX  
**Effort:** 30 minutes

**Problem:**  
Because auth is fake, all sessions share the same IDB database. Dev/test sessions have already accumulated streak days. New users see a streak that belongs to previous sessions.

**Fix:**

```typescript
// src/store/slices/gamificationSlice.ts — fix checkStreak logic:
checkStreak: () => set((state) => {
  const today = new Date().toISOString().split('T')[0];
  if (state.lastLoginDate === today) return state; // Already ran today

  let newStreak = 1; // Today always counts
  let xpBonus = 0;

  if (state.lastLoginDate) {
    const diffDays = Math.round(
      (new Date(today).getTime() - new Date(state.lastLoginDate).getTime()) / 86400000
    );
    if (diffDays === 1) {
      newStreak = state.streak + 1; // Genuine consecutive day
      xpBonus = 10;
    }
    // diffDays > 1 → streak broken, newStreak stays 1
  }

  if (xpBonus > 0) setTimeout(() => get().addXP(xpBonus), 0);
  return { streak: newStreak, lastLoginDate: today };
}),
```

---

### BUG-12 · Voice Command Categories Don't Match App Categories

**File:** `src/services/VoiceService.ts`  
**Severity:** 🔴 Critical — Wrong Data  
**Effort:** 1 hour

**Problem:**  
Gemini prompt uses `Bills`, `Investment`, `Others` — none of which exist in `DefaultCategory` type. Voice-added transactions get silently miscategorised.

**Fix:**

```typescript
// src/services/VoiceService.ts — update Gemini prompt category list:
// BEFORE:
`category: one of Food, Transport, Shopping, Bills, Entertainment, Health, Education, Investment, Income, Others`

// AFTER (matching DefaultCategory type exactly):
`category: MUST be one of exactly: Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Education, Business, Income`
```

Also update `src/lib/voiceCommands/commandParser.ts` to use the same list.

---

### BUG-13 · Receipt Scan Fails — "Failed to parse receipt with Gemini"

**File:** `src/services/OCRService.ts`  
**Severity:** 🔴 Critical — Broken Feature  
**Effort:** 2 hours

**Problem:**  
`OCRService.ts` throws immediately if `VITE_GEMINI_API_KEY` is not set, with no Tesseract.js fallback attempted. Tesseract.js v7 is already installed but never called from OCRService.

**Fix:**

```typescript
// src/services/OCRService.ts — add Tesseract fallback:
export const processReceipt = async (imageFile: File): Promise<OCRResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      // ... existing Gemini OCR code (keep unchanged) ...
      return geminiResult;
    } catch (geminiError) {
      console.warn('Gemini OCR failed, falling back to Tesseract:', geminiError);
    }
  }

  // Tesseract.js fallback:
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(imageFile);
  await worker.terminate();

  // Extract total amount from receipt text:
  const totalMatch = text.match(/(?:total|amount|sub.?total)[^\d]*([\d,]+\.?\d*)/i)
                  || text.match(/([\d]{2,6}\.?\d{0,2})\s*$/m);
  const amount = totalMatch ? parseFloat(totalMatch[1].replace(',', '')) : 0;

  const lines = text.split('\n').filter(l => l.trim().length > 2);
  return {
    merchant: lines[0]?.trim().substring(0, 40) || 'Unknown',
    amount,
    date: new Date().toISOString().split('T')[0],
    rawText: text,
  };
};
```

---

### BUG-14 · AI Advisor Not Working

**File:** `src/utils/insights/advisor.ts`  
**Severity:** 🔴 Critical — Broken Feature  
**Effort:** 1.5 hours

**Problem:**  
`getFinancialAdvice()` returns `null` or throws when Gemini key is missing. The local rule-based fallback is incomplete — it may return `undefined` for certain query types, which the UI doesn't handle and shows a broken state.

**Fix:**

```typescript
// src/utils/insights/advisor.ts — ensure local fallback ALWAYS returns a string:
function generateLocalAdvice(stats: FinanceStats): string {
  const { savingsRate, topCategories, net, totalSpent, totalIncome } = stats;

  if (totalIncome === 0) {
    return `## 📊 No Income Recorded Yet\n\nAdd your income transactions to unlock personalised advice.\n\n**[ACTION:ADD_TRANSACTION]**`;
  }
  if (savingsRate < 0) {
    return `## ⚠️ Spending More Than You Earn\n\nYou're spending **₹${Math.abs(net).toLocaleString()}** more than you earn this period. Your top expense: **${topCategories[0]?.name || 'Unknown'}**.\n\n**Tip:** Set a budget for your top 3 categories.\n\n**[ACTION:CREATE_BUDGET]**`;
  }
  if (savingsRate < 20) {
    return `## 💡 Room to Save More\n\nYou're saving **${savingsRate}%** of income. The 50/30/20 rule targets 20% savings. You're ${20 - savingsRate}% away.\n\n**[ACTION:VIEW_ANALYTICS]**`;
  }
  return `## ✅ Healthy Finances\n\nYou're saving **${savingsRate}%** this period — great work! Net balance: **₹${net.toLocaleString()}**.\n\n**Next:** Set a savings goal to make your money work harder.\n\n**[ACTION:SET_GOAL]**`;
}

// In getFinancialAdvice — guarantee return:
export async function getFinancialAdvice(query: string, transactions: Transaction[]): Promise<string> {
  const stats = computeStats(transactions);

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      // ... existing Gemini call ...
    } catch { /* fall through */ }
  }

  return generateLocalAdvice(stats); // Always returns
}
```

---

### BUG-15 · UPI Sync Not Proper

**File:** `src/utils/razorpaySync.ts`  
**Severity:** 🔴 Critical — Core Feature  
**Effort:** 2 hours

**Problem:**  
UPI string parser regex doesn't handle all Indian bank SMS formats (PhonePe, GPay, Paytm, HDFC all differ). Imported transactions don't auto-categorise correctly.

**Fix:**

```typescript
// src/utils/razorpaySync.ts — replace UPI parser:
export function parseUPIDescription(description: string): ParsedUPI {
  const vpaMatch = description.match(/[\w.\-]+@[\w]+/);
  const upiId = vpaMatch ? vpaMatch[0].toLowerCase() : '';

  // Try multiple bank/app patterns:
  const merchantPatterns = [
    /UPI\/(?:CR|DR)\/[^\/]+\/([^\/]+)\//i,   // PhonePe
    /UPI-([A-Z0-9\s]+)-[a-z@]/i,              // GPay / HDFC
    /PAYTM\/UPI\/([^\/]+)\//i,                // Paytm
    /TO\s+([A-Z\s]{3,30})\s+REF/i,           // Generic NEFT/IMPS
  ];

  let merchant = '';
  for (const pattern of merchantPatterns) {
    const m = description.match(pattern);
    if (m?.[1]) { merchant = m[1].trim(); break; }
  }
  if (!merchant && upiId) merchant = upiId.split('@')[0];

  const amountMatch = description.match(/(?:rs|inr|₹)\.?\s*([\d,]+\.?\d*)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : undefined;

  return { merchant: merchant || 'UPI Payment', upiId, amount };
}
```

---

## 5. Medium Bugs — Fix Soon

### BUG-M01 · resetLimits() and toggleRollover() Not Implemented

**File:** `src/store/slices/financeSlice.ts`  
**Problem:** Both are declared in `BudgetState` interface but not implemented. Calling either throws a TypeError crash.  
**Fix:** Add both to `createFinanceSlice`:

```typescript
resetLimits: () => set(state => ({
  budgetState: { ...state.budgetState, limits: {} }
})),
toggleRollover: () => set(state => ({
  budgetState: { ...state.budgetState, rolloverEnabled: !state.budgetState.rolloverEnabled }
})),
```

---

### BUG-M02 · MonthlyStats.topCategory and categoryDistribution Always Undefined

**File:** `src/hooks/useTransactions.ts` — `monthlyStats` useMemo  
**Problem:** Both fields declared in type but never populated. AI Advisor and Reports may silently show incorrect data.  
**Fix:** Compute them in the useMemo:

```typescript
const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
return {
  ...existingStats,
  topCategory: sortedCats[0]?.[0],
  categoryDistribution: Object.fromEntries(sortedCats),
};
```

---

### BUG-M03 · forecastNextMonth Inflated on 1st of Month

**File:** `src/utils/insights/forecast.ts`  
**Problem:** `daysElapsed = 1` on the 1st → one day of spending × 30 = absurd forecast.  
**Fix:** Add minimum-data guard:

```typescript
const MIN_DAYS = 3;
if (daysElapsed < MIN_DAYS) {
  return { forecast: null, confidence: 'insufficient_data', message: 'Not enough data yet this month.' };
}
```

---

### BUG-M04 · Education Lessons Not Personalised by userRole

**File:** `src/data/lessons.ts` + `src/components/views/EducationView.tsx`  
**Problem:** `userRole` from onboarding (student/professional/business) stored in config but never used to filter lessons.  
**Fix:** Filter lessons array before rendering:

```typescript
const userRole = useStore(state => state.config.userRole);
const filteredLessons = lessons.filter(l =>
  !l.targetRoles || l.targetRoles.includes(userRole)
);
```

---

### BUG-M05 · PWA Install Prompt Never Works on iOS

**File:** `src/hooks/usePWAInstall.ts` + `index.html`  
**Problem:** `beforeinstallprompt` is Android-only. iOS Safari needs different meta tags and manual guide.  
**Fix (index.html):**

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SpendWise">
<link rel="apple-touch-icon" href="/icons/pwa-192x192.png">
```

**Fix (usePWAInstall.ts):**

```typescript
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (isIOS) setShowIOSGuide(true); // Show "tap Share → Add to Home Screen"
```

---

### BUG-M06 · Notifications and Merchant Memory Unencrypted

**Files:** `src/hooks/useNotifications.ts` · `src/utils/merchantMapper.ts`  
**Problem:** Both stored in plaintext localStorage. Notification alerts reference budget amounts (PII). Merchant names reveal spending habits.  
**Fix:** Move both into Zustand store slices with the same pattern as BUG-02 fix.

---

### BUG-M07 · Parental QR and Shared Wallet QR Not Showing

**File:** `src/components/features/parental/` + `src/components/features/shared/`  
**Problem:** No QR code library installed. Buttons are UI stubs.  
**Fix:** Add qrcode.js via CDN in `index.html`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

Then create `LinkingQRModal.tsx` and `GroupQRModal.tsx` components that use `new window.QRCode(ref.current, { text: data, width: 200, height: 200 })`.

---

### BUG-M08 · Invite via Email Not Working

**File:** `src/components/features/shared/SharedModals.tsx`  
**Problem:** No email service configured. Invite saved locally but nothing sent.  
**Short-term fix:** Use `mailto:` link to open user's email client with pre-filled invite body and Group ID.  
**Long-term fix (Phase 2.0):** Supabase Edge Function + Resend email API (3000 free emails/month).

---

### BUG-M09 · Phone Number in Profile Has No Verification

**File:** `src/components/features/profile/PersonalInfo.tsx`  
**Problem:** Plain text input, no OTP verification.  
**Fix:** Add "Unverified" badge label. Wire Supabase Phone Auth with Twilio OTP in Phase 2.0.

---

### BUG-M10 · Initial Balance Hardcoded ₹5200 Default

**File:** `src/constants/index.ts` (`FINANCE_DEFAULTS.INITIAL_BALANCE = 5200`)  
**Problem:** Arbitrary default. If onboarding save fails, user starts with ₹5,200 as their balance.  
**Fix:** Change to `0`. Require onboarding to set the initial balance explicitly.

---

## 6. User-Reported Bugs (Handwritten Notes)

Summary of all 15 issues from handwritten notebook + screenshot PDF, mapped to the bug IDs above:

| Note # | Reported Issue | Bug ID | Status |
|--------|---------------|--------|--------|
| 1 | Privacy mode button not working | BUG-07 | Fix documented |
| 2 | 3-day streak on first login | BUG-11 | Fix documented |
| 3 | Quick add not working | BUG-09 (Quick Win) | Fix documented |
| 4 | Snap receipt "Failed to parse" | BUG-13 | Fix documented |
| 5 | Which notifications on notification bar? | BUG-M06 | Web Push feature needed |
| 6 | Phone number no verification | BUG-M09 | Fix documented |
| 7 | Login/signup — old data lost | BUG-08 | Fix documented |
| 8 | $0 DEBIT instead of ₹5000 CREDIT | BUG-09 | Fix documented |
| 9 | Parental "Show Linking QR" not working | BUG-M07 | Fix documented |
| 10 | Where does child scan QR? | New feature | Implementation documented |
| 11 | Mic fails on laptop | BUG-10 | Fix documented |
| 12 | Shared wallet "Share QR" not showing | BUG-M07 | Fix documented |
| 13 | Invite via email not working | BUG-M08 | Fix documented |
| 14 | AI Advisor not working | BUG-14 | Fix documented |
| 15 | UPI sync not proper | BUG-15 | Fix documented |

---

## 7. Production Gaps

### Gap A — Authentication & Sessions

**Current state:** Fake localStorage auth. `mfaRequired: false` hardcoded. No token refresh.

**Required for production:**
- Wire `supabase.ts` service to `useAuth.tsx` (already written — just unwired)
- Store `access_token` + `refresh_token` in `sessionStorage`
- Add token refresh before 1-hour JWT expiry
- Enable Google OAuth and magic link flows via Supabase dashboard
- Run RLS SQL policies (already written in `supabase.ts` comments)
- Replace PIN-only `BiometricLock.tsx` with WebAuthn (`navigator.credentials.get()`)
- Rate-limit login attempts client-side with exponential backoff

---

### Gap B — Data Architecture

**Current state:** Data split across 4 places: Zustand+IDB (transactions, budgets, gamification), plain localStorage (goals, shared wallets, notifications, merchant memory), Supabase (inactive), PeerJS (shared wallets).

**Required for production:**
- Consolidate ALL state into Zustand + encrypted dexieStorage adapter
- Add `GoalsSlice`, `SharedSlice`, `NotificationSlice` to store
- Wire `syncAll()` from `supabase.ts` — called after login and on 5-minute interval
- Add `lastSyncAt` timestamp for incremental sync
- Add a one-time migration utility for legacy localStorage keys

---

### Gap C — Payment Services

**Current state:** Razorpay secret in localStorage. Plaid and Web3 are UI stubs.

**Required for production:**

| Service | What's Needed | Priority |
|---------|--------------|---------|
| Razorpay | Supabase Edge Function proxy — secret never client-side | P0 |
| Setu Account Aggregator | RBI-approved Indian bank import (Plaid doesn't work in India) | P1 |
| UPI deep link | `upi://pay?...` intent URL for in-app payments | P2 |
| Plaid | Wire actual PlaidLink SDK (global users) | P3 |
| Resend email | Transactional email for group invites | P1 |

---

### Gap D — Security Hardening

| Item | Action |
|------|--------|
| Content Security Policy | `connect-src` limited to Supabase + Gemini + Razorpay only |
| API key proxy | Gemini + Razorpay routed through Supabase Edge Functions |
| Key rotation | "Re-encrypt" option on PIN change |
| Audit log | Append-only IDB log: login, export, PIN change, parental override |
| SRI | `integrity` attributes on CDN scripts |
| Unify encryption | All persistence through `dexieStorage` — remove all direct `localStorage.setItem` for financial data |

---

### Gap E — Missing Dashboards

| Dashboard | What Exists | What's Missing |
|-----------|-------------|----------------|
| Monthly Statement | `generateMonthlyReport()` (markdown only) | Bank-statement view + PDF export |
| Financial Health Report Card | `HealthScoreChart`, `HealthIndexCard` (separate) | Unified single-screen summary |
| Tax Estimator | `TaxPredictor.tsx` buried in Analytics | Dedicated view + India old vs new regime |
| Subscription Intelligence | `SubscriptionManager` (basic) | Annual cost total + cancellation ROI |
| Net Worth Dashboard | `PortfolioView` (partial) | Debt payoff projector + asset allocation donut |

---

### Gap F — UX / Accessibility

| Issue | Fix Required |
|-------|-------------|
| ARIA roles | Add `role`, `aria-label`, `aria-describedby` to all interactive custom components (currently: none) |
| Focus trap in modals | `Modal.tsx` has no focus trap — Tab key escapes the modal |
| Reduced motion | Wrap all Framer Motion animations in `useReducedMotion()` check |
| Color contrast | `--text-muted: #64748b` on `#f8fafc` = 4.2:1 (barely WCAG AA). Darken to `#475569` |
| Keyboard navigation | Add `tabIndex` and `onKeyDown` Enter/Space to all custom div buttons |
| Screen reader | Add `aria-live="polite"` for toast and transaction confirmations |
| Error states | `Err` component exists but not used consistently — add to all forms |
| Loading states | Add `SkeletonLoader` to PortfolioView, GoalsView, SharedView |

---

### Gap G — Testing

**Current state:** 3 test files only — `anomaly.ts`, `forecast.ts`, `healthScore.ts`.

**Required for production:**

| Type | Files to Test |
|------|--------------|
| Unit | `encryption.ts`, `crdt.ts`, `commandParser.ts`, `nlp.ts`, `budgetSuggestions.ts`, all store slices |
| Hook integration | `useTransactions`, `useBudgets`, `useGoals` with mocked IDB |
| Component | `MagicInput`, `BudgetManager`, `GoalCard`, `AuthView` with React Testing Library |
| E2E | Login flow, add transaction, set budget, voice command, data export (Playwright) |

---

## 8. Quick Wins — Under 1 Day

These can be fixed today, each in under 30 minutes:

### QW-1 · Fix categorySpending percent (30 min)

```typescript
// src/hooks/useTransactions.ts — categorySpending useMemo
const totalDebitAmount = Array.from(map.values()).reduce((a, b) => a + b, 0);
return Array.from(map.entries()).map(([name, value]) => ({
  name, value: Math.round(value * 100) / 100,
  color: mergedColors[name] || '#14b8a6',
  percent: totalDebitAmount > 0 ? Math.round((value / totalDebitAmount) * 100) : 0,
})).sort((a, b) => b.value - a.value);
```

### QW-2 · Fix balance trend reversal (30 min)

```typescript
// src/hooks/useTransactions.ts — balanceTrend useMemo
runningBalance += tx.type === 'credit' ? -amount : amount; // was wrong
```

### QW-3 · Fix voice categories (1 hour)

```typescript
// src/services/VoiceService.ts — update Gemini prompt
// Change to: "Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Education, Business, Income"
```

### QW-4 · Fix addContribution stale closure (20 min)

```typescript
// src/hooks/useGoals.ts
const addContribution = useCallback(async (id: string, amount: number) => {
  setGoals(prev => {
    const existing = prev.find(g => g.id === id);
    if (!existing) return prev;
    const newSaved = Math.min(existing.savedAmount + amount, existing.targetAmount);
    return prev.map(g => g.id === id
      ? { ...g, savedAmount: Math.round(newSaved * 100) / 100 }
      : g
    );
  });
}, []); // pure functional update — no deps needed
```

### QW-5 · iOS PWA meta tags (15 min)

```html
<!-- index.html — add in <head> -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SpendWise">
<link rel="apple-touch-icon" href="/icons/pwa-192x192.png">
```

---

## 9. Phased Roadmap

### Phase 2.0 — Production Launch

**Timeline:** 3–4 weeks | **Goal:** Secure, stable, deployable

- [ ] Real Supabase auth (email + Google OAuth + magic link)
- [ ] Consolidate ALL localStorage data into encrypted IDB store (Goals, SharedWallets, Notifications, MerchantMemory)
- [ ] Fix all BUG-01 through BUG-15
- [ ] Fix all BUG-M01 through BUG-M10
- [ ] Supabase Edge Functions as API key proxy (Gemini + Razorpay)
- [ ] Content Security Policy headers
- [ ] iOS PWA meta tags + iOS install guide
- [ ] Accessibility pass: ARIA + keyboard nav + focus traps
- [ ] Vercel deployment with correct cache headers (`stale-while-revalidate`)
- [ ] GitHub Actions CI: lint + test + build on every PR
- [ ] Unit test suite: crypto, crdt, commandParser, nlp, all store slices

---

### Phase 2.1 — Smart Finance Engine

**Timeline:** 4–6 weeks | **Goal:** Smarter automation

- [ ] Auto-categorisation TF.js on-device ML (triggers after 50+ transactions)
- [ ] Setu Account Aggregator — real Indian bank statement import (RBI-approved)
- [ ] Recurring bill auto-detection from transaction patterns
- [ ] Smart savings automation — "set aside ₹X every payday" with voice confirmation
- [ ] Duplicate transaction detection (same amount within ±60 seconds)
- [ ] Split transaction across multiple categories
- [ ] Multi-currency with live exchange rates (open.er-api.com)
- [ ] Supabase bidirectional sync wired end-to-end with conflict resolution
- [ ] Real-time budget alerts via Web Push API

---

### Phase 2.2 — Social & Collaboration

**Timeline:** 3–4 weeks | **Goal:** Family and group finance

- [ ] Replace PeerJS P2P with Supabase Realtime for shared wallets (scalable, no NAT issues)
- [ ] Bill splitting — equal or custom ratio + settlement tracking
- [ ] Family plan — 1 primary account + up to 5 linked members
- [ ] Social savings challenges — invite friends, leaderboard via Supabase
- [ ] Shareable read-only monthly report link
- [ ] Parental controls integrated with Family Plan hierarchy
- [ ] Group invite via Resend email + SMS

---

### Phase 2.3 — Wealth Builder

**Timeline:** 4–5 weeks | **Goal:** Investment and long-term planning

- [ ] Investment portfolio tracker — stocks, mutual funds, ETFs with live prices (NSE API)
- [ ] SIP / Investment planner with step-up SIP calculator
- [ ] Debt avalanche / snowball payoff planner
- [ ] Emergency fund calculator (6-month expense target)
- [ ] FIRE / retirement calculator
- [ ] Insurance gap analyser
- [ ] Tax estimator — India old vs new regime side-by-side comparison

---

### Phase 2.4 — Advanced AI

**Timeline:** 3–4 weeks | **Goal:** Proactive and conversational AI

- [ ] Multi-turn AI advisor chat (persistent conversation context, not single-query)
- [ ] Android UPI SMS parser — auto-import from bank OTP messages (requires SMS permission)
- [ ] Receipt auto-import via email forwarding (Supabase email webhook)
- [ ] Seasonal spending forecast — detect December spikes, summer patterns
- [ ] WhatsApp bot — send "spent 500 on food" → auto-adds transaction via webhook

---

### Phase 2.5 — Platform Expansion

**Timeline:** 6–10 weeks | **Goal:** Multi-platform

- [ ] React Native app (shared `src/utils/` + `src/store/` logic works as-is)
- [ ] Browser extension — auto-capture online shopping transactions
- [ ] CA / Accountant mode — manage multiple clients from one dashboard
- [ ] Tally / QuickBooks export format
- [ ] WhatsApp Business integration
- [ ] Chrome extension for UPI-enabled websites

---

## 10. Antigravity Skills Roadmap

These are custom SKILL.md files to add to the Antigravity AI coding system. Each skill teaches the AI exactly how SpendWise works, preventing it from making common mistakes.

---

### SKILL 1 — `spendwise-core` (MUST ADD FIRST)

**Purpose:** Prevents the AI from repeating the most common architecture mistakes.  
**Trigger:** Any SpendWise code generation task.

```markdown
---
name: spendwise-core
description: Load before ANY SpendWise code task. Defines the architecture rules, 
  banned patterns, and critical type system for the SpendWise finance PWA (React 19 + 
  TypeScript + Zustand + Dexie IDB + Tailwind v4). Prevents localStorage misuse, 
  wrong category names, missing mobile variants, and other project-specific mistakes.
---

# SpendWise Core Architecture Rules

## Stack
React 19.2 · TypeScript 5.9 · Vite 7 · Tailwind v4 · Zustand 5 · Dexie 4 · Framer Motion 12

## THE ONE RULE: Never localStorage for Financial Data
ALL financial data MUST go through: Zustand store → dexieStorage adapter → encrypted IDB.
NEVER: localStorage.setItem() for transactions, goals, budgets, wallets, or any money data.
OK: localStorage for non-financial config (theme, device ID, session token).

## Category Names (copy exactly, from src/types/finance.ts DefaultCategory)
Food | Subscriptions | Transport | Entertainment | Shopping | Utilities | Health | Travel | Education | Business | Income

## Known Bugs — Do NOT Propagate
- useGoals.ts uses localStorage → BUG, don't copy
- categorySpending.percent = 0 → BUG, compute yourself if needed
- MonthlyStats.topCategory = undefined → BUG, null-check always
- resetLimits() not in store → BUG, don't call it
- VoiceService.ts has wrong categories → BUG, use list above

## File Locations
src/components/common/ui/     # Button, Input, Select, Modal
src/components/features/      # ai/, analytics/, budgets/, gamification/, goals/, parental/, shared/
src/components/views/         # *View.tsx + *ViewMobile.tsx for every view
src/hooks/                    # useTransactions, useBudgets, useGoals, useSharedWallets
src/store/slices/             # financeSlice, gamificationSlice, parentalSlice
src/types/                    # finance.ts, state.ts, ui.ts — check here FIRST before making new types
src/utils/insights/           # advisor.ts, forecast.ts, anomaly.ts, healthScore.ts

## Mobile Rule
Every new view needs TWO files: MyView.tsx (desktop) + MyViewMobile.tsx
Switch in MainShell via: const isMobile = useIsMobile(); // src/hooks/useMediaQuery.ts

## Design Tokens (CSS vars — never hardcode)
--teal: #14b8a6 (brand)  --bg  --surface-card  --text-primary  --text-secondary
--text-muted  --border  --shadow-card  --radius-card  --font-manrope  --font-inter
Dark mode: class .dark on <html>. All vars have dark overrides in src/index.css.
Card: className="card" (defined in src/index.css)

## Gemini Call Pattern (ALWAYS with local fallback)
if (import.meta.env.VITE_GEMINI_API_KEY) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
  } catch { /* fall through to local fallback */ }
}
// LOCAL FALLBACK ALWAYS HERE — feature must work without Gemini

## New Zustand Slice Template
// src/store/slices/mySlice.ts
import { StateCreator } from 'zustand';
import { SpendWiseStore } from '../index';
export interface MySlice { data: T[]; addItem: (item: T) => void; }
export const createMySlice: StateCreator<SpendWiseStore, [['zustand/persist', unknown]], [], MySlice> = (set) => ({
  data: [],
  addItem: (item) => set(state => ({ data: [...state.data, item] })),
});
// Then add to SpendWiseStore type and compose in src/store/index.ts
```

---

### SKILL 2 — `spendwise-bugfix`

**Purpose:** Stops the AI from "fixing" bugs in ways that break other things.  
**Trigger:** Any bug fix, debugging, or error investigation task.

```markdown
---
name: spendwise-bugfix
description: Load when fixing bugs in SpendWise. Provides safe editing rules, known 
  fragile areas, and surgical fix patterns that avoid breaking other features. The 
  SpendWise codebase has many interdependencies — this skill prevents cascade failures.
---

# SpendWise Safe Bug Fix Rules

## The Golden Rule
Fix ONE thing at a time. Test in browser after EACH fix. Never batch multiple bug fixes.

## Do NOT
- Rename or delete existing files (breaks imports across the project)
- Rewrite a whole component to fix one behavior
- Change import paths of working features
- Install new npm packages without checking package.json first
- Add any localStorage.setItem() for financial data

## Do
- Add new files rather than rewriting old ones
- Add null guards / fallbacks rather than restructuring logic
- Use functional setState updates (prev => ...) to avoid stale closure bugs
- Add the fix, then add a comment: // FIXED: BUG-XX description

## Fragile Areas — Extra Care
- src/lib/encryption.ts: Changing this breaks ALL stored data
- src/db/db.ts: Adding columns requires a migration version bump
- src/store/index.ts: Wrong persist config loses all user data
- src/hooks/useMasterVoice.ts: SpeechRecognition state machine is delicate
- src/lib/crdt.ts: Changing merge logic corrupts shared wallet sync

## Null-Safe Patterns Required In
- MonthlyStats.topCategory → always undefined, use ?.
- categorySpending[i].percent → always 0, compute yourself
- Gemini API responses → data.candidates?.[0]?.content?.parts?.[0]?.text
- useStore.getState() calls outside React → wrap in try/catch

## Before Any Fix
1. Read the specific file mentioned in the bug
2. Identify the exact line(s) to change
3. Change ONLY those lines
4. Test that specific feature in the browser
5. Check that nearby features still work
```

---

### SKILL 3 — `spendwise-store`

**Purpose:** Correct Zustand + Dexie patterns for state management.  
**Trigger:** Any task involving state, data persistence, or new data types.

```markdown
---
name: spendwise-store
description: Load when adding new state, slices, or persistence to SpendWise. Covers 
  the Zustand 5 + Dexie 4 + AES-256-GCM encrypted storage architecture. Prevents 
  the #1 mistake: using localStorage instead of the encrypted IDB store.
---

# SpendWise State Management

## Architecture
User Data → Zustand Store → dexieStorage adapter → Dexie IDB → AES-256-GCM encrypted

## Existing Slices
- financeSlice: transactions, budgets, config, assets/liabilities
- gamificationSlice: XP, level, streak, quests, badges
- parentalSlice: PIN, child limits, approval queue, hideBalances

## Dexie Tables (src/db/db.ts)
transactions | goals | budgets | customCategories | sharedWalletEntries
sharedExpenses | householdSettings | assets | liabilities | config | keyval

## Adding a New Slice — Full Template
// 1. Create src/store/slices/mySlice.ts
import { StateCreator } from 'zustand';
import { SpendWiseStore } from '../index';

export interface MySlice {
  myData: MyType[];
  addItem: (item: MyType) => void;
  updateItem: (id: string, updates: Partial<MyType>) => void;
  removeItem: (id: string) => void;
}

export const createMySlice: StateCreator<
  SpendWiseStore, [['zustand/persist', unknown]], [], MySlice
> = (set) => ({
  myData: [],
  addItem:    (item)          => set(s => ({ myData: [...s.myData, item] })),
  updateItem: (id, updates)   => set(s => ({ myData: s.myData.map(i => i.id === id ? {...i, ...updates} : i) })),
  removeItem: (id)            => set(s => ({ myData: s.myData.filter(i => i.id !== id) })),
});

// 2. src/store/index.ts — add to SpendWiseStore type intersection and useStore composition
// 3. The dexieStorage adapter automatically encrypts it — no extra work needed

## Reading State
// Inside React:
const myData = useStore(state => state.myData);
// Outside React (in utils, services, etc.):
const myData = useStore.getState().myData;

## NEVER DO THIS
localStorage.setItem('spendwise_my_data', JSON.stringify(data)); // ← WRONG
// Data is unencrypted and bypasses resetData() and sync

## Migration (if adding new Dexie table columns)
// src/db/db.ts — bump version and add migration:
this.version(N).stores({ myTable: '++id, userId, createdAt' }).upgrade(tx => {
  return tx.table('myTable').toCollection().modify(item => {
    item.newField = item.newField ?? 'defaultValue';
  });
});
```

---

### SKILL 4 — `spendwise-ai`

**Purpose:** Correct patterns for all Gemini/AI integrations.  
**Trigger:** Any task involving AI features, voice, OCR, NLP, or advisor.

```markdown
---
name: spendwise-ai
description: Load when working on AI features in SpendWise — Magic Input NLP, 
  Receipt OCR, Voice Commands, AI Advisor, anomaly detection, or forecasting. 
  Ensures every Gemini call has a local fallback and uses the correct API pattern.
---

# SpendWise AI Integration Rules

## AI Features Map
| Feature | File | Gemini Use | Local Fallback |
|---------|------|-----------|----------------|
| Magic Input (NLP) | src/utils/parsers/nlp.ts | Text → transaction JSON | Regex heuristics |
| Receipt OCR | src/services/OCRService.ts | Image → receipt JSON | Tesseract.js v7 |
| Voice Commands | src/services/VoiceService.ts | Speech → intent JSON | commandParser.ts |
| AI Advisor | src/utils/insights/advisor.ts | Query → markdown advice | Rule-based engine |
| Anomaly Detection | src/utils/insights/anomaly.ts | NOT USED | Z-score algorithm |
| Forecast | src/utils/insights/forecast.ts | NOT USED | Weighted average |

## Gemini API Call — Standard Pattern
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text?.trim()) return parseResult(text); // Always parse/validate before returning
  } catch (err) {
    console.warn('[SpendWise AI] Gemini failed, using local fallback:', err);
    // Fall through — NEVER rethrow here
  }
}
return localFallback(input); // ALWAYS present

## Gemini for JSON — Add JSON extraction
const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
if (!jsonMatch) throw new Error('No JSON in response');
return JSON.parse(jsonMatch[1]);

## Voice Command Category Names (MUST match DefaultCategory type exactly)
Food | Subscriptions | Transport | Entertainment | Shopping | Utilities | Health | Travel | Education | Business | Income
NEVER use: Bills, Investment, Others (these don't exist in the type)

## OCR Fallback — Tesseract.js v7 (already installed)
const { createWorker } = await import('tesseract.js');
const worker = await createWorker('eng');
const { data: { text } } = await worker.recognize(imageFile);
await worker.terminate();

## Advisor Response Format
Always return markdown. Action buttons use this format:
**[ACTION:ADD_TRANSACTION]** | **[ACTION:CREATE_BUDGET]** | **[ACTION:SET_GOAL]** | **[ACTION:VIEW_ANALYTICS]**
The UI parses these tags and renders interactive buttons.
```

---

### SKILL 5 — `spendwise-ui`

**Purpose:** Correct component patterns, design tokens, and mobile variants.  
**Trigger:** Any UI component creation or styling task.

```markdown
---
name: spendwise-ui
description: Load when building UI components or views for SpendWise. Covers the 
  design system tokens, component primitives, Framer Motion patterns, mobile variants, 
  and Tailwind v4 usage specific to this codebase.
---

# SpendWise UI System

## Design Tokens — Always Use CSS Vars (never hardcode colors)
--teal: #14b8a6        Brand primary
--bg                   Page background
--surface-card         Card background
--text-primary         Main text
--text-secondary       Muted text
--text-muted           Very muted text (#64748b light / darker in dark mode)
--border               Dividers
--shadow-card          Card drop shadow
--radius-card          Card border radius
--font-manrope         Headings (Manrope)
--font-inter           Body (Inter)

## Dark Mode
Class-based: .dark on <html>. All vars have dark overrides in src/index.css.
NEVER use Tailwind dark: prefix — use CSS vars instead.

## Component Primitives (src/components/common/ui/)
Button   Input   Select   Modal   Badge   SkeletonLoader   Spinner

## Card Pattern
<div className="card p-4">  {/* "card" class defined in src/index.css */}

## Mobile Variants — Required for Every New View
const isMobile = useIsMobile(); // src/hooks/useMediaQuery.ts — xl breakpoint
return isMobile ? <MyViewMobile /> : <MyView />;
// Create: src/components/views/MyView.tsx + MyViewMobile.tsx

## Loading State
Always show SkeletonLoader during async data load — never null or empty:
if (isLoading) return <SkeletonLoader rows={5} />;

## Animations — Framer Motion 12
import { motion, AnimatePresence } from 'framer-motion';
// Standard card entrance:
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
// ALWAYS add useReducedMotion() guard:
const shouldAnimate = !useReducedMotion();
initial={shouldAnimate ? { opacity: 0, y: 12 } : false}

## Charts — Recharts 3
import { LineChart, BarChart, PieChart, ... } from 'recharts';
// Always use CSS var colors in charts:
<Line stroke="var(--teal)" strokeWidth={2} dot={false} />

## Accessibility (Required on all interactive custom elements)
<div
  role="button"
  tabIndex={0}
  aria-label="Descriptive label"
  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handler() : null}
  onClick={handler}
>

## Toast Notifications
import toast from 'react-hot-toast';
toast.success('Transaction added');
toast.error('Failed to save');
```

---

### SKILL 6 — `spendwise-security`

**Purpose:** Prevents introducing security regressions.  
**Trigger:** Any task touching auth, encryption, API keys, payments, or data export.

```markdown
---
name: spendwise-security
description: Load when working on authentication, encryption, API key handling, 
  payment integrations, or data export in SpendWise. Prevents introducing security 
  vulnerabilities into this financial application.
---

# SpendWise Security Rules

## Encryption Architecture
Web Crypto API → AES-256-GCM → dexieStorage adapter → IndexedDB
Key derivation: PBKDF2 (100,000 iterations · SHA-256)
Session seed: localStorage. Salt: IndexedDB. Never send keys to any server.

## API Keys — Never Client-Side (Long Term)
Gemini API Key:   Supabase Edge Function proxy (Phase 2.0)
Razorpay Secret:  Supabase Edge Function proxy (Phase 2.0)
Current workaround: Store in Zustand encrypted store (encrypted IDB) — NOT localStorage

## Banned Patterns
localStorage.setItem('*key*', apiKey);          // NEVER — plaintext
localStorage.setItem('*secret*', secret);       // NEVER — plaintext
fetch('https://api.razorpay.com', { headers: { 'Authorization': `Basic ${btoa(key + ':' + secret)}` } }) // NEVER from browser

## Auth Rules
- Session tokens: sessionStorage only (auto-clear on tab close)
- Never store passwords — Supabase handles hashing (bcrypt)
- Rate-limit login attempts: 5 attempts → 30 second lockout → exponential backoff
- Token refresh: check expiry 5 minutes before, refresh silently

## Data Export Security
- Backup files (.swb): password-encrypted with AES-256-GCM before download
- PDF reports: generated client-side, never sent to server
- CSV export: add a warning "This file contains sensitive financial data"

## Content Security Policy (add to Vercel vercel.json)
{
  "headers": [{ "source": "/(.*)", "headers": [{
    "key": "Content-Security-Policy",
    "value": "default-src 'self'; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.razorpay.com; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
  }]}]
}
```

---

## 11. Master Prompt for AI Coding Assistants

Copy this entire prompt and paste it at the start of any AI coding session for SpendWise:

```
You are an expert full-stack TypeScript engineer working on SpendWise, a production-grade 
personal finance PWA for Indian users.

## Project
React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS v4 · Zustand 5 · Dexie 4 (IndexedDB)
Framer Motion 12 · Recharts 3 · Lucide React · Supabase · Gemini 1.5 Flash · Tesseract.js 7

## THE ONE RULE
ALL financial data MUST be persisted through: Zustand store → dexieStorage adapter → AES-256-GCM encrypted IndexedDB.
NEVER use localStorage.setItem() for any financial data. This is the #1 mistake to avoid.

## Category Names (match DefaultCategory type EXACTLY)
Food | Subscriptions | Transport | Entertainment | Shopping | Utilities | Health | Travel | Education | Business | Income
NEVER use: Bills, Investment, Others

## Known Bugs — Do NOT Repeat
- useGoals.ts uses localStorage (BUG — don't copy)
- categorySpending.percent = 0 (BUG — compute it yourself)
- MonthlyStats.topCategory = undefined (BUG — null-check always)
- resetLimits() not implemented in store (BUG — don't call it)
- VoiceService.ts has wrong categories (BUG — use list above)

## File Structure
src/components/common/ui/    # Button, Input, Select, Modal (use these, don't recreate)
src/components/features/     # Feature domain components
src/components/views/        # Full-page views (*View.tsx + *ViewMobile.tsx for each)
src/hooks/                   # useTransactions, useBudgets, useGoals, etc.
src/store/slices/            # financeSlice, gamificationSlice, parentalSlice
src/types/                   # Check here FIRST before creating new interfaces
src/utils/insights/          # advisor, forecast, anomaly, healthScore

## Design Tokens (use CSS vars — never hardcode)
--teal: #14b8a6 (brand)  --bg  --surface-card  --text-primary  --text-secondary
--text-muted  --border  --shadow-card  --radius-card  --font-manrope  --font-inter

## Gemini Call Pattern
if (import.meta.env.VITE_GEMINI_API_KEY) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      { method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text?.trim()) return parseResult(text);
  } catch { /* fall through */ }
}
return localFallback(input); // ALWAYS present

## New Slice Template
// src/store/slices/mySlice.ts
import { StateCreator } from 'zustand';
import { SpendWiseStore } from '../index';
export interface MySlice { data: T[]; addItem: (item: T) => void; }
export const createMySlice: StateCreator<SpendWiseStore, [['zustand/persist', unknown]], [], MySlice> = (set) => ({
  data: [],
  addItem: (item) => set(state => ({ data: [...state.data, item] })),
});

## Feature Checklist
Before implementing any feature:
1. Check src/types/ for existing interfaces
2. Check store for existing actions
3. Use UI primitives from src/components/common/ui/
4. Add Mobile variant if it's a new view
5. Wire Gemini with local fallback
6. Persist through Zustand store (NOT localStorage)
7. No 'any' types without a comment explaining why
8. Add aria-label and role to all interactive elements
```

---

## 12. Priority Matrix

| Priority | Item | Effort | Impact | Do First? |
|----------|------|--------|--------|-----------|
| P0 | BUG-01: Real Supabase auth | 2 days | Critical — security | ✅ Yes |
| P0 | BUG-02: Goals → encrypted store | 4h | Critical — security | ✅ Yes |
| P0 | BUG-04: Razorpay secret exposure | 2h | Critical — security | ✅ Yes |
| P0 | BUG-05: Balance chart reversal | 30min | Wrong data | ✅ Yes |
| P0 | BUG-06: categorySpending percent = 0 | 30min | Wrong data | ✅ Yes |
| P0 | BUG-07: Privacy mode broken | 1h | Feature broken | ✅ Yes |
| P0 | BUG-08: Old data lost on re-login | 45min | Data loss | ✅ Yes |
| P0 | BUG-09: $0 DEBIT / wrong currency | 2h | Wrong data | ✅ Yes |
| P0 | BUG-10: Mic fails on laptop | 1h | Feature broken | ✅ Yes |
| P0 | BUG-11: Fake streak | 30min | Bad UX | ✅ Yes |
| P0 | BUG-12: Voice wrong categories | 1h | Wrong data | ✅ Yes |
| P0 | BUG-13: Receipt scan fails | 2h | Feature broken | ✅ Yes |
| P0 | BUG-14: AI Advisor broken | 1.5h | Feature broken | ✅ Yes |
| P0 | BUG-15: UPI sync not proper | 2h | Feature broken | ✅ Yes |
| P1 | BUG-03: Shared wallets → encrypted | 1 day | Security | Sprint 1 |
| P1 | BUG-M01: resetLimits crash | 1h | Crash | ✅ Yes |
| P1 | BUG-M07: QR codes not working | 2h | Feature broken | Sprint 1 |
| P1 | BUG-M08: Invite via email | 1h | Feature broken | Sprint 1 |
| P1 | Supabase bidirectional sync | 2 days | Cloud backup | Sprint 1 |
| P1 | Edge Function API key proxy | 1 day | Security | Sprint 1 |
| P2 | Content Security Policy | 2h | XSS protection | Sprint 2 |
| P2 | Accessibility ARIA + keyboard nav | 3 days | Compliance | Sprint 2 |
| P2 | iOS PWA meta tags | 15min | iOS users | ✅ Yes |
| P2 | Unit test suite | 3 days | Reliability | Sprint 2 |
| P2 | BUG-M02: MonthlyStats missing fields | 1h | Wrong data | Sprint 2 |
| P2 | BUG-M03: Forecast inflated on 1st | 30min | Wrong data | Sprint 2 |
| P3 | Auto-categorisation TF.js ML | 1 week | UX | Phase 2.1 |
| P3 | Setu Account Aggregator | 2 weeks | India market | Phase 2.1 |
| P3 | Supabase Realtime shared wallets | 1 week | Reliability | Phase 2.2 |
| P3 | Investment portfolio tracker | 2 weeks | Feature | Phase 2.3 |
| P4 | React Native app | 6 weeks | Mobile | Phase 2.5 |
| P4 | WhatsApp bot | 1 week | India market | Phase 2.4 |
| P4 | Browser extension | 2 weeks | Automation | Phase 2.5 |

---

## 13. Safe Editing Rules

These rules prevent the most common ways AI coding assistants break a working project:

### Always Do

- Fix ONE bug at a time
- Test in the browser after each individual fix
- Add new files rather than rewriting existing ones
- Add null guards / fallbacks rather than restructuring logic
- Use functional `setState(prev => ...)` updates to avoid stale closure bugs
- Check `src/types/` for existing interfaces before creating new ones
- Copy the exact Gemini API call pattern from this document
- Add `// FIXED: BUG-XX short description` comment on changed lines

### Never Do

- Rename or delete existing files (breaks imports across the whole project)
- Rewrite a whole component to fix one behaviour
- Change import paths of working features
- Install new npm packages without checking `package.json` first
- Add `localStorage.setItem()` for any financial data
- Batch multiple bug fixes in one commit
- Use `any` type without a comment explaining why
- Change `src/lib/encryption.ts` without understanding key derivation

### Fragile Files — Extra Caution

| File | Why Fragile | Safe Change |
|------|-------------|-------------|
| `src/lib/encryption.ts` | Changing breaks ALL stored data | Read only |
| `src/db/db.ts` | Adding columns needs migration version bump | Add migration |
| `src/store/index.ts` | Wrong persist config loses all user data | Additive only |
| `src/hooks/useMasterVoice.ts` | SpeechRecognition state machine is delicate | Add to onend only |
| `src/lib/crdt.ts` | Changing merge logic corrupts shared wallet sync | Read only |
| `src/contexts/CurrencyContext.tsx` | Affects every monetary display in the app | Test all views |

---

*SpendWise Production Roadmap · Generated May 17, 2026 · Codebase Phase 1.8*  
*Total bugs documented: 25 (15 critical · 10 medium) · Roadmap phases: 5 · Skills to add: 6*
