-- SECURITY FIX: Create view with masked account numbers for user access
-- This prevents full bank account exposure while maintaining admin access

-- Create the masked view for user-facing queries
CREATE OR REPLACE VIEW public.cash_out_requests_user_view
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  amount,
  fee_amount,
  net_amount,
  payment_method,
  -- Mask account name: show first 2 chars + asterisks + last 2 chars
  CASE 
    WHEN LENGTH(account_name) > 4 THEN 
      LEFT(account_name, 2) || REPEAT('•', GREATEST(LENGTH(account_name) - 4, 2)) || RIGHT(account_name, 2)
    ELSE REPEAT('•', LENGTH(account_name))
  END AS account_name,
  -- Mask account number: show only last 4 digits
  CASE 
    WHEN LENGTH(account_number) > 4 THEN 
      REPEAT('•', LENGTH(account_number) - 4) || RIGHT(account_number, 4)
    ELSE REPEAT('•', LENGTH(account_number))
  END AS account_number,
  status,
  rejection_reason,
  has_active_loan,
  pin_verified,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
FROM public.cash_out_requests
WHERE auth.uid() = user_id;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.cash_out_requests_user_view TO authenticated;

-- Drop existing permissive SELECT policies for users on the base table
DROP POLICY IF EXISTS "Users can view own cash_out requests" ON public.cash_out_requests;

-- Create new restrictive policy that blocks direct user SELECT
-- Users MUST use the masked view instead
CREATE POLICY "Users must use masked view for own requests"
ON public.cash_out_requests
FOR SELECT
USING (
  -- Only allow admin direct access, users must use the view
  has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure admin policies remain intact for full data access
-- (Admin policies already exist and allow full access)