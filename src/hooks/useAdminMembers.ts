import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MembershipTier = Database['public']['Enums']['membership_tier'];

export interface MemberProfile {
  id: string;
  full_name: string;
  phone: string | null;
  referral_code: string;
  referred_by: string | null;
  membership_tier: MembershipTier | null;
  membership_amount: number | null;
  is_kyc_verified: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MemberWithWallets extends MemberProfile {
  wallets: {
    wallet_type: string;
    balance: number;
  }[];
  total_balance: number;
}

// Fetch all members with their wallet balances
export function useAdminMembers() {
  return useQuery({
    queryKey: ['admin-members-full'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Get all wallets
      const { data: wallets, error: walletError } = await supabase
        .from('wallets')
        .select('user_id, wallet_type, balance');

      if (walletError) throw walletError;

      // Merge wallets with profiles
      const membersWithWallets: MemberWithWallets[] = profiles.map((profile) => {
        const memberWallets = wallets
          .filter((w) => w.user_id === profile.id)
          .map((w) => ({
            wallet_type: w.wallet_type,
            balance: Number(w.balance) || 0,
          }));

        const total_balance = memberWallets.reduce((sum, w) => sum + w.balance, 0);

        return {
          ...profile,
          wallets: memberWallets,
          total_balance,
        };
      });

      return membersWithWallets;
    },
  });
}

// Fetch single member with full details
export function useAdminMemberDetails(userId: string | null) {
  return useQuery({
    queryKey: ['admin-member-details', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: wallets, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);

      if (walletError) throw walletError;

      const { data: transactions, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;

      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) throw roleError;

      return {
        profile,
        wallets,
        transactions,
        role: role?.role || 'member',
      };
    },
    enabled: !!userId,
  });
}

// Update member profile (admin only)
export function useAdminUpdateMember() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      updates,
    }: {
      memberId: string;
      updates: Partial<{
        full_name: string;
        phone: string;
        membership_tier: MembershipTier;
        is_kyc_verified: boolean;
      }>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-members-full'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update member: ${error.message}`);
    },
  });
}

// Verify member KYC
export function useAdminVerifyKYC() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      verified,
    }: {
      memberId: string;
      verified: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_kyc_verified: verified })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { verified }) => {
      toast.success(verified ? 'KYC verified successfully' : 'KYC verification removed');
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-members-full'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });
}

// Upgrade member tier directly (admin override)
export function useAdminUpgradeMember() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      tier,
      amount,
    }: {
      memberId: string;
      tier: MembershipTier;
      amount: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          membership_tier: tier,
          membership_amount: amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tier }) => {
      toast.success(`Member upgraded to ${tier.toUpperCase()} tier`);
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-members-full'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to upgrade member: ${error.message}`);
    },
  });
}

// Get member statistics
export function useAdminMemberStats() {
  return useQuery({
    queryKey: ['admin-member-stats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, membership_tier, is_kyc_verified, created_at');

      if (error) throw error;

      const stats = {
        total: profiles.length,
        basic: profiles.filter((p) => !p.membership_tier || p.membership_tier === 'basic').length,
        pro: profiles.filter((p) => p.membership_tier === 'pro').length,
        expert: profiles.filter((p) => p.membership_tier === 'expert').length,
        elite: profiles.filter((p) => p.membership_tier === 'elite').length,
        kycVerified: profiles.filter((p) => p.is_kyc_verified).length,
        kycPending: profiles.filter((p) => !p.is_kyc_verified).length,
        thisMonth: profiles.filter((p) => {
          const createdAt = p.created_at ? new Date(p.created_at) : null;
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return createdAt && createdAt > monthAgo;
        }).length,
      };

      return stats;
    },
  });
}
