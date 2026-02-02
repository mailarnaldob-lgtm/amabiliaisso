import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EliteVault {
  id: string;
  user_id: string;
  total_balance: number;
  frozen_collateral: number;
  available_balance: number;
  last_yield_accrual: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VaultTransaction {
  id: string;
  vault_id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

export function useEliteVault() {
  const queryClient = useQueryClient();

  // Fetch vault data using raw query to avoid type issues with new table
  const { data: vault, isLoading, error, refetch } = useQuery({
    queryKey: ['elite-vault'],
    queryFn: async (): Promise<EliteVault | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Use rpc or raw fetch for table not yet in types
      const { data, error } = await supabase
        .from('elite_vaults')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Table might not exist yet or user doesn't have access
        console.log('Vault fetch info:', error.message);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        user_id: data.user_id,
        total_balance: Number(data.total_balance) || 0,
        frozen_collateral: Number(data.frozen_collateral) || 0,
        available_balance: Number(data.available_balance) || 0,
        last_yield_accrual: data.last_yield_accrual,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    },
    staleTime: 30000,
  });

  // Fetch vault transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['vault-transactions'],
    queryFn: async (): Promise<VaultTransaction[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('vault_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.log('Vault transactions fetch info:', error.message);
        return [];
      }

      return (data || []).map((tx: Record<string, unknown>) => ({
        id: tx.id as string,
        vault_id: tx.vault_id as string,
        user_id: tx.user_id as string,
        amount: Number(tx.amount) || 0,
        transaction_type: tx.transaction_type as string,
        description: tx.description as string | null,
        created_at: tx.created_at as string,
      }));
    },
    staleTime: 30000,
  });

  // Deposit to vault
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('vault-deposit', {
        body: { amount },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Deposit failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Deposit failed');
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Vault Deposit Successful',
        description: `₳${data.amount.toLocaleString()} deposited to your vault`,
      });
      queryClient.invalidateQueries({ queryKey: ['elite-vault'] });
      queryClient.invalidateQueries({ queryKey: ['vault-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Deposit Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Withdraw from vault
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('vault-withdraw', {
        body: { amount },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Withdrawal failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Withdrawal failed');
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Vault Withdrawal Successful',
        description: `₳${data.amount.toLocaleString()} withdrawn to main wallet`,
      });
      queryClient.invalidateQueries({ queryKey: ['elite-vault'] });
      queryClient.invalidateQueries({ queryKey: ['vault-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    vault,
    transactions,
    isLoading,
    error,
    refetch,
    deposit: depositMutation.mutate,
    withdraw: withdrawMutation.mutate,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
}
