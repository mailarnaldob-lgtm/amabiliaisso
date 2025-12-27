import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Wallet, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CommissionWithProfile {
  id: string;
  referrer_id: string;
  referred_id: string;
  membership_tier: 'basic' | 'pro' | 'elite';
  membership_amount: number;
  commission_rate: number | null;
  commission_amount: number;
  is_paid: boolean | null;
  paid_at: string | null;
  created_at: string | null;
}

export default function AdminCommissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CommissionWithProfile[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-commission-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('commission_amount, is_paid');
      if (error) throw error;
      
      const total = data.reduce((sum, c) => sum + c.commission_amount, 0);
      const paid = data.filter(c => c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0);
      const pending = data.filter(c => !c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0);
      
      return { total, paid, pending, count: data.length };
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('referral_commissions')
        .update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Commission marked as paid' });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commission-stats'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Referral Commissions</h2>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" /> Total Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₱{(stats?.total || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" /> Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₱{(stats?.paid || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₱{(stats?.pending || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table */}
        <Card className="border-border">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Membership Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions?.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.created_at
                          ? format(new Date(commission.created_at), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">{commission.membership_tier}</Badge>
                      </TableCell>
                      <TableCell>₱{commission.membership_amount.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-primary">
                        ₱{commission.commission_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={commission.is_paid ? 'default' : 'secondary'}>
                          {commission.is_paid ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!commission.is_paid && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid.mutate(commission.id)}
                            disabled={markAsPaid.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                        {commission.is_paid && commission.paid_at && (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(commission.paid_at), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
