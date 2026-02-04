import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useEliteQualification } from '@/hooks/useEliteQualification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { SuccessConfetti } from '@/components/ui/success-confetti';
import { 
  ArrowLeft,
  ArrowRight,
  Crown,
  Zap,
  Star,
  CheckCircle,
  Copy,
  Info,
  Loader2,
  Upload,
  QrCode,
  Shield,
  TrendingUp,
  Lock,
  Users,
  Sparkles,
  Check,
  CreditCard,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

// SOVEREIGN BRANDING V8.7 - PRO/EXPERT/ELITE hierarchy
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
    requiresReferrals: 0,
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
    requiresReferrals: 0,
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
    requiresReferrals: 3,
  },
];

const STEPS = [
  { id: 1, label: 'Select Tier', icon: Shield },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Verify', icon: FileCheck },
];

export default function UpgradeMembership() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const { data: eliteQualification, isLoading: isLoadingQualification } = useEliteQualification();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string>('pro');
  const [paymentMethod, setPaymentMethod] = useState<string>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ reference_number?: string }>({});
  const [showQR, setShowQR] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.id === profile?.membership_tier);
  const availableTiers = MEMBERSHIP_TIERS.filter((_, index) => index > currentTierIndex);
  const selectedTierData = MEMBERSHIP_TIERS.find(t => t.id === selectedTier);
  const selectedPaymentData = paymentMethods?.find(p => p.id === paymentMethod);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Account number copied to clipboard' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File Too Large', description: 'Maximum file size is 5MB' });
        return;
      }
      setProofFile(file);
    }
  };

  const submitPayment = useMutation({
    mutationFn: async () => {
      if (!user || !selectedTierData) throw new Error('Invalid data');

      let proofPath: string | null = null;

      if (proofFile) {
        setIsUploading(true);
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, proofFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload payment proof');
        }
        
        proofPath = fileName;
        setIsUploading(false);
      }

      const { error } = await supabase
        .from('membership_payments')
        .insert({
          user_id: user.id,
          tier: selectedTier as 'pro' | 'expert' | 'elite',
          amount: selectedTierData.price,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          proof_url: proofPath,
          status: 'pending',
        });

      if (error) throw new Error('Failed to submit payment');
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    },
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedTier === 'elite' && !eliteQualification?.isQualified) {
        toast({
          variant: 'destructive',
          title: 'Elite Gatekeeper Requirement',
          description: `You need ${3 - (eliteQualification?.qualifiedReferrals || 0)} more PRO referrals to unlock Elite status.`,
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = paymentSchema.safeParse({
      tier: selectedTier,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
    });
    
    if (!result.success) {
      const fieldErrors: { reference_number?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'reference_number') fieldErrors.reference_number = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await submitPayment.mutateAsync();
  };

  // Determine confetti variant based on selected tier
  const confettiVariant = selectedTier === 'elite' ? 'golden' : 'default';

  // Success State
  if (submitted) {
    return (
      <>
        {/* Celebratory Confetti */}
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
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
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
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-foreground">{referenceNumber}</span>
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
          
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
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
                    
                    return (
                      <motion.div
                        key={tier.id}
                        whileHover={{ scale: isEliteLocked ? 1 : 1.01 }}
                        whileTap={{ scale: isEliteLocked ? 1 : 0.99 }}
                      >
                        <button
                          type="button"
                          onClick={() => !isEliteLocked && setSelectedTier(tier.id)}
                          disabled={isEliteLocked}
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? `${tier.borderColor} ${tier.bgColor}` 
                              : 'border-border bg-card hover:border-muted-foreground/30'
                          } ${isEliteLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center flex-shrink-0`}>
                              {isEliteLocked ? (
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
                              
                              {tier.requiresReferrals > 0 && (
                                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 mb-2">
                                  <Users className="h-3 w-3 mr-1" />
                                  Requires {tier.requiresReferrals} PRO Referrals
                                </Badge>
                              )}
                              
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
                          
                          {/* Elite Gatekeeper Progress */}
                          {tier.id === 'elite' && !eliteQualification?.isQualified && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-amber-400 flex items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  PRO Referrals Required
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

            {/* STEP 2: Payment Method */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Step 2 of 3</Badge>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Send Payment</h1>
                  <p className="text-muted-foreground">
                    Transfer <span className={`font-bold font-mono ${selectedTierData?.textColor}`}>₳{selectedTierData?.price.toLocaleString()}</span> for {selectedTierData?.name}
                  </p>
                </div>

                {/* Selected Tier Summary */}
                <Card className="mb-6 border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedTierData?.gradient} flex items-center justify-center`}>
                        {selectedTierData && <selectedTierData.icon className="h-6 w-6 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{selectedTierData?.name} Access</p>
                        <p className="text-xs text-muted-foreground">One-time registration fee</p>
                      </div>
                      <span className={`text-2xl font-bold font-mono ${selectedTierData?.textColor}`}>
                        ₳{selectedTierData?.price.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Select Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoadingMethods ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      paymentMethods?.map((method) => (
                        <motion.button
                          key={method.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => { setPaymentMethod(method.id); setShowQR(false); }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            paymentMethod === method.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.accountName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="px-3 py-1.5 bg-muted rounded font-mono text-sm">{method.number}</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(method.number); }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* QR Code Section */}
                {selectedPaymentData?.qrCodeUrl && (
                  <Card className="mb-6">
                    <CardContent className="p-6 text-center">
                      <Button
                        type="button"
                        variant={showQR ? "secondary" : "outline"}
                        onClick={() => setShowQR(!showQR)}
                        className="mb-4"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {showQR ? 'Hide QR Code' : 'Show QR Code'}
                      </Button>
                      
                      <AnimatePresence>
                        {showQR && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white rounded-xl inline-block">
                              <img 
                                src={selectedPaymentData.qrCodeUrl} 
                                alt="Payment QR Code"
                                className="w-48 h-48 mx-auto"
                              />
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                              Scan to pay via {selectedPaymentData.name}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                )}

                {/* Info Box */}
                <Alert className="mb-6 border-muted bg-muted/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Send exactly <strong>₳{selectedTierData?.price.toLocaleString()}</strong> to the selected payment method. Keep your transaction receipt for the next step.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext} className="flex-1 h-12">
                    I've Sent Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Verification */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Step 3 of 3</Badge>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Payment</h1>
                  <p className="text-muted-foreground">Enter your transaction details for admin verification</p>
                </div>

                {/* Payment Summary */}
                <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedTierData?.gradient} flex items-center justify-center`}>
                        {selectedTierData && <selectedTierData.icon className="h-7 w-7 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{selectedTierData?.name}</p>
                        <p className="text-sm text-muted-foreground">via {selectedPaymentData?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className={`text-xl font-bold font-mono ${selectedTierData?.textColor}`}>
                        ₳{selectedTierData?.price.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Reference Number */}
                <Card className="mb-6">
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reference" className="text-foreground font-medium">
                        Transaction Reference Number *
                      </Label>
                      <Input
                        id="reference"
                        placeholder="e.g., 1234567890123"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        maxLength={50}
                        className={`h-12 text-base ${errors.reference_number ? 'border-destructive' : ''}`}
                        required
                      />
                      {errors.reference_number && (
                        <p className="text-sm text-destructive">{errors.reference_number}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proof" className="text-foreground font-medium flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Payment Screenshot (Optional)
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Input
                          id="proof"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="proof" className="cursor-pointer">
                          {proofFile ? (
                            <div className="flex items-center justify-center gap-2 text-primary">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">{proofFile.name}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                              <p className="text-xs text-muted-foreground mt-1">Max 5MB • JPG, PNG</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1 h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitPayment.isPending || isUploading || !referenceNumber} 
                    className="flex-1 h-12"
                  >
                    {submitPayment.isPending || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your submission will be reviewed within 24 hours
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </main>
    </div>
  );
}
