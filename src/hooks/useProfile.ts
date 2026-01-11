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
  isFallback?: boolean;
}

// Generate a simple referral code from user id
function generateReferralCode(userId: string): string {
  return userId.substring(0, 8).toUpperCase();
}

export function useProfile() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      
      try {
        console.log('[useProfile] Fetching profile from MySQL backend');
        
        // Fetch profile from MySQL via edge function
        const { data, error } = await supabase.functions.invoke('mysql-user-data', {
          body: { 
            action: 'GET_PROFILE',
            email: user.email,
            user_id: user.id 
          }
        });

        if (error) {
          console.warn('[useProfile] Edge function error, using fallback:', error.message);
          return createFallbackProfile(user, true);
        }

        // Handle standardized API response format
        if (data?.success === false) {
          console.warn('[useProfile] Backend error:', data.error, data.code);
          return createFallbackProfile(user, true);
        }

        // Extract profile from various response formats
        const profileData = data?.data?.profile || data?.data?.user || data?.user || data?.profile;
        
        if (!profileData) {
          console.log('[useProfile] No profile in response, using fallback');
          return createFallbackProfile(user, true);
        }

        // Map MySQL user data to Profile interface
        return {
          id: profileData.id?.toString() || user.id,
          full_name: profileData.fullname || profileData.full_name || user.user_metadata?.full_name || 'User',
          phone: profileData.phone || null,
          referral_code: profileData.referral_code || generateReferralCode(user.id),
          referred_by: profileData.referrer_id?.toString() || profileData.referred_by || null,
          membership_tier: profileData.membership_tier || 'basic',
          membership_amount: profileData.membership_amount ? parseFloat(profileData.membership_amount) : null,
          is_kyc_verified: Boolean(profileData.is_kyc_verified),
          avatar_url: profileData.avatar_url || null,
          created_at: profileData.created_at || null,
          updated_at: profileData.updated_at || null,
          isFallback: false,
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[useProfile] Failed to fetch profile:', errorMessage);
        return createFallbackProfile(user, true);
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000,
    gcTime: 60000,
  });

  return {
    ...query,
    isFallback: query.data?.isFallback || false,
  };
}

// Helper function to create a fallback profile from Supabase Auth user
function createFallbackProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }, isFallback: boolean): Profile {
  return {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
    phone: (user.user_metadata?.phone as string) || null,
    referral_code: generateReferralCode(user.id),
    referred_by: null,
    membership_tier: 'basic',
    membership_amount: null,
    is_kyc_verified: false,
    avatar_url: null,
    created_at: user.created_at || null,
    updated_at: null,
    isFallback,
  };
}
