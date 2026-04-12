-- Run this in your Supabase SQL Editor to fix the "new row violates row-level security" error

-- 1. Fix the INSERT policy for members
DROP POLICY IF EXISTS "Owners can add members" ON public.shared_group_members;

CREATE POLICY "Owners can add members"
  ON public.shared_group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM public.shared_groups WHERE created_by = auth.uid()
    )
  );

-- 2. Fix the SELECT policy so the inviter can read back the newly inserted row
DROP POLICY IF EXISTS "Invited users can see their pending invite" ON public.shared_group_members;
DROP POLICY IF EXISTS "Group members can view members" ON public.shared_group_members;

CREATE POLICY "Group members can view members"
  ON public.shared_group_members FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    group_id IN (
      SELECT id FROM public.shared_groups WHERE created_by = auth.uid()
    )
  );
