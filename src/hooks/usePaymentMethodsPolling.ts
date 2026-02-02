/**
 * ALPHA EXCHANGER SOVEREIGN - Stability-First Payment Methods Hook
 * 
 * Uses standard REST polling (15-second intervals) for maximum reliability.
 * Implements fail-safe caching to show last-known-good data on errors.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  accountName: string;
  qrCodeUrl: string | null;
}

// Default fallback data for fail-safe rendering
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'gcash', name: 'GCash', number: '09XX-XXX-XXXX', accountName: 'Configure in Admin', qrCodeUrl: null },
  { id: 'bpi', name: 'BPI', number: 'XXXX-XXXX-XX', accountName: 'Configure in Admin', qrCodeUrl: null },
  { id: 'bdo', name: 'BDO', number: 'XXXX-XXXX-XX', accountName: 'Configure in Admin', qrCodeUrl: null },
];

// Local storage key for cached data
const CACHE_KEY = 'alpha_payment_methods_cache';
const CACHE_TIMESTAMP_KEY = 'alpha_payment_methods_timestamp';
const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface UsePaymentMethodsPollingResult {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  isError: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

/**
 * Load cached data from localStorage
 */
function loadFromCache(): PaymentMethod[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_MAX_AGE_MS) return null; // Cache expired
    
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Save data to localStorage cache
 */
function saveToCache(data: PaymentMethod[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Silent fail - cache is optional
  }
}

/**
 * Validate wallet address format (basic checks)
 */
export function validateWalletAddress(address: string, type: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const trimmed = address.trim();
  
  // Length check (minimum 8 characters for any account)
  if (trimmed.length < 8) return false;
  
  // Basic character validation (alphanumeric, dashes, spaces)
  const validPattern = /^[a-zA-Z0-9\s\-]+$/;
  if (!validPattern.test(trimmed)) return false;
  
  // Type-specific validation
  switch (type.toLowerCase()) {
    case 'gcash':
    case 'maya':
    case 'paymaya':
      // Philippine mobile number format: 09XX-XXX-XXXX or 09XXXXXXXXX
      const mobilePattern = /^(09|\+639)\d{9,10}$/;
      const cleanNumber = trimmed.replace(/[\s\-]/g, '');
      return mobilePattern.test(cleanNumber);
    
    case 'bpi':
    case 'bdo':
    case 'metrobank':
    case 'unionbank':
      // Bank account: 10-16 digits
      const bankPattern = /^\d{10,16}$/;
      const cleanBank = trimmed.replace(/[\s\-]/g, '');
      return bankPattern.test(cleanBank);
    
    default:
      // Generic: at least 8 characters
      return trimmed.length >= 8;
  }
}

/**
 * Standard REST polling hook for payment methods
 * - 15-second polling intervals
 * - Fail-safe caching
 * - No WebSockets
 */
export function usePaymentMethodsPolling(
  pollingInterval: number = 15000 // 15 seconds default
): UsePaymentMethodsPollingResult {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    // Initialize with cached data if available
    return loadFromCache() || DEFAULT_PAYMENT_METHODS;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const isMounted = useRef(true);
  const pollingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  /**
   * Fetch payment methods via standard REST call
   */
  const fetchPaymentMethods = useCallback(async (): Promise<void> => {
    // Cancel any pending request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session - use cached or default data
        if (!isMounted.current) return;
        setIsLoading(false);
        setIsStale(true);
        return;
      }

      // Standard fetch call to edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-payment-methods`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          signal: abortController.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!isMounted.current) return;

      if (result.success && Array.isArray(result.data)) {
        const methods = result.data as PaymentMethod[];
        setPaymentMethods(methods);
        saveToCache(methods);
        setIsError(false);
        setIsStale(false);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      if (!isMounted.current) return;
      
      // Check if it's an abort error (ignore these)
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('[ALPHA EXCHANGER] Fetch error:', error);
      setIsError(true);
      setIsStale(true);
      
      // Keep showing last known good data (fail-safe)
      const cached = loadFromCache();
      if (cached) {
        setPaymentMethods(cached);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Manual refetch trigger
   */
  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Initial fetch and polling setup
  useEffect(() => {
    isMounted.current = true;

    // Initial fetch
    fetchPaymentMethods();

    // Set up polling interval
    pollingTimer.current = setInterval(() => {
      if (isMounted.current) {
        fetchPaymentMethods();
      }
    }, pollingInterval);

    return () => {
      isMounted.current = false;
      
      // Cleanup polling
      if (pollingTimer.current) {
        clearInterval(pollingTimer.current);
        pollingTimer.current = null;
      }
      
      // Cleanup pending request
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
    };
  }, [fetchPaymentMethods, pollingInterval]);

  return {
    paymentMethods,
    isLoading,
    isError,
    lastUpdated,
    refetch,
    isStale,
  };
}

export default usePaymentMethodsPolling;
