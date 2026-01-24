-- Security Fix: Add authentication requirement policies for profiles and wallets tables
-- This prevents unauthenticated access to sensitive user data

-- Note: The existing RESTRICTIVE policies already filter by auth.uid() = id/user_id
-- But adding an explicit authentication check provides defense-in-depth

-- For profiles table - require authentication for any SELECT
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- For wallets table - require authentication for any SELECT  
CREATE POLICY "Require authentication for wallets"
ON public.wallets
FOR SELECT
USING (auth.uid() IS NOT NULL);