/**
 * ALPHA BANKERS COOPERATIVE - SOVEREIGN EXECUTION V9.2
 * Elite-Only High-Performance Financial Engine
 * ABC Smart Vault + P2P Credits System + Auto-Provisioning
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Percent, 
  Calendar, 
  Lock, 
  CheckCircle2,
  Vault,
  Users,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { formatAlpha, cn } from '@/lib/utils';
import { RiskDisclosureModal } from '@/components/alpha/RiskDisclosureModal';
import { LoanCountdownTimer } from '@/components/alpha/LoanCountdownTimer';
import { DebtorRescuePanel } from '@/components/alpha/DebtorRescuePanel';
import { EliteMomentCelebration } from '@/components/alpha/EliteMomentCelebration';
import { useEliteQualification } from '@/hooks/useEliteQualification';
import { useABCAccess, useEliteUnlockDetector } from '@/hooks/useABCAccess';
import { ABCSmartVault, SmartCreditLedger, ReserveRatioGauge } from '@/components/vault';
import { useTierAccess } from '@/components/tier';
import { usePendingLoans, useActiveLoans, useMyBorrowedLoans } from '@/hooks/useLoans';
import { AlphaLoader } from '@/components/ui/AlphaLoader';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWallets } from '@/hooks/useWallets';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
    offerId?: string;
  } | null>(null);
  const [showDebtorView, setShowDebtorView] = useState(false);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);
  const [lendAmount, setLendAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEliteCelebration, setShowEliteCelebration] = useState(false);
  
  const { canAccessElite } = useTierAccess();
  const { data: qualificationData, isLoading: loadingQualification } = useEliteQualification();
  const { data: pendingLoans = [], isLoading: loadingOffers, refetch: refetchOffers } = usePendingLoans();
  const { data: borrowedLoans = [] } = useMyBorrowedLoans();
  const { data: abcAccess } = useABCAccess();
  const { data: eliteUnlock } = useEliteUnlockDetector();
  const { data: profile } = useProfile();
  const { getBalance } = useWallets();
  const queryClient = useQueryClient();

  // Trigger celebration for newly unlocked Elite users
  useEffect(() => {
    if (eliteUnlock?.newlyUnlocked && canAccessElite) {
      setShowEliteCelebration(true);
    }
  }, [eliteUnlock?.newlyUnlocked, canAccessElite]);

  // Qualification check - use ABC access data if available
  const qualifiedReferrals = abcAccess?.referrals?.qualified ?? qualificationData?.qualifiedReferrals ?? 0;
  const qualificationMet = abcAccess?.referrals?.met ?? qualifiedReferrals >= REQUIRED_REFERRALS;
  
  // Active debt for debtor recovery view
  const activeDebt = borrowedLoans
    .filter(l => l.status === 'active' || l.status === 'defaulted')
    .reduce((sum, l) => sum + (l.total_repayment || l.principal_amount), 0);
  
  const hasDefaultedDebt = borrowedLoans.some(l => l.status === 'defaulted');

  const handleLendClick = useCallback(() => {
    if (circuitBreakerActive) {
      toast.error('Circuit breaker active. Lending temporarily suspended.');
      return;
    }
    if (!qualificationMet) {
      toast.error('You need 3 EXPERT referrals to post lending offers');
      return;
    }
    setCreateOfferOpen(true);
  }, [circuitBreakerActive, qualificationMet]);

  const handleBorrowClick = useCallback((offerId: string, amount: number) => {
    if (!qualificationMet) {
      toast.error('You need 3 EXPERT referrals to borrow');
      return;
    }
    setPendingAction({ type: 'borrow', amount, offerId });
    setRiskModalOpen(true);
  }, [qualificationMet]);

  const handleRiskAccepted = useCallback(async () => {
    if (!pendingAction?.offerId) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('lending-take-offer', {
        body: { loanId: pendingAction.offerId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast.success(`Credit received! ₳${formatAlpha(pendingAction.amount)} has been added to your wallet.`);
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] });
      queryClient.invalidateQueries({ queryKey: ['my-borrowed-loans'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept credit');
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  }, [pendingAction, queryClient]);
  
  const handlePostOffer = useCallback(async () => {
    const amount = parseFloat(lendAmount);
    if (amount < 100) {
      toast.error('Minimum lending amount is ₳100');
      return;
    }
    if (amount > getBalance('main')) {
      toast.error('Insufficient balance');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('lending-post-offer', {
        body: { principal_amount: amount }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast.success('Credit offer posted! Your ₳ is now in escrow.');
      setLendAmount('');
      setCreateOfferOpen(false);
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] });
      queryClient.invalidateQueries({ queryKey: ['my-lent-loans'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to post offer');
    } finally {
      setIsSubmitting(false);
    }
  }, [lendAmount, getBalance, queryClient]);

  const handleCircuitBreaker = useCallback((triggered: boolean) => {
    setCircuitBreakerActive(triggered);
  }, []);

  // Debtor recovery view
  if (showDebtorView || hasDefaultedDebt) {
    return (
      <AlphaLayout title="ABC Finance" subtitle="Debtor Recovery Mode">
        <div className="mb-4 flex justify-end">
          {!hasDefaultedDebt && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebtorView(false)} 
              className="font-mono text-xs border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/10"
            >
              Return to Dashboard
            </Button>
          )}
        </div>
        <DebtorRescuePanel 
          totalDebt={activeDebt} 
          earnedTowardsDebt={0} 
          daysOverdue={hasDefaultedDebt ? 28 : 0} 
          missions={rescueMissions} 
        />
      </AlphaLayout>
    );
  }

  // Non-Elite view
  if (!canAccessElite) {
    return (
      <AlphaLayout title="Alpha Bankers Cooperative" subtitle="Smart Credit Protocol">
        <Card className="bg-card border-border p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-[#FFD700]" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Elite Membership Required</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Access the ABC Smart Vault - an Elite-only P2P lending marketplace with 1% daily vault yield and collateralized credit system.
            </p>
            <Button 
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold"
              onClick={() => window.location.href = '/dashboard/upgrade'}
            >
              Upgrade to Elite
            </Button>
          </div>
        </Card>
      </AlphaLayout>
    );
  }

  return (
    <>
      {/* Elite Moment Celebration - Golden Confetti */}
      <EliteMomentCelebration
        isVisible={showEliteCelebration}
        onComplete={() => setShowEliteCelebration(false)}
        userName={profile?.full_name}
      />

      <AlphaLayout title="Alpha Bankers Cooperative" subtitle="Smart Credit Protocol V9.2">
      {/* ABC Smart Vault - Primary Financial Hub */}
      <ABCSmartVault className="mb-6" />
      
      {/* Reserve Ratio Gauge */}
      <ReserveRatioGauge 
        className="mb-6" 
        onCircuitBreaker={handleCircuitBreaker}
      />

      {/* Qualification Check Banner */}
      <Card className={cn(
        "mb-6 bg-card backdrop-blur-xl border",
        qualificationMet ? 'border-emerald-500/30' : 'border-[#FFD700]/30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              qualificationMet 
                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                : 'bg-[#FFD700]/10 border border-[#FFD700]/20'
            )}>
              {qualificationMet ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <Users className="h-5 w-5 text-[#FFD700]" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {qualificationMet ? 'Qualified for P2P Credit' : 'Qualification Required'}
              </p>
              <p className="text-xs text-muted-foreground">
                {qualificationMet 
                  ? 'You meet requirements for lending and borrowing' 
                  : 'Invite 3 EXPERT partners to unlock'}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "font-mono",
                qualificationMet 
                  ? 'border-emerald-500/30 text-emerald-400' 
                  : 'border-[#FFD700]/30 text-[#FFD700]'
              )}
            >
              {qualifiedReferrals}/3
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Lend/Borrow */}
      <Tabs defaultValue="lend" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-card border border-border p-1">
          <TabsTrigger 
            value="lend" 
            className="gap-2 text-sm data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]"
          >
            <TrendingUp className="h-4 w-4" />
            Lend
          </TabsTrigger>
          <TabsTrigger 
            value="borrow" 
            className="gap-2 text-sm data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]"
          >
            <TrendingDown className="h-4 w-4" />
            Borrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lend">
          {/* Lend Summary */}
          <Card className="mb-4 overflow-hidden bg-card border-[#FFD700]/20 backdrop-blur-xl">
            <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/5 p-5 border-b border-[#FFD700]/10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Daily Vault Yield</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold text-[#FFD700]">1%</span>
                <span className="text-sm text-muted-foreground">Daily Return</span>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3 text-[#FFD700]" />
                  0.8% Entry Fee
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#FFD700]" />
                  28-Day Cycle
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-[#FFD700]" />
                  Collateralized
                </span>
              </div>
            </div>
          </Card>

          {/* Marketplace Offers */}
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Credit Marketplace
          </h3>
          
          {loadingOffers ? (
            <div className="flex justify-center py-8">
              <AlphaLoader size="md" />
            </div>
          ) : pendingLoans.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border text-center mb-4">
              <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No credit offers available</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to post!</p>
            </div>
          ) : (
            pendingLoans.map(offer => {
              const interest = offer.principal_amount * (offer.interest_rate / 100);
              const total = offer.total_repayment || (offer.principal_amount + interest);
              
              return (
                <Card 
                  key={offer.id} 
                  className="mb-3 bg-card border-border hover:border-[#FFD700]/30 transition-all duration-150"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20">
                          <TrendingUp className="h-5 w-5 text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground font-mono">
                            ₳{formatAlpha(offer.principal_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {offer.interest_rate}% • {offer.term_days} days • Total: ₳{formatAlpha(total)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!qualificationMet || isSubmitting}
                        onClick={() => handleBorrowClick(offer.id, offer.principal_amount)}
                        className="text-xs border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                      >
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          <Button 
            className={cn(
              "w-full mt-4 font-bold active:scale-95 transition-all duration-150",
              circuitBreakerActive 
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-black"
            )}
            disabled={!qualificationMet || circuitBreakerActive} 
            onClick={handleLendClick}
          >
            {circuitBreakerActive ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Circuit Breaker Active
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Post Lending Offer
              </>
            )}
          </Button>
          
          {!qualificationMet && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Complete qualification to unlock lending
            </p>
          )}
        </TabsContent>

        <TabsContent value="borrow">
          {/* Credit Limit Card */}
          <Card className="mb-4 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Credit Limit</span>
                <span className="font-bold text-foreground font-mono">
                  ₳{formatAlpha(qualificationMet ? Math.min(qualifiedReferrals * 1000, 10000) : 0)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Current Debt</span>
                <span className="font-bold text-[#FFD700] font-mono">₳{formatAlpha(activeDebt)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Limit based on EXPERT referral count (₳1,000 per referral, max ₳10,000)
              </p>
            </CardContent>
          </Card>

          {/* Available Loans */}
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Available Credit Offers
          </h3>
          
          {loadingOffers ? (
            <div className="flex justify-center py-8">
              <AlphaLoader size="md" />
            </div>
          ) : pendingLoans.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border text-center">
              <TrendingDown className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No credit offers available</p>
              <p className="text-xs text-muted-foreground mt-1">Check back later</p>
            </div>
          ) : (
            pendingLoans.map(offer => {
              const interest = offer.principal_amount * (offer.interest_rate / 100);
              const total = offer.total_repayment || (offer.principal_amount + interest);
              
              return (
                <Card 
                  key={offer.id} 
                  className="mb-3 bg-card border-border hover:border-[#FFD700]/30 transition-all duration-150"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground font-mono">
                          ₳{formatAlpha(offer.principal_amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: ₳{formatAlpha(total)} • {offer.term_days} days
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={!qualificationMet || isSubmitting} 
                        onClick={() => handleBorrowClick(offer.id, offer.principal_amount)}
                        className="text-xs border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 active:scale-95 transition-all duration-150"
                      >
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Smart Credit Ledger */}
      <SmartCreditLedger 
        className="mb-6"
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['my-lent-loans'] });
          queryClient.invalidateQueries({ queryKey: ['my-borrowed-loans'] });
        }}
      />

      {/* Create Offer Modal */}
      <Dialog open={createOfferOpen} onOpenChange={setCreateOfferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Vault className="h-5 w-5 text-[#FFD700]" />
              Post Credit Offer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="font-bold font-mono">₳{formatAlpha(getBalance('main'))}</span>
            </div>
            <div className="space-y-2">
              <Label>Credit Amount (₳)</Label>
              <Input
                type="number"
                placeholder="Minimum ₳100"
                value={lendAmount}
                onChange={(e) => setLendAmount(e.target.value)}
                min={100}
                className="font-mono text-lg"
              />
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="text-[#FFD700] font-medium">3% fixed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Term</span>
                <span>7 Days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="text-orange-400">0.8%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-start gap-2">
              <Shield className="h-4 w-4 text-[#FFD700] mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your ₳ will be locked in Smart Escrow. 28-day auto-repayment ensures 0% lender risk.
              </p>
            </div>
            <Button
              onClick={handlePostOffer}
              disabled={isSubmitting || parseFloat(lendAmount) < 100}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold"
            >
              {isSubmitting ? 'Processing...' : 'Post Offer & Lock ₳'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
