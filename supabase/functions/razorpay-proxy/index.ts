// supabase/functions/razorpay-proxy/index.ts
// Deploy: supabase functions deploy razorpay-proxy
// Secrets:
//   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
//   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── In-memory rate limiter ──────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
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
interface ValidatedBody {
  action: string;
  params: Record<string, unknown>;
}

function validateBody(raw: unknown): ValidatedBody {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Request body must be a JSON object.');
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.action !== 'string' || !obj.action) {
    throw new Error('Missing or invalid "action" field.');
  }
  const VALID_ACTIONS = [
    'list-payments',
    'get-payment',
    'list-refunds',
    'list-payouts',
    'create-payment-link',
  ];
  if (!VALID_ACTIONS.includes(obj.action)) {
    throw new Error(`Unknown action: "${obj.action}". Valid actions: ${VALID_ACTIONS.join(', ')}`);
  }
  if (
    obj.params !== undefined &&
    (typeof obj.params !== 'object' || obj.params === null || Array.isArray(obj.params))
  ) {
    throw new Error('"params" must be a JSON object if provided.');
  }
  return {
    action: obj.action,
    params:
      typeof obj.params === 'object' && obj.params !== null && !Array.isArray(obj.params)
        ? (obj.params as Record<string, unknown>)
        : {},
  };
}

// ─── Main handler ────────────────────────────────────────────────────────
const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
const RZP_BASE = 'https://api.razorpay.com/v1';

const rzpAuth = () => 'Basic ' + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);

serve(async req => {
  const origin = req.headers.get('Origin') ?? '';
  const corsHeaders = buildCorsHeaders(origin);
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

  // Rate limiting
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

  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Razorpay credentials not configured on the server.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const rawBody = await req.json();
    const { action, params } = validateBody(rawBody);

    let endpoint = '';
    let method = 'GET';
    let rzpBody: string | undefined;

    switch (action) {
      case 'list-payments': {
        const qs = new URLSearchParams();
        qs.set('count', String(Math.min(Math.max(Number(params.count) || 100, 1), 500)));
        if (params.from) qs.set('from', String(params.from));
        if (params.to) qs.set('to', String(params.to));
        endpoint = `/payments?${qs}`;
        break;
      }

      case 'get-payment': {
        if (!params.paymentId || typeof params.paymentId !== 'string') {
          throw new Error('paymentId is required and must be a string.');
        }
        endpoint = `/payments/${params.paymentId}`;
        break;
      }

      case 'list-refunds': {
        const qs = new URLSearchParams();
        qs.set('count', String(Math.min(Math.max(Number(params.count) || 100, 1), 500)));
        if (params.from) qs.set('from', String(params.from));
        if (params.to) qs.set('to', String(params.to));
        endpoint = `/refunds?${qs}`;
        break;
      }

      case 'list-payouts': {
        if (!params.accountNumber || typeof params.accountNumber !== 'string') {
          throw new Error('accountNumber is required and must be a string.');
        }
        const qs = new URLSearchParams({ account_number: params.accountNumber });
        qs.set('count', String(Math.min(Math.max(Number(params.count) || 100, 1), 500)));
        endpoint = `/payouts?${qs}`;
        break;
      }

      case 'create-payment-link': {
        if (!params.amount || typeof params.amount !== 'number' || params.amount <= 0) {
          throw new Error('amount is required and must be a positive number.');
        }
        method = 'POST';
        endpoint = '/payment_links';
        rzpBody = JSON.stringify({
          amount: Math.round(params.amount),
          currency: String(params.currency ?? 'INR').toUpperCase(),
          description: String(params.description ?? 'SpendWise Payment').slice(0, 255),
          customer: params.customer ?? undefined,
          notify: { sms: true, email: true },
          reminder_enable: false,
        });
        break;
      }
    }

    const rzpResponse = await fetch(`${RZP_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: rzpAuth(),
        'Content-Type': 'application/json',
      },
      body: rzpBody,
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok) {
      const safeError =
        typeof data?.error?.description === 'string'
          ? data.error.description
          : 'Razorpay API error';
      return new Response(JSON.stringify({ error: safeError }), {
        status: rzpResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
