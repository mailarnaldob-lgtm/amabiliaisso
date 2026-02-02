-- ================================================================
-- SOVEREIGN SECURITY LOCKDOWN V8.6b - Fix remaining RLS policies
-- ================================================================

-- ================================================================
-- 4. MEMBERSHIP_PAYMENTS: Complete remaining policies
-- ================================================================

-- Drop existing policy that caused conflict
DROP POLICY IF EXISTS "Users can create own payments" ON membership_payments;

-- Recreate properly
CREATE POLICY "Users can create own payments"
  ON membership_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Block anonymous access
DROP POLICY IF EXISTS "Block anonymous payment access" ON membership_payments;
CREATE POLICY "Block anonymous payment access"
  ON membership_payments FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ================================================================
-- 5. LOANS: Ensure wallet data not exposed through foreign keys
-- ================================================================

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Users can view own loans" ON loans;
DROP POLICY IF EXISTS "Users can view available offers" ON loans;
DROP POLICY IF EXISTS "Admins can view all loans" ON loans;
DROP POLICY IF EXISTS "Lenders can view own offers" ON loans;
DROP POLICY IF EXISTS "Borrowers can view own loans" ON loans;
DROP POLICY IF EXISTS "Users can view available pending offers" ON loans;

-- Strict loan access policies
-- Users can see loans where they are the lender
CREATE POLICY "Lenders can view own offers"
  ON loans FOR SELECT
  TO authenticated
  USING (auth.uid() = lender_id);

-- Users can see loans where they are the borrower
CREATE POLICY "Borrowers can view own loans"
  ON loans FOR SELECT
  TO authenticated
  USING (auth.uid() = borrower_id);

-- Users can see pending offers from OTHER users (to take them)
CREATE POLICY "Users can view available pending offers"
  ON loans FOR SELECT
  TO authenticated
  USING (status = 'pending' AND lender_id != auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all loans"
  ON loans FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Block anonymous
DROP POLICY IF EXISTS "Block anonymous loan access" ON loans;
CREATE POLICY "Block anonymous loan access"
  ON loans FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ================================================================
-- 6. LOAN_TRANSACTIONS: Strict isolation
-- ================================================================

DROP POLICY IF EXISTS "Users can view own loan transactions" ON loan_transactions;

CREATE POLICY "Users can view own loan transactions"
  ON loan_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all loan transactions" ON loan_transactions;
CREATE POLICY "Admins can view all loan transactions"
  ON loan_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Block anonymous
DROP POLICY IF EXISTS "Block anonymous loan tx access" ON loan_transactions;
CREATE POLICY "Block anonymous loan tx access"
  ON loan_transactions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ================================================================
-- 7. WALLET_TRANSACTIONS: Strict isolation
-- ================================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;

CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure admin policy exists
DROP POLICY IF EXISTS "Admins can view all transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admins can view all wallet transactions" ON wallet_transactions;
CREATE POLICY "Admins can view all wallet transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Block anonymous
DROP POLICY IF EXISTS "Block anonymous transaction access" ON wallet_transactions;
CREATE POLICY "Block anonymous transaction access"
  ON wallet_transactions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ================================================================
-- 8. REFERRAL_COMMISSIONS: Strict isolation
-- ================================================================

DROP POLICY IF EXISTS "Users can view own commissions" ON referral_commissions;
DROP POLICY IF EXISTS "Users can view referrals commissions" ON referral_commissions;

CREATE POLICY "Users can view own commissions"
  ON referral_commissions FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals commissions"
  ON referral_commissions FOR SELECT
  TO authenticated
  USING (auth.uid() = referred_id);

DROP POLICY IF EXISTS "Admins can view all commissions" ON referral_commissions;
CREATE POLICY "Admins can view all commissions"
  ON referral_commissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Block anonymous
DROP POLICY IF EXISTS "Block anonymous commission access" ON referral_commissions;
CREATE POLICY "Block anonymous commission access"
  ON referral_commissions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);