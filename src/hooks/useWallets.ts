 import { useQuery, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 import { useCallback, useMemo, useRef } from 'react';
 
 export interface Wallet {
   id: string;
   user_id: string;
   wallet_type: 'task' | 'royalty' | 'main';
   balance: number;
   created_at: string | null;
   updated_at: string | null;
 }
 
 interface WalletsResult {
   wallets: Wallet[];
   isFallback: boolean;
 }
 
 const WALLET_CACHE_KEY = 'alpha_wallets_cache';
 const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes max age for cached data
 
 // Fail-safe cache functions
 function getCachedWallets(userId: string): Wallet[] | null {
   try {
     const cached = localStorage.getItem(`${WALLET_CACHE_KEY}_${userId}`);
     if (cached) {
       const parsed = JSON.parse(cached);
       if (Date.now() - parsed.timestamp < CACHE_MAX_AGE_MS) {
         return parsed.wallets;
       }
     }
   } catch {
     // Silently fail - cache is optional
   }
   return null;
 }
 
 function setCachedWallets(userId: string, wallets: Wallet[]): void {
   try {
     localStorage.setItem(`${WALLET_CACHE_KEY}_${userId}`, JSON.stringify({
       wallets,
       timestamp: Date.now()
     }));
   } catch {
     // Silently fail - cache is optional
   }
 }
 
 // Create default wallets with zero balances
 function createDefaultWallets(userId: string): WalletsResult {
   return {
     wallets: [
       { id: `task-${userId}`, user_id: userId, wallet_type: 'task', balance: 0, created_at: null, updated_at: null },
       { id: `royalty-${userId}`, user_id: userId, wallet_type: 'royalty', balance: 0, created_at: null, updated_at: null },
       { id: `main-${userId}`, user_id: userId, wallet_type: 'main', balance: 0, created_at: null, updated_at: null },
     ],
     isFallback: true,
   };
 }
 
 /**
  * Sovereign Wallet Hook - V9.5 (Stability-First)
  * 
  * ARCHITECTURE MANDATE: Zero WebSocket dependency
  * - 15-second RESTful polling via React Query refetchInterval
  * - AbortController pattern for signal-aware fetching
  * - Fail-safe caching with localStorage fallback
  * - No Supabase Realtime subscriptions (per Sovereign System Recovery mandate)
  */
 export function useWallets() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   
   // AbortController ref for signal-aware fetching
   const abortControllerRef = useRef<AbortController | null>(null);
   
   // Debounce protection for rapid requests
   const lastFetchRef = useRef<number>(0);
   const FETCH_DEBOUNCE_MS = 300;
 
   const query = useQuery({
     queryKey: ['wallets', user?.id],
     queryFn: async ({ signal }): Promise<WalletsResult> => {
       if (!user) return { wallets: [], isFallback: false };
       
       // Debounce check to prevent rapid-fire requests
       const now = Date.now();
       if (now - lastFetchRef.current < FETCH_DEBOUNCE_MS) {
         const cached = queryClient.getQueryData<WalletsResult>(['wallets', user.id]);
         if (cached) return cached;
       }
       lastFetchRef.current = now;
       
       try {
         // Cancel any previous pending request
         if (abortControllerRef.current) {
           abortControllerRef.current.abort();
         }
         abortControllerRef.current = new AbortController();
         
         // Fetch wallets directly from Supabase with abort signal awareness
         const { data: walletsData, error } = await supabase
           .from('wallets')
           .select('*')
           .eq('user_id', user.id)
           .abortSignal(signal);
 
         if (error) {
           // Handle abort gracefully without error logging
           if (error.message?.includes('abort') || signal?.aborted) {
             const cached = queryClient.getQueryData<WalletsResult>(['wallets', user.id]);
             return cached || createDefaultWallets(user.id);
           }
           
           // Try localStorage fail-safe cache
           const cachedWallets = getCachedWallets(user.id);
           if (cachedWallets) {
             return { wallets: cachedWallets, isFallback: true };
           }
           
           return createDefaultWallets(user.id);
         }
 
         if (!walletsData || walletsData.length === 0) {
           return createDefaultWallets(user.id);
         }
 
         // Map wallet data with proper type handling (Whole Peso Mandate: Math.floor)
         const wallets: Wallet[] = walletsData.map((w) => ({
           id: w.id,
           user_id: w.user_id,
           wallet_type: w.wallet_type,
           balance: Math.floor(Number(w.balance) || 0),
           created_at: w.created_at || null,
           updated_at: w.updated_at || null,
         }));
 
         // Cache successful fetch for fail-safe
         setCachedWallets(user.id, wallets);
         
         return { wallets, isFallback: false };
 
       } catch (error) {
         // Handle AbortError gracefully - this is expected during cleanup
         if (error instanceof Error && error.name === 'AbortError') {
           const cached = queryClient.getQueryData<WalletsResult>(['wallets', user.id]);
           return cached || createDefaultWallets(user.id);
         }
         
         // Try localStorage fail-safe cache
         const cachedWallets = getCachedWallets(user.id);
         if (cachedWallets) {
           return { wallets: cachedWallets, isFallback: true };
         }
         
         return createDefaultWallets(user.id);
       }
     },
     enabled: !!user,
     retry: 2,
     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
     staleTime: 10000,
     gcTime: 60000,
     // SOVEREIGN V9.5: 15-second RESTful polling (replaces WebSocket Realtime)
     refetchInterval: 15000,
     refetchIntervalInBackground: false,
   });
 
   // Memoized helper to get balance by wallet type
   const getBalance = useCallback((type: 'task' | 'royalty' | 'main'): number => {
     const wallet = query.data?.wallets.find(w => w.wallet_type === type);
     return wallet?.balance || 0;
   }, [query.data?.wallets]);
 
   // Memoized total balance
   const totalBalance = useMemo(() => {
     return query.data?.wallets.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
   }, [query.data?.wallets]);
 
   return {
     ...query,
     wallets: query.data?.wallets || [],
     isFallback: query.data?.isFallback || false,
     getBalance,
     totalBalance,
   };
 }
