/**
 * UPGRADE MEMBERSHIP - AMABILIA NETWORK V12.0
 * 
 * Premium Unified Payment Experience:
 * - AMABILIA branded loading transition
 * - Simplified QR-only payment (no provider choices)
 * - Required proof upload before submit
 * - Cinematic glassmorphism UI
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEliteQualification } from '@/hooks/useEliteQualification';
import { useExpertQualification, EXPERT_REQUIRED_TASKS } from '@/hooks/useExpertQualification';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SuccessConfetti } from '@/components/ui/success-confetti';
import { UnifiedPaymentFlow } from '@/components/payment/UnifiedPaymentFlow';
import { 
  ArrowLeft,
  ArrowRight,
  Crown,
  Zap,
  Star,
  CheckCircle,
  Shield,
  Lock,
  Users,
  Sparkles,
  Check,
  CreditCard,
  FileCheck,
  ChevronRight,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// SOVEREIGN BRANDING V12.0 - PRO/EXPERT/ELITE hierarchy with qualification rules
const MEMBERSHIP_TIERS = [
  {
    id: 'pro',
    name: 'Professional',
    shortName: 'Pro',
    price: 300,
    icon: Star,
    gradient: 'from-emerald-500 to-emerald-600',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    features: ['Full VPA Mission Access', '50% Referral Commission', 'Omni-Transfer Engine', 'Alpha Mobile Dashboard'],
    description: 'Unlock the full earning potential of the Alpha Ecosystem. Start completing missions and earning ₳ today.',
    requiresReferrals: 0,
    requiresTasks: 0,
  },
  {
    id: 'expert',
    name: 'Expert',
    shortName: 'Expert',
    price: 600,
    icon: Zap,
    gradient: 'from-primary to-primary/80',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    features: ['All Pro Features', 'Ad Wizard Professional', 'Priority Mission Queue', '10% Network Overrides (Lvl 1-2)', '15,000 ₳ Daily Transfer Limit'],
    description: 'Designed for proven contributors. Complete 5 verified tasks to demonstrate reliability and unlock advanced earning tools.',
    requiresReferrals: 0,
    requiresTasks: EXPERT_REQUIRED_TASKS,
  },
  {
    id: 'elite',
    name: 'Financial Elite',
    shortName: 'Elite',
    price: 900,
    icon: Crown,
    gradient: 'from-[#FFD700] to-amber-600',
    borderColor: 'border-[#FFD700]/30',
    bgColor: 'bg-[#FFD700]/10',
    textColor: 'text-[#FFD700]',
    features: ['All Expert Features', 'Alpha Bankers Cooperative', '1% Daily Vault Yield', 'P2P Lending Access', 'Full Royalty Engine', 'Priority Support'],
    description: 'Access the exclusive Alpha Bankers Cooperative. Requires Elite-level network building with 3 EXPERT partners.',
    requiresReferrals: 3,
    requiresTasks: 0,
  },
];

const STEPS = [
  { id: 1, label: 'Select Tier', icon: Shield },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Complete', icon: FileCheck },
];

export default function UpgradeMembership() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: eliteQualification, isLoading: isLoadingEliteQualification } = useEliteQualification();
  const { data: expertQualification, isLoading: isLoadingExpertQualification } = useExpertQualification();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string>('pro');
  const [submitted, setSubmitted] = useState(false);

  const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.id === profile?.membership_tier);
  const availableTiers = MEMBERSHIP_TIERS.filter((_, index) => index > currentTierIndex);
  const selectedTierData = MEMBERSHIP_TIERS.find(t => t.id === selectedTier);

  // Handle successful payment
  const handlePaymentSuccess = useCallback(() => {
    setSubmitted(true);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['membership-payments'] });
  }, [queryClient]);

  // Handle payment cancel
  const handlePaymentCancel = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleNext = () => {
    if (currentStep === 1) {
      // EXPERT qualification check: requires 5 completed tasks
      if (selectedTier === 'expert' && !expertQualification?.isQualified) {
        toast({
          variant: 'destructive',
          title: 'EXPERT Qualification Required',
          description: `Complete ${expertQualification?.remainingTasks || EXPERT_REQUIRED_TASKS} more approved tasks to unlock EXPERT status.`,
        });
        return;
      }
      // ELITE qualification check: requires 3 EXPERT referrals
      if (selectedTier === 'elite' && !eliteQualification?.isQualified) {
        toast({
          variant: 'destructive',
          title: 'Elite Gatekeeper Requirement',
          description: `You need ${3 - (eliteQualification?.qualifiedReferrals || 0)} more EXPERT referrals to unlock Elite status.`,
        });
        return;
      }
      setCurrentStep(2);
    }
  };

  // Determine confetti variant based on selected tier
  const confettiVariant = selectedTier === 'elite' ? 'golden' : 'default';

  // Success State
  if (submitted) {
    return (
      <>
        <SuccessConfetti 
          isActive={submitted} 
          variant={confettiVariant}
          particleCount={selectedTier === 'elite' ? 80 : 60}
          duration={4000}
        />
        
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 0.3 }}
            className="text-center max-w-md relative z-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', damping: 12, stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                selectedTier === 'elite' 
                  ? 'bg-gradient-to-br from-[#FFD700]/30 to-amber-500/10 border-2 border-[#FFD700]/50 shadow-[0_0_40px_rgba(255,215,0,0.3)]' 
                  : 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30'
              }`}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
              >
                {selectedTier === 'elite' ? (
                  <Crown className="h-12 w-12 text-[#FFD700]" />
                ) : (
                  <Check className="h-12 w-12 text-primary" />
                )}
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h1 className={`text-2xl font-bold mb-2 ${
                selectedTier === 'elite' ? 'text-[#FFD700]' : 'text-foreground'
              }`}>
                {selectedTier === 'elite' ? '🎉 Elite Upgrade Submitted!' : 'Payment Submitted!'}
              </h1>
              <p className="text-muted-foreground mb-6">
                Your upgrade to <span className={`font-semibold ${
                  selectedTier === 'elite' ? 'text-[#FFD700]' : 'text-primary'
                }`}>{selectedTierData?.name}</span> is pending verification. You'll be notified once approved.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className={`p-4 rounded-lg border mb-6 ${
                selectedTier === 'elite' 
                  ? 'bg-[#FFD700]/5 border-[#FFD700]/30' 
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className={`font-mono font-bold ${
                  selectedTier === 'elite' ? 'text-[#FFD700]' : 'text-primary'
                }`}>₳{selectedTierData?.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <Link to="/dashboard">
                <Button className={`w-full ${
                  selectedTier === 'elite' 
                    ? 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black hover:from-amber-500 hover:to-[#FFD700]' 
                    : ''
                }`}>
                  Return to Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  // Already at highest tier
  if (availableTiers.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-amber-500/10 border border-[#FFD700]/30 flex items-center justify-center">
            <Crown className="h-10 w-10 text-[#FFD700]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">You're at the Top!</h1>
          <p className="text-muted-foreground mb-6">
            You already have Elite access - the highest tier available.
          </p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted ? 'hsl(var(--primary))' : isActive ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted))',
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'text-primary-foreground' : isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </motion.div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 transition-colors ${
                      step.id < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: Tier Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Step 1 of 3</Badge>
                <h1 className="text-2xl font-bold text-foreground mb-2">Choose Your Access Level</h1>
                <p className="text-muted-foreground">Select the tier that matches your goals</p>
              </div>

              <div className="space-y-4">
                {availableTiers.map((tier) => {
                  const TierIcon = tier.icon;
                  const isSelected = selectedTier === tier.id;
                  const isEliteLocked = tier.id === 'elite' && !eliteQualification?.isQualified;
                  const isExpertLocked = tier.id === 'expert' && !expertQualification?.isQualified;
                  const isLocked = isEliteLocked || isExpertLocked;
                  
                  return (
                    <motion.div
                      key={tier.id}
                      whileHover={{ scale: isLocked ? 1 : 1.01 }}
                      whileTap={{ scale: isLocked ? 1 : 0.99 }}
                    >
                      <button
                        type="button"
                        onClick={() => !isLocked && setSelectedTier(tier.id)}
                        disabled={isLocked}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                          isSelected 
                            ? `${tier.borderColor} ${tier.bgColor}` 
                            : 'border-border bg-card hover:border-muted-foreground/30'
                        } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center flex-shrink-0`}>
                            {isLocked ? (
                              <Lock className="h-6 w-6 text-white" />
                            ) : (
                              <TierIcon className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-lg text-foreground">{tier.name}</h3>
                              <span className={`text-2xl font-bold font-mono ${tier.textColor}`}>₳{tier.price}</span>
                            </div>
                            
                            {/* EXPERT Task Requirement Badge */}
                            {tier.id === 'expert' && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs mb-2 ${
                                  expertQualification?.isQualified 
                                    ? 'border-primary/30 text-primary' 
                                    : 'border-amber-500/30 text-amber-400'
                                }`}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                {expertQualification?.isQualified 
                                  ? '✓ Task Requirement Met' 
                                  : `Requires ${EXPERT_REQUIRED_TASKS} Completed Tasks`
                                }
                              </Badge>
                            )}
                            
                            {/* ELITE Referral Requirement Badge */}
                            {tier.requiresReferrals > 0 && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs mb-2 ${
                                  eliteQualification?.isQualified 
                                    ? 'border-[#FFD700]/30 text-[#FFD700]' 
                                    : 'border-amber-500/30 text-amber-400'
                                }`}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                {eliteQualification?.isQualified 
                                  ? '✓ Referral Requirement Met' 
                                  : `Requires ${tier.requiresReferrals} EXPERT Referrals`
                                }
                              </Badge>
                            )}
                            
                            <p className="text-xs text-muted-foreground mb-2">{tier.description}</p>
                            
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              {tier.features.slice(0, 4).map((f) => (
                                <span key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CheckCircle className={`h-3 w-3 ${tier.textColor}`} />
                                  <span className="truncate">{f}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? `${tier.borderColor} ${tier.bgColor}` : 'border-muted'
                          }`}>
                            {isSelected && <Check className={`h-4 w-4 ${tier.textColor}`} />}
                          </div>
                        </div>
                        
                        {/* EXPERT Task Progress */}
                        {tier.id === 'expert' && !expertQualification?.isQualified && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-primary flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Approved Tasks Required
                              </span>
                              <span className="text-muted-foreground">
                                {expertQualification?.completedTasks || 0}/{EXPERT_REQUIRED_TASKS}
                              </span>
                            </div>
                            <Progress value={expertQualification?.progressPercent || 0} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground mt-2">
                              Complete {expertQualification?.remainingTasks || EXPERT_REQUIRED_TASKS} more approved tasks to unlock EXPERT
                            </p>
                            <Link 
                              to="/alpha/command" 
                              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Target className="h-3 w-3" />
                              Go to Mission Center
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                        
                        {/* Elite Gatekeeper Progress */}
                        {tier.id === 'elite' && !eliteQualification?.isQualified && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-[#FFD700] flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                EXPERT Referrals Required
                              </span>
                              <span className="text-muted-foreground">{eliteQualification?.qualifiedReferrals || 0}/3</span>
                            </div>
                            <Progress value={((eliteQualification?.qualifiedReferrals || 0) / 3) * 100} className="h-1.5" />
                          </div>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8">
                <Button type="button" onClick={handleNext} className="w-full h-12 text-base" size="lg">
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Unified Payment Flow */}
          {currentStep === 2 && selectedTierData && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Step 2 of 3</Badge>
                <h1 className="text-2xl font-bold text-foreground mb-2">Complete Payment</h1>
                <p className="text-muted-foreground">
                  Upgrade to <span className={`font-bold ${selectedTierData.textColor}`}>{selectedTierData.name}</span>
                </p>
              </div>

              {/* Selected Tier Summary Card */}
              <Card className={`mb-6 ${selectedTierData.borderColor} ${selectedTierData.bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedTierData.gradient} flex items-center justify-center`}>
                      <selectedTierData.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{selectedTierData.name} Access</p>
                      <p className="text-xs text-muted-foreground">One-time registration fee</p>
                    </div>
                    <span className={`text-2xl font-bold font-mono ${selectedTierData.textColor}`}>
                      ₳{selectedTierData.price.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Unified Payment Flow Component */}
              <UnifiedPaymentFlow
                amount={selectedTierData.price}
                type="membership"
                tier={selectedTier}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
