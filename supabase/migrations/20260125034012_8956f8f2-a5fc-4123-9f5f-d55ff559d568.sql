-- Allow authenticated users to read payment_methods from system_settings
-- This enables the edge function to use the user's JWT instead of service role

CREATE POLICY "Authenticated users can view payment methods"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (key = 'payment_methods');