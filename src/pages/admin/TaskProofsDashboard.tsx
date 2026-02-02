import { useState } from 'react';
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
  RefreshCw,
  ExternalLink,
  FileText,
  Activity,
  Coins,
  Target
} from 'lucide-react';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';

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

export default function TaskProofsDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

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
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;

  return (
    <AdminPageWrapper 
      title="ACTIVITY PROOFS LEDGER" 
      description="Review and approve submitted task proofs"
    >
      {() => (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-amber-500/5 hover:border-amber-500/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Pending Review
                </CardDescription>
                <CardTitle className="text-4xl font-mono text-amber-500">{pendingCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Total Submissions
                </CardDescription>
                <CardTitle className="text-4xl font-mono text-foreground">{submissions?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-emerald-500/10 bg-gradient-to-br from-card to-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-500" />
                  Total Rewards
                </CardDescription>
                <CardTitle className="text-4xl font-mono text-emerald-500">
                  ₳{submissions?.reduce((sum, s) => sum + (s.reward_amount || s.task?.reward || 0), 0).toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Task Proofs Table */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-mono">Task Submissions</CardTitle>
                <CardDescription>Review and approve submitted task proofs</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                disabled={isLoading}
                className="border-primary/30 hover:bg-primary/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 bg-primary/5 border border-primary/10">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    Pending {pendingCount > 0 && (
                      <Badge className="ml-2 bg-destructive/20 text-destructive border border-destructive/30">
                        {pendingCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    Rejected
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : !submissions?.length ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No {activeTab} submissions found</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-primary/10 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary/5 hover:bg-primary/5">
                            <TableHead className="text-muted-foreground font-mono">ID</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Task</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Proof Type</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Proof</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Reward</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Status</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Submitted</TableHead>
                            <TableHead className="text-muted-foreground font-mono">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission) => (
                            <TableRow 
                              key={submission.id}
                              className="border-primary/5 hover:bg-primary/5 transition-colors"
                            >
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                #{submission.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-foreground">{submission.task?.title || 'Unknown Task'}</p>
                              </TableCell>
                              <TableCell className="capitalize text-muted-foreground">{submission.proof_type}</TableCell>
                              <TableCell>
                                {submission.proof_url ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleViewProof(submission.proof_url)}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No proof</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono font-medium text-primary">
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
                                      className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
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
                                      className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
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
        </div>
      )}
    </AdminPageWrapper>
  );
}
