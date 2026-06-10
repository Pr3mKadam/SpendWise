/**
 * Setu AA Configuration
 *
 * WARNING: Client ID and Secret are NEVER configured in client-side code.
 * All Setu API calls go through the setu-aa-proxy Edge Function which holds
 * the credentials server-side.
 */

import { SETU_ENV, SETU_WEBHOOK_URL } from '@/config/env';

export interface SetuConfig {
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
}

export function getSetuConfig(): SetuConfig | null {
  if (!SETU_ENV) return null;
  if (SETU_ENV !== 'sandbox' && SETU_ENV !== 'production') return null;
  return {
    environment: SETU_ENV,
    webhookUrl: SETU_WEBHOOK_URL,
  };
}

export function isSetuConfigured(): boolean {
  return getSetuConfig() !== null;
}
