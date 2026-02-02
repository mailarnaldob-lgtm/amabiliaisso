import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LoanStatus = Database['public']['Enums']['loan_status'];

export interface AdminLoan {
  id: string;
  lender_id: string;
  borrower_id: string | null;
  principal_amount: number;
  interest_rate: number;
  interest_amount: number | null;
  processing_fee: number | null;
  total_repayment: number | null;
  term_days: number;
  status: LoanStatus;
  created_at: string | null;
  accepted_at: string | null;
  due_at: string | null;
  repaid_at: string | null;
}

export interface LoanWithProfiles extends AdminLoan {
  lender_name?: string;
  borrower_name?: string;
}

// Fetch all loans with lender/borrower names
export function useAdminLoansAll() {
  return useQuery({
    queryKey: ['admin-loans-all'],
    queryFn: async () => {
      const { data: loans, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (loanError) throw loanError;

      // Get unique user IDs
      const userIds = [
        ...new Set([
          ...loans.map((l) => l.lender_id),
          ...loans.filter((l) => l.borrower_id).map((l) => l.borrower_id as string),
        ]),
      ];

      // Fetch profile names
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles.map((p) => [p.id, p.full_name]));

      return loans.map((loan) => ({
        ...loan,
        lender_name: profileMap.get(loan.lender_id) || 'Unknown',
        borrower_name: loan.borrower_id ? profileMap.get(loan.borrower_id) || 'Unknown' : null,
      })) as LoanWithProfiles[];
    },
  });
}

// Get loan statistics
export function useAdminLoanStats() {
  return useQuery({
    queryKey: ['admin-loan-stats'],
    queryFn: async () => {
      const { data: loans, error } = await supabase.from('loans').select('*');

      if (error) throw error;

      const stats = {
        totalLoans: loans.length,
        pendingOffers: loans.filter((l) => l.status === 'pending').length,
        activeLoans: loans.filter((l) => l.status === 'active').length,
        repaidLoans: loans.filter((l) => l.status === 'repaid').length,
        defaultedLoans: loans.filter((l) => l.status === 'defaulted').length,
        cancelledLoans: loans.filter((l) => l.status === 'cancelled').length,
        totalPrincipal: loans.reduce((sum, l) => sum + Number(l.principal_amount), 0),
        totalInterest: loans.reduce((sum, l) => sum + Number(l.interest_amount || 0), 0),
        totalFees: loans.reduce((sum, l) => sum + Number(l.processing_fee || 0), 0),
        activePrincipal: loans
          .filter((l) => l.status === 'active')
          .reduce((sum, l) => sum + Number(l.principal_amount), 0),
        overdueLoans: loans.filter((l) => {
          if (l.status !== 'active' || !l.due_at) return false;
          return new Date(l.due_at) < new Date();
        }).length,
      };

      return stats;
    },
  });
}

// Trigger manual loan processing (auto-repayment)
export function useAdminProcessLoans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('process_expired_loans');

      if (error) throw error;
      return data as {
        success: boolean;
        repaid_count: number;
        defaulted_count: number;
        total_repaid: number;
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          `Processed ${result.repaid_count} repayments, ${result.defaulted_count} defaults. Total: ₳${result.total_repaid.toLocaleString()}`
        );
      } else {
        toast.info('No loans required processing');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-loans-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin-loan-stats'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: Error) => {
      toast.error(`Loan processing failed: ${error.message}`);
    },
  });
}

// Get overdue loans requiring attention
export function useAdminOverdueLoans() {
  return useQuery({
    queryKey: ['admin-overdue-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'active')
        .lt('due_at', new Date().toISOString())
        .order('due_at', { ascending: true });

      if (error) throw error;

      // Get borrower names
      const borrowerIds = data.filter((l) => l.borrower_id).map((l) => l.borrower_id as string);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', borrowerIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return data.map((loan) => ({
        ...loan,
        borrower_name: loan.borrower_id ? profileMap.get(loan.borrower_id) || 'Unknown' : null,
        days_overdue: Math.floor(
          (Date.now() - new Date(loan.due_at!).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }));
    },
  });
}

// Get loan transactions for audit
export function useAdminLoanTransactions(loanId: string | null) {
  return useQuery({
    queryKey: ['admin-loan-transactions', loanId],
    queryFn: async () => {
      if (!loanId) return [];

      const { data, error } = await supabase
        .from('loan_transactions')
        .select('*')
        .eq('loan_id', loanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!loanId,
  });
}
