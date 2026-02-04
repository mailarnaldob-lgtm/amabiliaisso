/**
 * SOVEREIGN GATEKEEPER HOOK V9.2
 * Client-side ABC access verification with caching
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ABCAccessResponse {
  success: boolean;
  qualified: boolean;
  accessLevel: 'full' | 'limited' | 'locked';
  tier: string | null;
  isElite: boolean;
  referrals: {
    qualified: number;
    required: number;
    met: boolean;
  };
  vault: {
    exists: boolean;
    balance: number;
    frozen: number;
    active: boolean;
  };
  message: string | null;
  error?: string;
}

export function useABCAccess() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['abc-access', user?.id],
    queryFn: async (): Promise<ABCAccessResponse> => {
      if (!user) {
        return {
          success: false,
          qualified: false,
          accessLevel: 'locked',
          tier: null,
          isElite: false,
          referrals: { qualified: 0, required: 3, met: false },
          vault: { exists: false, balance: 0, frozen: 0, active: false },
          message: 'Authentication required',
        };
      }

      const { data, error } = await supabase.functions.invoke('verify-abc-access');

      // Handle the response - even 403 responses contain valid access data
      // The edge function returns success:true with qualified:false for non-elite users
      if (data && typeof data === 'object' && 'success' in data) {
        // Valid response from edge function (could be 200 or 403)
        return data as ABCAccessResponse;
      }

      if (error) {
        console.error('ABC access verification failed:', error);
        // Return fallback only for actual network/system errors
        return {
          success: false,
          qualified: false,
          accessLevel: 'locked',
          tier: null,
          isElite: false,
          referrals: { qualified: 0, required: 3, met: false },
          vault: { exists: false, balance: 0, frozen: 0, active: false },
          message: 'Access verification failed',
          error: error.message,
        };
      }

      // Fallback for unexpected response format
      return {
        success: false,
        qualified: false,
        accessLevel: 'locked',
        tier: null,
        isElite: false,
        referrals: { qualified: 0, required: 3, met: false },
        vault: { exists: false, balance: 0, frozen: 0, active: false },
        message: 'Unexpected response format',
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Simple hook to check if user just unlocked ELITE status
 * Used to trigger the "Elite Moment" celebration
 */
export function useEliteUnlockDetector() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['elite-unlock-check', user?.id],
    queryFn: async () => {
      if (!user) return { newlyUnlocked: false };
      
      const storageKey = `elite_unlocked_${user.id}`;
      const wasElite = localStorage.getItem(storageKey);
      
      // Check current status
      const { data: profile } = await supabase
        .from('profiles')
        .select('membership_tier')
        .eq('id', user.id)
        .single();
      
      const isNowElite = profile?.membership_tier === 'elite';
      
      if (isNowElite && !wasElite) {
        // First time detecting ELITE - trigger celebration
        localStorage.setItem(storageKey, 'true');
        return { newlyUnlocked: true };
      }
      
      if (isNowElite && wasElite) {
        return { newlyUnlocked: false, alreadyElite: true };
      }
      
      return { newlyUnlocked: false };
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}
