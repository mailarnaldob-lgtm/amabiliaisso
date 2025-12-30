import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { amount, termDays = 7 } = await req.json();

    // Validate amount
    const lendAmount = parseFloat(amount);
    if (isNaN(lendAmount) || lendAmount < 500) {
      throw new Error('Minimum lending amount is ₳500');
    }
    if (lendAmount > 50000) {
      throw new Error('Maximum lending amount is ₳50,000');
    }

    // Validate term
    if (![7, 14, 30].includes(termDays)) {
      throw new Error('Term must be 7, 14, or 30 days');
    }

    console.log(`[LENDING] User ${user.id} posting offer: ₳${lendAmount} for ${termDays} days`);

    // Check Elite membership and KYC
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('membership_tier, is_kyc_verified')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch profile');
    }

    if (profile.membership_tier !== 'elite') {
      throw new Error('Only Elite members can post lending offers');
    }

    if (!profile.is_kyc_verified) {
      throw new Error('KYC verification required for lending');
    }

    // Get user's main wallet
    const { data: mainWallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .eq('wallet_type', 'main')
      .single();

    if (walletError || !mainWallet) {
      throw new Error('Main wallet not found');
    }

    const currentBalance = parseFloat(mainWallet.balance) || 0;
    if (currentBalance < lendAmount) {
      throw new Error(`Insufficient balance. Available: ₳${currentBalance.toFixed(2)}`);
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Deduct from main wallet (escrow)
    const newBalance = currentBalance - lendAmount;
    const { error: deductError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', mainWallet.id);

    if (deductError) {
      console.error('[LENDING] Failed to escrow funds:', deductError);
      throw new Error('Failed to escrow funds');
    }

    // Create loan offer
    const interestRate = 3.00; // Fixed 3% per term
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('loans')
      .insert({
        lender_id: user.id,
        principal_amount: lendAmount,
        interest_rate: interestRate,
        term_days: termDays,
        status: 'pending',
        escrow_wallet_id: mainWallet.id
      })
      .select()
      .single();

    if (loanError) {
      // Rollback wallet deduction
      await supabaseAdmin
        .from('wallets')
        .update({ balance: currentBalance })
        .eq('id', mainWallet.id);
      
      console.error('[LENDING] Failed to create loan:', loanError);
      throw new Error('Failed to create lending offer');
    }

    // Log escrow transaction
    await supabaseAdmin
      .from('loan_transactions')
      .insert({
        loan_id: loan.id,
        user_id: user.id,
        transaction_type: 'escrow_lock',
        amount: lendAmount,
        from_wallet_id: mainWallet.id,
        description: `Escrow lock for lending offer #${loan.id.slice(0, 8)}`
      });

    // Log wallet transaction
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: mainWallet.id,
        user_id: user.id,
        amount: -lendAmount,
        transaction_type: 'lending_escrow',
        description: `Escrow for lending offer`,
        reference_id: loan.id
      });

    console.log(`[LENDING] Offer created: ${loan.id}, Amount: ₳${lendAmount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lending offer posted successfully',
        loan: {
          id: loan.id,
          principal: lendAmount,
          interestRate: interestRate,
          expectedReturn: lendAmount * (1 + interestRate / 100),
          termDays: termDays,
          processingFee: lendAmount * 0.008
        },
        newBalance: newBalance
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
