/**
 * EXCHANGE TRANSACTION HISTORY - Cash-in/out history with glassmorphism
 * 
 * Features:
 * - Real-time 15-second polling updates
 * - Hover for detailed info
 * - Gold accent theming
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn, formatAlpha } from '@/lib/utils';
import { useUserCashInRequests, CashInRequest } from '@/hooks/useCashInRequests';

interface ExchangeTransactionHistoryProps {
  className?: string;
  maxItems?: number;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    label: 'Pending Review'
  },
  on_hold: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    label: 'On Hold'
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    label: 'Approved'
  },
  rejected: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    label: 'Rejected'
  },
};

export function ExchangeTransactionHistory({ 
  className,
  maxItems = 5
}: ExchangeTransactionHistoryProps) {
  const { data: requests, isLoading, isError } = useUserCashInRequests();
  
  const displayedRequests = (requests || []).slice(0, maxItems);
  
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="text-right space-y-1.5">
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-5 w-16 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={cn(
        "rounded-xl border border-border bg-card/50 p-6 text-center",
        className
      )}>
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load history</p>
      </div>
    );
  }
  
  if (displayedRequests.length === 0) {
    return (
      <div className={cn(
        "rounded-xl border border-[#FFD700]/10 bg-[#050505]/50 p-8 text-center",
        className
      )}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-[#FFD700]/50" />
        </div>
        <p className="text-sm text-muted-foreground">No exchange history yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Your transactions will appear here
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      <AnimatePresence mode="popLayout">
        {displayedRequests.map((request, index) => (
          <TransactionCard 
            key={request.id} 
            request={request} 
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function TransactionCard({ 
  request, 
  index 
}: { 
  request: CashInRequest; 
  index: number;
}) {
  const config = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-[#0a0a0a]/80 via-[#050505]/80 to-[#0d0d0d]/80",
        "border border-[#FFD700]/10 hover:border-[#FFD700]/30",
        "backdrop-blur-xl transition-all duration-300",
        "hover:shadow-lg hover:shadow-[#FFD700]/5"
      )}
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-[#FFD700]/10 border border-[#FFD700]/20"
            )}>
              <ArrowDownLeft className="h-5 w-5 text-[#FFD700]" />
            </div>
            
            {/* Details */}
            <div>
              <p className="text-sm font-medium text-foreground">
                Buy ₳ Credits
              </p>
              <p className="text-xs text-muted-foreground">
                via {request.payment_method} • {timeAgo}
              </p>
            </div>
          </div>
          
          {/* Amount & Status */}
          <div className="text-right">
            <p className="text-lg font-mono font-bold text-[#FFD700]">
              +₳{formatAlpha(request.amount)}
            </p>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px]",
                config.color,
                config.border,
                config.bg
              )}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>
        
        {/* Rejection Reason */}
        {request.status === 'rejected' && request.rejection_reason && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 pt-3 border-t border-border/50"
          >
            <p className="text-xs text-destructive">
              Reason: {request.rejection_reason}
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent" />
    </motion.div>
  );
}
