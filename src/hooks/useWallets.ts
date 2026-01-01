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
      
      // TODO: Replace with MySQL edge function when mysql-user-wallets is implemented
      // For now, return mock wallet data
      const mockWallets: Wallet[] = [
        {
          id: `task-${user.id}`,
          user_id: user.id,
          wallet_type: 'task',
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `royalty-${user.id}`,
          user_id: user.id,
          wallet_type: 'royalty',
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `main-${user.id}`,
          user_id: user.id,
          wallet_type: 'main',
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return mockWallets;
    },
    enabled: !!user,
  });
}
