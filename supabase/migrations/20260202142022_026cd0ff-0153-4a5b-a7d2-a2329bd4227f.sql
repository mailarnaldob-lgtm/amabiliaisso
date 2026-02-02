-- ============================================
-- SOVEREIGN EXECUTION V9.4: CASH-OUT AUDIT LEDGER
-- Creates pending withdrawal approval workflow
-- ============================================

-- 1. CREATE CASH-OUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.cash_out_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 100),
    fee_amount NUMERIC NOT NULL DEFAULT 0,
    net_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'processing')),
    rejection_reason TEXT,
    has_active_loan BOOLEAN DEFAULT FALSE,
    pin_verified BOOLEAN DEFAULT FALSE,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.cash_out_requests ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES - Block anonymous access
CREATE POLICY "Block anonymous cash_out access"
ON public.cash_out_requests
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Users can create their own requests
CREATE POLICY "Users can create own cash_out requests"
ON public.cash_out_requests
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Users can view their own requests
CREATE POLICY "Users can view own cash_out requests"
ON public.cash_out_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Admins can view all requests
CREATE POLICY "Admins can view all cash_out requests"
ON public.cash_out_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Admins can update all requests
CREATE POLICY "Admins can update all cash_out requests"
ON public.cash_out_requests
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. CREATE APPROVE FUNCTION (with active loan check)
CREATE OR REPLACE FUNCTION public.approve_cash_out_request(p_request_id UUID, p_admin_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request cash_out_requests%ROWTYPE;
    v_active_loans INTEGER;
    v_wallet wallets%ROWTYPE;
    v_total_deduction NUMERIC;
    v_tx_id UUID;
BEGIN
    -- Verify admin role
    IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    -- Lock the request row
    SELECT * INTO v_request
    FROM cash_out_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_request.status NOT IN ('pending', 'flagged') THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed (status: ' || v_request.status || ')');
    END IF;

    -- Check for active loans (ABC rule)
    SELECT COUNT(*) INTO v_active_loans
    FROM loans
    WHERE borrower_id = v_request.user_id AND status = 'active';

    IF v_active_loans > 0 THEN
        -- Flag the request instead of rejecting
        UPDATE cash_out_requests
        SET status = 'flagged', has_active_loan = true, updated_at = NOW()
        WHERE id = p_request_id;
        
        RETURN json_build_object('success', false, 'error', 'User has ' || v_active_loans || ' active loan(s). Withdrawal blocked per ABC rules.');
    END IF;

    -- Lock the user's main wallet
    SELECT * INTO v_wallet
    FROM wallets
    WHERE user_id = v_request.user_id AND wallet_type = 'main'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User wallet not found');
    END IF;

    -- Calculate total deduction (amount + fee)
    v_total_deduction := v_request.amount + v_request.fee_amount;

    -- Verify sufficient balance
    IF v_wallet.balance < v_total_deduction THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient balance. User has ₳' || v_wallet.balance || ' but needs ₳' || v_total_deduction);
    END IF;

    -- Deduct from wallet atomically
    UPDATE wallets
    SET balance = balance - v_total_deduction, updated_at = NOW()
    WHERE id = v_wallet.id;

    -- Update request status
    UPDATE cash_out_requests
    SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;

    -- Log the transaction
    INSERT INTO wallet_transactions (
        wallet_id, user_id, amount, transaction_type, description, reference_id
    ) VALUES (
        v_wallet.id, v_request.user_id, -v_request.amount,
        'cash_out', 'Withdrawal to ' || v_request.payment_method || ' (' || v_request.account_name || ')',
        p_request_id
    ) RETURNING id INTO v_tx_id;

    -- Log the fee transaction
    INSERT INTO wallet_transactions (
        wallet_id, user_id, amount, transaction_type, description, reference_id
    ) VALUES (
        v_wallet.id, v_request.user_id, -v_request.fee_amount,
        'withdrawal_fee', 'Withdrawal fee (₳15 flat)',
        v_tx_id
    );

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'amount', v_request.amount,
        'fee', v_request.fee_amount,
        'net_amount', v_request.net_amount,
        'new_balance', v_wallet.balance - v_total_deduction,
        'user_id', v_request.user_id
    );
END;
$$;

-- 9. CREATE REJECT FUNCTION
CREATE OR REPLACE FUNCTION public.reject_cash_out_request(p_request_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT 'Withdrawal request could not be verified')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request cash_out_requests%ROWTYPE;
BEGIN
    -- Verify admin role
    IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    -- Lock the request row
    SELECT * INTO v_request
    FROM cash_out_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_request.status NOT IN ('pending', 'flagged') THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed (status: ' || v_request.status || ')');
    END IF;

    -- Update request status
    UPDATE cash_out_requests
    SET status = 'rejected', 
        rejection_reason = p_reason,
        reviewed_by = p_admin_id, 
        reviewed_at = NOW(), 
        updated_at = NOW()
    WHERE id = p_request_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Request rejected',
        'user_id', v_request.user_id
    );
END;
$$;

-- 10. CREATE FLAG FUNCTION
CREATE OR REPLACE FUNCTION public.flag_cash_out_request(p_request_id UUID, p_admin_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request cash_out_requests%ROWTYPE;
BEGIN
    -- Verify admin role
    IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    -- Lock the request row
    SELECT * INTO v_request
    FROM cash_out_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_request.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Only pending requests can be flagged');
    END IF;

    -- Update request status
    UPDATE cash_out_requests
    SET status = 'flagged', updated_at = NOW()
    WHERE id = p_request_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Request flagged for review'
    );
END;
$$;

-- 11. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cash_out_requests_status ON cash_out_requests(status);
CREATE INDEX IF NOT EXISTS idx_cash_out_requests_user_id ON cash_out_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_out_requests_created_at ON cash_out_requests(created_at DESC);