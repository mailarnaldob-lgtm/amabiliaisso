/**
 * GLOBAL ADMIN COMMAND CENTER - SOVEREIGN V12.0
 * 
 * Master control interface for AMABILIA NETWORK administrators.
 * All actions take effect globally across the ecosystem.
 * 
 * Theme: Obsidian Black (#050505) + Alpha Gold (#FFD700)
 * Polling: 15-second RESTful sync
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  usePendingCashInRequests,
  useApproveCashIn,
  useRejectCashIn,
  useCashInStats,
  CashInRequest,
} from '@/hooks/useCashInRequests';
import {
  usePendingCashOutRequests,
  useApproveCashOut,
  useRejectCashOut,
  useCashOutStats,
  CashOutRequest,
} from '@/hooks/useCashOutRequests';
import { useAdminTasks } from '@/hooks/useAdminTasks';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Coins,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Zap,
  RefreshCw,
  Shield,
  Activity,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Eye,
  Image,
  User,
} from 'lucide-react';
import { OdometerNumber } from '@/components/command/OdometerNumber';

// Urgency indicator - blinks for items pending > 5 minutes
function UrgencyIndicator({ createdAt }: { createdAt: string }) {
  const minutesPending = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
  const isUrgent = minutesPending > 5;

  if (!isUrgent) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FFD700]"
    />
  );
}

// Stats card with visual feedback
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = 'default',
  sublabel,
}: { 
  label: string; 
  value: number | string; 
  icon: React.ComponentType<{ className?: string }>; 
  variant?: 'default' | 'success' | 'warning' | 'danger';
  sublabel?: string;
}) {
  const variantStyles = {
    default: 'border-[#FFD700]/20 bg-[#050505]/80',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
  };

  const iconStyles = {
    default: 'text-[#FFD700]',
    success: 'text-green-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
  };

  return (
    <Card className={cn('relative overflow-hidden', variantStyles[variant])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold font-mono mt-1">{value}</p>
            {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
          </div>
          <div className={cn('p-3 rounded-xl bg-background/50', iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pending membership payments hook
function usePendingMembershipPayments() {
  return useQuery({
    queryKey: ['admin-pending-membership-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_payments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get user names
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map(payment => ({
        ...payment,
        user_name: profileMap.get(payment.user_id) || 'Unknown',
      }));
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

// Pending task submissions hook
function usePendingTaskSubmissions() {
  return useQuery({
    queryKey: ['admin-pending-task-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks:task_id (title, reward, category)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get user names
      const userIds = [...new Set(data.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map(submission => ({
        ...submission,
        user_name: profileMap.get(submission.user_id) || 'Unknown',
      }));
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function GlobalCommandCenter() {
  const queryClient = useQueryClient();
  const [lastSync, setLastSync] = useState(new Date());
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Data hooks with 15-second polling
  const { data: cashInRequests, isLoading: cashInLoading } = usePendingCashInRequests();
  const { data: cashOutRequests, isLoading: cashOutLoading } = usePendingCashOutRequests();
  const { data: membershipPayments, isLoading: membershipLoading } = usePendingMembershipPayments();
  const { data: taskSubmissions, isLoading: taskLoading } = usePendingTaskSubmissions();
  const { data: cashInStats } = useCashInStats();
  const { data: cashOutStats } = useCashOutStats();

  // Mutations
  const approveCashIn = useApproveCashIn();
  const rejectCashIn = useRejectCashIn();
  const approveCashOut = useApproveCashOut();
  const rejectCashOut = useRejectCashOut();

  // Update sync timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Refresh all data
  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-in-requests'] });
    queryClient.invalidateQueries({ queryKey: ['admin-pending-cash-out-requests'] });
    queryClient.invalidateQueries({ queryKey: ['admin-pending-membership-payments'] });
    queryClient.invalidateQueries({ queryKey: ['admin-pending-task-submissions'] });
    setLastSync(new Date());
    toast.success('Dashboard synced');
  };

  // Handle cash-in approval with visual feedback
  const handleApproveCashIn = async (request: CashInRequest) => {
    setProcessingId(request.id);
    try {
      await approveCashIn.mutateAsync(request.id);
      toast.success(`₳${request.amount.toLocaleString()} credited globally`);
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle cash-out approval
  const handleApproveCashOut = async (request: CashOutRequest) => {
    setProcessingId(request.id);
    try {
      await approveCashOut.mutateAsync(request.id);
      toast.success(`₳${request.amount.toLocaleString()} withdrawal approved`);
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle membership approval
  const handleApproveMembership = async (paymentId: string, userName: string) => {
    setProcessingId(paymentId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_membership_payment', {
        p_payment_id: paymentId,
        p_admin_id: user.id,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Approval failed');

      toast.success(`${userName} activated globally`);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-membership-payments'] });
    } catch (error: any) {
      toast.error(error.message || 'Activation failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle task approval
  const handleApproveTask = async (submissionId: string, userName: string, reward: number) => {
    setProcessingId(submissionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_task_submission', {
        p_submission_id: submissionId,
        p_admin_id: user.id,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Approval failed');

      toast.success(`${userName} earned ₳${reward} + MLM royalties triggered`);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-task-submissions'] });
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Calculate totals
  const totalPendingFinancial = (cashInStats?.total || 0) + (cashOutStats?.total || 0);
  const totalPendingOperational = (membershipPayments?.length || 0) + (taskSubmissions?.length || 0);

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="h-6 w-6 text-black" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFD700]">GLOBAL COMMAND CENTER</h1>
            <p className="text-sm text-muted-foreground">
              All actions sync globally • 15-second polling active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1 border-[#FFD700]/30">
            <Activity className="h-3 w-3 text-green-400 animate-pulse" />
            Last sync: {formatDistanceToNow(lastSync, { addSuffix: true })}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAll}
            className="border-[#FFD700]/30 hover:bg-[#FFD700]/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Pending Activations"
          value={membershipPayments?.length || 0}
          icon={UserCheck}
          variant={membershipPayments && membershipPayments.length > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Cash-In Queue"
          value={cashInStats?.total || 0}
          icon={ArrowUpCircle}
          variant={cashInStats && cashInStats.total > 3 ? 'warning' : 'default'}
          sublabel={`₳${cashInRequests?.reduce((sum, r) => sum + r.amount, 0)?.toLocaleString() || 0}`}
        />
        <StatCard
          label="Cash-Out Queue"
          value={cashOutStats?.total || 0}
          icon={ArrowDownCircle}
          variant={cashOutStats && cashOutStats.total > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Mission Proofs"
          value={taskSubmissions?.length || 0}
          icon={Target}
          variant={taskSubmissions && taskSubmissions.length > 5 ? 'warning' : 'default'}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FINANCIAL PRIORITY HUD (Gold Border - Money Flow)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-[#FFD700]" />
          <h2 className="text-lg font-bold text-[#FFD700]">FINANCIAL PRIORITY HUD</h2>
          {totalPendingFinancial > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {totalPendingFinancial} PENDING
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Account Activation Queue */}
          <Card className="border-[#FFD700]/30 bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-[#FFD700]" />
                Account Activation Engine
              </CardTitle>
              <CardDescription>
                Approve to unlock member access globally
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membershipLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !membershipPayments || membershipPayments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400/50" />
                  <p className="text-sm">All activations processed</p>
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {membershipPayments.map((payment: any) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative p-3 rounded-lg border border-[#FFD700]/20 bg-[#0a0a0a] hover:border-[#FFD700]/40 transition-all"
                      >
                        <UrgencyIndicator createdAt={payment.created_at} />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{payment.user_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px]">
                                {payment.tier?.toUpperCase()}
                              </Badge>
                              <span>₳{payment.amount}</span>
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleApproveMembership(payment.id, payment.user_name)}
                              disabled={processingId === payment.id}
                              className="bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
                            >
                              {processingId === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingId === payment.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Exchanger Buy/Sell Hub */}
          <Card className="border-[#FFD700]/30 bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUpCircle className="h-5 w-5 text-green-400" />
                <ArrowDownCircle className="h-5 w-5 text-red-400" />
                Exchanger Buy/Sell Hub
              </CardTitle>
              <CardDescription>
                Atomic transactions update vault + ledger instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cash-In Section */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-green-400 mb-2 flex items-center gap-1">
                    <ArrowUpCircle className="h-3 w-3" /> BUY ALPHA
                  </p>
                  {cashInLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : !cashInRequests || cashInRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No pending buys</p>
                  ) : (
                    <ScrollArea className="h-[80px]">
                      <div className="space-y-1">
                        {cashInRequests.slice(0, 3).map((req) => (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative flex items-center justify-between p-2 rounded border border-green-500/20 bg-green-500/5"
                          >
                            <UrgencyIndicator createdAt={req.created_at} />
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{req.user_name}</span>
                              <span className="text-xs font-mono text-green-400">+₳{req.amount}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-green-400 hover:bg-green-500/20"
                              onClick={() => handleApproveCashIn(req)}
                              disabled={processingId === req.id}
                            >
                              {processingId === req.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <Separator className="bg-[#FFD700]/10" />

                {/* Cash-Out Section */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1">
                    <ArrowDownCircle className="h-3 w-3" /> SELL ALPHA
                  </p>
                  {cashOutLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : !cashOutRequests || cashOutRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No pending sells</p>
                  ) : (
                    <ScrollArea className="h-[80px]">
                      <div className="space-y-1">
                        {cashOutRequests.slice(0, 3).map((req) => (
                          <motion.div
                            key={req.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative flex items-center justify-between p-2 rounded border border-red-500/20 bg-red-500/5"
                          >
                            <UrgencyIndicator createdAt={req.created_at} />
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{req.user_name}</span>
                              <span className="text-xs font-mono text-red-400">-₳{req.amount}</span>
                              {req.has_active_loan && (
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-red-400 hover:bg-red-500/20"
                              onClick={() => handleApproveCashOut(req)}
                              disabled={processingId === req.id || req.has_active_loan}
                            >
                              {processingId === req.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          OPERATIONAL CONTROL (Silver Border - Task Flow)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-300">OPERATIONAL CONTROL</h2>
          {totalPendingOperational > 0 && (
            <Badge variant="secondary">
              {totalPendingOperational} AWAITING
            </Badge>
          )}
        </div>

        <Card className="border-slate-500/30 bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileCheck className="h-5 w-5 text-slate-400" />
                  Mission Review Queue
                </CardTitle>
                <CardDescription>
                  Approve to auto-credit vault + trigger MLM royalty engine
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/task-proofs">View All</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {taskLoading ? (
              <div className="grid md:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : !taskSubmissions || taskSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400/50" />
                <p>All missions reviewed</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-2">
                {taskSubmissions.slice(0, 6).map((submission: any) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-3 rounded-lg border border-slate-500/20 bg-[#0a0a0a] hover:border-slate-500/40 transition-all"
                  >
                    <UrgencyIndicator createdAt={submission.submitted_at} />
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{submission.user_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {submission.tasks?.title || 'Unknown Task'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {submission.tasks?.category || 'Task'}
                          </Badge>
                          <span className="text-xs text-[#FFD700] font-mono">
                            ₳{submission.tasks?.reward || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {submission.proof_url && (
                          <Button size="sm" variant="ghost" className="h-6 px-2" asChild>
                            <a href={submission.proof_url} target="_blank" rel="noopener">
                              <Image className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleApproveTask(
                            submission.id, 
                            submission.user_name, 
                            submission.tasks?.reward || 0
                          )}
                          disabled={processingId === submission.id}
                          className="h-6 px-2 bg-slate-600 hover:bg-slate-500"
                        >
                          {processingId === submission.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Footer */}
      <Card className="bg-[#050505]/50 border-[#FFD700]/10">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Global sync active • 15-second polling</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Financial: {totalPendingFinancial} pending</span>
              <span>Operational: {totalPendingOperational} pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
