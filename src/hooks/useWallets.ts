import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useMemo, useEffect } from 'react';

export interface Wallet {
  id: string;
  user_id: string;
  wallet_type: 'task' | 'royalty' | 'main';
  balance: number;
  created_at: string | null;
  updated_at: string | null;
}

interface WalletsResult {
  wallets: Wallet[];
  isFallback: boolean;
}

// Create default wallets with zero balances
function createDefaultWallets(userId: string): WalletsResult {
  return {
    wallets: [
      { id: `task-${userId}`, user_id: userId, wallet_type: 'task', balance: 0, created_at: null, updated_at: null },
      { id: `royalty-${userId}`, user_id: userId, wallet_type: 'royalty', balance: 0, created_at: null, updated_at: null },
      { id: `main-${userId}`, user_id: userId, wallet_type: 'main', balance: 0, created_at: null, updated_at: null },
    ],
    isFallback: true,
  };
}

/**
 * Hook for wallet data with real-time updates via Supabase Realtime
 * Listens for INSERT, UPDATE, DELETE on user's wallets for live balance sync
 */
export function useWallets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async (): Promise<WalletsResult> => {
      if (!user) return { wallets: [], isFallback: false };
      
      try {
        console.log('[useWallets] Fetching wallets from Supabase');
        
        // Fetch wallets directly from Supabase
        const { data: walletsData, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.warn('[useWallets] Supabase error, using defaults:', error.message);
          return createDefaultWallets(user.id);
        }

        if (!walletsData || walletsData.length === 0) {
          console.log('[useWallets] No wallets found, using defaults');
          return createDefaultWallets(user.id);
        }

        // Map wallet data with proper type handling
        const wallets: Wallet[] = walletsData.map((w) => ({
          id: w.id,
          user_id: w.user_id,
          wallet_type: w.wallet_type,
          balance: Number(w.balance) || 0,
          created_at: w.created_at || null,
          updated_at: w.updated_at || null,
        }));

        console.log('[useWallets] Loaded', wallets.length, 'wallets');
        return { wallets, isFallback: false };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[useWallets] Failed to fetch wallets:', errorMessage);
        return createDefaultWallets(user.id);
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000,
    gcTime: 60000,
  });

  // Real-time subscription for live wallet balance updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('[useWallets] Setting up realtime subscription for user:', user.id);

    const channel = supabase
      .channel(`wallets-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[useWallets] Realtime update received:', payload.eventType);
          
          // Update the cache optimistically based on the event
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedWallet = payload.new as Wallet;
            
            queryClient.setQueryData<WalletsResult>(
              ['wallets', user.id],
              (oldData) => {
                if (!oldData) return oldData;
                
                return {
                  ...oldData,
                  wallets: oldData.wallets.map((w) =>
                    w.id === updatedWallet.id
                      ? {
                          ...w,
                          balance: Number(updatedWallet.balance) || 0,
                          updated_at: updatedWallet.updated_at,
                        }
                      : w
                  ),
                };
              }
            );
          } else {
            // For INSERT/DELETE, refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['wallets', user.id] });
          }
        }
      )
      .subscribe((status) => {
        console.log('[useWallets] Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('[useWallets] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Memoized helper to get balance by wallet type
  const getBalance = useCallback((type: 'task' | 'royalty' | 'main'): number => {
    const wallet = query.data?.wallets.find(w => w.wallet_type === type);
    return wallet?.balance || 0;
  }, [query.data?.wallets]);

  // Memoized total balance
  const totalBalance = useMemo(() => {
    return query.data?.wallets.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
  }, [query.data?.wallets]);

  return {
    ...query,
    wallets: query.data?.wallets || [],
    isFallback: query.data?.isFallback || false,
    getBalance,
    totalBalance,
  };
}
