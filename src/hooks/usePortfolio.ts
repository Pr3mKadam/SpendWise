import { useState, useCallback } from 'react';
import { AssetEntry, AssetType, LiabilityEntry, LiabilityType } from '../types';

const ASSETS_KEY = 'spendwise_assets_v1';
const LIABILITIES_KEY = 'spendwise_liabilities_v1';

const DEMO_ASSETS: AssetEntry[] = [
  { id: 'a1', name: 'HDFC Savings',   type: 'bank',       balance: 85000,  icon: '🏦', color: '#14b8a6', lastUpdated: new Date().toISOString().split('T')[0] },
  { id: 'a2', name: 'Zerodha Stocks', type: 'investment', balance: 210000, icon: '📈', color: '#6366f1', lastUpdated: new Date().toISOString().split('T')[0] },
  { id: 'a3', name: 'Bitcoin',        type: 'crypto',     balance: 45000,  icon: '₿',  color: '#f59e0b', lastUpdated: new Date().toISOString().split('T')[0] },
];
const DEMO_LIABILITIES: LiabilityEntry[] = [
  { id: 'l1', name: 'Personal Loan', type: 'loan',        balance: 50000, icon: '📋', lastUpdated: new Date().toISOString().split('T')[0] },
  { id: 'l2', name: 'Credit Card',   type: 'credit_card', balance: 12000, icon: '💳', lastUpdated: new Date().toISOString().split('T')[0] },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

export function usePortfolio() {
  const [assets, setAssets] = useState<AssetEntry[]>(() =>
    loadFromStorage<AssetEntry[]>(ASSETS_KEY, DEMO_ASSETS)
  );
  const [liabilities, setLiabilities] = useState<LiabilityEntry[]>(() =>
    loadFromStorage<LiabilityEntry[]>(LIABILITIES_KEY, DEMO_LIABILITIES)
  );

  const save = useCallback((newAssets: AssetEntry[], newLiabilities: LiabilityEntry[]) => {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(newAssets));
    localStorage.setItem(LIABILITIES_KEY, JSON.stringify(newLiabilities));
  }, []);

  // ── Assets ──────────────────────────────────────────────────────────────────
  const addAsset = useCallback((data: Omit<AssetEntry, 'id' | 'lastUpdated'>) => {
    const entry: AssetEntry = { ...data, id: `a-${Date.now()}`, lastUpdated: new Date().toISOString().split('T')[0] };
    setAssets(prev => {
      const next = [...prev, entry];
      save(next, liabilities);
      return next;
    });
  }, [liabilities, save]);

  const updateAsset = useCallback((id: string, data: Partial<AssetEntry>) => {
    setAssets(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : a);
      save(next, liabilities);
      return next;
    });
  }, [liabilities, save]);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => {
      const next = prev.filter(a => a.id !== id);
      save(next, liabilities);
      return next;
    });
  }, [liabilities, save]);

  // ── Liabilities ──────────────────────────────────────────────────────────────
  const addLiability = useCallback((data: Omit<LiabilityEntry, 'id' | 'lastUpdated'>) => {
    const entry: LiabilityEntry = { ...data, id: `l-${Date.now()}`, lastUpdated: new Date().toISOString().split('T')[0] };
    setLiabilities(prev => {
      const next = [...prev, entry];
      save(assets, next);
      return next;
    });
  }, [assets, save]);

  const updateLiability = useCallback((id: string, data: Partial<LiabilityEntry>) => {
    setLiabilities(prev => {
      const next = prev.map(l => l.id === id ? { ...l, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : l);
      save(assets, next);
      return next;
    });
  }, [assets, save]);

  const deleteLiability = useCallback((id: string) => {
    setLiabilities(prev => {
      const next = prev.filter(l => l.id !== id);
      save(assets, next);
      return next;
    });
  }, [assets, save]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Allocation by type
  const allocationByType = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + a.balance;
      return acc;
    }, {} as Record<AssetType, number>)
  ).map(([type, value]) => ({ type: type as AssetType, value, pct: totalAssets > 0 ? (value / totalAssets) * 100 : 0 }));

  return {
    assets, liabilities,
    totalAssets, totalLiabilities, netWorth,
    allocationByType,
    addAsset, updateAsset, deleteAsset,
    addLiability, updateLiability, deleteLiability,
  };
}
