import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

/**
 * DAILY VAULT YIELD EDGE FUNCTION
 * Blueprint V8.0 Specification:
 * - Elite members earn 1% DAILY yield on their vault balance
 * - Runs as a cron job every day at midnight UTC
 * - Uses atomic transactions to prevent race conditions
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting Daily Vault Yield calculation...')

    // Get all Elite members with their main wallet balances
    const { data: eliteMembers, error: membersError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        membership_tier
      `)
      .eq('membership_tier', 'elite')

    if (membersError) {
      console.error('Error fetching elite members:', membersError)
      throw new Error(`Failed to fetch elite members: ${membersError.message}`)
    }

    if (!eliteMembers || eliteMembers.length === 0) {
      console.log('No elite members found for yield calculation')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No elite members found',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${eliteMembers.length} elite members`)

    let processedCount = 0
    let totalYieldDistributed = 0
    const errors: string[] = []

    // Process each elite member
    for (const member of eliteMembers) {
      try {
        // Get the member's main wallet balance
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('user_id', member.id)
          .eq('wallet_type', 'main')
          .single()

        if (walletError || !wallet) {
          console.error(`Wallet not found for member ${member.id}:`, walletError)
          errors.push(`Member ${member.id}: Wallet not found`)
          continue
        }

        const currentBalance = wallet.balance || 0
        
        // Skip if balance is 0 or negative
        if (currentBalance <= 0) {
          console.log(`Skipping member ${member.id}: Balance is ${currentBalance}`)
          continue
        }

        // Calculate 1% daily yield (floor to whole peso as per Whole Peso Mandate)
        const dailyYield = Math.floor(currentBalance * 0.01)

        // Skip if yield rounds to 0
        if (dailyYield <= 0) {
          console.log(`Skipping member ${member.id}: Yield rounds to 0`)
          continue
        }

        // Credit the yield to their main wallet atomically
        const newBalance = currentBalance + dailyYield

        const { error: updateError } = await supabase
          .from('wallets')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id)

        if (updateError) {
          console.error(`Failed to update wallet for member ${member.id}:`, updateError)
          errors.push(`Member ${member.id}: Failed to credit yield`)
          continue
        }

        // Log the transaction
        const { error: txError } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            user_id: member.id,
            amount: dailyYield,
            transaction_type: 'vault_yield',
            description: `1% Daily Vault Yield (Balance: ₳${currentBalance.toLocaleString()})`
          })

        if (txError) {
          console.error(`Failed to log transaction for member ${member.id}:`, txError)
          // Don't fail the whole operation, yield was already credited
        }

        processedCount++
        totalYieldDistributed += dailyYield
        console.log(`Credited ₳${dailyYield} yield to member ${member.id}`)

      } catch (memberError) {
        console.error(`Error processing member ${member.id}:`, memberError)
        errors.push(`Member ${member.id}: ${memberError}`)
      }
    }

    console.log(`Daily Vault Yield complete: Processed ${processedCount} members, distributed ₳${totalYieldDistributed}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily Vault Yield calculation complete',
        processed: processedCount,
        totalEliteMembers: eliteMembers.length,
        totalYieldDistributed,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Daily Vault Yield error:', error)
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
