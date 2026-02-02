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
      <AlphaLayout title="₳LPHA FINANCE" subtitle="P2P Smart Credit" appColor="from-accent to-accent/70">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowDebtorView(false)} className="font-mono text-xs border-platinum/20">
            Return to Dashboard
          </Button>
        </div>
        <DebtorRescuePanel totalDebt={5300} earnedTowardsDebt={2385} daysOverdue={3} missions={rescueMissions} />
      </AlphaLayout>
    );
  }

  return (
    <AlphaLayout title="₳LPHA FINANCE" subtitle="P2P Smart Credit" appColor="from-accent to-accent/70">
      {/* Circuit Breaker Status */}
      <CircuitBreakerIndicator reserveRatio={115} />

      {/* Qualification Check Banner */}
      <Card className={`my-4 bg-slate/60 backdrop-blur-xl ${qualificationMet ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${qualificationMet ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              {qualificationMet ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Shield className="h-5 w-5 text-amber-400" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-platinum font-mono">
                {qualificationMet ? 'QUALIFIED_FOR_P2P_CREDIT' : 'QUALIFICATION_REQUIRED'}
              </p>
              <p className="text-xs text-platinum/50 font-mono">
                {qualificationMet ? 'You meet requirements for lending and borrowing' : 'Invite 3 active participants to unlock'}
              </p>
            </div>
            <Badge variant="outline" className={`font-mono ${qualificationMet ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'}`}>
              {referralCount}/3
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Lend/Borrow */}
      <Tabs defaultValue="lend" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate/80 border border-platinum/10 p-1">
          <TabsTrigger value="lend" className="gap-2 font-mono text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
            <TrendingUp className="h-4 w-4" />
            LEND
          </TabsTrigger>
          <TabsTrigger value="borrow" className="gap-2 font-mono text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
            <TrendingDown className="h-4 w-4" />
            BORROW
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend">
          {/* Lend Summary - Terminal Style */}
          <Card className="mb-4 overflow-hidden bg-slate/80 border-accent/20 backdrop-blur-xl">
            <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-5 border-b border-accent/10">
              <p className="text-xs text-platinum/60 font-mono uppercase tracking-widest">7_DAY_CREDIT_CYCLE</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-accent font-display">3%</span>
                <span className="text-sm text-platinum/60 font-mono">VARIABLE_RETURN</span>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-platinum/50 font-mono">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3 text-accent" />
                  1% ENTRY
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-accent" />
                  168h LOCK
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-accent" />
                  NON-GUARANTEED
                </span>
              </div>
            </div>
          </Card>

          {/* Marketplace Offers */}
          <h3 className="text-xs font-mono text-platinum/50 uppercase tracking-widest mb-3">
            CREDIT_MARKETPLACE
          </h3>
          
          {lendOffers.map(offer => (
            <Card key={offer.id} className="mb-3 bg-slate/60 border-platinum/10 hover:border-accent/30 transition-all duration-150">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-platinum font-mono">₳{formatAlpha(offer.amount)}</p>
                      <p className="text-xs text-platinum/50 font-mono">
                        {offer.rate}% • {offer.term}d
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={offer.status === 'matched' ? 'default' : 'outline'} 
                    className={`font-mono text-[10px] ${offer.status === 'matched' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'border-platinum/20 text-platinum/60'}`}
                  >
                    {offer.status === 'matched' ? 'MATCHED' : 'AVAILABLE'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            className="w-full mt-4 bg-accent hover:bg-accent/90 text-obsidian font-mono font-bold active:scale-95 transition-all duration-150" 
            disabled={!qualificationMet} 
            onClick={() => handleLendClick(1000)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            POST_LENDING_OFFER
          </Button>
          
          {!qualificationMet && (
            <p className="text-xs text-center text-platinum/40 mt-2 font-mono">
              Complete qualification to unlock lending
            </p>
          )}
        </TabsContent>

        <TabsContent value="borrow">
          {/* Borrower Stats */}
          <Card className="mb-4 bg-slate/60 border-platinum/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-platinum/50 font-mono">CREDIT_LIMIT</span>
                <span className="font-bold text-platinum font-mono">₳{formatAlpha(borrowerStats.debtLimit)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-platinum/50 font-mono">CURRENT_DEBT</span>
                <span className="font-bold text-accent font-mono">₳{formatAlpha(borrowerStats.currentDebt)}</span>
              </div>
              <Progress value={0} className="h-1.5 bg-obsidian/50" />
              <p className="text-xs text-platinum/40 mt-2 font-mono">
                Limit based on VPA mission history
              </p>
            </CardContent>
          </Card>

          {/* Available Loans */}
          <h3 className="text-xs font-mono text-platinum/50 uppercase tracking-widest mb-3">
            AVAILABLE_CREDIT_OFFERS
          </h3>
          
          {lendOffers.filter(o => o.status === 'pending').map(offer => (
            <Card key={offer.id} className="mb-3 bg-slate/60 border-platinum/10 hover:border-accent/30 transition-all duration-150">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-platinum font-mono">₳{formatAlpha(offer.amount)}</p>
                    <p className="text-xs text-platinum/50 font-mono">
                      Total: ₳{formatAlpha(Math.round(offer.amount * 1.03))}
                    </p>
                    <p className="text-xs text-platinum/40 font-mono">
                      + ₳10 origination + 1% fee
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={!qualificationMet} 
                    onClick={() => handleBorrowClick(offer.amount)}
                    className="font-mono text-xs border-accent/30 text-accent hover:bg-accent/10 active:scale-95 transition-all duration-150"
                  >
                    ACCEPT
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
          <h3 className="text-xs font-mono text-platinum/50 uppercase tracking-widest mb-3">
            MY_ACTIVE_CREDITS
          </h3>
          
          {activeLoans.map(loan => (
            <div key={loan.id} className="space-y-3 mb-4">
              <Card className="bg-slate/60 border-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">LENDING</Badge>
                      <span className="text-sm text-platinum/50 font-mono">
                        → {loan.borrower}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-platinum font-mono">₳{formatAlpha(loan.amount)}</span>
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
