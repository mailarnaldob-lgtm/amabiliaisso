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
    const { action, user_id, email } = await req.json();

    // PHP proxy handles DB credentials internally via its own environment
    const proxyUrl = 'https://www.amabilianetwork.com/api/get-user-data.php';

    console.log(`Processing action: ${action} for user: ${user_id || email}`);

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        user_id,
        email
        // DB credentials are NOT sent - PHP proxy reads from its own env
      }),
    });

    const data = await response.json();
    console.log('PHP proxy response received');

    return new Response(
      JSON.stringify(data),
      { 
        status: response.ok ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mysql-user-data:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
