import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, TrendingUp, LogOut, LayoutDashboard, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const location = useLocation();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profilesRes, paymentsRes, pendingRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('membership_payments').select('amount').eq('status', 'approved'),
        supabase.from('membership_payments').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalMembers: profilesRes.count || 0,
        totalRevenue,
        pendingPayments: pendingRes.count || 0,
      };
    },
  });

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
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
          <Link to="/dashboard">
            <Button variant="outline" className="w-full mb-2">Back to App</Button>
          </Link>
          <Button variant="ghost" className="w-full gap-2" onClick={() => signOut()}>
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
                <Clock className="h-4 w-4 text-primary" /> Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pendingPayments || 0}</p>
              {(stats?.pendingPayments || 0) > 0 && (
                <Link to="/admin/payments">
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
