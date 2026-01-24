import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useAdminNotificationStats,
  usePendingPayments,
  usePendingTaskSubmissions,
  PendingPayment,
  PendingTaskSubmission,
} from '@/hooks/useAdminNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CreditCard,
  FileCheck,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  User,
  Clock,
  Coins,
  AlertTriangle,
  Image,
  Link as LinkIcon,
} from 'lucide-react';

export function AdminNotificationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useAdminNotificationStats();
  const { data: pendingPayments, isLoading: paymentsLoading } = usePendingPayments();
  const { data: pendingSubmissions, isLoading: submissionsLoading } = usePendingTaskSubmissions();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    type: 'payment' | 'submission';
    id: string;
    name: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const handleApprovePayment = async (payment: PendingPayment) => {
    if (!user) return;
    setProcessingId(payment.id);

    try {
      const { data, error } = await supabase.rpc('approve_membership_payment', {
        p_payment_id: payment.id,
        p_admin_id: user.id,
      });

      if (error) throw error;

      toast.success(`Payment approved for ${payment.user_name}`);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayment = async () => {
    if (!user || !rejectDialog || rejectDialog.type !== 'payment') return;
    setProcessingId(rejectDialog.id);

    try {
      const { error } = await supabase.rpc('reject_membership_payment', {
        p_payment_id: rejectDialog.id,
        p_admin_id: user.id,
        p_rejection_reason: rejectionReason || 'Payment could not be verified',
      });

      if (error) throw error;

      toast.success('Payment rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
      setRejectDialog(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveSubmission = async (submission: PendingTaskSubmission) => {
    if (!user) return;
    setProcessingId(submission.id);

    try {
      const { data, error } = await supabase.rpc('approve_task_submission', {
        p_submission_id: submission.id,
        p_admin_id: user.id,
      });

      if (error) throw error;

      const result = data as any;
      toast.success(
        `Task approved! Worker receives ₱${result.worker_reward?.toFixed(2) || submission.task_reward * 0.9}`
      );
      queryClient.invalidateQueries({ queryKey: ['admin-pending-task-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve submission');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmission = async () => {
    if (!user || !rejectDialog || rejectDialog.type !== 'submission') return;
    setProcessingId(rejectDialog.id);

    try {
      const { error } = await supabase.rpc('reject_task_submission', {
        p_submission_id: rejectDialog.id,
        p_admin_id: user.id,
        p_rejection_reason: rejectionReason || 'Submission did not meet requirements',
      });

      if (error) throw error;

      toast.success('Submission rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-task-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-stats'] });
      setRejectDialog(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject submission');
    } finally {
      setProcessingId(null);
    }
  };

  const getProofUrl = async (proofPath: string | null, bucket: string) => {
    if (!proofPath) return null;

    // If it's already a full URL, return it
    if (proofPath.startsWith('http')) return proofPath;

    // Generate signed URL for storage path
    const { data } = await supabase.storage.from(bucket).createSignedUrl(proofPath, 300);
    return data?.signedUrl || null;
  };

  const handleViewProof = async (proofPath: string | null, bucket: string) => {
    const url = await getProofUrl(proofPath, bucket);
    if (url) {
      setProofPreview(url);
    } else {
      toast.error('Could not load proof');
    }
  };

  const isLoading = statsLoading || paymentsLoading || submissionsLoading;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Center
              {stats && stats.totalPending > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.totalPending}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage all pending approvals in one place
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : stats?.totalPending === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No pending approvals at the moment</p>
          </div>
        ) : (
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
                {stats && stats.pendingPayments > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.pendingPayments}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Task Proofs
                {stats && stats.pendingTaskProofs > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.pendingTaskProofs}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {pendingPayments?.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending payment approvals</p>
                    </div>
                  ) : (
                    pendingPayments?.map((payment) => (
                      <div
                        key={payment.id}
                        className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate">{payment.user_name}</span>
                              <Badge
                                variant={
                                  payment.tier === 'elite'
                                    ? 'default'
                                    : payment.tier === 'pro'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {payment.tier.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Coins className="h-3 w-3" />₱{payment.amount}
                              </span>
                              <span>{payment.payment_method}</span>
                              {payment.reference_number && (
                                <span className="font-mono text-xs">
                                  Ref: {payment.reference_number}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {payment.proof_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewProof(payment.proof_url, 'payment-proofs')}
                              >
                                <Image className="h-4 w-4 mr-1" />
                                Proof
                              </Button>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayment(payment)}
                                disabled={processingId === payment.id}
                              >
                                {processingId === payment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setRejectDialog({
                                    type: 'payment',
                                    id: payment.id,
                                    name: payment.user_name || 'User',
                                  })
                                }
                                disabled={processingId === payment.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {pendingSubmissions?.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending task proof approvals</p>
                    </div>
                  ) : (
                    pendingSubmissions?.map((submission) => (
                      <div
                        key={submission.id}
                        className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate">{submission.task_title}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {submission.user_name}
                              </span>
                              <Badge variant="outline" className="gap-1">
                                {submission.proof_type === 'screenshot' ? (
                                  <Image className="h-3 w-3" />
                                ) : (
                                  <LinkIcon className="h-3 w-3" />
                                )}
                                {submission.proof_type}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-primary">
                                <Coins className="h-3 w-3" />
                                ₱{(submission.task_reward * 0.9).toFixed(0)} worker / ₱
                                {(submission.task_reward * 0.1).toFixed(0)} fee
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(submission.submitted_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {submission.proof_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (submission.proof_type === 'link') {
                                    window.open(submission.proof_url!, '_blank');
                                  } else {
                                    handleViewProof(submission.proof_url, 'task-proofs');
                                  }
                                }}
                              >
                                {submission.proof_type === 'link' ? (
                                  <>
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Link
                                  </>
                                ) : (
                                  <>
                                    <Image className="h-4 w-4 mr-1" />
                                    Proof
                                  </>
                                )}
                              </Button>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveSubmission(submission)}
                                disabled={processingId === submission.id}
                              >
                                {processingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setRejectDialog({
                                    type: 'submission',
                                    id: submission.id,
                                    name: submission.task_title || 'Task',
                                  })
                                }
                                disabled={processingId === submission.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reject {rejectDialog?.type === 'payment' ? 'Payment' : 'Submission'}
            </DialogTitle>
            <DialogDescription>
              Rejecting: {rejectDialog?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={
                  rejectDialog?.type === 'payment'
                    ? 'e.g., Payment could not be verified, screenshot unclear...'
                    : 'e.g., Proof does not show task completion...'
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={
                rejectDialog?.type === 'payment' ? handleRejectPayment : handleRejectSubmission
              }
              disabled={processingId === rejectDialog?.id}
            >
              {processingId === rejectDialog?.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Preview Dialog */}
      <Dialog open={!!proofPreview} onOpenChange={(open) => !open && setProofPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Proof Preview</DialogTitle>
          </DialogHeader>
          {proofPreview && (
            <div className="flex justify-center">
              <img
                src={proofPreview}
                alt="Proof"
                className="max-h-[500px] rounded-lg object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofPreview(null)}>
              Close
            </Button>
            <Button asChild>
              <a href={proofPreview || ''} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Size
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
