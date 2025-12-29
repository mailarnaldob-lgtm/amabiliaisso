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

    // Check sufficient balance
    if ((wallet.balance || 0) < amount) {
      throw new Error('Insufficient balance');
    }

    // Calculate fee and net amount
    const fee = amount * (WITHDRAWAL_FEE_PERCENT / 100);
    const netPhpAmount = amount - fee;
    const newBalance = (wallet.balance || 0) - amount;

    // Update wallet balance (burn ₳)
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

    // Log the withdrawal transaction
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        amount: -amount, // Negative for withdrawals
        transaction_type: 'cash_out',
        description: `Cash-out to ${payment_method} (${account_name} - ${account_number}) | Fee: ₳${fee.toFixed(2)}`
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

    // Log the fee transaction separately
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        amount: -fee,
        transaction_type: 'withdrawal_fee',
        description: `Withdrawal fee (${WITHDRAWAL_FEE_PERCENT}%)`,
        reference_id: transaction.id
      });

    console.log(`Cash-out successful: User ${user.id} burned ₳${amount}, disbursing ₱${netPhpAmount} via ${payment_method}`);

    // TODO: Integrate with actual payment gateway (GCash/Maya/Bank API)
    // For now, we just log the request and mark it as pending
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transaction_id: transaction.id,
          amount_alpha: amount,
          fee_alpha: fee,
          net_php: netPhpAmount,
          new_balance: newBalance,
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
