-- ==============================================================
-- FIX: Referral Commission Race Condition (V8.0 Compliant)
-- Add unique constraint + atomic INSERT with conflict detection
-- Ensures 50% commission rate per Knowledge #1 (Alpha Blueprint)
-- ==============================================================

-- Step 1: Add unique constraint to prevent duplicate commissions
-- This enforces idempotency at the database level
ALTER TABLE public.referral_commissions
ADD CONSTRAINT unique_referral_tier_commission
UNIQUE (referrer_id, referred_id, membership_tier);

-- Step 2: Rewrite trigger function with atomic operations
-- Commission rate: 50% per Blueprint V8.0
CREATE OR REPLACE FUNCTION public.create_referral_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer_id UUID;
  _commission_amount NUMERIC;
  _commission_id UUID;
  _royalty_wallet_id UUID;
BEGIN
  -- Only process on status change to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get referrer from referred user's profile
    SELECT referred_by INTO _referrer_id
    FROM profiles
    WHERE id = NEW.user_id;

    -- If user was referred, create commission at 50% rate (V8.0)
    IF _referrer_id IS NOT NULL THEN
      _commission_amount := NEW.amount * 0.50; -- 50% per Blueprint V8.0
      
      -- ATOMIC: Insert with conflict detection
      -- ON CONFLICT DO NOTHING prevents duplicate inserts
      -- RETURNING id detects if insert actually happened
      INSERT INTO referral_commissions (
        referrer_id,
        referred_id,
        membership_tier,
        membership_amount,
        commission_amount,
        commission_rate
      ) VALUES (
        _referrer_id,
        NEW.user_id,
        NEW.tier,
        NEW.amount,
        _commission_amount,
        50.00 -- 50% per Blueprint V8.0
      )
      ON CONFLICT (referrer_id, referred_id, membership_tier) DO NOTHING
      RETURNING id INTO _commission_id;
      
      -- Only credit wallet if commission was ACTUALLY inserted (not a duplicate)
      IF _commission_id IS NOT NULL THEN
        -- ATOMIC: Lock wallet row to prevent concurrent balance updates
        SELECT id INTO _royalty_wallet_id
        FROM wallets
        WHERE user_id = _referrer_id
        AND wallet_type = 'royalty'
        FOR UPDATE; -- Row-level lock ensures atomic balance modification
        
        -- Credit royalty wallet
        IF _royalty_wallet_id IS NOT NULL THEN
          UPDATE wallets
          SET balance = balance + _commission_amount,
              updated_at = NOW()
          WHERE id = _royalty_wallet_id;
          
          -- Create transaction record (immutable audit log)
          INSERT INTO wallet_transactions (
            wallet_id,
            user_id,
            amount,
            transaction_type,
            description,
            reference_id
          ) VALUES (
            _royalty_wallet_id,
            _referrer_id,
            _commission_amount,
            'referral_commission',
            '50% Referral commission for ' || NEW.tier || ' membership',
            _commission_id
          );
        END IF;
      END IF;
      -- If _commission_id IS NULL, INSERT was skipped due to conflict
      -- This means another transaction already processed this commission
      -- No wallet credit occurs, preventing double-payment
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;