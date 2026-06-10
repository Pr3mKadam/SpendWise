# SpendWise — Independent External Audit Report

**Date**: June 6, 2026
**Auditor**: External (Independent)
**Classification**: CONFIDENTIAL

---

## Executive Summary

This audit independently re-examines every claim from prior reports. **Multiple critical findings contradict prior assessments.** The prior reports overstated readiness by failing to detect that core security mechanisms (MFA) and key integrations (Setu AA, non-Razorpay UPI sync, biometric auth) are simulated or stubbed. The Razorpay key secret remains exposed client-side despite being flagged as critical in the previous report.

**Verdict: NOT PRODUCTION-READY.** The app contains 6 critical issues, 5 high issues, and multiple medium/low issues that must be resolved before any production deployment.

---

## Verification Results by Claim

### 1. Security Fixes — ❌ NOT VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "Razorpay key secret removed from client" | **FALSE** | `financeSlice.ts:21` — `razorpayKeys: { keyId: string; keySecret: string } \| null` still present. `store/index.ts:183,263` persists it. `BankSyncView.tsx:236` accepts and stores the secret via `handleRazorpayConnect`. |
| "No secrets in source code" | **PARTIALLY TRUE** | No hardcoded API keys. But Razorpay secret flows through the client. |
| "CSP adequately restricts scripts" | **FALSE** | `'unsafe-inline'` in `script-src` allows arbitrary inline script execution. |
| "Edge Functions authenticate requests" | **FALSE** | `razorpay-proxy` has NO JWT auth check (unlike `gemini-proxy`). Anyone can call it. |

### 2. MFA End-to-End — ❌ NOT VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "TOTP MFA compliant with RFC 6238" | **PARTIALLY TRUE** | TOTP code generation is correct. But verification is broken. |
| "MFA challenge-response works" | **FALSE** | `MfaEngine.ts:194-199`: `verifyMfaChallenge` **ignores both parameters and returns `true` unconditionally**. `createMfaChallenge` generates a client-only fake ID, no real server interaction. |
| "MFA prevents unauthorized access" | **FALSE** | Any code — even invalid TOTP codes — passes MFA verification. |

### 3. Mock Implementations Removed — ❌ NOT VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "No mock implementations in production code" | **FALSE** | Three mock/stub implementations found: |
| | | 1. **`BankSyncView.tsx:157-209`** — `handleMockSync` — function explicitly named "Mock". Hardcoded mobile number `'9876543210'`, simulated `setTimeout` delay, random `existingCount`. |
| | | 2. **`MfaEngine.ts:194-199`** — `verifyMfaChallenge` — unconditional `return true` |
| | | 3. **`BiometricLock.tsx:102-108`** — When WebAuthn fails, falls back to "secure local simulation" via `setTimeout` |

### 4. UPI Flows Are Real — ❌ NOT VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "UPI SMS parsing for 12 Indian banks" | **TRUE** — parsing layer is real | Regex patterns for 12 bank formats exist in the parser code. |
| "UPI sync works for all providers" | **FALSE** | Only Razorpay UPI sync works (via the proxy). **All other providers (PhonePe, GPay, Paytm, BHIM, CRED) use `handleMockSync`** which generates fake transaction data. The Setu AA calls within the mock will 404 (no Edge Function deployed). |

### 5. Account Aggregator Integration Is Real — ❌ NOT VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "Setu AA integration exists" | **HALF TRUE** | Client-side consent flow exists (`src/core/setuAA.ts`). **The server-side Edge Function (`setu-aa-proxy`) does NOT exist.** Glob only found 3 functions: `gemini-proxy`, `razorpay-proxy`, `send-invite`. The `createSetuConsent` and `fetchSetuBankStatements` calls to `/functions/v1/setu-aa-proxy` will 404. |
| "Setu consent flow redirects user" | **FALSE** | `BankSyncView.tsx:167` comment says "In real flow: we would redirect..." — redirect is never implemented. |

### 6. Server-Side Validation — ⚠️ PARTIALLY VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "Edge Functions validate input" | **TRUE** — `gemini-proxy` validates `contents` array, max length, auth. `razorpay-proxy` validates action enum and params. |
| "Rate limiting exists" | **TRUE** — In-memory rate limiters (20 req/min for Gemini, 30 req/min for Razorpay). **WARNING: Per-instance only — multiple Edge Function instances bypass this.** |
| "JWT auth on all Edge Functions" | **FALSE** | `razorpay-proxy` has NO auth check. `send-invite` has NO auth check. |

### 7. RLS Enforced — ✅ VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "RLS on all tables" | **TRUE** | RLS enabled on: `transactions` (4 policies), `gamification` (3 policies), `shared_wallets` (4 policies), `wallet_members` (3 policies), `shared_wallet_entries` (2 policies), `shared_expenses` (2 policies), `audit_log` (1 service-role-only policy). |
| "User-scoped policies" | **TRUE** | All policies use `auth.uid()` checks. |
| "Soft delete honored" | **TRUE** | All SELECT policies filter `deleted_at IS NULL`. |

### 8. Audit Logging Works — ✅ VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "Audit triggers exist" | **TRUE** | All tables have `AFTER INSERT OR UPDATE OR DELETE` triggers calling `trigger_audit()`. |
| "Audit log captures old/new data" | **TRUE** | INSERT logs `new_data`, UPDATE logs both `old_data` and `new_data`, DELETE logs `old_data`. |
| "Audit log is service-role only" | **TRUE** | `audit_log_service_only` policy restricts to `service_role`. |

### 9. Sentry Configuration — ✅ VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "Sentry initialized" | **TRUE** | `initSentry()` uses `VITE_SENTRY_DSN` env var. |
| "Traces sampled correctly" | **TRUE** | 25% in production, 100% in dev. |
| "Zod errors integrated" | **TRUE** | `zodErrorsIntegration()` registered. |
| "Session replay configured" | **TRUE** | `replayIntegration()` with session at 10%, errors at 100%. |
| "Requires env var to work" | **TRUE** | Returns `false` silently if `VITE_SENTRY_DSN` not set — graceful degradation. |

### 10. CI/CD Passes — ⚠️ PARTIALLY VERIFIED

| Claim | Status | Evidence |
|-------|--------|----------|
| "Lint passes" | **TRUE** — 0 errors, 38 warnings |
| "TypeScript passes" | **TRUE** — `tsc --noEmit` succeeds |
| "Tests pass" | **FALSE** — 183/185 pass. **2 tests still failing:** `deletes a transaction by id`, `bulk deletes transactions`. These have been failing persistently and were NOT fixed. |
| "Build succeeds" | **TRUE** — but with warnings: circular chunk dependency, main chunk exceeds 500 kB limit |

### 11. Tests Pass — ❌ NOT VERIFIED (2 FAILURES)

Same 2 failures as before. The `financeSlice.test.ts` tests for `deletes a transaction by id` and `bulk deletes transactions` are failing. Test pass rate is **98.9%** (not 100%).

### 12. Performance Improvements Measurable — ❌ NOT DEMONSTRABLE

| Issue | Impact |
|-------|--------|
| **Main chunk 560 kB** | Exceeds recommended 244 kB budget. Increases Time-to-Interactive. |
| **Circular chunk dependency** | `vendor-motion -> vendor-db -> vendor-motion` can cause duplicate code in bundles. |
| **`useSharedWallets` chunk 422 kB** | Extremely large for a single hook — likely includes duplicate Supabase client code. |
| **No compound DB indexes** | All Dexie indexes are single-field. Queries combining `category + date` filter in JS (O(n)). |
| **`reindex()` on every write** | Iterates all transactions on each mutation. O(n) per write. |

### 13. No Secrets Remain Exposed — ❌ NOT VERIFIED (RAZORPAY SECRET)

| Finding | Severity | Location |
|---------|----------|----------|
| **Razorpay key secret in client store** | **CRITICAL** | `financeSlice.ts:21`, `store/index.ts:183,263`, `BankSyncView.tsx:236` |
| **RZP_SECRET localStorage key defined** | LOW | `constants/index.ts:17` — key definition exists but not actively read/written in current code. |
| **VITE_GEMINI_API_KEY deprecated but still referenced** | LOW | Legacy env var referenced in type definitions |

### 14. No Critical Vulnerabilities Remain — ❌ NOT VERIFIED (6 CRITICAL FINDINGS)

See full findings below.

---

## Complete Findings

### 🔴 CRITICAL ISSUES (6) — Block Production

| # | Finding | File | CVSS | Details |
|---|---------|------|------|---------|
| C1 | **Razorpay key secret stored client-side** | `financeSlice.ts:21`, `BankSyncView.tsx:236` | **9.8 (Critical)** | `razorpayKeys: { keyId; keySecret }` persisted to Zustand store (encrypted IndexedDB but decrypted in-memory). XSS yields the Razorpay secret. Allows unauthorized payment operations. **Previously flagged but NOT fixed.** |
| C2 | **`verifyMfaChallenge` always returns true** | `MfaEngine.ts:194-199` | **9.1 (Critical)** | Function ignores `_challengeId` and `_code` parameters. `return true` unconditionally. Any TOTP code — including wrong ones — passes MFA. Makes MFA entirely theatrical. |
| C3 | **`createMfaChallenge` generates fake challenge** | `MfaEngine.ts:190-192` | **8.6 (High)** | Challenge ID is generated client-side with `crypto.randomUUID()`. No actual challenge created on the server. The challenge/verify flow is entirely client-side simulation. |
| C4 | **Non-Razorpay UPI sync is entirely mocked** | `BankSyncView.tsx:157-209` | **9.2 (Critical)** | Function explicitly named `handleMockSync`. Hardcoded mobile `'9876543210'`, `setTimeout(1000)` simulates processing, `Math.random()` generates IDs, `Math.floor(Math.random()*3)+1` fakes existing count. All non-Razorpay bank sync produces fake data. |
| C5 | **Setu AA Edge Function doesn't exist** | `supabase/functions/` (no setu-aa-proxy) | **9.0 (Critical)** | Client calls `/functions/v1/setu-aa-proxy` but no Edge Function is deployed. All requests will 404. Bank aggregation via Setu AA is non-functional. |
| C6 | **Biometric auth has simulation fallback** | `BiometricLock.tsx:102-108` | **8.0 (High)** | When WebAuthn fails/unsupported, falls back to `setTimeout(1800)` that auto-unlocks. Bypasses biometric auth entirely. |

### 🟠 HIGH ISSUES (5) — Must Fix Before Launch

| # | Finding | File | CVSS | Details |
|---|---------|------|------|---------|
| H1 | **CSP uses `'unsafe-inline'` for scripts** | `vercel.json:12` | **7.5 (High)** | `script-src 'self' 'unsafe-inline' ...` allows any inline script. XSS vulnerability becomes trivial to exploit. Should use nonce/hash. |
| H2 | **Razorpay proxy has no auth check** | `razorpay-proxy/index.ts` | **7.0 (High)** | Unlike `gemini-proxy` which verifies Supabase JWT, `razorpay-proxy` has zero authentication. Only rate limiting (30 req/min/IP). Anyone can call it. |
| H3 | **Edge Function CORS wildcard too permissive** | `gemini-proxy:35`, `razorpay-proxy:35` | **6.5 (Medium)** | `origin.endsWith('.vercel.app')` matches ANY Vercel deployment including malicious ones like `steal-data.vercel.app`. |
| H4 | **`send-invite` CORS is wide open** | `send-invite/index.ts:8-12` | **6.5 (Medium)** | `Access-Control-Allow-Origin: *`. Unlike other functions which lock to specific origins. |
| H5 | **Rate limiters are per-instance (not shared)** | `gemini-proxy:11`, `razorpay-proxy:10` | **5.5 (Medium)** | In-memory `Map` is per-edge-function-instance. With multiple instances (typical at scale), rate limits are bypassed by rotating through instances. |

### 🟡 MEDIUM ISSUES (8) — Should Fix Before Scale

| # | Finding | File | Details |
|---|---------|------|---------|
| M1 | **Main chunk exceeds 500 kB** | `vite.config.ts` | 560 kB raw / 176 kB gzip. Exceeds Vite's default warning threshold. |
| M2 | **Circular chunk dependency** | `vite.config.ts:157-162` | `vendor-motion -> vendor-db -> vendor-motion` |
| M3 | **`useSharedWallets` chunk is 422 kB** | Build output | Likely includes duplicate Supabase client. Should be optimized. |
| M4 | **PeerJS dead dependency** | `package.json` | Zero imports. **Previously flagged but NOT removed.** |
| M5 | **`@trystero-p2p/torrent` unused** | `package.json` | Zero imports. **Previously flagged but NOT removed.** |
| M6 | **`vite-plugin-singlefile` unused** | `package.json` | Not used in vite config. **Previously flagged but NOT removed.** |
| M7 | **2 tests persistently failing** | `financeSlice.test.ts` | Delete by ID and bulk delete tests fail. Mocked ID generation mismatch. |
| M8 | **No compound DB indexes** | `src/db/` schema | All 12 Dexie tables use single-field indexes only. Category+date queries filter in JS. |

### 🟢 LOW ISSUES (6) — Nice to Fix

| # | Finding | File | Details |
|---|---------|------|---------|
| L1 | **38 lint warnings** | Various | 26 unused vars, 7 `any` types, 2 `console.log`, 1 `react-refresh`, 1 `exhaustive-deps` |
| L2 | **24 `console.warn` calls in source** | 12 files | Stripped in production by `esbuild.drop`, but source still has them. |
| L3 | **`TODO Phase 3` comment** | `useMasterVoice.ts:183` | Undo feature planned but not implemented. |
| L4 | **Setu AA `sandbox` type in production code** | `setuAA.ts:18` | `environment: 'sandbox' | 'production'` — sandbox type shouldn't be in production code. |
| L5 | **Hardcoded placeholder phone number** | `BankSyncView.tsx:164` | `'9876543210'` used as Setu AA mobile. |
| L6 | **`encryptionPassword!` non-null assertion** | `store/index.ts` | Redundant `!` assertion on non-nullable type. |

---

## Scorecard (Independent Assessment)

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| **Production Readiness** | **32/100** | 6 critical issues block deployment. MFA non-functional, data sync simulated, AA non-functional, key secret exposed. |
| **Security** | **28/100** | MFA bypass (C2), Razorpay secret exposure (C1), CSP bypass (H1), unauthenticated proxy (H2), biometric bypass (C6). |
| **Scalability** | **55/100** | Chunk size issues, circular deps, no compound indexes, per-instance rate limiters. But offline-first architecture and proper caching are strong. |
| **Reliability** | **40/100** | 2 failing tests, mocked sync, 404 on AA endpoint, 24 console.warns, simulation fallbacks. |
| **Investor Readiness** | **15/100** | Zero revenue, zero compliance, critical security vulns, mocked integrations. Not investable without $500K-1M remediation. |

### Overall: 34/100

---

## What Prior Reports Got Wrong

| Prior Report Claim | Actual Finding | Delta |
|--------------------|----------------|-------|
| "MFA: 9/10" | **MFA verification is completely broken** — `verifyMfaChallenge` always returns true | **-9 points** |
| "Security: 7.5/10" | **Critical:** Razorpay secret exposed, CSP has unsafe-inline, proxy has no auth | **-4.5 points** |
| "Overall Technical: 7.1/10" | **Actual: 3.4/10** based on independent scoring | **-3.7 points** |
| "CI/CD: 8/10" | **2 tests still failing**, build has warnings | **-2 points** |
| "Monetization: 0/10" | **Confirmed** — zero monetization infrastructure | **0 change** |
| "Compliance: 0/10" | **Confirmed** — still no privacy policy, no TOS | **0 change** |

The prior reports did not:
- Actually test whether MFA verification works (it doesn't)
- Trace the UPI sync flow end-to-end to discover it's mocked
- Verify that the Setu AA Edge Function actually exists (it doesn't)
- Test the biometric auth fallback (it's simulated)
- Verify the Razorpay secret was actually removed (it wasn't)

---

## Path to Production

### Phase 1 — Critical (Week 1)
1. **Remove Razorpay secret from client store** — Proxy all Razorpay operations through the backend. Only store `keyId` for display.
2. **Fix MFA challenge/verify** — Remove client-side stubs. Use Supabase server-side challenge/verify exclusively.
3. **Deploy Setu AA Edge Function** — Implement `setu-aa-proxy` in Deno. Remove sandbox references.
4. **Replace `handleMockSync`** — Implement real sync for PhonePe/GPay/Paytm via their actual APIs or at minimum implement a proper error state for unsupported providers.
5. **Fix biometric auth** — Remove simulation fallback. Show error state instead of silently succeeding.
6. **Add JWT auth to razorpay-proxy** — Match the pattern from gemini-proxy.

### Phase 2 — High (Week 2-3)
7. **Fix CSP** — Replace `'unsafe-inline'` with nonce-based or hash-based script-src.
8. **Fix send-invite CORS** — Lock to specific origins.
9. **Hardcode allowed Vercel domains in Edge Functions** — Replace `.endsWith('.vercel.app')` with specific project domains.
10. **Fix 2 failing tests** — Mock `crypto.randomUUID()` properly in test setup.

### Phase 3 — Medium (Month 1-2)
11. **Add compound indexes** — `[category+date]`, `[type+date]`, `[merchant+date]`.
12. **Remove dead dependencies** — `peerjs`, `trystero-p2p/torrent`, `vite-plugin-singlefile`.
13. **Split main chunk** — Route-level code splitting with named chunks.
14. **Fix circular chunk dependency**.
15. **Clean up 38 lint warnings**.

### Phase 4 — Remediation Cost Estimate

| Phase | Effort | Cost (₹) | Cost ($) |
|-------|--------|----------|----------|
| Phase 1 (Critical) | 5-7 developer-days | ₹75K-105K | $900-1,250 |
| Phase 2 (High) | 5-7 developer-days | ₹75K-105K | $900-1,250 |
| Phase 3 (Medium) | 8-12 developer-days | ₹120K-180K | $1,450-2,150 |
| **Total** | **18-26 developer-days** | **₹270K-390K** | **$3,250-4,650** |

---

## Final Verdict

**This application is NOT production-ready. Do NOT deploy.**

The codebase has strong architectural foundations (offline-first, Zustand + Dexie, clean TypeScript, proper RLS, audit logging) but is undermined by:

1. **Simulated features marketed as real** — MFA, non-Razorpay UPI sync, Setu AA, biometric auth
2. **Critical security vulnerability** — Razorpay secret exposed client-side
3. **Persistent test failures** — 2 tests fail, indicating fragile test infrastructure

The codebase represents approximately **$250K-500K in development value** as an architectural asset, but requires **$3.3K-4.7K in immediate remediation** (18-26 developer-days) before it can be considered production-ready.

---

*This report was produced by independent external audit on June 6, 2026. All findings are based on commit HEAD of the main branch. No trust was placed in prior reports; every claim was independently verified.*
