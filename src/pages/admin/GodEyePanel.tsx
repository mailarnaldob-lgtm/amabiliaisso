import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wallet, 
  TrendingUp, 
  Users,
  Clock,
  RefreshCw,
  Zap,
  FileCheck,
  Ban
} from 'lucide-react';

// Mock data for KYC queue
const mockKYCQueue = [
  { id: '1', name: 'Maria Santos', email: 'maria@example.com', tier: 'elite', submittedAt: '2024-01-15', docs: ['ID', 'Selfie', 'Proof of Address'] },
  { id: '2', name: 'Juan Dela Cruz', email: 'juan@example.com', tier: 'elite', submittedAt: '2024-01-14', docs: ['ID', 'Selfie'] },
  { id: '3', name: 'Ana Reyes', email: 'ana@example.com', tier: 'elite', submittedAt: '2024-01-13', docs: ['ID', 'Selfie', 'Proof of Address'] },
];

// Mock rescue tasks (borrowers in debt)
const mockRescueTasks = [
  { id: '1', borrower: 'Pedro Gomez', debt: 5300, daysOverdue: 3, assignedTasks: 2, completedTasks: 1 },
  { id: '2', borrower: 'Rosa Martinez', debt: 2060, daysOverdue: 1, assignedTasks: 1, completedTasks: 0 },
];

// Mock liquidity data
const liquidityData = {
  totalAMB: 1250000,
  totalPHP: 1187500,
  coverageRatio: 95,
  pendingWithdrawals: 45000,
  pendingDeposits: 78000,
};

export default function GodEyePanel() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">God-Eye Panel</h1>
              <p className="text-sm text-muted-foreground">Complete system oversight & control</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Sync Data
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4" /> KYC Pending
              </div>
              <p className="text-2xl font-bold mt-1">{mockKYCQueue.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" /> Rescue Cases
              </div>
              <p className="text-2xl font-bold mt-1">{mockRescueTasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet className="h-4 w-4" /> ₳ Supply
              </div>
              <p className="text-2xl font-bold mt-1">₳{liquidityData.totalAMB.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4" /> Coverage
              </div>
              <p className="text-2xl font-bold mt-1">{liquidityData.coverageRatio}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kyc">KYC Queue</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="rescue">Rescue Tasks</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-success text-success-foreground">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Gateway</span>
                    <Badge className="bg-success text-success-foreground">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Forex Oracle</span>
                    <Badge className="bg-success text-success-foreground">Synced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task Engine</span>
                    <Badge className="bg-success text-success-foreground">Running</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: 'New Elite Member', user: 'Maria S.', time: '2 min ago', type: 'success' },
                    { action: 'Loan Repaid', user: 'Juan D.', time: '15 min ago', type: 'success' },
                    { action: 'KYC Submitted', user: 'Ana R.', time: '1 hour ago', type: 'info' },
                    { action: 'Withdrawal Processed', user: 'Pedro G.', time: '2 hours ago', type: 'success' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-success' : 'bg-primary'}`} />
                        <span>{item.action}</span>
                        <span className="text-muted-foreground">- {item.user}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{item.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* KYC Queue Tab */}
          <TabsContent value="kyc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" /> KYC Verification Queue
                </CardTitle>
                <CardDescription>Review and approve Elite member verification requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockKYCQueue.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <Badge variant="outline">{user.tier.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-1 mt-2">
                          {user.docs.map((doc) => (
                            <Badge key={doc} variant="secondary" className="text-xs">{doc}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-4">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {user.submittedAt}
                        </span>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liquidity Tab */}
          <TabsContent value="liquidity" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" /> Liquidity Monitor
                  </CardTitle>
                  <CardDescription>₳ vs PHP Reserve Status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total ₳ in Circulation</span>
                      <span className="font-mono font-bold">₳{liquidityData.totalAMB.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PHP Reserves</span>
                      <span className="font-mono font-bold">₱{liquidityData.totalPHP.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coverage Ratio</span>
                      <span className={liquidityData.coverageRatio >= 90 ? 'text-success' : 'text-warning'}>
                        {liquidityData.coverageRatio}%
                      </span>
                    </div>
                    <Progress value={liquidityData.coverageRatio} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="text-xs text-muted-foreground">Pending Deposits</p>
                      <p className="font-bold text-success">+₱{liquidityData.pendingDeposits.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-destructive/10">
                      <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
                      <p className="font-bold text-destructive">-₱{liquidityData.pendingWithdrawals.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forex Oracle Status</CardTitle>
                  <CardDescription>Real-time PHP/USD peg tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Rate</span>
                      <Badge className="bg-success text-success-foreground">Live</Badge>
                    </div>
                    <p className="text-2xl font-mono font-bold">1 ₳ = ₱1.00</p>
                    <p className="text-xs text-muted-foreground mt-1">Last sync: 30 seconds ago</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Peg Status</span>
                    <Badge className="bg-success text-success-foreground">Stable</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Deviation</span>
                    <span className="text-success">0.00%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rescue Tasks Tab */}
          <TabsContent value="rescue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" /> Rescue Task System
                </CardTitle>
                <CardDescription>Manage borrowers in default - assign high-effort recovery tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {mockRescueTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                    <p>No active rescue cases</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockRescueTasks.map((task) => (
                      <div key={task.id} className="p-4 rounded-lg border border-warning/50 bg-warning/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-warning/20">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">{task.borrower}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.daysOverdue} days overdue
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-destructive">₳{task.debt.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Outstanding debt</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              Tasks: {task.completedTasks}/{task.assignedTasks} completed
                            </span>
                            <Progress value={(task.completedTasks / task.assignedTasks) * 100} className="w-24 h-2" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Zap className="h-4 w-4 mr-1" /> Assign Task
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Ban className="h-4 w-4 mr-1" /> Escalate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
