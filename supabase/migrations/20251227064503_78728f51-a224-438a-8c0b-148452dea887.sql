-- Fix: Add explicit restrictive policies for wallets INSERT and DELETE operations
-- Wallets are created only by the handle_new_user trigger (SECURITY DEFINER), not by users directly

-- Prevent unauthorized wallet creation - block all direct inserts
-- The handle_new_user trigger uses SECURITY DEFINER so it bypasses RLS
CREATE POLICY "Prevent direct wallet creation"
  ON public.wallets FOR INSERT
  WITH CHECK (false);

-- Prevent wallet deletion - only admins can delete if ever needed
CREATE POLICY "Only admins can delete wallets"
  ON public.wallets FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));