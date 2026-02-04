import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CashOutRequest {
  id: string;
  user_id: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  payment_method: string;
  account_name: string;
  account_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'processing';
  rejection_reason: string | null;
  has_active_loan: boolean;
  pin_verified: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  user_name?: string;
  user_phone?: string;
}

// Hook for admin to view all pending cash-out requests
export function usePendingCashOutRequests() {
  return useQuery({
    queryKey: ['admin-pending-cash-out-requests'],
    queryFn: async (): Promise<CashOutRequest[]> => {
      // Fetch pending requests
      const { data: requests, error } = await supabase
        .from('cash_out_requests')
        .select('*')
        .in('status', ['pending', 'flagged'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useCashOutRequests] Error:', error);
        throw error;
      }

      if (!requests || requests.length === 0) return [];

      // Fetch user profile info for identity verification
      const userIds = [...new Set(requests.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, { name: p.full_name, phone: p.phone }]) || []);

      return requests.map(req => ({
        ...req,
        status: req.status as CashOutRequest['status'],
        user_name: profileMap.get(req.user_id)?.name || 'Unknown User',
        user_phone: profileMap.get(req.user_id)?.phone || null,
      }));
    },
    refetchInterval: 15000, // 15-second polling per Blueprint V8.0
    staleTime: 10000,
  });
}

// Hook for user to view their own cash-out requests
export function useUserCashOutRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-cash-out-requests', user?.id],
    queryFn: async (): Promise<CashOutRequest[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cash_out_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[useUserCashOutRequests] Error:', error);
        throw error;
      }

      return (data || []).map(req => ({
        ...req,
        status: req.status as CashOutRequest['status'],
      }));
    },
    enabled: !!user,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

// Admin mutation to approve a request
export function useApproveCashOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_cash_out_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; amount?: number; net_amount?: number };
      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      return result;
    },
    onSuccess: (result) => {
      // Invalidate admin views
      queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-out-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cash-out-stats'] });
      // Force invalidate all wallet queries to ensure member sees updated balance
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      // Invalidate user's transaction history
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      console.log('[CashOut] Approved - wallet cache invalidated, amount:', result.amount);
    },
  });
}

// Admin mutation to reject a request
export function useRejectCashOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reject_cash_out_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
        p_reason: reason,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Rejection failed');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-out-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cash-out-stats'] });
    },
  });
}

// Admin mutation to flag a request for review
export function useFlagCashOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('flag_cash_out_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Flag failed');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-out-requests'] });
    },
  });
}

// Stats hook for admin dashboard
export function useCashOutStats() {
  return useQuery({
    queryKey: ['admin-cash-out-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_out_requests')
        .select('status, amount', { count: 'exact' });

      if (error) throw error;

      const pending = data?.filter(r => r.status === 'pending') || [];
      const flagged = data?.filter(r => r.status === 'flagged') || [];
      const pendingTotal = pending.reduce((sum, r) => sum + (r.amount || 0), 0);

      return { 
        pending: pending.length, 
        flagged: flagged.length, 
        total: pending.length + flagged.length,
        pendingAmount: pendingTotal
      };
    },
    refetchInterval: 15000,
  });
}
