import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string | null;
}

export function useWalletTransactions(limit: number = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet-transactions', user?.id, limit],
    queryFn: async (): Promise<WalletTransaction[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        return [];
      }

      return data as WalletTransaction[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}

// Get transactions by wallet type
export function useWalletTransactionsByType(walletId: string | undefined, limit: number = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet-transactions-by-type', user?.id, walletId, limit],
    queryFn: async (): Promise<WalletTransaction[]> => {
      if (!user || !walletId) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        return [];
      }

      return data as WalletTransaction[];
    },
    enabled: !!user && !!walletId,
    staleTime: 30 * 1000,
  });
}
