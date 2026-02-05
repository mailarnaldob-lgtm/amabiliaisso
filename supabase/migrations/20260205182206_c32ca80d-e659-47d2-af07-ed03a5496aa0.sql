
-- ============================================
-- SOVEREIGN MLM GOVERNANCE ENGINE V1.0
-- Full-stack genealogy, network commissions, and RLS security
-- ============================================

-- 1. NETWORK COMMISSIONS TABLE (Track downline earnings)
CREATE TABLE IF NOT EXISTS public.network_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    earner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upline_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('task', 'upgrade', 'lending', 'referral')),
    source_id UUID,
    base_amount NUMERIC(18,2) NOT NULL CHECK (base_amount > 0),
    commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.10,
    commission_amount NUMERIC(18,2) NOT NULL CHECK (commission_amount >= 0),
    level_depth INT NOT NULL CHECK (level_depth BETWEEN 1 AND 5),
    is_credited BOOLEAN DEFAULT FALSE,
    credited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NETWORK STATS VIEW (Aggregated team data)
CREATE OR REPLACE VIEW public.network_stats AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.membership_tier,
    p.referred_by AS upline_id,
    (SELECT COUNT(*) FROM profiles WHERE referred_by = p.id) AS direct_referrals,
    COALESCE((
        SELECT SUM(nc.commission_amount) 
        FROM network_commissions nc 
        WHERE nc.upline_id = p.id AND nc.is_credited = TRUE
    ), 0) AS total_network_earnings,
    p.created_at
FROM profiles p;

-- 3. ENABLE RLS ON NEW TABLE
ALTER TABLE public.network_commissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR network_commissions
-- Users can only see commissions where they are the upline (earned) or earner (contributed)
CREATE POLICY "Users can view own network commissions"
ON public.network_commissions FOR SELECT
USING (auth.uid() = upline_id OR auth.uid() = earner_id);

-- Admins can view all network commissions
CREATE POLICY "Admins can view all network commissions"
ON public.network_commissions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can manage all network commissions
CREATE POLICY "Admins can manage network commissions"
ON public.network_commissions FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- No direct inserts from clients (must use RPC)
CREATE POLICY "No direct commission inserts"
ON public.network_commissions FOR INSERT
WITH CHECK (false);

-- Block anonymous access
CREATE POLICY "Block anonymous network commission access"
ON public.network_commissions FOR ALL TO anon
USING (false)
WITH CHECK (false);

-- Commissions are immutable for users
CREATE POLICY "Network commissions immutable"
ON public.network_commissions FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- No deletion allowed
CREATE POLICY "No network commission deletion"
ON public.network_commissions FOR DELETE
USING (false);

-- 5. SECURITY DEFINER FUNCTION: Get user's genealogy tree (recursive)
CREATE OR REPLACE FUNCTION public.get_genealogy_tree(p_user_id UUID, p_max_depth INT DEFAULT 5)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    membership_tier membership_tier,
    referral_code TEXT,
    upline_id UUID,
    level_depth INT,
    direct_referrals BIGINT,
    network_earnings NUMERIC,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Security: Only allow users to view their own downline or admins to view any
    IF p_user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Cannot view other user genealogy';
    END IF;

    RETURN QUERY
    WITH RECURSIVE genealogy AS (
        -- Base case: direct referrals of the user
        SELECT 
            p.id,
            p.full_name,
            p.membership_tier,
            p.referral_code,
            p.referred_by,
            1 AS depth
        FROM profiles p
        WHERE p.referred_by = p_user_id
        
        UNION ALL
        
        -- Recursive case: referrals of referrals
        SELECT 
            p.id,
            p.full_name,
            p.membership_tier,
            p.referral_code,
            p.referred_by,
            g.depth + 1
        FROM profiles p
        INNER JOIN genealogy g ON p.referred_by = g.id
        WHERE g.depth < p_max_depth
    )
    SELECT 
        g.id AS user_id,
        g.full_name,
        g.membership_tier,
        g.referral_code,
        g.referred_by AS upline_id,
        g.depth AS level_depth,
        (SELECT COUNT(*) FROM profiles WHERE referred_by = g.id) AS direct_referrals,
        COALESCE((
            SELECT SUM(nc.commission_amount) 
            FROM network_commissions nc 
            WHERE nc.earner_id = g.id AND nc.upline_id = p_user_id
        ), 0) AS network_earnings,
        (SELECT p.created_at FROM profiles p WHERE p.id = g.id)
    FROM genealogy g
    ORDER BY g.depth, g.full_name;
END;
$$;

-- 6. SECURITY DEFINER FUNCTION: Credit network commission
CREATE OR REPLACE FUNCTION public.credit_network_commission(
    p_earner_id UUID,
    p_source_type TEXT,
    p_source_id UUID,
    p_base_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_upline_id UUID;
    v_commission_rate NUMERIC := 0.10; -- 10% Level 1 & 2 override
    v_commission_amount NUMERIC;
    v_royalty_wallet_id UUID;
    v_result JSON;
    v_level INT := 1;
BEGIN
    -- Get the earner's upline (Level 1)
    SELECT referred_by INTO v_upline_id
    FROM profiles
    WHERE id = p_earner_id;

    -- Loop through upline chain (up to 2 levels for EXPERT+)
    WHILE v_upline_id IS NOT NULL AND v_level <= 2 LOOP
        -- Check if upline is EXPERT or ELITE (eligible for overrides)
        IF EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = v_upline_id 
            AND membership_tier IN ('expert', 'elite')
        ) THEN
            -- Calculate commission
            v_commission_amount := p_base_amount * v_commission_rate;

            -- Insert commission record
            INSERT INTO network_commissions (
                earner_id, upline_id, source_type, source_id,
                base_amount, commission_rate, commission_amount,
                level_depth, is_credited, credited_at
            ) VALUES (
                p_earner_id, v_upline_id, p_source_type, p_source_id,
                p_base_amount, v_commission_rate, v_commission_amount,
                v_level, TRUE, NOW()
            );

            -- Credit to upline's royalty wallet
            SELECT id INTO v_royalty_wallet_id
            FROM wallets
            WHERE user_id = v_upline_id AND wallet_type = 'royalty';

            IF v_royalty_wallet_id IS NOT NULL THEN
                UPDATE wallets
                SET balance = balance + v_commission_amount,
                    updated_at = NOW()
                WHERE id = v_royalty_wallet_id;

                -- Log transaction
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, amount, transaction_type, description, reference_id
                ) VALUES (
                    v_royalty_wallet_id, v_upline_id, v_commission_amount,
                    'network_override', 
                    'Level ' || v_level || ' override from ' || p_source_type,
                    p_source_id
                );
            END IF;
        END IF;

        -- Move to next level upline
        SELECT referred_by INTO v_upline_id
        FROM profiles
        WHERE id = v_upline_id;

        v_level := v_level + 1;
    END LOOP;

    RETURN json_build_object('success', true, 'levels_processed', v_level - 1);
END;
$$;

-- 7. FUNCTION: Get network statistics for user
CREATE OR REPLACE FUNCTION public.get_network_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSON;
    v_direct_count INT;
    v_total_team INT;
    v_total_earnings NUMERIC;
    v_this_month_earnings NUMERIC;
BEGIN
    -- Security check
    IF p_user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Direct referrals count
    SELECT COUNT(*) INTO v_direct_count
    FROM profiles WHERE referred_by = p_user_id;

    -- Total team size (recursive)
    WITH RECURSIVE team AS (
        SELECT id FROM profiles WHERE referred_by = p_user_id
        UNION ALL
        SELECT p.id FROM profiles p
        INNER JOIN team t ON p.referred_by = t.id
    )
    SELECT COUNT(*) INTO v_total_team FROM team;

    -- Total earnings
    SELECT COALESCE(SUM(commission_amount), 0) INTO v_total_earnings
    FROM network_commissions
    WHERE upline_id = p_user_id AND is_credited = TRUE;

    -- This month earnings
    SELECT COALESCE(SUM(commission_amount), 0) INTO v_this_month_earnings
    FROM network_commissions
    WHERE upline_id = p_user_id 
    AND is_credited = TRUE
    AND created_at >= date_trunc('month', CURRENT_DATE);

    RETURN json_build_object(
        'direct_referrals', v_direct_count,
        'total_team_size', v_total_team,
        'total_network_earnings', v_total_earnings,
        'this_month_earnings', v_this_month_earnings
    );
END;
$$;

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_network_commissions_upline ON network_commissions(upline_id);
CREATE INDEX IF NOT EXISTS idx_network_commissions_earner ON network_commissions(earner_id);
CREATE INDEX IF NOT EXISTS idx_network_commissions_source ON network_commissions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_network_commissions_credited ON network_commissions(is_credited, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- 9. GRANT EXECUTE PERMISSIONS
GRANT EXECUTE ON FUNCTION public.get_genealogy_tree TO authenticated;
GRANT EXECUTE ON FUNCTION public.credit_network_commission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_network_stats TO authenticated;
