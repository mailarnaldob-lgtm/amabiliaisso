import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaymentEditDialog } from '@/components/admin/PaymentEditDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, CheckCircle, XCircle, CreditCard, Clock, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Tables<'membership_payments'>;

export default function AdminPayments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

  const { data: stats } = useQuery({
    queryKey: ['admin-payment-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('membership_payments').select('status, amount');
      if (error) throw error;

      const pending = data.filter((p) => p.status === 'pending');
      const approved = data.filter((p) => p.status === 'approved');
      const rejected = data.filter((p) => p.status === 'rejected');

      return {
        total: data.length,
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        totalAmount: approved.reduce((sum, p) => sum + p.amount, 0),
      };
    },
  });

  const quickAction = useMutation({
    mutationFn: async ({ id, status, tier, userId }: { id: string; status: 'approved' | 'rejected'; tier: string; userId: string }) => {
      const { error: paymentError } = await supabase
        .from('membership_payments')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', id);
      if (paymentError) throw paymentError;

      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ membership_tier: tier as 'basic' | 'pro' | 'elite' })
          .eq('id', userId);
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Payment updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-stats'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('membership_payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Payment deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-stats'] });
      setDeleteDialogOpen(false);
      setSelectedPayment(null);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const filteredPayments = payments?.filter(
    (p) =>
      p.tier.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference_number && p.reference_number.includes(search))
  );

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditDialogOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  return (
    <AdminLayout
      title="Payment Reviews"
      actions={
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₱{(stats?.totalAmount || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.pending || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-green-500" /> Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.approved || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" /> Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.rejected || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading payments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="capitalize">{payment.tier}</TableCell>
                    <TableCell>₱{Number(payment.amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method}</TableCell>
                    <TableCell className="font-mono">{payment.reference_number || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'approved'
                            ? 'default'
                            : payment.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {payment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                quickAction.mutate({
                                  id: payment.id,
                                  status: 'approved',
                                  tier: payment.tier,
                                  userId: payment.user_id,
                                })
                              }
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                quickAction.mutate({
                                  id: payment.id,
                                  status: 'rejected',
                                  tier: payment.tier,
                                  userId: payment.user_id,
                                })
                              }
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(payment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(payment)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        payment={selectedPayment}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedPayment && deletePayment.mutate(selectedPayment.id)}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record? This action cannot be undone."
        isLoading={deletePayment.isPending}
      />
    </AdminLayout>
  );
}
