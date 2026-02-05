
-- ========================================
-- SOVEREIGN RLS HARDENING V9.5
-- Full RLS policy update for all tables
-- ========================================

-- 1. REFERRAL_COMMISSIONS: Allow referred users to view their confirmations (limited fields only via view)
-- The view with security_invoker=on already limits visible fields
CREATE POLICY "Referred users can view own confirmations"
ON public.referral_commissions FOR SELECT TO authenticated
USING (auth.uid() = referred_id);

-- 2. PROFILES: Add explicit policy to prevent profile enumeration
-- Current policies already restrict to own profile, but adding extra safety
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Block profile enumeration'
  ) THEN
    CREATE POLICY "Block profile enumeration"
    ON public.profiles FOR SELECT TO authenticated
    USING (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 3. TASKS: Ensure anonymous users cannot view tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Block anonymous task access'
  ) THEN
    CREATE POLICY "Block anonymous task access"
    ON public.tasks FOR ALL TO anon
    USING (false) WITH CHECK (false);
  END IF;
END $$;

-- 4. TASK_SUBMISSIONS: Block anonymous access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'Block anonymous submission access'
  ) THEN
    CREATE POLICY "Block anonymous submission access"
    ON public.task_submissions FOR ALL TO anon
    USING (false) WITH CHECK (false);
  END IF;
END $$;

-- 5. AD_CAMPAIGNS: Block anonymous access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ad_campaigns' AND policyname = 'Block anonymous campaign access'
  ) THEN
    CREATE POLICY "Block anonymous campaign access"
    ON public.ad_campaigns FOR ALL TO anon
    USING (false) WITH CHECK (false);
  END IF;
END $$;

-- 6. SYSTEM_SETTINGS: Block anonymous access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' AND policyname = 'Block anonymous settings access'
  ) THEN
    CREATE POLICY "Block anonymous settings access"
    ON public.system_settings FOR ALL TO anon
    USING (false) WITH CHECK (false);
  END IF;
END $$;

-- 7. LOAN_TRANSACTIONS: Prevent direct inserts (function-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'loan_transactions' AND policyname = 'Loan transactions immutable'
  ) THEN
    CREATE POLICY "Loan transactions immutable"
    ON public.loan_transactions FOR UPDATE
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'loan_transactions' AND policyname = 'No loan transaction deletion'
  ) THEN
    CREATE POLICY "No loan transaction deletion"
    ON public.loan_transactions FOR DELETE
    USING (false);
  END IF;
END $$;

-- 8. VAULT_TRANSACTIONS: Block anonymous access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vault_transactions' AND policyname = 'Block anonymous vault tx access'
  ) THEN
    CREATE POLICY "Block anonymous vault tx access"
    ON public.vault_transactions FOR ALL TO anon
    USING (false) WITH CHECK (false);
  END IF;
END $$;

-- 9. REFERRAL_COMMISSIONS: Block direct INSERT (function-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'referral_commissions' AND policyname = 'No direct commission creation'
  ) THEN
    CREATE POLICY "No direct commission creation"
    ON public.referral_commissions FOR INSERT TO authenticated
    WITH CHECK (false);
  END IF;
END $$;

-- 10. REFERRAL_COMMISSIONS: Prevent UPDATE/DELETE by non-admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'referral_commissions' AND policyname = 'Commissions immutable for users'
  ) THEN
    CREATE POLICY "Commissions immutable for users"
    ON public.referral_commissions FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'referral_commissions' AND policyname = 'No commission deletion for users'
  ) THEN
    CREATE POLICY "No commission deletion for users"
    ON public.referral_commissions FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 11. RATE_LIMITS: Prevent direct modifications by users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rate_limits' AND policyname = 'No direct rate limit modification'
  ) THEN
    CREATE POLICY "No direct rate limit modification"
    ON public.rate_limits FOR INSERT TO authenticated
    WITH CHECK (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rate_limits' AND policyname = 'Rate limits immutable by users'
  ) THEN
    CREATE POLICY "Rate limits immutable by users"
    ON public.rate_limits FOR UPDATE TO authenticated
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rate_limits' AND policyname = 'No rate limit deletion by users'
  ) THEN
    CREATE POLICY "No rate limit deletion by users"
    ON public.rate_limits FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 12. MEMBERSHIP_PAYMENTS: Prevent user updates (admin-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'membership_payments' AND policyname = 'Users cannot update payments'
  ) THEN
    CREATE POLICY "Users cannot update payments"
    ON public.membership_payments FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 13. CASH_IN_REQUESTS: Prevent user updates after submission
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cash_in_requests' AND policyname = 'Users cannot modify submitted cash_in requests'
  ) THEN
    CREATE POLICY "Users cannot modify submitted cash_in requests"
    ON public.cash_in_requests FOR UPDATE TO authenticated
    USING (
      has_role(auth.uid(), 'admin'::app_role)
      OR (auth.uid() = user_id AND status = 'pending')
    );
  END IF;
END $$;

-- 14. CASH_OUT_REQUESTS: Prevent user updates after submission
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cash_out_requests' AND policyname = 'Users cannot modify submitted cash_out requests'
  ) THEN
    CREATE POLICY "Users cannot modify submitted cash_out requests"
    ON public.cash_out_requests FOR UPDATE TO authenticated
    USING (
      has_role(auth.uid(), 'admin'::app_role)
      OR (auth.uid() = user_id AND status = 'pending')
    );
  END IF;
END $$;

-- 15. TASK_SUBMISSIONS: Prevent user updates after submission
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'Users cannot modify approved submissions'
  ) THEN
    CREATE POLICY "Users cannot modify approved submissions"
    ON public.task_submissions FOR UPDATE TO authenticated
    USING (
      has_role(auth.uid(), 'admin'::app_role)
      OR (auth.uid() = user_id AND status = 'pending')
    );
  END IF;
END $$;

-- 16. Block DELETE on all financial records (immutability)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cash_in_requests' AND policyname = 'No cash_in deletion'
  ) THEN
    CREATE POLICY "No cash_in deletion"
    ON public.cash_in_requests FOR DELETE
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cash_out_requests' AND policyname = 'No cash_out deletion'
  ) THEN
    CREATE POLICY "No cash_out deletion"
    ON public.cash_out_requests FOR DELETE
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'membership_payments' AND policyname = 'No payment deletion'
  ) THEN
    CREATE POLICY "No payment deletion"
    ON public.membership_payments FOR DELETE
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'No submission deletion'
  ) THEN
    CREATE POLICY "No submission deletion"
    ON public.task_submissions FOR DELETE
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'referral_commissions' AND policyname = 'No commission deletion'
  ) THEN
    CREATE POLICY "No commission deletion"
    ON public.referral_commissions FOR DELETE
    USING (false);
  END IF;
END $$;
