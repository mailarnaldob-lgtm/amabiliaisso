
-- Add missing storage policies for task-proofs bucket (user upload and view)

-- Users can upload their own task proofs
CREATE POLICY "Users can upload own task proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'task-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own task proofs (admins handled by existing policy)
CREATE POLICY "Users can view own task proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
