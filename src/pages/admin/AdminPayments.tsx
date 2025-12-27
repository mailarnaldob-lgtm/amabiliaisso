import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, LogOut, LayoutDashboard, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminPayments() {
  const { signOut, user } = useAuth();
  const location = useLocation();
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

  const updatePayment = useMutation({
    mutationFn: async ({ id, status, tier, userId }: { id: string; status: 'approved' | 'rejected'; tier: string; userId: string }) => {
      const { error: paymentError } = await supabase
        .from('membership_payments')
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
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
      toast({ title: 'Payment Updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
  });

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card p-6">
        <div className="mb-8"><h1 className="text-xl font-bold text-primary">Admin Panel</h1></div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button variant={location.pathname === item.href ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <item.icon className="h-4 w-4" />{item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-border">
          <Link to="/dashboard"><Button variant="outline" className="w-full mb-2">Back to App</Button></Link>
          <Button variant="ghost" className="w-full gap-2" onClick={() => signOut()}><LogOut className="h-4 w-4" /> Logout</Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Payment Reviews</h2>
        <Card className="border-border">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell className="capitalize">{payment.tier}</TableCell>
                    <TableCell>₱{Number(payment.amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method}</TableCell>
                    <TableCell className="font-mono">{payment.reference_number || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'approved' ? 'default' : payment.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updatePayment.mutate({ id: payment.id, status: 'approved', tier: payment.tier, userId: payment.user_id })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updatePayment.mutate({ id: payment.id, status: 'rejected', tier: payment.tier, userId: payment.user_id })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
