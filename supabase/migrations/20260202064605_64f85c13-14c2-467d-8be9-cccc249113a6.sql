-- Create atomic internal transfer function for member-to-member transfers
CREATE OR REPLACE FUNCTION public.internal_transfer_atomic(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount NUMERIC,
  p_fee NUMERIC,
  p_note TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_wallet wallets%ROWTYPE;
  v_recipient_wallet wallets%ROWTYPE;
  v_total_deduction NUMERIC;
  v_tx_id UUID;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  IF p_amount < 50 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum transfer is ₳50');
  END IF;
  
  IF p_sender_id = p_recipient_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot transfer to yourself');
  END IF;
  
  v_total_deduction := p_amount + COALESCE(p_fee, 0);

  -- Lock both wallets in consistent order (by user_id) to prevent deadlocks
  IF p_sender_id < p_recipient_id THEN
    SELECT * INTO v_sender_wallet FROM wallets 
    WHERE user_id = p_sender_id AND wallet_type = 'main' FOR UPDATE;
    SELECT * INTO v_recipient_wallet FROM wallets 
    WHERE user_id = p_recipient_id AND wallet_type = 'main' FOR UPDATE;
  ELSE
    SELECT * INTO v_recipient_wallet FROM wallets 
    WHERE user_id = p_recipient_id AND wallet_type = 'main' FOR UPDATE;
    SELECT * INTO v_sender_wallet FROM wallets 
    WHERE user_id = p_sender_id AND wallet_type = 'main' FOR UPDATE;
  END IF;
  
  -- Validate wallets exist
  IF v_sender_wallet.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Sender wallet not found');
  END IF;
  
  IF v_recipient_wallet.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Recipient wallet not found');
  END IF;
  
  -- Validate balance
  IF v_sender_wallet.balance < v_total_deduction THEN
    RETURN json_build_object('success', false, 'error', 
      'Insufficient balance. You need ₳' || v_total_deduction::TEXT || ' (including ₳' || p_fee::TEXT || ' fee)');
  END IF;
  
  -- Atomic updates
  UPDATE wallets SET balance = balance - v_total_deduction, updated_at = NOW() 
  WHERE id = v_sender_wallet.id;
  
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW() 
  WHERE id = v_recipient_wallet.id;
  
  -- Log sender transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description
  ) VALUES (
    v_sender_wallet.id, p_sender_id, -p_amount,
    'transfer_out', 'Transfer to member' || CASE WHEN p_note IS NOT NULL THEN ': ' || p_note ELSE '' END
  ) RETURNING id INTO v_tx_id;
  
  -- Log fee transaction
  IF p_fee > 0 THEN
    INSERT INTO wallet_transactions (
      wallet_id, user_id, amount, transaction_type, description, reference_id
    ) VALUES (
      v_sender_wallet.id, p_sender_id, -p_fee,
      'transfer_fee', 'Internal transfer fee', v_tx_id
    );
  END IF;
  
  -- Log recipient transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_recipient_wallet.id, p_recipient_id, p_amount,
    'transfer_in', 'Received from transfer' || CASE WHEN p_note IS NOT NULL THEN ': ' || p_note ELSE '' END, v_tx_id
  );
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'amount', p_amount,
    'fee', p_fee,
    'sender_new_balance', v_sender_wallet.balance - v_total_deduction,
    'recipient_new_balance', v_recipient_wallet.balance + p_amount
  );
END;
$$;

-- Create admin campaign rejection function with atomic refund
CREATE OR REPLACE FUNCTION public.admin_reject_campaign(
  p_campaign_id UUID,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Campaign does not meet quality standards'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign ad_campaigns%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_refund_amount NUMERIC;
BEGIN
  -- Verify admin role
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
  END IF;
  
  -- Lock campaign row
  SELECT * INTO v_campaign FROM ad_campaigns WHERE id = p_campaign_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campaign not found');
  END IF;
  
  IF v_campaign.status NOT IN ('pending', 'paused') THEN
    RETURN json_build_object('success', false, 'error', 'Only pending or paused campaigns can be rejected');
  END IF;
  
  -- Calculate refund (remaining budget)
  v_refund_amount := v_campaign.remaining_budget;
  
  -- Lock advertiser wallet
  SELECT * INTO v_wallet FROM wallets 
  WHERE user_id = v_campaign.advertiser_id AND wallet_type = 'main' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Advertiser wallet not found');
  END IF;
  
  -- Update campaign status
  UPDATE ad_campaigns SET 
    status = 'rejected', 
    updated_at = NOW() 
  WHERE id = p_campaign_id;
  
  -- Refund remaining budget to advertiser
  UPDATE wallets SET 
    balance = balance + v_refund_amount, 
    updated_at = NOW() 
  WHERE id = v_wallet.id;
  
  -- Log refund transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_wallet.id, v_campaign.advertiser_id, v_refund_amount,
    'campaign_refund', 'Campaign rejected: ' || p_reason, p_campaign_id
  );
  
  RETURN json_build_object(
    'success', true,
    'campaign_id', p_campaign_id,
    'refund_amount', v_refund_amount,
    'new_balance', v_wallet.balance + v_refund_amount
  );
END;
$$;

-- Create admin campaign approval function
CREATE OR REPLACE FUNCTION public.admin_approve_campaign(
  p_campaign_id UUID,
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign ad_campaigns%ROWTYPE;
BEGIN
  -- Verify admin role
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
  END IF;
  
  -- Lock campaign row
  SELECT * INTO v_campaign FROM ad_campaigns WHERE id = p_campaign_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campaign not found');
  END IF;
  
  IF v_campaign.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Only pending campaigns can be approved');
  END IF;
  
  -- Activate campaign
  UPDATE ad_campaigns SET 
    status = 'active', 
    approved_at = NOW(),
    approved_by = p_admin_id,
    updated_at = NOW() 
  WHERE id = p_campaign_id;
  
  RETURN json_build_object(
    'success', true,
    'campaign_id', p_campaign_id,
    'status', 'active'
  );
END;
$$;