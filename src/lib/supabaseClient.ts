import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key && String(url).startsWith('http'));
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(String(url), String(key), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
