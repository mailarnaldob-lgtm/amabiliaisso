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
  proof_url?: string;
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
    const { amount, payment_method, reference_number, proof_url }: CashInRequest = body;

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
    const sanitizedProofUrl = proof_url 
      ? String(proof_url).slice(0, 500) 
      : null;

    // SOVEREIGN V9.3: Create pending cash-in request instead of direct credit
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
      throw new Error('Failed to submit request. Please try again.');
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
