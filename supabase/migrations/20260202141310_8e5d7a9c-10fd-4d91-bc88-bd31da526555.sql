-- ============================================
-- SOVEREIGN EXECUTION V9.3: CASH-IN AUDIT LEDGER
-- Creates pending deposit approval workflow
-- ============================================

-- 1. CREATE CASH-IN REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.cash_in_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 100 AND amount <= 50000),
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'on_hold')),
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.cash_in_requests ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES - Block anonymous access
CREATE POLICY "Block anonymous cash_in access"
ON public.cash_in_requests
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Users can create their own requests
CREATE POLICY "Users can create own cash_in requests"
ON public.cash_in_requests
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Users can view their own requests
CREATE POLICY "Users can view own cash_in requests"
ON public.cash_in_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Admins can view all requests
CREATE POLICY "Admins can view all cash_in requests"
ON public.cash_in_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Admins can update all requests
CREATE POLICY "Admins can update all cash_in requests"
ON public.cash_in_requests
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. CREATE APPROVE FUNCTION
CREATE OR REPLACE FUNCTION public.approve_cash_in_request(p_request_id UUID, p_admin_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request cash_in_requests%ROWTYPE;
    v_wallet wallets%ROWTYPE;
    v_new_balance NUMERIC;
    v_tx_id UUID;
BEGIN
    -- Verify admin role
    IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    -- Lock the request row
    SELECT * INTO v_request
    FROM cash_in_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_request.status != 'pending' AND v_request.status != 'on_hold' THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed (status: ' || v_request.status || ')');
    END IF;

    -- Lock the user's main wallet
    SELECT * INTO v_wallet
    FROM wallets
    WHERE user_id = v_request.user_id AND wallet_type = 'main'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User wallet not found');
    END IF;

    -- Calculate new balance
    v_new_balance := COALESCE(v_wallet.balance, 0) + v_request.amount;

    -- Update wallet balance atomically
    UPDATE wallets
    SET balance = v_new_balance, updated_at = NOW()
    WHERE id = v_wallet.id;

    -- Update request status
    UPDATE cash_in_requests
    SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;

    -- Log the transaction
    INSERT INTO wallet_transactions (
        wallet_id, user_id, amount, transaction_type, description, reference_id
    ) VALUES (
        v_wallet.id, v_request.user_id, v_request.amount,
        'cash_in', 'Cash-in via ' || v_request.payment_method || 
            CASE WHEN v_request.reference_number IS NOT NULL 
                THEN ' (Ref: ' || v_request.reference_number || ')' 
                ELSE '' END,
        p_request_id
    ) RETURNING id INTO v_tx_id;

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'amount', v_request.amount,
        'new_balance', v_new_balance,
        'user_id', v_request.user_id
    );
END;
$$;

-- 9. CREATE REJECT FUNCTION
CREATE OR REPLACE FUNCTION public.reject_cash_in_request(p_request_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT 'Payment could not be verified')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request cash_in_requests%ROWTYPE;
BEGIN
    -- Verify admin role
    IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    -- Lock the request row
    SELECT * INTO v_request
    FROM cash_in_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_request.status != 'pending' AND v_request.status != 'on_hold' THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed (status: ' || v_request.status || ')');
    END IF;

    -- Update request status
    UPDATE cash_in_requests
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

-- 10. CREATE HOLD FUNCTION
CREATE OR REPLACE FUNCTION public.hold_cash_in_request(p_request_id UUID, p_admin_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request cash_in_requests%ROWTYPE;
BEGIN
    -- Verify admin role
    IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    -- Lock the request row
    SELECT * INTO v_request
    FROM cash_in_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_request.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Only pending requests can be put on hold');
    END IF;

    -- Update request status
    UPDATE cash_in_requests
    SET status = 'on_hold', updated_at = NOW()
    WHERE id = p_request_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Request put on hold'
    );
END;
$$;

-- 11. Add index for performance
CREATE INDEX IF NOT EXISTS idx_cash_in_requests_status ON cash_in_requests(status);
CREATE INDEX IF NOT EXISTS idx_cash_in_requests_user_id ON cash_in_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_in_requests_created_at ON cash_in_requests(created_at DESC);