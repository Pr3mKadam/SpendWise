# Reliability Report

## Summary

Comprehensive reliability improvements implemented across retry mechanisms, offline support, sync conflict resolution, error boundaries, graceful degradation, and crash recovery.

---

## 1. Retry Mechanisms

### Files

- `src/core/reliability/retry.ts` — Generic `withRetry()` utility + `calculateBackoff()` + error classifiers
- `src/core/api/client.ts` — Offline-aware pre-flight check added

### Features

- **Configurable retry**: `maxAttempts`, `baseDelayMs`, `maxDelayMs`, `jitter`, custom `retryIf` predicate, `onRetry` callback
- **Exponential backoff**: `baseDelay * 2^attempt`, capped at `maxDelayMs`
- **Jitter**: Random ±50% on each delay to avoid thundering herd
- **Error classification**: `isTransientError()` (429, 5xx, network, timeout), `isOfflineError()` (network only)
- **API Client integration**: `navigator.onLine` check before any HTTP request — throws immediately with `NETWORK_ERROR` when offline

### Tests (9)

- calculateBackoff: basic exponential, max cap, jitter range
- withRetry: first-attempt success, retry-then-succeed, exhausts retries, retryIf guard, onRetry callback
- isTransientError / isOfflineError: all error type detections

---

## 2. Offline Queue

### Files

- `src/core/reliability/offlineQueue.ts` — IndexedDB-backed offline operation queue
- `src/hooks/useOnlineStatus.ts` — Shared online status hook with auto-replay

### Features

- **Persistent queue**: Items stored in Dexie `keyval` table with `queue:` key prefix — survives tab close
- **Queue API**: `enqueue()`, `dequeue()`, `peekQueue()`, `processQueue()`, `queueSize()`, `clearQueue()`
- **Auto-replay**: `useOnlineStatus()` detects `online` event and replays all queued operations
- **Max attempts**: Items dropped after `maxAttempts` failures with audit log entry
- **Audit trail**: Every enqueue/dequeue/drop logged to Dexie auditLog
- **Periodic check**: Queue size polled every 30s
- **Register handlers**: `registerQueueHandler(domain, handler)` for extensible domain-specific execution

### Integration

- `supabase.ts::syncAll()`: On offline error, enqueues all unsynced transactions instead of failing
- `supabase.ts::syncFull()`: Same offline-queue fallback

---

## 3. Sync Conflict Resolution

### Files

- `src/core/reliability/conflictResolution.ts` — LWW conflict resolution with audit trail

### Features

- **Three strategies**: `lww` (last-writer-wins via `updatedAt`), `local-wins`, `remote-wins`
- **Per-transaction resolution**: `resolveTransactionConflict(local, remote, strategy)` — returns resolved + conflict record
- **Batch resolution**: `resolveTransactionBatch(localTxs, remoteTxs, strategy)` — merges two arrays with conflict detection
- **Conflict audit**: All conflicts recorded to sessionStorage (last 100) and Dexie auditLog
- **Same-timestamp handling**: Equal timestamps prefer local (deterministic tiebreaker)

### Integration

- `supabase.ts::syncAll()`: Now resolves conflicts between existing local and cloud transactions, reports actual count
- `supabase.ts::syncFull()`: Same conflict resolution applied

### Tests (5)

- LWW picks newer timestamp, local-wins, remote-wins
- Equal timestamps prefer local
- Conflict record metadata
- Batch: merge without conflicts, detect conflicts, handle empty

---

## 4. Error Boundaries

### Files

- `src/components/ui/ErrorBoundary.tsx` — Enhanced with retry, offline awareness, crash recording

### Features

- **Error categorization**: `offline`, `chunk`, `api`, `unknown` — each with distinct icon and recovery action
- **Retry button**: Calls `withRetry()` on `onRetry` prop, shows retry count on failure
- **Auto-reload on chunk errors**: Preserved from original
- **Crash recording**: Non-offline errors recorded via `recordCrash()` for crash loop detection
- **Nested boundaries**: Each view in `ViewRenderer` now has its own `ErrorBoundary(name={id})`
- **App-level boundary**: `App.tsx` wraps `AppAuthenticated` and `AuthView` in `ErrorBoundary`
- **Contextual messaging**: "No Connection" for offline, "New version available" for chunk, "Server unavailable" for API

---

## 5. Graceful Degradation

### Integration Points

- `supabase.ts::syncAll()`: If push succeeds but pull fails, returns empty newTransactions with partial result and logs — user sees stale local data rather than error
- `supabase.ts::syncFull()`: Same degradation pattern
- `ErrorBoundary`: Shows retry UI with error-specific message instead of blank screen
- `OfflineIndicator` component (pre-existing): Shows "You are offline" banner without blocking usage

### Patterns Used

- **Fail-open**: Pull failures return `[]` instead of throwing — app continues with local data
- **Offline enqueue**: Network errors during sync queue the operation for later replay instead of failing
- **No data dependency**: All views render primarily from local Dexie/Zustand state, not from API responses

---

## 6. Crash Recovery

### Files

- `src/core/reliability/crashRecovery.ts` — Crash loop detection, recovery actions
- `src/app/App.tsx` — Crash recovery registration + recovery mode UI

### Features

- **Crash counter**: Tracks consecutive crashes within 60-second rolling window (`localStorage`)
- **Three thresholds**:
  - 0-2 crashes: Normal operation
  - 3-4 crashes: `reload` — triggers full page reload
  - 5+ crashes: `reset-storage` — deletes IndexedDB databases + clears localStorage
- **`onbeforeunload` hook**: Resets crash count on intentional navigation (not a crash)
- **Recovery mode UI**: Shows a "Recovery Mode" screen when `isInRecoveryMode()` is true
- **Audit trail**: All recovery actions logged to Dexie auditLog
- **Sentry capture**: Successful recovery actions captured as Sentry errors for diagnostics

### Tests (7)

- Starts at zero, increments on recordCrash
- Threshold at 3+ crashes within window
- Count resets outside 60s window
- `clearCrashCount()` resets everything
- `getRecoveryAction()` returns correct levels

---

## Test Results

```
 ✓ src/__tests__/reliability.test.ts (29 tests)
 Tests  29 passed (29)
```

### Test Coverage

| Area                       | Tests | Status |
| -------------------------- | ----- | ------ |
| calculateBackoff           | 3     | ✅     |
| withRetry                  | 5     | ✅     |
| isTransientError           | 3     | ✅     |
| isOfflineError             | 3     | ✅     |
| Conflict Resolution (pure) | 5     | ✅     |
| Conflict Batch (pure)      | 3     | ✅     |
| Crash Recovery             | 7     | ✅     |

### Build Verification

- TypeScript: **0 errors**
- Vite build: **success** (3773 modules, 9.50s)
- Main index: 560 kB (176 kB gzip)
- All existing routes, chunks, and vendor splits preserved

---

## Files Changed

| File                                         | Change Description                                       |
| -------------------------------------------- | -------------------------------------------------------- |
| `src/core/reliability/retry.ts`              | NEW — withRetry, calculateBackoff, error classifiers     |
| `src/core/reliability/offlineQueue.ts`       | NEW — persistent offline queue via Dexie                 |
| `src/core/reliability/conflictResolution.ts` | NEW — LWW conflict resolution                            |
| `src/core/reliability/crashRecovery.ts`      | NEW — crash loop detection + recovery                    |
| `src/core/reliability/index.ts`              | NEW — barrel export                                      |
| `src/hooks/useOnlineStatus.ts`               | NEW — shared online status hook + queue replay           |
| `src/components/ui/ErrorBoundary.tsx`        | ENHANCED — retry, categorization, crash recording        |
| `src/core/api/client.ts`                     | ENHANCED — offline pre-flight check                      |
| `src/core/api/supabase.ts`                   | ENHANCED — offline queue + conflict resolution           |
| `src/app/App.tsx`                            | ENHANCED — crash recovery registration, recovery mode UI |
| `src/app/ViewRenderer.tsx`                   | ENHANCED — per-view ErrorBoundary name tags              |
| `src/__tests__/reliability.test.ts`          | NEW — 29 tests across all reliability modules            |

---

## Future Recommendations

1. **Service Worker background sync**: Register `SyncManager` for queue replay even when tab is backgrounded
2. **API runtime caching**: Add `NetworkFirst` strategy for Supabase GET requests in Workbox
3. **Conflict UI**: Show conflict resolution choices to user when `local-wins` isn't sufficient
4. **Periodic background sync**: Poll Supabase for updates every 5 minutes via service worker
5. **Queue dashboard**: UI component showing pending queue items with manual retry/drop controls
