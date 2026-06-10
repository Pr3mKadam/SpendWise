// supabase/functions/setu-aa-proxy/index.ts
// Deploy: supabase functions deploy setu-aa-proxy
// Secrets:
//   supabase secrets set SETU_CLIENT_ID=your-setu-client-id
//   supabase secrets set SETU_CLIENT_SECRET=your-setu-client-secret
//   supabase secrets set SETU_AA_BASE_URL=https://sandbox.setu.co/api/aa/v1
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SetuTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSetuToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = Deno.env.get('SETU_CLIENT_ID') ?? '';
  const clientSecret = Deno.env.get('SETU_CLIENT_SECRET') ?? '';
  const baseUrl = Deno.env.get('SETU_AA_BASE_URL') ?? 'https://sandbox.setu.co/api/aa/v1';

  const resp = await fetch(`${baseUrl}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!resp.ok) {
    throw new Error('Failed to authenticate with Setu AA API.');
  }

  const data: SetuTokenResponse = await resp.json();
  cachedToken = { token: data.access_token, expiresAt: now + data.expires_in * 1000 - 60_000 };
  return data.access_token;
}

// ─── In-memory rate limiter ──────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── CORS (locked to specific origins) ───────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://spendwise.vercel.app',
  'https://spendwise-preview.vercel.app',
];

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app') && origin.startsWith('https://spendwise-')) return true;
  return false;
}

function buildCorsHeaders(origin: string) {
  const allowed = isOriginAllowed(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

// ─── Request body schema validation ──────────────────────────────────────
interface CreateConsentPayload {
  action: 'create-consent';
  environment: 'sandbox' | 'production';
  mobileNumber: string;
}

interface CheckConsentPayload {
  action: 'check-consent';
  consentId: string;
}

interface FetchStatementsPayload {
  action: 'fetch-statements';
  consentId: string;
}

type SetuPayload = CreateConsentPayload | CheckConsentPayload | FetchStatementsPayload;

function validateBody(raw: unknown): SetuPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Request body must be a JSON object.');
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.action !== 'string' || !obj.action) {
    throw new Error('Missing or invalid "action" field.');
  }
  if (!['create-consent', 'check-consent', 'fetch-statements'].includes(obj.action)) {
    throw new Error(
      `Unknown action: "${obj.action}". Valid actions: create-consent, check-consent, fetch-statements`
    );
  }

  switch (obj.action) {
    case 'create-consent': {
      if (
        typeof obj.environment !== 'string' ||
        !['sandbox', 'production'].includes(obj.environment)
      ) {
        throw new Error('"environment" must be "sandbox" or "production".');
      }
      if (typeof obj.mobileNumber !== 'string' || !/^\+?[1-9]\d{9,14}$/.test(obj.mobileNumber)) {
        throw new Error('"mobileNumber" is required and must be a valid mobile number.');
      }
      return {
        action: 'create-consent',
        environment: obj.environment as 'sandbox' | 'production',
        mobileNumber: obj.mobileNumber,
      };
    }
    case 'check-consent': {
      if (typeof obj.consentId !== 'string' || !obj.consentId) {
        throw new Error('"consentId" is required and must be a non-empty string.');
      }
      return { action: 'check-consent', consentId: obj.consentId };
    }
    case 'fetch-statements': {
      if (typeof obj.consentId !== 'string' || !obj.consentId) {
        throw new Error('"consentId" is required and must be a non-empty string.');
      }
      return { action: 'fetch-statements', consentId: obj.consentId };
    }
  }
}

// ─── Main handler ────────────────────────────────────────────────────────
serve(async req => {
  const origin = req.headers.get('Origin') ?? '';
  const corsHeaders = buildCorsHeaders(origin);
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // JWT authentication check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header provided.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired user session token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const rawBody = await req.json();
    const payload = validateBody(rawBody);
    const setuBase = Deno.env.get('SETU_AA_BASE_URL') ?? 'https://sandbox.setu.co/api/aa/v1';

    switch (payload.action) {
      case 'create-consent': {
        const token = await getSetuToken();
        const setuResp = await fetch(`${setuBase}/consents`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: payload.mobileNumber,
            environment: payload.environment,
            redirectUrl: 'https://spendwise.vercel.app/sync',
          }),
        });

        const data = await setuResp.json();
        if (!setuResp.ok) {
          return new Response(JSON.stringify({ error: data?.message || 'Setu AA API error' }), {
            status: setuResp.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ id: data.id, url: data.url, status: 'PENDING' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check-consent': {
        const token = await getSetuToken();
        const setuResp = await fetch(`${setuBase}/consents/${payload.consentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await setuResp.json();
        if (!setuResp.ok) {
          return new Response(JSON.stringify({ error: data?.message || 'Setu AA API error' }), {
            status: setuResp.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(
          JSON.stringify({ id: data.id, url: data.url, status: data.status || 'PENDING' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch-statements': {
        const token = await getSetuToken();
        const setuResp = await fetch(`${setuBase}/consents/${payload.consentId}/statements`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await setuResp.json();
        if (!setuResp.ok) {
          return new Response(JSON.stringify({ error: data?.message || 'Setu AA API error' }), {
            status: setuResp.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ transactions: data.transactions || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const status =
      message.includes('body') || message.includes('Missing') || message.includes('Unknown')
        ? 400
        : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
