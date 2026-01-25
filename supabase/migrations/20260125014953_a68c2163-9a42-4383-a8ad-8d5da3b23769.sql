-- Fix system_settings public exposure - restrict SELECT to admins only
-- Regular authenticated users will access payment methods via edge function

-- Drop the overly permissive policy that allows all authenticated users to read
DROP POLICY IF EXISTS "Authenticated users can view settings" ON system_settings;

-- Admins can view all settings (for AdminSettings.tsx direct access)
CREATE POLICY "Admins can view all settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));