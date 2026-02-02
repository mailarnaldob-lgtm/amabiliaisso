/**
 * SMART CREDIT LEDGER - SOVEREIGN EXECUTION V9.1
 * High-Density Credit Protocol Table
 * Shows active offers, principal, interest, and 28-day liquidation countdown
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatAlpha, formatCountdown, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMyLentLoans, useMyBorrowedLoans, usePendingLoans, type Loan } from '@/hooks/useLoans';
import { AlphaLoader } from '@/components/ui/AlphaLoader';

interface SmartCreditLedgerProps {
  className?: string;
  onRefresh?: () => void;
}

function LoanStatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    pending: { 
      icon: <Clock className="h-3 w-3" />, 
      label: 'Awaiting', 
      className: 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30' 
    },
    active: { 
      icon: <TrendingUp className="h-3 w-3" />, 
      label: 'Active', 
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
    },
    repaid: { 
      icon: <CheckCircle className="h-3 w-3" />, 
      label: 'Repaid', 
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    },
    defaulted: { 
      icon: <XCircle className="h-3 w-3" />, 
      label: 'Defaulted', 
      className: 'bg-red-500/20 text-red-400 border-red-500/30' 
    },
    cancelled: { 
      icon: <XCircle className="h-3 w-3" />, 
      label: 'Cancelled', 
      className: 'bg-muted text-muted-foreground border-muted' 
    },
  };
  
  const { icon, label, className } = config[status] || config.pending;
  
  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", className)}>
      {icon}
      {label}
    </Badge>
  );
}

function CountdownCell({ dueAt }: { dueAt: string | null }) {
  const [countdown, setCountdown] = useState('--');
  const [isUrgent, setIsUrgent] = useState(false);
  
  useEffect(() => {
    if (!dueAt) {
      setCountdown('--');
      return;
    }
    
    const updateCountdown = () => {
      const due = new Date(dueAt);
      const now = new Date();
      const diffMs = due.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setCountdown('OVERDUE');
        setIsUrgent(true);
        return;
      }
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setCountdown(`${days}d ${hours}h`);
      } else {
        setCountdown(`${hours}h`);
      }
      
      setIsUrgent(days <= 3);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [dueAt]);
  
  return (
    <span className={cn(
      "font-mono text-xs",
      isUrgent ? "text-red-400 font-bold" : "text-muted-foreground"
    )}>
      {countdown}
    </span>
  );
}

export function SmartCreditLedger({ className, onRefresh }: SmartCreditLedgerProps) {
  const { data: lentLoans = [], isLoading: loadingLent, refetch: refetchLent } = useMyLentLoans();
  const { data: borrowedLoans = [], isLoading: loadingBorrowed, refetch: refetchBorrowed } = useMyBorrowedLoans();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isLoading = loadingLent || loadingBorrowed;
  
  // Combine and sort by date
  const allCredits = [
    ...lentLoans.map(l => ({ ...l, role: 'lender' as const })),
    ...borrowedLoans.map(l => ({ ...l, role: 'borrower' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchLent(), refetchBorrowed()]);
    setIsRefreshing(false);
    onRefresh?.();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <AlphaLoader size="md" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl bg-card border border-border overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-[#FFD700]/5 to-transparent">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            Smart Credit Protocol
            <Badge variant="outline" className="text-[10px] border-[#FFD700]/30 text-[#FFD700]">
              {allCredits.length} Records
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground">28-Day Cycle Ledger</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-[#FFD700]"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>
      
      {allCredits.length === 0 ? (
        <div className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No credit records yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start lending or borrowing to build your history
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Principal</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Interest</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Total</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">Countdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCredits.map((credit) => {
                const interest = credit.interest_amount || (credit.principal_amount * (credit.interest_rate / 100));
                const total = credit.total_repayment || (credit.principal_amount + interest);
                
                return (
                  <TableRow 
                    key={credit.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          credit.role === 'lender' 
                            ? "border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/10" 
                            : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                        )}
                      >
                        {credit.role === 'lender' ? (
                          <><TrendingUp className="h-3 w-3 mr-1" />Lender</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" />Borrower</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      ₳{formatAlpha(credit.principal_amount)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#FFD700]">
                      +{credit.interest_rate}%
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold">
                      ₳{formatAlpha(total)}
                    </TableCell>
                    <TableCell>
                      <LoanStatusBadge status={credit.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {credit.status === 'active' ? (
                        <CountdownCell dueAt={credit.due_at} />
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
