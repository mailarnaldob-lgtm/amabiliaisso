import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * EXPERT QUALIFICATION HOOK - SOVEREIGN V10.0
 * 
 * Blueprint Specification:
 * - To upgrade to EXPERT, members must complete at least 5 APPROVED tasks
 * - Only tasks with status='approved' count toward qualification
 * - This ensures quality contributors can access advanced features
 * 
 * IMPORTANT: Backend enforcement is required via edge function validation
 */

export interface ExpertQualificationData {
  completedTasks: number;
  requiredTasks: number;
  isQualified: boolean;
  progressPercent: number;
  remainingTasks: number;
}

export function useExpertQualification() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expert-qualification', user?.id],
    queryFn: async (): Promise<ExpertQualificationData> => {
      const REQUIRED_TASKS = 5;
      
      if (!user) {
        return { 
          completedTasks: 0, 
          requiredTasks: REQUIRED_TASKS, 
          isQualified: false,
          progressPercent: 0,
          remainingTasks: REQUIRED_TASKS
        };
      }
      
      // Count APPROVED task submissions for this user
      const { count, error } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (error) {
        console.error('[useExpertQualification] Error fetching approved tasks:', error);
        return { 
          completedTasks: 0, 
          requiredTasks: REQUIRED_TASKS, 
          isQualified: false,
          progressPercent: 0,
          remainingTasks: REQUIRED_TASKS
        };
      }

      const approvedCount = count || 0;
      const isQualified = approvedCount >= REQUIRED_TASKS;
      const progressPercent = Math.min((approvedCount / REQUIRED_TASKS) * 100, 100);
      const remainingTasks = Math.max(REQUIRED_TASKS - approvedCount, 0);

      return {
        completedTasks: approvedCount,
        requiredTasks: REQUIRED_TASKS,
        isQualified,
        progressPercent,
        remainingTasks
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds cache - tasks can be approved frequently
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}

/**
 * Constants for Expert Qualification
 */
export const EXPERT_REQUIRED_TASKS = 5;
