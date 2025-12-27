-- Fix #1: Add input validation to handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  referrer_id UUID;
  full_name_val TEXT;
  phone_val TEXT;
  referral_code_input TEXT;
BEGIN
  -- Validate and sanitize full_name (required, 1-200 chars, basic characters only)
  full_name_val := TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF LENGTH(full_name_val) = 0 THEN
    full_name_val := 'User';
  ELSIF LENGTH(full_name_val) > 200 THEN
    full_name_val := SUBSTRING(full_name_val FROM 1 FOR 200);
  END IF;
  -- Remove any potential script tags or dangerous content
  full_name_val := REGEXP_REPLACE(full_name_val, '<[^>]*>', '', 'g');

  -- Validate and sanitize phone (optional, max 20 chars, digits and + only)
  phone_val := TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', ''));
  IF LENGTH(phone_val) > 0 THEN
    -- Remove non-digit characters except +
    phone_val := REGEXP_REPLACE(phone_val, '[^0-9+]', '', 'g');
    IF LENGTH(phone_val) > 20 THEN
      phone_val := SUBSTRING(phone_val FROM 1 FOR 20);
    END IF;
    IF LENGTH(phone_val) < 10 THEN
      phone_val := NULL; -- Invalid phone, set to null
    END IF;
  ELSE
    phone_val := NULL;
  END IF;

  -- Generate unique referral code
  LOOP
    ref_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = ref_code);
  END LOOP;

  -- Find referrer if referral code provided (case-insensitive)
  referral_code_input := UPPER(TRIM(COALESCE(NEW.raw_user_meta_data->>'referral_code', '')));
  IF LENGTH(referral_code_input) > 0 THEN
    SELECT id INTO referrer_id 
    FROM public.profiles 
    WHERE UPPER(referral_code) = referral_code_input;
    -- Silent fail if not found - referrer_id stays NULL
  END IF;

  -- Create profile with validated data
  INSERT INTO public.profiles (id, full_name, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    full_name_val,
    phone_val,
    ref_code,
    referrer_id
  );

  -- Create 3 wallets for user
  INSERT INTO public.wallets (user_id, wallet_type) VALUES (NEW.id, 'task');
  INSERT INTO public.wallets (user_id, wallet_type) VALUES (NEW.id, 'royalty');
  INSERT INTO public.wallets (user_id, wallet_type) VALUES (NEW.id, 'main');

  -- Assign default member role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');

  RETURN NEW;
END;
$$;

-- Fix #2: Set search_path on generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Fix #3: Set search_path on update_updated_at function  
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;