import { AssetType, LiabilityType } from '../types';

export const ASSET_TYPES: { value: AssetType; label: string; icon: string; color: string }[] = [
  { value: 'bank',       label: 'Bank Account',  icon: '🏦', color: '#14b8a6' },
  { value: 'investment', label: 'Investment',    icon: '📈', color: '#6366f1' },
  { value: 'crypto',     label: 'Crypto',        icon: '₿',  color: '#f59e0b' },
  { value: 'property',   label: 'Property',      icon: '🏠', color: '#10b981' },
  { value: 'other',      label: 'Other',         icon: '💼', color: '#64748b' },
];

export const LIABILITY_TYPES: { value: LiabilityType; label: string; icon: string; color: string }[] = [
  { value: 'loan',        label: 'Personal Loan', icon: '📋', color: '#ef4444' },
  { value: 'credit_card', label: 'Credit Card',   icon: '💳', color: '#f97316' },
  { value: 'mortgage',    label: 'Mortgage',      icon: '🏡', color: '#dc2626' },
  { value: 'other',       label: 'Other Debt',    icon: '📄', color: '#94a3b8' },
];

export function getAssetCfg(type: AssetType) {
  return ASSET_TYPES.find(t => t.value === type) ?? ASSET_TYPES[4];
}

export function getLiabilityCfg(type: LiabilityType) {
  return LIABILITY_TYPES.find(t => t.value === type) ?? LIABILITY_TYPES[3];
}
