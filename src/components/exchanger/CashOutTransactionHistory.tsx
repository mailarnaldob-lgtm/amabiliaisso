/**
 * CASH-OUT TRANSACTION HISTORY
 * Displays user's withdrawal requests with masked account details
 * Uses the secure masked view (cash_out_requests_user_view)
 */

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertTriangle, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUserCashOutRequests } from '@/hooks/useCashOutRequests';
import { formatDistanceToNow } from 'date-fns';

interface CashOutTransactionHistoryProps {
  maxItems?: number;
  className?: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' },
  flagged: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Under Review' },
  processing: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Processing' },
};

export function CashOutTransactionHistory({ maxItems = 10, className }: CashOutTransactionHistoryProps) {
  const { data: requests, isLoading, refetch, isFetching } = useUserCashOutRequests();

  const displayedRequests = requests?.slice(0, maxItems) || [];

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (displayedRequests.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <ArrowDownToLine className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No withdrawal requests yet</p>
        <p className="text-xs text-muted-foreground/70">Your withdrawals will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with refresh */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {displayedRequests.length} withdrawal{displayedRequests.length !== 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-6 px-2"
        >
          <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
        </Button>
      </div>

      {displayedRequests.map((request, index) => {
        const status = statusConfig[request.status] || statusConfig.pending;
        const StatusIcon = status.icon;

        return (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-4 rounded-lg border border-border/50",
              "bg-gradient-to-br from-muted/20 to-transparent",
              "hover:border-emerald-500/30 transition-colors"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  status.bg
                )}>
                  <StatusIcon className={cn("h-5 w-5", status.color)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-foreground">
                      ₳{request.amount.toLocaleString()}
                    </span>
                    <Badge variant="outline" className={cn("text-xs", status.color, "border-current/30")}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {request.payment_method} • {request.account_number}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-sm font-mono text-emerald-400">
                  ₱{request.net_amount.toLocaleString()}
                </span>
                <p className="text-xs text-muted-foreground">Net payout</p>
              </div>
            </div>

            {/* Show rejection reason if rejected */}
            {request.status === 'rejected' && request.rejection_reason && (
              <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">
                  <strong>Reason:</strong> {request.rejection_reason}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Footer */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          15-second polling • Account details masked for security
        </p>
      </div>
    </div>
  );
}