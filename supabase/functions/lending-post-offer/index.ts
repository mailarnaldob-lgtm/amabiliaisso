import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateLendingPostOffer } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Validate input with strict schema
    const rawInput = await req.json();
    const validation = validateLendingPostOffer(rawInput);
    
    if (!validation.success) {
      throw new Error(validation.error);
    }

    const { amount, termDays } = validation.data!;

    console.log(`[LENDING] User ${user.id} posting offer: ₳${amount} for ${termDays} days`);

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function with row-level locking to prevent race conditions
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('lending_post_offer', {
      p_user_id: user.id,
      p_principal_amount: amount,
      p_interest_rate: 3.00, // Fixed 3% per term
      p_term_days: termDays
    });

    if (rpcError) {
      console.error('[LENDING] RPC error:', rpcError);
      throw new Error('Failed to create lending offer: database error');
    }

    // Check if the database function returned an error
    if (!result?.success) {
      throw new Error(result?.error || 'Failed to create lending offer');
    }

    console.log(`[LENDING] Offer created: ${result.loan_id}, Amount: ₳${amount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lending offer posted successfully',
        loan: {
          id: result.loan_id,
          principal: result.principal_amount,
          interestRate: result.interest_rate,
          interestAmount: result.interest_amount,
          expectedReturn: result.total_repayment,
          termDays: result.term_days,
          processingFee: result.processing_fee
        },
        newBalance: result.new_balance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[LENDING] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
