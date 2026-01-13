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
  Info
} from 'lucide-react';
import { getAdminInfo, clearAdminSession, isAdminSessionValid } from '@/lib/adminSession';
import { useEffect } from 'react';

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
  const adminInfo = getAdminInfo();

  useEffect(() => {
    // Redirect if no valid admin session
    if (!isAdminSessionValid()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

  const { data: stats } = useQuery({
    queryKey: ['admin-stats-mysql'],
    queryFn: async () => {
      // Fetch stats via edge function
      const { data, error } = await supabase.functions.invoke('mysql-task-proofs', {
        body: { action: 'stats' }
      });

      if (error) {
        console.error('Failed to fetch stats:', error);
        return { totalMembers: 0, totalCredits: 0, pendingReviews: 0 };
      }

      return {
        totalMembers: data?.stats?.totalUsers || 0,
        totalCredits: data?.stats?.totalRevenue || 0,
        pendingReviews: data?.stats?.pendingProofs || 0,
      };
    },
    enabled: isAdminSessionValid(),
  });

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
            <p className="text-sm text-muted-foreground mt-2">{adminInfo.username}</p>
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
          <AlertTitle>Admin Access</AlertTitle>
          <AlertDescription className="text-sm">
            <p className="mb-2">To login as admin:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Navigate to <code className="bg-muted px-1 rounded">/admin/login</code></li>
              <li>Enter your admin credentials (configured in MySQL admins table)</li>
              <li>Session is stored securely in memory (not localStorage)</li>
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