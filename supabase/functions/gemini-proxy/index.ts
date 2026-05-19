// supabase/functions/gemini-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const isOriginAllowed = (origin: string): boolean => {
  if (!origin) return false;
  // Allow local development ports
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  // Allow Vercel deployments/previews
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = isOriginAllowed(origin);
  const responseOrigin = allowed ? origin : '*'; // default or fallback

  const corsHeaders = {
    'Access-Control-Allow-Origin': responseOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify Authorization Header is present
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Verify JWT token is a valid logged-in user token (SEC-09)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase environment is not configured on the edge.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    
    // Validate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired user session token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Retrieve Gemini API Key from Supabase env variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the Supabase dashboard.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Parse Request Body
    const body = await req.json()
    const { contents, generationConfig } = body

    if (!contents) {
      return new Response(
        JSON.stringify({ error: 'Missing contents array in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Proxied request to official Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: generationConfig || {}
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error(`Gemini API returned error status ${geminiResponse.status}:`, errorText)
      return new Response(
        JSON.stringify({ error: `Gemini API Error: ${errorText}` }),
        { status: geminiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await geminiResponse.json()
    
    // 6. Send successful structured response back to client
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Gemini Proxy Edge Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected proxy error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
