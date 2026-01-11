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

// Generate a simple referral code from user id
function generateReferralCode(userId: string): string {
  return userId.substring(0, 8).toUpperCase();
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
          console.warn('MySQL backend unavailable, using fallback profile from auth data');
          // Return fallback profile from Supabase Auth metadata
          return createFallbackProfile(user);
        }

        // Check for service unavailable response
        if (data?.error) {
          console.warn('MySQL service error:', data.error);
          return createFallbackProfile(user);
        }

        // If no user found in MySQL, use fallback
        if (!data?.user) {
          console.log('User not found in MySQL, using fallback profile');
          return createFallbackProfile(user);
        }

        // Map MySQL user data to Profile interface
        const mysqlUser = data.user;
        return {
          id: mysqlUser.id?.toString() || user.id,
          full_name: mysqlUser.fullname || user.user_metadata?.full_name || 'User',
          phone: mysqlUser.phone || null,
          referral_code: mysqlUser.referral_code || generateReferralCode(user.id),
          referred_by: mysqlUser.referrer_id?.toString() || null,
          membership_tier: mysqlUser.membership_tier || 'basic',
          membership_amount: null,
          is_kyc_verified: false,
          avatar_url: null,
          created_at: mysqlUser.created_at || null,
          updated_at: null,
        } as Profile;

      } catch (error) {
        console.warn('Failed to fetch profile from MySQL, using fallback:', error);
        // Return fallback profile instead of throwing
        return createFallbackProfile(user);
      }
    },
    enabled: !!user,
    retry: 1, // Only retry once
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// Helper function to create a fallback profile from Supabase Auth user
function createFallbackProfile(user: any): Profile {
  return {
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    phone: user.user_metadata?.phone || null,
    referral_code: generateReferralCode(user.id),
    referred_by: null,
    membership_tier: 'basic',
    membership_amount: null,
    is_kyc_verified: false,
    avatar_url: null,
    created_at: user.created_at || null,
    updated_at: null,
  };
}
