import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Landmark, 
  RefreshCw, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Coins,
  Ban,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  useAdminLoansAll, 
  useAdminLoanStats, 
  useAdminProcessLoans,
  useAdminOverdueLoans
} from '@/hooks/useAdminLoans';
import { formatAlpha } from '@/lib/utils';

export default function AdminLoans() {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const { data: loans, isLoading, refetch } = useAdminLoansAll();
  const { data: stats } = useAdminLoanStats();
  const { data: overdueLoans } = useAdminOverdueLoans();
  const processLoans = useAdminProcessLoans();

  const filteredLoans = loans?.filter((loan) => {
    if (activeTab === 'all') return true;
    return loan.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'active':
        return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/30"><TrendingUp className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'repaid':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Repaid</Badge>;
      case 'defaulted':
        return <Badge className="bg-destructive/10 text-destructive border border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Defaulted</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-muted-foreground"><Ban className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminPageWrapper 
      title="LOAN MANAGEMENT CENTER" 
      description="Oversee P2P lending marketplace and process loans"
    >
      {() => (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono">{stats?.totalLoans || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pending Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-amber-500">{stats?.pendingOffers || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/10 bg-gradient-to-br from-card to-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-blue-500">{stats?.activeLoans || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/10 bg-gradient-to-br from-card to-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Repaid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-emerald-500">{stats?.repaidLoans || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/10 bg-gradient-to-br from-card to-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Defaulted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-destructive">{stats?.defaultedLoans || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Active Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono text-primary">₳{formatAlpha(stats?.activePrincipal || 0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Alert */}
          {overdueLoans && overdueLoans.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Loans Requiring Attention ({overdueLoans.length})
                </CardTitle>
                <CardDescription>These loans have passed their due date and require processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {overdueLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                      <div>
                        <p className="font-medium text-sm">{loan.borrower_name}</p>
                        <p className="text-xs text-muted-foreground">{loan.days_overdue} days overdue</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">₳{formatAlpha(loan.total_repayment || loan.principal_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => processLoans.mutate()} 
                  disabled={processLoans.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {processLoans.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Process All Overdue Loans
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loans Table */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 font-mono">
                  <Landmark className="h-5 w-5 text-primary" />
                  Loan Ledger
                </CardTitle>
                <CardDescription>Complete history of all P2P lending transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="border-primary/30"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  size="sm"
                  onClick={() => processLoans.mutate()}
                  disabled={processLoans.isPending}
                  className="bg-primary"
                >
                  {processLoans.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Coins className="h-4 w-4 mr-1" />
                  )}
                  Run Auto-Repayment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 bg-primary/5 border border-primary/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">All</TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-primary/20">Pending</TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-primary/20">Active</TabsTrigger>
                  <TabsTrigger value="repaid" className="data-[state=active]:bg-primary/20">Repaid</TabsTrigger>
                  <TabsTrigger value="defaulted" className="data-[state=active]:bg-primary/20">Defaulted</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !filteredLoans?.length ? (
                    <div className="text-center py-12">
                      <Landmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No {activeTab === 'all' ? '' : activeTab} loans found</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-primary/10 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary/5 hover:bg-primary/5">
                            <TableHead className="text-muted-foreground font-mono">ID</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Lender</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Borrower</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Principal</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Interest</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Term</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Status</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Due Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLoans.map((loan) => (
                            <TableRow key={loan.id} className="border-primary/5 hover:bg-primary/5">
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                #{loan.id.slice(0, 8)}
                              </TableCell>
                              <TableCell className="font-medium">{loan.lender_name}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {loan.borrower_name || '-'}
                              </TableCell>
                              <TableCell className="font-mono font-medium text-primary">
                                ₳{formatAlpha(loan.principal_amount)}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {loan.interest_rate}%
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {loan.term_days} days
                              </TableCell>
                              <TableCell>{getStatusBadge(loan.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {loan.due_at ? format(new Date(loan.due_at), 'MMM dd, yyyy') : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageWrapper>
  );
}
