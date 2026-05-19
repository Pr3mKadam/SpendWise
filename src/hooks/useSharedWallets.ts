import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SharedGroup, SharedGroupMember, SharedWalletEntry, 
  SharedExpense, SharedExpenseSplit, SharedGoal, 
  SharedGoalContribution, SharedStorage, mergeSharedStorage 
} from '@/lib/crdt';
import { syncEngine, SyncState } from '@/lib/syncEngine';
import { useStore } from '@/store';

export type { SharedGroup, SharedGroupMember, SharedWalletEntry, SharedExpense, SharedExpenseSplit, SharedGoal, SharedGoalContribution };

export interface PendingInvite {
  memberId: string;
  groupId: string;
  groupName: string;
  groupPurpose: string;
  invitedAt: string;
}

export function useSharedWallets(userId: string | null, userEmail?: string | null) {
  const data = useStore(state => state.sharedData);
  const setData = useStore(state => state.setSharedData);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Sync state
  const [syncState, setSyncState] = useState<SyncState>('disconnected');
  const [connectedPeers, setConnectedPeers] = useState<number>(0);

  // Initialize Sync Engine
  useEffect(() => {
    syncEngine.init();

    syncEngine.onStateChange((state, peers) => {
      setSyncState(state);
      setConnectedPeers(peers);
    });

    syncEngine.onData((incoming) => {
      try {
        const remoteData = typeof incoming === 'string' ? JSON.parse(incoming) : incoming;
        if (remoteData && Array.isArray(remoteData.groups)) {
          setData(prev => {
            const next = mergeSharedStorage(prev, remoteData as SharedStorage);
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to parse incoming sync data", err);
      }
    });

    return () => {
      // Clean up
    };
  }, [setData]);

  // Broadcast full state when a new peer connects
  useEffect(() => {
    if (syncState === 'connected' && connectedPeers > 0) {
      syncEngine.broadcast(data);
    }
  }, [connectedPeers, syncState]); // Only trigger when connection count/state changes

  const groups = data.groups;
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;
  const members = data.members.filter(m => m.group_id === selectedGroupId && !data.deleted_ids.includes(m.id));
  const walletEntries = data.walletEntries.filter(w => w.group_id === selectedGroupId && !data.deleted_ids.includes(w.id));
  const expenses = data.expenses.filter(e => e.group_id === selectedGroupId && !data.deleted_ids.includes(e.id));
  const goals = data.goals.filter(g => g.group_id === selectedGroupId && !data.deleted_ids.includes(g.id));
  
  // Calculate pending invites for the currently logged in user
  const pendingInvites: PendingInvite[] = useMemo(() => {
    if (!userEmail) return [];
    const myInvites = data.members.filter(m => m.invited_email === userEmail && m.status === 'pending' && !data.deleted_ids.includes(m.id));
    return myInvites.map(inv => {
      const g = data.groups.find(x => x.id === inv.group_id);
      if (!g || data.deleted_ids.includes(g.id)) return null;
      return {
        memberId: inv.id,
        groupId: g.id,
        groupName: g.name,
        groupPurpose: g.purpose,
        invitedAt: inv.invited_at
      };
    }).filter(Boolean) as PendingInvite[];
  }, [data.members, data.groups, userEmail, data.deleted_ids]);

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
      syncEngine.broadcast(next); // Broadcast on every mutation!
      return next;
    });
  };

  const markDeleted = (prev: SharedStorage, id: string) => ({
    ...prev,
    deleted_ids: [...prev.deleted_ids, id]
  });

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
    
    // Sync exposed props
    syncState,
    connectedPeers,
    localPeerId: syncEngine.localPeerId,
    connectToPeer: (remoteId: string) => syncEngine.connect(remoteId),

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
      mutate(prev => markDeleted(prev, groupId));
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
      mutate(prev => markDeleted(prev, memberId));
    },
    removeMember: async (memberId: string) => {
      mutate(prev => markDeleted(prev, memberId));
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
      mutate(prev => markDeleted(prev, id));
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
      mutate(prev => markDeleted(prev, id));
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
      mutate(prev => markDeleted(prev, id));
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
        peerId: syncEngine.localPeerId,
        exportedAt: new Date().toISOString()
      };
      
      try {
        return btoa(encodeURIComponent(JSON.stringify(exportData)));
      } catch {
        return btoa(JSON.stringify(exportData));
      }
    },
    importGroup: async (encodedData: string) => {
      try {
        let decoded;
        try {
          decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
        } catch {
          decoded = JSON.parse(atob(encodedData));
        }
        if (decoded.type !== 'spendwise-shared-group') throw new Error('Invalid group data');
        
        mutate(prev => {
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
            deleted_ids: prev.deleted_ids // Preserve existing tombstones
          };
        });
        setSelectedGroupId(decoded.group.id);
        
        // Auto-connect to peer if peerId is present
        if (decoded.peerId) {
          syncEngine.connect(decoded.peerId);
        }
        
        return true;
      } catch (err) {
        console.error('Import failed:', err);
        return false;
      }
    },
    reload: () => {},
  };
}
