-- SOVEREIGN TIER REBRANDING V8.7 - Step 2: Migrate data
-- Now that 'expert' is committed, we can use it

-- Drop the dependent RLS policy first
DROP POLICY IF EXISTS "PRO+ members can create campaigns" ON ad_campaigns;

-- Update data - order matters! Do 'pro' → 'expert' FIRST, then 'basic' → 'pro'
UPDATE profiles SET membership_tier = 'expert' WHERE membership_tier = 'pro';
UPDATE membership_payments SET tier = 'expert' WHERE tier = 'pro';
UPDATE referral_commissions SET membership_tier = 'expert' WHERE membership_tier = 'pro';

-- Then convert all 'basic' to 'pro'
UPDATE profiles SET membership_tier = 'pro' WHERE membership_tier = 'basic';
UPDATE membership_payments SET tier = 'pro' WHERE tier = 'basic';
UPDATE referral_commissions SET membership_tier = 'pro' WHERE membership_tier = 'basic';

-- Recreate the RLS policy with updated tier names (expert + elite can create campaigns)
CREATE POLICY "EXPERT+ members can create campaigns" ON ad_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = advertiser_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.membership_tier IN ('expert', 'elite')
    )
  );

-- Update default value for profiles - new signups start with NULL (inactive)
ALTER TABLE profiles ALTER COLUMN membership_tier SET DEFAULT NULL;