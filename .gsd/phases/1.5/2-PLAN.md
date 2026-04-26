---
phase: 1.5
plan: 2
wave: 1
---

# Plan 1.5.2: Auth Transition to Convex

## Objective
Replace Supabase Auth with Convex Auth to ensure a unified backend experience.

## Context
- .gsd/phases/1.5/RESEARCH.md
- src/contexts/AuthContext.tsx
- convex/auth.config.ts

## Tasks

<task type="auto">
  <name>Configure Convex Auth</name>
  <files>convex/auth.config.ts, convex/schema.ts</files>
  <action>
    Setup Convex Auth (using Convex's built-in Auth library or Clerk integration).
    - If using Convex Auth: Add `auth.ts` to `convex/` and configure providers.
    - Update `schema.ts` to include `users` and `sessions` tables if required by the chosen provider.
  </action>
  <verify>npx convex typecheck</verify>
  <done>Auth configuration is complete and type-safe.</done>
</task>

<task type="auto">
  <name>Update AuthContext</name>
  <files>src/contexts/AuthContext.tsx</files>
  <action>
    Refactor `AuthContext` to use Convex's auth hooks.
    - Replace Supabase session logic with `useConvexAuth()`.
    - Map Supabase user properties to Convex user properties.
    - Ensure `login` and `logout` functions are updated to point to the new backend.
  </action>
  <verify>grep "useConvexAuth" src/contexts/AuthContext.tsx</verify>
  <done>AuthContext successfully uses Convex for session management.</done>
</task>

## Success Criteria
- [ ] Users can sign in/sign out via Convex.
- [ ] Auth state is available globally through the existing AuthContext interface.
