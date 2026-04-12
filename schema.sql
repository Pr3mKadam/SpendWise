-- SpendWise Database Schema  
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_balance numeric DEFAULT 0,
  balance_anchor_net numeric DEFAULT 0,
  currency text DEFAULT '$',
  onboarding_complete boolean DEFAULT false,
  budget_limits jsonb DEFAULT '{}'::jsonb,
  parental_settings jsonb DEFAULT NULL,   -- cloud-synced parental control state
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  merchant text NOT NULL,
  type text NOT NULL,
  description text,
  confidence numeric,
  ai_parsed boolean DEFAULT false,
  status text DEFAULT 'completed',        -- 'completed' | 'pending_approval'
  created_at timestamptz DEFAULT now()
);

-- 3. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text NOT NULL,
  target_amount numeric NOT NULL,
  saved_amount numeric NOT NULL,
  target_date text NOT NULL,
  monthly_contribution numeric NOT NULL,
  status text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Parent-Child Account Links (Remote Parent Dashboard)
-- A parent links to a child's account so they can monitor/manage remotely.
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL until child accepts
  invite_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending',           -- 'pending' | 'active' | 'revoked'
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz DEFAULT NULL,
  UNIQUE(parent_user_id, child_user_id)
);

-- ── RLS Policies ─────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id);

-- Parents can read child links they created; children can read/update links targeting them
CREATE POLICY "Parent can manage their child links"
  ON public.parent_child_links FOR ALL
  USING (auth.uid() = parent_user_id OR auth.uid() = child_user_id);

-- Parents can read their linked child's transactions (read-only)
CREATE POLICY "Parents can view linked child transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_links
      WHERE parent_user_id = auth.uid()
        AND child_user_id = transactions.user_id
        AND status = 'active'
    )
  );

-- Allow children to verify and claim pending invite codes
CREATE POLICY "Anyone can read pending invites"
  ON public.parent_child_links FOR SELECT
  USING (status = 'pending');

CREATE POLICY "Anyone can claim pending invites"
  ON public.parent_child_links FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (child_user_id = auth.uid());
