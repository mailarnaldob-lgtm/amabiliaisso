import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  FileCheck, 
  Shield,
  Eye,
  Settings,
  DollarSign,
  Activity,
  Zap,
  BarChart3,
  Coins,
  Target
} from 'lucide-react';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { EcosystemLiquidityPanel } from '@/components/admin/EcosystemLiquidityPanel';
import { GlobalCommandCenter } from '@/components/admin/GlobalCommandCenter';
import { useState } from 'react';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<'command' | 'liquidity'>('command');

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get member count
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get total credits from wallets
      const { data: wallets } = await supabase
        .from('wallets')
        .select('balance');
      const totalCredits = wallets?.reduce((sum, w) => sum + (Number(w.balance) || 0), 0) || 0;
      
      // Get pending reviews
      const { count: pendingPayments } = await supabase
        .from('membership_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      const { count: pendingTasks } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      return {
        totalMembers: memberCount || 0,
        totalCredits,
        pendingReviews: (pendingPayments || 0) + (pendingTasks || 0),
      };
    },
    refetchInterval: 15000,
  });

  return (
    <AdminPageWrapper 
      title="SOVEREIGN COMMAND CENTER" 
      description="Complete oversight and control of the Alpha ecosystem"
    >
      {({ adminInfo }) => (
        <div className="space-y-6">

          {/* System Status Alert */}
          <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle className="font-mono text-primary">SYSTEM ONLINE</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              All administrative operations are protected by Row Level Security policies. 15-second global sync active.
            </AlertDescription>
          </Alert>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" /> Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                  {stats?.totalMembers || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4 text-primary" /> Credits Allocated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                  ₳{(stats?.totalCredits || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" /> Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                  {stats?.pendingReviews || 0}
                </p>
                {(stats?.pendingReviews || 0) > 0 && (
                  <Badge className="mt-1 bg-destructive/20 text-destructive border border-destructive/30">
                    <Activity className="w-3 h-3 mr-1" />
                    Needs Review
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'command' | 'liquidity')}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="command" className="gap-2">
                <Target className="h-4 w-4" />
                Command Center
              </TabsTrigger>
              <TabsTrigger value="liquidity" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Liquidity Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="command" className="mt-6">
              <GlobalCommandCenter />
            </TabsContent>

            <TabsContent value="liquidity" className="mt-6">
              <EcosystemLiquidityPanel />
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-foreground">Quick Actions</CardTitle>
              <CardDescription>Administrative shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link to="/admin/task-proofs">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 h-11"
                >
                  <FileCheck className="h-4 w-4 text-primary" />
                  Review Submissions
                </Button>
              </Link>
              <Link to="/admin/members">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 h-11"
                >
                  <Users className="h-4 w-4 text-primary" />
                  Manage Members
                </Button>
              </Link>
              <Link to="/admin/payments">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 h-11"
                >
                  <CreditCard className="h-4 w-4 text-primary" />
                  Verify Payments
                </Button>
              </Link>
              <Link to="/admin/commissions">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 h-11"
                >
                  <DollarSign className="h-4 w-4 text-primary" />
                  View Commissions
                </Button>
              </Link>
              <Link to="/admin/god-eye">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 h-11"
                >
                  <Eye className="h-4 w-4 text-primary" />
                  God-Eye Panel
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 h-11"
                >
                  <Settings className="h-4 w-4 text-primary" />
                  System Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Capabilities Overview */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-foreground">Admin Capabilities</CardTitle>
              <CardDescription>Full system control</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Full CRUD on all entities</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Manage member accounts & tiers</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Approve/reject payments</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Review task proofs</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Commission management</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Ecosystem liquidity monitoring</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageWrapper>
  );
}
