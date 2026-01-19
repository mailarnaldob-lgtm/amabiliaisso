-- Add unique constraint to prevent duplicate task submissions
-- This prevents users from submitting the same task multiple times and receiving duplicate rewards

ALTER TABLE public.task_submissions 
ADD CONSTRAINT unique_user_task_submission 
UNIQUE (user_id, task_id);