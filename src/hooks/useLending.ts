import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface LoanOffer {
  id: string;
  lender_id: string;
  lender_name?: string;
  principal_amount: number;
  interest_rate: number;
  interest_amount: number | null;
  processing_fee: number | null;
  total_repayment: number | null;
  term_days: number;
  status: 'pending' | 'active' | 'repaid' | 'defaulted' | 'cancelled';
  created_at: string | null;
  accepted_at: string | null;
  due_at: string | null;
  borrower_id: string | null;
}

// Fetch available loan offers (pending offers from other users)
export function useLoanOffers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['loan-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          lender:lender_id(full_name)
        `)
        .eq('status', 'pending')
        .neq('lender_id', user?.id ?? '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((loan) => ({
        ...loan,
        lender_name: (loan.lender as unknown as { full_name: string })?.full_name || 'Anonymous',
      })) as LoanOffer[];
    },
    enabled: !!user,
  });
}

// Fetch user's own loan offers (as lender)
export function useMyLoanOffers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-loan-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('lender_id', user?.id ?? '')
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LoanOffer[];
    },
    enabled: !!user,
  });
}

// Fetch user's active loans (as borrower)
export function useMyActiveLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-active-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          lender:lender_id(full_name)
        `)
        .eq('borrower_id', user?.id ?? '')
        .eq('status', 'active')
        .order('due_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((loan) => ({
        ...loan,
        lender_name: (loan.lender as unknown as { full_name: string })?.full_name || 'Anonymous',
      })) as LoanOffer[];
    },
    enabled: !!user,
  });
}

// Post a new lending offer
export function usePostLoanOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal_amount }: { principal_amount: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('lending-post-offer', {
        body: { principal_amount },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Loan offer posted! Your ₳ is now in escrow.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post loan offer');
    },
  });
}

// Take a loan offer
export function useTakeLoanOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loan_id }: { loan_id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('lending-take-offer', {
        body: { loan_id },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-active-loans'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success(`Loan of ₳${data.loan.principal_amount.toLocaleString()} received!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to take loan offer');
    },
  });
}

// Cancel a loan offer
export function useCancelLoanOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loan_id }: { loan_id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('lending-cancel-offer', {
        body: { loan_id },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Loan offer cancelled. Funds returned to your wallet.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel loan offer');
    },
  });
}

// Repay a loan
export function useRepayLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loan_id }: { loan_id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('lending-repay-loan', {
        body: { loan_id },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-loan-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-active-loans'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success(`Loan repaid! ₳${data.repayment.total_repaid.toLocaleString()} sent to lender.`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to repay loan');
    },
  });
}
