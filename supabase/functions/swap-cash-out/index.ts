import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateCashOut } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// SOVEREIGN V9.4: Fixed fee structure per Blueprint V8.0
const WITHDRAWAL_FEE_FLAT = 15; // ₳15 flat fee for external transfers

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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

    // Validate input with strict schema
    const rawInput = await req.json();
    const validation = validateCashOut(rawInput);
    
    if (!validation.success) {
      throw new Error(validation.error);
    }

    const { amount, payment_method, account_number, account_name } = validation.data!;

    // Check for pin_verified in raw input (optional field)
    const pinVerified = Boolean((rawInput as Record<string, unknown>).pin_verified);

    // Calculate fee and net amount
    const feeAmount = WITHDRAWAL_FEE_FLAT;
    const netAmount = amount - feeAmount;

    if (netAmount <= 0) {
      throw new Error(`Minimum withdrawal is ₳${feeAmount + 1} (after ₳${feeAmount} fee)`);
    }

    // SOVEREIGN V9.4: Rate limiting - 2 withdrawals per hour
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: rateLimitResult, error: rateLimitError } = await supabaseAdmin.rpc('enforce_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'swap-cash-out',
      p_limit: 2,
      p_window_minutes: 60
    });

    if (rateLimitError) {
      console.error('[CASH-OUT] Rate limit check error:', rateLimitError);
    } else if (rateLimitResult) {
      console.warn(`[CASH-OUT] Rate limit exceeded for user ${user.id}`);
      throw new Error('Too many withdrawal requests. Please wait 1 hour.');
    }

    // SOVEREIGN V9.4: Create pending cash-out request instead of direct deduction
    // The request will be reviewed by an admin before funds are deducted
    const { data: insertResult, error: insertError } = await supabaseClient
      .from('cash_out_requests')
      .insert({
        user_id: user.id,
        amount: amount,
        fee_amount: feeAmount,
        net_amount: netAmount,
        payment_method: payment_method,
        account_name: account_name,
        account_number: account_number,
        status: 'pending',
        pin_verified: pinVerified,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[CASH-OUT] Insert error:', insertError);
      throw new Error('Failed to submit request. Please try again.');
    }

    console.log(`[CASH-OUT] Request created: ${insertResult.id} - User ${user.id}, Amount ₳${amount}, Net ₱${netAmount}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          request_id: insertResult.id,
          amount_alpha: amount,
          fee_alpha: feeAmount,
          net_php: netAmount,
          payment_method,
          account_name,
          account_number: account_number.replace(/\d(?=\d{4})/g, '*'), // Mask account number
          status: 'pending',
          message: 'Your withdrawal request has been submitted and is pending admin approval (1-24 hours).'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Swap cash-out error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
