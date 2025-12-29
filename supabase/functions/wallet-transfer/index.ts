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

    // Get user's wallets
    const { data: wallets, error: walletsError } = await supabaseAdmin
      .from('wallets')
      .select('id, wallet_type, balance')
      .eq('user_id', user.id);

    if (walletsError || !wallets) {
      throw new Error('Failed to fetch wallets');
    }

    const fromWallet = wallets.find(w => w.wallet_type === from_wallet_type);
    const toWallet = wallets.find(w => w.wallet_type === to_wallet_type);

    if (!fromWallet || !toWallet) {
      throw new Error('Wallet not found');
    }

    if ((fromWallet.balance || 0) < amount) {
      throw new Error('Insufficient balance');
    }

    // Perform transfer
    const fromNewBalance = (fromWallet.balance || 0) - amount;
    const toNewBalance = (toWallet.balance || 0) + amount;

    // Update source wallet
    const { error: fromUpdateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: fromNewBalance, updated_at: new Date().toISOString() })
      .eq('id', fromWallet.id);

    if (fromUpdateError) {
      throw new Error('Failed to update source wallet');
    }

    // Update destination wallet
    const { error: toUpdateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: toNewBalance, updated_at: new Date().toISOString() })
      .eq('id', toWallet.id);

    if (toUpdateError) {
      // Rollback source wallet
      await supabaseAdmin
        .from('wallets')
        .update({ balance: fromWallet.balance, updated_at: new Date().toISOString() })
        .eq('id', fromWallet.id);
      throw new Error('Failed to update destination wallet');
    }

    // Log transactions
    await supabaseAdmin.from('wallet_transactions').insert([
      {
        wallet_id: fromWallet.id,
        user_id: user.id,
        amount: -amount,
        transaction_type: 'transfer_out',
        description: `Transfer to ${to_wallet_type} wallet`
      },
      {
        wallet_id: toWallet.id,
        user_id: user.id,
        amount: amount,
        transaction_type: 'transfer_in',
        description: `Transfer from ${from_wallet_type} wallet`
      }
    ]);

    console.log(`Transfer successful: User ${user.id} moved ₳${amount} from ${from_wallet_type} to ${to_wallet_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          amount,
          from_wallet: { type: from_wallet_type, new_balance: fromNewBalance },
          to_wallet: { type: to_wallet_type, new_balance: toNewBalance }
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
