
-- ========================================
-- SOVEREIGN DATABASE SCHEMA V10.0
-- Full Schema Optimization & Hardening
-- ========================================

-- 1. ADD VALIDATION TRIGGERS (instead of CHECK constraints for time-based validations)

-- Validate loan amounts and terms
CREATE OR REPLACE FUNCTION validate_loan_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate principal amount (₳500 - ₳50,000)
  IF NEW.principal_amount < 500 OR NEW.principal_amount > 50000 THEN
    RAISE EXCEPTION 'Principal amount must be between 500 and 50000';
  END IF;
  
  -- Validate interest rate (0.5% - 10%)
  IF NEW.interest_rate < 0.5 OR NEW.interest_rate > 10 THEN
    RAISE EXCEPTION 'Interest rate must be between 0.5 and 10 percent';
  END IF;
  
  -- Validate term days (7, 14, 30 only)
  IF NEW.term_days NOT IN (7, 14, 30) THEN
    RAISE EXCEPTION 'Term days must be 7, 14, or 30';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_loan ON loans;
CREATE TRIGGER trg_validate_loan
  BEFORE INSERT OR UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION validate_loan_data();

-- Validate wallet balances (prevent negative)
CREATE OR REPLACE FUNCTION validate_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Wallet balance cannot be negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_wallet_balance ON wallets;
CREATE TRIGGER trg_validate_wallet_balance
  BEFORE INSERT OR UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION validate_wallet_balance();

-- Validate vault balances
CREATE OR REPLACE FUNCTION validate_vault_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_balance < 0 THEN
    RAISE EXCEPTION 'Vault total_balance cannot be negative';
  END IF;
  IF NEW.frozen_collateral < 0 THEN
    RAISE EXCEPTION 'Vault frozen_collateral cannot be negative';
  END IF;
  IF NEW.frozen_collateral > NEW.total_balance THEN
    RAISE EXCEPTION 'Frozen collateral cannot exceed total balance';
  END IF;
  
  -- Auto-calculate available_balance
  NEW.available_balance := NEW.total_balance - NEW.frozen_collateral;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_vault_balance ON elite_vaults;
CREATE TRIGGER trg_validate_vault_balance
  BEFORE INSERT OR UPDATE ON elite_vaults
  FOR EACH ROW
  EXECUTE FUNCTION validate_vault_balance();

-- Validate cash-out amounts
CREATE OR REPLACE FUNCTION validate_cash_out_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Minimum withdrawal ₳500
  IF NEW.amount < 500 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is 500';
  END IF;
  
  -- Maximum withdrawal ₳100,000
  IF NEW.amount > 100000 THEN
    RAISE EXCEPTION 'Maximum withdrawal amount is 100000';
  END IF;
  
  -- Validate net_amount
  IF NEW.net_amount <= 0 THEN
    RAISE EXCEPTION 'Net amount must be positive';
  END IF;
  
  -- Validate fee is reasonable (0-20%)
  IF NEW.fee_amount < 0 OR NEW.fee_amount > NEW.amount * 0.2 THEN
    RAISE EXCEPTION 'Fee amount is invalid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_cash_out ON cash_out_requests;
CREATE TRIGGER trg_validate_cash_out
  BEFORE INSERT OR UPDATE ON cash_out_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_cash_out_request();

-- Validate cash-in amounts
CREATE OR REPLACE FUNCTION validate_cash_in_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Minimum deposit ₳100
  IF NEW.amount < 100 THEN
    RAISE EXCEPTION 'Minimum deposit amount is 100';
  END IF;
  
  -- Maximum deposit ₳500,000
  IF NEW.amount > 500000 THEN
    RAISE EXCEPTION 'Maximum deposit amount is 500000';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_cash_in ON cash_in_requests;
CREATE TRIGGER trg_validate_cash_in
  BEFORE INSERT OR UPDATE ON cash_in_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_cash_in_request();

-- Validate ad campaign budgets
CREATE OR REPLACE FUNCTION validate_ad_campaign()
RETURNS TRIGGER AS $$
BEGIN
  -- Minimum budget ₳100
  IF NEW.total_budget < 100 THEN
    RAISE EXCEPTION 'Minimum campaign budget is 100';
  END IF;
  
  -- Minimum reward ₳5
  IF NEW.reward_per_task < 5 THEN
    RAISE EXCEPTION 'Minimum reward per task is 5';
  END IF;
  
  -- Max completions must be positive
  IF NEW.max_completions <= 0 THEN
    RAISE EXCEPTION 'Max completions must be positive';
  END IF;
  
  -- Remaining budget cannot exceed total
  IF NEW.remaining_budget > NEW.total_budget THEN
    RAISE EXCEPTION 'Remaining budget cannot exceed total budget';
  END IF;
  
  -- Remaining budget cannot be negative
  IF NEW.remaining_budget < 0 THEN
    RAISE EXCEPTION 'Remaining budget cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_ad_campaign ON ad_campaigns;
CREATE TRIGGER trg_validate_ad_campaign
  BEFORE INSERT OR UPDATE ON ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION validate_ad_campaign();

-- 2. ADD PERFORMANCE INDEXES

-- Profiles lookup by referral code (frequently used for signups)
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Membership payments by user and status
CREATE INDEX IF NOT EXISTS idx_membership_payments_user ON membership_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_status ON membership_payments(status);
CREATE INDEX IF NOT EXISTS idx_membership_payments_created ON membership_payments(created_at DESC);

-- Referral commissions lookup
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referred ON referral_commissions(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_paid ON referral_commissions(is_paid);

-- Task submissions lookup
CREATE INDEX IF NOT EXISTS idx_task_submissions_user ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_submitted ON task_submissions(submitted_at DESC);

-- Wallet transactions for history pages
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(transaction_type);

-- Vault transactions for Elite members
CREATE INDEX IF NOT EXISTS idx_vault_tx_user ON vault_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_tx_vault ON vault_transactions(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_tx_created ON vault_transactions(created_at DESC);

-- User roles lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Rate limits cleanup index
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- 3. ADD UPDATED_AT TRIGGERS FOR AUDIT TRAIL

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply to tables with updated_at column
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT table_name FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'updated_at'
    AND table_name NOT IN ('referral_confirmations')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_update_updated_at ON %I;
      CREATE TRIGGER trg_update_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl);
  END LOOP;
END $$;

-- 4. ADD REFERRAL CODE UNIQUENESS VALIDATION
CREATE OR REPLACE FUNCTION validate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure referral code is uppercase alphanumeric
  IF NEW.referral_code !~ '^[A-Z0-9]{6,10}$' THEN
    RAISE EXCEPTION 'Referral code must be 6-10 uppercase alphanumeric characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_referral_code ON profiles;
CREATE TRIGGER trg_validate_referral_code
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_referral_code();

-- 5. ADD COMMISSION RATE VALIDATION
CREATE OR REPLACE FUNCTION validate_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Commission rate must be between 0 and 100
  IF NEW.commission_rate < 0 OR NEW.commission_rate > 100 THEN
    RAISE EXCEPTION 'Commission rate must be between 0 and 100';
  END IF;
  
  -- Commission amount must be positive
  IF NEW.commission_amount <= 0 THEN
    RAISE EXCEPTION 'Commission amount must be positive';
  END IF;
  
  -- Membership amount must be positive
  IF NEW.membership_amount <= 0 THEN
    RAISE EXCEPTION 'Membership amount must be positive';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_commission ON referral_commissions;
CREATE TRIGGER trg_validate_commission
  BEFORE INSERT OR UPDATE ON referral_commissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_commission();

-- 6. ADD LOAN STATUS TRANSITION VALIDATION
CREATE OR REPLACE FUNCTION validate_loan_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow valid status transitions
  IF TG_OP = 'UPDATE' THEN
    -- From 'pending': can go to 'active' or 'cancelled'
    IF OLD.status = 'pending' AND NEW.status NOT IN ('active', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid loan status transition from pending to %', NEW.status;
    END IF;
    
    -- From 'active': can go to 'repaid' or 'defaulted'
    IF OLD.status = 'active' AND NEW.status NOT IN ('repaid', 'defaulted') THEN
      RAISE EXCEPTION 'Invalid loan status transition from active to %', NEW.status;
    END IF;
    
    -- Cannot transition from terminal states
    IF OLD.status IN ('repaid', 'defaulted', 'cancelled') THEN
      RAISE EXCEPTION 'Cannot modify loan in terminal status: %', OLD.status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_loan_status_transition ON loans;
CREATE TRIGGER trg_loan_status_transition
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION validate_loan_status_transition();

-- 7. ADD PAYMENT STATUS AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "Admins can view audit log"
ON audit_log FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- No direct modification of audit log
CREATE POLICY "No direct audit log modification"
ON audit_log FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "Audit log immutable"
ON audit_log FOR UPDATE
USING (false);

CREATE POLICY "No audit log deletion"
ON audit_log FOR DELETE
USING (false);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON audit_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Audit trigger for financial tables
CREATE OR REPLACE FUNCTION audit_financial_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit triggers to financial tables
DROP TRIGGER IF EXISTS trg_audit_membership_payments ON membership_payments;
CREATE TRIGGER trg_audit_membership_payments
  AFTER INSERT OR UPDATE ON membership_payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_financial_changes();

DROP TRIGGER IF EXISTS trg_audit_cash_in ON cash_in_requests;
CREATE TRIGGER trg_audit_cash_in
  AFTER INSERT OR UPDATE ON cash_in_requests
  FOR EACH ROW
  EXECUTE FUNCTION audit_financial_changes();

DROP TRIGGER IF EXISTS trg_audit_cash_out ON cash_out_requests;
CREATE TRIGGER trg_audit_cash_out
  AFTER INSERT OR UPDATE ON cash_out_requests
  FOR EACH ROW
  EXECUTE FUNCTION audit_financial_changes();

DROP TRIGGER IF EXISTS trg_audit_loans ON loans;
CREATE TRIGGER trg_audit_loans
  AFTER INSERT OR UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION audit_financial_changes();

-- 8. OPTIMIZE referral_confirmations VIEW with SECURITY INVOKER
DROP VIEW IF EXISTS referral_confirmations;
CREATE VIEW referral_confirmations 
WITH (security_invoker = on) AS
SELECT 
  rc.id,
  rc.referrer_id,
  rc.referred_id,
  rc.membership_tier,
  rc.is_paid,
  rc.created_at
FROM referral_commissions rc
WHERE rc.referrer_id = auth.uid() 
   OR rc.referred_id = auth.uid()
   OR has_role(auth.uid(), 'admin'::app_role);

-- 9. ADD TRANSACTION AMOUNT VALIDATION
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount = 0 THEN
    RAISE EXCEPTION 'Transaction amount cannot be zero';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_wallet_tx ON wallet_transactions;
CREATE TRIGGER trg_validate_wallet_tx
  BEFORE INSERT ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_transaction_amount();

DROP TRIGGER IF EXISTS trg_validate_vault_tx ON vault_transactions;
CREATE TRIGGER trg_validate_vault_tx
  BEFORE INSERT ON vault_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_transaction_amount();

DROP TRIGGER IF EXISTS trg_validate_loan_tx ON loan_transactions;
CREATE TRIGGER trg_validate_loan_tx
  BEFORE INSERT ON loan_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_transaction_amount();

-- 10. ENSURE PROFILES HAS PROPER DEFAULTS
ALTER TABLE profiles 
ALTER COLUMN membership_tier SET DEFAULT NULL,
ALTER COLUMN membership_amount SET DEFAULT 0,
ALTER COLUMN is_kyc_verified SET DEFAULT false;
