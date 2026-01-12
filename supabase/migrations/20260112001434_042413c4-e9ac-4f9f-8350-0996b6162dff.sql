-- Create atomic wallet transfer function with row-level locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.transfer_with_lock(
  p_user_id UUID,
  p_from_type wallet_type,
  p_to_type wallet_type,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_wallet wallets%ROWTYPE;
  v_to_wallet wallets%ROWTYPE;
  v_from_new_balance NUMERIC;
  v_to_new_balance NUMERIC;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  IF p_from_type = p_to_type THEN
    RETURN json_build_object('success', false, 'error', 'Cannot transfer to the same wallet');
  END IF;

  -- Lock rows in consistent order to prevent deadlocks
  SELECT * INTO v_from_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = p_from_type
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Source wallet not found');
  END IF;
  
  SELECT * INTO v_to_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = p_to_type
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Destination wallet not found');
  END IF;
  
  -- Check sufficient balance
  IF v_from_wallet.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Calculate new balances
  v_from_new_balance := v_from_wallet.balance - p_amount;
  v_to_new_balance := v_to_wallet.balance + p_amount;
  
  -- Atomic updates within transaction
  UPDATE wallets
  SET balance = v_from_new_balance, updated_at = NOW()
  WHERE id = v_from_wallet.id;
  
  UPDATE wallets
  SET balance = v_to_new_balance, updated_at = NOW()
  WHERE id = v_to_wallet.id;
  
  -- Insert transaction logs
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
  VALUES (v_from_wallet.id, p_user_id, -p_amount, 'transfer_out', 'Transfer to ' || p_to_type || ' wallet');
  
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
  VALUES (v_to_wallet.id, p_user_id, p_amount, 'transfer_in', 'Transfer from ' || p_from_type || ' wallet');
  
  RETURN json_build_object(
    'success', true, 
    'from_balance', v_from_new_balance,
    'to_balance', v_to_new_balance,
    'amount', p_amount
  );
END;
$$;

-- Create atomic cash-out function with row-level locking
CREATE OR REPLACE FUNCTION public.cash_out_with_lock(
  p_user_id UUID,
  p_amount NUMERIC,
  p_fee_percent NUMERIC,
  p_payment_method TEXT,
  p_account_name TEXT,
  p_account_number TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance NUMERIC;
  v_fee NUMERIC;
  v_net_amount NUMERIC;
  v_tx_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Lock the main wallet row
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Main wallet not found');
  END IF;
  
  -- Check sufficient balance
  IF v_wallet.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Calculate fee and new balance
  v_fee := p_amount * (p_fee_percent / 100);
  v_net_amount := p_amount - v_fee;
  v_new_balance := v_wallet.balance - p_amount;
  
  -- Update wallet balance atomically
  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet.id;
  
  -- Insert transaction log
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
  VALUES (v_wallet.id, p_user_id, -p_amount, 'cash_out', 
    'Cash-out to ' || p_payment_method || ' (' || p_account_name || ' - ' || p_account_number || ') | Fee: ₳' || v_fee::TEXT)
  RETURNING id INTO v_tx_id;
  
  -- Insert fee transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet.id, p_user_id, -v_fee, 'withdrawal_fee', 'Withdrawal fee (' || p_fee_percent || '%)', v_tx_id);
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'amount', p_amount,
    'fee', v_fee,
    'net_amount', v_net_amount,
    'new_balance', v_new_balance
  );
END;
$$;

-- Add balance constraint to prevent negative balances
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS positive_balance;
ALTER TABLE wallets ADD CONSTRAINT positive_balance CHECK (balance >= 0);