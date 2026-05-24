// supabase/functions/razorpay-proxy/index.ts
// Deploy: supabase functions deploy razorpay-proxy
// Secrets:
//   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
//   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RZP_KEY_ID     = Deno.env.get("RAZORPAY_KEY_ID")     ?? "";
const RZP_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
const RZP_BASE       = "https://api.razorpay.com/v1";

// Basic auth header for Razorpay
const rzpAuth = () =>
  "Basic " + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    return new Response(
      JSON.stringify({ error: "Razorpay credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { action, params = {} } = body;

    let endpoint = "";
    let method   = "GET";
    let rzpBody: string | undefined;

    switch (action) {
      // ── List recent payments ────────────────────────────────────
      case "list-payments": {
        const qs = new URLSearchParams();
        qs.set("count", String(params.count ?? 100));
        if (params.from) qs.set("from", String(params.from));
        if (params.to)   qs.set("to",   String(params.to));
        endpoint = `/payments?${qs}`;
        break;
      }

      // ── Fetch single payment details ─────────────────────────────
      case "get-payment": {
        if (!params.paymentId) throw new Error("paymentId required");
        endpoint = `/payments/${params.paymentId}`;
        break;
      }

      // ── List refunds ─────────────────────────────────────────────
      case "list-refunds": {
        const qs = new URLSearchParams();
        qs.set("count", String(params.count ?? 100));
        if (params.from) qs.set("from", String(params.from));
        if (params.to)   qs.set("to",   String(params.to));
        endpoint = `/refunds?${qs}`;
        break;
      }

      // ── List payouts (if Razorpay X account) ─────────────────────
      case "list-payouts": {
        if (!params.accountNumber) throw new Error("accountNumber required");
        const qs = new URLSearchParams({ account_number: params.accountNumber });
        qs.set("count", String(params.count ?? 100));
        endpoint = `/payouts?${qs}`;
        break;
      }

      // ── Create payment link ───────────────────────────────────────
      case "create-payment-link": {
        method   = "POST";
        endpoint = "/payment_links";
        rzpBody  = JSON.stringify({
          amount:      params.amount,
          currency:    params.currency ?? "INR",
          description: params.description ?? "SpendWise Payment",
          customer:    params.customer,
          notify:      { sms: true, email: true },
          reminder_enable: false,
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const rzpResponse = await fetch(`${RZP_BASE}${endpoint}`, {
      method,
      headers: {
        "Authorization": rzpAuth(),
        "Content-Type":  "application/json",
      },
      body: rzpBody,
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error("Razorpay API error:", data);
      return new Response(
        JSON.stringify({ error: data?.error?.description ?? "Razorpay API error", raw: data }),
        { status: rzpResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("razorpay-proxy error:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
