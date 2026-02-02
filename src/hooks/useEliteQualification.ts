import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * ELITE GATEKEEPER HOOK - SOVEREIGN BRANDING V8.7
 * Blueprint Specification:
 * - Users must have 3 Direct EXPERT (or higher) referrals to qualify for ELITE status
 * - Only counts referrals who have upgraded to at least 'expert' tier
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
      
      // Get profiles referred by this user who are EXPERT or ELITE
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, full_name, membership_tier, created_at', { count: 'exact' })
        .eq('referred_by', user.id)
        .in('membership_tier', ['expert', 'elite']);

      if (error) {
        console.error('Error fetching EXPERT referrals:', error);
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
