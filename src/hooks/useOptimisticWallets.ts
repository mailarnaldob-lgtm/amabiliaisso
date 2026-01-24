import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type WalletType = 'main' | 'task' | 'royalty';

interface OptimisticTransaction {
  id: string;
  type: 'transfer' | 'lend' | 'repay';
  amount: number;
  fromWallet?: WalletType;
  toWallet?: WalletType;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
}

interface WalletBalances {
  main: number;
  task: number;
  royalty: number;
}

/**
 * Optimistic UI hook for zero-lag wallet interactions
 * Implements immediate visual feedback while Sovereign Ledger processes transactions
 */
export function useOptimisticWallets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Optimistic state layer
  const [pendingTransactions, setPendingTransactions] = useState<OptimisticTransaction[]>([]);
  const [optimisticBalances, setOptimisticBalances] = useState<WalletBalances | null>(null);
  
  // Debounce protection
  const lastTransactionRef = useRef<number>(0);
  const DEBOUNCE_MS = 500;

  /**
   * Get current cached balances from React Query
   */
  const getCachedBalances = useCallback((): WalletBalances => {
    const walletsData = queryClient.getQueryData<{ wallets: Array<{ wallet_type: WalletType; balance: number }> }>(['wallets', user?.id]);
    
    if (!walletsData?.wallets) {
      return { main: 0, task: 0, royalty: 0 };
    }
    
    return walletsData.wallets.reduce((acc, w) => {
      acc[w.wallet_type] = Number(w.balance) || 0;
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
      fromWallet,
      toWallet,
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
      
      // Mark transaction as success
      setPendingTransactions(prev => 
        prev.map(tx => tx.id === txId ? { ...tx, status: 'success' } : tx)
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
        prev.map(tx => tx.id === txId ? { ...tx, status: 'error' } : tx)
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
