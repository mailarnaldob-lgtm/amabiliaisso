import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, CreditCard, TrendingUp, LogOut, LayoutDashboard, Clock, FileCheck, Shield } from 'lucide-react';
import { getAdminInfo, clearAdminSession, isAdminSessionValid } from '@/lib/adminSession';
import { useEffect } from 'react';

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
    navigate('/admin/login');
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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/task-proofs', label: 'Activity Proofs', icon: FileCheck },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Verifications', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          {adminInfo && (
            <p className="text-sm text-muted-foreground mt-1">{adminInfo.username}</p>
          )}
        </div>
        <nav className="space-y-2">
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
        <div className="mt-8 pt-8 border-t border-border">
          <Button variant="ghost" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground mb-6">Manage members, review submissions, and allocate credits</p>

        {/* Admin Notice */}
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
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
          <CardContent className="grid md:grid-cols-2 gap-4">
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
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <TrendingUp className="h-4 w-4" />
              Allocate Credits (Manual)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
