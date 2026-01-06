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
    const { proof_id, session_token } = await req.json();

    if (!proof_id) {
      return new Response(
        JSON.stringify({ error: 'proof_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!session_token) {
      return new Response(
        JSON.stringify({ error: 'Session token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PHP proxy handles DB credentials internally and validates session
    const proxyUrl = `https://amabilianetwork.com/api/approve-proof.php`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof_id,
        session_token
        // DB credentials are NOT sent - PHP proxy reads from its own env
        // admin_id is resolved server-side from session_token
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Approve proof error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to approve proof', details: errorText }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    
    if (result.error === 'Invalid session') {
      return new Response(
        JSON.stringify({ error: 'Session expired', session_invalid: true }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (result.success) {
      console.log(`Task proof ${proof_id} approved via session`);
      return new Response(
        JSON.stringify({ success: true, message: 'Task proof approved and paid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to approve proof' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Approve proof error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
