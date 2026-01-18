import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, ExternalLink, Crown, Calculator } from 'lucide-react';
import { format } from 'date-fns';

interface SubmissionData {
  id: string;
  task_id: string;
  user_id: string;
  proof_type: string;
  proof_url: string | null;
  status: string;
  submitted_at: string;
  reward_amount: number | null;
  rejection_reason: string | null;
  task?: {
    title: string;
    reward: number;
    category: string;
  };
  user?: {
    full_name: string;
    membership_tier: string | null;
    referred_by: string | null;
  };
}

interface SubmissionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionData | null;
}

export function SubmissionReviewDialog({ open, onOpenChange, submission }: SubmissionReviewDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch upline info if user was referred
  const { data: uplineInfo } = useQuery({
    queryKey: ['upline-info', submission?.user?.referred_by],
    queryFn: async () => {
      if (!submission?.user?.referred_by) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, membership_tier')
        .eq('id', submission.user.referred_by)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!submission?.user?.referred_by,
  });

  const taskReward = submission?.task?.reward || 0;
  const royaltyAmount = uplineInfo?.membership_tier === 'elite' ? taskReward * 0.08 : 0;
  const hasEliteUpline = uplineInfo?.membership_tier === 'elite';

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!submission || !user) throw new Error('Missing data');

      // Use server-side RPC function for atomic operations
      const { data, error } = await supabase.rpc('approve_task_submission', {
        p_submission_id: submission.id,
        p_admin_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const result = data as { success: boolean; reward_credited: number; royalty_credited: number };
      toast({ 
        title: 'Submission approved', 
        description: `Reward ₳${result.reward_credited} credited${result.royalty_credited > 0 ? ` + ₳${result.royalty_credited} royalty` : ''}` 
      });
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!submission || !user) throw new Error('Missing data');

      // Use server-side RPC function for atomic operations
      const { data, error } = await supabase.rpc('reject_task_submission', {
        p_submission_id: submission.id,
        p_admin_id: user.id,
        p_rejection_reason: rejectionReason || 'Submission did not meet requirements',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Submission rejected' });
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      setRejectionReason('');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Submission
            <Badge variant={submission.status === 'pending' ? 'secondary' : submission.status === 'approved' ? 'default' : 'destructive'}>
              {submission.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Task</Label>
                  <p className="font-medium">{submission.task?.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{submission.task?.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted By</Label>
                  <p className="font-medium">{submission.user?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted At</Label>
                  <p className="font-medium">{format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof Section */}
          <div className="space-y-2">
            <Label>Proof ({submission.proof_type})</Label>
            {submission.proof_url ? (
              <a
                href={submission.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Proof
              </a>
            ) : (
              <p className="text-muted-foreground italic">No proof URL provided</p>
            )}
          </div>

          <Separator />

          {/* Reward Calculation Preview */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Reward Calculation Preview</Label>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Task Reward to User:</span>
                  <span className="font-mono font-semibold text-green-600">₳{taskReward.toLocaleString()}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className={`h-4 w-4 ${hasEliteUpline ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    <span>8% Elite Team Override:</span>
                  </div>
                  {hasEliteUpline ? (
                    <span className="font-mono font-semibold text-yellow-600">₳{royaltyAmount.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground italic">No Elite Upline</span>
                  )}
                </div>
                
                {hasEliteUpline && uplineInfo && (
                  <div className="text-xs text-muted-foreground pl-6">
                    → Credits to {uplineInfo.full_name}'s Royalty Wallet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason (if pending) */}
          {submission.status === 'pending' && (
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason (if rejecting)</Label>
              <Textarea
                id="rejection_reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {submission.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending || approveMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {approveMutation.isPending ? 'Approving...' : 'Approve & Credit'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
