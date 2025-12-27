import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReferralCommission[];
    },
    enabled: !!user,
  });
}

export function useReferralStats() {
  const { data: commissions, isLoading } = useReferralCommissions();
  
  const totalReferrals = commissions?.length || 0;
  const totalEarnings = commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const pendingEarnings = commissions?.filter(c => !c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  
  return { totalReferrals, totalEarnings, pendingEarnings, isLoading };
}
