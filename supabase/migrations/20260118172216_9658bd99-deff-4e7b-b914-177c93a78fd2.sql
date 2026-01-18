-- =====================================================
-- Security Fixes Migration
-- Fixes: profiles exposure, loans exposure, server-side functions
-- =====================================================

-- 1. PROFILES TABLE: Require authentication for all operations
-- Drop existing SELECT policies that may allow unauthenticated access
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Re-create with explicit TO authenticated clause
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. LOANS TABLE: Fix overly permissive pending offers policy
-- Users should only see pending offers (not their own) to browse available loans
DROP POLICY IF EXISTS "Users can view pending offers" ON loans;

CREATE POLICY "Users can view available pending offers"
  ON loans FOR SELECT
  TO authenticated
  USING (
    status = 'pending'::loan_status 
    AND auth.uid() != lender_id 
    AND (borrower_id IS NULL OR auth.uid() != borrower_id)
  );

-- 3. Create approve_task_submission server-side RPC function
-- This replaces client-side admin financial operations with atomic server-side logic
CREATE OR REPLACE FUNCTION public.approve_task_submission(
  p_submission_id UUID,
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission task_submissions%ROWTYPE;
  v_task tasks%ROWTYPE;
  v_user profiles%ROWTYPE;
  v_upline profiles%ROWTYPE;
  v_task_wallet wallets%ROWTYPE;
  v_royalty_wallet wallets%ROWTYPE;
  v_reward NUMERIC;
  v_royalty NUMERIC := 0;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Lock submission row for update to prevent race conditions
  SELECT * INTO v_submission
  FROM task_submissions
  WHERE id = p_submission_id
  FOR UPDATE;
  
  -- Validate submission exists and is pending
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  IF v_submission.status != 'pending' THEN
    RAISE EXCEPTION 'Submission already reviewed (status: %)', v_submission.status;
  END IF;
  
  -- Get task details
  SELECT * INTO v_task FROM tasks WHERE id = v_submission.task_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- Get user details
  SELECT * INTO v_user FROM profiles WHERE id = v_submission.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  v_reward := v_task.reward;
  
  -- Update submission status
  UPDATE task_submissions SET
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    reward_amount = v_reward
  WHERE id = p_submission_id;
  
  -- Get and lock user's task wallet
  SELECT * INTO v_task_wallet
  FROM wallets
  WHERE user_id = v_submission.user_id AND wallet_type = 'task'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User task wallet not found';
  END IF;
  
  -- Credit task wallet atomically
  UPDATE wallets
  SET balance = balance + v_reward, updated_at = NOW()
  WHERE id = v_task_wallet.id;
  
  -- Log task reward transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_task_wallet.id,
    v_submission.user_id,
    v_reward,
    'task_reward',
    'Task: ' || v_task.title,
    p_submission_id
  );
  
  -- Handle Elite upline 8% royalty
  IF v_user.referred_by IS NOT NULL THEN
    SELECT * INTO v_upline FROM profiles WHERE id = v_user.referred_by;
    
    IF FOUND AND v_upline.membership_tier = 'elite' THEN
      v_royalty := v_reward * 0.08;
      
      -- Lock and credit royalty wallet
      SELECT * INTO v_royalty_wallet
      FROM wallets
      WHERE user_id = v_upline.id AND wallet_type = 'royalty'
      FOR UPDATE;
      
      IF FOUND THEN
        UPDATE wallets
        SET balance = balance + v_royalty, updated_at = NOW()
        WHERE id = v_royalty_wallet.id;
        
        -- Log royalty transaction
        INSERT INTO wallet_transactions (
          wallet_id, user_id, amount, transaction_type, description, reference_id
        ) VALUES (
          v_royalty_wallet.id,
          v_upline.id,
          v_royalty,
          'team_override',
          '8% override from ' || v_user.full_name,
          p_submission_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'reward_credited', v_reward,
    'royalty_credited', v_royalty
  );
END;
$$;

-- 4. Create reject_task_submission server-side RPC function
CREATE OR REPLACE FUNCTION public.reject_task_submission(
  p_submission_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT DEFAULT 'Submission did not meet requirements'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission task_submissions%ROWTYPE;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Lock and get submission
  SELECT * INTO v_submission
  FROM task_submissions
  WHERE id = p_submission_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  IF v_submission.status != 'pending' THEN
    RAISE EXCEPTION 'Submission already reviewed (status: %)', v_submission.status;
  END IF;
  
  -- Update submission status
  UPDATE task_submissions SET
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    rejection_reason = p_rejection_reason
  WHERE id = p_submission_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- 5. Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment proofs
CREATE POLICY "Users can upload own payment proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 6. Create approve_membership_payment server-side RPC function
CREATE OR REPLACE FUNCTION public.approve_membership_payment(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment membership_payments%ROWTYPE;
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
  
  -- Update user's membership tier
  UPDATE profiles SET
    membership_tier = v_payment.tier,
    membership_amount = v_payment.amount,
    updated_at = NOW()
  WHERE id = v_payment.user_id;
  
  RETURN json_build_object(
    'success', true,
    'tier', v_payment.tier,
    'user_id', v_payment.user_id
  );
END;
$$;

-- 7. Create reject_membership_payment server-side RPC function
CREATE OR REPLACE FUNCTION public.reject_membership_payment(
  p_payment_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT DEFAULT 'Payment could not be verified'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment membership_payments%ROWTYPE;
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
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    rejection_reason = p_rejection_reason
  WHERE id = p_payment_id;
  
  RETURN json_build_object('success', true);
END;
$$;