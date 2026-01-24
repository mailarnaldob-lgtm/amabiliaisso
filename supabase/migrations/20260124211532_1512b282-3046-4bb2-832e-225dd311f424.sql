-- Fix wallets table: Remove overly permissive policy that exposes ALL wallet data
-- Keep only owner-scoped and admin-scoped SELECT policies

DROP POLICY IF EXISTS "Require authentication for wallets" ON public.wallets;

-- Also fix profiles table with the same issue
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Enable realtime for wallets table so users can see live balance updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;