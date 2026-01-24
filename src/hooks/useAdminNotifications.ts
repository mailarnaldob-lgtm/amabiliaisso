import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PendingPayment {
  id: string;
  user_id: string;
  tier: string;
  amount: number;
  payment_method: string;
  proof_url: string | null;
  reference_number: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface PendingTaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  proof_type: string;
  proof_url: string | null;
  submitted_at: string;
  task_title?: string;
  task_reward?: number;
  user_name?: string;
}

export interface AdminNotificationStats {
  pendingPayments: number;
  pendingTaskProofs: number;
  totalPending: number;
}

// Fetch count of pending items for notification badges
export function useAdminNotificationStats() {
  return useQuery({
    queryKey: ['admin-notification-stats'],
    queryFn: async () => {
      // Get pending payments count
      const { count: paymentCount, error: paymentError } = await supabase
        .from('membership_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (paymentError) throw paymentError;

      // Get pending task submissions count
      const { count: taskCount, error: taskError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (taskError) throw taskError;

      const stats: AdminNotificationStats = {
        pendingPayments: paymentCount || 0,
        pendingTaskProofs: taskCount || 0,
        totalPending: (paymentCount || 0) + (taskCount || 0),
      };

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Fetch pending payments with user info
export function usePendingPayments() {
  return useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_payments')
        .select(`
          id,
          user_id,
          tier,
          amount,
          payment_method,
          proof_url,
          reference_number,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for display names
      const userIds = [...new Set(data.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return data.map((payment) => ({
        ...payment,
        user_name: profileMap.get(payment.user_id) || 'Unknown User',
      })) as PendingPayment[];
    },
  });
}

// Fetch pending task submissions with task and user info
export function usePendingTaskSubmissions() {
  return useQuery({
    queryKey: ['admin-pending-task-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          id,
          task_id,
          user_id,
          proof_type,
          proof_url,
          submitted_at,
          task:tasks(title, reward)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for display names
      const userIds = [...new Set(data.map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return data.map((submission) => ({
        id: submission.id,
        task_id: submission.task_id,
        user_id: submission.user_id,
        proof_type: submission.proof_type,
        proof_url: submission.proof_url,
        submitted_at: submission.submitted_at,
        task_title: (submission.task as any)?.title || 'Unknown Task',
        task_reward: (submission.task as any)?.reward || 0,
        user_name: profileMap.get(submission.user_id) || 'Unknown User',
      })) as PendingTaskSubmission[];
    },
  });
}
