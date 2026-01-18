import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostOfferRequest {
  principal_amount: number;
  interest_rate?: number;
  term_days?: number;
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
    // Fail open but log the error
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
    const body: PostOfferRequest = await req.json();
    const { principal_amount, interest_rate = 3.0, term_days = 7 } = body;

    // Validate input
    if (!principal_amount || principal_amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid principal amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (principal_amount < 100) {
      return new Response(
        JSON.stringify({ success: false, error: "Minimum lending amount is ₳100" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (principal_amount > 100000) {
      return new Response(
        JSON.stringify({ success: false, error: "Maximum lending amount is ₳100,000" }),
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
        JSON.stringify({ success: false, error: "Elite membership required for lending" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.is_kyc_verified) {
      return new Response(
        JSON.stringify({ success: false, error: "KYC verification required for lending" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's main wallet and lock it
    const { data: wallet, error: walletError } = await adminSupabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .eq("wallet_type", "main")
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ success: false, error: "Main wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check sufficient balance
    const processingFee = principal_amount * 0.008; // 0.8% fee
    const totalRequired = principal_amount + processingFee;

    if (wallet.balance < totalRequired) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Insufficient balance. You need ₳${totalRequired.toFixed(2)} (including 0.8% fee)` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate loan details
    const interestAmount = principal_amount * (interest_rate / 100);
    const totalRepayment = principal_amount + interestAmount;

    // Start transaction: deduct from wallet and create loan
    // 1. Update wallet balance
    const { error: updateWalletError } = await adminSupabase
      .from("wallets")
      .update({ 
        balance: wallet.balance - totalRequired,
        updated_at: new Date().toISOString()
      })
      .eq("id", wallet.id);

    if (updateWalletError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create loan record
    const { data: loan, error: loanError } = await adminSupabase
      .from("loans")
      .insert({
        lender_id: user.id,
        principal_amount,
        interest_rate,
        interest_amount: interestAmount,
        processing_fee: processingFee,
        total_repayment: totalRepayment,
        term_days,
        status: "pending",
        escrow_wallet_id: wallet.id,
      })
      .select()
      .single();

    if (loanError) {
      // Rollback wallet update
      await adminSupabase
        .from("wallets")
        .update({ 
          balance: wallet.balance,
          updated_at: new Date().toISOString()
        })
        .eq("id", wallet.id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to create loan offer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Log transaction
    await adminSupabase
      .from("loan_transactions")
      .insert({
        loan_id: loan.id,
        user_id: user.id,
        from_wallet_id: wallet.id,
        amount: principal_amount,
        transaction_type: "escrow_deposit",
        description: `Loan offer created - ₳${principal_amount} locked in escrow`,
      });

    // Log fee transaction
    await adminSupabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        amount: -processingFee,
        transaction_type: "lending_fee",
        description: `Lending processing fee (0.8%)`,
        reference_id: loan.id,
      });

    return new Response(
      JSON.stringify({
        success: true,
        loan: {
          id: loan.id,
          principal_amount,
          interest_rate,
          interest_amount: interestAmount,
          processing_fee: processingFee,
          total_repayment: totalRepayment,
          term_days,
          status: "pending",
        },
        new_balance: wallet.balance - totalRequired,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in lending-post-offer:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
