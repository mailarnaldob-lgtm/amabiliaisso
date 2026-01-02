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
          console.error('Error fetching wallets from MySQL:', error);
          throw error;
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

        // If no wallets found, the user sync should have created them
        // Return empty array - the sync will be triggered by useProfile
        console.log('No wallets found in MySQL response');
        return [];

      } catch (error) {
        console.error('Failed to fetch wallets, using fallback:', error);
        // Fallback to mock wallet data if MySQL call fails
        return [
          {
            id: `task-${user.id}`,
            user_id: user.id,
            wallet_type: 'task' as const,
            balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: `royalty-${user.id}`,
            user_id: user.id,
            wallet_type: 'royalty' as const,
            balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: `main-${user.id}`,
            user_id: user.id,
            wallet_type: 'main' as const,
            balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }
    },
    enabled: !!user,
  });
}
