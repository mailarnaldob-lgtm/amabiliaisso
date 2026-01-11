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
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    const trimmedResponse = responseText.trim();
    
    if (trimmedResponse.startsWith('<!DOCTYPE') || trimmedResponse.startsWith('<html') || trimmedResponse.startsWith('<')) {
      console.error('[ADMIN_SESSION] PHP returned HTML');
      return { ok: false, error: 'Session service returned error page', httpStatus: 503 };
    }
    
    if (!trimmedResponse) {
      return { ok: false, error: 'Empty response from session service', httpStatus: 502 };
    }
    
    try {
      const data = JSON.parse(trimmedResponse);
      return { ok: response.ok, data, httpStatus: response.status };
    } catch {
      return { ok: false, error: 'Invalid response from session service', httpStatus: 502 };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, error: 'Session validation timeout', httpStatus: 504 };
    }
    return { ok: false, error: 'Network error', httpStatus: 503 };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody: { session_token?: string; action?: string };
    try {
      const bodyText = await req.text();
      if (!bodyText.trim()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Empty request body', code: 'INVALID_REQUEST', valid: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestBody = JSON.parse(bodyText);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON', code: 'INVALID_JSON', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_token, action } = requestBody;

    if (!session_token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Session token required', code: 'MISSING_TOKEN', valid: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await safeFetchJson('https://amabilianetwork.com/api/admin-session.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token, action: action || 'validate' }),
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ success: false, error: result.error, code: 'SESSION_SERVICE_ERROR', valid: false }),
        { status: result.httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sessionResult = result.data as { valid?: boolean; admin_id?: string; username?: string; role?: string; error?: string };

    if (action === 'logout') {
      return new Response(
        JSON.stringify({ success: true, data: { message: 'Session invalidated' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (sessionResult.valid) {
      return new Response(
        JSON.stringify({ 
          success: true,
          valid: true,
          data: {
            admin: {
              id: sessionResult.admin_id,
              username: sessionResult.username,
              role: sessionResult.role,
            }
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, valid: false, error: sessionResult.error || 'Invalid session', code: 'INVALID_SESSION' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[ADMIN_SESSION] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR', valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
