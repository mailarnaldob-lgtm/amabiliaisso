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
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    
    const mysqlHost = Deno.env.get('MYSQL_HOST') || '';
    const mysqlUser = Deno.env.get('MYSQL_USER') || '';
    const mysqlDatabase = Deno.env.get('MYSQL_DATABASE') || '';
    const mysqlPassword = Deno.env.get('MYSQL_PASSWORD') || '';

    if (!mysqlHost || !mysqlUser || !mysqlDatabase || !mysqlPassword) {
      return new Response(
        JSON.stringify({ error: 'Database configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const proxyUrl = `https://amabilianetwork.com/api/task-proofs.php`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list',
        status,
        db_host: mysqlHost,
        db_user: mysqlUser,
        db_name: mysqlDatabase,
        db_pass: mysqlPassword
      })
    });

    if (!response.ok) {
      console.error('Task proofs fetch error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch task proofs' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Task proofs error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
