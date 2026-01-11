import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Wallet {
  id: string;
  user_id: string;
  wallet_type: 'task' | 'royalty' | 'main';
  balance: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Create default wallets with zero balances
function createDefaultWallets(userId: string): Wallet[] {
  return [
    { id: `task-${userId}`, user_id: userId, wallet_type: 'task', balance: 0, created_at: null, updated_at: null },
    { id: `royalty-${userId}`, user_id: userId, wallet_type: 'royalty', balance: 0, created_at: null, updated_at: null },
    { id: `main-${userId}`, user_id: userId, wallet_type: 'main', balance: 0, created_at: null, updated_at: null },
  ];
}

export function useWallets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Fetch wallets from MySQL via edge function
        const { data, error } = await supabase.functions.invoke('mysql-user-data', {
          body: { 
            action: 'GET_WALLETS',
            email: user.email,
            user_id: user.id 
          }
        });

        if (error) {
          console.warn('MySQL backend unavailable, using default wallets');
          return createDefaultWallets(user.id);
        }

        // Check for service unavailable response
        if (data?.error) {
          console.warn('MySQL service error:', data.error);
          return createDefaultWallets(user.id);
        }

        // If wallets exist in response, map them
        if (data?.wallets && Array.isArray(data.wallets)) {
          return data.wallets.map((w: any) => ({
            id: w.id?.toString() || `${w.wallet_type}-${user.id}`,
            user_id: w.user_id?.toString() || user.id,
            wallet_type: w.wallet_type as 'task' | 'royalty' | 'main',
            balance: parseFloat(w.balance) || 0,
            created_at: w.created_at || null,
            updated_at: w.updated_at || null,
          })) as Wallet[];
        }

        // No wallets found, return defaults
        console.log('No wallets found in MySQL response, using defaults');
        return createDefaultWallets(user.id);

      } catch (error) {
        console.warn('Failed to fetch wallets from MySQL, using defaults:', error);
        return createDefaultWallets(user.id);
      }
    },
    enabled: !!user,
    retry: 1, // Only retry once
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}
