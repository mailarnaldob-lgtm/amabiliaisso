import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

/**
 * DAILY VAULT YIELD EDGE FUNCTION - Blueprint V8.0
 * Uses dedicated elite_vaults table for Elite members
 * - 1% DAILY yield on vault total_balance (including frozen collateral)
 * - Runs as a cron job every day at midnight UTC
 * - Uses atomic RPC function for yield calculation
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[DAILY-VAULT-YIELD] Starting vault yield calculation...')

    // Use the atomic RPC function to calculate and distribute yields
    const { data: result, error: rpcError } = await supabase.rpc('calculate_vault_yield')

    if (rpcError) {
      console.error('[DAILY-VAULT-YIELD] RPC error:', rpcError)
      throw new Error(`Failed to calculate vault yield: ${rpcError.message}`)
    }

    console.log(`[DAILY-VAULT-YIELD] Complete: Processed ${result?.processed || 0} vaults, distributed ₳${result?.total_yield_distributed || 0}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily Vault Yield calculation complete',
        processed: result?.processed || 0,
        totalYieldDistributed: result?.total_yield_distributed || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[DAILY-VAULT-YIELD] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
