import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Image, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Tables<'membership_payments'>;

interface PaymentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export function PaymentEditDialog({ open, onOpenChange, payment }: PaymentEditDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    rejection_reason: '',
    reference_number: '',
  });
  
  const [signedProofUrl, setSignedProofUrl] = useState<string | null>(null);
  const [isLoadingProof, setIsLoadingProof] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        status: payment.status || 'pending',
        rejection_reason: payment.rejection_reason || '',
        reference_number: payment.reference_number || '',
      });
      
      // Generate signed URL for payment proof if it exists
      if (payment.proof_url) {
        setIsLoadingProof(true);
        // Check if it's already a full URL (legacy) or a path (new format)
        if (payment.proof_url.startsWith('http')) {
          // Legacy public URL - use as is
          setSignedProofUrl(payment.proof_url);
          setIsLoadingProof(false);
        } else {
          // New format - generate signed URL
          supabase.storage
            .from('payment-proofs')
            .createSignedUrl(payment.proof_url, 3600) // 1 hour expiry
            .then(({ data, error }) => {
              if (error) {
                console.error('Error generating signed URL:', error);
                setSignedProofUrl(null);
              } else {
                setSignedProofUrl(data?.signedUrl || null);
              }
              setIsLoadingProof(false);
            });
        }
      } else {
        setSignedProofUrl(null);
      }
    }
  }, [payment]);

  const updatePayment = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!payment || !user) throw new Error('No payment selected');

      // Use server-side RPC for status changes that modify profile
      if (data.status === 'approved' && payment.status !== 'approved') {
        const { error } = await supabase.rpc('approve_membership_payment', {
          p_payment_id: payment.id,
          p_admin_id: user.id,
        });
        if (error) throw error;
      } else if (data.status === 'rejected' && payment.status !== 'rejected') {
        const { error } = await supabase.rpc('reject_membership_payment', {
          p_payment_id: payment.id,
          p_admin_id: user.id,
          p_rejection_reason: data.rejection_reason || 'Payment could not be verified',
        });
        if (error) throw error;
      } else {
        // For non-status changes (just updating reference number)
        const { error: paymentError } = await supabase
          .from('membership_payments')
          .update({
            reference_number: data.reference_number || null,
          })
          .eq('id', payment.id);
        if (paymentError) throw paymentError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Payment updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === 'rejected' && !formData.rejection_reason) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a rejection reason' });
      return;
    }
    updatePayment.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-muted p-4 space-y-1 text-sm">
            <p><strong>Tier:</strong> {payment?.tier}</p>
            <p><strong>Amount:</strong> ₱{payment?.amount?.toLocaleString()}</p>
            <p><strong>Method:</strong> {payment?.payment_method}</p>
            {payment?.proof_url && (
              <div className="pt-2">
                {isLoadingProof ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading proof...
                  </div>
                ) : signedProofUrl ? (
                  <a
                    href={signedProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Image className="h-4 w-4" />
                    View Payment Proof
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">Unable to load proof</span>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'approved' | 'rejected') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.status === 'rejected' && (
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason</Label>
              <Textarea
                id="rejection_reason"
                value={formData.rejection_reason}
                onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                rows={3}
                placeholder="Explain why this payment was rejected..."
                required
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePayment.isPending}>
              {updatePayment.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
