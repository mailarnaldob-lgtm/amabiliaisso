import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TakeOfferRequest {
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
    const body: TakeOfferRequest = await req.json();
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

    // Check user's profile for Elite tier and KYC
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("membership_tier, is_kyc_verified, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.membership_tier !== "elite") {
      return new Response(
        JSON.stringify({ success: false, error: "Elite membership required for borrowing" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.is_kyc_verified) {
      return new Response(
        JSON.stringify({ success: false, error: "KYC verification required for borrowing" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the loan offer
    const { data: loan, error: loanError } = await adminSupabase
      .from("loans")
      .select("*")
      .eq("id", loan_id)
      .single();

    if (loanError || !loan) {
      return new Response(
        JSON.stringify({ success: false, error: "Loan offer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate loan state
    if (loan.status !== "pending") {
      return new Response(
        JSON.stringify({ success: false, error: "Loan offer is no longer available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (loan.lender_id === user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "You cannot borrow from your own offer" }),
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

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loan.term_days);

    // Update loan to active
    const { error: updateLoanError } = await adminSupabase
      .from("loans")
      .update({
        borrower_id: user.id,
        status: "active",
        accepted_at: new Date().toISOString(),
        due_at: dueDate.toISOString(),
      })
      .eq("id", loan_id);

    if (updateLoanError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to accept loan offer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit borrower's wallet with principal
    const { error: creditError } = await adminSupabase
      .from("wallets")
      .update({
        balance: borrowerWallet.balance + loan.principal_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", borrowerWallet.id);

    if (creditError) {
      // Rollback loan status
      await adminSupabase
        .from("loans")
        .update({
          borrower_id: null,
          status: "pending",
          accepted_at: null,
          due_at: null,
        })
        .eq("id", loan_id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to credit borrower wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log transaction
    await adminSupabase
      .from("loan_transactions")
      .insert({
        loan_id,
        user_id: user.id,
        to_wallet_id: borrowerWallet.id,
        amount: loan.principal_amount,
        transaction_type: "disbursement",
        description: `Loan disbursed - ₳${loan.principal_amount}`,
      });

    await adminSupabase
      .from("wallet_transactions")
      .insert({
        wallet_id: borrowerWallet.id,
        user_id: user.id,
        amount: loan.principal_amount,
        transaction_type: "loan_received",
        description: `Loan received`,
        reference_id: loan_id,
      });

    return new Response(
      JSON.stringify({
        success: true,
        loan: {
          id: loan_id,
          principal_amount: loan.principal_amount,
          interest_amount: loan.interest_amount,
          total_repayment: loan.total_repayment,
          due_at: dueDate.toISOString(),
        },
        new_balance: borrowerWallet.balance + loan.principal_amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in lending-take-offer:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
