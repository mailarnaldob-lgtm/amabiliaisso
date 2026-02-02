import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings2, 
  Percent, 
  Coins, 
  Clock, 
  TrendingUp, 
  Save, 
  Loader2,
  Wallet,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  useAdminControlSettings, 
  useUpdateAdminControls, 
  useAdminTreasuryStats,
  useAdminSystemHealth
} from '@/hooks/useAdminControls';
import { formatAlpha } from '@/lib/utils';

export default function AdminEconomicControls() {
  const { data: settings, isLoading: settingsLoading } = useAdminControlSettings();
  const { data: treasury, isLoading: treasuryLoading } = useAdminTreasuryStats();
  const { data: health } = useAdminSystemHealth();
  const updateSettings = useUpdateAdminControls();

  // Local state for form
  const [formState, setFormState] = useState<{
    vault_daily_yield_rate: string;
    lender_bonus_rate: string;
    direct_commission_rate: string;
    internal_transfer_fee: string;
    external_transfer_fee: string;
    loan_duration_days: string;
  } | null>(null);

  // Initialize form when settings load
  const currentSettings = formState ? {
    vault_daily_yield_rate: parseFloat(formState.vault_daily_yield_rate) || 0,
    lender_bonus_rate: parseFloat(formState.lender_bonus_rate) || 0,
    direct_commission_rate: parseFloat(formState.direct_commission_rate) || 0,
    internal_transfer_fee: parseFloat(formState.internal_transfer_fee) || 0,
    external_transfer_fee: parseFloat(formState.external_transfer_fee) || 0,
    loan_duration_days: parseInt(formState.loan_duration_days) || 28,
  } : settings;

  const handleInputChange = (field: string, value: string) => {
    setFormState((prev) => ({
      vault_daily_yield_rate: prev?.vault_daily_yield_rate ?? String((settings?.vault_daily_yield_rate || 0) * 100),
      lender_bonus_rate: prev?.lender_bonus_rate ?? String((settings?.lender_bonus_rate || 0) * 100),
      direct_commission_rate: prev?.direct_commission_rate ?? String(settings?.direct_commission_rate || 50),
      internal_transfer_fee: prev?.internal_transfer_fee ?? String(settings?.internal_transfer_fee || 5),
      external_transfer_fee: prev?.external_transfer_fee ?? String(settings?.external_transfer_fee || 15),
      loan_duration_days: prev?.loan_duration_days ?? String(settings?.loan_duration_days || 28),
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!formState) return;

    updateSettings.mutate({
      vault_daily_yield_rate: parseFloat(formState.vault_daily_yield_rate) / 100,
      lender_bonus_rate: parseFloat(formState.lender_bonus_rate) / 100,
      direct_commission_rate: parseFloat(formState.direct_commission_rate),
      internal_transfer_fee: parseFloat(formState.internal_transfer_fee),
      external_transfer_fee: parseFloat(formState.external_transfer_fee),
      loan_duration_days: parseInt(formState.loan_duration_days),
    });
  };

  const getDisplayValue = (field: string): string => {
    if (formState?.[field as keyof typeof formState] !== undefined) {
      return formState[field as keyof typeof formState];
    }
    if (!settings) return '';
    
    switch (field) {
      case 'vault_daily_yield_rate':
        return String((settings.vault_daily_yield_rate || 0) * 100);
      case 'lender_bonus_rate':
        return String((settings.lender_bonus_rate || 0) * 100);
      case 'direct_commission_rate':
        return String(settings.direct_commission_rate || 50);
      case 'internal_transfer_fee':
        return String(settings.internal_transfer_fee || 5);
      case 'external_transfer_fee':
        return String(settings.external_transfer_fee || 15);
      case 'loan_duration_days':
        return String(settings.loan_duration_days || 28);
      default:
        return '';
    }
  };

  return (
    <AdminPageWrapper 
      title="ECONOMIC CONTROL CENTER" 
      description="Manage global rates, fees, and treasury oversight"
    >
      {() => (
        <div className="space-y-8 max-w-5xl">
          {/* Treasury Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  Total Circulating
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treasuryLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <p className="text-2xl font-bold font-mono text-primary">
                    ₳{formatAlpha(treasury?.totalCirculating || 0)}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-emerald-500/10 bg-gradient-to-br from-card to-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Fees Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treasuryLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold font-mono text-emerald-500">
                    ₳{formatAlpha(treasury?.totalFeesCollected || 0)}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-blue-500/10 bg-gradient-to-br from-card to-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Commissions Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treasuryLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold font-mono text-blue-500">
                    ₳{formatAlpha(treasury?.totalCommissionsPaid || 0)}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treasuryLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold font-mono text-amber-500">
                    ₳{formatAlpha(treasury?.pendingCommissions || 0)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Wallet Breakdown */}
          <Card className="border-primary/10 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet Distribution
              </CardTitle>
              <CardDescription>Total balances across all user wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Main Wallets</p>
                  <p className="text-xl font-bold font-mono">₳{formatAlpha(treasury?.mainWalletTotal || 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-sm text-muted-foreground mb-1">Task Wallets</p>
                  <p className="text-xl font-bold font-mono text-emerald-500">₳{formatAlpha(treasury?.taskWalletTotal || 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-sm text-muted-foreground mb-1">Royalty Wallets</p>
                  <p className="text-xl font-bold font-mono text-amber-500">₳{formatAlpha(treasury?.royaltyWalletTotal || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Economic Dials */}
          <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Global Economic Dials
                  </CardTitle>
                  <CardDescription>Adjust rates and fees across the entire platform</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Blueprint V8.0
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Interest Rates */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      Interest & Yield Rates
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vault_yield" className="text-sm text-muted-foreground">
                          Daily Vault Yield (%)
                        </Label>
                        <Input
                          id="vault_yield"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getDisplayValue('vault_daily_yield_rate')}
                          onChange={(e) => handleInputChange('vault_daily_yield_rate', e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Current: {((settings?.vault_daily_yield_rate || 0) * 100).toFixed(2)}%</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lender_bonus" className="text-sm text-muted-foreground">
                          Lender Bonus Rate (%)
                        </Label>
                        <Input
                          id="lender_bonus"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={getDisplayValue('lender_bonus_rate')}
                          onChange={(e) => handleInputChange('lender_bonus_rate', e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Current: {((settings?.lender_bonus_rate || 0) * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-primary/10" />

                  {/* Commission Rates */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Commission Settings
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="direct_comm" className="text-sm text-muted-foreground">
                          Direct Referral Commission (%)
                        </Label>
                        <Input
                          id="direct_comm"
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={getDisplayValue('direct_commission_rate')}
                          onChange={(e) => handleInputChange('direct_commission_rate', e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Blueprint default: 50%</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loan_duration" className="text-sm text-muted-foreground">
                          Default Loan Duration (days)
                        </Label>
                        <Input
                          id="loan_duration"
                          type="number"
                          step="1"
                          min="1"
                          max="365"
                          value={getDisplayValue('loan_duration_days')}
                          onChange={(e) => handleInputChange('loan_duration_days', e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Blueprint default: 28 days</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-primary/10" />

                  {/* Transfer Fees */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-primary" />
                      Transfer Fees
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="internal_fee" className="text-sm text-muted-foreground">
                          Internal Transfer Fee (₳)
                        </Label>
                        <Input
                          id="internal_fee"
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={getDisplayValue('internal_transfer_fee')}
                          onChange={(e) => handleInputChange('internal_transfer_fee', e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Blueprint default: ₳5</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="external_fee" className="text-sm text-muted-foreground">
                          External Transfer Fee (₳)
                        </Label>
                        <Input
                          id="external_fee"
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={getDisplayValue('external_transfer_fee')}
                          onChange={(e) => handleInputChange('external_transfer_fee', e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Blueprint default: ₳15</p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button 
                    onClick={handleSave}
                    disabled={updateSettings.isPending || !formState}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {updateSettings.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Economic Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-primary/10 bg-card/50">
            <CardHeader>
              <CardTitle className="font-mono">System Health</CardTitle>
              <CardDescription>Real-time platform activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <p className="text-3xl font-bold font-mono">{health?.transactionsLast24h || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Transactions (24h)</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
                  <p className="text-3xl font-bold font-mono text-blue-500">{health?.activeLoans || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active Loans</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                  <p className="text-3xl font-bold font-mono text-amber-500">{health?.pendingPayments || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending Payments</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                  <p className="text-3xl font-bold font-mono text-emerald-500">{health?.pendingTasks || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageWrapper>
  );
}
