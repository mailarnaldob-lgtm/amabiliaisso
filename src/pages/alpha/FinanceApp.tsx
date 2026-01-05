import { useState } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Shield,
  AlertTriangle,
  Users,
  Percent,
  Calendar,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { RiskDisclosureModal } from '@/components/alpha/RiskDisclosureModal';
import { LoanCountdownTimer } from '@/components/alpha/LoanCountdownTimer';
import { CircuitBreakerIndicator } from '@/components/alpha/CircuitBreakerIndicator';
import { DebtorRescuePanel } from '@/components/alpha/DebtorRescuePanel';

// Demo loan marketplace data
const lendOffers = [
  { id: 1, amount: 1000, rate: 3, term: 7, status: 'pending', lender: 'User_A' },
  { id: 2, amount: 2500, rate: 3, term: 7, status: 'pending', lender: 'User_B' },
  { id: 3, amount: 500, rate: 3, term: 7, status: 'matched', lender: 'User_C' },
];

const borrowerStats = {
  debtLimit: 5000,
  currentDebt: 0,
  isDebtor: false,
};

const demoActiveLoans = [
  {
    id: 1,
    type: 'lend',
    amount: 1000,
    rate: 3,
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    borrower: 'User_X',
    expectedReturn: 1030,
    status: 'active' as const,
  },
];

// Demo rescue missions for debtor view
const demoRescueMissions = [
  {
    id: '1',
    title: 'Extended Survey Campaign',
    description: 'Complete 10 detailed user research surveys',
    reward: 500,
    difficulty: 'Hard' as const,
    timeLimit: '48 hours',
    status: 'in_progress' as const,
    progress: 40,
  },
  {
    id: '2',
    title: 'Community Outreach Marathon',
    description: 'Onboard and verify 5 new platform participants',
    reward: 1000,
    difficulty: 'Extreme' as const,
    timeLimit: '7 days',
    status: 'available' as const,
  },
];

export default function FinanceApp() {
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'lend' | 'borrow'; amount: number } | null>(null);
  const [showDebtorView, setShowDebtorView] = useState(false);
  
  // Demo qualification status
  const qualificationMet = false;
  const referralCount = 1;

  const handleLendClick = (amount: number) => {
    setPendingAction({ type: 'lend', amount });
    setRiskModalOpen(true);
  };

  const handleBorrowClick = (amount: number) => {
    setPendingAction({ type: 'borrow', amount });
    setRiskModalOpen(true);
  };

  const handleRiskAccepted = () => {
    // Demo: Would proceed with the action
    console.log('Risk accepted for:', pendingAction);
    setPendingAction(null);
  };

  // Toggle for demo purposes to show debtor view
  if (showDebtorView) {
    return (
      <AlphaLayout 
        title="₳LPHA FINANCE" 
        subtitle="P2P Smart Credit"
        appColor="from-blue-500 to-indigo-600"
      >
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowDebtorView(false)}>
            Exit Demo View
          </Button>
        </div>
        <DebtorRescuePanel
          totalDebt={5300}
          earnedTowardsDebt={2385}
          daysOverdue={3}
          missions={demoRescueMissions}
        />
      </AlphaLayout>
    );
  }

  return (
    <AlphaLayout 
      title="₳LPHA FINANCE" 
      subtitle="P2P Smart Credit"
      appColor="from-blue-500 to-indigo-600"
    >
      {/* Demo Notice */}
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">UI MOCKUP - For demonstration purposes only</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setShowDebtorView(true)}>
            Demo: Debtor View
          </Button>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      <CircuitBreakerIndicator reserveRatio={115} />

      {/* Qualification Check Banner */}
      <Card className={`my-4 ${qualificationMet ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${qualificationMet ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              {qualificationMet ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Shield className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {qualificationMet ? 'Qualified for P2P Credit' : 'Qualification Required'}
              </p>
              <p className="text-xs text-muted-foreground">
                {qualificationMet 
                  ? 'You meet the requirements for lending and borrowing'
                  : 'Invite 3 active participants to unlock lending features'
                }
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={qualificationMet ? 'border-emerald-500/30 text-emerald-600' : 'border-amber-500/30 text-amber-600'}
            >
              {referralCount}/3
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Lend/Borrow */}
      <Tabs defaultValue="lend" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="lend" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Lend Credits
          </TabsTrigger>
          <TabsTrigger value="borrow" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Borrow Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend">
          {/* Lend Summary */}
          <Card className="mb-4 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white">
              <p className="text-sm opacity-80">7-Day Credit Cycle</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold">3%</span>
                <span className="text-sm opacity-80">Variable Return</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs opacity-80">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  1% Entry Fee
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  168h Lock
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Non-guaranteed
                </span>
              </div>
            </div>
          </Card>

          {/* Marketplace Offers */}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Credit Marketplace
          </h3>
          
          {lendOffers.map((offer) => (
            <Card key={offer.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">₳{formatAlpha(offer.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {offer.rate}% • {offer.term} days
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={offer.status === 'matched' ? 'default' : 'outline'}
                    className={offer.status === 'matched' ? 'bg-emerald-500' : ''}
                  >
                    {offer.status === 'matched' ? 'Matched' : 'Available'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 mt-4" 
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
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Credit Limit</span>
                <span className="font-bold">₳{formatAlpha(borrowerStats.debtLimit)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Current Debt</span>
                <span className="font-bold text-foreground">₳{formatAlpha(borrowerStats.currentDebt)}</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Limit based on VPA mission history
              </p>
            </CardContent>
          </Card>

          {/* Available Loans */}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Available Credit Offers
          </h3>
          
          {lendOffers.filter(o => o.status === 'pending').map((offer) => (
            <Card key={offer.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">₳{formatAlpha(offer.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total repayment: ₳{formatAlpha(Math.round(offer.amount * 1.03))}
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
      {demoActiveLoans.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            My Active Credits
          </h3>
          
          {demoActiveLoans.map((loan) => (
            <div key={loan.id} className="space-y-3 mb-4">
              <Card className="border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Lending</Badge>
                      <span className="text-sm text-muted-foreground">
                        to {loan.borrower}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">₳{formatAlpha(loan.amount)}</span>
                      <span className="text-emerald-500 font-medium ml-2">
                        +₳{formatAlpha(loan.expectedReturn - loan.amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <LoanCountdownTimer 
                startDate={loan.startDate} 
                dueDate={loan.dueDate} 
                status={loan.status}
              />
            </div>
          ))}
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          P2P Smart Credit is an internal credit allocation system. 
          All rates are variable and not guaranteed. Credits are non-monetary platform units only.
          Ledger records obligation, not promise. All transactions are immutable.
        </p>
      </div>

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
