/**
 * SYSTEM LIQUIDITY HOOK - SOVEREIGN V12.0
 * Admin-only access to ecosystem-wide liquidity stats
 * 
 * Uses atomic RPC functions for accurate aggregate data:
 * - get_system_liquidity_stats: Wallet + Vault + Commission totals
 * - get_edge_function_health: Cron job execution status
 * 
 * RESTful polling: 30-second intervals for admin dashboards
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useUserRole';

// Types for liquidity data
export interface WalletLiquidity {
  task_total: number;
  royalty_total: number;
  main_total: number;
  circulating_total: number;
  unique_users: number;
}

export interface VaultLiquidity {
  deposits_total: number;
  frozen_total: number;
  vault_count: number;
  active_count: number;
}

export interface CommissionStats {
  total_paid: number;
  event_count: number;
  earner_count: number;
}

export interface SystemLiquidityData {
  wallets: WalletLiquidity;
  vaults: VaultLiquidity;
  commissions: CommissionStats;
  timestamp: string;
}

export interface EdgeFunctionHealth {
  function_name: string;
  last_execution: string;
  execution_status: 'success' | 'error' | 'running';
  details: Record<string, unknown>;
}

// Type guard for RPC response
interface LiquidityRpcResponse {
  success: boolean;
  error?: string;
  wallets?: WalletLiquidity;
  vaults?: VaultLiquidity;
  commissions?: CommissionStats;
  timestamp?: string;
}

interface HealthRpcResponse {
  success: boolean;
  error?: string;
  functions?: EdgeFunctionHealth[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM LIQUIDITY HOOK
// ═══════════════════════════════════════════════════════════════════════════
export function useSystemLiquidity() {
  const { isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['system-liquidity'],
    queryFn: async (): Promise<SystemLiquidityData | null> => {
      const { data, error } = await supabase.rpc('get_system_liquidity_stats');

      if (error) {
        console.error('System liquidity fetch error:', error);
        return null;
      }

      const response = data as unknown as LiquidityRpcResponse;

      if (!response?.success) {
        console.log('System liquidity access denied:', response?.error);
        return null;
      }

      return {
        wallets: response.wallets!,
        vaults: response.vaults!,
        commissions: response.commissions!,
        timestamp: response.timestamp!,
      };
    },
    enabled: isAdmin,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Polling for admin dashboard
    refetchIntervalInBackground: false,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EDGE FUNCTION HEALTH HOOK
// ═══════════════════════════════════════════════════════════════════════════
export function useEdgeFunctionHealth() {
  const { isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['edge-function-health'],
    queryFn: async (): Promise<EdgeFunctionHealth[] | null> => {
      const { data, error } = await supabase.rpc('get_edge_function_health');

      if (error) {
        console.error('Edge function health fetch error:', error);
        return null;
      }

      const response = data as unknown as HealthRpcResponse;

      if (!response?.success) {
        console.log('Edge function health access denied:', response?.error);
        return null;
      }

      return response.functions || [];
    },
    enabled: isAdmin,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Check every minute
    refetchIntervalInBackground: false,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED ECOSYSTEM STATS
// ═══════════════════════════════════════════════════════════════════════════
export function useEcosystemOverview() {
  const liquidityQuery = useSystemLiquidity();
  const healthQuery = useEdgeFunctionHealth();

  // Calculate derived metrics
  const totalEcosystemValue = liquidityQuery.data 
    ? (liquidityQuery.data.wallets.circulating_total || 0) + 
      (liquidityQuery.data.vaults.deposits_total || 0)
    : 0;

  const reserveRatio = liquidityQuery.data?.vaults.deposits_total 
    ? ((liquidityQuery.data.vaults.deposits_total - liquidityQuery.data.vaults.frozen_total) / 
       liquidityQuery.data.vaults.deposits_total) * 100
    : 100;

  return {
    liquidity: liquidityQuery.data,
    health: healthQuery.data,
    isLoading: liquidityQuery.isLoading || healthQuery.isLoading,
    error: liquidityQuery.error || healthQuery.error,
    totalEcosystemValue,
    reserveRatio,
    refetch: () => {
      liquidityQuery.refetch();
      healthQuery.refetch();
    },
  };
}
