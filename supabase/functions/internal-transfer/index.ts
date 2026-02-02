import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidUUID, isValidAmount, sanitizeString } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Internal transfer validation
interface InternalTransferInput {
  recipientId: string;
  amount: number;
  note?: string;
}

function validateInternalTransfer(input: unknown): { success: boolean; data?: InternalTransferInput; error?: string } {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { recipientId, amount, note } = input as Record<string, unknown>;

  // Validate recipient ID
  if (!isValidUUID(recipientId)) {
    return { success: false, error: 'Invalid recipient ID format' };
  }

  // Validate amount
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isValidAmount(parsedAmount, 0, 100000)) {
    return { success: false, error: 'Amount must be between ₳1 and ₳100,000' };
  }

  if ((parsedAmount as number) < 50) {
    return { success: false, error: 'Minimum transfer amount is ₳50' };
  }

  // Sanitize note (optional) - max 200 chars per security guidelines
  const sanitizedNote = note ? sanitizeString(note, 200) : undefined;
  
  // Validate note doesn't exceed max length after sanitization
  if (sanitizedNote && sanitizedNote.length > 200) {
    return { success: false, error: 'Note is too long (max 200 characters)' };
  }

  return {
    success: true,
    data: {
      recipientId: recipientId as string,
      amount: parsedAmount as number,
      note: sanitizedNote
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_001'), code: 'ERR_AUTH_001' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate token claims (JWT verification)
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      console.error('[INTERNAL-TRANSFER] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const validation = validateInternalTransfer(rawInput);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error, code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { recipientId, amount, note } = validation.data!;

    // Prevent self-transfer
    if (userId === recipientId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot transfer to yourself', code: 'ERR_INVALID_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[INTERNAL-TRANSFER] User ${userId} transferring ₳${amount} to ${recipientId}`);

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SOVEREIGN V9.4: Rate limiting - 10 transfers per 5 minutes
    const { data: rateLimitResult, error: rateLimitError } = await supabaseAdmin.rpc('enforce_rate_limit', {
      p_user_id: userId,
      p_endpoint: 'internal-transfer',
      p_limit: 10,
      p_window_minutes: 5
    });

    if (rateLimitError) {
      console.error('[INTERNAL-TRANSFER] Rate limit check error:', rateLimitError);
    } else if (rateLimitResult) {
      console.warn(`[INTERNAL-TRANSFER] Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please wait 5 minutes.', code: 'ERR_RATE_001' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate fee (flat ₳5 per Blueprint V8.0)
    const transferFee = 5;

    // Use atomic database function with row-level locking
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('internal_transfer_atomic', {
      p_sender_id: userId,
      p_recipient_id: recipientId,
      p_amount: amount,
      p_fee: transferFee,
      p_note: note || null
    });

    if (rpcError) {
      console.error('[INTERNAL-TRANSFER] RPC error:', rpcError);
      const errorCode = mapDbErrorToCode(rpcError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the database function returned an error
    if (!result?.success) {
      console.error('[INTERNAL-TRANSFER] Operation failed:', result?.error);
      const errorCode = result?.error?.startsWith('ERR_') ? result.error : 'ERR_BALANCE_001';
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[INTERNAL-TRANSFER] Transfer successful: ₳${amount} + ₳${transferFee} fee`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transfer completed successfully',
        transactionId: result.transaction_id,
        amount: result.amount,
        fee: result.fee,
        senderNewBalance: result.sender_new_balance,
        recipientNewBalance: result.recipient_new_balance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[INTERNAL-TRANSFER] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
