import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowDownCircle, ArrowUpCircle, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAlpha, cn } from '@/lib/utils';
import { useUserCashInRequests } from '@/hooks/useCashInRequests';
import { useUserCashOutRequests } from '@/hooks/useCashOutRequests';

/**
 * Pending Requests Card - V9.4
 * Displays user's pending cash-in and cash-out requests with live status updates
 * per 15-second polling interval (Blueprint V8.0)
 */

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'on_hold' | 'flagged' | 'processing';

interface RequestItem {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  status: RequestStatus;
  payment_method: string;
  created_at: string;
  rejection_reason?: string | null;
}

const STATUS_CONFIG: Record<RequestStatus, { 
  label: string; 
  color: string; 
  icon: React.ReactNode;
  bgColor: string;
}> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  on_hold: {
    label: 'On Hold',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  flagged: {
    label: 'Under Review',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/30',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function RequestRow({ request }: { request: RequestItem }) {
  const config = STATUS_CONFIG[request.status];
  const isCashIn = request.type === 'cash_in';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        config.bgColor
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isCashIn ? "bg-chart-2/20" : "bg-primary/20"
        )}>
          {isCashIn ? (
            <ArrowDownCircle className="h-4 w-4 text-chart-2" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isCashIn ? 'Deposit' : 'Withdrawal'}
          </p>
          <p className="text-xs text-muted-foreground">
            {request.payment_method} • {formatTimeAgo(request.created_at)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={cn(
          "text-sm font-bold font-mono",
          isCashIn ? "text-chart-2" : "text-foreground"
        )}>
          {isCashIn ? '+' : '-'}₳{formatAlpha(request.amount)}
        </p>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] gap-1", config.color, config.bgColor)}
        >
          {config.icon}
          {config.label}
        </Badge>
      </div>
    </motion.div>
  );
}

export function PendingRequestsCard() {
  const { data: cashInRequests = [], isLoading: loadingIn } = useUserCashInRequests();
  const { data: cashOutRequests = [], isLoading: loadingOut } = useUserCashOutRequests();

  // Combine and sort by most recent first, limit to 5 most recent
  const allRequests: RequestItem[] = [
    ...cashInRequests.map(r => ({
      id: r.id,
      type: 'cash_in' as const,
      amount: r.amount,
      status: r.status,
      payment_method: r.payment_method,
      created_at: r.created_at,
      rejection_reason: r.rejection_reason,
    })),
    ...cashOutRequests.map(r => ({
      id: r.id,
      type: 'cash_out' as const,
      amount: r.amount,
      status: r.status,
      payment_method: r.payment_method,
      created_at: r.created_at,
      rejection_reason: r.rejection_reason,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Count pending items
  const pendingCount = allRequests.filter(r => 
    r.status === 'pending' || r.status === 'on_hold' || r.status === 'flagged'
  ).length;

  const isLoading = loadingIn || loadingOut;

  if (isLoading) {
    return (
      <Card className="terminal-card">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (allRequests.length === 0) {
    return null; // Don't show card if no requests
  }

  return (
    <Card className="terminal-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Transaction Requests
          </CardTitle>
          {pendingCount > 0 && (
            <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30 text-xs">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {allRequests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </AnimatePresence>
        
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          Auto-updating every 15 seconds • Approval typically within 1-24 hours
        </p>
      </CardContent>
    </Card>
  );
}
