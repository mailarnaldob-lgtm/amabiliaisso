import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  services: {
    edge_functions: 'ok' | 'error';
    database: 'ok' | 'error' | 'unknown';
  };
  version: string;
  uptime_check: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      edge_functions: 'ok',
      database: 'unknown',
    },
    version: '2.0.0',
    uptime_check: true,
  };

  try {
    // Check Supabase database connectivity
    const dbHealthCheck = await checkDatabase();
    healthStatus.services.database = dbHealthCheck ? 'ok' : 'error';

    // Determine overall status
    if (healthStatus.services.database === 'error') {
      healthStatus.status = 'degraded';
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: healthStatus,
      }),
      { 
        status: healthStatus.status === 'ok' ? 200 : 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[HEALTH] Check failed:', errorMessage);
    
    healthStatus.status = 'error';
    healthStatus.services.edge_functions = 'error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR',
        data: healthStatus,
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function checkDatabase(): Promise<boolean> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Simple query to check database connectivity
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('[HEALTH] Database check failed:', error);
    return false;
  }
}
