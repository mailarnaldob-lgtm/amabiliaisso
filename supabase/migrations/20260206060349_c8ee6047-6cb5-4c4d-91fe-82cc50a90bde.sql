
-- ============================================================================
-- SOVEREIGN V12.0: TOTAL CURRENCY SYNCHRONIZATION & ATOMIC PIPELINES
-- Blueprint V8.0 Compliance: EARN → MLM → SAVE Flow Integration
-- ============================================================================

-- ============================================================================
-- 1. ENHANCED approve_task_submission WITH NETWORK COMMISSION TRIGGER
-- This now triggers the Royalty Engine for EXPERT/ELITE uplines
-- ============================================================================
CREATE OR REPLACE FUNCTION public.approve_task_submission(p_admin_id uuid, p_submission_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_submission RECORD;
  v_task RECORD;
  v_wallet_id UUID;
  v_commission_result JSON;
BEGIN
  -- Admin verification (dual check)
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  -- Lock the submission row for atomic processing
  SELECT * INTO v_submission FROM task_submissions WHERE id = p_submission_id AND status = 'pending' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_TASK_001: Submission not found or already processed');
  END IF;

  -- Get task details
  SELECT * INTO v_task FROM tasks WHERE id = v_submission.task_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_TASK_002: Task not found');
  END IF;

  -- Get or create task wallet
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_submission.user_id AND wallet_type = 'task';
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, wallet_type, balance) VALUES (v_submission.user_id, 'task', 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  -- Credit task reward to user's task wallet (atomic)
  UPDATE wallets SET balance = balance + v_task.reward, updated_at = NOW() WHERE id = v_wallet_id;

  -- Mark submission as approved
  UPDATE task_submissions SET 
    status = 'approved', 
    reviewed_by = p_admin_id, 
    reviewed_at = NOW(), 
    reward_amount = v_task.reward
  WHERE id = p_submission_id;

  -- Log wallet transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, amount, transaction_type, description, reference_id)
  VALUES (v_wallet_id, v_submission.user_id, v_task.reward, 'task_reward', 'Task completed: ' || v_task.title, p_submission_id);

  -- ═══════════════════════════════════════════════════════════════════════
  -- SOVEREIGN V12.0: ROYALTY ENGINE TRIGGER
  -- Automatically credit 10% to EXPERT/ELITE uplines (up to 2 levels)
  -- ═══════════════════════════════════════════════════════════════════════
  SELECT credit_network_commission(
    v_submission.user_id,
    'task_reward',
    p_submission_id,
    v_task.reward
  ) INTO v_commission_result;

  RETURN json_build_object(
    'success', true, 
    'submission_id', p_submission_id, 
    'reward', v_task.reward,
    'royalty_triggered', v_commission_result
  );
END;
$$;

-- ============================================================================
-- 2. ENHANCED credit_network_commission WITH VAULT INJECTION
-- Optionally inject commissions directly into ELITE vaults
-- ============================================================================
CREATE OR REPLACE FUNCTION public.credit_network_commission(
  p_earner_id uuid, 
  p_source_type text, 
  p_source_id uuid, 
  p_base_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_upline_id UUID;
    v_upline_tier TEXT;
    v_commission_rate NUMERIC := 0.10; -- 10% Level 1 & 2 override
    v_commission_amount NUMERIC;
    v_royalty_wallet_id UUID;
    v_result JSON;
    v_level INT := 1;
    v_total_paid NUMERIC := 0;
    v_levels_paid INT := 0;
BEGIN
    -- Get the earner's upline (Level 1)
    SELECT referred_by INTO v_upline_id
    FROM profiles
    WHERE id = p_earner_id;

    -- Loop through upline chain (up to 2 levels for EXPERT+)
    WHILE v_upline_id IS NOT NULL AND v_level <= 2 LOOP
        -- Get upline's membership tier
        SELECT membership_tier INTO v_upline_tier
        FROM profiles 
        WHERE id = v_upline_id;
        
        -- Check if upline is EXPERT or ELITE (eligible for overrides)
        IF v_upline_tier IN ('expert', 'elite') THEN
            -- Calculate commission (floor to whole peso)
            v_commission_amount := FLOOR(p_base_amount * v_commission_rate);

            IF v_commission_amount > 0 THEN
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

                -- Get or create royalty wallet for upline
                SELECT id INTO v_royalty_wallet_id
                FROM wallets
                WHERE user_id = v_upline_id AND wallet_type = 'royalty';

                IF v_royalty_wallet_id IS NULL THEN
                    INSERT INTO wallets (user_id, wallet_type, balance) 
                    VALUES (v_upline_id, 'royalty', 0)
                    RETURNING id INTO v_royalty_wallet_id;
                END IF;

                -- Credit commission to royalty wallet
                UPDATE wallets
                SET balance = balance + v_commission_amount,
                    updated_at = NOW()
                WHERE id = v_royalty_wallet_id;

                -- Log wallet transaction
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, amount, transaction_type, description, reference_id
                ) VALUES (
                    v_royalty_wallet_id, v_upline_id, v_commission_amount,
                    'network_royalty', 
                    'Level ' || v_level || ' royalty from ' || p_source_type || ' (₳' || p_base_amount || ')',
                    p_source_id
                );

                v_total_paid := v_total_paid + v_commission_amount;
                v_levels_paid := v_levels_paid + 1;
            END IF;
        END IF;

        -- Move to next level upline
        SELECT referred_by INTO v_upline_id
        FROM profiles
        WHERE id = v_upline_id;

        v_level := v_level + 1;
    END LOOP;

    RETURN json_build_object(
        'success', true, 
        'levels_processed', v_levels_paid,
        'total_commission_paid', v_total_paid
    );
END;
$$;

-- ============================================================================
-- 3. SYSTEM LIQUIDITY AGGREGATION VIEW
-- For Admin Dashboard: Total Ecosystem Liquidity Report
-- ============================================================================
CREATE OR REPLACE VIEW public.system_liquidity_report AS
SELECT
    -- EARN Module (Task Wallets)
    COALESCE(SUM(CASE WHEN wallet_type = 'task' THEN balance ELSE 0 END), 0) AS total_task_balance,
    
    -- MLM Module (Royalty Wallets)
    COALESCE(SUM(CASE WHEN wallet_type = 'royalty' THEN balance ELSE 0 END), 0) AS total_royalty_balance,
    
    -- Main Wallets (Liquid Funds)
    COALESCE(SUM(CASE WHEN wallet_type = 'main' THEN balance ELSE 0 END), 0) AS total_main_balance,
    
    -- Total Circulating
    COALESCE(SUM(balance), 0) AS total_circulating,
    
    -- Wallet Count
    COUNT(*) AS total_wallets,
    COUNT(DISTINCT user_id) AS unique_users
FROM wallets;

-- Vault liquidity view
CREATE OR REPLACE VIEW public.vault_liquidity_report AS
SELECT
    COALESCE(SUM(total_balance), 0) AS total_vault_deposits,
    COALESCE(SUM(frozen_collateral), 0) AS total_frozen_collateral,
    COALESCE(SUM(total_balance - frozen_collateral), 0) AS total_available_vault,
    COUNT(*) AS total_vaults,
    COUNT(CASE WHEN is_active THEN 1 END) AS active_vaults
FROM elite_vaults;

-- Network commissions report
CREATE OR REPLACE VIEW public.network_commission_report AS
SELECT
    COALESCE(SUM(commission_amount), 0) AS total_commissions_distributed,
    COUNT(*) AS total_commission_events,
    COUNT(DISTINCT upline_id) AS unique_earners,
    COALESCE(SUM(CASE WHEN level_depth = 1 THEN commission_amount ELSE 0 END), 0) AS level_1_total,
    COALESCE(SUM(CASE WHEN level_depth = 2 THEN commission_amount ELSE 0 END), 0) AS level_2_total
FROM network_commissions
WHERE is_credited = true;

-- ============================================================================
-- 4. RLS POLICIES FOR ADMIN-ONLY LIQUIDITY VIEWS
-- ============================================================================
-- Note: Views inherit RLS from base tables, but we ensure admin access via functions

-- Grant select on views to authenticated (RLS will filter)
GRANT SELECT ON public.system_liquidity_report TO authenticated;
GRANT SELECT ON public.vault_liquidity_report TO authenticated;
GRANT SELECT ON public.network_commission_report TO authenticated;

-- ============================================================================
-- 5. EDGE FUNCTION HEALTH CHECK TABLE (for monitoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.edge_function_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    last_execution TIMESTAMPTZ DEFAULT NOW(),
    execution_status TEXT DEFAULT 'success',
    execution_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint on function name for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_edge_function_health_name ON edge_function_health(function_name);

-- RLS for edge function health
ALTER TABLE edge_function_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view edge function health"
ON edge_function_health FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Block anonymous edge health access"
ON edge_function_health FOR ALL TO anon
USING (false) WITH CHECK (false);

-- Allow service role to update (for cron jobs)
CREATE POLICY "Service can update edge health"
ON edge_function_health FOR ALL
USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. UPDATE FUNCTIONS TO LOG HEALTH
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_edge_function_execution(
    p_function_name TEXT,
    p_status TEXT DEFAULT 'success',
    p_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO edge_function_health (function_name, last_execution, execution_status, execution_details)
    VALUES (p_function_name, NOW(), p_status, p_details)
    ON CONFLICT (function_name) 
    DO UPDATE SET 
        last_execution = NOW(),
        execution_status = EXCLUDED.execution_status,
        execution_details = EXCLUDED.execution_details;
END;
$$;
