import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidUUID } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_001'), code: 'ERR_AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate token claims (JWT verification)
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      console.error('[LENDING-CANCEL] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const { loanId } = rawInput;

    if (!isValidUUID(loanId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid loan ID format', code: 'ERR_INVALID_004' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[LENDING-CANCEL] User ${userId} cancelling loan offer: ${loanId}`);

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function to cancel the loan offer
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('lending_cancel_offer', {
      p_user_id: userId,
      p_loan_id: loanId
    });

    if (rpcError) {
      console.error('[LENDING-CANCEL] RPC error:', rpcError);
      const errorCode = mapDbErrorToCode(rpcError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the database function returned an error
    if (!result?.success) {
      console.error('[LENDING-CANCEL] Operation failed:', result?.error);
      return new Response(
        JSON.stringify({ success: false, error: result?.error || 'Operation failed', code: 'ERR_LOAN_002' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[LENDING-CANCEL] Loan offer cancelled: ${loanId}, Refunded: ₳${result.refunded_amount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        refundedAmount: result.refunded_amount,
        newBalance: result.new_balance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[LENDING-CANCEL] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
