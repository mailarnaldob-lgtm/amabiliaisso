import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

/**
 * 28-DAY AUTO-REPAYMENT EDGE FUNCTION (V8.5 - ATOMIC)
 * Blueprint V8.0 Specification:
 * - Uses atomic RPC function `process_expired_loans()` for race-condition-free processing
 * - Advisory lock prevents concurrent execution
 * - FOR UPDATE SKIP LOCKED ensures safe row-level processing
 * - Runs as a cron job daily at 00:01 UTC
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[AUTO-REPAYMENT] Starting atomic loan processing...')

    // Call the atomic RPC function that handles all race conditions
    const { data: result, error: rpcError } = await supabase.rpc('process_expired_loans')

    if (rpcError) {
      console.error('[AUTO-REPAYMENT] RPC error:', rpcError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ERR_SYSTEM_001'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!result?.success) {
      console.error('[AUTO-REPAYMENT] Process failed:', result?.error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result?.error || 'ERR_SYSTEM_002'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[AUTO-REPAYMENT] Complete: ${result.repaid_count} repaid, ${result.defaulted_count} defaulted, ₳${result.total_repaid} total`)

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
    console.error('[AUTO-REPAYMENT] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'ERR_SYSTEM_001'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})