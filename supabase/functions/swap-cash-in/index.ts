import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSafeErrorMessage } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * SWAP CASH-IN - SOVEREIGN V10.0
 * Creates pending deposit requests for admin approval
 * - Min ₱100, Max ₱50,000
 * - JWT verification via getUser()
 */

interface CashInRequest {
  amount: number;
  payment_method: string;
  reference_number?: string;
  proof_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_001'), code: 'ERR_AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      console.error('[CASH-IN] JWT verification failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { amount, payment_method, reference_number, proof_url }: CashInRequest = body;

    // Input validation
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid amount provided', code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount < 100) {
      return new Response(
        JSON.stringify({ success: false, error: 'Minimum cash-in amount is ₱100', code: 'ERR_INVALID_002' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount > 50000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Maximum cash-in amount is ₱50,000', code: 'ERR_INVALID_002' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payment_method || typeof payment_method !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment method', code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedPaymentMethod = payment_method.slice(0, 50).replace(/[<>]/g, '');
    const sanitizedReference = reference_number 
      ? String(reference_number).slice(0, 100).replace(/[<>]/g, '') 
      : null;
    const sanitizedProofUrl = proof_url 
      ? String(proof_url).slice(0, 500) 
      : null;

    // SOVEREIGN V10.0: Create pending cash-in request instead of direct credit
    // The request will be reviewed by an admin before funds are credited
    const { data: insertResult, error: insertError } = await supabaseClient
      .from('cash_in_requests')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: sanitizedPaymentMethod,
        reference_number: sanitizedReference,
        proof_url: sanitizedProofUrl,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[CASH-IN] Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to submit request. Please try again.', code: 'ERR_SYSTEM_002' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CASH-IN] Request created: ${insertResult.id} - User ${user.id}, Amount ₳${amount}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          request_id: insertResult.id,
          amount_php: amount,
          amount_alpha: amount,
          payment_method: sanitizedPaymentMethod,
          reference_number: sanitizedReference,
          status: 'pending',
          message: 'Your deposit request has been submitted and is pending admin approval.'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CASH-IN] Error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: getSafeErrorMessage('ERR_SYSTEM_001'),
        code: 'ERR_SYSTEM_001'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
