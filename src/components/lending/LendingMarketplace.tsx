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

// My Loans Section Component - uses edge functions, not direct queries
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
      // TODO: Replace with MySQL edge function when mysql-user-loans is implemented
      // For now, return empty array
      setMyLoans([]);
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
              <div className="border-t border-border mt-2 pt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-foreground">Total Available</span>
                  <span className="text-foreground">₳{formatAlpha(totalBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 rounded-lg bg-alpha/10 border border-alpha/20">
            <Switch
              id="auto-deduct"
              checked={useAutoDeduct}
              onCheckedChange={setUseAutoDeduct}
            />
            <Label htmlFor="auto-deduct" className="text-sm cursor-pointer">
              Auto-Deduct from all wallets (Task → Royalty → Main)
            </Label>
          </div>

          {!hasEnoughBalance && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Insufficient balance. Complete more tasks or transfer funds to repay this loan.
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
  const { user } = useAuth();
  const { data: wallets } = useWallets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takingOfferId, setTakingOfferId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('marketplace');

  const mainWallet = wallets?.find((w) => w.wallet_type === 'main');

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with MySQL edge function when mysql-lending-offers is implemented
      // For now, return empty array
      setAvailableOffers([]);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  const handleTakeOffer = async (offer: Loan) => {
    if (!user) {
      toast.error('Please log in to take an offer');
      return;
    }

    setTakingOfferId(offer.id);

    try {
      const { data, error } = await supabase.functions.invoke('lending-take-offer', {
        body: { offerId: offer.id }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Offer taken! The loan is now active.');
      fetchOffers();
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to take offer');
    } finally {
      setTakingOfferId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full alpha-gradient flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-alpha-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">P2P Lending</h2>
            <p className="text-xs text-muted-foreground">Secured by Smart Escrow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-success text-success gap-1">
            <Shield className="w-3 h-3" />
            Secure
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-loans">My Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-4 space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Available Offers</p>
              <p className="font-bold text-lg text-foreground">{availableOffers.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-alpha/10">
              <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
              <p className="font-bold text-lg text-alpha">₳{formatAlpha(mainWallet?.balance || 0)}</p>
            </div>
          </div>

          {/* Create Offer Button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full alpha-gradient text-alpha-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            🐂 Post a Lending Offer
          </Button>

          {/* Available Offers */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Available Offers</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : availableOffers.length > 0 ? (
              availableOffers.map((offer) => (
                <LoanOfferCard
                  key={offer.id}
                  offer={offer}
                  onTakeOffer={handleTakeOffer}
                  isLoading={takingOfferId === offer.id}
                />
              ))
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No offers available right now</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to post a lending offer!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-loans" className="mt-4">
          {user ? (
            <MyLoansSection userId={user.id} onRefresh={fetchOffers} />
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Please log in to view your loans</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        walletBalance={mainWallet?.balance || 0}
        onSuccess={fetchOffers}
      />
    </div>
  );
}
