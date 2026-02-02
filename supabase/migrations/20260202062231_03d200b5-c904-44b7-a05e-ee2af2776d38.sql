-- ==============================================================
-- AD WIZARD: Campaign Creation System (Blueprint V8.0)
-- PRO members: Create campaigns | EXPERT members: Bulk creation
-- ==============================================================

-- Create ad_campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'social_engagement', -- youtube_watch, youtube_subscribe, facebook_like, traffic, social_engagement
  target_url TEXT NOT NULL,
  proof_type TEXT NOT NULL DEFAULT 'screenshot', -- screenshot, video, text
  reward_per_task NUMERIC(10,2) NOT NULL CHECK (reward_per_task >= 1),
  total_budget NUMERIC(12,2) NOT NULL CHECK (total_budget >= 100),
  remaining_budget NUMERIC(12,2) NOT NULL,
  max_completions INTEGER NOT NULL DEFAULT 100,
  current_completions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, paused, completed, cancelled
  required_level TEXT NOT NULL DEFAULT 'pro', -- pro, expert, elite
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint to ensure remaining_budget doesn't exceed total_budget
ALTER TABLE public.ad_campaigns 
ADD CONSTRAINT remaining_budget_check CHECK (remaining_budget <= total_budget AND remaining_budget >= 0);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_campaigns
-- 1. Advertisers can view their own campaigns
CREATE POLICY "Advertisers can view own campaigns"
ON public.ad_campaigns FOR SELECT
USING (auth.uid() = advertiser_id);

-- 2. Authenticated users can view active campaigns (marketplace)
CREATE POLICY "Authenticated users can view active campaigns"
ON public.ad_campaigns FOR SELECT
USING (status = 'active' AND auth.uid() IS NOT NULL);

-- 3. PRO+ members can create campaigns
CREATE POLICY "PRO+ members can create campaigns"
ON public.ad_campaigns FOR INSERT
WITH CHECK (
  auth.uid() = advertiser_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND membership_tier IN ('pro', 'elite')
  )
);

-- 4. Advertisers can update their own pending/paused campaigns
CREATE POLICY "Advertisers can update own campaigns"
ON public.ad_campaigns FOR UPDATE
USING (
  auth.uid() = advertiser_id AND 
  status IN ('pending', 'paused')
);

-- 5. Admins can manage all campaigns
CREATE POLICY "Admins can manage all campaigns"
ON public.ad_campaigns FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_advertiser ON public.ad_campaigns(advertiser_id);
CREATE INDEX idx_ad_campaigns_type ON public.ad_campaigns(campaign_type);

-- Create RPC function for atomic campaign creation with budget deduction
CREATE OR REPLACE FUNCTION public.create_ad_campaign(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_campaign_type TEXT,
  p_target_url TEXT,
  p_proof_type TEXT,
  p_reward_per_task NUMERIC,
  p_total_budget NUMERIC,
  p_max_completions INTEGER,
  p_required_level TEXT DEFAULT 'pro',
  p_expires_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Check membership tier (PRO or ELITE required)
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  IF v_profile.membership_tier NOT IN ('pro', 'elite') THEN
    RETURN json_build_object('success', false, 'error', 'PRO or ELITE membership required to create campaigns');
  END IF;

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
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_ad_campaigns_updated_at
BEFORE UPDATE ON public.ad_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();