-- Ensure payment-proofs bucket exists (private, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;

-- Users can upload their own payment proofs (folder = user_id)
CREATE POLICY "Users can upload own payment proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own payment proofs
CREATE POLICY "Users can view own payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );