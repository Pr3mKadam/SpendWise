# RESEARCH.md - Phase 1.6: DIY Local Persistence

## Objective
Select the optimal local database solution for SpendWise to replace `localStorage`.

## Options Considered

### 1. Dexie.js
- **Pros**: Lightweight, elegant API, strong TypeScript support, built specifically for IndexedDB, excellent React hooks (`dexie-react-hooks`), easy schema migrations.
- **Cons**: Tied to IndexedDB (not a true cross-device sync engine out of the box).
- **Verdict**: Highly suitable for a React/Vite PWA focusing on performance and simplicity.

### 2. PouchDB
- **Pros**: Master of offline-first sync. Designed to sync seamlessly with CouchDB.
- **Cons**: Heavier bundle size. Overkill if we aren't planning to set up a CouchDB backend for sync.
- **Verdict**: Too heavy for our current 100% local-first, no-cloud goal.

### 3. Raw IndexedDB
- **Pros**: Zero dependencies.
- **Cons**: Clunky, callback-heavy (though Promises can be used), hard to manage migrations and complex queries.
- **Verdict**: Too much boilerplate.

## Decision
**Dexie.js** is the winner. It provides the right balance of a clean developer experience (especially with TypeScript and React) and powerful local storage capabilities without the overhead of a sync engine we don't need right now.

## Implementation Details
1. Install `dexie` and `dexie-react-hooks`.
2. Create `src/db/db.ts` to instantiate the Dexie database and define the schema (Transactions, Categories, Budgets, etc.).
3. Update `src/store/` to sync Zustand state with the Dexie database, or modify custom hooks to pull directly from `useLiveQuery` (Dexie hook). Since we already have Zustand, we will create a middleware or synchronization layer so Zustand persists to Dexie instead of `localStorage`.
