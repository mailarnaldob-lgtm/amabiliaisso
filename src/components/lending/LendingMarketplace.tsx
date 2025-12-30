import { useState, useEffect } from 'react';
import { TrendingUp, Shield, AlertTriangle, Plus, Wallet, Loader2, Clock, CheckCircle } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useWallets } from '@/hooks/useWallets';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Loan {
  id: string;
  lender_id: string;
  borrower_id: string | null;
  principal_amount: number;
  interest_rate: number;
  interest_amount: number | null;
  total_repayment: number | null;
  term_days: number;
  status: string;
  created_at: string;
  accepted_at: string | null;
  due_at: string | null;
}

interface LoanOfferCardProps {
  offer: Loan;
  onTakeOffer: (offer: Loan) => void;
  isLoading: boolean;
}

function LoanOfferCard({ offer, onTakeOffer, isLoading }: LoanOfferCardProps) {
  const interest = offer.principal_amount * (offer.interest_rate / 100);
  const totalRepayment = offer.principal_amount + interest;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg">🐂</span>
          </div>
          <div>
            <p className="font-medium text-foreground">Verified Lender</p>
            <p className="text-xs text-muted-foreground">Elite Member</p>
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
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        🐻 Take This Offer
      </Button>
    </div>
  );
}

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSuccess: () => void;
}

function CreateOfferModal({ isOpen, onClose, walletBalance, onSuccess }: CreateOfferModalProps) {
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
    
    try {
      const { data, error } = await supabase.functions.invoke('lending-post-offer', {
        body: { principal_amount: numericAmount }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast.success('Loan offer posted! Your ₳ is now in escrow.');
      setAmount('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post offer');
    } finally {
      setIsSubmitting(false);
    }
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
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
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

// My Loans Section Component
interface MyLoansSectionProps {
  userId: string;
  onRefresh: () => void;
}

function MyLoansSection({ userId, onRefresh }: MyLoansSectionProps) {
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [repaymentModal, setRepaymentModal] = useState<{ isOpen: boolean; loan: Loan | null }>({ isOpen: false, loan: null });

  const fetchMyLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyLoans(data || []);
    } catch (err) {
      console.error('Failed to fetch my loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyLoans();
    }
  }, [userId]);

  const borrowerLoans = myLoans.filter((l) => l.borrower_id === userId && l.status === 'active');
  const lenderLoans = myLoans.filter((l) => l.lender_id === userId);

  const getDaysRemaining = (dueAt: string | null) => {
    if (!dueAt) return 0;
    const due = new Date(dueAt);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleRepayment = (loan: Loan) => {
    setRepaymentModal({ isOpen: true, loan });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* As Borrower */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span>🐻</span> As Borrower
        </h3>
        {borrowerLoans.length > 0 ? (
          borrowerLoans.map((loan) => (
            <div key={loan.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-warning text-warning">
                  <Clock className="w-3 h-3 mr-1" />
                  {getDaysRemaining(loan.due_at)} days left
                </Badge>
                <Badge className="bg-destructive/20 text-destructive">Active Loan</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-lg bg-secondary/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Borrowed</p>
                  <p className="font-bold text-foreground">₳{formatAlpha(loan.principal_amount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Due</p>
                  <p className="font-bold text-destructive">₳{formatAlpha(loan.total_repayment || 0)}</p>
                </div>
              </div>

              <Button
                onClick={() => handleRepayment(loan)}
                disabled={repayingLoanId === loan.id}
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
              >
                {repayingLoanId === loan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Repay Now
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">No active loans as borrower</p>
          </div>
        )}
      </div>

      {/* As Lender */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span>🐂</span> As Lender
        </h3>
        {lenderLoans.length > 0 ? (
          lenderLoans.map((loan) => (
            <div key={loan.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn(
                  loan.status === 'pending' ? 'border-alpha text-alpha' : 'border-success text-success'
                )}>
                  {loan.status === 'pending' ? 'Awaiting Borrower' : 'Active'}
                </Badge>
                {loan.status === 'active' && loan.due_at && (
                  <span className="text-xs text-muted-foreground">
                    Due in {getDaysRemaining(loan.due_at)} days
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-3 px-4 rounded-lg bg-secondary/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Principal</p>
                  <p className="font-bold text-foreground">₳{formatAlpha(loan.principal_amount)}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs text-muted-foreground mb-1">Interest</p>
                  <p className="font-bold text-alpha">{loan.interest_rate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Return</p>
                  <p className="font-bold text-success">
                    ₳{formatAlpha((loan.total_repayment || loan.principal_amount * 1.03) - (loan.principal_amount * 0.008))}
                  </p>
                </div>
              </div>

              {loan.status === 'pending' && (
                <p className="text-xs text-muted-foreground text-center">
                  Your ₳ is in escrow waiting for a borrower
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">No lending offers posted</p>
          </div>
        )}
      </div>

      <RepaymentModal
        isOpen={repaymentModal.isOpen}
        onClose={() => setRepaymentModal({ isOpen: false, loan: null })}
        loan={repaymentModal.loan}
        onSuccess={() => {
          fetchMyLoans();
          onRefresh();
          setRepaymentModal({ isOpen: false, loan: null });
        }}
      />
    </div>
  );
}

// Repayment Modal Component
interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: () => void;
}

function RepaymentModal({ isOpen, onClose, loan, onSuccess }: RepaymentModalProps) {
  const [useAutoDeduct, setUseAutoDeduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: wallets } = useWallets();

  if (!loan) return null;

  const mainWallet = wallets?.find((w) => w.wallet_type === 'main');
  const taskWallet = wallets?.find((w) => w.wallet_type === 'task');
  const royaltyWallet = wallets?.find((w) => w.wallet_type === 'royalty');
  
  const totalBalance = (mainWallet?.balance || 0) + (taskWallet?.balance || 0) + (royaltyWallet?.balance || 0);
  const repaymentAmount = loan.total_repayment || 0;
  const hasEnoughBalance = useAutoDeduct ? totalBalance >= repaymentAmount : (mainWallet?.balance || 0) >= repaymentAmount;

  const handleRepay = async () => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('lending-repayment', {
        body: { loanId: loan.id, useAutoDeduct }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(`Loan repaid successfully! ₳${formatAlpha(repaymentAmount)} has been settled.`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process repayment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Repay Loan
          </DialogTitle>
          <DialogDescription>
            Settle your loan and clear your debt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Repayment</span>
              <span className="text-xl font-bold text-destructive">₳{formatAlpha(repaymentAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Your Wallets</p>
            <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Task Wallet</span>
                <span className="font-medium">₳{formatAlpha(taskWallet?.balance || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Royalty Wallet</span>
                <span className="font-medium">₳{formatAlpha(royaltyWallet?.balance || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Main Wallet</span>
                <span className="font-medium">₳{formatAlpha(mainWallet?.balance || 0)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="text-foreground font-medium">Total Available</span>
                <span className="font-bold text-success">₳{formatAlpha(totalBalance)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div className="space-y-0.5">
              <Label htmlFor="auto-deduct" className="text-sm font-medium">Auto-Deduct</Label>
              <p className="text-xs text-muted-foreground">
                Deduct from Task → Royalty → Main
              </p>
            </div>
            <Switch
              id="auto-deduct"
              checked={useAutoDeduct}
              onCheckedChange={setUseAutoDeduct}
            />
          </div>

          {!useAutoDeduct && (mainWallet?.balance || 0) < repaymentAmount && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Insufficient Main Wallet balance. Enable Auto-Deduct to use funds from all wallets.
              </p>
            </div>
          )}

          <Button
            onClick={handleRepay}
            disabled={isSubmitting || !hasEnoughBalance}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Repayment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LendingMarketplace() {
  const { isKycVerified, membershipTier } = useAppStore();
  const { data: wallets } = useWallets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [offers, setOffers] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takingOfferId, setTakingOfferId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const mainWallet = wallets?.find((w) => w.wallet_type === 'main');
  const canAccess = membershipTier === 'elite' && isKycVerified;

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'pending')
        .neq('lender_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess && user) {
      fetchOffers();
    }
  }, [canAccess, user]);

  const handleTakeOffer = async (offer: Loan) => {
    if (!canAccess) {
      toast.error('Elite membership and KYC verification required');
      return;
    }

    setTakingOfferId(offer.id);

    try {
      const { data, error } = await supabase.functions.invoke('lending-take-offer', {
        body: { loan_id: offer.id }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const interest = offer.principal_amount * (offer.interest_rate / 100);
      const totalRepayment = offer.principal_amount + interest;
      
      toast.success(`Loan of ₳${formatAlpha(offer.principal_amount)} received! Repay ₳${formatAlpha(totalRepayment)} in ${offer.term_days} days.`);
      
      // Refresh offers and wallets
      fetchOffers();
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to take offer');
    } finally {
      setTakingOfferId(null);
    }
  };

  const handleOfferCreated = () => {
    fetchOffers();
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
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
              ₳{formatAlpha(offers.reduce((sum, o) => sum + o.principal_amount, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Liquidity</p>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <Tabs defaultValue="bear" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="bear" className="gap-2">
            <span>🐻</span> Borrow
          </TabsTrigger>
          <TabsTrigger value="bull" className="gap-2">
            <span>🐂</span> Lend
          </TabsTrigger>
          <TabsTrigger value="myloans" className="gap-2">
            <Clock className="w-4 h-4" /> My Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bear" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Browse available loan offers and get instant ₳ liquidity.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <LoanOfferCard 
                key={offer.id} 
                offer={offer} 
                onTakeOffer={handleTakeOffer}
                isLoading={takingOfferId === offer.id}
              />
            ))
          ) : (
            <div className="p-6 rounded-xl border-2 border-dashed border-border text-center">
              <p className="text-muted-foreground">No loan offers available at the moment.</p>
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

          <div className="p-6 rounded-xl border-2 border-dashed border-border text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Post your first offer to start earning!
            </p>
          </div>
        </TabsContent>

        <TabsContent value="myloans" className="space-y-4 mt-4">
          <MyLoansSection userId={user?.id || ''} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['wallets'] })} />
        </TabsContent>
      </Tabs>

      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        walletBalance={mainWallet?.balance || 0}
        onSuccess={handleOfferCreated}
      />
    </div>
  );
}
