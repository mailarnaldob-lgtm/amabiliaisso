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
    const { proof_id, admin_id } = await req.json();

    if (!proof_id || !admin_id) {
      return new Response(
        JSON.stringify({ error: 'proof_id and admin_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Call the approve_task_proof stored procedure via PHP proxy
    const proxyUrl = `https://amabilianetwork.com/api/approve-proof.php`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof_id,
        admin_id,
        db_host: mysqlHost,
        db_user: mysqlUser,
        db_name: mysqlDatabase,
        db_pass: mysqlPassword
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
    
    if (result.success) {
      console.log(`Task proof ${proof_id} approved by admin ${admin_id}`);
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
