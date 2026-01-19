import { useState, useEffect } from 'react';
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
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { initAdminSession, clearAdminSession, getAdminInfoSync, isAdminSessionValidSync } from '@/lib/adminSession';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; role: string } | null>(null);

  // Initialize admin session on mount
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

  const handleLogout = async () => {
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
    enabled: isInitialized,
  });

  // Use server-side RPC for payment approval (prevents client-side manipulation)
  const approvePayment = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('approve_membership_payment', {
        p_payment_id: paymentId,
        p_admin_id: user.id
      });
      
      if (error) throw error;
      const result = data as { success?: boolean } | null;
      if (!result?.success) throw new Error('Failed to approve payment');
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Payment Approved', description: 'Membership has been upgraded.' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('reject_membership_payment', {
        p_payment_id: paymentId,
        p_admin_id: user.id,
        p_rejection_reason: reason || 'Payment could not be verified'
      });
      
      if (error) throw error;
      const result = data as { success?: boolean } | null;
      if (!result?.success) throw new Error('Failed to reject payment');
      return result;
    },
    onSuccess: () => {
      toast({ title: 'Payment Rejected' });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Get signed URL for payment proof
  const getProofUrl = async (proofPath: string) => {
    const { data } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(proofPath, 3600); // 1 hour expiry
    return data?.signedUrl;
  };

  const handleViewProof = async (proofUrl: string | null) => {
    if (!proofUrl) {
      toast({ title: 'No proof uploaded', variant: 'destructive' });
      return;
    }
    
    const signedUrl = await getProofUrl(proofUrl);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      toast({ title: 'Could not load proof', variant: 'destructive' });
    }
  };

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
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                    <TableHead>Proof</TableHead>
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
                        {payment.proof_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewProof(payment.proof_url)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
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
                              onClick={() => approvePayment.mutate({ paymentId: payment.id })}
                              disabled={approvePayment.isPending}
                            >
                              {approvePayment.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => rejectPayment.mutate({ paymentId: payment.id })}
                              disabled={rejectPayment.isPending}
                            >
                              {rejectPayment.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
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
