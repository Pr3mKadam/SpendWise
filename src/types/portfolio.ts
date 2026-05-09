export type AssetType = 'bank' | 'investment' | 'crypto' | 'property' | 'other';
export type LiabilityType = 'loan' | 'credit_card' | 'mortgage' | 'other';
export type UPIProvider = 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'bhim' | 'razorpay' | 'other';

export interface AssetEntry {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
  lastUpdated: string;
}

export interface LiabilityEntry {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  interestRate?: number; // Annual percentage rate
  minPayment?: number;
  currency?: string;
  icon?: string;
  lastUpdated: string;
}

export interface UPIAccount {
  id: string;
  provider: UPIProvider;
  upiId: string;
  linkedAt: string;
  lastSynced: string;
  status: 'active' | 'error' | 'disconnected';
}
