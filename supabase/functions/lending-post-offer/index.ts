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
    return { allowed: true, remaining: RATE_LIMIT_MAX_OPERATIONS };
  }
  
  const currentCount = count || 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_OPERATIONS - currentCount);
  
  return {
    allowed: currentCount < RATE_LIMIT_MAX_OPERATIONS,
    remaining,
  };
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // Validate input types
    if (typeof principal_amount !== 'number' || isNaN(principal_amount)) {
      return new Response(
        JSON.stringify({ success: false, error: "Principal amount must be a valid number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof interest_rate !== 'number' || isNaN(interest_rate)) {
      return new Response(
        JSON.stringify({ success: false, error: "Interest rate must be a valid number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof term_days !== 'number' || isNaN(term_days) || !Number.isInteger(term_days)) {
      return new Response(
        JSON.stringify({ success: false, error: "Term days must be a valid integer" }),
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

    // Call the atomic database function
    const { data, error } = await adminSupabase.rpc('lending_post_offer', {
      p_user_id: user.id,
      p_principal_amount: principal_amount,
      p_interest_rate: interest_rate,
      p_term_days: term_days,
    });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message || "Database operation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the RPC returned an error in the response
    if (!data.success) {
      const statusCode = data.error?.includes('Elite') || data.error?.includes('KYC') ? 403 : 400;
      return new Response(
        JSON.stringify({ success: false, error: data.error }),
        { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Loan offer created: ${data.loan_id} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        loan: {
          id: data.loan_id,
          principal_amount: data.principal_amount,
          interest_rate: data.interest_rate,
          interest_amount: data.interest_amount,
          processing_fee: data.processing_fee,
          total_repayment: data.total_repayment,
          term_days: data.term_days,
          status: "pending",
        },
        new_balance: data.new_balance,
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