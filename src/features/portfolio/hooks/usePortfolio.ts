import { useEffect, useCallback, useRef } from 'react';
import { AssetType, AssetEntry } from '@/types';
import { useStore } from '@/store';
import { refreshAllPrices } from '@/core/prices/fetchPrices';

export function usePortfolio() {
  const assets = useStore(state => state.assets);
  const liabilities = useStore(state => state.liabilities);
  const livePrices = useStore(state => state.livePrices);
  const lastPriceUpdate = useStore(state => state.lastPriceUpdate);
  const addAsset = useStore(state => state.addAsset);
  const deleteAsset = useStore(state => state.deleteAsset);
  const addLiability = useStore(state => state.addLiability);
  const deleteLiability = useStore(state => state.deleteLiability);

  const updateAsset = useStore(state => state.updateAsset);
  const updateLiability = useStore(state => state.updateLiability);
  const setLivePrices = useStore(state => state.setLivePrices);

  const fetchingRef = useRef(false);

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

  // ── Price fetching ───────────────────────────────────────────────────────────
  const priceableAssets = assets.filter((a): a is AssetEntry & { symbol: string } => !!a.symbol);

  const refreshPrices = useCallback(async () => {
    if (priceableAssets.length === 0 || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const mapped = priceableAssets.map(a => ({
        id: a.id,
        symbol: a.symbol,
        type: a.assetClass ?? 'equity',
      }));
      const prices = await refreshAllPrices(mapped);
      setLivePrices(prices);
    } finally {
      fetchingRef.current = false;
    }
  }, [priceableAssets, setLivePrices]);

  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  // ── Assets with live prices merged in ────────────────────────────────────────
  const assetsWithPrices = useStore(state =>
    state.assets.map(a => ({
      ...a,
      livePrice: state.livePrices[a.id] ?? null,
    }))
  );

  return {
    assets,
    assetsWithPrices,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    allocationByType,
    livePrices,
    lastPriceUpdate,
    refreshPrices,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
  };
}
