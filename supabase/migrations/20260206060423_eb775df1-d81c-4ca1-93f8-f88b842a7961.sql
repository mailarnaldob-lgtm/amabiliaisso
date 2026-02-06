
-- ============================================================================
-- FIX: SECURITY DEFINER VIEW & PERMISSIVE RLS ISSUES
-- Converting views to SECURITY INVOKER and fixing edge_function_health RLS
-- ============================================================================

-- 1. Drop the overly permissive policy
DROP POLICY IF EXISTS "Service can update edge health" ON edge_function_health;

-- 2. Create proper admin-only policies for edge_function_health
CREATE POLICY "Admins can manage edge health"
ON edge_function_health FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Recreate views with SECURITY INVOKER (explicit, safer)
DROP VIEW IF EXISTS public.system_liquidity_report;
DROP VIEW IF EXISTS public.vault_liquidity_report;
DROP VIEW IF EXISTS public.network_commission_report;

-- System Liquidity Report (admin access via base table RLS)
CREATE VIEW public.system_liquidity_report 
WITH (security_invoker = true)
AS
SELECT
    COALESCE(SUM(CASE WHEN wallet_type = 'task' THEN balance ELSE 0 END), 0) AS total_task_balance,
    COALESCE(SUM(CASE WHEN wallet_type = 'royalty' THEN balance ELSE 0 END), 0) AS total_royalty_balance,
    COALESCE(SUM(CASE WHEN wallet_type = 'main' THEN balance ELSE 0 END), 0) AS total_main_balance,
    COALESCE(SUM(balance), 0) AS total_circulating,
    COUNT(*) AS total_wallets,
    COUNT(DISTINCT user_id) AS unique_users
FROM wallets;

-- Vault Liquidity Report
CREATE VIEW public.vault_liquidity_report 
WITH (security_invoker = true)
AS
SELECT
    COALESCE(SUM(total_balance), 0) AS total_vault_deposits,
    COALESCE(SUM(frozen_collateral), 0) AS total_frozen_collateral,
    COALESCE(SUM(total_balance - frozen_collateral), 0) AS total_available_vault,
    COUNT(*) AS total_vaults,
    COUNT(CASE WHEN is_active THEN 1 END) AS active_vaults
FROM elite_vaults;

-- Network Commission Report
CREATE VIEW public.network_commission_report 
WITH (security_invoker = true)
AS
SELECT
    COALESCE(SUM(commission_amount), 0) AS total_commissions_distributed,
    COUNT(*) AS total_commission_events,
    COUNT(DISTINCT upline_id) AS unique_earners,
    COALESCE(SUM(CASE WHEN level_depth = 1 THEN commission_amount ELSE 0 END), 0) AS level_1_total,
    COALESCE(SUM(CASE WHEN level_depth = 2 THEN commission_amount ELSE 0 END), 0) AS level_2_total
FROM network_commissions
WHERE is_credited = true;

-- 4. Grant select on views to authenticated
GRANT SELECT ON public.system_liquidity_report TO authenticated;
GRANT SELECT ON public.vault_liquidity_report TO authenticated;
GRANT SELECT ON public.network_commission_report TO authenticated;

-- 5. Create RPC function for admin to fetch liquidity stats
-- (since views will now respect RLS of the caller)
CREATE OR REPLACE FUNCTION public.get_system_liquidity_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_wallet_stats RECORD;
    v_vault_stats RECORD;
    v_commission_stats RECORD;
BEGIN
    -- Only admins can access
    IF NOT has_role(auth.uid(), 'admin') THEN
        RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001');
    END IF;

    -- Wallet liquidity
    SELECT 
        COALESCE(SUM(CASE WHEN wallet_type = 'task' THEN balance ELSE 0 END), 0) AS task_total,
        COALESCE(SUM(CASE WHEN wallet_type = 'royalty' THEN balance ELSE 0 END), 0) AS royalty_total,
        COALESCE(SUM(CASE WHEN wallet_type = 'main' THEN balance ELSE 0 END), 0) AS main_total,
        COALESCE(SUM(balance), 0) AS circulating_total,
        COUNT(DISTINCT user_id) AS unique_users
    INTO v_wallet_stats
    FROM wallets;

    -- Vault liquidity
    SELECT 
        COALESCE(SUM(total_balance), 0) AS deposits_total,
        COALESCE(SUM(frozen_collateral), 0) AS frozen_total,
        COUNT(*) AS vault_count,
        COUNT(CASE WHEN is_active THEN 1 END) AS active_count
    INTO v_vault_stats
    FROM elite_vaults;

    -- Commission stats
    SELECT 
        COALESCE(SUM(commission_amount), 0) AS total_paid,
        COUNT(*) AS event_count,
        COUNT(DISTINCT upline_id) AS earner_count
    INTO v_commission_stats
    FROM network_commissions
    WHERE is_credited = true;

    RETURN json_build_object(
        'success', true,
        'wallets', json_build_object(
            'task_total', v_wallet_stats.task_total,
            'royalty_total', v_wallet_stats.royalty_total,
            'main_total', v_wallet_stats.main_total,
            'circulating_total', v_wallet_stats.circulating_total,
            'unique_users', v_wallet_stats.unique_users
        ),
        'vaults', json_build_object(
            'deposits_total', v_vault_stats.deposits_total,
            'frozen_total', v_vault_stats.frozen_total,
            'vault_count', v_vault_stats.vault_count,
            'active_count', v_vault_stats.active_count
        ),
        'commissions', json_build_object(
            'total_paid', v_commission_stats.total_paid,
            'event_count', v_commission_stats.event_count,
            'earner_count', v_commission_stats.earner_count
        ),
        'timestamp', NOW()
    );
END;
$$;

-- 6. Get edge function health for admin monitoring
CREATE OR REPLACE FUNCTION public.get_edge_function_health()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_health_data JSON;
BEGIN
    -- Only admins can access
    IF NOT has_role(auth.uid(), 'admin') THEN
        RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001');
    END IF;

    SELECT json_agg(
        json_build_object(
            'function_name', function_name,
            'last_execution', last_execution,
            'execution_status', execution_status,
            'details', execution_details
        )
    ) INTO v_health_data
    FROM edge_function_health
    ORDER BY last_execution DESC;

    RETURN json_build_object(
        'success', true,
        'functions', COALESCE(v_health_data, '[]'::json),
        'timestamp', NOW()
    );
END;
$$;
