import { StateCreator } from 'zustand';
import { AssetEntry, LiabilityEntry } from '@/types';
import { SpendWiseStore } from '@/store/index';

export interface PortfolioSlice {
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  addAsset: (asset: Omit<AssetEntry, 'id' | 'lastUpdated'>) => void;
  updateAsset: (id: string, data: Partial<AssetEntry>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<LiabilityEntry, 'id' | 'lastUpdated'>) => void;
  updateLiability: (id: string, data: Partial<LiabilityEntry>) => void;
  deleteLiability: (id: string) => void;
}

export const createPortfolioSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], PortfolioSlice> = (set) => ({
  assets: [],
  liabilities: [],
  addAsset: (asset) => set((state) => ({ 
    assets: [...state.assets, { ...asset, id: `a-${Date.now()}`, lastUpdated: new Date().toISOString().split('T')[0] }] 
  })),
  updateAsset: (id, data) => set((state) => ({ 
    assets: state.assets.map(a => a.id === id ? { ...a, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : a) 
  })),
  deleteAsset: (id) => set((state) => ({ 
    assets: state.assets.filter(a => a.id !== id) 
  })),
  addLiability: (liability) => set((state) => ({ 
    liabilities: [...state.liabilities, { ...liability, id: `l-${Date.now()}`, lastUpdated: new Date().toISOString().split('T')[0] }] 
  })),
  updateLiability: (id, data) => set((state) => ({ 
    liabilities: state.liabilities.map(l => l.id === id ? { ...l, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : l) 
  })),
  deleteLiability: (id) => set((state) => ({ 
    liabilities: state.liabilities.filter(l => l.id !== id) 
  })),
});
