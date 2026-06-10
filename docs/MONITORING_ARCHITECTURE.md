# Monitoring Architecture

## Overview

The observability stack has four layers: Structured Logging, Error Monitoring, Performance Monitoring, and Event Tracking. All layers feed into Dexie (local audit log) and Sentry (remote error/performance aggregation).

```
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                                 │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Events   │ │ Logger       │ │ Performance  │ │ Error        │   │
│  │ (auth,   │ │ (levels,     │ │ (web vitals, │ │ (boundary,   │   │
│  │  tx,     │ │  contexts,   │ │  API timing, │ │  global      │   │
│  │  sync,   │ │  transports) │ │  routes)     │ │  handler)    │   │
│  │  ai,     │ │              │ │              │ │              │   │
│  │  payment,│ │              │ │              │ │              │   │
│  │  admin)  │ │              │ │              │ │              │   │
│  └────┬─────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘   │
│       │              │                │                │           │
└───────┼──────────────┼────────────────┼────────────────┼───────────┘
        │              │                │                │
        ▼              ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       TRANSPORT LAYER                                │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐     │
│  │   Console transport  │  │   Sentry transport               │     │
│  │   (DEBUG/INFO/WARN/  │  │   - Errors → Sentry.capture      │     │
│  │    ERROR with level  │  │   - WARN+ → Breadcrumbs          │     │
│  │    filtering)        │  │   - Perf → Transactions          │     │
│  └──────────────────────┘  └──────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
        │                              │
        ▼                              ▼
┌─────────────────┐    ┌──────────────────────────────┐
│  Dexie Audit Log │    │  Sentry Dashboard            │
│  (local, full)   │    │  (errors, perf, sessions,    │
│                  │    │   releases, users)           │
└─────────────────┘    └──────────────────────────────┘
```

---

## 1. Structured Logging (`src/core/observability/logger.ts`)

### Levels
| Level | Numeric | Purpose |
|-------|---------|---------|
| DEBUG | 0 | Verbose diagnostics (memory, dev-only) |
| INFO | 1 | Normal operational events |
| WARN | 2 | Recoverable issues, fallbacks, retries |
| ERROR | 3 | Unrecoverable errors, exceptions |

### Contexts
- `auth` — Login, signup, logout, MFA, token refresh
- `transactions` — CRUD operations on transactions
- `sync` — Cloud sync push/pull/conflict
- `ai` — Gemini calls, OCR, parsing
- `payments` — Razorpay proxy, UPI
- `admin` — Backup, purge, config changes
- `system` — Error boundary, unhandled rejections
- `backup` — Auto/manual backup events
- `navigation` — Route transitions
- `performance` — Web vitals, API timing

### Log Format
Structured JSON with timestamp, level, context, message, optional data/error:
```json
{"t":"2026-06-06T12:00:00.000Z","l":"INFO","c":"auth","m":"AUTH_LOGIN","d":{"method":"email"}}
```

### Configuration
`VITE_LOG_LEVEL` env var (default `INFO`):
- `DEBUG` — all levels
- `INFO` — INFO, WARN, ERROR
- `WARN` — WARN, ERROR
- `ERROR` — ERROR only

### Cost
- Console output: removed by Vite `esbuild.drop` in production builds
- Sentry output: controlled by `tracesSampleRate` (0.25 in prod)

---

## 2. Error Monitoring (`sentry.ts`, `ErrorBoundary.tsx`, `main.tsx`)

### Capture Points

| Source | Mechanism | Severity |
|--------|-----------|----------|
| React Error Boundary | `componentDidCatch` → `captureError()` | ERROR |
| Unhandled Promise Rejections | `window.addEventListener('unhandledrejection')` | ERROR |
| ApiClient HTTP errors | `logger.system.warn()` / `captureError()` | WARN/ERROR |
| Zod validation failures | automtically via `zodErrorsIntegration()` | ERROR |
| Manual `captureError()` calls | Any code path | ERROR |

### Sentry Configuration
- `tracesSampleRate`: 1.0 (dev), 0.25 (prod)
- `replaysSessionSampleRate`: 0.1 (10% of all sessions)
- `replaysOnErrorSampleRate`: 1.0 (100% of error sessions)
- `beforeSend`: Dev logging only, no PII stripping (handled by Sentry settings)
- Integrations: `browserTracingIntegration`, `replayIntegration`, `zodErrorsIntegration`

### User Context
Set on login via `setSentryUser({ id, email })`, cleared on logout. Enables per-user error drilldown in Sentry.

### Tags
- `context` — Set to logger context (auth, transactions, etc.)
- `environment` — `development` / `production`
- `release` — `spendwise@VERSION`

---

## 3. Performance Monitoring (`src/core/observability/performance.ts`)

### Web Vitals
| Metric | Observer Type | Thresholds (good / poor) |
|--------|---------------|--------------------------|
| CLS | `layout-shift` | 0.1 / 0.25 |
| LCP | `largest-contentful-paint` | 2500ms / 4000ms |
| FID | `first-input` | 100ms / 300ms |
| INP | `event` | 200ms / 500ms |
| FCP | `paint` | 1800ms / 3000ms |
| TTFB | `navigation` | 800ms / 1800ms |

Reporting:
- All vitals logged via `logger.perf.info()`
- Poor vitals trigger `captureMessage()` warning in Sentry
- Metrics set via `Sentry.setMeasurement()` for Dashboard

### API Timing
- `recordApiTiming(endpoint, durationMs)` called from `ApiClient.request()`
- Maintains in-memory rolling window (last 100 calls per endpoint)
- Exposes `getApiStats()` and `getAllApiStats()` for debugging
- Slow APIs (>5000ms) trigger `captureMessage()` warning

### Route Transitions
- `markRouteTransitionStart()` called on pathname change
- `markRouteTransitionEnd(routeName)` called after render
- Slow transitions (>1000ms) trigger `captureMessage()` warning

### Memory Monitoring
- `reportMemoryUsage()` logs JS heap size via `performance.memory`
- Only available in Chromium browsers

---

## 4. Event Tracking (`src/core/observability/events.ts`)

### Domain Events

#### Auth Events
| Event | Triggered By | Data |
|-------|-------------|------|
| `AUTH_LOGIN` | `signIn()` success/failure | method, error |
| `AUTH_SIGNUP` | `signUp()` success | — |
| `AUTH_LOGOUT` | `signOut()` | — |
| `AUTH_MFA_ENROLL` | `confirmMfaEnrollment()` | — |
| `AUTH_MFA_VERIFY` | `submitMfaCode()` success | — |
| `AUTH_MFA_RECOVERY` | `submitRecoveryCode()` | — |

#### Transaction Events
| Event | Triggered By | Data |
|-------|-------------|------|
| `TX_CREATED` | `addTransaction()` | id, category, amount, type |
| `TX_DELETED` | `deleteTransaction()` | id, category |
| `TX_UPDATED` | (via update methods) | — |
| `TX_BULK_DELETED` | (via bulk methods) | — |

#### Sync Events
| Event | Triggered By | Data |
|-------|-------------|------|
| `SYNC_STARTED` | `syncAll()` | localCount, lastSyncDate |
| `SYNC_PUSH` | `pushTransactions()` | count, chunks |
| `SYNC_PULL` | `pullTransactions()` | count, since |
| `SYNC_COMPLETED` | `syncAll()` success | pushed, pulled, deleted |
| `SYNC_FAILED` | sync error | error |

#### AI Events
| Event | Triggered By | Data |
|-------|-------------|------|
| `AI_CHAT` | `callGemini()` success | tokenCount, type |
| `AI_ERROR` | `callGemini()` error | tokenCount, type, error |

#### Payment Events
| Event | Triggered By | Data |
|-------|-------------|------|
| `RAZORPAY_SYNC` | `fetchRazorpayTransactions()` | count, from, to, error |

#### Admin Events
| Event | Triggered By | Data |
|-------|-------------|------|
| `ADMIN_BACKUP_EXPORT` | Manual export | size |
| `ADMIN_BACKUP_IMPORT` | Manual import | filename |
| `ADMIN_BACKUP_AUTO` | Auto scheduler | size |
| `ADMIN_DATA_PURGE` | Purge old deleted | olderThanDays |

### Storage
Every event is:
1. Written to `logger` (console + Sentry breadcrumb)
2. Written to `db.auditLog` (Dexie IndexedDB, local-only)

No events leave the client except through Sentry.

---

## 5. Dexie Audit Log (`src/db/db.ts`)

### Schema
```typescript
interface DbAuditEntry {
  id?: string;
  tableName: string;     // event domain or table name
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;      // event name or record ID
  oldData?: string;      // previous state (JSON string)
  newData?: string;      // new state or metadata (JSON string)
  createdAt: string;     // ISO timestamp
}
```

### Indexes
`++id, tableName, operation, recordId, createdAt`

### Retention
Audit log is local only (IndexedDB). No automatic purge — managed via Dexie's built-in quota.

---

## 6. Setup Instructions

### Sentry
1. Create a project at https://sentry.io (select "React")
2. Copy the DSN (`https://xxx@o000.ingest.sentry.io/000`)
3. Add to `.env.local`:
   ```
   VITE_SENTRY_DSN=https://xxx@o000.ingest.sentry.io/000
   ```
4. For source maps, set `SENTRY_AUTH_TOKEN` in CI env and enable `@sentry/vite-plugin` in `vite.config.ts`

### Log Level
```
VITE_LOG_LEVEL=INFO  # DEBUG | INFO | WARN | ERROR
```

### Verification
1. Set `VITE_SENTRY_DSN` and `VITE_LOG_LEVEL=DEBUG`
2. Build: `npm run build`
3. Any uncaught error will appear in Sentry dashboard within 60s
4. Web vitals appear in Sentry Performance tab
5. Check browser console for structured JSON logs

---

## 7. Files Summary

| File | Purpose |
|------|---------|
| `src/core/observability/logger.ts` | Structured logging with levels, contexts, console+Sentry dual transport |
| `src/core/observability/sentry.ts` | Sentry init, user context, captureError, captureMessage |
| `src/core/observability/events.ts` | Domain event definitions + trackEvent with audit log write |
| `src/core/observability/performance.ts` | Web Vitals, API timing, route transitions, memory |
| `src/core/observability/index.ts` | Barrel exports |
| `src/main.tsx` | Sentry init, web vitals observer, unhandled rejection handler |
| `src/components/ui/ErrorBoundary.tsx` | Sentry error capture on React errors |
| `src/app/App.tsx` | Sentry user context, route transition timing |
| `src/core/api/client.ts` | API timing recording |
| `src/hooks/useAuth.tsx` | Auth event tracking + Sentry user context |
| `src/features/transactions/store/financeSlice.ts` | Transaction event tracking |
| `src/core/api/supabase.ts` | Sync event tracking |
| `src/core/api/gemini.ts` | AI event tracking |
| `src/features/sync/parsers/upi.ts` | Payment event tracking |
| `src/db/db.ts` | Audit log table and writeAuditLog function |
| `.env.example` | VITE_SENTRY_DSN and VITE_LOG_LEVEL documentation |
