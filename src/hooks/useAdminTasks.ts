import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  category: string;
  required_level: string;
  proof_type: string;
  reward: number;
  is_active: boolean;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

// Fetch all tasks (including inactive ones for admin)
export function useAdminTasks() {
  return useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description,
          category: input.category,
          required_level: input.required_level,
          proof_type: input.proof_type,
          reward: input.reward,
          is_active: input.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

// Update an existing task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      toast.success('Task updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
}

// Toggle task active status
export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, isActive }: { taskId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_active: isActive })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      toast.success(data.is_active ? 'Task activated' : 'Task deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle task: ${error.message}`);
    },
  });
}

// Get task categories for dropdown - EXPANDED V12.0
export const TASK_CATEGORIES = [
  'Social Media',
  'Facebook',
  'YouTube',
  'TikTok',
  'Instagram',
  'Content Creation',
  'Community',
  'Referral',
  'Survey',
  'Other',
] as const;

// Platform categories for EARN Hub filtering
export const PLATFORM_CATEGORIES = [
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
  { value: 'tiktok', label: 'TikTok', color: '#00F2EA' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
] as const;

// Get required levels for dropdown - SOVEREIGN BRANDING V8.7
export const REQUIRED_LEVELS = [
  { value: 'pro', label: 'Pro' },
  { value: 'expert', label: 'Expert' },
  { value: 'elite', label: 'Elite' },
] as const;

// Get proof types for dropdown
export const PROOF_TYPES = [
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'link', label: 'Link/URL' },
  { value: 'text', label: 'Text Description' },
] as const;
