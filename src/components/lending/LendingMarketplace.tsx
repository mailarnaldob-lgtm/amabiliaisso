import { useState } from 'react';
import { Clock, TrendingUp, Shield, AlertTriangle, Plus, Wallet, X, Loader2, CreditCard } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useWallets } from '@/hooks/useWallets';
import { useAuth } from '@/contexts/AuthContext';
import {
  useLoanOffers,
  useMyLoanOffers,
  useMyActiveLoans,
  usePostLoanOffer,
  useTakeLoanOffer,
  useCancelLoanOffer,
  useRepayLoan,
  LoanOffer,
} from '@/hooks/useLending';

interface LoanOfferCardProps {
  offer: LoanOffer;
  onTakeOffer: (offer: LoanOffer) => void;
  isLoading: boolean;
}

function LoanOfferCard({ offer, onTakeOffer, isLoading }: LoanOfferCardProps) {
  const interest = offer.principal_amount * (offer.interest_rate / 100);
  const totalRepayment = offer.principal_amount + interest;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + offer.term_days);

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg">🐂</span>
          </div>
          <div>
            <p className="font-medium text-foreground">{offer.lender_name || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">Verified Lender</p>
          </div>
        </div>
        <Badge variant="outline" className="border-success text-success">
          Available
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 py-3 px-4 rounded-lg bg-secondary/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Principal</p>
          <p className="font-bold text-foreground">₳{formatAlpha(offer.principal_amount)}</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-muted-foreground mb-1">Interest</p>
          <p className="font-bold text-alpha">{offer.interest_rate}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Term</p>
          <p className="font-bold text-foreground">{offer.term_days} Days</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-alpha/10 border border-alpha/20">
        <span className="text-sm text-muted-foreground">Total Repayment</span>
        <span className="font-bold text-alpha">₳{formatAlpha(totalRepayment)}</span>
      </div>

      <Button
        onClick={() => onTakeOffer(offer)}
        disabled={isLoading}
        className="w-full alpha-gradient text-alpha-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          '🐻 Take This Offer'
        )}
      </Button>
    </div>
  );
}

interface MyOfferCardProps {
  offer: LoanOffer;
  onCancel: (offer: LoanOffer) => void;
  isLoading: boolean;
}

function MyOfferCard({ offer, onCancel, isLoading }: MyOfferCardProps) {
  const isActive = offer.status === 'active';

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">₳{formatAlpha(offer.principal_amount)}</p>
          <p className="text-xs text-muted-foreground">
            {isActive ? `Due: ${new Date(offer.due_at!).toLocaleDateString()}` : 'Awaiting borrower'}
          </p>
        </div>
        <Badge variant={isActive ? 'default' : 'outline'}>
          {isActive ? 'Active' : 'Pending'}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Expected Return</span>
        <span className="text-success font-medium">₳{formatAlpha(offer.total_repayment || 0)}</span>
      </div>

      {!isActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(offer)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel Offer
            </>
          )}
        </Button>
      )}
    </div>
  );
}

interface ActiveLoanCardProps {
  loan: LoanOffer;
  onRepay: (loan: LoanOffer) => void;
  isLoading: boolean;
  walletBalance: number;
}

function ActiveLoanCard({ loan, onRepay, isLoading, walletBalance }: ActiveLoanCardProps) {
  const dueDate = loan.due_at ? new Date(loan.due_at) : null;
  const now = new Date();
  const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isOverdue = daysRemaining < 0;
  const repaymentAmount = loan.total_repayment || (loan.principal_amount + (loan.interest_amount || 0));
  const canRepay = walletBalance >= repaymentAmount;

  return (
    <div className={cn(
      "glass-card rounded-xl p-4 space-y-4",
      isOverdue && "border-2 border-destructive"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="font-medium text-foreground">Active Loan</p>
            <p className="text-xs text-muted-foreground">From: {loan.lender_name || 'Anonymous'}</p>
          </div>
        </div>
        <Badge variant={isOverdue ? 'destructive' : 'outline'} className={isOverdue ? '' : 'border-warning text-warning'}>
          {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 py-3 px-4 rounded-lg bg-secondary/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Principal</p>
          <p className="font-bold text-foreground">₳{formatAlpha(loan.principal_amount)}</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-muted-foreground mb-1">Interest</p>
          <p className="font-bold text-alpha">₳{formatAlpha(loan.interest_amount || 0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Due Date</p>
          <p className="font-bold text-foreground">
            {dueDate?.toLocaleDateString() || 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <span className="text-sm text-muted-foreground">Total Repayment</span>
        <span className="font-bold text-destructive">₳{formatAlpha(repaymentAmount)}</span>
      </div>

      {!canRepay && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Insufficient balance. You need ₳{formatAlpha(repaymentAmount)} to repay this loan.
          </p>
        </div>
      )}

      <Button
        onClick={() => onRepay(loan)}
        disabled={isLoading || !canRepay}
        className="w-full bg-success hover:bg-success/90 text-success-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Repayment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Repay Loan
          </>
        )}
      </Button>
    </div>
  );
}

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
}

function CreateOfferModal({ isOpen, onClose, walletBalance }: CreateOfferModalProps) {
  const [amount, setAmount] = useState('');
  const postOffer = usePostLoanOffer();

  const numericAmount = parseFloat(amount) || 0;
  const interest = numericAmount * 0.03;
  const fee = numericAmount * 0.008;
  const totalRequired = numericAmount + fee;

  const handleSubmit = async () => {
    if (numericAmount < 100) {
      return;
    }
    if (totalRequired > walletBalance) {
      return;
    }

    await postOffer.mutateAsync({ principal_amount: numericAmount });
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🐂</span> Post a Lending Offer
          </DialogTitle>
          <DialogDescription>
            Your ₳ will be locked in Smart Escrow until taken or cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-secondary flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="font-bold">₳{formatAlpha(walletBalance)}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lending Amount (min ₳100)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg alpha-text">₳</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-xl font-bold"
                min="100"
                max="100000"
              />
            </div>
            {numericAmount > 0 && numericAmount < 100 && (
              <p className="text-xs text-destructive">Minimum amount is ₳100</p>
            )}
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-secondary/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate</span>
              <span className="text-alpha font-medium">3% fixed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Term</span>
              <span className="text-foreground">7 Days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="text-warning">0.8% (₳{formatAlpha(fee)})</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Required</span>
              <span className="text-foreground font-medium">₳{formatAlpha(totalRequired)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expected Return</span>
              <span className="text-success font-bold">₳{formatAlpha(numericAmount + interest)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              In case of default, the system will activate the Recovery Stack to protect your capital.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={postOffer.isPending || numericAmount < 100 || totalRequired > walletBalance}
            className="w-full alpha-gradient text-alpha-foreground"
          >
            {postOffer.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Post Offer & Lock ₳'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LendingMarketplace() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: wallets } = useWallets();
  const { data: loanOffers, isLoading: offersLoading } = useLoanOffers();
  const { data: myOffers, isLoading: myOffersLoading } = useMyLoanOffers();
  const { data: myActiveLoans, isLoading: activeLoansLoading } = useMyActiveLoans();
  const takeLoan = useTakeLoanOffer();
  const cancelOffer = useCancelLoanOffer();
  const repayLoan = useRepayLoan();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [processingLoanId, setProcessingLoanId] = useState<string | null>(null);

  const mainWallet = wallets?.find((w) => w.wallet_type === 'main');
  const canAccess = profile?.membership_tier === 'elite' && profile?.is_kyc_verified;

  const handleTakeOffer = async (offer: LoanOffer) => {
    if (!canAccess) return;
    setProcessingLoanId(offer.id);
    try {
      await takeLoan.mutateAsync({ loan_id: offer.id });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleCancelOffer = async (offer: LoanOffer) => {
    setProcessingLoanId(offer.id);
    try {
      await cancelOffer.mutateAsync({ loan_id: offer.id });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleRepayLoan = async (loan: LoanOffer) => {
    setProcessingLoanId(loan.id);
    try {
      await repayLoan.mutateAsync({ loan_id: loan.id });
    } finally {
      setProcessingLoanId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please sign in to access the lending marketplace.</p>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Elite Access Required</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          The P2P Lending Marketplace is exclusively available to Elite members with verified KYC.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant={profile?.membership_tier === 'elite' ? 'default' : 'outline'}>
              {profile?.membership_tier === 'elite' ? '✓' : '○'} Elite Membership
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={profile?.is_kyc_verified ? 'default' : 'outline'}>
              {profile?.is_kyc_verified ? '✓' : '○'} KYC Verified
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  const totalLiquidity = (loanOffers || []).reduce((sum, o) => sum + o.principal_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground">Lending Marketplace</h2>
          <Badge className="bg-success text-success-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            3% APR
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-2xl font-bold text-foreground">{loanOffers?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Active Offers</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-2xl font-bold alpha-text">
              ₳{formatAlpha(totalLiquidity)}
            </p>
            <p className="text-xs text-muted-foreground">Total Liquidity</p>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <Tabs defaultValue="bear" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="bear" className="flex-1 gap-2">
            <span>🐻</span> Borrow
          </TabsTrigger>
          <TabsTrigger value="bull" className="flex-1 gap-2">
            <span>🐂</span> Lend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bear" className="space-y-4 mt-4">
          {/* My Active Loans (Borrower) */}
          {myActiveLoans && myActiveLoans.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Your Active Loans
              </h3>
              {myActiveLoans.map((loan) => (
                <ActiveLoanCard
                  key={loan.id}
                  loan={loan}
                  onRepay={handleRepayLoan}
                  isLoading={processingLoanId === loan.id}
                  walletBalance={mainWallet?.balance || 0}
                />
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Browse available loan offers and get instant ₳ liquidity.
          </p>

          {offersLoading || activeLoansLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : loanOffers && loanOffers.length > 0 ? (
            loanOffers.map((offer) => (
              <LoanOfferCard
                key={offer.id}
                offer={offer}
                onTakeOffer={handleTakeOffer}
                isLoading={processingLoanId === offer.id}
              />
            ))
          ) : (
            <div className="p-6 rounded-xl border-2 border-dashed border-border text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No loan offers available right now. Check back later!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bull" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Earn 3% interest by lending your ₳ to verified borrowers.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="alpha-gradient text-alpha-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post Offer
            </Button>
          </div>

          {/* My Active Offers */}
          {myOffersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : myOffers && myOffers.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Your Active Offers</h3>
              {myOffers.map((offer) => (
                <MyOfferCard
                  key={offer.id}
                  offer={offer}
                  onCancel={handleCancelOffer}
                  isLoading={processingLoanId === offer.id}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border-2 border-dashed border-border text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No active lending offers yet. Post your first offer to start earning!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        walletBalance={mainWallet?.balance || 0}
      />
    </div>
  );
}
