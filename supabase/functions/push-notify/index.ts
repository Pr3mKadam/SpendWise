// supabase/functions/push-notify/index.ts
// Deploy: supabase functions deploy push-notify
// Secrets:
//   supabase secrets set VAPID_PUBLIC_KEY=your-vapid-public-key
//   supabase secrets set VAPID_PRIVATE_KEY=your-vapid-private-key
//   supabase secrets set VAPID_SUBJECT=mailto:admin@spendwise.app
//
// VAPID keys: Run `npx web-push generate-vapid-keys` or use
//   https://web-push-codelab.glitch.me/ to generate a keypair.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
    'Vary': 'Origin',
  };
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

interface SubscribePayload {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // ── Authenticate ───────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const method = req.method;
  const path = new URL(req.url).pathname;

  try {
    // ── SUBSCRIBE: POST /push-notify/subscribe ─────────────────────
    if (method === 'POST' && path.endsWith('/subscribe')) {
      const body: SubscribePayload = await req.json();
      const { endpoint, p256dh, auth: authSecret, userAgent } = body;

      if (!endpoint || !p256dh || !authSecret) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: endpoint, p256dh, auth' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert subscription
      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint,
          p256dh,
          auth: authSecret,
          user_agent: userAgent ?? null,
        }, {
          onConflict: 'user_id,endpoint',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error('Failed to store subscription:', upsertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── UNSUBSCRIBE: DELETE /push-notify/subscribe?endpoint=xxx ───
    if (method === 'DELETE' && path.endsWith('/subscribe')) {
      const endpoint = new URL(req.url).searchParams.get('endpoint');
      if (!endpoint) {
        return new Response(
          JSON.stringify({ error: 'Missing endpoint query parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── SEND: POST /push-notify/send ──────────────────────────────
    if (method === 'POST' && path.endsWith('/send')) {
      // Only allow sending to own user or service roles
      const isServiceRole = authHeader.includes('service_role');
      const body: { userId?: string; notification: PushPayload } = await req.json();
      const targetUserId = body.userId ?? user.id;

      if (targetUserId !== user.id && !isServiceRole) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: can only send notifications to yourself' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Configure web-push
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
      const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@spendwise.app';

      if (!vapidPublicKey || !vapidPrivateKey) {
        return new Response(
          JSON.stringify({ error: 'VAPID keys not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

      // Fetch user's subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', targetUserId);

      if (subError || !subscriptions?.length) {
        return new Response(
          JSON.stringify({ error: 'No subscriptions found for user', sent: 0 }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { title, body: notificationBody, url, icon } = body.notification;
      const payload = JSON.stringify({ title, body: notificationBody, url, icon });

      let sent = 0;
      let failed = 0;

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          }, payload, { TTL: 86400 });
          sent++;
        } catch (err: unknown) {
          failed++;
          // If subscription is expired/invalid, delete it
          if (err instanceof Error && err.message.includes('410')) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, sent, failed }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Unknown route ─────────────────────────────────────────────
    return new Response(
      JSON.stringify({ error: 'Not found. Available: POST /subscribe, DELETE /subscribe, POST /send' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    console.error('push-notify error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
