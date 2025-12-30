import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Auto-deduction hierarchy: Task -> Royalty -> Main
const WALLET_PRIORITY = ['task', 'royalty', 'main'];

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

    const { loanId, useAutoDeduct = false } = await req.json();

    if (!loanId) {
      throw new Error('Loan ID is required');
    }

    console.log(`[REPAYMENT] User ${user.id} repaying loan: ${loanId}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the active loan
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .eq('borrower_id', user.id)
      .eq('status', 'active')
      .single();

    if (loanError || !loan) {
      throw new Error('Active loan not found');
    }

    const totalRepayment = parseFloat(loan.total_repayment);
    
    // Get all borrower wallets
    const { data: wallets, error: walletsError } = await supabaseAdmin
      .from('wallets')
      .select('id, wallet_type, balance')
      .eq('user_id', user.id);

    if (walletsError || !wallets) {
      throw new Error('Failed to fetch wallets');
    }

    // Create wallet map
    const walletMap = wallets.reduce((acc, w) => {
      acc[w.wallet_type] = { id: w.id, balance: parseFloat(w.balance) || 0 };
      return acc;
    }, {} as Record<string, { id: string; balance: number }>);

    // Get lender's main wallet for crediting
    const { data: lenderWallet, error: lenderWalletError } = await supabaseAdmin
      .from('wallets')
      .select('id, balance')
      .eq('user_id', loan.lender_id)
      .eq('wallet_type', 'main')
      .single();

    if (lenderWalletError || !lenderWallet) {
      throw new Error('Lender wallet not found');
    }

    let remainingAmount = totalRepayment;
    const deductions: Array<{ walletType: string; amount: number; walletId: string }> = [];

    if (useAutoDeduct) {
      // Auto-deduct from wallets in priority order
      for (const walletType of WALLET_PRIORITY) {
        if (remainingAmount <= 0) break;
        
        const wallet = walletMap[walletType];
        if (!wallet || wallet.balance <= 0) continue;

        const deductAmount = Math.min(wallet.balance, remainingAmount);
        deductions.push({ walletType, amount: deductAmount, walletId: wallet.id });
        remainingAmount -= deductAmount;
      }

      if (remainingAmount > 0) {
        throw new Error(`Insufficient funds across all wallets. Short by ₳${remainingAmount.toFixed(2)}`);
      }
    } else {
      // Default: deduct from main wallet only
      const mainWallet = walletMap['main'];
      if (!mainWallet || mainWallet.balance < totalRepayment) {
        throw new Error(`Insufficient balance in Main Wallet. Required: ₳${totalRepayment.toFixed(2)}, Available: ₳${(mainWallet?.balance || 0).toFixed(2)}`);
      }
      deductions.push({ walletType: 'main', amount: totalRepayment, walletId: mainWallet.id });
    }

    // Execute deductions
    for (const deduction of deductions) {
      const wallet = walletMap[deduction.walletType];
      const newBalance = wallet.balance - deduction.amount;
      
      const { error: deductError } = await supabaseAdmin
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', deduction.walletId);

      if (deductError) {
        console.error(`[REPAYMENT] Failed to deduct from ${deduction.walletType}:`, deductError);
        throw new Error('Repayment failed during deduction');
      }

      // Log deduction transaction
      await supabaseAdmin
        .from('loan_transactions')
        .insert({
          loan_id: loanId,
          user_id: user.id,
          transaction_type: useAutoDeduct ? 'auto_deduct' : 'repayment',
          amount: deduction.amount,
          from_wallet_id: deduction.walletId,
          to_wallet_id: lenderWallet.id,
          description: `Repayment from ${deduction.walletType} wallet`
        });

      // Log wallet transaction
      await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          wallet_id: deduction.walletId,
          user_id: user.id,
          amount: -deduction.amount,
          transaction_type: 'loan_repayment',
          description: `Loan repayment`,
          reference_id: loanId
        });
    }

    // Credit lender's wallet (principal + interest)
    const lenderNewBalance = parseFloat(lenderWallet.balance) + totalRepayment;
    const { error: creditError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: lenderNewBalance, updated_at: new Date().toISOString() })
      .eq('id', lenderWallet.id);

    if (creditError) {
      console.error('[REPAYMENT] Failed to credit lender:', creditError);
      throw new Error('Repayment failed during lender credit');
    }

    // Log lender credit
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: lenderWallet.id,
        user_id: loan.lender_id,
        amount: totalRepayment,
        transaction_type: 'loan_repaid',
        description: `Loan repaid with interest`,
        reference_id: loanId
      });

    // Update loan status
    const { error: updateError } = await supabaseAdmin
      .from('loans')
      .update({
        status: 'repaid',
        repaid_at: new Date().toISOString()
      })
      .eq('id', loanId);

    if (updateError) {
      console.error('[REPAYMENT] Failed to update loan status:', updateError);
    }

    console.log(`[REPAYMENT] Loan ${loanId} repaid successfully. Total: ₳${totalRepayment}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Loan repaid successfully',
        repayment: {
          loanId: loanId,
          principal: parseFloat(loan.principal_amount),
          interest: parseFloat(loan.interest_amount),
          totalPaid: totalRepayment,
          deductions: deductions.map(d => ({
            wallet: d.walletType,
            amount: d.amount
          }))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[REPAYMENT] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
