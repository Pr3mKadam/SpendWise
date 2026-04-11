-- SpendWise: profiles, transactions, goals + RLS
--
-- HOW TO RUN: Open this file in your editor, select ALL text from "begin;" through "commit;"
-- (do not paste the filename). Paste into Supabase Dashboard → SQL → New query → Run.

begin;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  initial_balance numeric not null default 5200,
  balance_anchor_net numeric not null default 0,
  currency text not null default '$',
  onboarding_complete boolean not null default false,
  budget_limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  amount numeric not null,
  category text not null,
  merchant text not null,
  type text not null check (type in ('credit', 'debit')),
  description text,
  confidence numeric,
  ai_parsed boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);

create table if not exists public.savings_goals (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  emoji text not null,
  target_amount numeric not null,
  saved_amount numeric not null,
  target_date date not null,
  monthly_contribution numeric not null,
  status text not null,
  color text not null,
  created_at date not null
);

create index if not exists savings_goals_user_id_idx on public.savings_goals (user_id);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "tx_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "tx_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "tx_delete_own" on public.transactions for delete using (auth.uid() = user_id);

create policy "goals_select_own" on public.savings_goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.savings_goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.savings_goals for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
