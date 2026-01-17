-- Create tasks table for VPA mission management
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Social Media',
  required_level TEXT NOT NULL DEFAULT 'cadet',
  proof_type TEXT NOT NULL DEFAULT 'screenshot',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_submissions table for user task proof submissions
CREATE TABLE public.task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  proof_url TEXT,
  proof_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  reward_amount NUMERIC,
  CONSTRAINT task_submissions_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks are viewable by all authenticated users
CREATE POLICY "Anyone can view active tasks"
ON public.tasks
FOR SELECT
USING (is_active = true);

-- Only admins can manage tasks
CREATE POLICY "Admins can manage all tasks"
ON public.tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on task_submissions
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.task_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create submissions"
ON public.task_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.task_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update submissions (for review)
CREATE POLICY "Admins can update submissions"
ON public.task_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();