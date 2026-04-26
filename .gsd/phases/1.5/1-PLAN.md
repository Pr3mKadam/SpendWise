---
phase: 1.5
plan: 1
wave: 1
---

# Plan 1.5.1: Convex Core Infrastructure

## Objective
Initialize Convex in the SpendWise project and set up the foundational provider and schema.

## Context
- .gsd/SPEC.md
- .gsd/phases/1.5/RESEARCH.md
- package.json
- src/main.tsx

## Tasks

<task type="auto">
  <name>Initialize Convex</name>
  <files>package.json, .env.local</files>
  <action>
    Install Convex client library and initialize the project.
    - Run `npm install convex lucide-react` (lucide-react is already there, but ensuring dependencies).
    - Run `npx convex dev --once` to initialize the project and create `.env.local` entries.
    - Note: User may need to log in if not already.
  </action>
  <verify>test -d "convex" && grep "VITE_CONVEX_URL" .env.local</verify>
  <done>Convex is installed and project is initialized with a connection URL.</done>
</task>

<task type="auto">
  <name>Define Initial Schema</name>
  <files>convex/schema.ts</files>
  <action>
    Create the database schema in Convex based on the existing Supabase tables (transactions, wallets, accounts).
    - Use `defineSchema` and `defineTable`.
    - Include fields for `amount`, `category`, `date`, `description`, `walletId`, and `userId`.
  </action>
  <verify>npx convex typecheck</verify>
  <done>convex/schema.ts exists and passes type checking.</done>
</task>

<task type="auto">
  <name>Setup Convex Provider</name>
  <files>src/main.tsx</files>
  <action>
    Wrap the React application with `ConvexProvider`.
    - Import `ConvexProvider` and `ConvexReactClient` from `convex/react`.
    - Initialize the client using `import.meta.env.VITE_CONVEX_URL`.
    - Replace or alongside the existing `AuthProvider` (migration will continue in next plan).
  </action>
  <verify>grep "ConvexProvider" src/main.tsx</verify>
  <done>The app is successfully wrapped in the ConvexProvider.</done>
</task>

## Success Criteria
- [ ] Convex directory exists with schema.ts.
- [ ] .env.local contains VITE_CONVEX_URL.
- [ ] Application starts without errors with ConvexProvider integrated.
