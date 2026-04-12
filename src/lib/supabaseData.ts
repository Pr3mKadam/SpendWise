import type { SpendWiseConfig } from '../components/OnboardingModal';
import type { Category, SavingsGoal, Transaction } from '../types';
import { supabase } from './supabaseClient';

export interface ProfileRow {
  id: string;
  initial_balance: number;
  balance_anchor_net: number;
  currency: string;
  onboarding_complete: boolean;
  budget_limits: Record<string, number>;
  parental_settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ParentChildLink {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  invite_code: string;
  status: 'pending' | 'active' | 'revoked';
  created_at: string;
  accepted_at: string | null;
}

function assertClient() {
  if (!supabase) throw new Error('Supabase is not configured');
}

export function profileRowToConfig(p: ProfileRow): SpendWiseConfig {
  return {
    initialBalance:     Number(p.initial_balance),
    balanceAnchorNet:   Number(p.balance_anchor_net),
    currency:           p.currency as SpendWiseConfig['currency'],
    onboardingComplete: p.onboarding_complete,
    createdAt:          p.created_at,
  };
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  assertClient();
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export async function saveProfileFromConfig(userId: string, cfg: SpendWiseConfig): Promise<void> {
  assertClient();
  const { error } = await supabase!.from('profiles').upsert(
    {
      id:                  userId,
      initial_balance:     cfg.initialBalance,
      balance_anchor_net:  cfg.balanceAnchorNet ?? 0,
      currency:            cfg.currency,
      onboarding_complete: cfg.onboardingComplete,
      updated_at:          new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function saveBudgetLimits(userId: string, limits: Partial<Record<Category, number>>): Promise<void> {
  assertClient();
  const { error } = await supabase!.from('profiles').update({
    budget_limits: limits as Record<string, number>,
    updated_at:    new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw error;
}

export async function fetchBudgetLimits(userId: string): Promise<Partial<Record<Category, number>> | null> {
  assertClient();
  const { data, error } = await supabase!
    .from('profiles')
    .select('budget_limits')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.budget_limits) return null;
  return data.budget_limits as Partial<Record<Category, number>>;
}

function rowToTransaction(r: {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  type: 'credit' | 'debit';
  description: string | null;
  confidence: number | null;
  ai_parsed: boolean | null;
  status: string | null;
}): Transaction {
  return {
    id:          r.id,
    date:        r.date,
    amount:      Number(r.amount),
    category:    r.category as Category,
    merchant:    r.merchant,
    type:        r.type,
    description: r.description ?? undefined,
    isNew:       false,
    confidence:  r.confidence ?? undefined,
    aiParsed:    r.ai_parsed ?? undefined,
    status:      (r.status as Transaction['status']) ?? 'completed',
  };
}

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  assertClient();
  const { data, error } = await supabase!
    .from('transactions')
    .select('id, date, amount, category, merchant, type, description, confidence, ai_parsed, status')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToTransaction);
}

function txToInsert(userId: string, tx: Transaction) {
  return {
    id:          tx.id,
    user_id:     userId,
    date:        tx.date,
    amount:      tx.amount,
    category:    tx.category,
    merchant:    tx.merchant,
    type:        tx.type,
    description: tx.description ?? null,
    confidence:  tx.confidence ?? null,
    ai_parsed:   tx.aiParsed ?? false,
    status:      tx.status ?? 'completed',
  };
}

export async function insertTransactionRemote(userId: string, tx: Transaction): Promise<void> {
  assertClient();
  const { error } = await supabase!.from('transactions').upsert(txToInsert(userId, tx), { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteTransactionRemote(userId: string, txId: string): Promise<void> {
  assertClient();
  const { error } = await supabase!.from('transactions').delete().eq('user_id', userId).eq('id', txId);
  if (error) throw error;
}

export async function resetUserCloudData(userId: string): Promise<void> {
  assertClient();
  await supabase!.from('transactions').delete().eq('user_id', userId);
  await supabase!.from('savings_goals').delete().eq('user_id', userId);
  const { error } = await supabase!.from('profiles').update({
    initial_balance:     0,
    balance_anchor_net:  0,
    budget_limits:       {},
    updated_at:          new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw error;
}

function rowToGoal(r: {
  id: string;
  name: string;
  emoji: string;
  target_amount: number;
  saved_amount: number;
  target_date: string;
  monthly_contribution: number;
  status: string;
  color: string;
  created_at: string;
}): SavingsGoal {
  return {
    id:                  r.id,
    name:                r.name,
    emoji:               r.emoji,
    targetAmount:        Number(r.target_amount),
    savedAmount:         Number(r.saved_amount),
    targetDate:          r.target_date,
    monthlyContribution: Number(r.monthly_contribution),
    status:              r.status as SavingsGoal['status'],
    color:               r.color,
    createdAt:           r.created_at,
  };
}

export async function fetchGoals(userId: string): Promise<SavingsGoal[]> {
  assertClient();
  const { data, error } = await supabase!
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToGoal);
}

export async function upsertGoalRemote(userId: string, g: SavingsGoal): Promise<void> {
  assertClient();
  const { error } = await supabase!.from('savings_goals').upsert({
    id:                   g.id,
    user_id:              userId,
    name:                 g.name,
    emoji:                g.emoji,
    target_amount:        g.targetAmount,
    saved_amount:         g.savedAmount,
    target_date:          g.targetDate,
    monthly_contribution: g.monthlyContribution,
    status:               g.status,
    color:                g.color,
    created_at:           g.createdAt,
  }, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteGoalRemote(userId: string, goalId: string): Promise<void> {
  assertClient();
  const { error } = await supabase!.from('savings_goals').delete().eq('user_id', userId).eq('id', goalId);
  if (error) throw error;
}

// ── Parental Settings Cloud Sync ────────────────────────────────────────────

export async function fetchParentalSettings(userId: string): Promise<Record<string, unknown> | null> {
  assertClient();
  const { data, error } = await supabase!
    .from('profiles')
    .select('parental_settings')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.parental_settings ?? null;
}

export async function saveParentalSettings(userId: string, settings: Record<string, unknown>): Promise<void> {
  assertClient();
  const { error } = await supabase!
    .from('profiles')
    .update({ parental_settings: settings, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function clearParentalSettings(userId: string): Promise<void> {
  assertClient();
  const { error } = await supabase!
    .from('profiles')
    .update({ parental_settings: null, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

// ── Parent-Child Link Management ────────────────────────────────────────────

export async function createParentChildInvite(parentUserId: string): Promise<string> {
  assertClient();
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const { error } = await supabase!
    .from('parent_child_links')
    .insert({ parent_user_id: parentUserId, invite_code: code, status: 'pending' });
  if (error) throw error;
  return code;
}

export async function acceptParentInvite(childUserId: string, code: string): Promise<boolean> {
  assertClient();
  const { data, error } = await supabase!
    .from('parent_child_links')
    .update({ child_user_id: childUserId, status: 'active', accepted_at: new Date().toISOString() })
    .eq('invite_code', code)
    .eq('status', 'pending')
    .select()
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function fetchChildLinks(parentUserId: string): Promise<ParentChildLink[]> {
  assertClient();
  const { data, error } = await supabase!
    .from('parent_child_links')
    .select('*')
    .eq('parent_user_id', parentUserId)
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []) as ParentChildLink[];
}

export async function fetchParentLinks(childUserId: string): Promise<ParentChildLink[]> {
  assertClient();
  const { data, error } = await supabase!
    .from('parent_child_links')
    .select('*')
    .eq('child_user_id', childUserId)
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []) as ParentChildLink[];
}

// ── Pending Transaction Approval ────────────────────────────────────────────

export async function approveTransaction(userId: string, txId: string): Promise<void> {
  assertClient();
  const { error } = await supabase!
    .from('transactions')
    .update({ status: 'completed' })
    .eq('user_id', userId)
    .eq('id', txId);
  if (error) throw error;
}

export async function rejectTransaction(userId: string, txId: string): Promise<void> {
  await deleteTransactionRemote(userId, txId);
}
