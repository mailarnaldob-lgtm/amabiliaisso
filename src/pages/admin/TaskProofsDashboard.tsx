import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  LogOut, 
  RefreshCw,
  ExternalLink,
  FileText,
  Shield,
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Eye,
  Settings,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import { initAdminSession, clearAdminSession, getAdminInfoSync } from '@/lib/adminSession';

interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  proof_type: string;
  proof_url: string | null;
  status: string;
  submitted_at: string;
  reward_amount: number | null;
  task?: {
    title: string;
    reward: number;
  };
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

export default function TaskProofsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

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

  // Fetch task submissions from Supabase
  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['admin-task-submissions', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          task:tasks(title, reward)
        `)
        .eq('status', activeTab)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as TaskSubmission[];
    },
    enabled: isInitialized,
  });

  // Use server-side RPC for task approval
  const approveSubmission = useMutation({
    mutationFn: async ({ submissionId }: { submissionId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('approve_task_submission', {
        p_submission_id: submissionId,
        p_admin_id: user.id
      });
      
      if (error) throw error;
      const result = data as { success?: boolean; reward_credited?: number } | null;
      if (!result?.success) throw new Error('Failed to approve submission');
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Task approved! ₳${data?.reward_credited || 0} credited.`);
      queryClient.invalidateQueries({ queryKey: ['admin-task-submissions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Use server-side RPC for task rejection
  const rejectSubmission = useMutation({
    mutationFn: async ({ submissionId, reason }: { submissionId: string; reason?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('reject_task_submission', {
        p_submission_id: submissionId,
        p_admin_id: user.id,
        p_rejection_reason: reason || 'Submission did not meet requirements'
      });
      
      if (error) throw error;
      const result = data as { success?: boolean } | null;
      if (!result?.success) throw new Error('Failed to reject submission');
      return result;
    },
    onSuccess: () => {
      toast.success('Submission rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-task-submissions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Get signed URL for proof
  const handleViewProof = async (proofUrl: string | null) => {
    if (!proofUrl) {
      toast.error('No proof uploaded');
      return;
    }
    
    // If it's a full URL, open directly
    if (proofUrl.startsWith('http')) {
      window.open(proofUrl, '_blank');
      return;
    }
    
    // Otherwise try to get signed URL from storage
    const { data } = await supabase.storage
      .from('task-proofs')
      .createSignedUrl(proofUrl, 3600);
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    } else {
      toast.error('Could not load proof');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;

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
          <h2 className="text-2xl font-bold">Task Proofs Dashboard</h2>
          <p className="text-muted-foreground">Review and approve submitted task proofs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Submissions</CardDescription>
              <CardTitle className="text-3xl">{submissions?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rewards</CardDescription>
              <CardTitle className="text-3xl">
                ₳{submissions?.reduce((sum, s) => sum + (s.reward_amount || s.task?.reward || 0), 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Task Proofs Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Task Submissions</CardTitle>
              <CardDescription>Review and approve submitted task proofs</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending {pendingCount > 0 && <Badge className="ml-2" variant="destructive">{pendingCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !submissions?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {activeTab} submissions found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead>Proof Type</TableHead>
                          <TableHead>Proof</TableHead>
                          <TableHead>Reward</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-mono text-sm">
                              #{submission.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{submission.task?.title || 'Unknown Task'}</p>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{submission.proof_type}</TableCell>
                            <TableCell>
                              {submission.proof_url ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewProof(submission.proof_url)}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">No proof</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₳{(submission.reward_amount || submission.task?.reward || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {submission.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => approveSubmission.mutate({ submissionId: submission.id })}
                                    disabled={approveSubmission.isPending}
                                  >
                                    {approveSubmission.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-destructive"
                                    onClick={() => rejectSubmission.mutate({ submissionId: submission.id })}
                                    disabled={rejectSubmission.isPending}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
