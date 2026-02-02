/**
 * SOVEREIGN GATEKEEPER V9.2
 * Elite ABC Access Verification Middleware
 * Validates ELITE status and referral requirements
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';
import { ERROR_CODES, getSafeErrorMessage } from '../_shared/error-codes.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Type': 'application/json',
};

const REQUIRED_EXPERT_REFERRALS = 3;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ERR_AUTH_001',
          message: getSafeErrorMessage('ERR_AUTH_001'),
          qualified: false,
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify JWT and get claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ERR_AUTH_002',
          message: getSafeErrorMessage('ERR_AUTH_002'),
          qualified: false,
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = claimsData.claims.sub as string;

    // 1. TIER CHECK: Verify ELITE membership
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, membership_tier, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ERR_AUTH_003',
          message: 'Profile not found',
          qualified: false,
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    const isElite = profile.membership_tier === 'elite';

    // 2. REFERRAL CHECK: Count EXPERT+ direct referrals
    const { count: expertReferrals, error: referralError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId)
      .in('membership_tier', ['expert', 'elite']);

    if (referralError) {
      console.error('Referral check error:', referralError);
    }

    const qualifiedReferrals = expertReferrals || 0;
    const referralsMet = qualifiedReferrals >= REQUIRED_EXPERT_REFERRALS;

    // 3. VAULT CHECK: Check if vault exists
    const { data: vault, error: vaultError } = await supabase
      .from('elite_vaults')
      .select('id, total_balance, frozen_collateral, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    const hasVault = !!vault && vault.is_active;

    // Build qualification response
    const qualified = isElite && referralsMet;
    const accessLevel = qualified ? 'full' : isElite ? 'limited' : 'locked';

    // Build dynamic message for unqualified users
    let denialMessage = null;
    if (!isElite) {
      denialMessage = 'Elite Status Required: Upgrade to Elite membership to unlock Alpha Banking.';
    } else if (!referralsMet) {
      const remaining = REQUIRED_EXPERT_REFERRALS - qualifiedReferrals;
      denialMessage = `Elite Status Verified: Enroll ${remaining} more EXPERT partner${remaining > 1 ? 's' : ''} to unlock full Alpha Banking privileges.`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        qualified,
        accessLevel,
        tier: profile.membership_tier,
        isElite,
        referrals: {
          qualified: qualifiedReferrals,
          required: REQUIRED_EXPERT_REFERRALS,
          met: referralsMet,
        },
        vault: hasVault ? {
          exists: true,
          balance: vault.total_balance,
          frozen: vault.frozen_collateral,
          active: vault.is_active,
        } : {
          exists: false,
          balance: 0,
          frozen: 0,
          active: false,
        },
        message: qualified 
          ? 'Full access granted to Alpha Bankers Cooperative'
          : denialMessage,
      }),
      { status: qualified ? 200 : 403, headers: corsHeaders }
    );

  } catch (error) {
    console.error('verify-abc-access error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'ERR_SYSTEM_001',
        message: getSafeErrorMessage('ERR_SYSTEM_001'),
        qualified: false,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
