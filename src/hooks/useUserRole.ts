import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'member';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<AppRole | null> => {
      if (!user) return null;
      
      // Query user_roles table from Supabase
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'member'; // Default to member on error
      }

      // Return the role if found, otherwise default to member
      return (data?.role as AppRole) ?? 'member';
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useIsAdmin() {
  const { data: role, isLoading } = useUserRole();
  return { isAdmin: role === 'admin', isLoading };
}

export function useIsModerator() {
  const { data: role, isLoading } = useUserRole();
  return { isModerator: role === 'moderator' || role === 'admin', isLoading };
}
