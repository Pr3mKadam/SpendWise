/**
 * Setu Account Aggregator (AA) Sandbox Mock
 * 
 * This file simulates the interaction with the Setu AA API.
 * In a real environment, these calls would be made from a secure backend
 * to prevent leaking the Setu Client ID and Secret.
 * 
 * Flow:
 * 1. Create Consent Request (POST /consents)
 * 2. User approves consent via Setu UI
 * 3. Fetch Data Session (POST /sessions)
 * 4. Fetch Bank Statements (GET /sessions/{id}/data)
 */

import { Transaction } from '@/types';

// These would normally be stored in .env and only accessed by the backend
const SETU_CLIENT_ID = 'mock_setu_client_id';
const SETU_SECRET = 'mock_setu_secret';

export interface SetuConsentResponse {
  id: string;
  url: string; // The URL to redirect the user to for approval
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

/**
 * Step 1: Request consent to view bank data
 */
export async function createSetuConsent(mobileNumber: string): Promise<SetuConsentResponse> {
  console.info(`[Setu AA] Creating consent request for ${mobileNumber}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    id: `setu_cons_${Date.now()}`,
    url: `https://sandbox.setu.co/consent?id=mock_${Date.now()}`,
    status: 'PENDING'
  };
}

/**
 * Step 2: Poll for consent status (In production, use Webhooks instead)
 */
export async function checkSetuConsentStatus(consentId: string): Promise<'PENDING' | 'ACTIVE' | 'REJECTED'> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the sake of the mock, we assume it's instantly active if they check
  return 'ACTIVE';
}

/**
 * Step 3 & 4: Fetch bank statements using the active consent
 */
export async function fetchSetuBankStatements(consentId: string): Promise<Partial<Transaction>[]> {
  console.info(`[Setu AA] Fetching secure bank statements for consent ${consentId}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return realistic data that matches the FI (Financial Information) data schema
  return [
    {
      merchant: 'HDFC Bank IMPS',
      amount: 15000,
      type: 'credit',
      description: 'IMPS-1234567890-SALARY',
      date: new Date().toISOString(),
    },
    {
      merchant: 'Zomato Ltd',
      amount: 450,
      type: 'debit',
      description: 'UPI-ZOMATO@HDFC-FOOD',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      merchant: 'Amazon India',
      amount: 1299,
      type: 'debit',
      description: 'UPI-AMAZON@SBI-SHOPPING',
      date: new Date(Date.now() - 172800000).toISOString(),
    }
  ];
}
