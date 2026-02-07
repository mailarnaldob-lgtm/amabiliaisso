-- SOVEREIGN V12.1: Allow inactive accounts to create campaigns and buy ALPHA
-- Only mission participation is restricted for inactive accounts

-- Update create_ad_campaign function to allow ALL authenticated users
CREATE OR REPLACE FUNCTION public.create_ad_campaign(
  p_user_id uuid, 
  p_title text, 
  p_description text, 
  p_campaign_type text, 
  p_target_url text,
  p_proof_type text, 
  p_reward_per_task numeric, 
  p_total_budget numeric, 
  p_max_completions integer, 
  p_required_level text DEFAULT 'pro'::text, 
  p_expires_days integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_profile profiles%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_platform_fee NUMERIC;
  v_net_budget NUMERIC;
  v_campaign_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Validate inputs
  IF p_total_budget < 100 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum campaign budget is ₳100');
  END IF;
  
  IF p_reward_per_task < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum reward per task is ₳1');
  END IF;
  
  IF p_max_completions < 1 THEN
    RETURN json_build_object('success', false, 'error', 'At least 1 completion required');
  END IF;
  
  IF p_reward_per_task * p_max_completions > p_total_budget THEN
    RETURN json_build_object('success', false, 'error', 'Budget insufficient for specified completions');
  END IF;

  -- SOVEREIGN V12.1: Check profile exists (no tier restriction)
  -- Inactive accounts CAN create campaigns to fund their advertising
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  -- NOTE: Membership tier restriction REMOVED
  -- Inactive users can create campaigns and purchase ALPHA for campaign funding
  -- Only mission participation and reward earning is restricted

  -- Calculate platform fee (10%) and net budget
  v_platform_fee := p_total_budget * 0.10;
  v_net_budget := p_total_budget - v_platform_fee;
  v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;

  -- Lock wallet for atomic deduction
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Main wallet not found');
  END IF;
  
  IF v_wallet.balance < p_total_budget THEN
    RETURN json_build_object('success', false, 'error', 
      'Insufficient balance. You need ₳' || p_total_budget::TEXT || ' (including 10% platform fee)');
  END IF;

  -- Deduct budget from wallet
  UPDATE wallets
  SET balance = balance - p_total_budget, updated_at = NOW()
  WHERE id = v_wallet.id;

  -- Create campaign
  INSERT INTO ad_campaigns (
    advertiser_id, title, description, campaign_type, target_url,
    proof_type, reward_per_task, total_budget, remaining_budget,
    max_completions, required_level, expires_at, status
  ) VALUES (
    p_user_id, p_title, p_description, p_campaign_type, p_target_url,
    p_proof_type, p_reward_per_task, v_net_budget, v_net_budget,
    p_max_completions, p_required_level, v_expires_at, 'pending'
  )
  RETURNING id INTO v_campaign_id;

  -- Log platform fee transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_wallet.id, p_user_id, -v_platform_fee,
    'campaign_fee', 'Ad campaign platform fee (10%)', v_campaign_id
  );

  -- Log campaign budget transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_wallet.id, p_user_id, -v_net_budget,
    'campaign_escrow', 'Ad campaign budget locked in escrow', v_campaign_id
  );

  RETURN json_build_object(
    'success', true,
    'campaign_id', v_campaign_id,
    'total_budget', p_total_budget,
    'platform_fee', v_platform_fee,
    'net_budget', v_net_budget,
    'reward_per_task', p_reward_per_task,
    'max_completions', p_max_completions,
    'expires_at', v_expires_at,
    'new_balance', v_wallet.balance - p_total_budget
  );
END;
$function$;

-- Update ad_campaigns RLS to allow ALL authenticated users to create campaigns
DROP POLICY IF EXISTS "EXPERT+ members can create campaigns" ON public.ad_campaigns;

CREATE POLICY "Authenticated users can create campaigns"
ON public.ad_campaigns
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = advertiser_id);

-- Add comment for documentation
COMMENT ON FUNCTION public.create_ad_campaign IS 'SOVEREIGN V12.1: Allows ALL authenticated users to create campaigns. Inactive accounts can fund campaigns with purchased ALPHA. Only mission participation requires active membership.';