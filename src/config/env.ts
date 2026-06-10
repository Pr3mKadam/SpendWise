function requireEnv(key: string): string {
  const v = import.meta.env[key] as string | undefined;
  if (!v) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Check your .env.local file or environment configuration.`
    );
  }
  return v;
}

function optionalEnv<T>(key: string, fallback: T): string | T {
  const v = import.meta.env[key] as string | undefined;
  return v ?? fallback;
}

export const SUPABASE_URL = requireEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = requireEnv('VITE_SUPABASE_ANON_KEY');

export const GEMINI_PROXY_URL = optionalEnv('VITE_GEMINI_PROXY_URL', '/functions/v1/gemini-proxy');
export const SETU_ENV = optionalEnv('VITE_SETU_ENV', 'sandbox');
export const SETU_CLIENT_ID = optionalEnv('VITE_SETU_CLIENT_ID', '');
export const SETU_SECRET = optionalEnv('VITE_SETU_SECRET', '');
export const SETU_WEBHOOK_URL = optionalEnv('VITE_SETU_WEBHOOK_URL', '');
export const SENTRY_DSN = optionalEnv('VITE_SENTRY_DSN', '');
export const DEMO_MODE = optionalEnv('VITE_DEMO_MODE', '') === 'true';
export const VAPID_PUBLIC_KEY = optionalEnv('VITE_VAPID_PUBLIC_KEY', '');
export const PLAID_CLIENT_ID = optionalEnv('VITE_PLAID_CLIENT_ID', '');
export const LOG_LEVEL = optionalEnv('VITE_LOG_LEVEL', 'INFO');
export const APP_VERSION = optionalEnv('VITE_APP_VERSION', '0.0.0');
export const RAZORPAY_PROXY_URL = optionalEnv('VITE_RAZORPAY_PROXY_URL', '/functions/v1/razorpay-proxy');
export const RESEND_API_KEY = optionalEnv('RESEND_API_KEY', '');

export function validateEnv(): string[] {
  const errors: string[] = [];
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;
  for (const key of required) {
    if (!import.meta.env[key]) {
      errors.push(`Missing required env: ${key}`);
    }
  }
  return errors;
}
