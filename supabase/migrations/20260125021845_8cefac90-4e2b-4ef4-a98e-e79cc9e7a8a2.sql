-- =====================================================================
-- DOCUMENTATION MIGRATION: Record existing tasks/task_submissions schema
-- This migration documents schema objects that already exist in production
-- Uses IF NOT EXISTS and OR REPLACE to avoid conflicts
-- =====================================================================

-- =====================================================================
-- TABLE: tasks - VPA Mission definitions
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Social Media',
  required_level TEXT NOT NULL DEFAULT 'cadet',
  reward NUMERIC NOT NULL DEFAULT 0,
  proof_type TEXT NOT NULL DEFAULT 'screenshot',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (idempotent)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- TABLE: task_submissions - User mission submissions
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  proof_type TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  reward_amount NUMERIC,
  rejection_reason TEXT
);

-- Enable RLS (idempotent)
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS POLICIES: tasks table
-- =====================================================================
DO $$
BEGIN
  -- Policy: Admins can manage all tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Admins can manage all tasks'
  ) THEN
    CREATE POLICY "Admins can manage all tasks" ON public.tasks
    FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
  
  -- Policy: Anyone can view active tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Anyone can view active tasks'
  ) THEN
    CREATE POLICY "Anyone can view active tasks" ON public.tasks
    FOR SELECT TO authenticated
    USING (is_active = true);
  END IF;
END $$;

-- =====================================================================
-- RLS POLICIES: task_submissions table
-- =====================================================================
DO $$
BEGIN
  -- Policy: Users can create submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'Users can create submissions'
  ) THEN
    CREATE POLICY "Users can create submissions" ON public.task_submissions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Policy: Users can view own submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'Users can view own submissions'
  ) THEN
    CREATE POLICY "Users can view own submissions" ON public.task_submissions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  
  -- Policy: Admins can view all submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'Admins can view all submissions'
  ) THEN
    CREATE POLICY "Admins can view all submissions" ON public.task_submissions
    FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
  
  -- Policy: Admins can update submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'task_submissions' AND policyname = 'Admins can update submissions'
  ) THEN
    CREATE POLICY "Admins can update submissions" ON public.task_submissions
    FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- =====================================================================
-- UNIQUE CONSTRAINT: Prevent duplicate task submissions
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'task_submissions_user_id_task_id_key'
  ) THEN
    ALTER TABLE public.task_submissions 
    ADD CONSTRAINT task_submissions_user_id_task_id_key UNIQUE (user_id, task_id);
  END IF;
END $$;

-- =====================================================================
-- TRIGGER: Auto-update updated_at on tasks
-- =====================================================================
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();