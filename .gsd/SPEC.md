# SPEC.md - SpendWise Migration to Convex

## Status: FINALIZED

## Overview
This specification details the migration of SpendWise from Supabase to Convex. The goal is to simplify backend logic, achieve real-time synchronization without configuration overhead, and move business logic into TypeScript functions.

## Requirements
1. **Convex Integration**:
   - Initialize Convex in the project.
   - Define the database schema in `convex/schema.ts`.
   - Implement data mutation and query functions in `convex/`.
2. **Authentication**:
   - Replace Supabase Auth with Convex Auth (or Clerk/Lucia integrated with Convex).
   - *Decision*: Since Convex recommends Clerk or Lucia, and the user wants "No RLS Stress," we will use Convex's built-in Auth or a simple custom Auth pattern if possible.
3. **Data Migration**:
   - (Optional for Hackathon) Re-seed the database if necessary.
   - Update `src/lib/` and `src/services/` to use Convex hooks (`useQuery`, `useMutation`).
4. **Real-time Features**:
   - Ensure all queries are live and reactive using Convex.

## Technical Constraints
- Use TypeScript for all backend functions.
- Maintain existing UI components but update data fetching logic.
- Remove `@supabase/supabase-js` dependency once migration is complete.

## Out of Scope
- Major UI redesign.
- Adding new features unrelated to the backend migration.
