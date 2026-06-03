import { AssetType } from '@/types';
import { useStore } from '@/store';

export function usePortfolio() {
  const assets = useStore(state => state.assets);
  const liabilities = useStore(state => state.liabilities);
  const addAsset = useStore(state => state.addAsset);
  const deleteAsset = useStore(state => state.deleteAsset);
  const addLiability = useStore(state => state.addLiability);
  const deleteLiability = useStore(state => state.deleteLiability);

  const updateAsset = useStore(state => state.updateAsset);
  const updateLiability = useStore(state => state.updateLiability);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Allocation by type
  const allocationByType = Object.entries(
    assets.reduce(
      (acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + a.balance;
        return acc;
      },
      {} as Record<AssetType, number>
    )
  ).map(([type, value]) => ({
    type: type as AssetType,
    value,
    pct: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
  }));

  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    allocationByType,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
  };
}
