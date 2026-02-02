import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AdminSettings {
  vault_daily_yield_rate: number;
  lender_bonus_rate: number;
  direct_commission_rate: number;
  internal_transfer_fee: number;
  external_transfer_fee: number;
  loan_duration_days: number;
  master_qr_url: string | null;
  system_status: 'ONLINE' | 'MAINTENANCE' | 'LOCKED';
}

// Default settings (from Blueprint V8.0)
const DEFAULT_SETTINGS: AdminSettings = {
  vault_daily_yield_rate: 0.01, // 1%
  lender_bonus_rate: 0.01, // 1%
  direct_commission_rate: 50.0, // 50%
  internal_transfer_fee: 5.0, // ₳5
  external_transfer_fee: 15.0, // ₳15
  loan_duration_days: 28,
  master_qr_url: null,
  system_status: 'ONLINE',
};

// Fetch admin control settings
export function useAdminControlSettings() {
  return useQuery({
    queryKey: ['admin-control-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .eq('key', 'admin_controls')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        return {
          ...DEFAULT_SETTINGS,
          ...(data.value as Partial<AdminSettings>),
        };
      }

      return DEFAULT_SETTINGS;
    },
  });
}

// Update admin control settings
export function useUpdateAdminControls() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<AdminSettings>) => {
      if (!user) throw new Error('Not authenticated');

      // Get current settings
      const { data: existing } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'admin_controls')
        .maybeSingle();

      const currentSettings = existing?.value 
        ? (existing.value as Record<string, unknown>) 
        : DEFAULT_SETTINGS;
      const newSettings = { ...DEFAULT_SETTINGS, ...currentSettings, ...updates };

      // Upsert settings
      const { data, error } = await supabase
        .from('system_settings')
        .upsert(
          {
            key: 'admin_controls',
            value: newSettings,
            description: 'Global admin control settings (rates, fees, limits)',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Admin settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-control-settings'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
}

// Fetch system treasury stats
export function useAdminTreasuryStats() {
  return useQuery({
    queryKey: ['admin-treasury-stats'],
    queryFn: async () => {
      // Get all wallet balances
      const { data: wallets, error: walletError } = await supabase
        .from('wallets')
        .select('wallet_type, balance');

      if (walletError) throw walletError;

      // Get fee transactions (system revenue)
      const { data: feeTransactions, error: feeError } = await supabase
        .from('wallet_transactions')
        .select('amount, transaction_type')
        .in('transaction_type', [
          'transfer_fee',
          'withdrawal_fee',
          'lending_fee',
          'campaign_fee',
        ]);

      if (feeError) throw feeError;

      // Get commission payouts
      const { data: commissions, error: commError } = await supabase
        .from('referral_commissions')
        .select('commission_amount, is_paid');

      if (commError) throw commError;

      // Calculate totals
      const totalMainBalance = wallets
        .filter((w) => w.wallet_type === 'main')
        .reduce((sum, w) => sum + Number(w.balance || 0), 0);

      const totalTaskBalance = wallets
        .filter((w) => w.wallet_type === 'task')
        .reduce((sum, w) => sum + Number(w.balance || 0), 0);

      const totalRoyaltyBalance = wallets
        .filter((w) => w.wallet_type === 'royalty')
        .reduce((sum, w) => sum + Number(w.balance || 0), 0);

      const totalFeesCollected = feeTransactions.reduce(
        (sum, t) => sum + Math.abs(Number(t.amount)),
        0
      );

      const totalCommissionsPaid = commissions
        .filter((c) => c.is_paid)
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);

      const pendingCommissions = commissions
        .filter((c) => !c.is_paid)
        .reduce((sum, c) => sum + Number(c.commission_amount), 0);

      return {
        totalCirculating: totalMainBalance + totalTaskBalance + totalRoyaltyBalance,
        mainWalletTotal: totalMainBalance,
        taskWalletTotal: totalTaskBalance,
        royaltyWalletTotal: totalRoyaltyBalance,
        totalFeesCollected,
        totalCommissionsPaid,
        pendingCommissions,
        systemLiquidity: totalMainBalance, // Available for withdrawals
      };
    },
  });
}

// Get system health metrics
export function useAdminSystemHealth() {
  return useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      // Get recent transactions (last 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: recentTx, error: txError } = await supabase
        .from('wallet_transactions')
        .select('id, created_at, transaction_type')
        .gte('created_at', oneDayAgo.toISOString());

      if (txError) throw txError;

      // Get active loans count
      const { count: activeLoans, error: loanError } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (loanError) throw loanError;

      // Get pending items count
      const { count: pendingPayments, error: paymentError } = await supabase
        .from('membership_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (paymentError) throw paymentError;

      const { count: pendingTasks, error: taskError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (taskError) throw taskError;

      return {
        transactionsLast24h: recentTx?.length || 0,
        activeLoans: activeLoans || 0,
        pendingPayments: pendingPayments || 0,
        pendingTasks: pendingTasks || 0,
        systemStatus: 'ONLINE' as const,
        lastUpdated: new Date().toISOString(),
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
