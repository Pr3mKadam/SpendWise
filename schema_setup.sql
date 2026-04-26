-- ============================================================
-- SpendWise — Full Database Setup
-- Run this ONCE in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_balance numeric DEFAULT 0,
  balance_anchor_net numeric DEFAULT 0,
  currency text DEFAULT '₹',
  onboarding_complete boolean DEFAULT false,
  budget_limits jsonb DEFAULT '{}'::jsonb,
  parental_settings jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Transactions Table (with tags column)
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
  status text DEFAULT 'completed',
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now()
);

-- Add tags column if it doesn't exist (safe to run on existing tables)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

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

-- 4. Parent-Child Account Links
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz DEFAULT NULL,
  UNIQUE(parent_user_id, child_user_id)
);

-- ── Enable Row Level Security ──────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies (drop first to avoid conflicts) ───────────────

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage their own goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Parent can manage their child links" ON public.parent_child_links;
DROP POLICY IF EXISTS "Parents can view linked child transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can read pending invites" ON public.parent_child_links;
DROP POLICY IF EXISTS "Anyone can claim pending invites" ON public.parent_child_links;

CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Parent can manage their child links"
  ON public.parent_child_links FOR ALL
  USING (auth.uid() = parent_user_id OR auth.uid() = child_user_id);

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

CREATE POLICY "Anyone can read pending invites"
  ON public.parent_child_links FOR SELECT
  USING (status = 'pending');

CREATE POLICY "Anyone can claim pending invites"
  ON public.parent_child_links FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (child_user_id = auth.uid());
