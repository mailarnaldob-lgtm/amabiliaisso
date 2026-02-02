-- =====================================================
-- ELITE VAULTS TABLE - Blueprint V8.0 Sovereign Architecture
-- Dedicated vault for Elite members with collateral management
-- =====================================================

-- Create elite_vaults table
CREATE TABLE IF NOT EXISTS public.elite_vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    frozen_collateral NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    available_balance NUMERIC(18,2) GENERATED ALWAYS AS (total_balance - frozen_collateral) STORED,
    last_yield_accrual TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT positive_balance CHECK (total_balance >= 0),
    CONSTRAINT positive_frozen CHECK (frozen_collateral >= 0),
    CONSTRAINT frozen_not_exceeds_total CHECK (frozen_collateral <= total_balance)
);

-- Create vault_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.vault_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID NOT NULL REFERENCES public.elite_vaults(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'deposit', 'withdraw', 'yield', 'freeze', 'unfreeze'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on elite_vaults
ALTER TABLE public.elite_vaults ENABLE ROW LEVEL SECURITY;

-- Elite members can view their own vault
CREATE POLICY "Elite users can view own vault"
    ON public.elite_vaults FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.membership_tier = 'elite'
        )
    );

-- Block anonymous access
CREATE POLICY "Block anonymous vault access"
    ON public.elite_vaults FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);

-- Admins can view all vaults
CREATE POLICY "Admins can view all vaults"
    ON public.elite_vaults FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all vaults
CREATE POLICY "Admins can manage all vaults"
    ON public.elite_vaults FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Prevent direct client inserts (use RPC only)
CREATE POLICY "No direct vault inserts"
    ON public.elite_vaults FOR INSERT
    TO authenticated
    WITH CHECK (false);

-- Enable RLS on vault_transactions
ALTER TABLE public.vault_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own vault transactions
CREATE POLICY "Users can view own vault transactions"
    ON public.vault_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view all vault transactions
CREATE POLICY "Admins can view all vault transactions"
    ON public.vault_transactions FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Block direct inserts (use RPC only)
CREATE POLICY "No direct vault tx inserts"
    ON public.vault_transactions FOR INSERT
    TO authenticated
    WITH CHECK (false);

-- Transactions are immutable
CREATE POLICY "Vault transactions immutable"
    ON public.vault_transactions FOR UPDATE
    TO authenticated
    USING (false);

CREATE POLICY "Vault transactions no delete"
    ON public.vault_transactions FOR DELETE
    TO authenticated
    USING (false);

-- =====================================================
-- VAULT DEPOSIT RPC - Transfer from Main Wallet to Vault
-- =====================================================
CREATE OR REPLACE FUNCTION public.vault_deposit(
    p_user_id UUID,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_main_wallet_id UUID;
    v_main_balance NUMERIC;
    v_vault_id UUID;
    v_vault_balance NUMERIC;
    v_new_vault_balance NUMERIC;
    v_membership_tier TEXT;
BEGIN
    -- Verify caller is the user
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'ERR_AUTH_002');
    END IF;

    -- Validate amount
    IF p_amount IS NULL OR p_amount < 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Minimum vault deposit is ₳100');
    END IF;

    -- Check Elite membership
    SELECT membership_tier INTO v_membership_tier
    FROM profiles WHERE id = p_user_id;

    IF v_membership_tier != 'elite' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vault access requires Elite membership');
    END IF;

    -- Lock main wallet
    SELECT id, balance INTO v_main_wallet_id, v_main_balance
    FROM wallets
    WHERE user_id = p_user_id AND wallet_type = 'main'
    FOR UPDATE;

    IF v_main_wallet_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Main wallet not found');
    END IF;

    IF v_main_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'ERR_BALANCE_001');
    END IF;

    -- Get or create vault
    SELECT id, total_balance INTO v_vault_id, v_vault_balance
    FROM elite_vaults
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_vault_id IS NULL THEN
        -- Create vault for Elite member
        INSERT INTO elite_vaults (user_id, total_balance)
        VALUES (p_user_id, 0)
        RETURNING id, total_balance INTO v_vault_id, v_vault_balance;
    END IF;

    -- Deduct from main wallet
    UPDATE wallets
    SET balance = balance - p_amount, updated_at = now()
    WHERE id = v_main_wallet_id;

    -- Add to vault
    v_new_vault_balance := v_vault_balance + p_amount;
    UPDATE elite_vaults
    SET total_balance = v_new_vault_balance, updated_at = now()
    WHERE id = v_vault_id;

    -- Log wallet transaction
    INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
    VALUES (v_main_wallet_id, p_user_id, -p_amount, 'vault_deposit', 'Deposit to Elite Vault');

    -- Log vault transaction
    INSERT INTO vault_transactions (vault_id, user_id, amount, transaction_type, description)
    VALUES (v_vault_id, p_user_id, p_amount, 'deposit', 'Deposit from Main Wallet');

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Vault deposit successful',
        'amount', p_amount,
        'new_vault_balance', v_new_vault_balance,
        'new_main_balance', v_main_balance - p_amount
    );
END;
$$;

-- =====================================================
-- VAULT WITHDRAW RPC - Transfer from Vault to Main Wallet
-- =====================================================
CREATE OR REPLACE FUNCTION public.vault_withdraw(
    p_user_id UUID,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_main_wallet_id UUID;
    v_main_balance NUMERIC;
    v_vault_id UUID;
    v_vault_balance NUMERIC;
    v_frozen NUMERIC;
    v_available NUMERIC;
    v_new_vault_balance NUMERIC;
BEGIN
    -- Verify caller is the user
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'ERR_AUTH_002');
    END IF;

    -- Validate amount
    IF p_amount IS NULL OR p_amount < 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Minimum withdrawal is ₳1');
    END IF;

    -- Lock vault first
    SELECT id, total_balance, frozen_collateral INTO v_vault_id, v_vault_balance, v_frozen
    FROM elite_vaults
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_vault_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vault not found');
    END IF;

    v_available := v_vault_balance - v_frozen;

    IF v_available < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient available balance. Frozen collateral: ₳' || v_frozen::TEXT);
    END IF;

    -- Lock main wallet
    SELECT id, balance INTO v_main_wallet_id, v_main_balance
    FROM wallets
    WHERE user_id = p_user_id AND wallet_type = 'main'
    FOR UPDATE;

    IF v_main_wallet_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Main wallet not found');
    END IF;

    -- Deduct from vault
    v_new_vault_balance := v_vault_balance - p_amount;
    UPDATE elite_vaults
    SET total_balance = v_new_vault_balance, updated_at = now()
    WHERE id = v_vault_id;

    -- Add to main wallet
    UPDATE wallets
    SET balance = balance + p_amount, updated_at = now()
    WHERE id = v_main_wallet_id;

    -- Log vault transaction
    INSERT INTO vault_transactions (vault_id, user_id, amount, transaction_type, description)
    VALUES (v_vault_id, p_user_id, -p_amount, 'withdraw', 'Withdraw to Main Wallet');

    -- Log wallet transaction
    INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description)
    VALUES (v_main_wallet_id, p_user_id, p_amount, 'vault_withdraw', 'Withdraw from Elite Vault');

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Vault withdrawal successful',
        'amount', p_amount,
        'new_vault_balance', v_new_vault_balance,
        'new_main_balance', v_main_balance + p_amount,
        'frozen_collateral', v_frozen
    );
END;
$$;

-- =====================================================
-- CALCULATE VAULT YIELD RPC - 1% Daily on Total Balance
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_vault_yield()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_vault RECORD;
    v_yield NUMERIC;
    v_processed INT := 0;
    v_total_yield NUMERIC := 0;
BEGIN
    -- Process all active Elite vaults
    FOR v_vault IN
        SELECT ev.id, ev.user_id, ev.total_balance, ev.last_yield_accrual
        FROM elite_vaults ev
        JOIN profiles p ON ev.user_id = p.id
        WHERE ev.is_active = true
          AND p.membership_tier = 'elite'
          AND ev.total_balance > 0
          AND (ev.last_yield_accrual IS NULL OR ev.last_yield_accrual < CURRENT_DATE)
        FOR UPDATE OF ev
    LOOP
        -- Calculate 1% daily yield (floor to whole peso)
        v_yield := FLOOR(v_vault.total_balance * 0.01);

        IF v_yield > 0 THEN
            -- Add yield to vault
            UPDATE elite_vaults
            SET total_balance = total_balance + v_yield,
                last_yield_accrual = now(),
                updated_at = now()
            WHERE id = v_vault.id;

            -- Log yield transaction
            INSERT INTO vault_transactions (vault_id, user_id, amount, transaction_type, description)
            VALUES (v_vault.id, v_vault.user_id, v_yield, 'yield', 
                    '1% Daily Yield (Balance: ₳' || v_vault.total_balance::TEXT || ')');

            v_processed := v_processed + 1;
            v_total_yield := v_total_yield + v_yield;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'processed', v_processed,
        'total_yield_distributed', v_total_yield
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.vault_deposit(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vault_withdraw(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_vault_yield() TO service_role;

-- Enable realtime for vault updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.elite_vaults;