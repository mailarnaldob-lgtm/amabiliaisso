import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  LogOut, 
  LayoutDashboard, 
  Clock, 
  FileCheck, 
  Shield,
  Eye,
  Settings,
  DollarSign,
  ArrowLeft,
  Info,
  Loader2
} from 'lucide-react';
import { initAdminSession, clearAdminSession, getAdminInfoSync } from '@/lib/adminSession';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/task-proofs', label: 'Activity Proofs', icon: FileCheck },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/admin/god-eye', label: 'God-Eye Panel', icon: Eye },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const isAdmin = await initAdminSession();
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      setAdminInfo(getAdminInfoSync());
      setIsInitialized(true);
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

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
    enabled: isInitialized,
  });

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Admin Panel</span>
          </Link>
          {adminInfo && (
            <p className="text-sm text-muted-foreground mt-2">{adminInfo.email}</p>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
          <Button variant="ghost" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-muted-foreground">Manage members, review submissions, and allocate credits</p>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {adminInfo?.role || 'Admin'}
          </Badge>
        </div>

        {/* Admin Login Instructions */}
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Secure Admin Access</AlertTitle>
          <AlertDescription className="text-sm">
            <p className="mb-2">Admin authentication uses Supabase Auth with role-based access control:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Login with your admin email at <code className="bg-muted px-1 rounded">/admin/login</code></li>
              <li>Your admin role is verified server-side via the <code className="bg-muted px-1 rounded">has_role()</code> function</li>
              <li>All admin operations are protected by Row Level Security policies</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Admin Notice */}
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/5">
          <Shield className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            All credit allocations require manual review and approval. This panel provides full administrative control over the platform.
          </AlertDescription>
        </Alert>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Credits Allocated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₳{(stats?.totalCredits || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">System credits distributed</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pendingReviews || 0}</p>
              {(stats?.pendingReviews || 0) > 0 && (
                <Link to="/admin/task-proofs">
                  <Badge variant="destructive" className="mt-2">Needs Review</Badge>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/admin/task-proofs">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileCheck className="h-4 w-4" />
                Review Activity Submissions
              </Button>
            </Link>
            <Link to="/admin/members">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Manage Members
              </Button>
            </Link>
            <Link to="/admin/payments">
              <Button variant="outline" className="w-full justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                Verify Registrations
              </Button>
            </Link>
            <Link to="/admin/commissions">
              <Button variant="outline" className="w-full justify-start gap-2">
                <DollarSign className="h-4 w-4" />
                View Commissions
              </Button>
            </Link>
            <Link to="/admin/god-eye">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" />
                God-Eye Panel
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                System Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Capabilities Overview */}
        <Card className="mt-6 border-border">
          <CardHeader>
            <CardTitle>Admin Capabilities</CardTitle>
            <CardDescription>Full system control</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Review, create, edit, delete any entity
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Manage all member accounts and tiers
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Approve/reject payment verifications
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                Review and approve task proofs
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Manage commission payouts
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Monitor system health and liquidity
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
