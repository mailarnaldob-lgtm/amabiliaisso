import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_token, action } = await req.json();

    if (!session_token) {
      return new Response(
        JSON.stringify({ error: 'Session token required', valid: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PHP proxy validates session and returns admin info if valid
    // DB credentials are NOT sent - PHP proxy reads from its own env
    const proxyUrl = `https://amabilianetwork.com/api/admin-session.php`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token,
        action: action || 'validate'
      })
    });

    if (!response.ok) {
      console.error('Session validation error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Session service unavailable', valid: false }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();

    if (action === 'logout') {
      return new Response(
        JSON.stringify({ success: true, message: 'Session invalidated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (result.valid) {
      return new Response(
        JSON.stringify({ 
          valid: true,
          admin: {
            id: result.admin_id,
            username: result.username,
            role: result.role
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ valid: false, error: result.error || 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
