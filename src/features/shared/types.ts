export type HouseholdPurpose = 'roommates' | 'friends' | 'family' | 'other';

export interface HouseholdMember {
  id: string;
  name: string;
  emoji: string;
  relation?: string;
}

export interface HouseholdSettings {
  name: string;
  purpose: HouseholdPurpose;
  members: HouseholdMember[];
}

export type SharedWalletEntryKind = 'contribution' | 'spend_from_pot' | 'withdrawal';

export interface SharedWalletEntry {
  id: string;
  date: string;
  kind: SharedWalletEntryKind;
  amount: number;
  memberId: string;
  label: string;
  createdAt: string;
}

export interface SharedExpenseSplit {
  memberId: string;
  sharePercent: number;
}

export interface SharedExpense {
  id: string;
  date: string;
  label: string;
  category: string;
  amount: number;
  paidByMemberId: string;
  splits: SharedExpenseSplit[];
  createdAt: string;
}

export interface SharedGoalContribution {
  id: string;
  date: string;
  memberId: string;
  amount: number;
  note?: string;
}

export interface SharedSavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  targetDate: string;
  color: string;
  memberIds: string[];
  contributions: SharedGoalContribution[];
  createdAt: string;
}
