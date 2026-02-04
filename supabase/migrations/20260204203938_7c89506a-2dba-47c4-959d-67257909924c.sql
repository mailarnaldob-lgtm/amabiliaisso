-- Drop and recreate approve_cash_out_request with proper wallet deduction
DROP FUNCTION IF EXISTS approve_cash_out_request(UUID, UUID);

CREATE OR REPLACE FUNCTION approve_cash_out_request(p_request_id UUID, p_admin_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_wallet_id UUID;
  v_current_balance NUMERIC;
BEGIN
  -- Admin role verification
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  -- Identity verification
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  -- Get and lock the request
  SELECT * INTO v_request FROM cash_out_requests WHERE id = p_request_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_002: Request not found or already processed');
  END IF;

  -- Get and lock the user's main wallet
  SELECT id, balance INTO v_wallet_id, v_current_balance 
  FROM wallets 
  WHERE user_id = v_request.user_id AND wallet_type = 'main' 
  FOR UPDATE;
  
  IF v_wallet_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'ERR_WALLET_001: User wallet not found');
  END IF;

  -- Verify sufficient balance (amount includes fee)
  IF v_current_balance < v_request.amount THEN
    RETURN json_build_object('success', false, 'error', 'ERR_BALANCE_001: Insufficient balance for withdrawal');
  END IF;

  -- Deduct the full amount (including fee) from user's wallet
  UPDATE wallets 
  SET balance = balance - v_request.amount, updated_at = NOW() 
  WHERE id = v_wallet_id;

  -- Update request status
  UPDATE cash_out_requests 
  SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Record transaction (negative amount for withdrawal)
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_request.user_id, -v_request.amount, 'cash_out', 
    'Cash-out approved: ' || v_request.payment_method || ' (Fee: ₳' || v_request.fee_amount || ')', p_request_id);

  RETURN json_build_object(
    'success', true, 
    'request_id', p_request_id, 
    'amount', v_request.amount,
    'fee_amount', v_request.fee_amount,
    'net_amount', v_request.net_amount,
    'new_balance', v_current_balance - v_request.amount
  );
END;
$$;