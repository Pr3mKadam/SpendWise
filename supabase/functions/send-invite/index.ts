// supabase/functions/send-invite/index.ts
// Deploy: supabase functions deploy send-invite
// Secret: supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
// Get free API key at: https://resend.com (3,000 emails/month free)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

interface InvitePayload {
  to:        string;   // recipient email
  toName:    string;   // recipient display name
  groupName: string;   // SpendWise group name
  groupId:   string;   // group ID for the join link
  fromName:  string;   // inviter's name
  joinUrl:   string;   // full join URL with ?action=join-group&id=xxx
}

function buildCorsHeaders(origin: string) {
  const allowed = isOriginAllowed(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: InvitePayload = await req.json();
    const { to, toName, groupName, groupId, fromName, joinUrl } = body;

    if (!to || !groupName || !groupId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, groupName, groupId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firstName = toName?.split(" ")[0] || "there";

    // ── Branded HTML email ──────────────────────────────────────────
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to ${groupName}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:32px;text-align:center;">
              <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:28px;">🤝</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                SpendWise
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;">
                Shared Wallet Invitation
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 10px;color:#94a3b8;font-size:14px;">Hi ${firstName},</p>
              <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:20px;font-weight:700;line-height:1.3;">
                ${fromName} invited you to join<br/>
                <span style="color:#2dd4bf;">"${groupName}"</span>
              </h2>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.6;">
                SpendWise is a free, private finance app. This shared wallet lets you
                track joint expenses, split bills, and save towards group goals — 
                all in real time.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${joinUrl}"
                       style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
                      Join "${groupName}" →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback: Group ID -->
              <div style="margin:28px 0 0;padding:16px;background:#0f172a;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
                <p style="margin:0 0 6px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                  Or open SpendWise and enter this Group ID:
                </p>
                <p style="margin:0;font-family:monospace;font-size:18px;color:#2dd4bf;font-weight:700;letter-spacing:2px;">
                  ${groupId}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;color:#475569;font-size:12px;text-align:center;line-height:1.6;">
                SpendWise is completely free. Your financial data stays on your device.<br/>
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // ── Plain-text fallback ─────────────────────────────────────────
    const text = `Hi ${firstName},

${fromName} invited you to join "${groupName}" on SpendWise.

Open SpendWise and use this Group ID to join: ${groupId}

Or click this link: ${joinUrl}

SpendWise is a free, private finance app. Your data stays on your device.
If you didn't expect this invitation, you can safely ignore this email.`;

    // ── Send via Resend ─────────────────────────────────────────────
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SpendWise <invites@spendwise.app>",  // update to your verified domain
        to:   [to],
        subject: `${fromName} invited you to "${groupName}" on SpendWise`,
        html,
        text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send email", detail: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("send-invite function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
