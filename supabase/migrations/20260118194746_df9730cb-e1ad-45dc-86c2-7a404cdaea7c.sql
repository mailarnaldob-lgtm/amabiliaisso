-- Create atomic lending functions with proper row locking and transaction guarantees

-- 1. Post Offer: Lock wallet, deduct funds, create loan - all atomic
CREATE OR REPLACE FUNCTION public.lending_post_offer(
  p_user_id UUID,
  p_principal_amount NUMERIC,
  p_interest_rate NUMERIC DEFAULT 3.0,
  p_term_days INTEGER DEFAULT 7
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_processing_fee NUMERIC;
  v_total_required NUMERIC;
  v_interest_amount NUMERIC;
  v_total_repayment NUMERIC;
  v_loan_id UUID;
BEGIN
  -- Validate inputs
  IF p_principal_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Principal amount must be positive');
  END IF;
  
  IF p_principal_amount < 100 THEN
    RETURN json_build_object('success', false, 'error', 'Minimum lending amount is ₳100');
  END IF;
  
  IF p_principal_amount > 100000 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum lending amount is ₳100,000');
  END IF;
  
  IF p_interest_rate < 0 OR p_interest_rate > 100 THEN
    RETURN json_build_object('success', false, 'error', 'Interest rate must be between 0 and 100');
  END IF;
  
  IF p_term_days < 1 OR p_term_days > 365 THEN
    RETURN json_build_object('success', false, 'error', 'Term must be between 1 and 365 days');
  END IF;

  -- Check profile requirements (Elite + KYC)
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  IF v_profile.membership_tier != 'elite' THEN
    RETURN json_build_object('success', false, 'error', 'Elite membership required for lending');
  END IF;
  
  IF NOT COALESCE(v_profile.is_kyc_verified, false) THEN
    RETURN json_build_object('success', false, 'error', 'KYC verification required for lending');
  END IF;

  -- Calculate amounts
  v_processing_fee := p_principal_amount * 0.008; -- 0.8% fee
  v_total_required := p_principal_amount + v_processing_fee;
  v_interest_amount := p_principal_amount * (p_interest_rate / 100);
  v_total_repayment := p_principal_amount + v_interest_amount;

  -- Lock wallet row for update to prevent race conditions
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Main wallet not found');
  END IF;
  
  -- Check sufficient balance
  IF v_wallet.balance < v_total_required THEN
    RETURN json_build_object('success', false, 'error', 
      'Insufficient balance. You need ₳' || v_total_required::TEXT || ' (including 0.8% fee)');
  END IF;

  -- Deduct from wallet atomically
  UPDATE wallets
  SET balance = balance - v_total_required, updated_at = NOW()
  WHERE id = v_wallet.id;

  -- Create loan record
  INSERT INTO loans (
    lender_id, principal_amount, interest_rate, interest_amount,
    processing_fee, total_repayment, term_days, status, escrow_wallet_id
  ) VALUES (
    p_user_id, p_principal_amount, p_interest_rate, v_interest_amount,
    v_processing_fee, v_total_repayment, p_term_days, 'pending', v_wallet.id
  )
  RETURNING id INTO v_loan_id;

  -- Log loan transaction
  INSERT INTO loan_transactions (
    loan_id, user_id, from_wallet_id, amount, transaction_type, description
  ) VALUES (
    v_loan_id, p_user_id, v_wallet.id, p_principal_amount,
    'escrow_deposit', 'Loan offer created - ₳' || p_principal_amount::TEXT || ' locked in escrow'
  );

  -- Log fee transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_wallet.id, p_user_id, -v_processing_fee,
    'lending_fee', 'Lending processing fee (0.8%)', v_loan_id
  );

  RETURN json_build_object(
    'success', true,
    'loan_id', v_loan_id,
    'principal_amount', p_principal_amount,
    'interest_rate', p_interest_rate,
    'interest_amount', v_interest_amount,
    'processing_fee', v_processing_fee,
    'total_repayment', v_total_repayment,
    'term_days', p_term_days,
    'new_balance', v_wallet.balance - v_total_required
  );
END;
$$;

-- 2. Take Offer: Lock loan and wallet, update state, credit funds - all atomic
CREATE OR REPLACE FUNCTION public.lending_take_offer(
  p_user_id UUID,
  p_loan_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_loan loans%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_due_date TIMESTAMPTZ;
BEGIN
  -- Validate input
  IF p_loan_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Loan ID is required');
  END IF;

  -- Check profile requirements (Elite + KYC)
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  IF v_profile.membership_tier != 'elite' THEN
    RETURN json_build_object('success', false, 'error', 'Elite membership required for borrowing');
  END IF;
  
  IF NOT COALESCE(v_profile.is_kyc_verified, false) THEN
    RETURN json_build_object('success', false, 'error', 'KYC verification required for borrowing');
  END IF;

  -- Lock loan row for update to prevent race conditions
  SELECT * INTO v_loan
  FROM loans
  WHERE id = p_loan_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Loan offer not found');
  END IF;
  
  IF v_loan.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Loan offer is no longer available');
  END IF;
  
  IF v_loan.lender_id = p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'You cannot borrow from your own offer');
  END IF;

  -- Lock borrower's wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Borrower wallet not found');
  END IF;

  -- Calculate due date
  v_due_date := NOW() + (v_loan.term_days || ' days')::INTERVAL;

  -- Update loan to active
  UPDATE loans
  SET borrower_id = p_user_id,
      status = 'active',
      accepted_at = NOW(),
      due_at = v_due_date
  WHERE id = p_loan_id;

  -- Credit borrower's wallet
  UPDATE wallets
  SET balance = balance + v_loan.principal_amount, updated_at = NOW()
  WHERE id = v_wallet.id;

  -- Log loan transaction
  INSERT INTO loan_transactions (
    loan_id, user_id, to_wallet_id, amount, transaction_type, description
  ) VALUES (
    p_loan_id, p_user_id, v_wallet.id, v_loan.principal_amount,
    'disbursement', 'Loan disbursed - ₳' || v_loan.principal_amount::TEXT
  );

  -- Log wallet transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_wallet.id, p_user_id, v_loan.principal_amount,
    'loan_received', 'Loan received', p_loan_id
  );

  RETURN json_build_object(
    'success', true,
    'loan_id', p_loan_id,
    'principal_amount', v_loan.principal_amount,
    'interest_amount', v_loan.interest_amount,
    'total_repayment', v_loan.total_repayment,
    'due_at', v_due_date,
    'new_balance', v_wallet.balance + v_loan.principal_amount
  );
END;
$$;

-- 3. Cancel Offer: Lock loan and wallet, update state, refund funds - all atomic
CREATE OR REPLACE FUNCTION public.lending_cancel_offer(
  p_user_id UUID,
  p_loan_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_loan loans%ROWTYPE;
  v_wallet wallets%ROWTYPE;
BEGIN
  -- Validate input
  IF p_loan_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Loan ID is required');
  END IF;

  -- Lock loan row for update
  SELECT * INTO v_loan
  FROM loans
  WHERE id = p_loan_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Loan offer not found');
  END IF;
  
  IF v_loan.lender_id != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'You can only cancel your own offers');
  END IF;
  
  IF v_loan.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Only pending offers can be cancelled');
  END IF;

  -- Lock lender's wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'main'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  -- Update loan to cancelled
  UPDATE loans SET status = 'cancelled' WHERE id = p_loan_id;

  -- Refund principal to lender (fee is non-refundable)
  UPDATE wallets
  SET balance = balance + v_loan.principal_amount, updated_at = NOW()
  WHERE id = v_wallet.id;

  -- Log loan transaction
  INSERT INTO loan_transactions (
    loan_id, user_id, to_wallet_id, amount, transaction_type, description
  ) VALUES (
    p_loan_id, p_user_id, v_wallet.id, v_loan.principal_amount,
    'escrow_release', 'Loan offer cancelled - ₳' || v_loan.principal_amount::TEXT || ' returned'
  );

  -- Log wallet transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_wallet.id, p_user_id, v_loan.principal_amount,
    'escrow_refund', 'Escrow refund for cancelled loan offer', p_loan_id
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Loan offer cancelled successfully',
    'refunded_amount', v_loan.principal_amount,
    'new_balance', v_wallet.balance + v_loan.principal_amount
  );
END;
$$;

-- 4. Repay Loan: Lock loan and both wallets, transfer funds, update state - all atomic
CREATE OR REPLACE FUNCTION public.lending_repay_loan(
  p_user_id UUID,
  p_loan_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_loan loans%ROWTYPE;
  v_borrower_wallet wallets%ROWTYPE;
  v_lender_wallet wallets%ROWTYPE;
  v_repayment_amount NUMERIC;
BEGIN
  -- Validate input
  IF p_loan_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Loan ID is required');
  END IF;

  -- Lock loan row for update
  SELECT * INTO v_loan
  FROM loans
  WHERE id = p_loan_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Loan not found');
  END IF;
  
  IF v_loan.borrower_id != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'You can only repay your own loans');
  END IF;
  
  IF v_loan.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Only active loans can be repaid');
  END IF;

  -- Calculate repayment amount
  v_repayment_amount := COALESCE(v_loan.total_repayment, 
    v_loan.principal_amount + COALESCE(v_loan.interest_amount, 0));

  -- Lock borrower's wallet (lock in consistent order by user_id to prevent deadlocks)
  IF p_user_id < v_loan.lender_id THEN
    SELECT * INTO v_borrower_wallet
    FROM wallets WHERE user_id = p_user_id AND wallet_type = 'main'
    FOR UPDATE;
    
    SELECT * INTO v_lender_wallet
    FROM wallets WHERE user_id = v_loan.lender_id AND wallet_type = 'main'
    FOR UPDATE;
  ELSE
    SELECT * INTO v_lender_wallet
    FROM wallets WHERE user_id = v_loan.lender_id AND wallet_type = 'main'
    FOR UPDATE;
    
    SELECT * INTO v_borrower_wallet
    FROM wallets WHERE user_id = p_user_id AND wallet_type = 'main'
    FOR UPDATE;
  END IF;
  
  IF v_borrower_wallet.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Borrower wallet not found');
  END IF;
  
  IF v_lender_wallet.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Lender wallet not found');
  END IF;

  -- Check sufficient balance
  IF v_borrower_wallet.balance < v_repayment_amount THEN
    RETURN json_build_object('success', false, 'error', 
      'Insufficient balance. You need ₳' || v_repayment_amount::TEXT || ' to repay this loan.');
  END IF;

  -- Deduct from borrower
  UPDATE wallets
  SET balance = balance - v_repayment_amount, updated_at = NOW()
  WHERE id = v_borrower_wallet.id;

  -- Credit lender
  UPDATE wallets
  SET balance = balance + v_repayment_amount, updated_at = NOW()
  WHERE id = v_lender_wallet.id;

  -- Update loan to repaid
  UPDATE loans
  SET status = 'repaid', repaid_at = NOW()
  WHERE id = p_loan_id;

  -- Log loan transaction
  INSERT INTO loan_transactions (
    loan_id, user_id, from_wallet_id, to_wallet_id, amount, transaction_type, description
  ) VALUES (
    p_loan_id, p_user_id, v_borrower_wallet.id, v_lender_wallet.id, v_repayment_amount,
    'repayment', 'Loan repaid - ₳' || v_repayment_amount::TEXT || 
      ' (Principal: ₳' || v_loan.principal_amount::TEXT || 
      ', Interest: ₳' || COALESCE(v_loan.interest_amount, 0)::TEXT || ')'
  );

  -- Log wallet transactions
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES 
    (v_borrower_wallet.id, p_user_id, -v_repayment_amount, 'loan_repayment', 'Loan repayment to lender', p_loan_id),
    (v_lender_wallet.id, v_loan.lender_id, v_repayment_amount, 'loan_received_repayment', 'Loan repayment received from borrower', p_loan_id);

  RETURN json_build_object(
    'success', true,
    'message', 'Loan repaid successfully',
    'loan_id', p_loan_id,
    'principal_amount', v_loan.principal_amount,
    'interest_amount', COALESCE(v_loan.interest_amount, 0),
    'total_repaid', v_repayment_amount,
    'new_balance', v_borrower_wallet.balance - v_repayment_amount
  );
END;
$$;