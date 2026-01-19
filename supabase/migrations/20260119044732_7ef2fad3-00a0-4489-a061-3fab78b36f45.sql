-- Drop the conflicting policy and recreate
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all task proofs" ON storage.objects;

-- Payment proofs view for admins (all files)
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Task proofs view for admins (all files)
CREATE POLICY "Admins can view all task proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-proofs' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create RPC function to verify commission was auto-credited (fix the manual mark as paid issue)
CREATE OR REPLACE FUNCTION public.verify_commission_credited(p_commission_id uuid, p_admin_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission referral_commissions%ROWTYPE;
  v_wallet_tx_exists BOOLEAN;
BEGIN
  -- Verify admin role
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Get commission
  SELECT * INTO v_commission FROM referral_commissions WHERE id = p_commission_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Commission not found');
  END IF;
  
  -- Check if wallet transaction exists for this commission
  SELECT EXISTS(
    SELECT 1 FROM wallet_transactions 
    WHERE reference_id = p_commission_id 
    AND transaction_type = 'referral_commission'
  ) INTO v_wallet_tx_exists;
  
  IF v_wallet_tx_exists AND NOT COALESCE(v_commission.is_paid, false) THEN
    -- Auto-credited but not marked as paid, update the record
    UPDATE referral_commissions 
    SET is_paid = true, paid_at = NOW() 
    WHERE id = p_commission_id;
    
    RETURN json_build_object(
      'success', true, 
      'status', 'verified_and_updated',
      'message', 'Commission was auto-credited, status updated'
    );
  ELSIF v_wallet_tx_exists THEN
    RETURN json_build_object(
      'success', true, 
      'status', 'already_verified',
      'message', 'Commission already verified as paid'
    );
  ELSE
    RETURN json_build_object(
      'success', false, 
      'status', 'not_credited',
      'error', 'No wallet transaction found for this commission'
    );
  END IF;
END;
$$;