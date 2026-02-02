-- ===========================================
-- SOVEREIGN SECURITY FIX V8.5 - FULL ATOMIC OPERATIONS
-- ===========================================

-- 1. ATOMIC AUTO-LOAN REPAYMENT RPC FUNCTION
-- Fixes: auto_loan_repayment_race condition with atomic processing
-- Uses advisory locks and FOR UPDATE SKIP LOCKED for safe concurrent execution
CREATE OR REPLACE FUNCTION public.process_expired_loans()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_loans RECORD;
  v_borrower_wallet wallets%ROWTYPE;
  v_lender_wallet wallets%ROWTYPE;
  v_repayment_amount NUMERIC;
  v_borrower_balance NUMERIC;
  v_repaid_count INT := 0;
  v_defaulted_count INT := 0;
  v_total_repaid NUMERIC := 0;
  v_lock_acquired BOOLEAN := FALSE;
BEGIN
  -- Try to acquire advisory lock to prevent concurrent execution
  SELECT pg_try_advisory_lock(123456789) INTO v_lock_acquired;
  
  IF NOT v_lock_acquired THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Another auto-repayment process is already running'
    );
  END IF;

  BEGIN
    -- Process each expired loan with row-level locking
    FOR v_expired_loans IN
      SELECT * FROM loans
      WHERE status = 'active'
      AND due_at < NOW()
      FOR UPDATE SKIP LOCKED
    LOOP
      -- Calculate repayment amount
      v_repayment_amount := COALESCE(v_expired_loans.total_repayment, 
        v_expired_loans.principal_amount + COALESCE(v_expired_loans.interest_amount, 0));

      -- Lock wallets in consistent order to prevent deadlocks
      IF v_expired_loans.borrower_id < v_expired_loans.lender_id THEN
        SELECT * INTO v_borrower_wallet FROM wallets 
        WHERE user_id = v_expired_loans.borrower_id AND wallet_type = 'main' FOR UPDATE;
        
        SELECT * INTO v_lender_wallet FROM wallets 
        WHERE user_id = v_expired_loans.lender_id AND wallet_type = 'main' FOR UPDATE;
      ELSE
        SELECT * INTO v_lender_wallet FROM wallets 
        WHERE user_id = v_expired_loans.lender_id AND wallet_type = 'main' FOR UPDATE;
        
        SELECT * INTO v_borrower_wallet FROM wallets 
        WHERE user_id = v_expired_loans.borrower_id AND wallet_type = 'main' FOR UPDATE;
      END IF;

      -- Skip if wallets not found
      IF v_borrower_wallet.id IS NULL OR v_lender_wallet.id IS NULL THEN
        CONTINUE;
      END IF;

      v_borrower_balance := COALESCE(v_borrower_wallet.balance, 0);

      IF v_borrower_balance >= v_repayment_amount THEN
        -- FULL REPAYMENT: Borrower has sufficient funds
        UPDATE wallets SET balance = balance - v_repayment_amount, updated_at = NOW()
        WHERE id = v_borrower_wallet.id;
        
        UPDATE wallets SET balance = balance + v_repayment_amount, updated_at = NOW()
        WHERE id = v_lender_wallet.id;
        
        UPDATE loans SET status = 'repaid', repaid_at = NOW()
        WHERE id = v_expired_loans.id;

        -- Log transactions
        INSERT INTO loan_transactions (loan_id, user_id, from_wallet_id, to_wallet_id, amount, transaction_type, description)
        VALUES (v_expired_loans.id, v_expired_loans.borrower_id, v_borrower_wallet.id, v_lender_wallet.id, 
          v_repayment_amount, 'auto_repayment', 'Auto-repayment executed on due date');

        INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
        VALUES 
          (v_borrower_wallet.id, v_expired_loans.borrower_id, -v_repayment_amount, 'auto_loan_repayment', 'Auto loan repayment', v_expired_loans.id),
          (v_lender_wallet.id, v_expired_loans.lender_id, v_repayment_amount, 'loan_auto_received', 'Auto loan repayment received', v_expired_loans.id);

        v_repaid_count := v_repaid_count + 1;
        v_total_repaid := v_total_repaid + v_repayment_amount;

      ELSE
        -- DEFAULT: Borrower lacks sufficient funds - partial liquidation
        IF v_borrower_balance > 0 THEN
          UPDATE wallets SET balance = 0, updated_at = NOW()
          WHERE id = v_borrower_wallet.id;
          
          UPDATE wallets SET balance = balance + v_borrower_balance, updated_at = NOW()
          WHERE id = v_lender_wallet.id;

          INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
          VALUES 
            (v_borrower_wallet.id, v_expired_loans.borrower_id, -v_borrower_balance, 'loan_partial_liquidation', 'Partial liquidation on default', v_expired_loans.id),
            (v_lender_wallet.id, v_expired_loans.lender_id, v_borrower_balance, 'loan_partial_received', 'Partial liquidation received', v_expired_loans.id);
        END IF;

        UPDATE loans SET status = 'defaulted'
        WHERE id = v_expired_loans.id;

        INSERT INTO loan_transactions (loan_id, user_id, amount, transaction_type, description)
        VALUES (v_expired_loans.id, v_expired_loans.borrower_id, v_repayment_amount, 'default', 'Loan defaulted');

        v_defaulted_count := v_defaulted_count + 1;
      END IF;
    END LOOP;

    -- Release the advisory lock
    PERFORM pg_advisory_unlock(123456789);

    RETURN json_build_object(
      'success', true,
      'repaid_count', v_repaid_count,
      'defaulted_count', v_defaulted_count,
      'total_repaid', v_total_repaid
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Ensure lock is released on error
    PERFORM pg_advisory_unlock(123456789);
    RAISE;
  END;
END;
$$;

-- 2. ADD ENHANCED AUTH VERIFICATION TO RPC FUNCTIONS
-- Update internal_transfer_atomic to verify auth.uid() matches sender
CREATE OR REPLACE FUNCTION public.internal_transfer_atomic(p_sender_id uuid, p_recipient_id uuid, p_amount numeric, p_fee numeric, p_note text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_wallet wallets%ROWTYPE;
  v_recipient_wallet wallets%ROWTYPE;
  v_total_deduction NUMERIC;
  v_tx_id UUID;
  v_sanitized_note TEXT;
BEGIN
  -- SECURITY: Verify caller matches sender (prevents impersonation)
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001');
  END IF;
  
  IF auth.uid() != p_sender_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002');
  END IF;

  -- Validate inputs
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'ERR_INVALID_001');
  END IF;
  
  IF p_amount < 50 THEN
    RETURN json_build_object('success', false, 'error', 'ERR_INVALID_002');
  END IF;
  
  IF p_sender_id = p_recipient_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_INVALID_003');
  END IF;
  
  -- Sanitize note (max 200 chars, no HTML)
  v_sanitized_note := CASE 
    WHEN p_note IS NOT NULL THEN 
      LEFT(REGEXP_REPLACE(p_note, '<[^>]*>', '', 'g'), 200)
    ELSE NULL 
  END;
  
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
    RETURN json_build_object('success', false, 'error', 'ERR_WALLET_001');
  END IF;
  
  IF v_recipient_wallet.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'ERR_WALLET_002');
  END IF;
  
  -- Validate balance
  IF v_sender_wallet.balance < v_total_deduction THEN
    RETURN json_build_object('success', false, 'error', 'ERR_BALANCE_001');
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
    'transfer_out', 'Transfer to member' || CASE WHEN v_sanitized_note IS NOT NULL THEN ': ' || v_sanitized_note ELSE '' END
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
    'transfer_in', 'Received from transfer' || CASE WHEN v_sanitized_note IS NOT NULL THEN ': ' || v_sanitized_note ELSE '' END, v_tx_id
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

-- 3. UPDATE transfer_with_lock TO VERIFY auth.uid()
CREATE OR REPLACE FUNCTION public.transfer_with_lock(p_user_id uuid, p_from_type wallet_type, p_to_type wallet_type, p_amount numeric)
RETURNS json
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
  -- SECURITY: Verify caller matches user_id
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001');
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002');
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'ERR_INVALID_001');
  END IF;
  
  IF p_from_type = p_to_type THEN
    RETURN json_build_object('success', false, 'error', 'ERR_INVALID_003');
  END IF;

  -- Lock rows in consistent order to prevent deadlocks
  SELECT * INTO v_from_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = p_from_type
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_WALLET_001');
  END IF;
  
  SELECT * INTO v_to_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = p_to_type
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_WALLET_002');
  END IF;
  
  -- Check sufficient balance
  IF v_from_wallet.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'ERR_BALANCE_001');
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

-- 4. UPDATE cash_out_with_lock TO VERIFY auth.uid()
CREATE OR REPLACE FUNCTION public.cash_out_with_lock(p_user_id uuid, p_amount numeric, p_fee_percent numeric, p_payment_method text, p_account_name text, p_account_number text)
RETURNS json
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
  v_sanitized_account_name TEXT;
BEGIN
  -- SECURITY: Verify caller matches user_id
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001');
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002');
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'ERR_INVALID_001');
  END IF;
  
  -- Sanitize account name
  v_sanitized_account_name := LEFT(REGEXP_REPLACE(p_account_name, '<[^>]*>', '', 'g'), 100);

  -- Lock the main wallet row
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_WALLET_001');
  END IF;
  
  -- Check sufficient balance
  IF v_wallet.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'ERR_BALANCE_001');
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
    'Cash-out to ' || p_payment_method || ' (' || v_sanitized_account_name || ' - ' || p_account_number || ')')
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