-- Fix: Require authentication to view active tasks
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active tasks" ON public.tasks;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view active tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (is_active = true);