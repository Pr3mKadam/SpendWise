import { useState, useEffect, useCallback, useMemo } from 'react';

export interface SharedGroup {
  id: string;
  name: string;
  purpose: string;
  created_by: string;
}

export interface SharedGroupMember {
  id: string;
  group_id: string;
  user_id?: string;
  invited_email?: string;
  display_name: string;
  emoji: string;
  role: string;
  status: string;
  invited_at: string;
  joined_at?: string;
}

export interface SharedWalletEntry {
  id: string;
  group_id: string;
  member_id: string;
  kind: 'contribution' | 'spend_from_pot' | 'withdrawal';
  amount: number;
  label: string;
  date: string;
}

export interface SharedExpense {
  id: string;
  group_id: string;
  paid_by_member_id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
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
  contributions?: SharedGoalContribution[];
}

export interface SharedGoalContribution {
  id: string;
  goal_id: string;
  member_id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface PendingInvite {
  memberId: string;
  groupId: string;
  groupName: string;
  groupPurpose: string;
  invitedAt: string;
}

const STORAGE_KEY = 'spendwise_shared_wallets_v1';

interface SharedStorage {
  groups: SharedGroup[];
  members: SharedGroupMember[];
  walletEntries: SharedWalletEntry[];
  expenses: SharedExpense[];
  goals: SharedGoal[];
}

function loadStorage(): SharedStorage {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return {
    groups: [],
    members: [],
    walletEntries: [],
    expenses: [],
    goals: [],
  };
}

function saveStorage(s: SharedStorage) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function useSharedWallets(userId: string | null) {
  const [data, setData] = useState<SharedStorage>(loadStorage);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = data.groups;
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;
  const members = data.members.filter(m => m.group_id === selectedGroupId);
  const walletEntries = data.walletEntries.filter(w => w.group_id === selectedGroupId);
  const expenses = data.expenses.filter(e => e.group_id === selectedGroupId);
  const goals = data.goals.filter(g => g.group_id === selectedGroupId);
  const pendingInvites: PendingInvite[] = [];

  const loading = false;

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

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

  const mutate = (updater: (prev: SharedStorage) => SharedStorage) => {
    setData(prev => {
      const next = updater(prev);
      saveStorage(next);
      return next;
    });
  };

  return {
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
    setSelectedGroupId,
    createGroup: async (name: string, purpose: string, creatorName: string, creatorEmoji: string = '👑') => {
      if (!userId) return;
      const groupId = Math.random().toString(36).substr(2, 9);
      const memberId = Math.random().toString(36).substr(2, 9);
      
      mutate(prev => ({
        ...prev,
        groups: [...prev.groups, { id: groupId, name, purpose, created_by: userId }],
        members: [...prev.members, {
          id: memberId,
          group_id: groupId,
          user_id: userId,
          display_name: creatorName,
          emoji: creatorEmoji,
          role: 'admin',
          status: 'accepted',
          invited_at: new Date().toISOString(),
          joined_at: new Date().toISOString()
        }]
      }));
      setSelectedGroupId(groupId);
    },
    deleteGroup: async (groupId: string) => {
      mutate(prev => ({
        ...prev,
        groups: prev.groups.filter(g => g.id !== groupId),
        members: prev.members.filter(m => m.group_id !== groupId),
        walletEntries: prev.walletEntries.filter(w => w.group_id !== groupId),
        expenses: prev.expenses.filter(e => e.group_id !== groupId),
        goals: prev.goals.filter(g => g.group_id !== groupId),
      }));
      setSelectedGroupId(null);
    },
    inviteMember: async (email: string, displayName: string, emoji: string = '👤') => {
      if (!selectedGroupId) return;
      mutate(prev => ({
        ...prev,
        members: [...prev.members, {
          id: Math.random().toString(36).substr(2, 9),
          group_id: selectedGroupId,
          invited_email: email,
          display_name: displayName,
          emoji,
          role: 'member',
          status: 'pending',
          invited_at: new Date().toISOString()
        }]
      }));
    },
    acceptInvite: async (memberId: string) => {
      mutate(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === memberId ? { ...m, status: 'accepted', joined_at: new Date().toISOString() } : m)
      }));
    },
    declineInvite: async (memberId: string) => {
      mutate(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));
    },
    removeMember: async (memberId: string) => {
      mutate(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));
    },
    addWalletEntry: async (payload: { memberId: string; kind: SharedWalletEntry['kind']; amount: number; label: string; date: string }) => {
      if (!selectedGroupId) return;
      mutate(prev => ({
        ...prev,
        walletEntries: [...prev.walletEntries, {
          id: Math.random().toString(36).substr(2, 9),
          group_id: selectedGroupId,
          member_id: payload.memberId,
          kind: payload.kind,
          amount: payload.amount,
          label: payload.label,
          date: payload.date
        }]
      }));
    },
    deleteWalletEntry: async (id: string) => {
      mutate(prev => ({
        ...prev,
        walletEntries: prev.walletEntries.filter(w => w.id !== id)
      }));
    },
    addExpense: async (payload: {
      paidByMemberId: string;
      label: string;
      category: string;
      amount: number;
      date: string;
      splits: { memberId: string; sharePercent: number }[];
    }) => {
      if (!selectedGroupId) return;
      const expenseId = Math.random().toString(36).substr(2, 9);
      mutate(prev => ({
        ...prev,
        expenses: [...prev.expenses, {
          id: expenseId,
          group_id: selectedGroupId,
          paid_by_member_id: payload.paidByMemberId,
          label: payload.label,
          category: payload.category,
          amount: payload.amount,
          date: payload.date,
          splits: payload.splits.map(s => ({
            id: Math.random().toString(36).substr(2, 9),
            expense_id: expenseId,
            member_id: s.memberId,
            share_percent: s.sharePercent
          }))
        }]
      }));
    },
    deleteExpense: async (id: string) => {
      mutate(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));
    },
    addGoal: async (payload: { name: string; emoji: string; targetAmount: number; targetDate: string; color: string }) => {
      if (!selectedGroupId) return;
      mutate(prev => ({
        ...prev,
        goals: [...prev.goals, {
          id: Math.random().toString(36).substr(2, 9),
          group_id: selectedGroupId,
          name: payload.name,
          emoji: payload.emoji,
          target_amount: payload.targetAmount,
          target_date: payload.targetDate,
          color: payload.color,
          contributions: []
        }]
      }));
    },
    contributeToGoal: async (goalId: string, memberId: string, amount: number, date: string, note?: string) => {
      mutate(prev => ({
        ...prev,
        goals: prev.goals.map(g => {
          if (g.id !== goalId) return g;
          return {
            ...g,
            contributions: [...(g.contributions || []), {
              id: Math.random().toString(36).substr(2, 9),
              goal_id: goalId,
              member_id: memberId,
              amount,
              date,
              note
            }]
          };
        })
      }));
    },
    deleteGoal: async (id: string) => {
      mutate(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id)
      }));
    },
    exportGroup: (groupId: string) => {
      const g = data.groups.find(x => x.id === groupId);
      if (!g) return null;
      const groupMembers = data.members.filter(m => m.group_id === groupId);
      const groupWallet = data.walletEntries.filter(w => w.group_id === groupId);
      const groupExpenses = data.expenses.filter(e => e.group_id === groupId);
      const groupGoals = data.goals.filter(goal => goal.group_id === groupId);
      
      const exportData = {
        type: 'spendwise-shared-group',
        group: g,
        members: groupMembers,
        walletEntries: groupWallet,
        expenses: groupExpenses,
        goals: groupGoals,
        exportedAt: new Date().toISOString()
      };
      
      return btoa(JSON.stringify(exportData));
    },
    importGroup: async (encodedData: string) => {
      try {
        const decoded = JSON.parse(atob(encodedData));
        if (decoded.type !== 'spendwise-shared-group') throw new Error('Invalid group data');
        
        mutate(prev => {
          // Avoid duplicates
          const otherGroups = prev.groups.filter(g => g.id !== decoded.group.id);
          const otherMembers = prev.members.filter(m => m.group_id !== decoded.group.id);
          const otherWallet = prev.walletEntries.filter(w => w.group_id !== decoded.group.id);
          const otherExpenses = prev.expenses.filter(e => e.group_id !== decoded.group.id);
          const otherGoals = prev.goals.filter(g => g.group_id !== decoded.group.id);
          
          return {
            groups: [...otherGroups, decoded.group],
            members: [...otherMembers, ...decoded.members],
            walletEntries: [...otherWallet, ...decoded.walletEntries],
            expenses: [...otherExpenses, ...decoded.expenses],
            goals: [...otherGoals, ...decoded.goals],
          };
        });
        setSelectedGroupId(decoded.group.id);
        return true;
      } catch (err) {
        console.error('Import failed:', err);
        return false;
      }
    },
    reload: () => {},
  };
}
