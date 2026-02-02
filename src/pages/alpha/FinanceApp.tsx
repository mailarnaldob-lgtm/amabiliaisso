import { useState } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Clock, Shield, Users, Percent, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { RiskDisclosureModal } from '@/components/alpha/RiskDisclosureModal';
import { LoanCountdownTimer } from '@/components/alpha/LoanCountdownTimer';
import { CircuitBreakerIndicator } from '@/components/alpha/CircuitBreakerIndicator';
import { DebtorRescuePanel } from '@/components/alpha/DebtorRescuePanel';
import { useReferredUsersCount } from '@/hooks/useReferrals';

// Live loan marketplace data - fetched from database in production
const lendOffers = [{
  id: 1,
  amount: 1000,
  rate: 3,
  term: 7,
  status: 'pending',
  lender: 'Alpha_001'
}, {
  id: 2,
  amount: 2500,
  rate: 3,
  term: 7,
  status: 'pending',
  lender: 'Alpha_002'
}, {
  id: 3,
  amount: 500,
  rate: 3,
  term: 7,
  status: 'matched',
  lender: 'Alpha_003'
}];

const borrowerStats = {
  debtLimit: 5000,
  currentDebt: 0,
  isDebtor: false
};

const activeLoans = [{
  id: 1,
  type: 'lend',
  amount: 1000,
  rate: 3,
  startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  borrower: 'Alpha_Member',
  expectedReturn: 1030,
  status: 'active' as const
}];

// Rescue missions for debtor recovery flow
const rescueMissions = [{
  id: '1',
  title: 'Extended Survey Campaign',
  description: 'Complete 10 detailed user research surveys',
  reward: 500,
  difficulty: 'Hard' as const,
  timeLimit: '48 hours',
  status: 'in_progress' as const,
  progress: 40
}, {
  id: '2',
  title: 'Community Outreach Marathon',
  description: 'Onboard and verify 5 new platform participants',
  reward: 1000,
  difficulty: 'Extreme' as const,
  timeLimit: '7 days',
  status: 'available' as const
}];

const REQUIRED_REFERRALS = 3;

export default function FinanceApp() {
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'lend' | 'borrow';
    amount: number;
  } | null>(null);
  const [showDebtorView, setShowDebtorView] = useState(false);

  // Real qualification check: user needs 3+ referred users
  const { data: referralCount = 0, isLoading: isLoadingReferrals } = useReferredUsersCount();
  const qualificationMet = referralCount >= REQUIRED_REFERRALS;

  const handleLendClick = (amount: number) => {
    setPendingAction({ type: 'lend', amount });
    setRiskModalOpen(true);
  };

  const handleBorrowClick = (amount: number) => {
    setPendingAction({ type: 'borrow', amount });
    setRiskModalOpen(true);
  };

  const handleRiskAccepted = () => {
    console.log('ALPHA SYSTEM: Risk disclosure accepted for:', pendingAction);
    setPendingAction(null);
  };

  // Debtor recovery view
  if (showDebtorView) {
    return (
      <AlphaLayout title="P2P Finance" subtitle="Smart Credit Protocol">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowDebtorView(false)} className="font-mono text-xs border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/10">
            Return to Dashboard
          </Button>
        </div>
        <DebtorRescuePanel totalDebt={5300} earnedTowardsDebt={2385} daysOverdue={3} missions={rescueMissions} />
      </AlphaLayout>
    );
  }

  return (
    <AlphaLayout title="P2P Finance" subtitle="Smart Credit Protocol">
      {/* Circuit Breaker Status */}
      <CircuitBreakerIndicator reserveRatio={115} />

      {/* Qualification Check Banner */}
      <Card className={`my-4 bg-card backdrop-blur-xl border ${qualificationMet ? 'border-emerald-500/30' : 'border-[#FFD700]/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${qualificationMet ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-[#FFD700]/10 border border-[#FFD700]/20'}`}>
              {qualificationMet ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Shield className="h-5 w-5 text-[#FFD700]" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {qualificationMet ? 'Qualified for P2P Credit' : 'Qualification Required'}
              </p>
              <p className="text-xs text-muted-foreground">
                {qualificationMet ? 'You meet requirements for lending and borrowing' : 'Invite 3 active partners to unlock'}
              </p>
            </div>
            <Badge variant="outline" className={`font-mono ${qualificationMet ? 'border-emerald-500/30 text-emerald-400' : 'border-[#FFD700]/30 text-[#FFD700]'}`}>
              {referralCount}/3
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Lend/Borrow */}
      <Tabs defaultValue="lend" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-card border border-border p-1">
          <TabsTrigger value="lend" className="gap-2 text-sm data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]">
            <TrendingUp className="h-4 w-4" />
            Lend
          </TabsTrigger>
          <TabsTrigger value="borrow" className="gap-2 text-sm data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]">
            <TrendingDown className="h-4 w-4" />
            Borrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend">
          {/* Lend Summary - Golden-Yellow Theme */}
          <Card className="mb-4 overflow-hidden bg-card border-[#FFD700]/20 backdrop-blur-xl">
            <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/5 p-5 border-b border-[#FFD700]/10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">7-Day Credit Cycle</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-[#FFD700]">3%</span>
                <span className="text-sm text-muted-foreground">Weekly Return</span>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3 text-[#FFD700]" />
                  1% Entry Fee
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#FFD700]" />
                  7-Day Lock
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-[#FFD700]" />
                  Non-Guaranteed
                </span>
              </div>
            </div>
          </Card>

          {/* Marketplace Offers */}
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Credit Marketplace
          </h3>
          
          {lendOffers.map(offer => (
            <Card key={offer.id} className="mb-3 bg-card border-border hover:border-[#FFD700]/30 transition-all duration-150">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20">
                      <TrendingUp className="h-5 w-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground font-mono">₳{formatAlpha(offer.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {offer.rate}% • {offer.term} days
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={offer.status === 'matched' ? 'default' : 'outline'} 
                    className={`text-[10px] ${offer.status === 'matched' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'border-[#FFD700]/20 text-[#FFD700]'}`}
                  >
                    {offer.status === 'matched' ? 'Matched' : 'Available'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            className="w-full mt-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-black font-bold active:scale-95 transition-all duration-150" 
            disabled={!qualificationMet} 
            onClick={() => handleLendClick(1000)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Post Lending Offer
          </Button>
          
          {!qualificationMet && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Complete qualification to unlock lending
            </p>
          )}
        </TabsContent>

        <TabsContent value="borrow">
          {/* Borrower Stats */}
          <Card className="mb-4 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Credit Limit</span>
                <span className="font-bold text-foreground font-mono">₳{formatAlpha(borrowerStats.debtLimit)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Current Debt</span>
                <span className="font-bold text-[#FFD700] font-mono">₳{formatAlpha(borrowerStats.currentDebt)}</span>
              </div>
              <Progress value={0} className="h-1.5 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">
                Limit based on VPA mission history
              </p>
            </CardContent>
          </Card>

          {/* Available Loans */}
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Available Credit Offers
          </h3>
          
          {lendOffers.filter(o => o.status === 'pending').map(offer => (
            <Card key={offer.id} className="mb-3 bg-card border-border hover:border-[#FFD700]/30 transition-all duration-150">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground font-mono">₳{formatAlpha(offer.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total: ₳{formatAlpha(Math.round(offer.amount * 1.03))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      + ₳10 origination + 1% fee
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={!qualificationMet} 
                    onClick={() => handleBorrowClick(offer.amount)}
                    className="text-xs border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 active:scale-95 transition-all duration-150"
                  >
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Active Loans with Countdown Timer */}
      {activeLoans.length > 0 && (
        <>
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            My Active Credits
          </h3>
          
          {activeLoans.map(loan => (
            <div key={loan.id} className="space-y-3 mb-4">
              <Card className="bg-card border-[#FFD700]/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-[10px]">Lending</Badge>
                      <span className="text-sm text-muted-foreground">
                        → {loan.borrower}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground font-mono">₳{formatAlpha(loan.amount)}</span>
                      <span className="text-emerald-400 font-medium ml-2 font-mono">
                        +₳{formatAlpha(loan.expectedReturn - loan.amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <LoanCountdownTimer startDate={loan.startDate} dueDate={loan.dueDate} status={loan.status} />
            </div>
          ))}
        </>
      )}

      {/* Risk Disclosure Modal */}
      {pendingAction && (
        <RiskDisclosureModal 
          open={riskModalOpen} 
          onOpenChange={setRiskModalOpen} 
          onAccept={handleRiskAccepted} 
          cycleType={pendingAction.type} 
          amount={pendingAction.amount} 
        />
      )}
    </AlphaLayout>
  );
}