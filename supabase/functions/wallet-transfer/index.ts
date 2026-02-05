import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWalletTransfer } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * WALLET TRANSFER - SOVEREIGN V10.0
 * Allows users to transfer funds between their own wallets
 * - Uses atomic RPC for race-condition-free processing
 * - JWT verification via getClaims()
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_001'), code: 'ERR_AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      console.error('[WALLET-TRANSFER] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with strict schema
    const rawInput = await req.json();
    const validation = validateWalletTransfer(rawInput);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error, code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { from_wallet_type, to_wallet_type, amount } = validation.data!;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function with row-level locking to prevent race conditions
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('transfer_with_lock', {
      p_user_id: userId,
      p_from_type: from_wallet_type,
      p_to_type: to_wallet_type,
      p_amount: amount
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      const errorCode = mapDbErrorToCode(rpcError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the database function returned an error
    if (!result?.success) {
      console.error('[WALLET-TRANSFER] Operation failed:', result?.error);
      const errorCode = result?.error?.startsWith('ERR_') ? result.error : 'ERR_BALANCE_001';
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Transfer successful: User ${userId} moved ₳${amount} from ${from_wallet_type} to ${to_wallet_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          amount,
          from_wallet: { type: from_wallet_type, new_balance: result.from_balance },
          to_wallet: { type: to_wallet_type, new_balance: result.to_balance }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Wallet transfer error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
