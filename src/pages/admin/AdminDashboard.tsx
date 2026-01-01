import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, TrendingUp, LogOut, LayoutDashboard, Clock, CheckCircle, FileCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    // Check for MySQL admin session
    const storedAdmin = localStorage.getItem('mysql_admin');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mysql_admin');
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
        return { totalMembers: 0, totalRevenue: 0, pendingPayments: 0 };
      }

      return {
        totalMembers: data?.stats?.totalUsers || 0,
        totalRevenue: data?.stats?.totalRevenue || 0,
        pendingPayments: data?.stats?.pendingProofs || 0,
      };
    },
  });

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/task-proofs', label: 'Task Proofs', icon: FileCheck },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          {admin && (
            <p className="text-sm text-muted-foreground mt-1">{admin.username}</p>
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
        <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₱{(stats?.totalRevenue || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Pending Task Proofs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pendingPayments || 0}</p>
              {(stats?.pendingPayments || 0) > 0 && (
                <Link to="/admin/task-proofs">
                  <Badge variant="destructive" className="mt-2">Needs Review</Badge>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
