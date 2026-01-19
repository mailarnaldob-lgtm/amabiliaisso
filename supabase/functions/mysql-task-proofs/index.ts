import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    if (trimmedResponse.startsWith('<!DOCTYPE') || trimmedResponse.startsWith('<html') || trimmedResponse.startsWith('<')) {
      console.error('[TASK_PROOFS] PHP returned HTML');
      return { ok: false, error: 'Task proofs service returned error page', httpStatus: 503 };
    }
    
    if (!trimmedResponse) {
      return { ok: false, error: 'Empty response from task proofs service', httpStatus: 502 };
    }
    
    try {
      const data = JSON.parse(trimmedResponse);
      return { ok: response.ok, data, httpStatus: response.status };
    } catch {
      console.error('[TASK_PROOFS] Invalid JSON');
      return { ok: false, error: 'Invalid response from task proofs service', httpStatus: 502 };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, error: 'Request timeout', httpStatus: 504 };
    }
    return { ok: false, error: 'Network error', httpStatus: 503 };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      console.error('[TASK_PROOFS] Auth verification failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub;

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (!isAdmin) {
      console.error('[TASK_PROOFS] Non-admin access attempt');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required', code: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';

    console.log(`[TASK_PROOFS] Admin ${userId} fetching proofs with status: ${status}`);

    // For PHP compatibility, still pass session token from query params if provided
    const sessionToken = url.searchParams.get('session_token') || '';

    const result = await safeFetchJson('https://amabilianetwork.com/api/task-proofs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', status, session_token: sessionToken }),
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ success: false, error: result.error, code: 'SERVICE_ERROR' }),
        { status: result.httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const proofResult = result.data as { error?: string; proofs?: unknown[] };
    
    if (proofResult.error === 'Invalid session') {
      return new Response(
        JSON.stringify({ success: false, error: 'Session expired', code: 'SESSION_EXPIRED', session_invalid: true }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: proofResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[TASK_PROOFS] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
