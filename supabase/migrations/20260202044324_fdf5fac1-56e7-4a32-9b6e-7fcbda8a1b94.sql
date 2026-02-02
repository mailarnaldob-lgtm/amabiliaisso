-- REVERT: Remove subscription tracking columns (restoring ONE-TIME activation model)
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_expires_at,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS last_renewal_at,
DROP COLUMN IF EXISTS renewal_cycle;

-- Drop subscription indexes
DROP INDEX IF EXISTS idx_profiles_subscription_status;
DROP INDEX IF EXISTS idx_profiles_subscription_expires;

-- Drop subscription functions
DROP FUNCTION IF EXISTS public.is_subscription_active(UUID);
DROP FUNCTION IF EXISTS public.activate_subscription(UUID, membership_tier, TEXT);

-- RESTORE: Original approve_membership_payment function (ONE-TIME activation)
CREATE OR REPLACE FUNCTION public.approve_membership_payment(p_payment_id uuid, p_admin_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_payment membership_payments%ROWTYPE;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Lock payment row
  SELECT * INTO v_payment
  FROM membership_payments
  WHERE id = p_payment_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  IF v_payment.status != 'pending' THEN
    RAISE EXCEPTION 'Payment already reviewed (status: %)', v_payment.status;
  END IF;
  
  -- Update payment status
  UPDATE membership_payments SET
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id
  WHERE id = p_payment_id;
  
  -- Update user's membership tier (ONE-TIME permanent upgrade)
  UPDATE profiles SET
    membership_tier = v_payment.tier,
    membership_amount = v_payment.amount,
    updated_at = NOW()
  WHERE id = v_payment.user_id;
  
  RETURN json_build_object(
    'success', true,
    'tier', v_payment.tier,
    'user_id', v_payment.user_id
  );
END;
$function$;