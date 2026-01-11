import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Safe fetch with strict JSON validation
 */
async function safeFetchJson(
  url: string, 
  options: RequestInit
): Promise<{ ok: boolean; data?: unknown; error?: string; httpStatus: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    const trimmedResponse = responseText.trim();
    
    // Reject HTML responses
    if (trimmedResponse.startsWith('<!DOCTYPE') || trimmedResponse.startsWith('<html') || trimmedResponse.startsWith('<')) {
      console.error('[ADMIN_LOGIN] PHP returned HTML:', trimmedResponse.substring(0, 300));
      return { ok: false, error: 'Authentication service returned error page', httpStatus: 503 };
    }
    
    if (!trimmedResponse) {
      return { ok: false, error: 'Empty response from authentication service', httpStatus: 502 };
    }
    
    try {
      const data = JSON.parse(trimmedResponse);
      return { ok: response.ok, data, httpStatus: response.status };
    } catch {
      console.error('[ADMIN_LOGIN] Invalid JSON:', trimmedResponse.substring(0, 300));
      return { ok: false, error: 'Invalid response from authentication service', httpStatus: 502 };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, error: 'Authentication request timeout', httpStatus: 504 };
    }
    return { ok: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`, httpStatus: 503 };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body safely
    let requestBody: { username?: string; password?: string };
    try {
      const bodyText = await req.text();
      if (!bodyText.trim()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Empty request body', code: 'INVALID_REQUEST' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestBody = JSON.parse(bodyText);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body', code: 'INVALID_JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { username, password } = requestBody;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username and password required', code: 'MISSING_CREDENTIALS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ADMIN_LOGIN] Attempting login for: ${username}`);

    const result = await safeFetchJson('https://amabilianetwork.com/api/admin-auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ success: false, error: result.error, code: 'AUTH_SERVICE_ERROR' }),
        { status: result.httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = result.data as { success?: boolean; session_token?: string; expires_at?: string; error?: string };

    if (authResult.success && authResult.session_token) {
      console.log('[ADMIN_LOGIN] Login successful');
      return new Response(
        JSON.stringify({ 
          success: true,
          data: {
            session_token: authResult.session_token,
            expires_at: authResult.expires_at,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error || 'Invalid credentials', code: 'INVALID_CREDENTIALS' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[ADMIN_LOGIN] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
