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
      console.error('[APPROVE_PROOF] PHP returned HTML');
      return { ok: false, error: 'Approval service returned error page', httpStatus: 503 };
    }
    
    if (!trimmedResponse) {
      return { ok: false, error: 'Empty response from approval service', httpStatus: 502 };
    }
    
    try {
      const data = JSON.parse(trimmedResponse);
      return { ok: response.ok, data, httpStatus: response.status };
    } catch {
      return { ok: false, error: 'Invalid response from approval service', httpStatus: 502 };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, error: 'Approval request timeout', httpStatus: 504 };
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
      console.error('[APPROVE_PROOF] Auth verification failed');
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
      console.error('[APPROVE_PROOF] Non-admin access attempt');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required', code: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let requestBody: { proof_id?: string; session_token?: string };
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
        JSON.stringify({ success: false, error: 'Invalid request', code: 'INVALID_JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { proof_id, session_token } = requestBody;

    if (!proof_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'proof_id is required', code: 'MISSING_PROOF_ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[APPROVE_PROOF] Admin ${userId} approving proof: ${proof_id}`);

    const result = await safeFetchJson('https://amabilianetwork.com/api/approve-proof.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof_id, session_token: session_token || '' }),
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ success: false, error: result.error, code: 'SERVICE_ERROR' }),
        { status: result.httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const approvalResult = result.data as { success?: boolean; error?: string };
    
    if (approvalResult.error === 'Invalid session') {
      return new Response(
        JSON.stringify({ success: false, error: 'Session expired', code: 'SESSION_EXPIRED', session_invalid: true }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (approvalResult.success) {
      console.log(`[APPROVE_PROOF] Proof ${proof_id} approved successfully by admin ${userId}`);
      return new Response(
        JSON.stringify({ success: true, data: { message: 'Task proof approved and paid' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: approvalResult.error || 'Failed to approve proof', code: 'APPROVAL_FAILED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[APPROVE_PROOF] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
