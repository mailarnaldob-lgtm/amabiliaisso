-- =====================================================================
-- SECURITY ENHANCEMENT: Explicit anonymous/public access denial
-- Ensures wallets and profiles tables block unauthenticated access
-- =====================================================================

-- =====================================================================
-- WALLETS TABLE: Add explicit denial for anonymous access
-- =====================================================================

-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Block anonymous wallet access" ON public.wallets;

-- Explicit denial for anonymous (unauthenticated) access
CREATE POLICY "Block anonymous wallet access"
ON public.wallets
FOR SELECT
TO anon
USING (false);

-- =====================================================================
-- PROFILES TABLE: Add explicit denial for anonymous access
-- =====================================================================

-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Block anonymous profile access" ON public.profiles;

-- Explicit denial for anonymous (unauthenticated) access
CREATE POLICY "Block anonymous profile access"
ON public.profiles
FOR SELECT
TO anon
USING (false);