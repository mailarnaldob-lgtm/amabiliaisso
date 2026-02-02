import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidAmount } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
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
      console.error('[VAULT-DEPOSIT] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const { amount } = rawInput;

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!isValidAmount(parsedAmount, 0, 100000)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Amount must be between ₳100 and ₳100,000', code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (parsedAmount < 100) {
      return new Response(
        JSON.stringify({ success: false, error: 'Minimum vault deposit is ₳100', code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[VAULT-DEPOSIT] User ${userId} depositing ₳${parsedAmount} to vault`);

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call atomic vault deposit function
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('vault_deposit', {
      p_user_id: userId,
      p_amount: parsedAmount
    });

    if (rpcError) {
      console.error('[VAULT-DEPOSIT] RPC error:', rpcError);
      const errorCode = mapDbErrorToCode(rpcError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!result?.success) {
      console.error('[VAULT-DEPOSIT] Operation failed:', result?.error);
      return new Response(
        JSON.stringify({ success: false, error: result?.error || 'Deposit failed', code: 'ERR_SYSTEM_002' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[VAULT-DEPOSIT] Success: ₳${parsedAmount} deposited, new vault balance: ₳${result.new_vault_balance}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        amount: result.amount,
        newVaultBalance: result.new_vault_balance,
        newMainBalance: result.new_main_balance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[VAULT-DEPOSIT] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
