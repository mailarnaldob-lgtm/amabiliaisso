import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  Users, 
  ArrowLeftRight, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wallet,
  Zap,
  FileImage,
  DollarSign,
  Upload,
  Ban,
  RefreshCw,
  Clock,
  Activity
} from 'lucide-react';

// Mock data for demonstrations
const mockLenderQueue = [
  { id: '1', lender: 'Maria S.', amount: 5000, status: 'awaiting_match', since: '2 hours ago' },
  { id: '2', lender: 'Juan D.', amount: 2000, status: 'awaiting_match', since: '4 hours ago' },
];

const mockBorrowerQueue = [
  { id: '1', borrower: 'Ana R.', amount: 3000, creditScore: 85, status: 'verified', since: '1 hour ago' },
  { id: '2', borrower: 'Pedro G.', amount: 5000, creditScore: 72, status: 'verified', since: '3 hours ago' },
];

const mockProofQueue = [
  { 
    id: '1', 
    user: 'Rosa M.', 
    amount: 10000, 
    reference: 'GCash-12345678',
    screenshot: '/placeholder.svg',
    bankStatement: 'Matched',
    submittedAt: '30 min ago'
  },
  { 
    id: '2', 
    user: 'Carlos L.', 
    amount: 5000, 
    reference: 'Maya-87654321',
    screenshot: '/placeholder.svg',
    bankStatement: 'Pending',
    submittedAt: '1 hour ago'
  },
];

const mockRescueCases = [
  { id: '1', user: 'Pedro G.', debt: 5300, daysOverdue: 3, tasksAssigned: 2, tasksCompleted: 1 },
  { id: '2', user: 'Lisa T.', debt: 2060, daysOverdue: 1, tasksAssigned: 1, tasksCompleted: 0 },
];

const systemMetrics = {
  reserveRatio: 115,
  totalAlpha: 1250000,
  totalPHP: 1187500,
  activeCycles: 24,
  pendingWithdrawals: 45000,
  emergencyFundEnabled: false
};

export function AdminCROPanel() {
  const [activeTab, setActiveTab] = useState('matcher');
  const [emergencyFund, setEmergencyFund] = useState(false);

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
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard 
          label="Reserve Ratio" 
          value={`${systemMetrics.reserveRatio}%`} 
          status={systemMetrics.reserveRatio >= 100 ? 'good' : 'warning'}
        />
        <MetricCard 
          label="₳ Circulation" 
          value={`₳${(systemMetrics.totalAlpha / 1000).toFixed(0)}K`} 
        />
        <MetricCard 
          label="Active Cycles" 
          value={systemMetrics.activeCycles.toString()} 
        />
        <MetricCard 
          label="Pending W/D" 
          value={`₱${(systemMetrics.pendingWithdrawals / 1000).toFixed(0)}K`} 
          status="neutral"
        />
        <MetricCard 
          label="Rescue Cases" 
          value={mockRescueCases.length.toString()} 
          status={mockRescueCases.length > 0 ? 'warning' : 'good'}
        />
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
            {/* Lender Queue */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  Lender Queue
                </CardTitle>
                <CardDescription>Drag to match with borrowers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockLenderQueue.map((lender) => (
                  <div 
                    key={lender.id} 
                    className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 cursor-grab hover:shadow-md transition-shadow"
                    draggable
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lender.lender}</p>
                        <p className="text-xs text-muted-foreground">Since {lender.since}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">₳{lender.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-[10px]">Available</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Borrower Queue */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Borrower Queue
                </CardTitle>
                <CardDescription>Drop lender here to create match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockBorrowerQueue.map((borrower) => (
                  <div 
                    key={borrower.id} 
                    className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{borrower.borrower}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            Score: {borrower.creditScore}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{borrower.since}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">₳{borrower.amount.toLocaleString()}</p>
                        <Button size="sm" variant="outline" className="h-6 text-xs mt-1" disabled>
                          Match
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                Exchanger Proof Queue
              </CardTitle>
              <CardDescription>Side-by-side verification of user screenshots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockProofQueue.map((proof) => (
                <div key={proof.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{proof.user}</p>
                      <p className="text-sm text-muted-foreground">
                        Ref: {proof.reference} • {proof.submittedAt}
                      </p>
                    </div>
                    <p className="font-bold">₱{proof.amount.toLocaleString()}</p>
                  </div>
                  
                  {/* Side by side preview areas */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-1" />
                        <p className="text-xs">User Screenshot</p>
                      </div>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Shield className="h-8 w-8 mx-auto mb-1" />
                        <p className="text-xs">Bank Statement</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {proof.bankStatement}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" className="text-destructive">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rescue Task Manager Tab */}
        <TabsContent value="rescue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Rescue Task Manager
              </CardTitle>
              <CardDescription>Assign and manage debtor recovery tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRescueCases.map((case_) => (
                <div key={case_.id} className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{case_.user}</p>
                        <p className="text-xs text-muted-foreground">
                          {case_.daysOverdue} days overdue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">₳{case_.debt.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Tasks: {case_.tasksCompleted}/{case_.tasksAssigned}
                      </span>
                      <Progress 
                        value={(case_.tasksCompleted / case_.tasksAssigned) * 100} 
                        className="w-20 h-2" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Zap className="h-4 w-4 mr-1" />
                        Assign Task
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Ban className="h-4 w-4 mr-1" />
                        Escalate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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

              {/* Audit Log */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Admin Actions
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    { action: 'Proof Approved', admin: 'Admin_A', time: '5 min ago' },
                    { action: 'Rescue Task Assigned', admin: 'Admin_B', time: '15 min ago' },
                    { action: 'Lender Matched', admin: 'Admin_A', time: '1 hour ago' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-muted-foreground">
                      <span>{log.action} by {log.admin}</span>
                      <span className="text-xs">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground text-center">
            UI MOCKUP • Admin actions are demonstration only • 4-eyes governance enforced in production
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
        <p className={`text-xl font-bold ${
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
