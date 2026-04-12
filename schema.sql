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

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id);
