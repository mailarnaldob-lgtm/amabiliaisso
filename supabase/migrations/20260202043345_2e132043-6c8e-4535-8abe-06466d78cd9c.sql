-- Add subscription tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'expired', 'grace_period')),
ADD COLUMN IF NOT EXISTS last_renewal_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS renewal_cycle TEXT DEFAULT 'monthly' CHECK (renewal_cycle IN ('monthly', 'quarterly', 'annual'));

-- Add index for efficient subscription status queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires ON public.profiles(subscription_expires_at);

-- Create function to check if user subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check subscription status and expiry
  IF v_profile.subscription_status = 'active' AND 
     (v_profile.subscription_expires_at IS NULL OR v_profile.subscription_expires_at > NOW()) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create function to activate/renew subscription after payment approval
CREATE OR REPLACE FUNCTION public.activate_subscription(p_user_id UUID, p_tier membership_tier, p_cycle TEXT DEFAULT 'monthly')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiry based on cycle
  CASE p_cycle
    WHEN 'monthly' THEN v_expiry := NOW() + INTERVAL '30 days';
    WHEN 'quarterly' THEN v_expiry := NOW() + INTERVAL '90 days';
    WHEN 'annual' THEN v_expiry := NOW() + INTERVAL '365 days';
    ELSE v_expiry := NOW() + INTERVAL '30 days';
  END CASE;
  
  -- Update profile with subscription info
  UPDATE profiles SET
    membership_tier = p_tier,
    subscription_status = 'active',
    subscription_expires_at = v_expiry,
    last_renewal_at = NOW(),
    renewal_cycle = p_cycle,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'expires_at', v_expiry,
    'status', 'active',
    'cycle', p_cycle
  );
END;
$$;

-- Update approve_membership_payment to use subscription activation
CREATE OR REPLACE FUNCTION public.approve_membership_payment(p_payment_id uuid, p_admin_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_payment membership_payments%ROWTYPE;
  v_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Lock payment row
  SELECT * INTO v_payment
  FROM membership_payments
  WHERE id = p_payment_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  IF v_payment.status != 'pending' THEN
    RAISE EXCEPTION 'Payment already reviewed (status: %)', v_payment.status;
  END IF;
  
  -- Update payment status
  UPDATE membership_payments SET
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id
  WHERE id = p_payment_id;
  
  -- Calculate subscription expiry (30 days from now for monthly)
  v_expiry := NOW() + INTERVAL '30 days';
  
  -- Update user's membership tier AND subscription
  UPDATE profiles SET
    membership_tier = v_payment.tier,
    membership_amount = v_payment.amount,
    subscription_status = 'active',
    subscription_expires_at = v_expiry,
    last_renewal_at = NOW(),
    renewal_cycle = 'monthly',
    updated_at = NOW()
  WHERE id = v_payment.user_id;
  
  RETURN json_build_object(
    'success', true,
    'tier', v_payment.tier,
    'user_id', v_payment.user_id,
    'subscription_expires_at', v_expiry,
    'subscription_status', 'active'
  );
END;
$function$;