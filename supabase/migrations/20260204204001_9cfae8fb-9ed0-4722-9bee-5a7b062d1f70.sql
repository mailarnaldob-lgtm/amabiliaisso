-- Fix reject_cash_out_request - no refund needed since funds aren't deducted until approval
DROP FUNCTION IF EXISTS reject_cash_out_request(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION reject_cash_out_request(p_request_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Admin role verification
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_001: Admin privileges required');
  END IF;
  
  -- Identity verification
  IF auth.uid() != p_admin_id THEN
    RETURN json_build_object('success', false, 'error', 'ERR_AUTH_002: Identity verification failed');
  END IF;

  -- Get and lock the request
  SELECT * INTO v_request FROM cash_out_requests WHERE id = p_request_id AND status IN ('pending', 'flagged') FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'ERR_CASH_002: Request not found or already processed');
  END IF;

  -- Update request status to rejected (no refund needed - funds weren't deducted yet)
  UPDATE cash_out_requests 
  SET status = 'rejected', 
      reviewed_by = p_admin_id, 
      reviewed_at = NOW(),
      rejection_reason = COALESCE(p_reason, 'Request rejected by admin')
  WHERE id = p_request_id;

  RETURN json_build_object(
    'success', true, 
    'request_id', p_request_id, 
    'amount', v_request.amount,
    'message', 'Request rejected successfully'
  );
END;
$$;