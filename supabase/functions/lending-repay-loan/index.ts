import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RepayLoanRequest {
  loan_id: string;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour
const RATE_LIMIT_MAX_OPERATIONS = 10; // Max 10 loan operations per hour

async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000);
  
  const { count, error } = await supabase
    .from('loan_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString());
  
  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: RATE_LIMIT_MAX_OPERATIONS };
  }
  
  const currentCount = count || 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_OPERATIONS - currentCount);
  
  return {
    allowed: currentCount < RATE_LIMIT_MAX_OPERATIONS,
    remaining,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: RepayLoanRequest = await req.json();
    const { loan_id } = body;

    // Validate input
    if (!loan_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Loan ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for privileged operations
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check rate limit
    const rateLimit = await checkRateLimit(adminSupabase, user.id);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_OPERATIONS} loan operations per hour. Try again later.` 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the loan
    const { data: loan, error: loanError } = await adminSupabase
      .from("loans")
      .select("*")
      .eq("id", loan_id)
      .single();

    if (loanError || !loan) {
      return new Response(
        JSON.stringify({ success: false, error: "Loan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate borrower ownership
    if (loan.borrower_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "You can only repay your own loans" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate loan state
    if (loan.status !== "active") {
      return new Response(
        JSON.stringify({ success: false, error: "Only active loans can be repaid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get borrower's main wallet
    const { data: borrowerWallet, error: borrowerWalletError } = await adminSupabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .eq("wallet_type", "main")
      .single();

    if (borrowerWalletError || !borrowerWallet) {
      return new Response(
        JSON.stringify({ success: false, error: "Borrower wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check sufficient balance for repayment
    const repaymentAmount = loan.total_repayment || (loan.principal_amount + (loan.interest_amount || 0));
    
    if (borrowerWallet.balance < repaymentAmount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Insufficient balance. You need ₳${repaymentAmount.toFixed(2)} to repay this loan.` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get lender's main wallet
    const { data: lenderWallet, error: lenderWalletError } = await adminSupabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", loan.lender_id)
      .eq("wallet_type", "main")
      .single();

    if (lenderWalletError || !lenderWallet) {
      return new Response(
        JSON.stringify({ success: false, error: "Lender wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct from borrower's wallet
    const { error: deductError } = await adminSupabase
      .from("wallets")
      .update({
        balance: borrowerWallet.balance - repaymentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", borrowerWallet.id);

    if (deductError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to deduct repayment from wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit lender's wallet
    const { error: creditError } = await adminSupabase
      .from("wallets")
      .update({
        balance: lenderWallet.balance + repaymentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lenderWallet.id);

    if (creditError) {
      // Rollback borrower deduction
      await adminSupabase
        .from("wallets")
        .update({
          balance: borrowerWallet.balance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", borrowerWallet.id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to credit lender wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update loan to repaid
    const { error: updateLoanError } = await adminSupabase
      .from("loans")
      .update({
        status: "repaid",
        repaid_at: new Date().toISOString(),
      })
      .eq("id", loan_id);

    if (updateLoanError) {
      // Rollback wallet changes
      await adminSupabase
        .from("wallets")
        .update({ balance: borrowerWallet.balance, updated_at: new Date().toISOString() })
        .eq("id", borrowerWallet.id);
      await adminSupabase
        .from("wallets")
        .update({ balance: lenderWallet.balance, updated_at: new Date().toISOString() })
        .eq("id", lenderWallet.id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to update loan status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log transactions
    await adminSupabase
      .from("loan_transactions")
      .insert({
        loan_id,
        user_id: user.id,
        from_wallet_id: borrowerWallet.id,
        to_wallet_id: lenderWallet.id,
        amount: repaymentAmount,
        transaction_type: "repayment",
        description: `Loan repaid - ₳${repaymentAmount.toFixed(2)} (Principal: ₳${loan.principal_amount}, Interest: ₳${loan.interest_amount || 0})`,
      });

    await adminSupabase
      .from("wallet_transactions")
      .insert([
        {
          wallet_id: borrowerWallet.id,
          user_id: user.id,
          amount: -repaymentAmount,
          transaction_type: "loan_repayment",
          description: `Loan repayment to lender`,
          reference_id: loan_id,
        },
        {
          wallet_id: lenderWallet.id,
          user_id: loan.lender_id,
          amount: repaymentAmount,
          transaction_type: "loan_received_repayment",
          description: `Loan repayment received from borrower`,
          reference_id: loan_id,
        },
      ]);

    console.log(`Loan ${loan_id} repaid successfully. Amount: ₳${repaymentAmount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Loan repaid successfully",
        repayment: {
          loan_id,
          principal_amount: loan.principal_amount,
          interest_amount: loan.interest_amount || 0,
          total_repaid: repaymentAmount,
        },
        new_balance: borrowerWallet.balance - repaymentAmount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in lending-repay-loan:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
