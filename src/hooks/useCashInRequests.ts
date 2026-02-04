import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CashInRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  user_name?: string;
}

// Hook for admin to view all pending cash-in requests
export function usePendingCashInRequests() {
  return useQuery({
    queryKey: ['admin-pending-cash-in-requests'],
    queryFn: async (): Promise<CashInRequest[]> => {
      // Fetch pending requests with user profile info
      const { data: requests, error } = await supabase
        .from('cash_in_requests')
        .select('*')
        .in('status', ['pending', 'on_hold'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useCashInRequests] Error:', error);
        throw error;
      }

      if (!requests || requests.length === 0) return [];

      // Fetch user names for each request
      const userIds = [...new Set(requests.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return requests.map(req => ({
        ...req,
        status: req.status as CashInRequest['status'],
        user_name: profileMap.get(req.user_id) || 'Unknown User',
      }));
    },
    refetchInterval: 15000, // 15-second polling per Blueprint V8.0
    staleTime: 10000,
  });
}

// Hook for user to view their own cash-in requests
export function useUserCashInRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-cash-in-requests', user?.id],
    queryFn: async (): Promise<CashInRequest[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cash_in_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[useUserCashInRequests] Error:', error);
        throw error;
      }

      return (data || []).map(req => ({
        ...req,
        status: req.status as CashInRequest['status'],
      }));
    },
    enabled: !!user,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

// Admin mutation to approve a request
export function useApproveCashIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_cash_in_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; amount?: number; new_balance?: number };
      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      return result;
    },
    onSuccess: (result) => {
      // Invalidate admin views
      queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-in-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cash-in-stats'] });
      // Force invalidate all wallet queries to ensure member sees updated balance
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      // Invalidate user's transaction history
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      console.log('[CashIn] Approved - wallet cache invalidated, amount:', result.amount);
    },
  });
}

// Admin mutation to reject a request
export function useRejectCashIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reject_cash_in_request', {
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
      queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-in-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cash-in-stats'] });
    },
  });
}

// Admin mutation to put a request on hold
export function useHoldCashIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('hold_cash_in_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Hold failed');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-in-requests'] });
    },
  });
}

// Stats hook for admin dashboard
export function useCashInStats() {
  return useQuery({
    queryKey: ['admin-cash-in-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_in_requests')
        .select('status', { count: 'exact' });

      if (error) throw error;

      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const onHold = data?.filter(r => r.status === 'on_hold').length || 0;

      return { pending, onHold, total: pending + onHold };
    },
    refetchInterval: 15000,
  });
}
