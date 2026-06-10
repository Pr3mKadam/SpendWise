import type { DefaultCategory } from '@/types';

type MerchantMemoryStore = {
  merchantMemory?: Record<string, { merchant: string; category: string }>;
  setMerchantMemory: (memory: Record<string, { merchant: string; category: string }>) => void;
};

let _store: MerchantMemoryStore | null = null;

export function initMerchantMemory(store: MerchantMemoryStore) {
  _store = store;
}

function getStore(): MerchantMemoryStore | null {
  return _store;
}

export function learnMerchant(merchant: string, category: DefaultCategory) {
  const store = getStore();
  if (!store) return;
  const memory = {
    ...(store.merchantMemory ?? {}),
    [merchant.toLowerCase()]: { merchant, category },
  };
  store.setMerchantMemory(memory);
}

export function saveMerchantCorrection(merchant: string, correctedCategory: string) {
  const store = getStore();
  if (!store) return;
  const memory = {
    ...(store.merchantMemory ?? {}),
    [merchant.toLowerCase()]: { merchant, category: correctedCategory },
  };
  store.setMerchantMemory(memory);
}
