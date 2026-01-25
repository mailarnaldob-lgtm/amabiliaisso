import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  accountName: string;
  qrCodeUrl: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized Sovereign Access" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client using user's JWT - RLS policies will apply
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    // Verify the user's JWT is valid
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid Sovereign Credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch payment methods using user's JWT - RLS policy allows authenticated users
    // Policy: "Authenticated users can view payment methods" (key = 'payment_methods')
    const { data, error } = await supabaseUser
      .from("system_settings")
      .select("value")
      .eq("key", "payment_methods")
      .single();

    if (error) {
      console.error("RLS access denied or data not found:", error);
      return new Response(
        JSON.stringify({ error: "Unauthorized Sovereign Access - Insufficient Clearance" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return payment methods
    const paymentMethods = Array.isArray(data?.value) ? data.value : [];

    return new Response(
      JSON.stringify({ success: true, data: paymentMethods }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Sovereign System Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
