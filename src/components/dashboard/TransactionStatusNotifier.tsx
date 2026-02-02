import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useUserCashInRequests } from '@/hooks/useCashInRequests';
import { useUserCashOutRequests } from '@/hooks/useCashOutRequests';
import { formatAlpha } from '@/lib/utils';

/**
 * Transaction Status Notifier - V9.4
 * Monitors cash-in and cash-out requests for status changes
 * and displays toast notifications when admin approves/rejects
 */

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'on_hold' | 'flagged' | 'processing';

interface TrackedRequest {
  id: string;
  status: RequestStatus;
  type: 'cash_in' | 'cash_out';
  amount: number;
}

export function TransactionStatusNotifier() {
  const { data: cashInRequests = [] } = useUserCashInRequests();
  const { data: cashOutRequests = [] } = useUserCashOutRequests();
  
  // Track previous request statuses
  const prevRequestsRef = useRef<Map<string, TrackedRequest>>(new Map());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Build current requests map
    const currentRequests = new Map<string, TrackedRequest>();
    
    cashInRequests.forEach(r => {
      currentRequests.set(r.id, {
        id: r.id,
        status: r.status as RequestStatus,
        type: 'cash_in',
        amount: r.amount,
      });
    });
    
    cashOutRequests.forEach(r => {
      currentRequests.set(r.id, {
        id: r.id,
        status: r.status as RequestStatus,
        type: 'cash_out',
        amount: r.amount,
      });
    });

    // Skip notifications on initial load
    if (isInitialLoadRef.current) {
      prevRequestsRef.current = currentRequests;
      isInitialLoadRef.current = false;
      return;
    }

    // Check for status changes
    currentRequests.forEach((current, id) => {
      const prev = prevRequestsRef.current.get(id);
      
      if (prev && prev.status !== current.status) {
        showStatusChangeToast(current, prev.status);
      }
    });

    // Update previous state
    prevRequestsRef.current = currentRequests;
  }, [cashInRequests, cashOutRequests]);

  return null; // This is a logic-only component
}

function showStatusChangeToast(
  request: TrackedRequest,
  previousStatus: RequestStatus
) {
  const typeLabel = request.type === 'cash_in' ? 'Deposit' : 'Withdrawal';
  const amountStr = `₳${formatAlpha(request.amount)}`;

  switch (request.status) {
    case 'approved':
      toast.success(`${typeLabel} Approved!`, {
        description: `Your ${amountStr} ${typeLabel.toLowerCase()} has been approved and processed.`,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        duration: 6000,
      });
      break;

    case 'rejected':
      toast.error(`${typeLabel} Rejected`, {
        description: `Your ${amountStr} ${typeLabel.toLowerCase()} request was not approved. Check your dashboard for details.`,
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        duration: 8000,
      });
      break;

    case 'on_hold':
    case 'flagged':
      toast.warning(`${typeLabel} Under Review`, {
        description: `Your ${amountStr} ${typeLabel.toLowerCase()} requires additional verification.`,
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        duration: 6000,
      });
      break;

    case 'processing':
      toast.info(`${typeLabel} Processing`, {
        description: `Your ${amountStr} ${typeLabel.toLowerCase()} is being processed.`,
        duration: 4000,
      });
      break;
  }
}
