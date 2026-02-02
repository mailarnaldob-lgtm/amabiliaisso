import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidAmount, sanitizeString } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Membership tier pricing per Blueprint V8.0
const TIER_PRICING: Record<string, number> = {
  pro: 300,
  expert: 600,
  elite: 900
};

// Payment submission validation
interface PaymentSubmissionInput {
  tier: string;
  paymentMethod: string;
  proofUrl?: string;
  referenceNumber?: string;
}

function validatePaymentSubmission(input: unknown): { success: boolean; data?: PaymentSubmissionInput; error?: string } {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { tier, paymentMethod, proofUrl, referenceNumber } = input as Record<string, unknown>;

  // Validate tier
  const validTiers = ['pro', 'expert', 'elite'];
  if (typeof tier !== 'string' || !validTiers.includes(tier.toLowerCase())) {
    return { success: false, error: 'Invalid membership tier. Choose pro, expert, or elite' };
  }

  // Validate payment method
  const validPaymentMethods = ['gcash', 'maya', 'bank_transfer'];
  if (typeof paymentMethod !== 'string' || !validPaymentMethods.includes(paymentMethod.toLowerCase())) {
    return { success: false, error: 'Invalid payment method. Use GCash, Maya, or Bank Transfer' };
  }

  // Validate proof URL if provided
  let sanitizedProofUrl: string | undefined;
  if (proofUrl) {
    if (typeof proofUrl !== 'string') {
      return { success: false, error: 'Invalid proof URL' };
    }
    sanitizedProofUrl = sanitizeString(proofUrl, 500);
  }

  // Validate reference number if provided
  let sanitizedReferenceNumber: string | undefined;
  if (referenceNumber) {
    if (typeof referenceNumber !== 'string') {
      return { success: false, error: 'Invalid reference number' };
    }
    sanitizedReferenceNumber = sanitizeString(referenceNumber, 50);
  }

  return {
    success: true,
    data: {
      tier: tier.toLowerCase(),
      paymentMethod: paymentMethod.toLowerCase(),
      proofUrl: sanitizedProofUrl,
      referenceNumber: sanitizedReferenceNumber
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
      console.error('[SUBMIT-PAYMENT] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const validation = validatePaymentSubmission(rawInput);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error, code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tier, paymentMethod, proofUrl, referenceNumber } = validation.data!;
    const amount = TIER_PRICING[tier];

    console.log(`[SUBMIT-PAYMENT] User ${userId} submitting payment for ${tier} tier: ₳${amount}`);

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SOVEREIGN V9.4: Rate limiting - 3 payment submissions per hour
    const { data: rateLimitResult, error: rateLimitError } = await supabaseAdmin.rpc('enforce_rate_limit', {
      p_user_id: userId,
      p_endpoint: 'submit-membership-payment',
      p_limit: 3,
      p_window_minutes: 60
    });

    if (rateLimitError) {
      console.error('[SUBMIT-PAYMENT] Rate limit check error:', rateLimitError);
    } else if (rateLimitResult) {
      console.warn(`[SUBMIT-PAYMENT] Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many payment submissions. Please wait 1 hour.', code: 'ERR_RATE_001' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's current membership
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('membership_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[SUBMIT-PAYMENT] Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'Profile not found', code: 'ERR_INVALID_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has this tier or higher
    const tierHierarchy = { pro: 1, expert: 2, elite: 3 };
    const currentTierLevel = profile.membership_tier ? tierHierarchy[profile.membership_tier as keyof typeof tierHierarchy] || 0 : 0;
    const requestedTierLevel = tierHierarchy[tier as keyof typeof tierHierarchy];

    if (currentTierLevel >= requestedTierLevel) {
      return new Response(
        JSON.stringify({ success: false, error: 'You already have this tier or higher', code: 'ERR_INVALID_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing pending payment for this tier
    const { data: existingPayment } = await supabaseAdmin
      .from('membership_payments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('tier', tier)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ success: false, error: 'You already have a pending payment for this tier', code: 'ERR_INVALID_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create membership payment record
    const { data: payment, error: insertError } = await supabaseAdmin
      .from('membership_payments')
      .insert({
        user_id: userId,
        tier: tier,
        amount: amount,
        payment_method: paymentMethod,
        proof_url: proofUrl || null,
        reference_number: referenceNumber || null,
        status: 'pending'
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('[SUBMIT-PAYMENT] Insert error:', insertError);
      const errorCode = mapDbErrorToCode(insertError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SUBMIT-PAYMENT] Payment record created: ${payment.id} for ${tier} tier`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment submitted successfully and pending admin approval',
        payment: {
          id: payment.id,
          tier: tier,
          amount: amount,
          paymentMethod: paymentMethod,
          status: 'pending',
          createdAt: payment.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SUBMIT-PAYMENT] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
