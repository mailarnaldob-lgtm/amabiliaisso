import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  accountName: string;
  qrCodeUrl: string | null;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'gcash', name: 'GCash', number: '09171234567', accountName: 'Amabilia Network', qrCodeUrl: null },
  { id: 'bpi', name: 'BPI', number: '1234567890', accountName: 'Amabilia Network Inc.', qrCodeUrl: null },
  { id: 'bdo', name: 'BDO', number: '0987654321', accountName: 'Amabilia Network Inc.', qrCodeUrl: null },
];

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<PaymentMethod[]> => {
      // Use edge function to fetch payment methods securely
      // This allows authenticated users to get payment details without direct table access
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session for fetching payment methods');
        return DEFAULT_PAYMENT_METHODS;
      }

      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error fetching payment methods:', error);
        return DEFAULT_PAYMENT_METHODS;
      }

      if (data?.success && Array.isArray(data.data)) {
        return data.data as PaymentMethod[];
      }
      
      return DEFAULT_PAYMENT_METHODS;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Admin-only: Direct table access for updating payment methods
// Only admins have RLS access to modify system_settings
export function useUpdatePaymentMethods() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (methods: PaymentMethod[]) => {
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

export function useUploadQRCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, methodId }: { file: File; methodId: string }): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${methodId}/${Date.now()}.${fileExt}`;

      // Delete existing QR code for this method
      const { data: existingFiles } = await supabase.storage
        .from('qr-codes')
        .list(methodId);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('qr-codes')
          .remove(existingFiles.map(f => `${methodId}/${f.name}`));
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
