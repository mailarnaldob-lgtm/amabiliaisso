import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashOutRequest {
  amount: number;
  payment_method: string;
  account_number: string;
  account_name: string;
}

// Configurable fee structure
const WITHDRAWAL_FEE_PERCENT = 2; // 2% fee
const MINIMUM_WITHDRAWAL = 500; // ₳500 minimum
const MAXIMUM_WITHDRAWAL = 100000; // ₳100,000 maximum

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
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

    const { amount, payment_method, account_number, account_name }: CashOutRequest = await req.json();

    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (amount < MINIMUM_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal is ₳${MINIMUM_WITHDRAWAL}`);
    }

    if (amount > MAXIMUM_WITHDRAWAL) {
      throw new Error(`Maximum withdrawal is ₳${MAXIMUM_WITHDRAWAL}`);
    }

    if (!payment_method || !account_number || !account_name) {
      throw new Error('Payment details are required');
    }

    // Use service role for wallet operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function with row-level locking to prevent race conditions
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('cash_out_with_lock', {
      p_user_id: user.id,
      p_amount: amount,
      p_fee_percent: WITHDRAWAL_FEE_PERCENT,
      p_payment_method: payment_method,
      p_account_name: account_name,
      p_account_number: account_number
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      throw new Error('Cash-out failed: database error');
    }

    // Check if the database function returned an error
    if (!result?.success) {
      throw new Error(result?.error || 'Cash-out failed');
    }

    console.log(`Cash-out successful: User ${user.id} burned ₳${amount}, disbursing ₱${result.net_amount} via ${payment_method}`);

    // TODO: Integrate with actual payment gateway (GCash/Maya/Bank API)
    // For now, we just log the request and mark it as pending
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transaction_id: result.transaction_id,
          amount_alpha: amount,
          fee_alpha: result.fee,
          net_php: result.net_amount,
          new_balance: result.new_balance,
          payment_method,
          account_name,
          account_number: account_number.replace(/\d(?=\d{4})/g, '*'), // Mask account number
          status: 'processing', // Will be updated when payment gateway confirms
          estimated_time: '1-24 hours'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Swap cash-out error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
