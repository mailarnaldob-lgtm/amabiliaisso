import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  from_wallet_type: 'task' | 'royalty' | 'main';
  to_wallet_type: 'task' | 'royalty' | 'main';
  amount: number;
}

serve(async (req) => {
  // Handle CORS preflight
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { from_wallet_type, to_wallet_type, amount }: TransferRequest = await req.json();

    // Validate inputs
    if (!from_wallet_type || !to_wallet_type || !amount) {
      throw new Error('Missing required fields');
    }

    if (from_wallet_type === to_wallet_type) {
      throw new Error('Cannot transfer to the same wallet');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function with row-level locking to prevent race conditions
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('transfer_with_lock', {
      p_user_id: user.id,
      p_from_type: from_wallet_type,
      p_to_type: to_wallet_type,
      p_amount: amount
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      throw new Error('Transfer failed: database error');
    }

    // Check if the database function returned an error
    if (!result?.success) {
      throw new Error(result?.error || 'Transfer failed');
    }

    console.log(`Transfer successful: User ${user.id} moved ₳${amount} from ${from_wallet_type} to ${to_wallet_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          amount,
          from_wallet: { type: from_wallet_type, new_balance: result.from_balance },
          to_wallet: { type: to_wallet_type, new_balance: result.to_balance }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Wallet transfer error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
