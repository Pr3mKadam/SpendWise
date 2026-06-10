import { StateCreator } from 'zustand';
import { AssetEntry, LiabilityEntry } from '@/types';
import { SpendWiseStore } from '@/store/index';
import { formatLocalYYYYMMDD } from '@/utils/date';

export interface PortfolioSlice {
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  livePrices: Record<string, number>;
  lastPriceUpdate: string | null;
  addAsset: (asset: Omit<AssetEntry, 'id' | 'lastUpdated'>) => void;
  updateAsset: (id: string, data: Partial<AssetEntry>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<LiabilityEntry, 'id' | 'lastUpdated'>) => void;
  updateLiability: (id: string, data: Partial<LiabilityEntry>) => void;
  deleteLiability: (id: string) => void;
  setLivePrices: (prices: Record<string, number>) => void;
}

export const createPortfolioSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  PortfolioSlice
> = set => ({
  assets: [],
  liabilities: [],
  livePrices: {},
  lastPriceUpdate: null,
  addAsset: asset =>
    set(state => ({
      assets: [
        ...state.assets,
        { ...asset, id: `a-${Date.now()}`, lastUpdated: formatLocalYYYYMMDD(new Date()) },
      ],
    })),
  updateAsset: (id, data) =>
    set(state => ({
      assets: state.assets.map(a =>
        a.id === id ? { ...a, ...data, lastUpdated: formatLocalYYYYMMDD(new Date()) } : a
      ),
    })),
  deleteAsset: id =>
    set(state => ({
      assets: state.assets.filter(a => a.id !== id),
    })),
  addLiability: liability =>
    set(state => ({
      liabilities: [
        ...state.liabilities,
        { ...liability, id: `l-${Date.now()}`, lastUpdated: formatLocalYYYYMMDD(new Date()) },
      ],
    })),
  updateLiability: (id, data) =>
    set(state => ({
      liabilities: state.liabilities.map(l =>
        l.id === id ? { ...l, ...data, lastUpdated: formatLocalYYYYMMDD(new Date()) } : l
      ),
    })),
  deleteLiability: id =>
    set(state => ({
      liabilities: state.liabilities.filter(l => l.id !== id),
    })),
  setLivePrices: prices => set({ livePrices: prices, lastPriceUpdate: new Date().toISOString() }),
});
