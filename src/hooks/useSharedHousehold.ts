import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  HouseholdMember,
  HouseholdSettings,
  SharedWalletEntry,
  SharedWalletEntryKind,
  SharedExpense,
  SharedExpenseSplit,
  SharedSavingsGoal,
  SharedGoalContribution,
  HouseholdPurpose,
} from '../types';

const STORAGE_KEY = 'spendwise_shared_household_v1';

interface Persisted {
  v: 1;
  settings: HouseholdSettings | null;
  wallet:   SharedWalletEntry[];
  expenses: SharedExpense[];
  goals:    SharedSavingsGoal[];
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { v: 1, settings: null, wallet: [], expenses: [], goals: [] };
    const p = JSON.parse(raw) as Persisted;
    if (p.v !== 1 || !Array.isArray(p.wallet)) {
      return { v: 1, settings: null, wallet: [], expenses: [], goals: [] };
    }
    return {
      v:        1,
      settings: p.settings ?? null,
      wallet:   p.wallet ?? [],
      expenses: p.expenses ?? [],
      goals:    p.goals ?? [],
    };
  } catch {
    return { v: 1, settings: null, wallet: [], expenses: [], goals: [] };
  }
}

function save(p: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

/** Net balance from split expenses: positive = others owe this member overall */
export function computeSplitBalances(
  members: HouseholdMember[],
  expenses: SharedExpense[],
): Record<string, number> {
  const bal: Record<string, number> = {};
  for (const m of members) bal[m.id] = 0;
  for (const e of expenses) {
    for (const s of e.splits) {
      const owed = Math.round(e.amount * (s.sharePercent / 100) * 100) / 100;
      bal[s.memberId] = (bal[s.memberId] ?? 0) - owed;
    }
    bal[e.paidByMemberId] = (bal[e.paidByMemberId] ?? 0) + e.amount;
  }
  return bal;
}

export function equalSplits(memberIds: string[]): SharedExpenseSplit[] {
  if (memberIds.length === 0) return [];
  const p = Math.floor((100 / memberIds.length) * 100) / 100;
  const splits: SharedExpenseSplit[] = memberIds.map((id, i) => ({
    memberId:     id,
    sharePercent: i === memberIds.length - 1 ? Math.round((100 - p * (memberIds.length - 1)) * 100) / 100 : p,
  }));
  return splits;
}

export function useSharedHousehold() {
  const [settings, setSettings]     = useState<HouseholdSettings | null>(null);
  const [wallet, setWallet]         = useState<SharedWalletEntry[]>([]);
  const [expenses, setExpenses]     = useState<SharedExpense[]>([]);
  const [goals, setGoals]           = useState<SharedSavingsGoal[]>([]);
  const [hydrated, setHydrated]     = useState(false);

  useEffect(() => {
    const p = load();
    setSettings(p.settings);
    setWallet(p.wallet);
    setExpenses(p.expenses);
    setGoals(p.goals);
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (next: Partial<{ settings: HouseholdSettings | null; wallet: SharedWalletEntry[]; expenses: SharedExpense[]; goals: SharedSavingsGoal[] }>) => {
      const p: Persisted = {
        v: 1,
        settings: next.settings !== undefined ? next.settings : settings,
        wallet:   next.wallet !== undefined ? next.wallet : wallet,
        expenses: next.expenses !== undefined ? next.expenses : expenses,
        goals:    next.goals !== undefined ? next.goals : goals,
      };
      save(p);
    },
    [settings, wallet, expenses, goals],
  );

  const createHousehold = useCallback(
    (name: string, purpose: HouseholdPurpose, members: Omit<HouseholdMember, 'id'>[]) => {
      const withIds: HouseholdMember[] = members
        .map(m => ({
          id:       uid('m'),
          name:     m.name.trim(),
          emoji:    m.emoji || '👤',
          relation: m.relation?.trim() || undefined,
        }))
        .filter(m => m.name.length > 0);
      if (withIds.length === 0) return;
      const s: HouseholdSettings = { name: name.trim() || 'Our group', purpose, members: withIds };
      setSettings(s);
      persist({ settings: s });
    },
    [persist],
  );

  const updateHouseholdMeta = useCallback(
    (name: string, purpose: HouseholdPurpose) => {
      if (!settings) return;
      const s = { ...settings, name: name.trim() || settings.name, purpose };
      setSettings(s);
      persist({ settings: s });
    },
    [settings, persist],
  );

  const addMember = useCallback(
    (m: Omit<HouseholdMember, 'id'>) => {
      if (!settings) return;
      const member: HouseholdMember = {
        id: uid('m'),
        name: m.name.trim(),
        emoji: m.emoji || '👤',
        relation: m.relation?.trim(),
      };
      if (!member.name) return;
      const s = { ...settings, members: [...settings.members, member] };
      setSettings(s);
      persist({ settings: s });
    },
    [settings, persist],
  );

  const removeMember = useCallback(
    (memberId: string) => {
      if (!settings) return;
      const s = { ...settings, members: settings.members.filter(x => x.id !== memberId) };
      const newGoals = goals.map(g => ({
        ...g,
        memberIds: g.memberIds.filter(id => id !== memberId),
      }));
      setSettings(s);
      setGoals(newGoals);
      persist({ settings: s, goals: newGoals });
    },
    [settings, goals, persist],
  );

  const disbandHousehold = useCallback(() => {
    setSettings(null);
    setWallet([]);
    setExpenses([]);
    setGoals([]);
    persist({ settings: null, wallet: [], expenses: [], goals: [] });
  }, [persist]);

  const addWalletEntry = useCallback(
    (kind: SharedWalletEntryKind, amount: number, memberId: string, label: string, date: string) => {
      if (!Number.isFinite(amount) || amount <= 0) return;
      const entry: SharedWalletEntry = {
        id: uid('w'),
        date,
        kind,
        amount,
        memberId,
        label: label.trim() || (kind === 'contribution' ? 'Contribution' : kind === 'spend_from_pot' ? 'Shared purchase' : 'Withdrawal'),
        createdAt: new Date().toISOString(),
      };
      const w = [entry, ...wallet];
      setWallet(w);
      persist({ wallet: w });
    },
    [wallet, persist],
  );

  const deleteWalletEntry = useCallback(
    (id: string) => {
      const w = wallet.filter(x => x.id !== id);
      setWallet(w);
      persist({ wallet: w });
    },
    [wallet, persist],
  );

  const addSharedExpense = useCallback(
    (payload: {
      date: string;
      label: string;
      category: string;
      amount: number;
      paidByMemberId: string;
      splits: SharedExpenseSplit[];
    }) => {
      const sum = payload.splits.reduce((a, s) => a + s.sharePercent, 0);
      if (Math.abs(sum - 100) > 0.02) return false;
      const e: SharedExpense = {
        id: uid('e'),
        date: payload.date,
        label: payload.label.trim() || 'Expense',
        category: payload.category.trim() || 'General',
        amount: Math.round(payload.amount * 100) / 100,
        paidByMemberId: payload.paidByMemberId,
        splits: payload.splits,
        createdAt: new Date().toISOString(),
      };
      const ex = [e, ...expenses];
      setExpenses(ex);
      persist({ expenses: ex });
      return true;
    },
    [expenses, persist],
  );

  const deleteSharedExpense = useCallback(
    (id: string) => {
      const ex = expenses.filter(x => x.id !== id);
      setExpenses(ex);
      persist({ expenses: ex });
    },
    [expenses, persist],
  );

  const addSharedGoal = useCallback(
    (payload: {
      name: string;
      emoji: string;
      targetAmount: number;
      targetDate: string;
      color: string;
      memberIds: string[];
    }) => {
      const g: SharedSavingsGoal = {
        id: uid('g'),
        name: payload.name.trim() || 'Group goal',
        emoji: payload.emoji || '🎯',
        targetAmount: Math.round(payload.targetAmount * 100) / 100,
        targetDate: payload.targetDate,
        color: payload.color,
        memberIds: [...payload.memberIds],
        contributions: [],
        createdAt: new Date().toISOString(),
      };
      const gs = [g, ...goals];
      setGoals(gs);
      persist({ goals: gs });
    },
    [goals, persist],
  );

  const contributeToGoal = useCallback(
    (goalId: string, memberId: string, amount: number, date: string, note?: string) => {
      if (!Number.isFinite(amount) || amount <= 0) return;
      const c: SharedGoalContribution = {
        id: uid('c'),
        date,
        memberId,
        amount: Math.round(amount * 100) / 100,
        note: note?.trim() || undefined,
      };
      const gs = goals.map(g =>
        g.id === goalId ? { ...g, contributions: [c, ...g.contributions] } : g,
      );
      setGoals(gs);
      persist({ goals: gs });
    },
    [goals, persist],
  );

  const deleteSharedGoal = useCallback(
    (id: string) => {
      const gs = goals.filter(x => x.id !== id);
      setGoals(gs);
      persist({ goals: gs });
    },
    [goals, persist],
  );

  const walletBalance = useMemo(() => {
    let bal = 0;
    for (const w of wallet) {
      if (w.kind === 'contribution') bal += w.amount;
      else bal -= w.amount;
    }
    return Math.round(bal * 100) / 100;
  }, [wallet]);

  const splitBalances = useMemo(() => {
    if (!settings?.members.length) return {};
    return computeSplitBalances(settings.members, expenses);
  }, [settings, expenses]);

  return {
    hydrated,
    settings,
    wallet,
    expenses,
    goals,
    walletBalance,
    splitBalances,
    createHousehold,
    updateHouseholdMeta,
    addMember,
    removeMember,
    disbandHousehold,
    addWalletEntry,
    deleteWalletEntry,
    addSharedExpense,
    deleteSharedExpense,
    addSharedGoal,
    contributeToGoal,
    deleteSharedGoal,
  };
}
