import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet } from '@/hooks/useWallets';
import { useToast } from '@/hooks/use-toast';

// Wallet type alias for clarity
type WalletType = 'task' | 'royalty' | 'main';

/**
 * Optimistic Transaction Interface
 * Tracks pending transactions for zero-lag UI updates
 */
interface OptimisticTransaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdraw';
  fromType?: WalletType;
  toType?: WalletType;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

interface WalletBalances {
  task: number;
  royalty: number;
  main: number;
}

interface WalletsResult {
  wallets: Wallet[];
  isFallback: boolean;
}

/**
 * Sovereign Optimistic Wallet Hook
 * Provides zero-lag UI updates while Sovereign Ledger clears transactions
 * Implements debounce protection and intelligent cache management
 */
export function useOptimisticWallets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [pendingTransactions, setPendingTransactions] = useState<OptimisticTransaction[]>([]);
  const [optimisticBalances, setOptimisticBalances] = useState<WalletBalances | null>(null);
  
  // Debounce protection with extended timeout for stability
  const lastTransactionRef = useRef<number>(0);
  const DEBOUNCE_MS = 750; // Extended for Sovereign Ledger stability

  /**
   * Get current cached balances from React Query with local fallback
   */
  const getCachedBalances = useCallback((): WalletBalances => {
    const walletsData = queryClient.getQueryData<WalletsResult>(['wallets', user?.id]);
    
    if (!walletsData?.wallets) {
      return { main: 0, task: 0, royalty: 0 };
    }
    
    return walletsData.wallets.reduce((acc, w) => {
      acc[w.wallet_type] = Math.floor(Number(w.balance) || 0);
      return acc;
    }, { main: 0, task: 0, royalty: 0 } as WalletBalances);
  }, [queryClient, user?.id]);

  /**
   * Optimistic transfer between wallets with immediate UI update
   */
  const optimisticTransfer = useCallback(async (
    fromWallet: WalletType,
    toWallet: WalletType,
    amount: number
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Debounce protection
    const now = Date.now();
    if (now - lastTransactionRef.current < DEBOUNCE_MS) {
      toast({
        variant: 'destructive',
        title: 'Too fast',
        description: 'Please wait before submitting another transaction',
      });
      return false;
    }
    lastTransactionRef.current = now;
    
    // Validate amount (Whole Peso Mandate)
    const wholeAmount = Math.floor(amount);
    if (wholeAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Amount must be a positive whole number',
      });
      return false;
    }
    
    // Get current balances
    const currentBalances = optimisticBalances || getCachedBalances();
    
    // Validate sufficient balance
    if (currentBalances[fromWallet] < wholeAmount) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `Not enough ₳ Credits in ${fromWallet} wallet`,
      });
      return false;
    }
    
    // Generate transaction ID
    const txId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create optimistic transaction
    const optimisticTx: OptimisticTransaction = {
      id: txId,
      type: 'transfer',
      amount: wholeAmount,
      fromType: fromWallet,
      toType: toWallet,
      status: 'pending',
      timestamp: now,
    };
    
    // OPTIMISTIC UPDATE: Apply immediately
    const newBalances: WalletBalances = {
      ...currentBalances,
      [fromWallet]: currentBalances[fromWallet] - wholeAmount,
      [toWallet]: currentBalances[toWallet] + wholeAmount,
    };
    
    setOptimisticBalances(newBalances);
    setPendingTransactions(prev => [...prev, optimisticTx]);
    
    // Show immediate success feedback
    toast({
      title: 'Transfer Initiated',
      description: `₳${wholeAmount.toLocaleString()} moving to ${toWallet} wallet...`,
    });
    
    try {
      // Execute actual transfer via RPC
      const { data, error } = await supabase.rpc('transfer_with_lock', {
        p_user_id: user.id,
        p_from_type: fromWallet,
        p_to_type: toWallet,
        p_amount: wholeAmount,
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Transfer failed');
      }
      
      // Mark transaction as confirmed
      setPendingTransactions(prev => 
        prev.map(tx => tx.id === txId ? { ...tx, status: 'confirmed' as const } : tx)
      );
      
      // Invalidate cache to sync with Sovereign Ledger
      await queryClient.invalidateQueries({ queryKey: ['wallets', user.id] });
      
      // Clear optimistic state after successful sync
      setTimeout(() => {
        setOptimisticBalances(null);
        setPendingTransactions(prev => prev.filter(tx => tx.id !== txId));
      }, 1000);
      
      toast({
        title: 'Transfer Complete',
        description: `₳${wholeAmount.toLocaleString()} credited to ${toWallet} wallet`,
      });
      
      return true;
      
    } catch (error) {
      console.error('[OptimisticWallets] Transfer failed:', error);
      
      // ROLLBACK: Revert optimistic update
      setOptimisticBalances(currentBalances);
      setPendingTransactions(prev => 
        prev.map(tx => tx.id === txId ? { ...tx, status: 'failed' as const } : tx)
      );
      
      toast({
        variant: 'destructive',
        title: 'Transfer Failed',
        description: error instanceof Error ? error.message : 'Transaction could not be completed',
      });
      
      // Clean up failed transaction
      setTimeout(() => {
        setPendingTransactions(prev => prev.filter(tx => tx.id !== txId));
      }, 3000);
      
      return false;
    }
  }, [user?.id, optimisticBalances, getCachedBalances, queryClient, toast]);

  /**
   * Get the current display balance (optimistic or cached)
   * Enforces Whole Peso Mandate with Math.floor()
   */
  const getDisplayBalance = useCallback((walletType: WalletType): number => {
    if (optimisticBalances) {
      return Math.floor(optimisticBalances[walletType]);
    }
    return Math.floor(getCachedBalances()[walletType]);
  }, [optimisticBalances, getCachedBalances]);

  /**
   * Check if there are pending transactions
   */
  const hasPendingTransactions = pendingTransactions.some(tx => tx.status === 'pending');

  return {
    optimisticTransfer,
    getDisplayBalance,
    pendingTransactions,
    hasPendingTransactions,
    isOptimistic: optimisticBalances !== null,
  };
}
