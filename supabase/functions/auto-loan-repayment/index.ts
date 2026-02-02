import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * 28-DAY AUTO-REPAYMENT EDGE FUNCTION
 * Blueprint V8.0 Specification:
 * - Scans for expired loans (due_at < now())
 * - Executes atomic liquidation: pulls debt from borrower's wallet
 * - Credits lender with principal + interest
 * - Marks loan as 'defaulted' if borrower has insufficient funds
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

    console.log('Starting Auto Loan Repayment scan...')

    // Get all active loans that are past due
    const { data: expiredLoans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .eq('status', 'active')
      .lt('due_at', new Date().toISOString())

    if (loansError) {
      console.error('Error fetching expired loans:', loansError)
      throw new Error(`Failed to fetch expired loans: ${loansError.message}`)
    }

    if (!expiredLoans || expiredLoans.length === 0) {
      console.log('No expired loans found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired loans found',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${expiredLoans.length} expired loans`)

    let repaidCount = 0
    let defaultedCount = 0
    let totalRepaid = 0
    const errors: string[] = []

    // Process each expired loan
    for (const loan of expiredLoans) {
      try {
        const repaymentAmount = loan.total_repayment || (loan.principal_amount + (loan.interest_amount || 0))

        // Get borrower's main wallet
        const { data: borrowerWallet, error: borrowerWalletError } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('user_id', loan.borrower_id)
          .eq('wallet_type', 'main')
          .single()

        if (borrowerWalletError || !borrowerWallet) {
          console.error(`Borrower wallet not found for loan ${loan.id}`)
          errors.push(`Loan ${loan.id}: Borrower wallet not found`)
          continue
        }

        // Get lender's main wallet
        const { data: lenderWallet, error: lenderWalletError } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('user_id', loan.lender_id)
          .eq('wallet_type', 'main')
          .single()

        if (lenderWalletError || !lenderWallet) {
          console.error(`Lender wallet not found for loan ${loan.id}`)
          errors.push(`Loan ${loan.id}: Lender wallet not found`)
          continue
        }

        const borrowerBalance = borrowerWallet.balance || 0

        // Check if borrower has sufficient funds
        if (borrowerBalance >= repaymentAmount) {
          // ATOMIC LIQUIDATION: Borrower has funds
          console.log(`Auto-repaying loan ${loan.id}: ₳${repaymentAmount}`)

          // Deduct from borrower
          const { error: deductError } = await supabase
            .from('wallets')
            .update({ 
              balance: borrowerBalance - repaymentAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', borrowerWallet.id)

          if (deductError) {
            console.error(`Failed to deduct from borrower for loan ${loan.id}:`, deductError)
            errors.push(`Loan ${loan.id}: Failed to deduct from borrower`)
            continue
          }

          // Credit to lender
          const lenderBalance = lenderWallet.balance || 0
          const { error: creditError } = await supabase
            .from('wallets')
            .update({ 
              balance: lenderBalance + repaymentAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', lenderWallet.id)

          if (creditError) {
            console.error(`Failed to credit lender for loan ${loan.id}:`, creditError)
            // Rollback borrower deduction
            await supabase
              .from('wallets')
              .update({ balance: borrowerBalance })
              .eq('id', borrowerWallet.id)
            errors.push(`Loan ${loan.id}: Failed to credit lender, rolled back`)
            continue
          }

          // Update loan status to repaid
          const { error: loanUpdateError } = await supabase
            .from('loans')
            .update({ 
              status: 'repaid',
              repaid_at: new Date().toISOString()
            })
            .eq('id', loan.id)

          if (loanUpdateError) {
            console.error(`Failed to update loan status for ${loan.id}:`, loanUpdateError)
          }

          // Log transactions
          await supabase.from('loan_transactions').insert({
            loan_id: loan.id,
            user_id: loan.borrower_id,
            from_wallet_id: borrowerWallet.id,
            to_wallet_id: lenderWallet.id,
            amount: repaymentAmount,
            transaction_type: 'auto_repayment',
            description: `Auto-repayment executed on due date - ₳${repaymentAmount}`
          })

          await supabase.from('wallet_transactions').insert([
            {
              wallet_id: borrowerWallet.id,
              user_id: loan.borrower_id,
              amount: -repaymentAmount,
              transaction_type: 'auto_loan_repayment',
              description: `Auto loan repayment to lender`,
              reference_id: loan.id
            },
            {
              wallet_id: lenderWallet.id,
              user_id: loan.lender_id,
              amount: repaymentAmount,
              transaction_type: 'loan_auto_received',
              description: `Auto loan repayment from borrower`,
              reference_id: loan.id
            }
          ])

          repaidCount++
          totalRepaid += repaymentAmount
          console.log(`Loan ${loan.id} auto-repaid successfully`)

        } else {
          // PARTIAL LIQUIDATION / DEFAULT: Borrower lacks funds
          console.log(`Loan ${loan.id} defaulted: Borrower balance ₳${borrowerBalance} < ₳${repaymentAmount}`)

          // Take whatever the borrower has
          const partialAmount = borrowerBalance

          if (partialAmount > 0) {
            // Deduct all remaining balance from borrower
            await supabase
              .from('wallets')
              .update({ 
                balance: 0,
                updated_at: new Date().toISOString()
              })
              .eq('id', borrowerWallet.id)

            // Credit partial to lender
            const lenderBalance = lenderWallet.balance || 0
            await supabase
              .from('wallets')
              .update({ 
                balance: lenderBalance + partialAmount,
                updated_at: new Date().toISOString()
              })
              .eq('id', lenderWallet.id)

            // Log partial payment
            await supabase.from('wallet_transactions').insert([
              {
                wallet_id: borrowerWallet.id,
                user_id: loan.borrower_id,
                amount: -partialAmount,
                transaction_type: 'loan_partial_liquidation',
                description: `Partial liquidation on default - ₳${partialAmount} of ₳${repaymentAmount} owed`,
                reference_id: loan.id
              },
              {
                wallet_id: lenderWallet.id,
                user_id: loan.lender_id,
                amount: partialAmount,
                transaction_type: 'loan_partial_received',
                description: `Partial liquidation received - ₳${partialAmount} of ₳${repaymentAmount} owed`,
                reference_id: loan.id
              }
            ])
          }

          // Mark loan as defaulted
          await supabase
            .from('loans')
            .update({ status: 'defaulted' })
            .eq('id', loan.id)

          // Log default transaction
          await supabase.from('loan_transactions').insert({
            loan_id: loan.id,
            user_id: loan.borrower_id,
            amount: repaymentAmount,
            transaction_type: 'default',
            description: `Loan defaulted - Borrower had ₳${partialAmount} of ₳${repaymentAmount} required`
          })

          defaultedCount++
          console.log(`Loan ${loan.id} marked as defaulted`)
        }

      } catch (loanError) {
        console.error(`Error processing loan ${loan.id}:`, loanError)
        errors.push(`Loan ${loan.id}: ${loanError}`)
      }
    }

    console.log(`Auto Loan Repayment complete: ${repaidCount} repaid, ${defaultedCount} defaulted`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto Loan Repayment scan complete',
        totalExpiredLoans: expiredLoans.length,
        repaidCount,
        defaultedCount,
        totalRepaid,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auto Loan Repayment error:', error)
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
