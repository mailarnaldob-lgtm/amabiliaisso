import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isValidAmount, sanitizeString } from "../_shared/validation.ts";
import { getSafeErrorMessage, mapDbErrorToCode } from "../_shared/error-codes.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Campaign creation validation
interface CreateCampaignInput {
  title: string;
  description: string;
  campaignType: string;
  targetUrl: string;
  proofType: string;
  rewardPerTask: number;
  totalBudget: number;
  maxCompletions: number;
  requiredLevel: string;
  expiresDays: number;
}

function validateCreateCampaign(input: unknown): { success: boolean; data?: CreateCampaignInput; error?: string } {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const {
    title,
    description,
    campaignType,
    targetUrl,
    proofType,
    rewardPerTask,
    totalBudget,
    maxCompletions,
    requiredLevel = 'pro',
    expiresDays = 30
  } = input as Record<string, unknown>;

  // Validate title
  if (typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 100) {
    return { success: false, error: 'Title must be 5-100 characters' };
  }

  // Validate description
  if (typeof description !== 'string' || description.trim().length < 20 || description.trim().length > 500) {
    return { success: false, error: 'Description must be 20-500 characters' };
  }

  // Validate campaign type
  const validCampaignTypes = ['social_engagement', 'youtube_subscribe', 'youtube_watch', 'website_visit', 'app_download', 'survey'];
  if (typeof campaignType !== 'string' || !validCampaignTypes.includes(campaignType)) {
    return { success: false, error: 'Invalid campaign type' };
  }

  // Validate target URL
  if (typeof targetUrl !== 'string') {
    return { success: false, error: 'Target URL is required' };
  }
  try {
    new URL(targetUrl);
  } catch {
    return { success: false, error: 'Invalid target URL format' };
  }

  // Validate proof type
  const validProofTypes = ['screenshot', 'link', 'code', 'none'];
  if (typeof proofType !== 'string' || !validProofTypes.includes(proofType)) {
    return { success: false, error: 'Invalid proof type' };
  }

  // Validate reward per task
  const parsedReward = typeof rewardPerTask === 'string' ? parseFloat(rewardPerTask) : rewardPerTask;
  if (!isValidAmount(parsedReward, 0, 1000)) {
    return { success: false, error: 'Reward per task must be between ₳1 and ₳1,000' };
  }
  if ((parsedReward as number) < 1) {
    return { success: false, error: 'Minimum reward per task is ₳1' };
  }

  // Validate total budget
  const parsedBudget = typeof totalBudget === 'string' ? parseFloat(totalBudget) : totalBudget;
  if (!isValidAmount(parsedBudget, 0, 100000)) {
    return { success: false, error: 'Total budget must be between ₳100 and ₳100,000' };
  }
  if ((parsedBudget as number) < 100) {
    return { success: false, error: 'Minimum campaign budget is ₳100' };
  }

  // Validate max completions
  const parsedMaxCompletions = typeof maxCompletions === 'string' ? parseInt(maxCompletions, 10) : maxCompletions;
  if (typeof parsedMaxCompletions !== 'number' || parsedMaxCompletions < 1 || parsedMaxCompletions > 10000) {
    return { success: false, error: 'Max completions must be between 1 and 10,000' };
  }

  // Validate budget vs completions
  if ((parsedReward as number) * (parsedMaxCompletions as number) > (parsedBudget as number)) {
    return { success: false, error: 'Budget insufficient for specified reward and completions' };
  }

  // Validate required level
  const validLevels = ['pro', 'expert', 'elite'];
  if (typeof requiredLevel !== 'string' || !validLevels.includes(requiredLevel)) {
    return { success: false, error: 'Required level must be pro, expert, or elite' };
  }

  // Validate expires days
  const parsedExpiresDays = typeof expiresDays === 'string' ? parseInt(expiresDays, 10) : expiresDays;
  if (typeof parsedExpiresDays !== 'number' || parsedExpiresDays < 1 || parsedExpiresDays > 90) {
    return { success: false, error: 'Campaign duration must be 1-90 days' };
  }

  return {
    success: true,
    data: {
      title: sanitizeString(title, 100),
      description: sanitizeString(description, 500),
      campaignType: campaignType as string,
      targetUrl: targetUrl as string,
      proofType: proofType as string,
      rewardPerTask: parsedReward as number,
      totalBudget: parsedBudget as number,
      maxCompletions: parsedMaxCompletions as number,
      requiredLevel: requiredLevel as string,
      expiresDays: parsedExpiresDays as number
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
      console.error('[CREATE-CAMPAIGN] JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_AUTH_002'), code: 'ERR_AUTH_002' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const validation = validateCreateCampaign(rawInput);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error, code: 'ERR_INVALID_001' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      title,
      description,
      campaignType,
      targetUrl,
      proofType,
      rewardPerTask,
      totalBudget,
      maxCompletions,
      requiredLevel,
      expiresDays
    } = validation.data!;

    console.log(`[CREATE-CAMPAIGN] User ${userId} creating campaign: ${title}, Budget: ₳${totalBudget}`);

    // Use service role for RPC call
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use atomic database function to create campaign
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('create_ad_campaign', {
      p_user_id: userId,
      p_title: title,
      p_description: description,
      p_campaign_type: campaignType,
      p_target_url: targetUrl,
      p_proof_type: proofType,
      p_reward_per_task: rewardPerTask,
      p_total_budget: totalBudget,
      p_max_completions: maxCompletions,
      p_required_level: requiredLevel,
      p_expires_days: expiresDays
    });

    if (rpcError) {
      console.error('[CREATE-CAMPAIGN] RPC error:', rpcError);
      const errorCode = mapDbErrorToCode(rpcError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(errorCode), code: errorCode }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the database function returned an error
    if (!result?.success) {
      console.error('[CREATE-CAMPAIGN] Operation failed:', result?.error);
      return new Response(
        JSON.stringify({ success: false, error: result?.error || 'Failed to create campaign', code: 'ERR_SYSTEM_002' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CREATE-CAMPAIGN] Campaign created: ${result.campaign_id}, Net Budget: ₳${result.net_budget}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Campaign created successfully and pending approval',
        campaign: {
          id: result.campaign_id,
          totalBudget: result.total_budget,
          platformFee: result.platform_fee,
          netBudget: result.net_budget,
          rewardPerTask: result.reward_per_task,
          maxCompletions: result.max_completions,
          expiresAt: result.expires_at
        },
        newBalance: result.new_balance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CREATE-CAMPAIGN] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: getSafeErrorMessage('ERR_SYSTEM_001'), code: 'ERR_SYSTEM_001' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
