-- ─── SpendWise Shared Wallets v2 ─────────────────────────────────────────────
-- Run in Supabase SQL Editor

-- 1. Shared Groups
CREATE TABLE IF NOT EXISTS public.shared_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text NOT NULL DEFAULT 'friends',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 2. Group Members
CREATE TABLE IF NOT EXISTS public.shared_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email text,
  display_name text NOT NULL DEFAULT 'Member',
  emoji text DEFAULT '👤',
  role text DEFAULT 'member',
  status text DEFAULT 'invited',
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  UNIQUE(group_id, user_id)
);

-- 3. Wallet Entries (joint cash pot)
CREATE TABLE IF NOT EXISTS public.shared_wallet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.shared_group_members(id) ON DELETE CASCADE,
  kind text NOT NULL,
  amount numeric NOT NULL,
  label text NOT NULL DEFAULT '',
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Split Expenses
CREATE TABLE IF NOT EXISTS public.shared_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  paid_by_member_id uuid NOT NULL REFERENCES public.shared_group_members(id) ON DELETE CASCADE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  amount numeric NOT NULL,
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shared_expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.shared_expenses(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.shared_group_members(id) ON DELETE CASCADE,
  share_percent numeric NOT NULL
);

-- 5. Shared Goals
CREATE TABLE IF NOT EXISTS public.shared_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text DEFAULT '🎯',
  target_amount numeric NOT NULL,
  target_date text NOT NULL,
  color text NOT NULL DEFAULT '#14b8a6',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shared_goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.shared_goals(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.shared_group_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  date text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 6. In-app Notifications
CREATE TABLE IF NOT EXISTS public.shared_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.shared_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_wallet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notifications ENABLE ROW LEVEL SECURITY;

-- shared_groups: visible if you're a member (any status)
CREATE POLICY "Members can see their group"
  ON public.shared_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_group_members
      WHERE group_id = shared_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.shared_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update group"
  ON public.shared_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_group_members
      WHERE group_id = shared_groups.id AND user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Group owners can delete group"
  ON public.shared_groups FOR DELETE
  USING (created_by = auth.uid());

-- shared_group_members: visible to all members of the same group
CREATE POLICY "Group members can view members"
  ON public.shared_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_group_members m
      WHERE m.group_id = shared_group_members.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can add members"
  ON public.shared_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shared_group_members m
      WHERE m.group_id = shared_group_members.group_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

CREATE POLICY "Users can update own membership"
  ON public.shared_group_members FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Owners can remove members"
  ON public.shared_group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.shared_group_members m
      WHERE m.group_id = shared_group_members.group_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

-- wallet_entries: active members only
CREATE POLICY "Active members can manage wallet entries"
  ON public.shared_wallet_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_group_members m
      WHERE m.group_id = shared_wallet_entries.group_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- shared_expenses
CREATE POLICY "Active members can manage expenses"
  ON public.shared_expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_group_members m
      WHERE m.group_id = shared_expenses.group_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- shared_expense_splits
CREATE POLICY "Active members can manage expense splits"
  ON public.shared_expense_splits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_expenses e
        JOIN public.shared_group_members m ON m.group_id = e.group_id
      WHERE e.id = shared_expense_splits.expense_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- shared_goals
CREATE POLICY "Active members can manage goals"
  ON public.shared_goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_group_members m
      WHERE m.group_id = shared_goals.group_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- shared_goal_contributions
CREATE POLICY "Active members can manage goal contributions"
  ON public.shared_goal_contributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_goals g
        JOIN public.shared_group_members m ON m.group_id = g.group_id
      WHERE g.id = shared_goal_contributions.goal_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- shared_notifications: users see only their own
CREATE POLICY "Users manage own notifications"
  ON public.shared_notifications FOR ALL
  USING (user_id = auth.uid());

-- Allow invited users (by email) to see the group invite before they have a user_id
CREATE POLICY "Invited users can see their pending invite"
  ON public.shared_group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    (status = 'invited' AND invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
