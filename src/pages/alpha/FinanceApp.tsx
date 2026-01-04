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
  Calendar
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';

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
    daysRemaining: 5,
    totalDays: 7,
    borrower: 'User_X',
    expectedReturn: 1030,
  },
];

export default function FinanceApp() {
  return (
    <AlphaLayout 
      title="₳LPHA FINANCE" 
      subtitle="P2P Smart Credit"
      appColor="from-blue-500 to-indigo-600"
    >
      {/* Demo Notice */}
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">UI MOCKUP - For demonstration purposes only</span>
        </div>
      </div>

      {/* Qualification Check Banner */}
      <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Qualification Required</p>
              <p className="text-xs text-muted-foreground">
                Invite 3 active participants to unlock lending features
              </p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600">
              0/3
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
                <span className="text-sm opacity-80">Return Rate</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs opacity-80">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  1% Entry Fee
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  7-Day Term
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
            disabled
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Post Lending Offer
          </Button>
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
                Limit based on activity history
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
                      Total repayment: ₳{formatAlpha(offer.amount * 1.03)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Active Loans */}
      {demoActiveLoans.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            My Active Credits
          </h3>
          
          {demoActiveLoans.map((loan) => (
            <Card key={loan.id} className="mb-3 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">Lending</Badge>
                    <span className="text-sm text-muted-foreground">
                      to {loan.borrower}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {loan.daysRemaining}d left
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">₳{formatAlpha(loan.amount)}</span>
                  <span className="text-emerald-500 font-medium">
                    +₳{formatAlpha(loan.expectedReturn - loan.amount)}
                  </span>
                </div>
                <Progress value={((loan.totalDays - loan.daysRemaining) / loan.totalDays) * 100} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Debtor Warning (Hidden by default) */}
      <Card className="mt-6 border-destructive bg-destructive/5 hidden">
        <CardContent className="p-4">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
            <p className="font-bold text-destructive">ACCOUNT LOCKED: DEBTOR STATUS</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete Rescue Missions to restore access
            </p>
            <Button variant="destructive" className="mt-4" disabled>
              View Rescue Missions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          P2P Smart Credit is an internal credit allocation system. 
          All rates and terms are admin-controlled. 
          Credits are non-monetary platform units only.
        </p>
      </div>
    </AlphaLayout>
  );
}
