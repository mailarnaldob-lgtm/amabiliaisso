import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * ELITE GATEKEEPER HOOK
 * Blueprint V8.0 Specification:
 * - Users must have 3 Direct PRO (or higher) referrals to qualify for ELITE status
 * - Only counts referrals who have upgraded to at least 'pro' tier
 */
export function useEliteQualification() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['elite-qualification', user?.id],
    queryFn: async () => {
      if (!user) {
        return { 
          qualifiedReferrals: 0, 
          requiredReferrals: 3, 
          isQualified: false,
          referrals: [] 
        };
      }
      
      // Get profiles referred by this user who are PRO or ELITE
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, full_name, membership_tier, created_at', { count: 'exact' })
        .eq('referred_by', user.id)
        .in('membership_tier', ['pro', 'elite']);

      if (error) {
        console.error('Error fetching PRO referrals:', error);
        return { 
          qualifiedReferrals: 0, 
          requiredReferrals: 3, 
          isQualified: false,
          referrals: [] 
        };
      }

      const qualifiedCount = count || 0;

      return {
        qualifiedReferrals: qualifiedCount,
        requiredReferrals: 3,
        isQualified: qualifiedCount >= 3,
        referrals: data || []
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

/**
 * Get total referrals (any tier) for display purposes
 */
export function useTotalReferrals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['total-referrals', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);

      if (error) {
        console.error('Error fetching total referrals:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}
