/**
 * ECOSYSTEM LIQUIDITY PANEL - SOVEREIGN V12.0
 * Admin Dashboard: Total System Liquidity Overview
 * 
 * Displays:
 * - EARN Rewards (Task Wallet Total)
 * - MLM Payouts (Royalty Wallet Total)
 * - Main Wallet (Liquid Funds)
 * - Vault Deposits (Elite SAVE)
 * - Commission Distribution Stats
 * - Edge Function Health Monitor
 * 
 * Theme: Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { RefreshCw, Wallet, Crown, Zap, Shield, Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useEcosystemOverview, EdgeFunctionHealth } from '@/hooks/useSystemLiquidity';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Status indicator for edge functions
function HealthStatusBadge({ status }: { status: string }) {
  const config = {
    success: { icon: CheckCircle2, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    error: { icon: AlertCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    running: { icon: Activity, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  }[status] || { icon: Clock, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1', config.color)}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export function EcosystemLiquidityPanel() {
  const { 
    liquidity, 
    health, 
    isLoading, 
    totalEcosystemValue, 
    reserveRatio,
    refetch 
  } = useEcosystemOverview();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#FFD700]">ECOSYSTEM LIQUIDITY</h2>
          <p className="text-sm text-muted-foreground">
            Total System Overview • EARN + MLM + SAVE Integration
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="border-[#FFD700]/30 hover:bg-[#FFD700]/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Total Ecosystem Value Card */}
      <Card className="bg-gradient-to-br from-[#050505] to-[#0a0a0a] border-[#FFD700]/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Total Ecosystem Value
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-[#FFD700]">₳</span>
                <OdometerNumber 
                  value={totalEcosystemValue} 
                  className="text-4xl font-bold text-white"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reserve Ratio</p>
              <p className={cn(
                "text-2xl font-bold",
                reserveRatio >= 100 ? "text-green-400" : reserveRatio >= 80 ? "text-yellow-400" : "text-red-400"
              )}>
                {reserveRatio.toFixed(1)}%
              </p>
              <Progress 
                value={Math.min(reserveRatio, 100)} 
                className="w-24 h-2 mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Task Wallet (EARN) */}
        <Card className="bg-[#050505]/60 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground uppercase">EARN</span>
            </div>
            <p className="text-xl font-bold text-white">
              ₳{(liquidity?.wallets.task_total || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Task Wallets</p>
          </CardContent>
        </Card>

        {/* Royalty Wallet (MLM) */}
        <Card className="bg-[#050505]/60 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Crown className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs text-muted-foreground uppercase">MLM</span>
            </div>
            <p className="text-xl font-bold text-white">
              ₳{(liquidity?.wallets.royalty_total || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Royalty Wallets</p>
          </CardContent>
        </Card>

        {/* Main Wallet */}
        <Card className="bg-[#050505]/60 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Wallet className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-xs text-muted-foreground uppercase">LIQUID</span>
            </div>
            <p className="text-xl font-bold text-white">
              ₳{(liquidity?.wallets.main_total || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Main Wallets</p>
          </CardContent>
        </Card>

        {/* Vault Deposits (SAVE) */}
        <Card className="bg-[#050505]/60 border-[#FFD700]/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-[#FFD700]/20">
                <Shield className="h-4 w-4 text-[#FFD700]" />
              </div>
              <span className="text-xs text-muted-foreground uppercase">SAVE</span>
            </div>
            <p className="text-xl font-bold text-white">
              ₳{(liquidity?.vaults.deposits_total || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {liquidity?.vaults.active_count || 0} Active Vaults
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Distribution */}
      <Card className="bg-[#050505]/60 border-[#FFD700]/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-400" />
            Network Commission Distribution
          </CardTitle>
          <CardDescription>
            10% overrides to EXPERT/ELITE uplines (Levels 1-2)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-2xl font-bold text-purple-400">
                ₳{(liquidity?.commissions.total_paid || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Paid</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-2xl font-bold text-purple-400">
                {(liquidity?.commissions.event_count || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Commission Events</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-2xl font-bold text-purple-400">
                {liquidity?.commissions.earner_count || 0}
              </p>
              <p className="text-xs text-muted-foreground">Unique Earners</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edge Function Health Monitor */}
      <Card className="bg-[#050505]/60 border-[#FFD700]/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Edge Function Health
          </CardTitle>
          <CardDescription>
            Cron job execution status (Daily Yield & Auto-Repayment)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health && health.length > 0 ? (
            <div className="space-y-3">
              {health.map((fn: EdgeFunctionHealth) => (
                <div 
                  key={fn.function_name}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#FFD700]/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      fn.execution_status === 'success' ? "bg-green-400" :
                      fn.execution_status === 'error' ? "bg-red-400" : "bg-yellow-400"
                    )} />
                    <div>
                      <p className="font-medium text-white">{fn.function_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last run: {fn.last_execution 
                          ? formatDistanceToNow(new Date(fn.last_execution), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                  <HealthStatusBadge status={fn.execution_status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No edge function executions recorded yet</p>
              <p className="text-xs">Functions will appear after first cron execution</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#050505]/60 border-[#FFD700]/10">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-[#FFD700]">
              {liquidity?.wallets.unique_users || 0}
            </p>
            <p className="text-sm text-muted-foreground">Unique Wallet Holders</p>
          </CardContent>
        </Card>
        <Card className="bg-[#050505]/60 border-[#FFD700]/10">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-[#FFD700]">
              ₳{(liquidity?.wallets.circulating_total || 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Circulating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
