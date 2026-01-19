import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ReferralCommission {
  id: string;
  referrer_id: string;
  referred_id: string;
  membership_tier: 'basic' | 'pro' | 'elite';
  membership_amount: number;
  commission_rate: number | null;
  commission_amount: number;
  is_paid: boolean | null;
  paid_at: string | null;
  created_at: string | null;
}

export function useReferralCommissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['referral-commissions', user?.id],
    queryFn: async (): Promise<ReferralCommission[]> => {
      if (!user) return [];
      
      // Query referral_commissions table from Supabase
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral commissions:', error);
        return [];
      }

      return data as ReferralCommission[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

export function useReferralStats() {
  const { data: commissions, isLoading } = useReferralCommissions();
  
  const totalReferrals = commissions?.length || 0;
  const totalEarnings = commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const pendingEarnings = commissions?.filter(c => !c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const paidEarnings = commissions?.filter(c => c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  
  return { 
    totalReferrals, 
    totalEarnings, 
    pendingEarnings, 
    paidEarnings,
    isLoading,
    commissions: commissions || []
  };
}

// Get referred users count
export function useReferredUsersCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['referred-users-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;
      
      // Count profiles that have this user as their referrer
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);

      if (error) {
        console.error('Error fetching referred users count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}
