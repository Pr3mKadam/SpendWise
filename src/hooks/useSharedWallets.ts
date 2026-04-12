/**
 * useSharedWallets.ts
 * Cloud-backed React hook replacing useSharedHousehold.
 * Manages groups, members, wallet entries, expenses, goals and pending invites —
 * all backed by Supabase with optional realtime subscriptions.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  fetchMyGroups,
  fetchGroupMembers,
  fetchWalletEntries,
  fetchExpenses,
  fetchGoals,
  fetchMyPendingInvites,
  createGroup,
  deleteGroup,
  inviteMember,
  acceptInvite,
  declineOrLeave,
  removeMember,
  addWalletEntry,
  deleteWalletEntry,
  addSharedExpense,
  deleteExpense,
  addSharedGoal,
  contributeToGoal,
  deleteGoal,
  type SharedGroup,
  type SharedGroupMember,
  type SharedWalletEntry,
  type SharedExpense,
  type SharedGoal,
} from '../lib/sharedWalletsApi';

export type { SharedGroup, SharedGroupMember, SharedWalletEntry, SharedExpense, SharedGoal };

export interface PendingInvite {
  memberId: string;
  groupId: string;
  groupName: string;
  groupPurpose: string;
  invitedAt: string;
}

export function useSharedWallets(userId: string | null) {
  const [groups, setGroups]           = useState<SharedGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers]         = useState<SharedGroupMember[]>([]);
  const [walletEntries, setWallet]    = useState<SharedWalletEntry[]>([]);
  const [expenses, setExpenses]       = useState<SharedExpense[]>([]);
  const [goals, setGoals]             = useState<SharedGoal[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;

  // ─── Load groups + pending invites ────────────────────────────────

  const reloadGroups = useCallback(async () => {
    if (!userId || !supabase) return;
    try {
      const [gs, invites] = await Promise.all([
        fetchMyGroups(),
        fetchMyPendingInvites(),
      ]);
      setGroups(gs);
      setPendingInvites(
        invites.map(i => ({
          memberId:     i.id,
          groupId:      i.group_id,
          groupName:    (i as any).group?.name ?? 'Unknown group',
          groupPurpose: (i as any).group?.purpose ?? 'friends',
          invitedAt:    i.invited_at,
        }))
      );
      // Auto-select first group if none selected
      if (gs.length > 0 && !selectedGroupId) {
        setSelectedGroupId(gs[0].id);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load groups');
    }
  }, [userId, selectedGroupId]);

  useEffect(() => {
    reloadGroups();
  }, [userId]);

  // ─── Load group data when selection changes ────────────────────────

  const reloadGroupData = useCallback(async () => {
    if (!selectedGroupId) {
      setMembers([]);
      setWallet([]);
      setExpenses([]);
      setGoals([]);
      return;
    }
    setLoading(true);
    try {
      const [m, w, ex, gs] = await Promise.all([
        fetchGroupMembers(selectedGroupId),
        fetchWalletEntries(selectedGroupId),
        fetchExpenses(selectedGroupId),
        fetchGoals(selectedGroupId),
      ]);
      setMembers(m);
      setWallet(w);
      setExpenses(ex);
      setGoals(gs);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    reloadGroupData();
  }, [reloadGroupData]);

  // ─── Realtime subscription ─────────────────────────────────────────

  useEffect(() => {
    if (!selectedGroupId || !supabase) return;

    // Clean up old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`shared_group_${selectedGroupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_group_members',   filter: `group_id=eq.${selectedGroupId}` }, () => reloadGroupData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_wallet_entries',  filter: `group_id=eq.${selectedGroupId}` }, () => reloadGroupData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_expenses',        filter: `group_id=eq.${selectedGroupId}` }, () => reloadGroupData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_goals',           filter: `group_id=eq.${selectedGroupId}` }, () => reloadGroupData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_goal_contributions' }, () => reloadGroupData())
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [selectedGroupId, reloadGroupData]);

  // ─── Computed values ───────────────────────────────────────────────

  const walletBalance = walletEntries.reduce((sum, e) => {
    return e.kind === 'contribution' ? sum + e.amount : sum - e.amount;
  }, 0);

  const splitBalances: Record<string, number> = {};
  for (const m of members) splitBalances[m.id] = 0;
  for (const ex of expenses) {
    for (const s of (ex.splits ?? [])) {
      const owed = Math.round(ex.amount * (s.share_percent / 100) * 100) / 100;
      splitBalances[s.member_id] = (splitBalances[s.member_id] ?? 0) - owed;
    }
    splitBalances[ex.paid_by_member_id] = (splitBalances[ex.paid_by_member_id] ?? 0) + ex.amount;
  }

  // ─── Actions ───────────────────────────────────────────────────────

  const handleCreateGroup = useCallback(
    async (name: string, purpose: string, creatorName: string, creatorEmoji?: string) => {
      const g = await createGroup(name, purpose, creatorName, creatorEmoji);
      await reloadGroups();
      setSelectedGroupId(g.id);
      return g;
    },
    [reloadGroups],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      await deleteGroup(groupId);
      setSelectedGroupId(null);
      await reloadGroups();
    },
    [reloadGroups],
  );

  const handleInviteMember = useCallback(
    async (email: string, displayName: string, emoji?: string) => {
      if (!selectedGroupId) return;
      await inviteMember(selectedGroupId, email, displayName, emoji);
      await reloadGroupData();
    },
    [selectedGroupId, reloadGroupData],
  );

  const handleAcceptInvite = useCallback(
    async (memberId: string) => {
      await acceptInvite(memberId);
      await Promise.all([reloadGroups(), reloadGroupData()]);
    },
    [reloadGroups, reloadGroupData],
  );

  const handleDeclineInvite = useCallback(
    async (memberId: string) => {
      await declineOrLeave(memberId);
      await reloadGroups();
    },
    [reloadGroups],
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      await removeMember(memberId);
      await reloadGroupData();
    },
    [reloadGroupData],
  );

  const handleAddWalletEntry = useCallback(
    async (payload: { memberId: string; kind: SharedWalletEntry['kind']; amount: number; label: string; date: string }) => {
      if (!selectedGroupId) return;
      await addWalletEntry({ groupId: selectedGroupId, ...payload });
      await reloadGroupData();
    },
    [selectedGroupId, reloadGroupData],
  );

  const handleDeleteWalletEntry = useCallback(
    async (id: string) => {
      await deleteWalletEntry(id);
      await reloadGroupData();
    },
    [reloadGroupData],
  );

  const handleAddExpense = useCallback(
    async (payload: {
      paidByMemberId: string;
      label: string;
      category: string;
      amount: number;
      date: string;
      splits: { memberId: string; sharePercent: number }[];
    }) => {
      if (!selectedGroupId) return;
      await addSharedExpense({ groupId: selectedGroupId, ...payload });
      await reloadGroupData();
    },
    [selectedGroupId, reloadGroupData],
  );

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      await deleteExpense(id);
      await reloadGroupData();
    },
    [reloadGroupData],
  );

  const handleAddGoal = useCallback(
    async (payload: { name: string; emoji: string; targetAmount: number; targetDate: string; color: string }) => {
      if (!selectedGroupId) return;
      await addSharedGoal({ groupId: selectedGroupId, ...payload });
      await reloadGroupData();
    },
    [selectedGroupId, reloadGroupData],
  );

  const handleContributeToGoal = useCallback(
    async (goalId: string, memberId: string, amount: number, date: string, note?: string) => {
      await contributeToGoal({ goalId, memberId, amount, date, note });
      await reloadGroupData();
    },
    [reloadGroupData],
  );

  const handleDeleteGoal = useCallback(
    async (id: string) => {
      await deleteGoal(id);
      await reloadGroupData();
    },
    [reloadGroupData],
  );

  return {
    // State
    groups,
    selectedGroupId,
    selectedGroup,
    members,
    walletEntries,
    expenses,
    goals,
    pendingInvites,
    walletBalance,
    splitBalances,
    loading,
    error,
    // Selection
    setSelectedGroupId,
    // Actions
    createGroup: handleCreateGroup,
    deleteGroup: handleDeleteGroup,
    inviteMember: handleInviteMember,
    acceptInvite: handleAcceptInvite,
    declineInvite: handleDeclineInvite,
    removeMember: handleRemoveMember,
    addWalletEntry: handleAddWalletEntry,
    deleteWalletEntry: handleDeleteWalletEntry,
    addExpense: handleAddExpense,
    deleteExpense: handleDeleteExpense,
    addGoal: handleAddGoal,
    contributeToGoal: handleContributeToGoal,
    deleteGoal: handleDeleteGoal,
    reload: reloadGroupData,
  };
}
