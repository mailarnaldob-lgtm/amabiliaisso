-- Update referral commission trigger from 40% to 50%
-- Remove 8% team override from task approval

-- 1. Update the create_referral_commission trigger to use 50% commission
CREATE OR REPLACE FUNCTION public.create_referral_commission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

    -- If user was referred, create commission at 50% rate
    IF _referrer_id IS NOT NULL THEN
      _commission_amount := NEW.amount * 0.50; -- Changed from 0.40 to 0.50
      
      -- Check if commission already exists (idempotency)
      IF NOT EXISTS (
        SELECT 1 FROM referral_commissions
        WHERE referrer_id = _referrer_id
        AND referred_id = NEW.user_id
        AND membership_tier = NEW.tier
      ) THEN
        -- Create commission record with 50% rate
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
          50.00 -- Changed from 40.00 to 50.00
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
            '50% Referral commission for ' || NEW.tier || ' membership',
            NEW.id
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Update approve_task_submission to remove 8% royalty override and add 10% platform fee
-- Worker receives 90% of reward, platform keeps 10%
CREATE OR REPLACE FUNCTION public.approve_task_submission(p_submission_id uuid, p_admin_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_submission task_submissions%ROWTYPE;
  v_task tasks%ROWTYPE;
  v_user profiles%ROWTYPE;
  v_task_wallet wallets%ROWTYPE;
  v_task_reward NUMERIC;
  v_worker_reward NUMERIC;
  v_platform_fee NUMERIC;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Lock submission row for update to prevent race conditions
  SELECT * INTO v_submission
  FROM task_submissions
  WHERE id = p_submission_id
  FOR UPDATE;
  
  -- Validate submission exists and is pending
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  IF v_submission.status != 'pending' THEN
    RAISE EXCEPTION 'Submission already reviewed (status: %)', v_submission.status;
  END IF;
  
  -- Get task details
  SELECT * INTO v_task FROM tasks WHERE id = v_submission.task_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- Get user details
  SELECT * INTO v_user FROM profiles WHERE id = v_submission.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Calculate 90/10 split: worker gets 90%, platform keeps 10%
  v_task_reward := v_task.reward;
  v_worker_reward := v_task_reward * 0.90; -- 90% to worker
  v_platform_fee := v_task_reward * 0.10;  -- 10% platform fee
  
  -- Update submission status with worker's actual reward
  UPDATE task_submissions SET
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    reward_amount = v_worker_reward
  WHERE id = p_submission_id;
  
  -- Get and lock user's task wallet
  SELECT * INTO v_task_wallet
  FROM wallets
  WHERE user_id = v_submission.user_id AND wallet_type = 'task'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User task wallet not found';
  END IF;
  
  -- Credit task wallet atomically with 90% of reward
  UPDATE wallets
  SET balance = balance + v_worker_reward, updated_at = NOW()
  WHERE id = v_task_wallet.id;
  
  -- Log task reward transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    v_task_wallet.id,
    v_submission.user_id,
    v_worker_reward,
    'task_reward',
    'Task: ' || v_task.title || ' (90% of ₳' || v_task_reward::TEXT || ')',
    p_submission_id
  );
  
  -- NOTE: 8% team override royalty REMOVED per new business rules
  -- Platform fee (10%) is retained by the system, not distributed
  
  RETURN json_build_object(
    'success', true,
    'task_reward', v_task_reward,
    'worker_reward', v_worker_reward,
    'platform_fee', v_platform_fee,
    'royalty_credited', 0 -- No more royalties
  );
END;
$function$;

-- Update default commission_rate in referral_commissions table for new records
ALTER TABLE public.referral_commissions 
ALTER COLUMN commission_rate SET DEFAULT 50.00;