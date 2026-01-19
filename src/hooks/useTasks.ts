import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  required_level: string;
  proof_type: string;
  reward: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  proof_type: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reward_amount: number | null;
  submitted_at: string;
  reviewed_at: string | null;
  task?: Task;
}

// Fetch all active tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('reward', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
  });
}

// Fetch user's task submissions
export function useTaskSubmissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['task-submissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          task:tasks(*)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as (TaskSubmission & { task: Task })[];
    },
    enabled: !!user?.id,
  });
}

// Check if user has already submitted a specific task
export function useHasSubmittedTask(taskId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['task-submission-check', user?.id, taskId],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('task_submissions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!taskId,
  });
}

// Submit a task with proof
export function useSubmitTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      proofType,
      proofFile,
      proofLink,
    }: {
      taskId: string;
      proofType: string;
      proofFile?: File;
      proofLink?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      let proofUrl: string | null = null;

      // Upload proof file if provided
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${user.id}/${taskId}_${Date.now()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('task-proofs')
          .upload(fileName, proofFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload proof file');
        }

        proofUrl = fileName;
      } else if (proofLink) {
        proofUrl = proofLink;
      }

      // Insert submission record
      const { data, error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          proof_type: proofType,
          proof_url: proofUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          throw new Error('You have already submitted this task');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Task submitted successfully! Awaiting admin review.');
      queryClient.invalidateQueries({ queryKey: ['task-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['task-submission-check'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Get daily stats for the current user
export function useTaskStats() {
  const { user } = useAuth();
  const { data: submissions } = useTaskSubmissions();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySubmissions = submissions?.filter((s) => {
    const submittedDate = new Date(s.submitted_at);
    submittedDate.setHours(0, 0, 0, 0);
    return submittedDate.getTime() === today.getTime();
  }) || [];

  const approvedSubmissions = submissions?.filter((s) => s.status === 'approved') || [];
  const pendingSubmissions = submissions?.filter((s) => s.status === 'pending') || [];

  const totalCreditsEarned = approvedSubmissions.reduce(
    (sum, s) => sum + (s.reward_amount || s.task?.reward || 0),
    0
  );

  return {
    todayCompleted: todaySubmissions.length,
    totalCompleted: approvedSubmissions.length,
    totalPending: pendingSubmissions.length,
    totalCreditsEarned,
  };
}
