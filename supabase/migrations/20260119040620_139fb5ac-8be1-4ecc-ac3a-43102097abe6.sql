-- Create atomic cash-in function to prevent race conditions
CREATE OR REPLACE FUNCTION public.cash_in_with_lock(
  p_user_id UUID,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_reference_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance NUMERIC;
  v_tx_id UUID;
BEGIN
  -- Validate amount
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid amount');
  END IF;
  
  IF p_amount < 100 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum cash-in amount is ₱100');
  END IF;
  
  IF p_amount > 50000 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum cash-in amount is ₱50,000');
  END IF;

  -- Lock the main wallet row to prevent race conditions
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Main wallet not found');
  END IF;
  
  -- Calculate new balance
  v_new_balance := COALESCE(v_wallet.balance, 0) + p_amount;
  
  -- Atomic update within transaction
  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet.id;
  
  -- Insert transaction log (also atomic within same transaction)
  INSERT INTO wallet_transactions (
    wallet_id, 
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    v_wallet.id, 
    p_user_id, 
    p_amount, 
    'cash_in',
    'Cash-in via ' || COALESCE(p_payment_method, 'unknown') || 
      CASE WHEN p_reference_number IS NOT NULL 
        THEN ' (Ref: ' || p_reference_number || ')' 
        ELSE '' 
      END
  )
  RETURNING id INTO v_tx_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'amount', p_amount,
    'new_balance', v_new_balance
  );
END;
$$;

-- Add explicit INSERT policy for profiles (deny all client inserts - only trigger can insert)
CREATE POLICY "Prevent direct profile creation"
ON public.profiles
FOR INSERT
WITH CHECK (false);

-- Grant execute on new function
GRANT EXECUTE ON FUNCTION public.cash_in_with_lock(UUID, NUMERIC, TEXT, TEXT) TO authenticated;