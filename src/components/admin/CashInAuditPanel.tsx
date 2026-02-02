import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  usePendingCashInRequests,
  useApproveCashIn,
  useRejectCashIn,
  useHoldCashIn,
  useCashInStats,
  CashInRequest,
} from '@/hooks/useCashInRequests';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Banknote,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Clock,
  Coins,
  Image,
  PauseCircle,
  X,
  ZoomIn,
} from 'lucide-react';

export function CashInAuditPanel() {
  const { data: requests, isLoading } = usePendingCashInRequests();
  const { data: stats } = useCashInStats();
  const approveMutation = useApproveCashIn();
  const rejectMutation = useRejectCashIn();
  const holdMutation = useHoldCashIn();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [proofLightbox, setProofLightbox] = useState<string | null>(null);

  const handleApprove = async (request: CashInRequest) => {
    setProcessingId(request.id);
    try {
      await approveMutation.mutateAsync(request.id);
      toast.success(`₳${request.amount.toLocaleString()} approved for ${request.user_name}`);
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setProcessingId(rejectDialog.id);
    try {
      await rejectMutation.mutateAsync({
        requestId: rejectDialog.id,
        reason: rejectionReason || 'Payment could not be verified',
      });
      toast.success('Request rejected');
      setRejectDialog(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleHold = async (request: CashInRequest) => {
    setProcessingId(request.id);
    try {
      await holdMutation.mutateAsync(request.id);
      toast.info(`Request put on hold`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to hold request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewProof = async (proofPath: string | null) => {
    if (!proofPath) {
      toast.error('No proof uploaded');
      return;
    }

    // If it's already a full URL, use it directly
    if (proofPath.startsWith('http')) {
      setProofLightbox(proofPath);
      return;
    }

    // Generate signed URL for storage path
    const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(proofPath, 300);
    if (data?.signedUrl) {
      setProofLightbox(data.signedUrl);
    } else {
      toast.error('Could not load proof');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning border-warning/50">Pending</Badge>;
      case 'on_hold':
        return <Badge variant="secondary" className="border-muted-foreground/50">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Cash-In Audit Panel
                {stats && stats.total > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.total}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review and approve Alpha Exchanger deposit requests
              </CardDescription>
            </div>
            {stats && (
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>{stats.pending} pending</span>
                {stats.onHold > 0 && <span>• {stats.onHold} on hold</span>}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No pending cash-in requests</p>
            </div>
          ) : (
            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* User Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate">{request.user_name}</span>
                          {getStatusBadge(request.status)}
                        </div>

                        {/* Amount and Method */}
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span className="flex items-center gap-1 text-primary font-mono font-bold">
                            <Coins className="h-4 w-4" />
                            ₳{request.amount.toLocaleString()}
                          </span>
                          <Badge variant="secondary">{request.payment_method}</Badge>
                        </div>

                        {/* Reference Number */}
                        {request.reference_number && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                              Ref: {request.reference_number}
                            </span>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {/* View Proof Button */}
                        {request.proof_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProof(request.proof_url)}
                          >
                            <Image className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          {/* APPROVE */}
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                            title="Approve"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>

                          {/* HOLD (only for pending) */}
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHold(request)}
                              disabled={processingId === request.id}
                              title="Hold"
                            >
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {/* REJECT */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setRejectDialog({
                                id: request.id,
                                name: request.user_name || 'User',
                              })
                            }
                            disabled={processingId === request.id}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cash-In Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectDialog?.name}'s request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Invalid reference number, Screenshot unclear, Amount mismatch..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processingId === rejectDialog?.id}
            >
              {processingId === rejectDialog?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Lightbox */}
      <Dialog open={!!proofLightbox} onOpenChange={() => setProofLightbox(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <ZoomIn className="h-5 w-5" />
                Payment Receipt
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProofLightbox(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-4 pt-2">
            {proofLightbox && (
              <img
                src={proofLightbox}
                alt="Payment proof"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                  toast.error('Failed to load image');
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
