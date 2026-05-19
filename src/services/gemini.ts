import { isSupabaseConfigured } from '@/services/supabase';

interface GeminiCallParams {
  contents: any[];
  generationConfig?: any;
}

/**
 * Universal Gemini caller for SpendWise.
 * Dynamically routes queries:
 * 1. Safe Production Proxy: Calls Supabase Edge Function proxy (GAP-B) if Supabase is configured.
 * 2. Local Fallback: Direct call to Google APIs if local VITE_GEMINI_API_KEY is present in dev.
 */
export async function callGemini(params: GeminiCallParams): Promise<any> {
  const localApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (isSupabaseConfigured) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const sessionToken = sessionStorage.getItem('spendwise_supabase_token') || supabaseAnonKey;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Edge Function error (${response.status}): ${errorMsg || response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      console.warn("Supabase Edge Function proxy failed, attempting local fallback if key exists:", e);
      if (!localApiKey) throw e;
    }
  }

  if (localApiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${localApiKey}`;
    const response = await fetch(url, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Gemini Direct API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  throw new Error('Gemini API is not configured. Setup Supabase Edge Function or add VITE_GEMINI_API_KEY to .env');
}
