import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';

export default function AdminPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Use server-side RPC for payment approval
  const approvePayment = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('approve_membership_payment', {
        p_payment_id: paymentId,
        p_admin_id: user.id
      });
      
      if (error) throw error;
      const result = data as { success?: boolean } | null;
      if (!result?.success) throw new Error('Failed to approve payment');
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Payment Approved', description: 'Membership has been upgraded.' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('reject_membership_payment', {
        p_payment_id: paymentId,
        p_admin_id: user.id,
        p_rejection_reason: reason || 'Payment could not be verified'
      });
      
      if (error) throw error;
      const result = data as { success?: boolean } | null;
      if (!result?.success) throw new Error('Failed to reject payment');
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Payment Rejected' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Get signed URL for payment proof
  const getProofUrl = async (proofPath: string) => {
    const { data } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(proofPath, 3600);
    return data?.signedUrl;
  };

  const handleViewProof = async (proofUrl: string | null) => {
    if (!proofUrl) {
      toast({ title: 'No proof uploaded', variant: 'destructive' });
      return;
    }
    
    const signedUrl = await getProofUrl(proofUrl);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      toast({ title: 'Could not load proof', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border border-destructive/30">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30">Pending</Badge>;
    }
  };

  return (
    <AdminPageWrapper 
      title="PAYMENT VERIFICATION" 
      description="Approve or reject membership payment verifications"
    >
      {() => (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-mono">
              <CreditCard className="h-5 w-5 text-primary" />
              All Payments
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
                {payments?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payments?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No payments found</p>
              </div>
            ) : (
              <div className="rounded-lg border border-primary/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="text-muted-foreground font-mono">Date</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Tier</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Amount</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Method</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Reference</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Proof</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Status</TableHead>
                      <TableHead className="text-muted-foreground font-mono">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.map((payment) => (
                      <TableRow 
                        key={payment.id}
                        className="border-primary/5 hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize border-primary/30 text-primary">
                            {payment.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-foreground">
                          ₱{Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {payment.payment_method}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {payment.reference_number || '-'}
                        </TableCell>
                        <TableCell>
                          {payment.proof_url ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => handleViewProof(payment.proof_url)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
                                onClick={() => approvePayment.mutate({ paymentId: payment.id })}
                                disabled={approvePayment.isPending}
                              >
                                {approvePayment.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                                onClick={() => rejectPayment.mutate({ paymentId: payment.id })}
                                disabled={rejectPayment.isPending}
                              >
                                {rejectPayment.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AdminPageWrapper>
  );
}
