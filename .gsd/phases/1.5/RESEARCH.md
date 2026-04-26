# Research: Supabase to Convex Migration

## Overview
Migrating from Supabase to Convex involves moving from a relational SQL database with Row Level Security (RLS) to a document-oriented database with TypeScript-driven security and logic.

## Findings

### 1. Initialization
- Command: `npx convex dev`
- Actions:
  - Prompts for login/project creation.
  - Generates `.env.local` with `VITE_CONVEX_URL`.
  - Starts a background process to sync functions in `convex/`.

### 2. Schema & Validation
- File: `convex/schema.ts`
- Pattern: Use `defineSchema` and `defineTable` with validation helpers from `convex/values`.
- Advantage: Type safety is built-in.

### 3. Data Migration
- Supabase: Export tables to JSONL via `psql`.
- Convex: `npx convex import --table <name> <file>.jsonl`.
- Schema: Convex can infer schema from imported data.

### 4. Authentication
- Convex supports:
  - **Convex Auth (Beta)**: Built-in solution.
  - **Clerk**: Highly recommended for React.
  - **Auth0**: Alternative provider.
- *Recommendation*: For a hackathon, Convex Auth or Clerk integration is fastest.

### 5. Queries & Mutations
- Supabase: `supabase.from('table').select('*')`
- Convex:
  ```typescript
  // convex/tasks.ts
  export const get = query({
    args: {},
    handler: async (ctx) => {
      return await ctx.db.query("tasks").collect();
    },
  });
  ```
- React: `useQuery(api.tasks.get)`

## Migration Path
1. Initialize Convex.
2. Define schema based on existing Supabase tables.
3. Import data.
4. Replace `SupabaseContext` with `ConvexProvider`.
5. Rewrite data access functions in `src/lib/` and `src/services/` to use Convex hooks.
6. Swap Auth providers.
