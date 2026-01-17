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

  useEffect(() => {
    if (payment) {
      setFormData({
        status: payment.status || 'pending',
        rejection_reason: payment.rejection_reason || '',
        reference_number: payment.reference_number || '',
      });
    }
  }, [payment]);

  const updatePayment = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!payment) throw new Error('No payment selected');

      const { error: paymentError } = await supabase
        .from('membership_payments')
        .update({
          status: data.status,
          rejection_reason: data.status === 'rejected' ? data.rejection_reason : null,
          reference_number: data.reference_number || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', payment.id);
      if (paymentError) throw paymentError;

      // Update profile tier if approved
      if (data.status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            membership_tier: payment.tier,
            membership_amount: payment.amount,
          })
          .eq('id', payment.user_id);
        if (profileError) throw profileError;
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
