import { useState } from 'react';
import { ArrowDownUp, ArrowRight, Info } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SwapWidget() {
  const { wallets } = useAppStore();
  const [amount, setAmount] = useState('');

  const mainWallet = wallets.find((w) => w.type === 'main');
  const taskWallet = wallets.find((w) => w.type === 'task');
  const royaltyWallet = wallets.find((w) => w.type === 'royalty');
  
  const totalCredits = (mainWallet?.balance || 0) + (taskWallet?.balance || 0) + (royaltyWallet?.balance || 0);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Credit Balance Card */}
      <Card className="border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your ₳ Credits</CardTitle>
          <CardDescription>Internal system credits for platform participation</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">
            ₳{formatAlpha(totalCredits)}
          </div>
          <p className="text-sm text-muted-foreground">Total System Credits</p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">Main</p>
              <p className="font-semibold">₳{formatAlpha(mainWallet?.balance || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">Activity</p>
              <p className="font-semibold">₳{formatAlpha(taskWallet?.balance || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground">Referral</p>
              <p className="font-semibold">₳{formatAlpha(royaltyWallet?.balance || 0)}</p>
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

      {/* Credit Activity Log Placeholder */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your participation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-sm">Activity Reward</p>
                <p className="text-xs text-muted-foreground">Admin approved</p>
              </div>
              <span className="text-primary font-semibold">+₳50</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-sm">Referral Credit</p>
                <p className="text-xs text-muted-foreground">New member verified</p>
              </div>
              <span className="text-primary font-semibold">+₳100</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-sm">Participation Bonus</p>
                <p className="text-xs text-muted-foreground">Weekly allocation</p>
              </div>
              <span className="text-primary font-semibold">+₳25</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            View Full History
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-center text-xs text-muted-foreground">
        ₳ Credits are managed by the Amabilia Network administration
      </p>
    </div>
  );
}
