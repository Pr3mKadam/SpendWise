-- =============================================================================
-- RLS FIX v2: shared_group_members — eliminates infinite recursion
-- Run this entire script in Supabase SQL Editor
-- =============================================================================

-- ── Step 1: Drop all existing conflicting policies ───────────────────────────

DROP POLICY IF EXISTS "Group members can view members"     ON public.shared_group_members;
DROP POLICY IF EXISTS "Owners can add members"             ON public.shared_group_members;
DROP POLICY IF EXISTS "Users can update own membership"    ON public.shared_group_members;
DROP POLICY IF EXISTS "Owners can remove members"          ON public.shared_group_members;
DROP POLICY IF EXISTS "Invited users can see their pending invite" ON public.shared_group_members;

-- ── Step 2: Helper function (SECURITY DEFINER bypasses RLS) ──────────────────
-- This is the standard Supabase pattern to avoid recursive RLS policies.

CREATE OR REPLACE FUNCTION public.is_group_owner(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_group_members
    WHERE group_id = p_group_id
      AND user_id  = auth.uid()
      AND role     = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_group_members
    WHERE group_id = p_group_id
      AND user_id  = auth.uid()
  );
$$;

-- ── Step 3: Re-create clean, non-recursive policies ──────────────────────────

-- SELECT: see your own row, OR rows in groups where you're a member
CREATE POLICY "Members can view group members"
  ON public.shared_group_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_group_member(group_id)
    OR (status = 'invited' AND invited_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        ))
  );

-- INSERT: only group owners can add new members (uses SECURITY DEFINER fn, no recursion)
CREATE POLICY "Owners can invite members"
  ON public.shared_group_members FOR INSERT
  WITH CHECK (
    public.is_group_owner(group_id)
  );

-- Special case: allow a newly-created group's first owner row to be inserted
-- (owner inserts their own row during group creation — group_id exists but they
--  are not yet in the table, so is_group_owner() returns false for that row)
CREATE POLICY "Creator can insert own owner row"
  ON public.shared_group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1 FROM public.shared_groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- UPDATE: users can update their own row (e.g. accepting an invite)
--         owners can update any row in their group
CREATE POLICY "Members can update own row or owner updates any"
  ON public.shared_group_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_group_owner(group_id)
  );

-- DELETE: users can leave (delete own row), owners can remove anyone
CREATE POLICY "Members can leave or owner can remove"
  ON public.shared_group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_group_owner(group_id)
  );

-- ── Step 4: Ensure get_group_members RPC exists (used by fetchGroupMembers) ──

CREATE OR REPLACE FUNCTION public.get_group_members(p_group_id uuid)
RETURNS SETOF public.shared_group_members
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.shared_group_members
  WHERE group_id = p_group_id
  ORDER BY invited_at ASC;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_group_owner(uuid)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_members(uuid) TO authenticated;
