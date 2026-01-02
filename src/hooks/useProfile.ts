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
      
      try {
        // Fetch profile from MySQL via edge function
        const { data, error } = await supabase.functions.invoke('mysql-user-data', {
          body: { 
            action: 'GET_PROFILE',
            email: user.email,
            user_id: user.id 
          }
        });

        if (error) {
          console.error('Error fetching profile from MySQL:', error);
          throw error;
        }

        // If no user found in MySQL, trigger sync to create user record
        if (!data?.user) {
          console.log('User not found in MySQL, triggering sync...');
          const { data: syncData, error: syncError } = await supabase.functions.invoke('mysql-user-data', {
            body: { 
              action: 'SYNC_USER',
              email: user.email,
              user_id: user.id,
              full_name: user.user_metadata?.full_name || 'User'
            }
          });

          if (syncError) {
            console.error('Error syncing user to MySQL:', syncError);
          }

          // Return newly synced profile or fallback
          if (syncData?.user) {
            return {
              id: syncData.user.id?.toString() || user.id,
              full_name: syncData.user.fullname || user.user_metadata?.full_name || 'User',
              phone: syncData.user.phone || null,
              referral_code: syncData.user.referral_code || 'PENDING',
              referred_by: syncData.user.referrer_id?.toString() || null,
              membership_tier: syncData.user.membership_tier || null,
              membership_amount: null,
              is_kyc_verified: false,
              avatar_url: null,
              created_at: syncData.user.created_at || null,
              updated_at: null,
            } as Profile;
          }
        }

        // Map MySQL user data to Profile interface
        const mysqlUser = data.user;
        return {
          id: mysqlUser.id?.toString() || user.id,
          full_name: mysqlUser.fullname || user.user_metadata?.full_name || 'User',
          phone: mysqlUser.phone || null,
          referral_code: mysqlUser.referral_code || 'PENDING',
          referred_by: mysqlUser.referrer_id?.toString() || null,
          membership_tier: mysqlUser.membership_tier || null,
          membership_amount: null,
          is_kyc_verified: false,
          avatar_url: null,
          created_at: mysqlUser.created_at || null,
          updated_at: null,
        } as Profile;

      } catch (error) {
        console.error('Failed to fetch profile, using fallback:', error);
        // Fallback to auth user data if MySQL call fails
        return {
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
        } as Profile;
      }
    },
    enabled: !!user,
  });
}
