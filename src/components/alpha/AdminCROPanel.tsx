import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  Users, 
  ArrowLeftRight, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  FileImage,
  DollarSign,
  Upload,
  Ban,
  Clock,
  Activity,
  RefreshCw
} from 'lucide-react';
import { usePendingLoans, useActiveLoans, useDefaultedLoans, useLoanStats } from '@/hooks/useLoans';
import { formatAlpha } from '@/lib/utils';

export function AdminCROPanel() {
  const [activeTab, setActiveTab] = useState('matcher');
  const [emergencyFund, setEmergencyFund] = useState(false);

  // Fetch real data from database
  const { data: pendingLoans, isLoading: pendingLoading, refetch: refetchPending } = usePendingLoans();
  const { data: activeLoans, isLoading: activeLoading, refetch: refetchActive } = useActiveLoans();
  const { data: defaultedLoans, isLoading: defaultedLoading, refetch: refetchDefaulted } = useDefaultedLoans();
  const { data: loanStats, isLoading: statsLoading } = useLoanStats();

  const handleRefresh = () => {
    refetchPending();
    refetchActive();
    refetchDefaulted();
  };

  // Calculate metrics from real data
  const totalAlpha = loanStats?.totalPrincipal || 0;
  const activeCycles = loanStats?.activeLoans || 0;
  const rescueCases = loanStats?.defaultedLoans || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chief Risk Officer View</h1>
            <p className="text-sm text-muted-foreground">Manual control & system oversight</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard 
              label="Total Pending" 
              value={`${loanStats?.pendingLoans || 0}`} 
              status="neutral"
            />
            <MetricCard 
              label="₳ In Circulation" 
              value={`₳${formatAlpha(totalAlpha)}`} 
            />
            <MetricCard 
              label="Active Cycles" 
              value={activeCycles.toString()} 
            />
            <MetricCard 
              label="Total Repaid" 
              value={`${loanStats?.repaidLoans || 0}`} 
              status="good"
            />
            <MetricCard 
              label="Rescue Cases" 
              value={rescueCases.toString()} 
              status={rescueCases > 0 ? 'warning' : 'good'}
            />
          </>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matcher" className="gap-1">
            <ArrowLeftRight className="h-4 w-4" />
            Matcher
          </TabsTrigger>
          <TabsTrigger value="proofs" className="gap-1">
            <FileImage className="h-4 w-4" />
            Proofs
          </TabsTrigger>
          <TabsTrigger value="rescue" className="gap-1">
            <Zap className="h-4 w-4" />
            Rescue
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-1">
            <Shield className="h-4 w-4" />
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* Manual Matcher Tab */}
        <TabsContent value="matcher" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Lender Queue (Pending Offers) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  Lender Queue (Pending Offers)
                </CardTitle>
                <CardDescription>Available offers waiting for borrowers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : pendingLoans && pendingLoans.length > 0 ? (
                  pendingLoans.map((loan) => (
                    <div 
                      key={loan.id} 
                      className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 cursor-grab hover:shadow-md transition-shadow"
                      draggable
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Lender: {loan.lender_id.substring(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {loan.interest_rate}% interest • {loan.term_days} days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">₳{formatAlpha(loan.principal_amount)}</p>
                          <Badge variant="outline" className="text-[10px]">Available</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No pending offers</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Loans */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Active Loans
                </CardTitle>
                <CardDescription>Currently matched and running</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activeLoans && activeLoans.length > 0 ? (
                  activeLoans.map((loan) => {
                    const dueDate = loan.due_at ? new Date(loan.due_at) : null;
                    const isOverdue = dueDate && dueDate < new Date();
                    
                    return (
                      <div 
                        key={loan.id} 
                        className={`p-3 rounded-lg border ${isOverdue ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              Borrower: {loan.borrower_id?.substring(0, 8)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${isOverdue ? 'border-amber-500 text-amber-600' : ''}`}
                              >
                                {isOverdue ? 'Overdue' : 'Active'}
                              </Badge>
                              {dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {dueDate.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              ₳{formatAlpha(loan.total_repayment || loan.principal_amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Principal: ₳{formatAlpha(loan.principal_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No active loans</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Proof Reviewer Tab */}
        <TabsContent value="proofs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Payment Proof Queue
              </CardTitle>
              <CardDescription>Side-by-side verification of payment screenshots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Payment proof verification is handled in the Payments admin panel</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/admin/payments">Go to Payments Panel</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rescue Task Manager Tab */}
        <TabsContent value="rescue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Defaulted Loan Recovery
              </CardTitle>
              <CardDescription>Manage recovery for defaulted loans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {defaultedLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : defaultedLoans && defaultedLoans.length > 0 ? (
                defaultedLoans.map((loan) => {
                  const dueDate = loan.due_at ? new Date(loan.due_at) : null;
                  const daysOverdue = dueDate 
                    ? Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  
                  return (
                    <div key={loan.id} className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-amber-500/20">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">Borrower: {loan.borrower_id?.substring(0, 8)}...</p>
                            <p className="text-xs text-muted-foreground">
                              {daysOverdue} days overdue
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-destructive">
                            ₳{formatAlpha(loan.total_repayment || loan.principal_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">Outstanding</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Zap className="h-4 w-4 mr-1" />
                          Assign Recovery Task
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <Ban className="h-4 w-4 mr-1" />
                          Escalate
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-500 opacity-50" />
                  <p>No defaulted loans - all borrowers are in good standing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Controls Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Emergency Controls
              </CardTitle>
              <CardDescription>
                Critical system interventions requiring dual authorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emergency Fund Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div>
                  <p className="font-medium">Emergency Fund Payout</p>
                  <p className="text-sm text-muted-foreground">
                    Trigger system reserve distribution to lenders
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={emergencyFund ? 'border-destructive text-destructive' : ''}>
                    {emergencyFund ? 'ARMED' : 'Standby'}
                  </Badge>
                  <Switch 
                    checked={emergencyFund} 
                    onCheckedChange={setEmergencyFund}
                  />
                </div>
              </div>

              {/* Freeze Withdrawals */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Freeze All Withdrawals</p>
                  <p className="text-sm text-muted-foreground">
                    Halt all outgoing transactions immediately
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  Freeze Withdrawals
                </Button>
              </div>

              {/* System Shutdown */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                <div>
                  <p className="font-medium text-destructive">System Shutdown</p>
                  <p className="text-sm text-muted-foreground">
                    Complete platform halt - requires CEO + CRO approval
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  <Ban className="h-4 w-4 mr-2" />
                  Initiate Shutdown
                </Button>
              </div>

              {/* System Notice */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  System Notice
                </h4>
                <p className="text-sm text-muted-foreground">
                  Emergency controls require dual authorization from designated administrators.
                  All actions are logged and audited.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Data Notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground text-center">
            Connected to live database • Data updates in real-time • 4-eyes governance enforced in production
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  status = 'neutral' 
}: { 
  label: string; 
  value: string; 
  status?: 'good' | 'warning' | 'neutral';
}) {
  return (
    <Card className={
      status === 'good' ? 'border-emerald-500/30' :
      status === 'warning' ? 'border-amber-500/30' :
      ''
    }>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${
          status === 'good' ? 'text-emerald-600' :
          status === 'warning' ? 'text-amber-600' :
          'text-foreground'
        }`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
