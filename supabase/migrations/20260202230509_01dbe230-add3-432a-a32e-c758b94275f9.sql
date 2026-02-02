-- ============================================
-- SOVEREIGN RATE LIMITING & ADMIN-ONLY FILE SECURITY
-- Version 9.4 - Defense-in-Depth Implementation
-- ============================================

-- 1. RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, endpoint)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see/update their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- Block anonymous access
CREATE POLICY "Block anonymous rate limit access"
ON public.rate_limits FOR ALL
USING (false)
WITH CHECK (false);

-- Admins can view all rate limits for monitoring
CREATE POLICY "Admins can view all rate limits"
ON public.rate_limits FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 2. RATE LIMITING FUNCTION (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID, 
  p_endpoint TEXT, 
  p_limit INT,
  p_window_minutes INT DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_window_interval INTERVAL;
BEGIN
  -- Validate caller matches user_id
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN FALSE;
  END IF;

  v_window_interval := (p_window_minutes || ' minutes')::INTERVAL;

  -- Reset window if expired
  UPDATE rate_limits 
  SET request_count = 0, window_start = NOW()
  WHERE user_id = p_user_id 
    AND endpoint = p_endpoint 
    AND window_start < NOW() - v_window_interval;
  
  -- Insert or increment counter atomically
  INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (p_user_id, p_endpoint, 1, NOW())
  ON CONFLICT (user_id, endpoint) 
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  -- Get current count
  SELECT request_count INTO v_count 
  FROM rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  RETURN v_count <= p_limit;
END;
$$;

-- 3. RATE LIMIT ENFORCEMENT FUNCTION (Returns error message or NULL if allowed)
CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  p_user_id UUID, 
  p_endpoint TEXT, 
  p_limit INT,
  p_window_minutes INT DEFAULT 5
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT check_rate_limit(p_user_id, p_endpoint, p_limit, p_window_minutes) THEN
    RETURN 'ERR_RATE_001: Rate limit exceeded. Please wait ' || p_window_minutes || ' minutes.';
  END IF;
  RETURN NULL;
END;
$$;

-- 4. CLEANUP FUNCTION (For periodic maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 5. ADMIN-ONLY FILE ACCESS POLICIES FOR STORAGE BUCKETS
-- Strengthen RLS on storage.objects for sensitive buckets

-- Payment proofs: Only owner and admin can view
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;

CREATE POLICY "Users can view own payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' 
  AND has_role(auth.uid(), 'admin')
);

-- Task proofs: Only owner and admin can view
DROP POLICY IF EXISTS "Users can view own task proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all task proofs" ON storage.objects;

CREATE POLICY "Users can view own task proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all task proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-proofs' 
  AND has_role(auth.uid(), 'admin')
);

-- QR codes: Admin write only, public read for payments
DROP POLICY IF EXISTS "Public can view QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage QR codes" ON storage.objects;

CREATE POLICY "Public can view QR codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Admins can manage QR codes"
ON storage.objects FOR ALL
USING (
  bucket_id = 'qr-codes' 
  AND has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'qr-codes' 
  AND has_role(auth.uid(), 'admin')
);

-- 6. USER UPLOAD POLICIES (INSERT only for own folder)
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload task proofs" ON storage.objects;

CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload task proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. BLOCK ANONYMOUS ACCESS TO SENSITIVE BUCKETS
DROP POLICY IF EXISTS "Block anonymous payment proof access" ON storage.objects;
DROP POLICY IF EXISTS "Block anonymous task proof access" ON storage.objects;

CREATE POLICY "Block anonymous payment proof access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid() IS NULL
  AND false
);

CREATE POLICY "Block anonymous task proof access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'task-proofs' 
  AND auth.uid() IS NULL
  AND false
);