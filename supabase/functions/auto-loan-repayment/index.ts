import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'
import { corsHeaders, verifyCronSecret, log, logError } from '../_shared/api-utils.ts'

/**
 * 28-DAY AUTO-REPAYMENT EDGE FUNCTION - SOVEREIGN V10.0
 * Blueprint V8.0 Specification:
 * - Uses atomic RPC function `process_expired_loans()` for race-condition-free processing
 * - Advisory lock prevents concurrent execution
 * - FOR UPDATE SKIP LOCKED ensures safe row-level processing
 * - Runs as a cron job daily at 00:01 UTC
 * - PROTECTED: Requires CRON_SECRET header for authentication
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // SOVEREIGN V10.0: Verify CRON_SECRET header (critical security)
    const authError = verifyCronSecret(req, 'AUTO-LOAN-REPAYMENT');
    if (authError) {
      return authError;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    log('AUTO-LOAN-REPAYMENT', 'Starting atomic loan processing (authenticated cron job)')

    // Call the atomic RPC function that handles all race conditions
    const { data: result, error: rpcError } = await supabase.rpc('process_expired_loans')

    if (rpcError) {
      logError('AUTO-LOAN-REPAYMENT', 'RPC error', rpcError)
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

    if (!result?.success) {
      logError('AUTO-LOAN-REPAYMENT', 'Process failed', result?.error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result?.error || 'ERR_SYSTEM_002',
          message: 'Operation failed'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    log('AUTO-LOAN-REPAYMENT', `Complete: ${result.repaid_count} repaid, ${result.defaulted_count} defaulted, ₳${result.total_repaid} total`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto loan repayment scan complete',
        repaidCount: result.repaid_count,
        defaultedCount: result.defaulted_count,
        totalRepaid: result.total_repaid
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    logError('AUTO-LOAN-REPAYMENT', 'Unexpected error', error)
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