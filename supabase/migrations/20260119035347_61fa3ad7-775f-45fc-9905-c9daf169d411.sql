-- Fix 1: Add explicit RLS policies for user_roles table to prevent privilege escalation
-- Drop existing ALL policy and replace with explicit policies

-- Policy for INSERT - only admins can insert roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy for UPDATE - only admins can update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for DELETE - only admins can delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));