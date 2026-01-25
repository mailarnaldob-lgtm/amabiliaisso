-- Fix Loans RLS Policy Migration Mismatch - bring migration files in sync with production
-- This migration ensures the restrictive policy is the only one defined

-- Drop the old overly permissive policy if it still exists
DROP POLICY IF EXISTS "Users can view pending offers" ON public.loans;

-- Drop and recreate the restrictive policy to ensure consistency
DROP POLICY IF EXISTS "Users can view available pending offers" ON public.loans;

CREATE POLICY "Users can view available pending offers"
ON public.loans FOR SELECT
TO authenticated
USING (
  (status = 'pending'::loan_status) AND 
  (auth.uid() <> lender_id) AND 
  ((borrower_id IS NULL) OR (auth.uid() <> borrower_id))
);