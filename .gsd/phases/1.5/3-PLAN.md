---
phase: 1.5
plan: 3
wave: 2
---

# Plan 1.5.3: Data Logic Migration

## Objective
Migrate all transaction and wallet logic from Supabase service calls to Convex functions.

## Context
- src/lib/supabaseData.ts
- convex/transactions.ts
- src/components/Dashboard.tsx

## Tasks

<task type="auto">
  <name>Implement Convex Functions</name>
  <files>convex/transactions.ts, convex/wallets.ts</files>
  <action>
    Create Convex query and mutation functions for all core data operations.
    - Implement `getTransactions`, `addTransaction`, `updateTransaction`.
    - Implement `getWallets`, `createWallet`.
    - Ensure all functions enforce user isolation (e.g., `ctx.auth.getUserIdentity()`).
  </action>
  <verify>npx convex typecheck</verify>
  <done>Core data operations are implemented as Convex functions.</done>
</task>

<task type="auto">
  <name>Refactor Service Layer</name>
  <files>src/lib/supabaseData.ts, src/hooks/useData.ts</files>
  <action>
    Update or replace the service layer to use Convex hooks.
    - Change `supabaseData.ts` to `convexData.ts` (or update existing).
    - Swap `supabase.from().select()` calls for `useQuery(api.transactions.get)`.
    - Update components like `Dashboard` and `History` to consume the new live data.
  </action>
  <verify>! grep "supabase.from" src/lib/supabaseData.ts</verify>
  <done>The application no longer relies on Supabase for transaction data.</done>
</task>

## Success Criteria
- [ ] Transactions are fetched and displayed in real-time via Convex.
- [ ] Adding a transaction updates the UI instantly across all tabs.
- [ ] Supabase dependency can be safely removed from package.json.
