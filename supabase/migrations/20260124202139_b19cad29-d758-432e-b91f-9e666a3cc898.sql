-- Fix system_settings public exposure - require authentication for viewing payment settings
DROP POLICY IF EXISTS "Anyone can view settings" ON system_settings;

-- Only authenticated users can view settings (not public)
CREATE POLICY "Authenticated users can view settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);