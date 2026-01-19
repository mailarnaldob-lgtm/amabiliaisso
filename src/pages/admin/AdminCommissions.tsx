import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  FileCheck,
  Eye,
  Settings,
  DollarSign,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Wallet,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { initAdminSession, clearAdminSession, getAdminInfoSync } from '@/lib/adminSession';

interface CommissionWithProfile {
  id: string;
  referrer_id: string;
  referred_id: string;
  membership_tier: 'basic' | 'pro' | 'elite';
  membership_amount: number;
  commission_rate: number | null;
  commission_amount: number;
  is_paid: boolean | null;
  paid_at: string | null;
  created_at: string | null;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/task-proofs', label: 'Activity Proofs', icon: FileCheck },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/admin/god-eye', label: 'God-Eye Panel', icon: Eye },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminCommissions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CommissionWithProfile[];
    },
    enabled: isInitialized,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-commission-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('commission_amount, is_paid');
      if (error) throw error;
      
      const total = data.reduce((sum, c) => sum + c.commission_amount, 0);
      const paid = data.filter(c => c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0);
      const pending = data.filter(c => !c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0);
      
      return { total, paid, pending, count: data.length };
    },
    enabled: isInitialized,
  });

  const verifyCommission = useMutation({
    mutationFn: async (id: string) => {
      if (!adminInfo?.id) throw new Error('Admin session not found');
      const { data, error } = await supabase.rpc('verify_commission_credited', {
        p_commission_id: id,
        p_admin_id: adminInfo.id,
      });
      if (error) throw error;
      const result = data as { success: boolean; status?: string; error?: string; message?: string };
      if (!result.success) throw new Error(result.error || 'Verification failed');
      return result;
    },
    onSuccess: (result) => {
      toast({ title: 'Commission Verified', description: result.message });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commission-stats'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
    },
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Referral Commissions</h2>
          <p className="text-muted-foreground">View and manage referral commission payouts</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" /> Total Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₳{(stats?.total || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-500">₳{(stats?.paid || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-500">₳{(stats?.pending || 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Commission History
            </CardTitle>
            <CardDescription>All referral commission payouts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : commissions?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No commissions yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Membership Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions?.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.created_at
                          ? format(new Date(commission.created_at), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">{commission.membership_tier}</Badge>
                      </TableCell>
                      <TableCell>₳{commission.membership_amount.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-primary">
                        ₳{commission.commission_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={commission.is_paid ? 'default' : 'secondary'}>
                          {commission.is_paid ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!commission.is_paid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyCommission.mutate(commission.id)}
                            disabled={verifyCommission.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify Credit
                          </Button>
                        )}
                        {commission.is_paid && commission.paid_at && (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(commission.paid_at), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
