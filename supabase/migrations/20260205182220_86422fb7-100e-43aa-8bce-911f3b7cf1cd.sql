
-- Fix: Change network_stats view to SECURITY INVOKER (default, safe)
DROP VIEW IF EXISTS public.network_stats;

CREATE VIEW public.network_stats 
WITH (security_invoker = true)
AS
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

-- Note: referral_confirmations view already has security built into WHERE clause
-- It filters by auth.uid() = referrer_id OR referred_id OR has_role admin
