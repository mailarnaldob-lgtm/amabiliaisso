import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Safe fetch with strict JSON validation
 * Never calls .json() blindly - always validates response first
 */
async function safeFetchJson(
  url: string, 
  options: RequestInit
): Promise<{ ok: boolean; data?: unknown; error?: string; httpStatus: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Get raw text first - NEVER call .json() directly
    const responseText = await response.text();
    
    console.log(`[MYSQL_USER_DATA] Response status: ${response.status}, length: ${responseText.length}`);
    
    // Check for HTML error pages (404, 500, etc.)
    const trimmedResponse = responseText.trim();
    if (
      trimmedResponse.startsWith('<!DOCTYPE') ||
      trimmedResponse.startsWith('<html') ||
      trimmedResponse.startsWith('<?xml') ||
      trimmedResponse.startsWith('<')
    ) {
      console.error('[MYSQL_USER_DATA] PHP returned HTML instead of JSON');
      console.error('[MYSQL_USER_DATA] Preview:', trimmedResponse.substring(0, 500));
      return {
        ok: false,
        error: 'Backend service unavailable. The PHP endpoint returned an error page instead of JSON.',
        httpStatus: 503,
      };
    }
    
    // Check for empty response
    if (!trimmedResponse) {
      console.error('[MYSQL_USER_DATA] Empty response from PHP');
      return {
        ok: false,
        error: 'Backend service returned empty response',
        httpStatus: 502,
      };
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(trimmedResponse);
      return {
        ok: response.ok,
        data,
        httpStatus: response.status,
      };
    } catch (parseError) {
      console.error('[MYSQL_USER_DATA] JSON parse failed:', trimmedResponse.substring(0, 500));
      return {
        ok: false,
        error: 'Backend service returned malformed JSON',
        httpStatus: 502,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[MYSQL_USER_DATA] Request timeout');
      return { ok: false, error: 'Request timeout - backend did not respond in time', httpStatus: 504 };
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
    console.error('[MYSQL_USER_DATA] Network error:', errorMessage);
    return { ok: false, error: `Network error: ${errorMessage}`, httpStatus: 503 };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body safely
    let requestBody: { action?: string; user_id?: string; email?: string };
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

    const { action, user_id, email } = requestBody;

    if (!action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Action is required', code: 'MISSING_ACTION' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[MYSQL_USER_DATA] Processing action: ${action} for user: ${user_id || email}`);

    // PHP proxy handles DB credentials internally
    const proxyUrl = 'https://www.amabilianetwork.com/api/get-user-data.php';

    const result = await safeFetchJson(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, user_id, email }),
    });

    // Handle fetch errors
    if (!result.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Backend service error',
          code: 'BACKEND_ERROR',
        }),
        { status: result.httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward successful response
    const data = result.data as Record<string, unknown>;
    
    // Normalize wallet balances to numbers if they're strings
    if (action === 'GET_WALLETS' && Array.isArray(data?.wallets)) {
      data.wallets = (data.wallets as Array<Record<string, unknown>>).map(wallet => ({
        ...wallet,
        balance: typeof wallet.balance === 'string' ? parseFloat(wallet.balance) || 0 : wallet.balance,
      }));
    }

    console.log('[MYSQL_USER_DATA] Success - returning data');

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MYSQL_USER_DATA] Unexpected error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
