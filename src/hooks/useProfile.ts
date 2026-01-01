import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  referral_code: string;
  referred_by: string | null;
  membership_tier: 'basic' | 'pro' | 'elite' | null;
  membership_amount: number | null;
  is_kyc_verified: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // TODO: Replace with MySQL edge function when mysql-user-profile is implemented
      // For now, return mock data based on auth user
      const mockProfile: Profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'User',
        phone: user.user_metadata?.phone || null,
        referral_code: 'TEMP0000',
        referred_by: null,
        membership_tier: null,
        membership_amount: null,
        is_kyc_verified: false,
        avatar_url: null,
        created_at: user.created_at || null,
        updated_at: null,
      };

      return mockProfile;
    },
    enabled: !!user,
  });
}
