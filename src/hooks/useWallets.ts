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
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user,
  });
}
