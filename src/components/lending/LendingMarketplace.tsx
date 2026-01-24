import { useState, useEffect } from 'react';
import { TrendingUp, Shield, AlertTriangle, Plus, Loader2, Clock, CheckCircle, Lock, Eye } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
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
import { TierGate, useTierAccess } from '@/components/tier';
import { LockedFeature } from '@/components/tier/LockedFeature';

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
  isReadOnly?: boolean;
}

function LoanOfferCard({ offer, onTakeOffer, isLoading, isReadOnly = false }: LoanOfferCardProps) {
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

      {isReadOnly ? (
        <Button
          disabled
          className="w-full bg-muted text-muted-foreground cursor-not-allowed"
        >
          <Lock className="w-4 h-4 mr-2" />
          PRO+ Required to Accept
        </Button>
      ) : (
        <Button
          onClick={() => onTakeOffer(offer)}
          disabled={isLoading}
          className="w-full alpha-gradient text-alpha-foreground"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          🐻 Accept Credit Offer
        </Button>
      )}
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
      
      toast.success('Credit offer posted! Your ₳ is now in escrow.');
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
            <span>🐂</span> Post ALPHA P2P Credit Offer
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
            <label className="text-sm font-medium">Credit Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg alpha-text">₳</span>
              <Input
                type="number"
                placeholder="0"
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
          <span>🐻</span> My Borrowed Credits
        </h3>
        {borrowerLoans.length > 0 ? (
          borrowerLoans.map((loan) => (
            <div key={loan.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-warning text-warning">
                  <Clock className="w-3 h-3 mr-1" />
                  {getDaysRemaining(loan.due_at)} days left
                </Badge>
                <Badge className="bg-destructive/20 text-destructive">Active</Badge>
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
            <p className="text-sm text-muted-foreground">No active credits as borrower</p>
          </div>
        )}
      </div>

      {/* As Lender */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span>🐂</span> My Credit Offers
        </h3>
        {lenderLoans.length > 0 ? (
          lenderLoans.map((loan) => (
            <div key={loan.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn(
                  loan.status === 'pending' ? 'border-alpha text-alpha' : 'border-success text-success'
                )}>
                  {loan.status === 'pending' ? 'Awaiting Taker' : 'Active'}
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
                  Your ₳ is in escrow waiting for a taker
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">No credit offers posted</p>
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
  const { wallets } = useWallets();

  if (!loan) return null;

  const mainWallet = wallets.find((w) => w.wallet_type === 'main');
  const taskWallet = wallets.find((w) => w.wallet_type === 'task');
  const royaltyWallet = wallets.find((w) => w.wallet_type === 'royalty');
  
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

      toast.success(`Repayment successful! ₳${formatAlpha(repaymentAmount)} has been settled.`);
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
            Repay Credit
          </DialogTitle>
          <DialogDescription>
            Settle your credit and clear your balance.
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
                <span className="text-muted-foreground">Activity Wallet</span>
                <span className="font-medium">₳{formatAlpha(taskWallet?.balance || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referral Wallet</span>
                <span className="font-medium">₳{formatAlpha(royaltyWallet?.balance || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Main Wallet</span>
                <span className="font-medium">₳{formatAlpha(mainWallet?.balance || 0)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-foreground">Total Available</span>
                  <span className="text-foreground">₳{formatAlpha(totalBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div className="space-y-0.5">
              <Label htmlFor="auto-deduct" className="text-sm font-medium">Auto-Deduct</Label>
              <p className="text-xs text-muted-foreground">
                Use all wallets (Activity → Referral → Main)
              </p>
            </div>
            <Switch
              id="auto-deduct"
              checked={useAutoDeduct}
              onCheckedChange={setUseAutoDeduct}
            />
          </div>

          {!hasEnoughBalance && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">Insufficient balance for repayment</p>
            </div>
          )}

          <Button
            onClick={handleRepay}
            disabled={isSubmitting || !hasEnoughBalance}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Confirm Repayment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ALPHA P2P Credits Marketplace (formerly LendingMarketplace)
export function AlphaP2PCreditsMarketplace() {
  const { user } = useAuth();
  const { wallets, getBalance } = useWallets();
  const { canAccessPro } = useTierAccess();
  const queryClient = useQueryClient();
  
  const [availableOffers, setAvailableOffers] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takingOfferId, setTakingOfferId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const mainBalance = getBalance('main');
  
  // Read-only mode for non-PRO users - they can VIEW but not INTERACT
  const isReadOnly = !canAccessPro;

  const fetchOffers = async () => {
    try {
      setAvailableOffers([]);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user?.id]);

  const handleTakeOffer = async (offer: Loan) => {
    // Block interactions in read-only mode
    if (isReadOnly) {
      toast.error('Upgrade to PRO to access this feature');
      return;
    }
    
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setTakingOfferId(offer.id);

    try {
      const { data, error } = await supabase.functions.invoke('lending-take-offer', {
        body: { loanId: offer.id }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(`Credit received! ₳${formatAlpha(offer.principal_amount)} has been added to your wallet.`);
      
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept credit');
    } finally {
      setTakingOfferId(null);
    }
  };

  const refreshData = () => {
    fetchOffers();
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  };

  const handleBlockedAction = () => {
    toast.error('Upgrade to PRO to access ALPHA P2P Credits');
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Banner for non-PRO users */}
      {isReadOnly && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
            <Eye className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Read-Only Mode</p>
            <p className="text-xs text-muted-foreground">
              You can view the marketplace but interactions are disabled. Upgrade to PRO or ELITE to participate.
            </p>
          </div>
          <Button 
            size="sm" 
            className="alpha-gradient text-alpha-foreground flex-shrink-0"
            onClick={() => window.location.href = '/dashboard/upgrade'}
          >
            Upgrade
          </Button>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-alpha" />
            <span className="text-xs text-muted-foreground">Available Credits</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{availableOffers.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Fixed Rate</span>
          </div>
          <p className="text-2xl font-bold text-alpha">3%</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="marketplace" className="flex-1">
            ALPHA P2P Credits
          </TabsTrigger>
          <TabsTrigger 
            value="my-credits" 
            className="flex-1"
            disabled={isReadOnly}
            onClick={(e) => {
              if (isReadOnly) {
                e.preventDefault();
                handleBlockedAction();
              }
            }}
          >
            {isReadOnly && <Lock className="h-3 w-3 mr-1" />}
            My Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4 mt-4">
          {/* Post Offer Button - Disabled in read-only mode */}
          <Button
            onClick={isReadOnly ? handleBlockedAction : () => setCreateModalOpen(true)}
            disabled={isReadOnly}
            className={cn(
              "w-full",
              isReadOnly 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "alpha-gradient text-alpha-foreground"
            )}
          >
            {isReadOnly ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                PRO+ Required to Post Offers
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                🐂 Post Credit Offer
              </>
            )}
          </Button>

          {/* Offer List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : availableOffers.length > 0 ? (
            <div className="space-y-4">
              {availableOffers.map((offer) => (
                <LoanOfferCard
                  key={offer.id}
                  offer={offer}
                  onTakeOffer={handleTakeOffer}
                  isLoading={takingOfferId === offer.id}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-border text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No credit offers available</p>
              <p className="text-xs text-muted-foreground">
                {isReadOnly 
                  ? 'Upgrade to PRO to post your first credit offer!'
                  : 'Be the first to post a credit offer!'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-credits" className="mt-4">
          {isReadOnly ? (
            <div className="p-8 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Feature Locked</p>
              <p className="text-xs text-muted-foreground mb-4">
                Upgrade to PRO to view and manage your credits
              </p>
              <Button 
                className="alpha-gradient text-alpha-foreground"
                onClick={() => window.location.href = '/dashboard/upgrade'}
              >
                Upgrade Now
              </Button>
            </div>
          ) : user ? (
            <MyLoansSection userId={user.id} onRefresh={refreshData} />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Please login to view your credits
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Only render modal if user has access */}
      {!isReadOnly && (
        <CreateOfferModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          walletBalance={mainBalance}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}

// Keep backward compatibility export
export { AlphaP2PCreditsMarketplace as LendingMarketplace };
