/**
 * sharedWalletsApi.ts
 * All Supabase CRUD operations for the cloud-backed Shared Wallets feature.
 */
import { supabase } from './supabaseClient';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SharedGroup {
  id: string;
  name: string;
  purpose: string;
  created_by: string;
  created_at: string;
}

export interface SharedGroupMember {
  id: string;
  group_id: string;
  user_id: string | null;
  invited_email: string | null;
  display_name: string;
  emoji: string;
  role: 'owner' | 'member';
  status: 'invited' | 'active' | 'left';
  invited_at: string;
  joined_at: string | null;
}

export interface SharedWalletEntry {
  id: string;
  group_id: string;
  member_id: string;
  kind: 'contribution' | 'spend_from_pot' | 'withdrawal';
  amount: number;
  label: string;
  date: string;
  created_at: string;
}

export interface SharedExpense {
  id: string;
  group_id: string;
  paid_by_member_id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  created_at: string;
  splits?: SharedExpenseSplit[];
}

export interface SharedExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  share_percent: number;
}

export interface SharedGoal {
  id: string;
  group_id: string;
  name: string;
  emoji: string;
  target_amount: number;
  target_date: string;
  color: string;
  created_at: string;
  contributions?: SharedGoalContribution[];
}

export interface SharedGoalContribution {
  id: string;
  goal_id: string;
  member_id: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface SharedNotification {
  id: string;
  user_id: string;
  group_id: string | null;
  type: 'invite' | 'member_joined' | 'expense_added' | 'goal_created';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// ─── Groups ────────────────────────────────────────────────────────────────

/** Fetch all groups the current user belongs to (as owner or active member). */
export async function fetchMyGroups(): Promise<SharedGroup[]> {
  const { data, error } = await db()
    .from('shared_groups')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SharedGroup[];
}

/** Create a new group and add the creator as owner. Returns the new group. */
export async function createGroup(
  name: string,
  purpose: string,
  creatorName: string,
  creatorEmoji = '👑',
): Promise<SharedGroup> {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: group, error: gErr } = await client
    .from('shared_groups')
    .insert({ name, purpose, created_by: user.id })
    .select()
    .single();
  if (gErr) throw gErr;

  // Add creator as owner member
  const { error: mErr } = await client.from('shared_group_members').insert({
    group_id: group.id,
    user_id: user.id,
    display_name: creatorName || user.email?.split('@')[0] || 'You',
    emoji: creatorEmoji,
    role: 'owner',
    status: 'active',
    joined_at: new Date().toISOString(),
  });
  if (mErr) throw mErr;

  return group as SharedGroup;
}

/** Delete a group (owner only — RLS enforced in DB). */
export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await db().from('shared_groups').delete().eq('id', groupId);
  if (error) throw error;
}

// ─── Members ───────────────────────────────────────────────────────────────

/** Fetch all members of a group via the SECURITY DEFINER RPC.
 * Direct table queries are restricted by RLS (only shows own row),
 * so we use the RPC which internally verifies membership and returns all rows. */
export async function fetchGroupMembers(groupId: string): Promise<SharedGroupMember[]> {
  const { data, error } = await db()
    .rpc('get_group_members', { p_group_id: groupId });
  if (error) throw error;
  return (data ?? []) as SharedGroupMember[];
}

/**
 * Invite a user to a group by email.
 * Also inserts an in-app notification IF the email matches an existing user.
 */
export async function inviteMember(
  groupId: string,
  email: string,
  displayName: string,
  emoji = '👤',
): Promise<SharedGroupMember> {
  const client = db();

  // Insert the member row with status='invited'
  const { data: member, error } = await client
    .from('shared_group_members')
    .insert({
      group_id: groupId,
      invited_email: email.toLowerCase().trim(),
      display_name: displayName || email.split('@')[0],
      emoji,
      role: 'member',
      status: 'invited',
    })
    .select()
    .single();
  if (error) throw error;

  // Try to find the invited user's auth uid via the profiles table (best-effort)
  try {
    const { data: profile } = await client
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (profile?.id) {
      // Fetch group name for notification
      const { data: group } = await client
        .from('shared_groups')
        .select('name')
        .eq('id', groupId)
        .single();

      await client.from('shared_notifications').insert({
        user_id: profile.id,
        group_id: groupId,
        type: 'invite',
        title: '🎉 You have a group invite!',
        message: `You've been invited to join "${group?.name ?? 'a shared group'}" on SpendWise.`,
        read: false,
      });

      // Update member row with the resolved user_id so RLS works
      await client
        .from('shared_group_members')
        .update({ user_id: profile.id })
        .eq('id', member.id);
    }
  } catch {
    // Non-critical — invitation row still created
  }

  return member as SharedGroupMember;
}

/** Accept a pending group invite via SECURITY DEFINER RPC (bypasses RLS). */
export async function acceptInvite(memberId: string): Promise<void> {
  const { error } = await db().rpc('accept_group_invite', { p_member_id: memberId });
  if (error) throw error;
}

/** Decline a group invite via SECURITY DEFINER RPC (bypasses RLS). */
export async function declineOrLeave(memberId: string): Promise<void> {
  const { error } = await db().rpc('decline_group_invite', { p_member_id: memberId });
  if (error) throw error;
}

/** Remove a member from a group (owner action). */
export async function removeMember(memberId: string): Promise<void> {
  const { error } = await db()
    .from('shared_group_members')
    .delete()
    .eq('id', memberId);
  if (error) throw error;
}

/** Fetch pending invites for the current user via SECURITY DEFINER RPC.
 * Uses JWT email claim directly — avoids 'permission denied for table users'. */
export async function fetchMyPendingInvites(): Promise<(SharedGroupMember & { group: SharedGroup })[]> {
  const { data, error } = await db().rpc('get_my_pending_invites');
  if (error) return [];
  // Map flat RPC result back to the nested shape the hook expects
  return (data ?? []).map((row: any) => ({
    id: row.id,
    group_id: row.group_id,
    user_id: row.user_id,
    display_name: row.display_name,
    emoji: row.emoji,
    role: row.role,
    status: row.status,
    invited_email: row.invited_email,
    invited_at: row.invited_at,
    joined_at: row.joined_at,
    group: {
      id: row.group_id,
      name: row.group_name,
      purpose: row.group_purpose,
      created_by: '',
      created_at: '',
    },
  })) as (SharedGroupMember & { group: SharedGroup })[];
}

// ─── Wallet Entries ────────────────────────────────────────────────────────

/** Fetch wallet entries for a group, most recent first. */
export async function fetchWalletEntries(groupId: string): Promise<SharedWalletEntry[]> {
  const { data, error } = await db()
    .from('shared_wallet_entries')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SharedWalletEntry[];
}

export async function addWalletEntry(payload: {
  groupId: string;
  memberId: string;
  kind: SharedWalletEntry['kind'];
  amount: number;
  label: string;
  date: string;
}): Promise<SharedWalletEntry> {
  const { data, error } = await db()
    .from('shared_wallet_entries')
    .insert({
      group_id: payload.groupId,
      member_id: payload.memberId,
      kind: payload.kind,
      amount: payload.amount,
      label: payload.label,
      date: payload.date,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SharedWalletEntry;
}

export async function deleteWalletEntry(id: string): Promise<void> {
  const { error } = await db().from('shared_wallet_entries').delete().eq('id', id);
  if (error) throw error;
}

// ─── Shared Expenses ───────────────────────────────────────────────────────

export async function fetchExpenses(groupId: string): Promise<SharedExpense[]> {
  const { data, error } = await db()
    .from('shared_expenses')
    .select('*, splits:shared_expense_splits(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SharedExpense[];
}

export async function addSharedExpense(payload: {
  groupId: string;
  paidByMemberId: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  splits: { memberId: string; sharePercent: number }[];
}): Promise<SharedExpense> {
  const client = db();

  const { data: expense, error: eErr } = await client
    .from('shared_expenses')
    .insert({
      group_id: payload.groupId,
      paid_by_member_id: payload.paidByMemberId,
      label: payload.label,
      category: payload.category,
      amount: payload.amount,
      date: payload.date,
    })
    .select()
    .single();
  if (eErr) throw eErr;

  const splitRows = payload.splits.map(s => ({
    expense_id: expense.id,
    member_id: s.memberId,
    share_percent: s.sharePercent,
  }));

  const { error: sErr } = await client.from('shared_expense_splits').insert(splitRows);
  if (sErr) throw sErr;

  return expense as SharedExpense;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await db().from('shared_expenses').delete().eq('id', id);
  if (error) throw error;
}

// ─── Shared Goals ──────────────────────────────────────────────────────────

export async function fetchGoals(groupId: string): Promise<SharedGoal[]> {
  const { data, error } = await db()
    .from('shared_goals')
    .select('*, contributions:shared_goal_contributions(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SharedGoal[];
}

export async function addSharedGoal(payload: {
  groupId: string;
  name: string;
  emoji: string;
  targetAmount: number;
  targetDate: string;
  color: string;
}): Promise<SharedGoal> {
  const { data, error } = await db()
    .from('shared_goals')
    .insert({
      group_id: payload.groupId,
      name: payload.name,
      emoji: payload.emoji,
      target_amount: payload.targetAmount,
      target_date: payload.targetDate,
      color: payload.color,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SharedGoal;
}

export async function contributeToGoal(payload: {
  goalId: string;
  memberId: string;
  amount: number;
  date: string;
  note?: string;
}): Promise<SharedGoalContribution> {
  const { data, error } = await db()
    .from('shared_goal_contributions')
    .insert({
      goal_id: payload.goalId,
      member_id: payload.memberId,
      amount: payload.amount,
      date: payload.date,
      note: payload.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SharedGoalContribution;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await db().from('shared_goals').delete().eq('id', id);
  if (error) throw error;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function fetchMyNotifications(): Promise<SharedNotification[]> {
  const { data, error } = await db()
    .from('shared_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return [];
  return data as SharedNotification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await db().from('shared_notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const client = db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;
  await client.from('shared_notifications').update({ read: true }).eq('user_id', user.id);
}
