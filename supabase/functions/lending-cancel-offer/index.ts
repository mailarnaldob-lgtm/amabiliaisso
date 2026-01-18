import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelOfferRequest {
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
    const body: CancelOfferRequest = await req.json();
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

    // Validate ownership
    if (loan.lender_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "You can only cancel your own offers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate loan state
    if (loan.status !== "pending") {
      return new Response(
        JSON.stringify({ success: false, error: "Only pending offers can be cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get lender's wallet
    const { data: wallet, error: walletError } = await adminSupabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .eq("wallet_type", "main")
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ success: false, error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update loan to cancelled
    const { error: updateLoanError } = await adminSupabase
      .from("loans")
      .update({ status: "cancelled" })
      .eq("id", loan_id);

    if (updateLoanError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to cancel loan offer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refund principal to lender's wallet (fee is non-refundable)
    const { error: refundError } = await adminSupabase
      .from("wallets")
      .update({
        balance: wallet.balance + loan.principal_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (refundError) {
      // Rollback
      await adminSupabase
        .from("loans")
        .update({ status: "pending" })
        .eq("id", loan_id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to refund wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log transaction
    await adminSupabase
      .from("loan_transactions")
      .insert({
        loan_id,
        user_id: user.id,
        to_wallet_id: wallet.id,
        amount: loan.principal_amount,
        transaction_type: "escrow_release",
        description: `Loan offer cancelled - ₳${loan.principal_amount} returned`,
      });

    await adminSupabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        amount: loan.principal_amount,
        transaction_type: "escrow_refund",
        description: `Escrow refund for cancelled loan offer`,
        reference_id: loan_id,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Loan offer cancelled successfully",
        refunded_amount: loan.principal_amount,
        new_balance: wallet.balance + loan.principal_amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in lending-cancel-offer:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
