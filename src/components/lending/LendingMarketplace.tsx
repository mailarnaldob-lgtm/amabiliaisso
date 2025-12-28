import { useState } from 'react';
import { Clock, TrendingUp, Shield, AlertTriangle, Plus, Wallet } from 'lucide-react';
import { cn, formatAlpha, formatCountdown } from '@/lib/utils';
import { useAppStore, LoanOffer, MOCK_LOAN_OFFERS } from '@/stores/appStore';
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
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoanOfferCardProps {
  offer: LoanOffer;
  onTakeOffer: (offer: LoanOffer) => void;
}

function LoanOfferCard({ offer, onTakeOffer }: LoanOfferCardProps) {
  const interest = offer.principal * (offer.interestRate / 100);
  const totalRepayment = offer.principal + interest;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + offer.termDays);

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg">🐂</span>
          </div>
          <div>
            <p className="font-medium text-foreground">{offer.lenderName}</p>
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
          <p className="font-bold text-foreground">₳{formatAlpha(offer.principal)}</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-muted-foreground mb-1">Interest</p>
          <p className="font-bold text-alpha">{offer.interestRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Term</p>
          <p className="font-bold text-foreground">{offer.termDays} Days</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-alpha/10 border border-alpha/20">
        <span className="text-sm text-muted-foreground">Total Repayment</span>
        <span className="font-bold text-alpha">₳{formatAlpha(totalRepayment)}</span>
      </div>

      <Button
        onClick={() => onTakeOffer(offer)}
        className="w-full alpha-gradient text-alpha-foreground"
      >
        🐻 Take This Offer
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const interest = numericAmount * 0.03;
  const fee = numericAmount * 0.008;

  const handleSubmit = async () => {
    if (numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numericAmount > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success('Loan offer posted! Your ₳ is now in escrow.');
    setAmount('');
    setIsSubmitting(false);
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
            <label className="text-sm font-medium">Lending Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg alpha-text">₳</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-xl font-bold"
              />
            </div>
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
              <span className="text-warning">0.8%</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expected Return</span>
              <span className="text-success font-bold">₳{formatAlpha(numericAmount + interest - fee)}</span>
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
            disabled={isSubmitting || numericAmount <= 0}
            className="w-full alpha-gradient text-alpha-foreground"
          >
            {isSubmitting ? 'Processing...' : 'Post Offer & Lock ₳'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LendingMarketplace() {
  const { wallets, isKycVerified, membershipTier } = useAppStore();
  const [offers, setOffers] = useState<LoanOffer[]>(MOCK_LOAN_OFFERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null);

  const mainWallet = wallets.find((w) => w.type === 'main');
  const canAccess = membershipTier === 'elite' && isKycVerified;

  const handleTakeOffer = (offer: LoanOffer) => {
    if (!canAccess) {
      toast.error('Elite membership and KYC verification required');
      return;
    }
    
    const interest = offer.principal * (offer.interestRate / 100);
    const totalRepayment = offer.principal + interest;
    
    toast.success(`Loan of ₳${formatAlpha(offer.principal)} received! Repay ₳${formatAlpha(totalRepayment)} in 7 days.`);
    
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
  };

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
            <Badge variant={membershipTier === 'elite' ? 'default' : 'outline'}>
              {membershipTier === 'elite' ? '✓' : '○'} Elite Membership
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isKycVerified ? 'default' : 'outline'}>
              {isKycVerified ? '✓' : '○'} KYC Verified
            </Badge>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-2xl font-bold text-foreground">{offers.length}</p>
            <p className="text-xs text-muted-foreground">Active Offers</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-2xl font-bold alpha-text">
              ₳{formatAlpha(offers.reduce((sum, o) => sum + o.principal, 0))}
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
          <p className="text-sm text-muted-foreground">
            Browse available loan offers and get instant ₳ liquidity.
          </p>
          {offers.map((offer) => (
            <LoanOfferCard key={offer.id} offer={offer} onTakeOffer={handleTakeOffer} />
          ))}
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

          <div className="p-6 rounded-xl border-2 border-dashed border-border text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No active lending offers yet. Post your first offer to start earning!
            </p>
          </div>
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
