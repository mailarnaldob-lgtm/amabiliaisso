import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DollarSign,
  TrendingUp,
  CheckCircle,
  Wallet,
  Loader2,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';

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

  const verifyCommission = useMutation({
    mutationFn: async ({ id, adminId }: { id: string; adminId: string }) => {
      const { data, error } = await supabase.rpc('verify_commission_credited', {
        p_commission_id: id,
        p_admin_id: adminId,
      });
      if (error) throw error;
      const result = data as { success: boolean; status?: string; error?: string; message?: string };
      if (!result.success) throw new Error(result.error || 'Verification failed');
      return result;
    },
    onSuccess: (result) => {
      toast({ title: 'Commission Verified', description: result.message });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commission-stats'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    },
  });

  return (
    <AdminPageWrapper 
      title="COMMISSION LEDGER" 
      description="View and manage referral commission payouts"
    >
      {({ adminInfo }) => (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4 text-primary" /> Total Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-foreground">
                  ₳{(stats?.total || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/10 bg-gradient-to-br from-card to-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Paid Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-emerald-500">
                  ₳{(stats?.paid || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-amber-500/5 hover:border-amber-500/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-amber-500" /> Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-amber-500">
                  ₳{(stats?.pending || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4 text-primary" /> Total Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-foreground">{stats?.count || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Commissions Table */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-mono">
                <DollarSign className="h-5 w-5 text-primary" />
                Commission History
              </CardTitle>
              <CardDescription>All referral commission payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : commissions?.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No commissions yet</p>
                </div>
              ) : (
                <div className="rounded-lg border border-primary/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5 hover:bg-primary/5">
                        <TableHead className="text-muted-foreground font-mono">Date</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Tier</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Membership Amount</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Commission</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Status</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions?.map((commission) => (
                        <TableRow 
                          key={commission.id}
                          className="border-primary/5 hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="text-muted-foreground text-sm">
                            {commission.created_at
                              ? format(new Date(commission.created_at), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize border-primary/30 text-primary">
                              {commission.membership_tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-foreground">
                            ₳{commission.membership_amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono font-medium text-primary">
                            ₳{commission.commission_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {commission.is_paid ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                                Paid
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!commission.is_paid && adminInfo && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/30 text-primary hover:bg-primary/10"
                                onClick={() => verifyCommission.mutate({ id: commission.id, adminId: adminInfo.id })}
                                disabled={verifyCommission.isPending}
                              >
                                {verifyCommission.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verify Credit
                                  </>
                                )}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageWrapper>
  );
}
