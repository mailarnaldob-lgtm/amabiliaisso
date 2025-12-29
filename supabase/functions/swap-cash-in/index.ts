import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashInRequest {
  amount: number;
  payment_method: string;
  reference_number?: string;
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

    const { amount, payment_method, reference_number }: CashInRequest = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (amount < 100) {
      throw new Error('Minimum cash-in amount is ₱100');
    }

    if (amount > 50000) {
      throw new Error('Maximum cash-in amount is ₱50,000');
    }

    // Use service role for wallet operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's main wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .eq('wallet_type', 'main')
      .single();

    if (walletError || !wallet) {
      console.error('Wallet fetch error:', walletError);
      throw new Error('Main wallet not found');
    }

    // Calculate the ₳ amount (1:1 peg with PHP, no fee on cash-in)
    const alphaAmount = amount;
    const newBalance = (wallet.balance || 0) + alphaAmount;

    // Start transaction: Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Wallet update error:', updateError);
      throw new Error('Failed to update wallet balance');
    }

    // Log the transaction
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        amount: alphaAmount,
        transaction_type: 'cash_in',
        description: `Cash-in via ${payment_method}${reference_number ? ` (Ref: ${reference_number})` : ''}`
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction log error:', txError);
      // Rollback wallet update
      await supabaseAdmin
        .from('wallets')
        .update({ 
          balance: wallet.balance,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);
      throw new Error('Failed to log transaction');
    }

    console.log(`Cash-in successful: User ${user.id} minted ₳${alphaAmount} via ${payment_method}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transaction_id: transaction.id,
          amount_php: amount,
          amount_alpha: alphaAmount,
          new_balance: newBalance,
          payment_method,
          reference_number
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Swap cash-in error:', error);
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
