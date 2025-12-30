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

    const { loanId } = await req.json();

    if (!loanId) {
      throw new Error('Loan ID is required');
    }

    console.log(`[LENDING] User ${user.id} taking offer: ${loanId}`);

    // Check Elite membership and KYC for borrower
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('membership_tier, is_kyc_verified')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch profile');
    }

    if (profile.membership_tier !== 'elite') {
      throw new Error('Only Elite members can borrow');
    }

    if (!profile.is_kyc_verified) {
      throw new Error('KYC verification required for borrowing');
    }

    // Use service role for operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the loan offer
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .eq('status', 'pending')
      .single();

    if (loanError || !loan) {
      throw new Error('Loan offer not found or already taken');
    }

    // Cannot borrow from yourself
    if (loan.lender_id === user.id) {
      throw new Error('Cannot borrow from your own offer');
    }

    // Check if borrower has existing active loans
    const { data: existingLoans } = await supabaseAdmin
      .from('loans')
      .select('id')
      .eq('borrower_id', user.id)
      .eq('status', 'active');

    if (existingLoans && existingLoans.length >= 3) {
      throw new Error('Maximum 3 active loans allowed');
    }

    // Get borrower's main wallet
    const { data: borrowerWallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .eq('wallet_type', 'main')
      .single();

    if (walletError || !borrowerWallet) {
      throw new Error('Borrower wallet not found');
    }

    // Calculate due date
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + loan.term_days);

    // Update loan status to active
    const { error: updateError } = await supabaseAdmin
      .from('loans')
      .update({
        borrower_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
        due_at: dueAt.toISOString()
      })
      .eq('id', loanId)
      .eq('status', 'pending'); // Ensure still pending (race condition protection)

    if (updateError) {
      console.error('[LENDING] Failed to update loan:', updateError);
      throw new Error('Failed to accept loan offer');
    }

    // Credit borrower's main wallet
    const newBalance = parseFloat(borrowerWallet.balance) + parseFloat(loan.principal_amount);
    const { error: creditError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', borrowerWallet.id);

    if (creditError) {
      // Rollback loan status
      await supabaseAdmin
        .from('loans')
        .update({ borrower_id: null, status: 'pending', accepted_at: null, due_at: null })
        .eq('id', loanId);
      
      console.error('[LENDING] Failed to credit borrower:', creditError);
      throw new Error('Failed to disburse loan');
    }

    // Log disbursement transaction
    await supabaseAdmin
      .from('loan_transactions')
      .insert({
        loan_id: loanId,
        user_id: user.id,
        transaction_type: 'disbursement',
        amount: parseFloat(loan.principal_amount),
        from_wallet_id: loan.escrow_wallet_id,
        to_wallet_id: borrowerWallet.id,
        description: `Loan disbursement from offer #${loanId.slice(0, 8)}`
      });

    // Log wallet transaction for borrower
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: borrowerWallet.id,
        user_id: user.id,
        amount: parseFloat(loan.principal_amount),
        transaction_type: 'loan_received',
        description: `Loan received`,
        reference_id: loanId
      });

    console.log(`[LENDING] Loan ${loanId} accepted by ${user.id}, Due: ${dueAt.toISOString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Loan accepted successfully',
        loan: {
          id: loanId,
          principal: parseFloat(loan.principal_amount),
          interestAmount: parseFloat(loan.interest_amount),
          totalRepayment: parseFloat(loan.total_repayment),
          dueAt: dueAt.toISOString(),
          termDays: loan.term_days
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
