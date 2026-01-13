import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle, 
  XCircle, 
  Shield, 
  FileCheck,
  Eye,
  Settings,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { getAdminInfo, clearAdminSession, isAdminSessionValid } from '@/lib/adminSession';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/task-proofs', label: 'Activity Proofs', icon: FileCheck },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/admin/god-eye', label: 'God-Eye Panel', icon: Eye },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminPayments() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdminSessionValid()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdminSessionValid(),
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, status, tier, userId }: { id: string; status: 'approved' | 'rejected'; tier: string; userId: string }) => {
      const { error: paymentError } = await supabase
        .from('membership_payments')
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq('id', id);
      if (paymentError) throw paymentError;

      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ membership_tier: tier as 'basic' | 'pro' | 'elite' })
          .eq('id', userId);
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Payment Updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Payment Reviews</h2>
          <p className="text-muted-foreground">Approve or reject membership payment verifications</p>
        </div>
        
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              All Payments ({payments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="capitalize">{payment.tier}</TableCell>
                      <TableCell>₱{Number(payment.amount).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method}</TableCell>
                      <TableCell className="font-mono">{payment.reference_number || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            payment.status === 'approved' ? 'default' : 
                            payment.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updatePayment.mutate({ 
                                id: payment.id, 
                                status: 'approved', 
                                tier: payment.tier, 
                                userId: payment.user_id 
                              })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => updatePayment.mutate({ 
                                id: payment.id, 
                                status: 'rejected', 
                                tier: payment.tier, 
                                userId: payment.user_id 
                              })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
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