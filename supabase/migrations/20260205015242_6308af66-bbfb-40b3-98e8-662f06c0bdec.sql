-- SAFE METHOD: Restrict referred user visibility to referral_commissions
-- Step 1: Drop the policy that allows referred users to see full commission data
DROP POLICY IF EXISTS "Users can view referrals commissions" ON public.referral_commissions;

-- Step 2: Create a secure view for referred users showing limited data (no commission_amount)
CREATE OR REPLACE VIEW public.referral_confirmations
WITH (security_invoker = on) AS
SELECT 
  id,
  referred_id,
  referrer_id,
  membership_tier,
  created_at,
  is_paid
  -- Deliberately excludes: commission_amount, commission_rate, membership_amount, paid_at
FROM public.referral_commissions;

-- Step 3: Enable RLS on the view (views inherit base table RLS with security_invoker)
-- The referred user can now only see their confirmation without amounts

-- Step 4: Create a policy on the base table to allow view access
-- Users who are referred can only access via the view, not direct table access
CREATE POLICY "Referred users limited view access"
ON public.referral_commissions
FOR SELECT
TO authenticated
USING (
  auth.uid() = referred_id 
  AND current_setting('request.path', true) LIKE '%referral_confirmations%'
);

-- Note: The above policy approach won't work reliably. Instead, we use view-only access pattern.
-- Let's use a cleaner approach - referred users access ONLY via a function

-- Drop the unreliable policy
DROP POLICY IF EXISTS "Referred users limited view access" ON public.referral_commissions;

-- Step 5: Create a secure RPC for referred users to check their commission status (no amounts)
CREATE OR REPLACE FUNCTION public.get_my_referral_confirmations(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  referrer_id uuid,
  membership_tier public.membership_tier,
  created_at timestamptz,
  is_confirmed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    rc.id,
    rc.referrer_id,
    rc.membership_tier,
    rc.created_at,
    rc.is_paid as is_confirmed
  FROM public.referral_commissions rc
  WHERE rc.referred_id = p_user_id
  ORDER BY rc.created_at DESC;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_referral_confirmations(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_my_referral_confirmations IS 
'Safe method: Allows referred users to confirm their upgrade triggered a commission for their referrer, without exposing the commission amount. Referrers retain full visibility via direct RLS policy.';