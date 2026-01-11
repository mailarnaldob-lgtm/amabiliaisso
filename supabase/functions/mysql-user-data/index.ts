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
      }),
    });

    // Get raw response text first to check for HTML errors
    const responseText = await response.text();
    console.log(`PHP proxy status: ${response.status}, response length: ${responseText.length}`);
    
    // Check if response is HTML (error page) instead of JSON
    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      console.error('PHP proxy returned HTML instead of JSON. The endpoint may not exist or has an error.');
      console.error('Response preview:', responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: 'Backend service unavailable. Please contact support.',
          details: 'PHP proxy returned HTML instead of JSON'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse PHP response as JSON:', responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from backend',
          details: 'Response was not valid JSON'
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PHP proxy response received successfully');

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
