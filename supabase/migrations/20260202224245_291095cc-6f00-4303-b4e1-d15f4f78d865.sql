-- CRITICAL SECURITY FIX: Drop and recreate admin functions with identity verification
-- Parameter order must match existing signatures

-- Drop all affected functions first
DROP FUNCTION IF EXISTS public.approve_membership_payment(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_membership_payment(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.approve_cash_in_request(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_cash_in_request(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.hold_cash_in_request(uuid, uuid);
DROP FUNCTION IF EXISTS public.approve_cash_out_request(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_cash_out_request(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.flag_cash_out_request(uuid, uuid);
DROP FUNCTION IF EXISTS public.admin_approve_campaign(uuid, uuid);
DROP FUNCTION IF EXISTS public.admin_reject_campaign(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.approve_task_submission(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_task_submission(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.verify_commission_credited(uuid, uuid);

-- Recreate approve_membership_payment with identity check
CREATE FUNCTION public.approve_membership_payment(p_admin_id uuid, p_payment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_referrer_id UUID;
  v_commission_amount NUMERIC;
  v_commission_rate NUMERIC := 50.00;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_payment FROM membership_payments 
  WHERE id = p_payment_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_PAY_001: Payment not found or already processed');
  END IF;

  UPDATE membership_payments SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW()
  WHERE id = p_payment_id;

  UPDATE profiles SET membership_tier = v_payment.tier, 
    membership_amount = COALESCE(membership_amount, 0) + v_payment.amount, updated_at = NOW()
  WHERE id = v_payment.user_id;

  SELECT referred_by INTO v_referrer_id FROM profiles WHERE id = v_payment.user_id;

  IF v_referrer_id IS NOT NULL THEN
    v_commission_amount := v_payment.amount * (v_commission_rate / 100);
    INSERT INTO referral_commissions (referrer_id, referred_id, membership_tier, membership_amount, 
      commission_rate, commission_amount, is_paid)
    VALUES (v_referrer_id, v_payment.user_id, v_payment.tier, v_payment.amount,
      v_commission_rate, v_commission_amount, false);
  END IF;

  RETURN json_build_object('success', true, 'payment_id', p_payment_id, 'tier', v_payment.tier);
END;
$$;

-- Recreate reject_membership_payment with identity check
CREATE FUNCTION public.reject_membership_payment(p_admin_id uuid, p_payment_id uuid, p_rejection_reason text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_payment FROM membership_payments WHERE id = p_payment_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_PAY_001: Payment not found or already processed');
  END IF;

  UPDATE membership_payments SET status = 'rejected', reviewed_by = p_admin_id, reviewed_at = NOW(),
    rejection_reason = COALESCE(p_rejection_reason, 'Payment rejected by admin')
  WHERE id = p_payment_id;

  RETURN json_build_object('success', true, 'payment_id', p_payment_id);
END;
$$;

-- Recreate approve_cash_in_request with identity check
CREATE FUNCTION public.approve_cash_in_request(p_admin_id uuid, p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_wallet_id UUID;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_request FROM cash_in_requests WHERE id = p_request_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_001: Request not found or already processed');
  END IF;

  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_request.user_id AND wallet_type = 'main';
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, wallet_type, balance) VALUES (v_request.user_id, 'main', 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  UPDATE wallets SET balance = balance + v_request.amount, updated_at = NOW() WHERE id = v_wallet_id;

  UPDATE cash_in_requests SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW()
  WHERE id = p_request_id;

  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_request.user_id, v_request.amount, 'cash_in', 
    'Cash-in approved: ' || v_request.payment_method, p_request_id);

  RETURN json_build_object('success', true, 'request_id', p_request_id, 'amount', v_request.amount);
END;
$$;

-- Recreate reject_cash_in_request with identity check
CREATE FUNCTION public.reject_cash_in_request(p_admin_id uuid, p_request_id uuid, p_reason text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_request FROM cash_in_requests WHERE id = p_request_id AND status IN ('pending', 'on_hold') FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_001: Request not found or already processed');
  END IF;

  UPDATE cash_in_requests SET status = 'rejected', reviewed_by = p_admin_id, reviewed_at = NOW(),
    rejection_reason = COALESCE(p_reason, 'Request rejected by admin')
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'request_id', p_request_id);
END;
$$;

-- Recreate hold_cash_in_request with identity check
CREATE FUNCTION public.hold_cash_in_request(p_admin_id uuid, p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_request FROM cash_in_requests WHERE id = p_request_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_001: Request not found or not pending');
  END IF;

  UPDATE cash_in_requests SET status = 'on_hold', reviewed_by = p_admin_id, updated_at = NOW()
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'request_id', p_request_id, 'status', 'on_hold');
END;
$$;

-- Recreate approve_cash_out_request with identity check
CREATE FUNCTION public.approve_cash_out_request(p_admin_id uuid, p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_request FROM cash_out_requests WHERE id = p_request_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_002: Request not found or already processed');
  END IF;

  UPDATE cash_out_requests SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW()
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'request_id', p_request_id, 'amount', v_request.amount, 'net_amount', v_request.net_amount);
END;
$$;

-- Recreate reject_cash_out_request with identity check
CREATE FUNCTION public.reject_cash_out_request(p_admin_id uuid, p_request_id uuid, p_reason text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_wallet_id UUID;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_request FROM cash_out_requests WHERE id = p_request_id AND status IN ('pending', 'flagged') FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_002: Request not found or already processed');
  END IF;

  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_request.user_id AND wallet_type = 'main' FOR UPDATE;

  UPDATE wallets SET balance = balance + v_request.amount, updated_at = NOW() WHERE id = v_wallet_id;

  UPDATE cash_out_requests SET status = 'rejected', reviewed_by = p_admin_id, reviewed_at = NOW(),
    rejection_reason = COALESCE(p_reason, 'Request rejected by admin')
  WHERE id = p_request_id;

  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_request.user_id, v_request.amount, 'refund', 'Cash-out rejected - funds returned', p_request_id);

  RETURN json_build_object('success', true, 'request_id', p_request_id, 'refunded', v_request.amount);
END;
$$;

-- Recreate flag_cash_out_request with identity check
CREATE FUNCTION public.flag_cash_out_request(p_admin_id uuid, p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_request FROM cash_out_requests WHERE id = p_request_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_002: Request not found or not pending');
  END IF;

  UPDATE cash_out_requests SET status = 'flagged', reviewed_by = p_admin_id, updated_at = NOW()
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'request_id', p_request_id, 'status', 'flagged');
END;
$$;

-- Recreate admin_approve_campaign with identity check
CREATE FUNCTION public.admin_approve_campaign(p_admin_id uuid, p_campaign_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_campaign FROM ad_campaigns WHERE id = p_campaign_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CAMP_001: Campaign not found or not pending');
  END IF;

  UPDATE ad_campaigns SET status = 'active', approved_by = p_admin_id, approved_at = NOW(), updated_at = NOW()
  WHERE id = p_campaign_id;

  RETURN json_build_object('success', true, 'campaign_id', p_campaign_id, 'status', 'active');
END;
$$;

-- Recreate admin_reject_campaign with identity check
CREATE FUNCTION public.admin_reject_campaign(p_admin_id uuid, p_campaign_id uuid, p_reason text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign RECORD;
  v_wallet_id UUID;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_campaign FROM ad_campaigns WHERE id = p_campaign_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CAMP_001: Campaign not found or not pending');
  END IF;

  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_campaign.advertiser_id AND wallet_type = 'main' FOR UPDATE;

  UPDATE wallets SET balance = balance + v_campaign.total_budget, updated_at = NOW() WHERE id = v_wallet_id;

  UPDATE ad_campaigns SET status = 'rejected', approved_by = p_admin_id, approved_at = NOW(), updated_at = NOW()
  WHERE id = p_campaign_id;

  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_campaign.advertiser_id, v_campaign.total_budget, 'refund',
    'Campaign rejected - budget refunded: ' || COALESCE(p_reason, 'No reason provided'), p_campaign_id);

  RETURN json_build_object('success', true, 'campaign_id', p_campaign_id, 'refunded', v_campaign.total_budget);
END;
$$;

-- Recreate approve_task_submission with identity check
CREATE FUNCTION public.approve_task_submission(p_admin_id uuid, p_submission_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission RECORD;
  v_task RECORD;
  v_wallet_id UUID;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_submission FROM task_submissions WHERE id = p_submission_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_TASK_001: Submission not found or already processed');
  END IF;

  SELECT * INTO v_task FROM tasks WHERE id = v_submission.task_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_TASK_002: Task not found');
  END IF;

  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_submission.user_id AND wallet_type = 'task';
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, wallet_type, balance) VALUES (v_submission.user_id, 'task', 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  UPDATE wallets SET balance = balance + v_task.reward, updated_at = NOW() WHERE id = v_wallet_id;

  UPDATE task_submissions SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW(), reward_amount = v_task.reward
  WHERE id = p_submission_id;

  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_submission.user_id, v_task.reward, 'task_reward', 'Task completed: ' || v_task.title, p_submission_id);

  RETURN json_build_object('success', true, 'submission_id', p_submission_id, 'reward', v_task.reward);
END;
$$;

-- Recreate reject_task_submission with identity check
CREATE FUNCTION public.reject_task_submission(p_admin_id uuid, p_submission_id uuid, p_rejection_reason text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission RECORD;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_submission FROM task_submissions WHERE id = p_submission_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_TASK_001: Submission not found or already processed');
  END IF;

  UPDATE task_submissions SET status = 'rejected', reviewed_by = p_admin_id, reviewed_at = NOW(),
    rejection_reason = COALESCE(p_rejection_reason, 'Submission rejected by admin')
  WHERE id = p_submission_id;

  RETURN json_build_object('success', true, 'submission_id', p_submission_id);
END;
$$;

-- Recreate verify_commission_credited with identity check
CREATE FUNCTION public.verify_commission_credited(p_admin_id uuid, p_commission_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission RECORD;
  v_wallet_id UUID;
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  SELECT * INTO v_commission FROM referral_commissions WHERE id = p_commission_id AND is_paid = false FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_COMM_001: Commission not found or already paid');
  END IF;

  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_commission.referrer_id AND wallet_type = 'royalty';
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, wallet_type, balance) VALUES (v_commission.referrer_id, 'royalty', 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  UPDATE wallets SET balance = balance + v_commission.commission_amount, updated_at = NOW() WHERE id = v_wallet_id;

  UPDATE referral_commissions SET is_paid = true, paid_at = NOW() WHERE id = p_commission_id;

  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_commission.referrer_id, v_commission.commission_amount, 'commission',
    'Referral commission: ' || v_commission.membership_tier, p_commission_id);

  RETURN json_build_object('success', true, 'commission_id', p_commission_id, 'amount', v_commission.commission_amount);
END;
$$;