import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidUUID, sanitizeString } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Task submission validation
interface TaskSubmissionInput {
  taskId: string;
  proofType: string;
  proofUrl?: string;
}

function validateTaskSubmission(input: unknown): { success: boolean; data?: TaskSubmissionInput; error?: string } {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { taskId, proofType, proofUrl } = input as Record<string, unknown>;

  // Validate task ID
  if (!isValidUUID(taskId)) {
    return { success: false, error: 'Invalid task ID format' };
  }

  // Validate proof type
  const validProofTypes = ['screenshot', 'link', 'code', 'none'];
  if (typeof proofType !== 'string' || !validProofTypes.includes(proofType)) {
    return { success: false, error: 'Invalid proof type' };
  }

  // Validate proof URL if provided
  let sanitizedProofUrl: string | undefined;
  if (proofUrl) {
    if (typeof proofUrl !== 'string') {
      return { success: false, error: 'Invalid proof URL' };
    }
    sanitizedProofUrl = sanitizeString(proofUrl, 500);
  }

  return {
    success: true,
    data: {
      taskId: taskId as string,
      proofType: proofType as string,
      proofUrl: sanitizedProofUrl
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
      console.error('[SUBMIT-TASK] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const validation = validateTaskSubmission(rawInput);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error, code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { taskId, proofType, proofUrl } = validation.data!;

    console.log(`[SUBMIT-TASK] User ${userId} submitting proof for task: ${taskId}`);

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SOVEREIGN V9.4: Rate limiting - 20 task submissions per hour
    const { data: rateLimitResult, error: rateLimitError } = await supabaseAdmin.rpc('enforce_rate_limit', {
      p_user_id: userId,
      p_endpoint: 'submit-task-proof',
      p_limit: 20,
      p_window_minutes: 60
    });

    if (rateLimitError) {
      console.error('[SUBMIT-TASK] Rate limit check error:', rateLimitError);
    } else if (rateLimitResult) {
      console.warn(`[SUBMIT-TASK] Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many task submissions. Please wait 1 hour.', code: 'ERR_RATE_001' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SOVEREIGN V12.0: Validate account is ACTIVE (has membership_tier)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('membership_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[SUBMIT-TASK] Profile lookup error:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unable to verify account status', code: 'ERR_AUTH_003' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is inactive (null membership_tier)
    if (!userProfile?.membership_tier) {
      console.warn(`[SUBMIT-TASK] Inactive account attempt: ${userId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Account inactive. Activation required to earn ₳.', 
          code: 'ERR_INACTIVE_001',
          requiresActivation: true 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if task exists and is active
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id, title, reward, is_active')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ success: false, error: 'Task not found', code: 'ERR_INVALID_001' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!task.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Task is no longer active', code: 'ERR_INVALID_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing pending submission
    const { data: existingSubmission } = await supabaseAdmin
      .from('task_submissions')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingSubmission) {
      return new Response(
        JSON.stringify({ success: false, error: 'You already have a pending submission for this task', code: 'ERR_INVALID_003' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create task submission
    const { data: submission, error: insertError } = await supabaseAdmin
      .from('task_submissions')
      .insert({
        task_id: taskId,
        user_id: userId,
        proof_type: proofType,
        proof_url: proofUrl || null,
        status: 'pending'
      })
      .select('id, submitted_at')
      .single();

    if (insertError) {
      console.error('[SUBMIT-TASK] Insert error:', insertError);
      const errorCode = mapDbErrorToCode(insertError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SUBMIT-TASK] Submission created: ${submission.id} for task ${task.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Task submission created successfully',
        submission: {
          id: submission.id,
          taskId: taskId,
          taskTitle: task.title,
          potentialReward: task.reward,
          status: 'pending',
          submittedAt: submission.submitted_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SUBMIT-TASK] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
