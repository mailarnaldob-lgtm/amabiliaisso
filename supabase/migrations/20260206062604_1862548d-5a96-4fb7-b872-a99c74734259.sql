-- ═══════════════════════════════════════════════════════════════════════════
-- SOVEREIGN V12.1: SECURE NETWORK STATS & REFERRAL CONFIRMATIONS VIEWS
-- Fixes: network_stats_view_public_exposure, referral_confirmations_view_public_exposure
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: DROP AND RECREATE network_stats VIEW WITH security_invoker
-- ═══════════════════════════════════════════════════════════════════════════
DROP VIEW IF EXISTS public.network_stats;

CREATE VIEW public.network_stats 
WITH (security_invoker = true) AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.membership_tier,
    p.referred_by AS upline_id,
    (SELECT count(*) FROM profiles WHERE profiles.referred_by = p.id) AS direct_referrals,
    COALESCE(
        (SELECT sum(nc.commission_amount) 
         FROM network_commissions nc 
         WHERE nc.upline_id = p.id AND nc.is_credited = true), 
        0
    ) AS total_network_earnings,
    p.created_at
FROM profiles p
WHERE 
    -- Users can only see their own network stats
    auth.uid() = p.id 
    -- OR they are an admin
    OR has_role(auth.uid(), 'admin'::app_role);

COMMENT ON VIEW public.network_stats IS 
'User network statistics with security_invoker=true for RLS enforcement. Users can only view their own network data.';

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: DROP AND RECREATE referral_confirmations VIEW WITH security_invoker
-- This view already has WHERE filters but needs security_invoker = true
-- ═══════════════════════════════════════════════════════════════════════════
DROP VIEW IF EXISTS public.referral_confirmations;

CREATE VIEW public.referral_confirmations
WITH (security_invoker = true) AS
SELECT 
    rc.id,
    rc.referrer_id,
    rc.referred_id,
    rc.membership_tier,
    rc.is_paid,
    rc.created_at
FROM referral_commissions rc
WHERE 
    -- Referrer can see their own commission records
    rc.referrer_id = auth.uid()
    -- Referred user can see their confirmation status (not amounts)
    OR rc.referred_id = auth.uid()
    -- Admins can view all
    OR has_role(auth.uid(), 'admin'::app_role);

COMMENT ON VIEW public.referral_confirmations IS 
'Referral confirmations with security_invoker=true for RLS enforcement. Excludes sensitive commission amounts for referred users.';

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: GRANT SELECT permissions to authenticated users
-- ═══════════════════════════════════════════════════════════════════════════
GRANT SELECT ON public.network_stats TO authenticated;
GRANT SELECT ON public.referral_confirmations TO authenticated;

-- Revoke from anon to ensure no public access
REVOKE ALL ON public.network_stats FROM anon;
REVOKE ALL ON public.referral_confirmations FROM anon;