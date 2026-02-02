/**
 * ALPHA EXCHANGER SOVEREIGN - Payment Methods Hook
 * 
 * This file provides backwards-compatible exports while using the new
 * stability-first polling architecture.
 * 
 * For new code, prefer using usePaymentMethodsPolling directly from
 * '@/hooks/usePaymentMethodsPolling'
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

// Re-export the new polling hook and types
export { 
  usePaymentMethodsPolling, 
  validateWalletAddress,
  type PaymentMethod 
} from './usePaymentMethodsPolling';

// Legacy type export for backwards compatibility
export interface LegacyPaymentMethod {
  id: string;
  name: string;
  number: string;
  accountName: string;
  qrCodeUrl: string | null;
}

const DEFAULT_PAYMENT_METHODS: LegacyPaymentMethod[] = [
  { id: 'gcash', name: 'GCash', number: '09171234567', accountName: 'Amabilia Network', qrCodeUrl: null },
  { id: 'bpi', name: 'BPI', number: '1234567890', accountName: 'Amabilia Network Inc.', qrCodeUrl: null },
  { id: 'bdo', name: 'BDO', number: '0987654321', accountName: 'Amabilia Network Inc.', qrCodeUrl: null },
];

/**
 * Legacy usePaymentMethods hook using React Query
 * @deprecated Use usePaymentMethodsPolling for stability-first polling
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<LegacyPaymentMethod[]> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.warn('[usePaymentMethods] No session, returning defaults');
          return DEFAULT_PAYMENT_METHODS;
        }

        // Standard fetch call for stability
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-payment-methods`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          return result.data as LegacyPaymentMethod[];
        }
        
        return DEFAULT_PAYMENT_METHODS;
      } catch (error) {
        console.error('[usePaymentMethods] Error:', error);
        return DEFAULT_PAYMENT_METHODS;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Admin-only: Direct table access for updating payment methods
 * Only admins have RLS access to modify system_settings
 */
export function useUpdatePaymentMethods() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (methods: LegacyPaymentMethod[]) => {
      // Cast to Json type for Supabase
      const jsonValue = methods as unknown as Json;
      
      const { error } = await supabase
        .from('system_settings')
        .update({ value: jsonValue })
        .eq('key', 'payment_methods');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({
        title: 'Payment Methods Updated',
        description: 'Changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    },
  });
}

/**
 * Admin-only: Upload QR code to storage
 */
export function useUploadQRCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, methodId }: { file: File; methodId: string }): Promise<string> => {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG and PNG files are allowed');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${methodId}/${Date.now()}.${fileExt}`;

      // Delete existing QR code for this method
      try {
        const { data: existingFiles } = await supabase.storage
          .from('qr-codes')
          .list(methodId);

        if (existingFiles && existingFiles.length > 0) {
          await supabase.storage
            .from('qr-codes')
            .remove(existingFiles.map(f => `${methodId}/${f.name}`));
        }
      } catch {
        // Silent fail - old file cleanup is optional
      }

      // Upload new QR code
      const { error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
    },
  });
}
