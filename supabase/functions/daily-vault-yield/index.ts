import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'
import { corsHeaders, verifyCronSecret, log, logError } from '../_shared/api-utils.ts'

/**
 * DAILY VAULT YIELD EDGE FUNCTION - SOVEREIGN V10.0
 * Uses dedicated elite_vaults table for Elite members
 * - 1% DAILY yield on vault total_balance (including frozen collateral)
 * - Runs as a cron job every day at midnight UTC
 * - Uses atomic RPC function for yield calculation
 * - PROTECTED: Requires CRON_SECRET header for authentication
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // SOVEREIGN V10.0: Verify CRON_SECRET header (critical security)
    const authError = verifyCronSecret(req, 'DAILY-VAULT-YIELD');
    if (authError) {
      return authError;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    log('DAILY-VAULT-YIELD', 'Starting vault yield calculation (authenticated cron job)')

    // Use the atomic RPC function to calculate and distribute yields
    const { data: result, error: rpcError } = await supabase.rpc('calculate_vault_yield')

    if (rpcError) {
      logError('DAILY-VAULT-YIELD', 'RPC error', rpcError)
      throw new Error(`Failed to calculate vault yield: ${rpcError.message}`)
    }

    log('DAILY-VAULT-YIELD', `Complete: Processed ${result?.processed || 0} vaults, distributed ₳${result?.total_yield_distributed || 0}`)

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
    logError('DAILY-VAULT-YIELD', 'Unexpected error', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'ERR_SYSTEM_001',
        message: 'Service temporarily unavailable'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
