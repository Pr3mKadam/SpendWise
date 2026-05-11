/**
 * SpendWise — Supabase Integration Layer
 *
 * Production-ready Supabase client + sync utilities.
 * To activate: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *
 * SQL Schema (run once in Supabase SQL editor):
 * ──────────────────────────────────────────────
 * create table if not exists public.transactions (
 *   id           text primary key,
 *   user_id      uuid references auth.users(id) on delete cascade,
 *   date         text not null,
 *   amount       numeric not null,
 *   type         text not null check (type in ('debit','credit')),
 *   category     text not null,
 *   merchant     text not null,
 *   description  text,
 *   tags         text[],
 *   confidence   numeric,
 *   ai_parsed    boolean default false,
 *   created_at   timestamptz default now()
 * );
 *
 * create table if not exists public.gamification (
 *   user_id      uuid primary key references auth.users(id) on delete cascade,
 *   total_xp     int default 0,
 *   level        int default 1,
 *   streak       int default 0,
 *   last_active  text,
 *   updated_at   timestamptz default now()
 * );
 *
 * -- Row-level security
 * alter table public.transactions enable row level security;
 * create policy "own rows" on public.transactions
 *   using (auth.uid() = user_id);
 *
 * alter table public.gamification enable row level security;
 * create policy "own row" on public.gamification
 *   using (auth.uid() = user_id);
 */

import { Transaction } from '../types';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL   = import.meta.env.VITE_SUPABASE_URL   as string | undefined;
const SUPABASE_ANON  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON;

// ─── Lightweight REST client (no npm package required) ───────────────────────
async function supabaseRequest(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<any> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON!,
      'Authorization': `Bearer ${token ?? SUPABASE_ANON!}`,
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }
  return res.json().catch(() => null);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SupabaseUser {
  id: string;
  email: string;
  access_token: string;
}

export async function signUpWithEmail(email: string, password: string): Promise<SupabaseUser> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON! },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg ?? data.error_description ?? 'Sign up failed');
  return { id: data.user.id, email: data.user.email, access_token: data.access_token };
}

export async function signInWithEmail(email: string, password: string): Promise<SupabaseUser> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON! },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg ?? data.error_description ?? 'Sign in failed');
  return { id: data.user.id, email: data.user.email, access_token: data.access_token };
}

export async function signOut(token: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON!, Authorization: `Bearer ${token}` },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

/** Upload local transactions to Supabase (upsert on id conflict) */
export async function pushTransactions(
  transactions: Transaction[],
  userId: string,
  token: string,
): Promise<void> {
  if (!isSupabaseConfigured || transactions.length === 0) return;

  const rows = transactions.map(t => ({
    id:          t.id,
    user_id:     userId,
    date:        t.date,
    amount:      t.amount,
    type:        t.type,
    category:    t.category,
    merchant:    t.merchant,
    description: t.description ?? null,
    tags:        t.tags ?? [],
    confidence:  t.confidence ?? null,
    ai_parsed:   t.aiParsed ?? false,
  }));

  // Batch in chunks of 500
  for (let i = 0; i < rows.length; i += 500) {
    await supabaseRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(rows.slice(i, i + 500)),
      headers: { Prefer: 'resolution=merge-duplicates' },
    }, token);
  }
}

/** Pull all transactions for user from Supabase */
export async function pullTransactions(
  userId: string,
  token: string,
  since?: string, // ISO date string
): Promise<Transaction[]> {
  if (!isSupabaseConfigured) return [];

  let path = `/transactions?user_id=eq.${userId}&order=date.desc`;
  if (since) path += `&date=gte.${since}`;

  const rows: any[] = await supabaseRequest(path, {}, token) ?? [];
  return rows.map(r => ({
    id:          r.id,
    date:        r.date,
    amount:      Number(r.amount),
    type:        r.type as 'debit' | 'credit',
    category:    r.category,
    merchant:    r.merchant,
    description: r.description ?? undefined,
    tags:        r.tags ?? [],
    confidence:  r.confidence ?? undefined,
    aiParsed:    r.ai_parsed ?? false,
    isNew:       false,
  }));
}

// ─── Gamification sync ────────────────────────────────────────────────────────

export interface GamificationState {
  totalXP: number;
  level: number;
  streak: number;
  lastActive: string;
}

export async function pushGamification(
  state: GamificationState,
  userId: string,
  token: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabaseRequest('/gamification', {
    method: 'POST',
    body: JSON.stringify({
      user_id:     userId,
      total_xp:    state.totalXP,
      level:       state.level,
      streak:      state.streak,
      last_active: state.lastActive,
    }),
    headers: { Prefer: 'resolution=merge-duplicates' },
  }, token);
}

export async function pullGamification(
  userId: string,
  token: string,
): Promise<GamificationState | null> {
  if (!isSupabaseConfigured) return null;
  const rows = await supabaseRequest(
    `/gamification?user_id=eq.${userId}&limit=1`,
    {},
    token,
  ) ?? [];
  if (!rows[0]) return null;
  return {
    totalXP:    rows[0].total_xp,
    level:      rows[0].level,
    streak:     rows[0].streak,
    lastActive: rows[0].last_active,
  };
}

// ─── Full sync (bidirectional) ────────────────────────────────────────────────

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}

/**
 * Bidirectional sync:
 * 1. Push all local transactions not in cloud
 * 2. Pull all cloud transactions not in local
 * Returns counts for UI feedback
 */
export async function syncAll(
  localTransactions: Transaction[],
  userId: string,
  token: string,
  lastSyncDate?: string,
): Promise<{ newTransactions: Transaction[]; result: SyncResult }> {
  // Push local → cloud
  await pushTransactions(localTransactions, userId, token);

  // Pull cloud → local
  const cloudTxs = await pullTransactions(userId, token, lastSyncDate);
  const localIds = new Set(localTransactions.map(t => t.id));
  const newFromCloud = cloudTxs.filter(t => !localIds.has(t.id));

  return {
    newTransactions: newFromCloud,
    result: {
      pushed:    localTransactions.length,
      pulled:    newFromCloud.length,
      conflicts: 0,
    },
  };
}
