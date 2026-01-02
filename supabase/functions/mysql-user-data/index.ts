import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, user_id, email } = await req.json();
    
    // Get MySQL credentials from environment
    const MYSQL_HOST = Deno.env.get('MYSQL_HOST');
    const MYSQL_USER = Deno.env.get('MYSQL_USER');
    const MYSQL_DATABASE = Deno.env.get('MYSQL_DATABASE');
    const MYSQL_PASSWORD = Deno.env.get('MYSQL_PASSWORD');

    if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE || !MYSQL_PASSWORD) {
      console.error('Missing MySQL environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PHP proxy endpoint on Hostinger (with www subdomain)
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
        email,
        db_host: MYSQL_HOST,
        db_user: MYSQL_USER,
        db_name: MYSQL_DATABASE,
        db_password: MYSQL_PASSWORD,
      }),
    });

    const data = await response.json();
    console.log('PHP proxy response:', JSON.stringify(data));

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
