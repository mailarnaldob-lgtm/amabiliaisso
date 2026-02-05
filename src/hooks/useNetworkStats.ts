import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GenealogyNode {
  user_id: string;
  full_name: string;
  membership_tier: 'basic' | 'pro' | 'expert' | 'elite' | null;
  referral_code: string;
  upline_id: string | null;
  level_depth: number;
  direct_referrals: number;
  network_earnings: number;
  created_at: string;
}

export interface NetworkStats {
  direct_referrals: number;
  total_team_size: number;
  total_network_earnings: number;
  this_month_earnings: number;
}

/**
 * Hook to fetch user's network statistics
 * Uses 15-second polling for real-time updates
 */
export function useNetworkStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['network-stats', user?.id],
    queryFn: async (): Promise<NetworkStats> => {
      if (!user) {
        return {
          direct_referrals: 0,
          total_team_size: 0,
          total_network_earnings: 0,
          this_month_earnings: 0,
        };
      }

      const { data, error } = await supabase.rpc('get_network_stats', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching network stats:', error);
        return {
          direct_referrals: 0,
          total_team_size: 0,
          total_network_earnings: 0,
          this_month_earnings: 0,
        };
      }

      // Parse JSON response from RPC
      const parsed = data as unknown as NetworkStats;
      return {
        direct_referrals: parsed.direct_referrals ?? 0,
        total_team_size: parsed.total_team_size ?? 0,
        total_network_earnings: parsed.total_network_earnings ?? 0,
        this_month_earnings: parsed.this_month_earnings ?? 0,
      };
    },
    enabled: !!user,
    staleTime: 15000, // 15-second polling
    refetchInterval: 15000,
  });
}

/**
 * Hook to fetch user's genealogy tree (downline structure)
 */
export function useGenealogyTree(maxDepth: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['genealogy-tree', user?.id, maxDepth],
    queryFn: async (): Promise<GenealogyNode[]> => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_genealogy_tree', {
        p_user_id: user.id,
        p_max_depth: maxDepth,
      });

      if (error) {
        console.error('Error fetching genealogy tree:', error);
        return [];
      }

      return (data || []) as GenealogyNode[];
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 30000,
  });
}

/**
 * Hook to get network commissions earned by user
 */
export function useNetworkCommissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['network-commissions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('network_commissions')
        .select('*')
        .eq('upline_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching network commissions:', error);
        return [];
      }

      return data;
    },
    enabled: !!user,
    staleTime: 15000,
    refetchInterval: 15000,
  });
}
