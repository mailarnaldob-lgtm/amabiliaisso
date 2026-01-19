import { useState } from 'react';
import { ArrowDownUp, ArrowRight, Info, RefreshCw } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallets } from '@/hooks/useWallets';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { Link } from 'react-router-dom';

export function SwapWidget() {
  const { wallets, isLoading: walletsLoading, refetch: refetchWallets } = useWallets();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useWalletTransactions(5);

  const mainWallet = wallets?.find((w) => w.wallet_type === 'main');
  const taskWallet = wallets?.find((w) => w.wallet_type === 'task');
  const royaltyWallet = wallets?.find((w) => w.wallet_type === 'royalty');
  
  const totalCredits = (mainWallet?.balance || 0) + (taskWallet?.balance || 0) + (royaltyWallet?.balance || 0);

  const handleRefresh = () => {
    refetchWallets();
    refetchTx();
  };

  const formatTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'cash_in': 'Cash In',
      'cash_out': 'Withdrawal',
      'transfer': 'Transfer',
      'task_reward': 'Task Reward',
      'referral_commission': 'Referral Credit',
      'loan_disbursement': 'Loan Received',
      'loan_repayment': 'Loan Repaid',
    };
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Credit Balance Card */}
      <Card className="border-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div />
            <CardTitle className="text-2xl">Your ₳ Credits</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Internal system credits for platform participation</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {walletsLoading ? (
            <Skeleton className="h-16 w-40 mx-auto mb-2" />
          ) : (
            <div className="text-5xl font-bold text-primary mb-2">
              ₳{formatAlpha(totalCredits)}
            </div>
          )}
          <p className="text-sm text-muted-foreground">Total System Credits</p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">Main</p>
              {walletsLoading ? (
                <Skeleton className="h-5 w-12 mx-auto mt-1" />
              ) : (
                <p className="font-semibold">₳{formatAlpha(mainWallet?.balance || 0)}</p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">Activity</p>
              {walletsLoading ? (
                <Skeleton className="h-5 w-12 mx-auto mt-1" />
              ) : (
                <p className="font-semibold">₳{formatAlpha(taskWallet?.balance || 0)}</p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">Referral</p>
              {walletsLoading ? (
                <Skeleton className="h-5 w-12 mx-auto mt-1" />
              ) : (
                <p className="font-semibold">₳{formatAlpha(royaltyWallet?.balance || 0)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="border-warning/50 bg-warning/10">
        <Info className="h-4 w-4 text-warning" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong> ₳ Credits are internal system units for tracking participation. 
          They are not redeemable for cash or any monetary value. All credit allocations are 
          admin-reviewed and system-controlled.
        </AlertDescription>
      </Alert>

      {/* Recent Activity Log */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your participation history</CardDescription>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">{formatTransactionType(tx.transaction_type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.description || tx.transaction_type}
                    </p>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    tx.amount >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    {tx.amount >= 0 ? '+' : ''}₳{formatAlpha(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Your activity will appear here</p>
            </div>
          )}
          
          <Link to="/dashboard/transactions">
            <Button variant="outline" className="w-full mt-4">
              View Full History
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-center text-xs text-muted-foreground">
        ₳ Credits are managed by the Amabilia Network administration
      </p>
    </div>
  );
}
