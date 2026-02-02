import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CashInRequest {
  amount: number;
  payment_method: string;
  reference_number?: string;
}

// Safe error messages for clients
const ERROR_MESSAGES: Record<string, string> = {
  'INVALID_AMOUNT': 'Invalid amount provided',
  'MIN_AMOUNT': 'Minimum cash-in amount is ₱100',
  'MAX_AMOUNT': 'Maximum cash-in amount is ₱50,000',
  'WALLET_NOT_FOUND': 'Wallet not found. Please contact support.',
  'UNAUTHORIZED': 'Authentication required',
  'UNKNOWN': 'An error occurred. Please try again.',
};

function getSafeErrorMessage(error: string): string {
  if (error.includes('Minimum')) return ERROR_MESSAGES.MIN_AMOUNT;
  if (error.includes('Maximum')) return ERROR_MESSAGES.MAX_AMOUNT;
  if (error.includes('Invalid')) return ERROR_MESSAGES.INVALID_AMOUNT;
  if (error.includes('not found')) return ERROR_MESSAGES.WALLET_NOT_FOUND;
  if (error.includes('Unauthorized')) return ERROR_MESSAGES.UNAUTHORIZED;
  return ERROR_MESSAGES.UNKNOWN;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const { amount, payment_method, reference_number }: CashInRequest = body;

    // Input validation
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (amount < 100) {
      throw new Error('Minimum cash-in amount is ₱100');
    }

    if (amount > 50000) {
      throw new Error('Maximum cash-in amount is ₱50,000');
    }

    if (!payment_method || typeof payment_method !== 'string') {
      throw new Error('Invalid payment method');
    }

    // Sanitize inputs
    const sanitizedPaymentMethod = payment_method.slice(0, 50).replace(/[<>]/g, '');
    const sanitizedReference = reference_number 
      ? String(reference_number).slice(0, 100).replace(/[<>]/g, '') 
      : null;

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call atomic RPC function to prevent race conditions
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('cash_in_with_lock', {
      p_user_id: user.id,
      p_amount: amount,
      p_payment_method: sanitizedPaymentMethod,
      p_reference_number: sanitizedReference
    });

    if (rpcError) {
      console.error('[CASH-IN] RPC error:', rpcError);
      throw new Error('Transaction failed. Please try again.');
    }

    const rpcResult = result as { success: boolean; error?: string; transaction_id?: string; amount?: number; new_balance?: number };

    if (!rpcResult.success) {
      throw new Error(rpcResult.error || 'Transaction failed');
    }

    console.log(`[CASH-IN] Success: User ${user.id} credited ₳${amount} via ${sanitizedPaymentMethod}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transaction_id: rpcResult.transaction_id,
          amount_php: amount,
          amount_alpha: amount,
          new_balance: rpcResult.new_balance,
          payment_method: sanitizedPaymentMethod,
          reference_number: sanitizedReference
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const safeMessage = getSafeErrorMessage(errorMessage);
    
    console.error('[CASH-IN] Error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: safeMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
