import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Loan {
  id: string;
  lender_id: string;
  borrower_id: string | null;
  principal_amount: number;
  interest_rate: number;
  interest_amount: number | null;
  term_days: number;
  total_repayment: number | null;
  processing_fee: number | null;
  status: 'pending' | 'active' | 'repaid' | 'defaulted' | 'cancelled';
  escrow_wallet_id: string | null;
  created_at: string | null;
  accepted_at: string | null;
  due_at: string | null;
  repaid_at: string | null;
}

// Fetch all pending loan offers (for marketplace)
export function usePendingLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-loans'],
    queryFn: async (): Promise<Loan[]> => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending loans:', error);
        return [];
      }

      return data as Loan[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

// Fetch user's own loans (as lender)
export function useMyLentLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-lent-loans', user?.id],
    queryFn: async (): Promise<Loan[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('lender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my lent loans:', error);
        return [];
      }

      return data as Loan[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

// Fetch user's borrowed loans (as borrower)
export function useMyBorrowedLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-borrowed-loans', user?.id],
    queryFn: async (): Promise<Loan[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my borrowed loans:', error);
        return [];
      }

      return data as Loan[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

// Fetch active loans (for admin CRO panel)
export function useActiveLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-loans'],
    queryFn: async (): Promise<Loan[]> => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'active')
        .order('due_at', { ascending: true });

      if (error) {
        console.error('Error fetching active loans:', error);
        return [];
      }

      return data as Loan[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

// Fetch defaulted loans (for admin CRO panel rescue)
export function useDefaultedLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['defaulted-loans'],
    queryFn: async (): Promise<Loan[]> => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'defaulted')
        .order('due_at', { ascending: true });

      if (error) {
        console.error('Error fetching defaulted loans:', error);
        return [];
      }

      return data as Loan[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

// Aggregate loan statistics
export function useLoanStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['loan-stats'],
    queryFn: async () => {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*');

      if (error) {
        console.error('Error fetching loan stats:', error);
        return {
          totalLoans: 0,
          pendingLoans: 0,
          activeLoans: 0,
          repaidLoans: 0,
          defaultedLoans: 0,
          totalPrincipal: 0,
          totalActiveValue: 0,
        };
      }

      const stats = {
        totalLoans: loans.length,
        pendingLoans: loans.filter(l => l.status === 'pending').length,
        activeLoans: loans.filter(l => l.status === 'active').length,
        repaidLoans: loans.filter(l => l.status === 'repaid').length,
        defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
        totalPrincipal: loans.reduce((sum, l) => sum + l.principal_amount, 0),
        totalActiveValue: loans
          .filter(l => l.status === 'active')
          .reduce((sum, l) => sum + (l.total_repayment || l.principal_amount), 0),
      };

      return stats;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}
