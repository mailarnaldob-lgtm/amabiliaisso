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
import { Separator } from '@/components/ui/separator';
import {
  usePendingCashOutRequests,
  useApproveCashOut,
  useRejectCashOut,
  useFlagCashOut,
  useCashOutStats,
  CashOutRequest,
} from '@/hooks/useCashOutRequests';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDownToLine,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Clock,
  Coins,
  Flag,
  AlertTriangle,
  Building2,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export function CashOutAuditPanel() {
  const { data: requests, isLoading } = usePendingCashOutRequests();
  const { data: stats } = useCashOutStats();
  const approveMutation = useApproveCashOut();
  const rejectMutation = useRejectCashOut();
  const flagMutation = useFlagCashOut();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailsDialog, setDetailsDialog] = useState<CashOutRequest | null>(null);

  const handleApprove = async (request: CashOutRequest) => {
    setProcessingId(request.id);
    try {
      await approveMutation.mutateAsync(request.id);
      toast.success(`₳${request.amount.toLocaleString()} withdrawal approved for ${request.user_name}`);
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
        reason: rejectionReason || 'Withdrawal request could not be verified',
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

  const handleFlag = async (request: CashOutRequest) => {
    setProcessingId(request.id);
    try {
      await flagMutation.mutateAsync(request.id);
      toast.info('Request flagged for review');
    } catch (error: any) {
      toast.error(error.message || 'Failed to flag request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (request: CashOutRequest) => {
    if (request.has_active_loan) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Active Loan</Badge>;
    }
    switch (request.status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning border-warning/50">Pending</Badge>;
      case 'flagged':
        return <Badge variant="secondary" className="gap-1"><Flag className="h-3 w-3" /> Flagged</Badge>;
      default:
        return <Badge variant="outline">{request.status}</Badge>;
    }
  };

  const maskAccountNumber = (num: string) => {
    if (num.length <= 4) return num;
    return '*'.repeat(num.length - 4) + num.slice(-4);
  };

  // Check if account name matches profile name (case-insensitive)
  const isNameMatch = (request: CashOutRequest) => {
    if (!request.user_name || !request.account_name) return false;
    return request.user_name.toLowerCase().trim() === request.account_name.toLowerCase().trim();
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-primary" />
                Cash-Out Audit Panel
                {stats && stats.total > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.total}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review and approve withdrawal requests (₳15 flat fee per transaction)
              </CardDescription>
            </div>
            {stats && (
              <div className="flex flex-col items-end gap-1 text-sm">
                <span className="text-muted-foreground">{stats.pending} pending • {stats.flagged} flagged</span>
                <span className="font-mono text-primary">₳{stats.pendingAmount?.toLocaleString() || 0} queued</span>
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
              <p className="text-sm">No pending withdrawal requests</p>
            </div>
          ) : (
            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors ${
                      request.has_active_loan ? 'border-destructive/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* User Info & Identity Match */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate">{request.user_name}</span>
                          {getStatusBadge(request)}
                          {isNameMatch(request) ? (
                            <Badge variant="outline" className="gap-1 text-primary border-primary/50">
                              <ShieldCheck className="h-3 w-3" /> ID Match
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-destructive border-destructive/50">
                              <ShieldAlert className="h-3 w-3" /> Name Mismatch
                            </Badge>
                          )}
                        </div>

                        {/* Amount Breakdown */}
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span className="flex items-center gap-1 text-primary font-mono font-bold">
                            <Coins className="h-4 w-4" />
                            ₳{request.amount.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">- ₳15 fee</span>
                          <span className="text-foreground font-medium">= ₱{request.net_amount.toLocaleString()}</span>
                        </div>

                        {/* Bank Details */}
                        <div className="flex items-center gap-3 text-sm mb-2">
                          <Badge variant="secondary" className="gap-1">
                            <Building2 className="h-3 w-3" />
                            {request.payment_method}
                          </Badge>
                          <span className="text-muted-foreground">{request.account_name}</span>
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                            {maskAccountNumber(request.account_number)}
                          </span>
                        </div>

                        {/* Timestamp & PIN Status */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </span>
                          {request.pin_verified && (
                            <Badge variant="outline" className="text-xs">PIN Verified</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {/* View Full Details */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailsDialog(request)}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Details
                        </Button>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          {/* APPROVE */}
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id || request.has_active_loan}
                            title={request.has_active_loan ? 'User has active loan' : 'Verify & Approve'}
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>

                          {/* FLAG (only for pending) */}
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFlag(request)}
                              disabled={processingId === request.id}
                              title="Flag for Review"
                            >
                              <Flag className="h-4 w-4" />
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
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectDialog?.name}'s withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Account name mismatch, Suspicious activity, Invalid bank details..."
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

      {/* Details Dialog */}
      <Dialog open={!!detailsDialog} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Withdrawal Details
            </DialogTitle>
          </DialogHeader>
          {detailsDialog && (
            <div className="space-y-4">
              {/* Identity Verification */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="text-sm font-medium mb-2">Identity Verification</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Profile Name:</span>
                    <p className="font-medium">{detailsDialog.user_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Name:</span>
                    <p className="font-medium">{detailsDialog.account_name}</p>
                  </div>
                </div>
                <div className="mt-2">
                  {isNameMatch(detailsDialog) ? (
                    <Badge className="bg-primary/10 text-primary gap-1">
                      <ShieldCheck className="h-3 w-3" /> Names Match ✓
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <ShieldAlert className="h-3 w-3" /> WARNING: Names Do Not Match
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Transaction Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Withdrawal Amount:</span>
                  <span className="font-mono font-bold">₳{detailsDialog.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <span className="font-mono">₳{detailsDialog.fee_amount}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-medium">Net Payout:</span>
                  <span className="font-mono font-bold text-primary">₱{detailsDialog.net_amount.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              {/* Bank Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{detailsDialog.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono">{detailsDialog.account_number}</span>
                </div>
              </div>

              {/* Active Loan Warning */}
              {detailsDialog.has_active_loan && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">User has active loan(s)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Per ABC rules, withdrawals are blocked until all loans are repaid.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
