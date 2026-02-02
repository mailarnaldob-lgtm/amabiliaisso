-- SOVEREIGN EXECUTION V9.2: ELITE AUTO-PROVISIONING TRIGGER
-- Auto-creates elite_vaults when user becomes ELITE

-- Function to auto-provision elite vault
CREATE OR REPLACE FUNCTION public.auto_provision_elite_vault()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger on ELITE upgrades
  IF NEW.membership_tier = 'elite' AND (OLD.membership_tier IS NULL OR OLD.membership_tier != 'elite') THEN
    -- Create vault if doesn't exist
    INSERT INTO elite_vaults (user_id, total_balance, frozen_collateral, is_active)
    VALUES (NEW.id, 0, 0, true)
    ON CONFLICT (user_id) DO UPDATE SET
      is_active = true,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_elite_vault_provisioning ON profiles;
CREATE TRIGGER trigger_elite_vault_provisioning
  AFTER UPDATE OF membership_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_provision_elite_vault();

-- Also create vault on INSERT if already ELITE
DROP TRIGGER IF EXISTS trigger_elite_vault_provisioning_insert ON profiles;
CREATE TRIGGER trigger_elite_vault_provisioning_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.membership_tier = 'elite')
  EXECUTE FUNCTION auto_provision_elite_vault();

-- Add RLS policy verification for elite_vaults (strengthen existing)
-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Elite users can access own vault data" ON elite_vaults;

-- Create strict elite-only access policy
CREATE POLICY "Elite users can access own vault data"
ON elite_vaults
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.membership_tier = 'elite'
  )
);