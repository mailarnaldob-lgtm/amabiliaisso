-- SOVEREIGN TIER REBRANDING V8.7 - Step 1 ONLY
-- Just add the new enum value - cannot use it in same transaction

-- Clean up any leftover types from previous attempts
DROP TYPE IF EXISTS membership_tier_v2;
DROP TYPE IF EXISTS membership_tier_new;

-- Add 'expert' value to existing enum
ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'expert';