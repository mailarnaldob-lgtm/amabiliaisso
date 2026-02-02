import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateLendingTakeOffer } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
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
      throw new Error('Unauthorized');
    }

    // Validate input with strict schema
    const rawInput = await req.json();
    const validation = validateLendingTakeOffer(rawInput);
    
    if (!validation.success) {
      throw new Error(validation.error);
    }

    const { loanId } = validation.data!;

    console.log(`[LENDING] User ${userId} taking offer: ${loanId}`);

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function with row-level locking to prevent race conditions
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('lending_take_offer', {
      p_user_id: userId,
      p_loan_id: loanId
    });

    if (rpcError) {
      console.error('[LENDING] RPC error:', rpcError);
      throw new Error('Failed to accept loan offer: database error');
    }

    // Check if the database function returned an error
    if (!result?.success) {
      throw new Error(result?.error || 'Failed to accept loan offer');
    }

    console.log(`[LENDING] Loan ${loanId} accepted by ${userId}, Due: ${result.due_at}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Loan accepted successfully',
        loan: {
          id: result.loan_id,
          principal: result.principal_amount,
          interestAmount: result.interest_amount,
          totalRepayment: result.total_repayment,
          dueAt: result.due_at,
          termDays: result.term_days
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
