-- Fix #1: Add explicit restrictive policies for wallet_transactions write operations
-- This ensures transactions can only be created/modified by server-side SECURITY DEFINER functions

-- Add restrictive INSERT policy - only admins can insert (for server-side operations)
CREATE POLICY "Admins can insert transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add restrictive UPDATE policy - transactions are immutable
CREATE POLICY "Transactions are immutable"
  ON public.wallet_transactions FOR UPDATE
  USING (false);

-- Add restrictive DELETE policy - no transaction deletion allowed
CREATE POLICY "No transaction deletion"
  ON public.wallet_transactions FOR DELETE
  USING (false);

-- Also add wallet update policy for admins (needed for commission crediting via SECURITY DEFINER)
CREATE POLICY "Admins can update wallets"
  ON public.wallets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix #2: Create referral commission automation trigger
-- This function creates commission records and credits royalty wallets when payments are approved

CREATE OR REPLACE FUNCTION public.create_referral_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer_id UUID;
  _commission_amount NUMERIC;
  _royalty_wallet_id UUID;
BEGIN
  -- Only process on status change to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get referrer from referred user's profile
    SELECT referred_by INTO _referrer_id
    FROM profiles
    WHERE id = NEW.user_id;

    -- If user was referred, create commission
    IF _referrer_id IS NOT NULL THEN
      _commission_amount := NEW.amount * 0.40;
      
      -- Check if commission already exists (idempotency)
      IF NOT EXISTS (
        SELECT 1 FROM referral_commissions
        WHERE referrer_id = _referrer_id
        AND referred_id = NEW.user_id
        AND membership_tier = NEW.tier
      ) THEN
        -- Create commission record
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
          40.00
        );
        
        -- Get referrer's royalty wallet
        SELECT id INTO _royalty_wallet_id
        FROM wallets
        WHERE user_id = _referrer_id
        AND wallet_type = 'royalty';
        
        -- Credit royalty wallet
        IF _royalty_wallet_id IS NOT NULL THEN
          UPDATE wallets
          SET balance = balance + _commission_amount,
              updated_at = NOW()
          WHERE id = _royalty_wallet_id;
          
          -- Create transaction record
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
            'Referral commission for ' || NEW.tier || ' membership',
            NEW.id
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on membership_payments table
CREATE TRIGGER on_payment_approved
  AFTER UPDATE ON public.membership_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_commission();