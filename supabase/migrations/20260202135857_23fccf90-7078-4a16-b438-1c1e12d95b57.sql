
-- ============================================
-- SOVEREIGN LEDGER SECURITY HARDENING V9.3
-- CRITICAL FIX: Wallets table RLS policies
-- Issue: Policies using 'public' role instead of 'authenticated'
-- ============================================

-- Drop all existing wallets policies (they have wrong role assignments)
DROP POLICY IF EXISTS "Users can view own wallets" ON wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON wallets;
DROP POLICY IF EXISTS "Admins can update wallets" ON wallets;
DROP POLICY IF EXISTS "Only admins can delete wallets" ON wallets;
DROP POLICY IF EXISTS "Block anonymous wallet access" ON wallets;
DROP POLICY IF EXISTS "Prevent direct wallet creation" ON wallets;

-- Recreate with CORRECT role assignments (TO authenticated, not TO public)

-- 1. RESTRICTIVE policy to block anonymous users completely
CREATE POLICY "Block anonymous wallet access"
ON wallets
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Authenticated users can ONLY view their own wallets
CREATE POLICY "Users can view own wallets"
ON wallets
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Admins can view ALL wallets (for oversight)
CREATE POLICY "Admins can view all wallets"
ON wallets
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Admins can update wallets (for corrections)
CREATE POLICY "Admins can update wallets"
ON wallets
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Only admins can delete wallets (emergency cleanup)
CREATE POLICY "Only admins can delete wallets"
ON wallets
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Block direct INSERT (wallets created via trigger on user registration)
CREATE POLICY "Prevent direct wallet creation"
ON wallets
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Also block insert from anon
CREATE POLICY "Block anonymous wallet creation"
ON wallets
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

-- ============================================
-- VERIFY: Profiles table policies (check roles)
-- ============================================

-- Drop and recreate profiles SELECT policies with explicit role targeting
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Block anonymous profile access" ON profiles;

-- Block anonymous profile access (RESTRICTIVE)
CREATE POLICY "Block anonymous profile access"
ON profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Users can view their own profile only
CREATE POLICY "Users can view own profile"
ON profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = id);
