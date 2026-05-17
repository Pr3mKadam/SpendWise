# SpendWise — Android UI Audit: Gap Analysis & Additions
**Cross-referenced against existing Production Roadmap (May 17, 2026)**  
*What the audit adds, what overlaps, what is genuinely new, and exact fixes for every gap.*

---

## How to Read This Document

The Android UI audit (`SpendWise-Android-UI-Review.md`) covers **29 specific issues** across 12 sections. This document answers one question: **what does the audit add that isn't already in the roadmap?**

| Category | Count |
|----------|-------|
| Already in roadmap (confirmed, no action) | 6 |
| Partially covered — audit adds precision | 7 |
| **Net-new issues not in roadmap at all** | **16** |
| Net-new P0 (fix immediately) | 4 |
| Net-new P1 (next sprint) | 6 |
| Net-new P2 (polish) | 6 |

---

## Part 1 — Already Covered (No Extra Action Needed)

These audit findings map directly to existing roadmap items. They are confirmed and prioritised correctly.

| Audit Section | Roadmap Item | Status |
|--------------|-------------|--------|
| 3.1 — WCAG color contrast | Roadmap Gap F: `--text-muted` contrast fix | ✅ Already documented |
| 3.1 — ARIA on interactive divs | Roadmap Gap F: ARIA roles on all interactive components | ✅ Already documented |
| 3.6 — Focus trap in bottom sheet | Roadmap Gap F: Focus trap in modals | ✅ Already documented |
| 3.9 — `div` → `button` for rows | Roadmap Gap F: Keyboard navigation | ✅ Already documented |
| 3.2 — iOS PWA meta tags | BUG-M05: PWA install on iOS | ✅ Already documented |
| 3.10 — Empty states / first run | Partially covered in onboarding gap | ✅ Noted |

---

## Part 2 — Partially Covered (Audit Adds Precision)

These were in the roadmap but the audit gives exact code, measurements, or specific file locations that make them actionable right now.

### A — Color Contrast: Exact Values Now Known

Roadmap said "darken `--text-muted`." The audit measured actual contrast ratios:

| Token | Current | Contrast | WCAG AA | Fix |
|-------|---------|----------|---------|-----|
| `--text-dim` | `#94a3b8` | 3.99:1 | ❌ Fails | Change to `#b6c0cf` |
| `--sidebar-text` (dark) | `rgba(255,255,255,0.5)` | 3.7:1 | ❌ Fails | Change to `rgba(255,255,255,0.72)` |
| Mobile header subtitle | `rgba(255,255,255,0.5)` | 3.6:1 | ❌ Fails | Change to `rgba(255,255,255,0.78)` |

**Exact fix in `src/index.css` — add to `.dark` block:**
```css
.dark {
  --text-dim:    #b6c0cf;                  /* was #94a3b8 → now 5.5:1 ✅ */
  --sidebar-text: rgba(255,255,255,0.72);  /* was 0.5 → now 5.6:1 ✅ */
}
```
**In `Header.tsx` mobile date line:**
```tsx
/* was: opacity-50 */
<span style={{ color: 'rgba(255,255,255,0.78)' }}>
```

---

### B — Touch Targets: Exact Offenders Now Known

Roadmap said "add ARIA + keyboard nav." The audit identified the exact components:

| Component | Current size | Required | File |
|-----------|-------------|---------|------|
| Edit/Trash buttons | 28×28 px (`p-2` + icon 14px) | 48×48 px | `BudgetViewMobile.tsx` |
| Category chips | ~32 px tall (`px-4 py-2 text-[10px]`) | 36 px min | `HistoryViewMobile.tsx` |
| Bottom-nav buttons | 64×48 px (icon+label cramped) | 64×56 px | `Sidebar.tsx` |

**Exact fix for BudgetViewMobile.tsx edit/trash buttons:**
```tsx
{/* BEFORE */}
<button className="p-2 rounded-lg"><Edit2 size={14} /></button>

{/* AFTER — 44px tap target, icon stays small */}
<button
  aria-label="Edit budget"
  className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-white/10"
>
  <Edit2 size={18} />
</button>
```

---

### C — PWA Manifest: Two Conflicting Files

Roadmap noted "iOS PWA meta tags missing." The audit found a deeper problem — **two competing manifests** that disagree on `name`, `theme_color`, and icon paths:

| Field | `public/manifest.json` | `vite.config.ts` |
|-------|----------------------|-----------------|
| `name` | "SpendWise Premium" | "SpendWise Finance" |
| `theme_color` | `#6366f1` (indigo) | `#14b8a6` (teal) |
| Maskable icon | `/icons/maskable-icon.png` (doesn't exist!) | `pwa-512x512.png` |

The `maskable-icon.png` referenced in `public/manifest.json` **does not exist in `public/icons/`** — Android silently falls back to a non-maskable icon showing the ugly "white circle inside a square" on the home screen.

**Fix (3 steps, in order):**

**Step 1 — Delete `public/manifest.json` entirely.**

**Step 2 — Update `vite.config.ts` to be the single source of truth:**
```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'SpendWise — Predictive Finance',
    short_name: 'SpendWise',
    description: 'Local-first personal finance with AI insights.',
    lang: 'en',
    dir: 'ltr',
    theme_color: '#14b8a6',          // teal — matches --teal CSS var
    background_color: '#0f172a',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'portrait',
    id: '/?source=pwa',
    scope: '/',
    start_url: '/?source=homescreen',
    categories: ['finance', 'lifestyle', 'productivity'],
    icons: [
      { src: 'icons/icon-192.png',        sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png',        sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: 'icons/icon-monochrome-512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' },
    ],
    screenshots: [
      { src: 'screenshots/mobile-dashboard.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'Dashboard' },
      { src: 'screenshots/mobile-budget.png',    sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'Budget' },
    ],
    share_target: {
      action: '/?action=share-receipt',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: { files: [{ name: 'receipt', accept: ['image/*'] }] }
    },
    shortcuts: [
      { name: 'Add Transaction', url: '/?action=new', icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }] },
      { name: 'View History',    url: '/?view=history', icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }] },
    ]
  }
})
```

**Step 3 — Create the missing icon files in `public/icons/`:**

Generate these using [maskable.app](https://maskable.app) or [PWABuilder](https://www.pwabuilder.com):
```
public/icons/
  icon-48.png
  icon-72.png
  icon-96.png          ← needed for shortcuts
  icon-144.png
  icon-192.png
  icon-512.png
  icon-maskable-512.png   ← 10% safe-zone padding, fills the entire square
  icon-monochrome-512.png ← single-colour silhouette for Android 13 themed icons
public/screenshots/
  mobile-dashboard.png  ← 1080×1920 px screenshot
  mobile-budget.png     ← 1080×1920 px screenshot
```

**Step 4 — Remove the manual manifest link from `index.html`** (VitePWA injects it automatically):
```html
<!-- REMOVE this line from index.html: -->
<link rel="manifest" href="/manifest.json">
<!-- VitePWA will inject: <link rel="manifest" href="/manifest.webmanifest"> -->
```

---

### D — Typography: Exact Scale Now Specified

Roadmap said "accessibility pass." Audit counted **101 uses of `font-black`** and identified exact `text-[9px|10px|11px]` offenders. Here are the exact CSS tokens to add and the search-replace pattern:

**Add to `src/index.css` `:root` block:**
```css
/* Mobile-first type scale — use these instead of text-[9px] etc. */
--fs-overline: clamp(11px, 3.2vw, 12px);  /* replaces text-[9px], text-[10px] */
--fs-caption:  clamp(12px, 3.4vw, 13px);  /* replaces text-[11px] */
--fs-body:     clamp(14px, 3.8vw, 15px);
--fs-title:    clamp(16px, 4.2vw, 18px);
--fs-hero:     clamp(28px, 7vw, 36px);

/* Locked border-radius tokens — replaces rounded-[32px], rounded-[2rem] mix */
--radius-chip:  12px;
--radius-card:  20px;
--radius-hero:  28px;
--radius-sheet: 32px;

/* Shadow ramp — replaces inline box-shadow mix */
--shadow-1: 0 1px 3px rgba(0,0,0,0.3);
--shadow-2: 0 4px 12px rgba(0,0,0,0.4);
--shadow-3: 0 8px 32px rgba(0,0,0,0.5);

@media (max-width: 480px) {
  --fs-title: 16px;
  --fs-hero:  28px;
}
```

**`font-black` reduction rule:**
- Keep `font-black` (900) ONLY for: hero balance numeral, primary CTA button, section H1
- Replace all other `font-black` with `font-bold` (700) or `font-semibold` (600)
- `font-black` at 9–11 px renders as a solid blob on most Android sub-pixel displays

---

## Part 3 — Net-New Issues (Not in Roadmap)

These 16 issues are **completely new** — not mentioned anywhere in the existing roadmap or bug documents. Add them now.

---

### 🔴 NEW-P0-01 · Drawer Filter Bug — 9 Features Invisible on Mobile

**File:** `src/components/common/Sidebar.tsx`  
**Severity:** 🔴 P0 — Feature Discovery  
**Effort:** 10 minutes

**Problem:**  
The overflow drawer filter logic uses a hardcoded exclusion list that accidentally hides **Reports, Subscriptions, Shared, Education, Quests** — they're neither in the bottom nav nor in the drawer. Unreachable on mobile without knowing the exact URL.

```tsx
// CURRENT — broken filter (hides too much):
navItems.filter(item => !['dashboard', 'history', 'budget', 'advisor',
  'education', 'quests', 'reports', 'subscriptions', 'shared'
].includes(item.id))
// Result: Reports, Subscriptions, Shared, Education, Quests are HIDDEN
```

**Fix — invert the logic to show everything not in the bottom nav:**
```tsx
// src/components/common/Sidebar.tsx
const bottomNavIds = mobileNavItems.map(i => i.id);
// In the drawer section:
{navItems.filter(item => !bottomNavIds.includes(item.id)).map((item) => {
  // ... existing render code unchanged
})}
```
This is a **10-minute fix** that immediately makes 9 features accessible on mobile.

---

### 🔴 NEW-P0-02 · Right-Edge Swipe Conflicts with Android System Back Gesture

**File:** `src/components/layout/MainShell.tsx`  
**Severity:** 🔴 P0 — Gesture Conflict  
**Effort:** 15 minutes

**Problem:**  
On Android 10+, the right-edge swipe **is** the system back gesture. Android 14+ uses predictive back animation. SpendWise hijacks this gesture to open Notifications — on newer Android this either breaks back navigation or is silently ignored, causing unpredictable behaviour for millions of users.

```tsx
// REMOVE this entire block from MainShell.tsx:
else if (touchStartX > (window.innerWidth - edgeThreshold) && distance < -swipeThreshold) {
  haptic.light();
  setShowNotifications(true);  // ← conflicts with system back gesture
}
```

Replace notifications access with long-press on the notification bell in `Header.tsx` — it already exists in the header and doesn't conflict with any system gesture.

---

### 🔴 NEW-P0-03 · Shake Handler Always Running (Battery Drain)

**File:** `src/components/layout/MainShell.tsx`  
**Severity:** 🔴 P0 — Performance + Battery  
**Effort:** 20 minutes

**Problem:**  
The shake-to-feedback handler fires the `devicemotion` listener at ~50 Hz even when the user has disabled it in settings. The enabled check runs *inside* the callback, not before `addEventListener`.

```tsx
// CURRENT — listener always running at 50Hz:
window.addEventListener('devicemotion', handleMotion);
// Inside handleMotion:
if (localStorage.getItem('spendwise_shake_enabled') === 'false') return; // ← too late, listener already fired
```

**Fix — skip addEventListener entirely when disabled:**
```tsx
// src/components/layout/MainShell.tsx — in the shake useEffect:
useEffect(() => {
  const enabled = localStorage.getItem('spendwise_shake_enabled') !== 'false';
  if (!enabled || !window.DeviceMotionEvent) return; // ← check BEFORE adding listener

  window.addEventListener('devicemotion', handleMotion, { passive: true });
  return () => window.removeEventListener('devicemotion', handleMotion);
}, [shakeEnabled]); // re-subscribe when setting changes
```

Also add iOS permission request (currently silent no-op on iOS):
```tsx
if (typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function') {
  const permission = await (DeviceMotionEvent as any).requestPermission();
  if (permission !== 'granted') return;
}
```

---

### 🔴 NEW-P0-04 · FAB Hidden Behind Keyboard on Short Phones

**File:** `src/components/layout/MainShell.tsx`  
**Severity:** 🔴 P0 — Broken UX  
**Effort:** 30 minutes

**Problem:**  
The FAB (floating action button, the "+" to add a transaction) is `fixed bottom-20` — when the soft keyboard opens on a short phone (< 667 px height, very common in India on Redmi/Realme budget devices), the keyboard pushes the FAB off-screen. The primary action of the app becomes unreachable while typing.

**Fix — use Visual Viewport API to track keyboard height:**

**Step 1 — Add to `src/components/layout/MainShell.tsx`:**
```tsx
// Add this useEffect to MainShell:
useEffect(() => {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    const kbHeight = window.innerHeight - vv.height - vv.offsetTop;
    document.documentElement.style.setProperty('--kb-inset', `${Math.max(0, kbHeight)}px`);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
  };
}, []);
```

**Step 2 — Change FAB positioning from fixed bottom to dynamic:**
```tsx
{/* BEFORE */}
<button className="fixed bottom-20 right-6 z-[60] w-14 h-14 ...">

{/* AFTER */}
<button
  className="fixed right-6 z-[60] w-14 h-14 ..."
  style={{ bottom: 'calc(80px + var(--kb-inset, 0px))', transition: 'bottom 0.15s ease' }}
>
```

**Step 3 — Add to `index.html` viewport meta:**
```html
<!-- BEFORE -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />

<!-- AFTER — interactive-widget=resizes-content is Chrome 108+ -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover, interactive-widget=resizes-content" />
```

---

### 🟠 NEW-P1-01 · Navigation Stack is "Always Go to Dashboard" (Not True Back)

**File:** `src/components/layout/MainShell.tsx`  
**Severity:** 🟠 P1 — Navigation UX  
**Effort:** 1 hour

**Problem:**  
The edge-swipe back gesture (left-edge) and browser back button navigate to Dashboard regardless of where the user came from:
```tsx
if (activeView !== 'dashboard') {
  setActiveView('dashboard'); // ← always goes to Dashboard, not the previous view
}
```
A user who goes Dashboard → Budget → Goals will land on Dashboard with one back swipe, not on Budget.

**Fix — implement a proper history stack:**
```tsx
// src/components/layout/MainShell.tsx — add history stack:
const [viewHistory, setViewHistory] = useState<ViewType[]>(['dashboard']);

const navigate = useCallback((view: ViewType) => {
  setViewHistory(prev => [...prev, view]);
  setActiveView(view);
}, []);

const goBack = useCallback(() => {
  setViewHistory(prev => {
    if (prev.length <= 1) return prev;
    const next = prev.slice(0, -1);
    setActiveView(next[next.length - 1]);
    return next;
  });
}, []);

// Replace all setActiveView calls with navigate()
// Replace back-gesture handler: if (distance > swipeThreshold) goBack();
```

Also replace `popstate` listener with the Navigation API (Chrome 102+/Android WebView):
```tsx
if ('navigation' in window) {
  window.navigation.addEventListener('navigate', (e: any) => {
    if (!e.canIntercept) return;
    e.intercept({ handler: () => goBack() });
  });
}
```

---

### 🟠 NEW-P1-02 · Bottom Nav Framer Motion layoutId Causes Jank

**File:** `src/components/common/Sidebar.tsx`  
**Severity:** 🟠 P1 — Performance  
**Effort:** 30 minutes

**Problem:**  
The active-tab indicator uses `<motion.div layoutId="activeTab">` which triggers a full layout measurement on every route change. On mid-range Android (Snapdragon 600-series, very common in India) this causes 30–80 ms layout thrashing visible as a stutter on every tab switch.

**Fix — replace with CSS-only active state:**
```tsx
// BEFORE — Framer Motion layoutId:
{isActive && <motion.div layoutId="activeTab" className="absolute inset-0 bg-..." />}

// AFTER — CSS transition only (zero layout cost):
<div
  className={`absolute inset-0 rounded-xl transition-opacity duration-200 bg-teal-500/20 ${
    isActive ? 'opacity-100' : 'opacity-0'
  }`}
/>
// The dot indicator below the icon is already sufficient — the pill background is optional
```

---

### 🟠 NEW-P1-03 · console.log Ships in Production Build

**File:** `src/components/layout/MainShell.tsx`  
**Severity:** 🟠 P1 — Security + Performance  
**Effort:** 10 minutes

**Problem:**  
`console.log('Feedback submitted:', data)` ships in the production bundle, leaking internal data shapes to anyone who opens DevTools.

**Fix — wrap behind dev guard:**
```tsx
// Replace every console.log in the codebase with:
if (import.meta.env.DEV) console.log('Feedback submitted:', data);

// Or better — add to vite.config.ts to strip all console.log in prod:
// In defineConfig:
esbuild: {
  drop: import.meta.env.MODE === 'production' ? ['console', 'debugger'] : [],
}
```

---

### 🟠 NEW-P1-04 · QuickAddModal autoFocus Fires Before Sheet Animation, Jumps on Short Phones

**File:** `src/components/common/QuickAddModal.tsx`  
**Severity:** 🟠 P1 — UX on Short Phones  
**Effort:** 30 minutes

**Problem:**  
`autoFocus` on the input fires immediately when the modal mounts, triggering the keyboard before the bottom sheet's open animation completes. On a 667 px phone this hides the input behind the keyboard (`max-h-[85vh]` → shrinks to `max-h-[35vh]`). Also: `type="number"` shows Android's number spinner UI which is harder to use than a decimal keyboard.

**Fix:**
```tsx
// src/components/common/QuickAddModal.tsx:

// 1. Defer autoFocus until after sheet animation (250ms):
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  if (isOpen) {
    const timer = setTimeout(() => inputRef.current?.focus(), 280); // after animation
    return () => clearTimeout(timer);
  }
}, [isOpen]);

// 2. Use inputMode instead of type="number":
<input
  ref={inputRef}
  inputMode="decimal"    // ← shows numeric keyboard without spinner
  pattern="[0-9]*\.?[0-9]*"
  // Remove: type="number"  Remove: autoFocus
  placeholder="0.00"
/>

// 3. Use dvh for modal height (handles Chrome URL bar collapse):
<div className="..." style={{ maxHeight: 'min(85vh, 85dvh)' }}>

// 4. Match MD3 motion curve for the sheet spring:
// In the Framer Motion animate prop:
transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }} // MD3 emphasized easing
```

---

### 🟠 NEW-P1-05 · Bottom Nav Rendered Twice (Double Component Mount)

**File:** `src/components/common/Sidebar.tsx` + `src/components/layout/MainShell.tsx`  
**Severity:** 🟠 P1 — Performance  
**Effort:** 45 minutes

**Problem:**  
The bottom nav is rendered by two separate components — `<aside>` (the desktop sidebar) and the mobile `<div>` bottom bar — both mounted simultaneously. On mobile the desktop sidebar is hidden with CSS (`hidden md:flex`) but still mounted and consuming memory.

**Fix — single component, two render paths:**
```tsx
// src/components/common/Sidebar.tsx — at the top level:
const isMobile = useIsMobile();

if (isMobile) {
  return <MobileBottomNav items={mobileNavItems} activeView={activeView} onNavigate={onNavigate} />;
}
return <DesktopSidebar items={navItems} activeView={activeView} onNavigate={onNavigate} />;
// Both sub-components extracted from the existing render logic — no logic changes
```

---

### 🟠 NEW-P1-06 · Razorpay Script Loads on Every Page (Not Lazy)

**File:** `index.html` or wherever Razorpay script is injected  
**Severity:** 🟠 P1 — Performance  
**Effort:** 20 minutes

**Problem:**  
Razorpay's script (~60 KB+ uncompressed) loads on every page load even for users who never use the Bank Sync feature. This adds to Time-to-Interactive on every cold start.

**Fix — lazy inject only when user enters Bank Sync flow:**
```tsx
// src/components/views/BankSyncView.tsx — inject script on demand:
const loadRazorpay = async (): Promise<void> => {
  if (document.querySelector('script[src*="razorpay"]')) return; // already loaded
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay failed to load'));
    document.head.appendChild(script);
  });
};
// Call loadRazorpay() when user taps "Connect Razorpay" — not at page load
```

Also remove from `index.html` if it's currently there as a `<script src="...">` tag.

---

### 🟡 NEW-P2-01 · Mobile Header Has 4 Compositing Layers (GPU Waste)

**File:** `src/components/common/Header.tsx`  
**Severity:** 🟡 P2 — Performance  
**Effort:** 1 hour

**Problem:**  
The mobile header renders 4 separate decorative `<div>` elements (gradient background, shimmer line, left teal glow orb, right indigo glow orb) all inside a `position: sticky` element. This forces 4 separate compositing layers that repaint on every scroll frame — ~4–6 ms per frame on Snapdragon 6-series devices (~30% of the 16ms frame budget just for idle header).

**Fix — single CSS gradient, zero extra DOM nodes:**
```tsx
// src/components/common/Header.tsx — on mobile, replace all 4 decorative divs with:
// Remove the 4 <div> elements with className="md:hidden absolute..."
// and add a single CSS background to the header element:

<header
  className="md:hidden sticky top-0 z-50 ..."
  style={{
    background: `
      radial-gradient(120% 80% at 100% 100%, rgba(99,102,241,.10), transparent 60%),
      radial-gradient(80% 80% at 0% 0%, rgba(20,184,166,.15), transparent 60%),
      linear-gradient(120deg, #0f1c35 0%, #0d2d3f 55%, #0b3d3a 100%)
    `,
  }}
>
  {/* Remove the 4 decorative div children */}
```
CSS gradients on a non-transformed sticky element use zero compositing layers.

---

### 🟡 NEW-P2-02 · Privacy Toggle and Theme Toggle Hidden on Mobile

**File:** `src/components/common/Header.tsx`  
**Severity:** 🟡 P2 — Feature Discovery  
**Effort:** 30 minutes

**Problem:**  
Both controls are wrapped in `className="hidden md:flex"` — completely absent on mobile. Users have to go to Settings → two taps away — to toggle privacy mode. Given that privacy mode is one of the app's key features (user reported it broken specifically), it should be always visible.

**Fix — surface both in the mobile header row:**
```tsx
// src/components/common/Header.tsx — mobile header right section:
<div className="flex items-center gap-1 md:hidden">
  {/* Privacy toggle — teal eye icon */}
  <button
    aria-label={isPrivacyEnabled ? 'Disable privacy mode' : 'Enable privacy mode'}
    onClick={onTogglePrivacy}
    className="w-9 h-9 flex items-center justify-center rounded-xl
      active:bg-white/10 transition-colors"
  >
    {isPrivacyEnabled
      ? <EyeOff size={18} className="text-teal-400" />
      : <Eye size={18} className="text-white/70" />
    }
  </button>

  {/* Theme toggle — sun/moon icon */}
  <button
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    onClick={toggleTheme}
    className="w-9 h-9 flex items-center justify-center rounded-xl
      active:bg-white/10 transition-colors"
  >
    {isDark ? <Sun size={18} className="text-white/70" /> : <Moon size={18} className="text-white/70" />}
  </button>
</div>
```

---

### 🟡 NEW-P2-03 · Hover-Only Tooltip on Avatar (Invisible on Touch)

**File:** `src/components/common/Header.tsx`  
**Severity:** 🟡 P2 — UX  
**Effort:** 20 minutes

**Problem:**  
The avatar button shows a tooltip on `group-hover` — which doesn't exist on touch devices. Touch users see no affordance that tapping the avatar opens Profile.

**Fix — replace hover tooltip with long-press context menu:**
```tsx
// Replace hover tooltip with tap hint and long-press menu:
const [showAvatarMenu, setShowAvatarMenu] = useState(false);

<button
  onPointerDown={() => {
    longPressTimer.current = setTimeout(() => setShowAvatarMenu(true), 500);
  }}
  onPointerUp={() => clearTimeout(longPressTimer.current)}
  onClick={() => onNavigate('profile')}
  aria-label="Profile and settings"
>
  {/* Remove: <span className="... opacity-0 group-hover:opacity-100"> */}
  {/* Add: */}
  <span className="sr-only">Profile and settings</span>
</button>

{showAvatarMenu && (
  <div className="absolute top-14 right-4 bg-[var(--surface-card)] border border-[var(--border)]
    rounded-2xl shadow-2xl p-2 z-50 min-w-[160px]">
    <button onClick={() => { onNavigate('profile'); setShowAvatarMenu(false); }}
      className="w-full text-left px-4 py-3 rounded-xl text-sm hover:bg-white/5">
      ⚙️ Settings
    </button>
    <button onClick={() => { signOut(); setShowAvatarMenu(false); }}
      className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10">
      Sign Out
    </button>
  </div>
)}
```

---

### 🟡 NEW-P2-04 · `EmptyState` Component Missing — Inconsistent Placeholders

**File:** `src/components/views/DashboardViewMobile.tsx` + `HistoryViewMobile.tsx` + `GoalsView.tsx`  
**Severity:** 🟡 P2 — UX  
**Effort:** 1 hour

**Problem:**  
Empty states are inconsistent across views:
- Dashboard: `<div className="text-center py-8 opacity-50"><p className="text-sm">No transactions yet.</p></div>`
- Goals: Different layout and copy
- History: Different again

No CTAs, no illustrations, no onboarding flow. New users see a great-looking balance card with ₹0 and then a lonely sentence.

**Fix — create a shared `EmptyState` component:**
```tsx
// NEW: src/components/common/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; icon?: React.ReactNode; onClick: () => void; };
  secondaryAction?: { label: string; onClick: () => void; };
}

export function EmptyState({ icon, title, subtitle, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--teal)]/10 border border-[var(--teal)]/20
        flex items-center justify-center mb-4 text-[var(--teal)]">
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--text-primary)] mb-2" style={{ fontSize: 'var(--fs-title)' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-[var(--text-muted)] mb-6 max-w-[260px]" style={{ fontSize: 'var(--fs-body)' }}>
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--teal)]
            text-white font-semibold text-sm active:scale-95 transition-transform mb-3"
        >
          {action.icon}
          {action.label}
        </button>
      )}
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="text-[var(--teal)] text-sm font-medium"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}

// Usage in DashboardViewMobile.tsx:
{recentTransactions.length === 0 && (
  <EmptyState
    icon={<Plus size={28} />}
    title="Record your first transaction"
    subtitle="Track where your money goes to unlock insights and budgets"
    action={{ label: 'Add Transaction', icon: <Plus size={16} />, onClick: onOpenQuickAdd }}
    secondaryAction={{ label: 'or scan a receipt', onClick: onOpenReceiptScanner }}
  />
)}
```

---

### 🟡 NEW-P2-05 · Bottom Nav Missing ARIA Roles

**File:** `src/components/common/Sidebar.tsx` (mobile bottom nav)  
**Severity:** 🟡 P2 — Accessibility  
**Effort:** 20 minutes

**Problem:**  
The mobile bottom nav has no `role="tablist"`, no `role="tab"` on individual items, and no `aria-current="page"`. Android TalkBack announces these as generic "button" elements with no context about navigation state.

**Fix:**
```tsx
// Wrap the bottom nav in role="tablist":
<nav aria-label="Main navigation">
  <div role="tablist" className="flex items-center justify-around ...">
    {mobileNavItems.map((item) => (
      <button
        key={item.id}
        role="tab"
        aria-selected={activeView === item.id}
        aria-current={activeView === item.id ? 'page' : undefined}
        aria-label={item.label}
        onClick={() => onNavigate(item.id)}
        className="..."
      >
        {item.icon}
        <span style={{ fontSize: 'var(--fs-overline)' }}>{item.label}</span>
      </button>
    ))}
  </div>
</nav>
```

---

### 🟡 NEW-P2-06 · Web Share Target — UPI Receipt Sharing Not Wired

**File:** `vite.config.ts` (manifest) + `src/main.tsx` or `src/components/layout/MainShell.tsx`  
**Severity:** 🟡 P2 — Power Feature  
**Effort:** 1 hour

**Problem:**  
The Web Share Target API lets SpendWise appear in Android's share sheet — so users can share a UPI receipt image directly from their gallery or banking app and it auto-opens in ReceiptScanner. This is a massive UX win for the core receipt-scanning flow but isn't implemented despite the manifest supporting it (once fixed per NEW-P2-01 above).

**Fix — handle share target URL in the app:**
```tsx
// src/components/layout/MainShell.tsx — handle incoming share at startup:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');

  if (action === 'share-receipt') {
    // Open receipt scanner immediately
    setShowReceiptScanner(true);
    // Clear the URL param without reloading
    window.history.replaceState({}, '', '/');
  }
}, []);

// In ReceiptScanner — handle shared file:
useEffect(() => {
  if (!isOpen) return;
  // Check for shared file from Web Share Target (POST body):
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'SHARED_FILE' && e.data.file) {
        processReceiptFile(e.data.file);
      }
    });
  }
}, [isOpen]);
```

**Service worker handler (add to Workbox config or sw.js):**
```js
// Handle share target POST in service worker:
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === '/' && url.searchParams.get('action') === 'share-receipt'
      && event.request.method === 'POST') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('receipt');
      // Post the file to the main thread:
      const allClients = await clients.matchAll();
      allClients.forEach(client => client.postMessage({ type: 'SHARED_FILE', file }));
      return Response.redirect('/?action=share-receipt', 303);
    })());
  }
});
```

---

## Part 4 — Additional `index.html` Hardening

These are small but collectively important for Android quality. All go in `index.html`:

```html
<!-- Add these meta tags alongside existing ones: -->

<!-- Prevents Chrome from auto-linking phone numbers in transaction descriptions -->
<meta name="format-detection" content="telephone=no">

<!-- Tells browser to use dark/light scrollbar and form widgets correctly -->
<meta name="color-scheme" content="dark light">

<!-- Pre-connect to external services used at startup (saves ~100ms DNS lookup) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Only if Supabase is used at startup: -->
<link rel="preconnect" href="https://YOUR_PROJECT.supabase.co">

<!-- Prefetch the Budget view chunk while user is on Dashboard (most common next view) -->
<!-- VitePWA handles this via workbox, but you can hint it: -->
<link rel="prefetch" href="/assets/BudgetView.js" as="script">
```

---

## Part 5 — Play Store Distribution (Roadmap Addition)

The audit mentions a **Trusted Web Activity (TWA)** wrapper. This isn't in the existing roadmap and deserves a concrete entry.

**Add to Phase 2.5 roadmap:**

Once the PWA manifest is fixed (Part 2 Section C above), publishing to the Google Play Store takes ~2 hours:

```bash
# Install Bubblewrap (Google's official TWA CLI):
npm install -g @bubblewrap/cli

# Initialize with your PWA URL:
bubblewrap init --manifest https://your-spendwise-url.com/manifest.webmanifest

# Build the Android App Bundle:
bubblewrap build

# Output: app-release-bundle.aab → upload to Play Console
```

**Requirements before doing this:**
1. ✅ Single manifest (Part 2 Section C fix)
2. ✅ Maskable icon exists (Part 2 Section C fix)
3. ✅ Lighthouse PWA score ≥ 95
4. ⬜ `digital-asset-links.json` file at `https://your-domain.com/.well-known/assetlinks.json`
5. ⬜ Google Play Console account ($25 one-time fee)

**Package ID to use:** `com.spendwise.app`

---

## Part 6 — Validation Checklist (From Audit)

After implementing all the above, validate on:

- [ ] Pixel 4a / Android 13, Chrome — primary target device
- [ ] Samsung Galaxy A-series (Samsung Internet) — bottom-nav haptic + 120 Hz
- [ ] Any foldable device — `window-controls-overlay` layout
- [ ] Lighthouse PWA audit ≥ 95 on mobile
- [ ] axe-core zero serious issues on each mobile view
- [ ] Soft keyboard does NOT occlude QuickAddModal input on phones < 667 px height
- [ ] Install from Chrome → home screen → maskable icon renders correctly in Android's circle
- [ ] Right-edge swipe correctly triggers Android back (not Notifications)
- [ ] Shake disabled → zero `devicemotion` listener events (verify in Chrome Performance tab)
- [ ] TalkBack: swipe through bottom nav → announces "tab, selected/not selected"
- [ ] TalkBack: swipe through transaction list → announces merchant, amount, category, date
- [ ] `format-detection=telephone=no` → transaction amounts not underlined as phone numbers

---

## Part 7 — Updated Priority Matrix (Android-Specific Additions)

| Priority | Item | File | Effort | Impact |
|----------|------|------|--------|--------|
| 🔴 P0 | NEW-P0-01: Drawer filter — 9 features invisible | `Sidebar.tsx` | 10 min | Feature discovery |
| 🔴 P0 | NEW-P0-02: Remove right-edge swipe (system back conflict) | `MainShell.tsx` | 15 min | Android compat |
| 🔴 P0 | NEW-P0-03: Shake handler always running | `MainShell.tsx` | 20 min | Battery drain |
| 🔴 P0 | NEW-P0-04: FAB hidden behind keyboard | `MainShell.tsx` + `index.html` | 30 min | Broken UX |
| 🟠 P1 | NEW-P1-01: True navigation history stack | `MainShell.tsx` | 1 hour | Navigation UX |
| 🟠 P1 | NEW-P1-02: Remove layoutId from bottom nav | `Sidebar.tsx` | 30 min | Jank |
| 🟠 P1 | NEW-P1-03: Strip console.log from prod build | `vite.config.ts` | 10 min | Security |
| 🟠 P1 | NEW-P1-04: QuickAdd autoFocus + dvh + MD3 easing | `QuickAddModal.tsx` | 30 min | Short phones |
| 🟠 P1 | NEW-P1-05: Merge double-mounted bottom nav | `Sidebar.tsx` | 45 min | Performance |
| 🟠 P1 | NEW-P1-06: Lazy-load Razorpay script | `BankSyncView.tsx` | 20 min | TTI |
| 🟡 P2 | Part 2-A: Fix exact contrast values | `index.css` | 15 min | WCAG AA |
| 🟡 P2 | Part 2-B: Touch targets 48dp (exact offenders) | `BudgetViewMobile.tsx` | 30 min | Usability |
| 🟡 P2 | Part 2-C: Fix dual manifest + maskable icon | `vite.config.ts` | 1 hour | Install story |
| 🟡 P2 | Part 2-D: Typography scale tokens | `index.css` | 1 hour | Readability |
| 🟡 P2 | NEW-P2-01: Flatten mobile header GPU layers | `Header.tsx` | 1 hour | Performance |
| 🟡 P2 | NEW-P2-02: Surface privacy + theme toggle on mobile | `Header.tsx` | 30 min | Discoverability |
| 🟡 P2 | NEW-P2-03: Replace hover tooltip with long-press menu | `Header.tsx` | 20 min | Touch UX |
| 🟡 P2 | NEW-P2-04: EmptyState component | New file + 3 views | 1 hour | Onboarding |
| 🟡 P2 | NEW-P2-05: Bottom nav ARIA roles | `Sidebar.tsx` | 20 min | Accessibility |
| 🟡 P2 | NEW-P2-06: Web Share Target (receipt via share sheet) | `MainShell.tsx` + SW | 1 hour | Power feature |
| 🟡 P2 | Part 4: index.html meta hardening | `index.html` | 15 min | Android quality |
| 🟡 P3 | Part 5: TWA → Play Store | `bubblewrap` | 2 hours | Distribution |

---

*Android UI Audit Gap Analysis · May 17, 2026*  
*Audit items: 29 · Already in roadmap: 6 · Audit adds precision: 7 · Net-new: 16*  
*Highest-leverage single fix: NEW-P0-01 (drawer filter) — 10 minutes, unlocks 9 hidden features*
