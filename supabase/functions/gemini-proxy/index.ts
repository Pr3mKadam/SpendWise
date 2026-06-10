// supabase/functions/gemini-proxy/index.ts
// Deploy: supabase functions deploy gemini-proxy
// Secrets:
//   supabase secrets set GEMINI_API_KEY=your-gemini-api-key
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// ─── Strict origin allowlist ─────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://spendwise.vercel.app',
  'https://spendwise-preview.vercel.app',
];

const isOriginAllowed = (origin: string): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app') && origin.startsWith('https://spendwise-')) return true;
  return false;
};

// ─── Input validation ────────────────────────────────────────────────────
function validateContents(body: unknown): { contents: unknown[]; generationConfig?: unknown } {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Request body must be a JSON object.');
  }
  const obj = body as Record<string, unknown>;
  if (!Array.isArray(obj.contents) || obj.contents.length === 0) {
    throw new Error('Missing or invalid "contents" array in request body.');
  }
  const MAX_CONTENT_LENGTH = 50_000;
  const rawLength = JSON.stringify(obj.contents).length;
  if (rawLength > MAX_CONTENT_LENGTH) {
    throw new Error(
      `Payload too large. Maximum content length is ${MAX_CONTENT_LENGTH} characters.`
    );
  }
  return {
    contents: obj.contents,
    generationConfig: obj.generationConfig ?? undefined,
  };
}

serve(async req => {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = isOriginAllowed(origin);

  // Rate limit by IP
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header provided.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase environment is not configured on the edge.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the Supabase dashboard.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.json();
    const { contents, generationConfig } = validateContents(rawBody);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: generationConfig || {},
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      const safeError =
        typeof errorText === 'string' && errorText.length > 200
          ? errorText.slice(0, 200)
          : errorText || 'Gemini API error';
      return new Response(JSON.stringify({ error: `Gemini API Error: ${safeError}` }), {
        status: geminiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await geminiResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected proxy error occurred.';
    const status =
      message.includes('body') || message.includes('Missing') || message.includes('too large')
        ? 400
        : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
