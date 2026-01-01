import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to MySQL via REST API proxy (using external service)
    // For Deno edge functions, we'll use a PHP proxy endpoint on Hostinger
    const mysqlHost = Deno.env.get('MYSQL_HOST') || '';
    const mysqlUser = Deno.env.get('MYSQL_USER') || '';
    const mysqlDatabase = Deno.env.get('MYSQL_DATABASE') || '';
    const mysqlPassword = Deno.env.get('MYSQL_PASSWORD') || '';

    if (!mysqlHost || !mysqlUser || !mysqlDatabase || !mysqlPassword) {
      console.error('MySQL environment variables not configured');
      return new Response(
        JSON.stringify({ error: 'Database configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Since Deno Edge Functions can't directly connect to MySQL,
    // we use a PHP API proxy on Hostinger
    const proxyUrl = `https://amabilianetwork.com/api/admin-auth.php`;
    
    const authResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        db_host: mysqlHost,
        db_user: mysqlUser,
        db_name: mysqlDatabase,
        db_pass: mysqlPassword
      })
    });

    if (!authResponse.ok) {
      console.error('Auth proxy error:', await authResponse.text());
      return new Response(
        JSON.stringify({ error: 'Authentication service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = await authResponse.json();

    if (authResult.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          admin: {
            id: authResult.admin.id,
            username: authResult.admin.username,
            role: authResult.admin.role
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
