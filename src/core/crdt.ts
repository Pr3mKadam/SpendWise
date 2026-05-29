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

export interface SharedExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  share_percent: number;
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

export interface SharedGoalContribution {
  id: string;
  goal_id: string;
  member_id: string;
  amount: number;
  date: string;
  note?: string;
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

export interface SharedStorage {
  groups: SharedGroup[];
  members: SharedGroupMember[];
  walletEntries: SharedWalletEntry[];
  expenses: SharedExpense[];
  goals: SharedGoal[];
  deleted_ids: string[]; // Tombstones
}

// LWW Union by ID, with Tombstone filtering
export function mergeSharedStorage(local: SharedStorage, remote: SharedStorage): SharedStorage {
  const mergedDeletedIds = Array.from(new Set([...(local.deleted_ids || []), ...(remote.deleted_ids || [])]));
  const deletedSet = new Set(mergedDeletedIds);

  const unionById = <T extends { id: string }>(a: T[], b: T[]): T[] => {
    const map = new Map<string, T>();
    // Insert local first
    a.forEach(item => map.set(item.id, item));
    // Overwrite with remote (remote wins conflicts in basic LWW)
    b.forEach(item => map.set(item.id, item));
    // Filter out deleted items
    return Array.from(map.values()).filter(item => !deletedSet.has(item.id));
  };

  return {
    groups: unionById(local.groups, remote.groups),
    members: unionById(local.members, remote.members),
    walletEntries: unionById(local.walletEntries, remote.walletEntries),
    expenses: unionById(local.expenses, remote.expenses),
    goals: unionById(local.goals, remote.goals),
    deleted_ids: mergedDeletedIds,
  };
}
