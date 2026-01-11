import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  services: {
    edge_functions: 'ok' | 'error';
    php_proxy: 'ok' | 'error' | 'unknown';
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
      php_proxy: 'unknown',
      database: 'unknown',
    },
    version: '1.0.0',
    uptime_check: true,
  };

  try {
    // Check PHP proxy health
    const phpHealthCheck = await checkPhpProxy();
    healthStatus.services.php_proxy = phpHealthCheck ? 'ok' : 'error';

    // Check database via PHP proxy
    if (phpHealthCheck) {
      const dbHealthCheck = await checkDatabase();
      healthStatus.services.database = dbHealthCheck ? 'ok' : 'error';
    }

    // Determine overall status
    if (healthStatus.services.php_proxy === 'error' || healthStatus.services.database === 'error') {
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

async function checkPhpProxy(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.amabilianetwork.com/api/health.php', {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is JSON
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      console.error('[HEALTH] PHP proxy returned HTML instead of JSON');
      return false;
    }
    
    try {
      const data = JSON.parse(text);
      return data.status === 'ok' || response.ok;
    } catch {
      // If we can't parse but got a response, consider it partially working
      return response.ok;
    }
  } catch (error) {
    console.error('[HEALTH] PHP proxy check failed:', error);
    return false;
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.amabilianetwork.com/api/health.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'db_check' }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      return false;
    }
    
    try {
      const data = JSON.parse(text);
      return data.database === 'connected' || data.success === true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error('[HEALTH] Database check failed:', error);
    return false;
  }
}
