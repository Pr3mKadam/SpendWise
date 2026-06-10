import Dexie, { Table } from 'dexie';
import {
  Transaction,
  CustomCategoryDef,
  Budget,
  SavingsGoal,
  SharedWalletEntry,
  SharedExpense,
  HouseholdSettings,
  AssetEntry,
  LiabilityEntry,
} from '@/types';

export interface AppConfig {
  id: string; // usually 'app-config'
  theme: 'dark' | 'light';
  onboardingCompleted: boolean;
  currency: string;
}

export class SpendWiseDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  customCategories!: Table<CustomCategoryDef, string>;
  budgets!: Table<Budget, string>;
  goals!: Table<SavingsGoal, string>;
  sharedWalletEntries!: Table<SharedWalletEntry, string>;
  sharedExpenses!: Table<SharedExpense, string>;
  householdSettings!: Table<HouseholdSettings, string>; // Since id is optional in HouseholdSettings, we might use a fixed key
  assets!: Table<AssetEntry, string>;
  liabilities!: Table<LiabilityEntry, string>;
  config!: Table<AppConfig, string>;
  keyval!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('SpendWiseDatabase');

    // Define tables and indexes
    // Note: only index fields you want to query by.
    // '&id' means it's a primary key and unique.
    this.version(1).stores({
      transactions: 'id, date, category, type, isRecurring',
      customCategories: 'id, name',
      budgets: 'category', // category string is unique enough for budget (since it maps to Category type)
      goals: 'id, status, targetDate',
      sharedWalletEntries: 'id, date, memberId',
      sharedExpenses: 'id, date, paidByMemberId',
      householdSettings: 'name', // or some fixed id
      assets: 'id, type',
      liabilities: 'id, type',
      config: 'id',
      keyval: 'key',
    });
  }
}

export const db = new SpendWiseDatabase();
export { writeAuditLog } from './audit';
