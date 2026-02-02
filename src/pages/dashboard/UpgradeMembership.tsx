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
import { 
  ArrowLeft,
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
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';

// SOVEREIGN BRANDING V8.7 - PRO/EXPERT/ELITE hierarchy
const MEMBERSHIP_TIERS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 300,
    icon: Star,
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30',
    features: ['Full VPA Mission Access', '50% Referral Commission', 'Omni-Transfer Engine', 'Alpha Mobile Dashboard'],
    requiresReferrals: 0,
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 600,
    icon: Zap,
    color: 'bg-primary',
    borderColor: 'border-primary/30',
    features: ['All Pro Features', 'Ad Wizard Professional', 'Priority Mission Queue', '10% Network Overrides (Lvl 1-2)', '15,000 ₳ Daily Transfer Limit'],
    requiresReferrals: 0,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 900,
    icon: Crown,
    color: 'bg-amber-500',
    borderColor: 'border-amber-500/30',
    features: ['All Expert Features', 'Alpha Bankers Cooperative', '1% Daily Vault Yield', 'P2P Lending Access', 'Full Royalty Engine', 'Priority Support'],
    requiresReferrals: 3, // Must have 3 Direct EXPERT referrals (Blueprint V8.7)
  },
];

export default function UpgradeMembership() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const { data: eliteQualification, isLoading: isLoadingQualification } = useEliteQualification();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTier, setSelectedTier] = useState<string>('pro');
  const [paymentMethod, setPaymentMethod] = useState<string>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ reference_number?: string }>({});
  const [showQR, setShowQR] = useState(false);

  const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.id === profile?.membership_tier);
  
  // Filter available tiers - show tiers higher than current
  // Elite shows but is locked unless user has 3 PRO referrals
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
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please upload an image file (JPG, PNG, etc.)',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Maximum file size is 5MB',
        });
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

      if (error) {
        console.error('Payment submission error:', error);
        throw new Error('Failed to submit payment');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Payment Submitted!',
        description: 'Your payment is pending admin verification. You will be notified once approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setReferenceNumber('');
      setProofFile(null);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Elite Gatekeeper Check (Blueprint V8.0)
    if (selectedTier === 'elite' && !eliteQualification?.isQualified) {
      toast({
        variant: 'destructive',
        title: 'Elite Gatekeeper Requirement',
        description: `You need ${3 - (eliteQualification?.qualifiedReferrals || 0)} more PRO referrals to unlock Elite status.`,
      });
      return;
    }
    
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
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: result.error.errors[0]?.message || 'Please fix the errors below.',
      });
      return;
    }

    await submitPayment.mutateAsync();
  };

  if (availableTiers.length === 0) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="bg-atmosphere" />
        <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 text-center relative z-10">
          <div className="p-4 rounded bg-amber-500/10 border border-amber-500/20 inline-flex mb-6 cyan-glow">
            <Crown className="h-12 w-12 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">You're at the Top!</h1>
          <p className="text-muted-foreground mb-8">
            You already have Elite access - the highest tier available.
          </p>
          <Link to="/dashboard">
            <Button className="haptic-press">Return to Dashboard</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Obsidian with Glassmorphism */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Page Header - 2026 Style */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">Upgrade Access</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Upgrade Your Access Level</h1>
          <p className="text-muted-foreground">
            Unlock more participation opportunities with a higher tier
          </p>
        </div>

        {/* Info Notice - 2026 Style */}
        <Alert className="mb-6 border-muted bg-muted/30 rounded">
          <Info className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-xs text-muted-foreground">
            Membership fees are <strong>one-time registration payments</strong> for permanent platform access. All registrations require admin verification before activation.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          {/* Tier Selection - 2026 Titanium Cards */}
          <Card className="mb-8 titanium-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                1. Select Your Access Level
              </CardTitle>
              <CardDescription>Choose the access level you want to upgrade to</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Elite Gatekeeper Warning */}
              {selectedTier === 'elite' && !eliteQualification?.isQualified && (
                <Alert className="mb-6 border-amber-500/30 bg-amber-500/10">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm">
                    <strong className="text-amber-400">Elite Gatekeeper Requirement:</strong> You need{' '}
                    <span className="font-bold text-amber-300">3 Direct PRO Referrals</span> to unlock Elite status.
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          PRO Referrals: {eliteQualification?.qualifiedReferrals || 0}/3
                        </span>
                        <span>{Math.round(((eliteQualification?.qualifiedReferrals || 0) / 3) * 100)}%</span>
                      </div>
                      <Progress value={((eliteQualification?.qualifiedReferrals || 0) / 3) * 100} className="h-2" />
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="grid md:grid-cols-3 gap-4">
                {availableTiers.map((tier) => {
                  const TierIcon = tier.icon;
                  const isEliteLocked = tier.id === 'elite' && !eliteQualification?.isQualified;
                  
                  return (
                    <div key={tier.id} className="relative">
                      {isEliteLocked && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="outline" className="bg-amber-500/20 border-amber-500/30 text-amber-400 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            {eliteQualification?.qualifiedReferrals || 0}/3 PRO
                          </Badge>
                        </div>
                      )}
                      <RadioGroupItem 
                        value={tier.id} 
                        id={tier.id} 
                        className="peer sr-only" 
                        disabled={isEliteLocked}
                      />
                      <Label
                        htmlFor={tier.id}
                        className={`flex flex-col items-center p-6 border-2 border-border rounded cursor-pointer 
                          peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 
                          hover:border-muted transition-all duration-150 widget-hover
                          ${isEliteLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-12 h-12 rounded ${tier.color} flex items-center justify-center mb-3`}>
                          {isEliteLocked ? (
                            <Lock className="h-6 w-6 text-primary-foreground" />
                          ) : (
                            <TierIcon className="h-6 w-6 text-primary-foreground" />
                          )}
                        </div>
                        <span className="font-semibold text-lg text-foreground">{tier.name}</span>
                        <span className="text-2xl font-bold text-primary font-mono mt-1">₳{tier.price.toLocaleString()}</span>
                        
                        {tier.requiresReferrals > 0 && (
                          <Badge variant="outline" className="mt-2 text-xs border-amber-500/30 text-amber-400">
                            <Users className="h-3 w-3 mr-1" />
                            Requires {tier.requiresReferrals} PRO Referrals
                          </Badge>
                        )}
                        
                        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                          {tier.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-primary" /> {f}
                            </li>
                          ))}
                        </ul>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method - 2026 Titanium Card */}
          <Card className="mb-8 titanium-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground">2. Choose Payment Method</CardTitle>
              <CardDescription>Send your one-time registration fee to one of these accounts</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <RadioGroup value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); setShowQR(false); }} className="space-y-4">
                  {paymentMethods?.map((method) => (
                    <div key={method.id} className="flex items-center space-x-4">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between p-4 border border-border rounded bg-muted/30 hover:border-primary/30 transition-colors">
                          <div>
                            <p className="font-semibold text-foreground">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.accountName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-1 bg-background rounded font-mono text-sm border border-border">{method.number}</code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="haptic-press"
                              onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard(method.number);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {method.qrCodeUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="haptic-press"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPaymentMethod(method.id);
                                  setShowQR(!showQR || paymentMethod !== method.id);
                                }}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* QR Code Display */}
              {showQR && selectedPaymentData?.qrCodeUrl && (
                <div className="mt-6 p-6 bg-card border border-primary/20 rounded text-center cyan-glow-sm">
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    Scan QR Code to pay via {selectedPaymentData.name}
                  </p>
                  <img 
                    src={selectedPaymentData.qrCodeUrl} 
                    alt={`${selectedPaymentData.name} QR Code`}
                    className="w-48 h-48 mx-auto rounded border-2 border-border"
                  />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Send exactly <span className="font-bold text-primary font-mono">₳{selectedTierData?.price.toLocaleString()}</span>
                  </p>
                </div>
              )}

              {selectedPaymentData && selectedTierData && !showQR && (
                <div className="mt-6 p-4 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    Send exactly{' '}
                    <span className="text-primary font-bold text-lg font-mono">
                      ₳{selectedTierData.price.toLocaleString()}
                    </span>{' '}
                    to {selectedPaymentData.name}: <span className="font-mono">{selectedPaymentData.number}</span>
                  </p>
                  {selectedPaymentData.qrCodeUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 haptic-press"
                      onClick={() => setShowQR(true)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Proof - 2026 Titanium Card */}
          <Card className="mb-8 titanium-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground">3. Submit Verification</CardTitle>
              <CardDescription>Enter your transaction reference number and upload proof</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-foreground">Reference Number *</Label>
                <Input
                  id="reference"
                  placeholder="e.g., 1234567890123"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  maxLength={50}
                  className={errors.reference_number ? 'border-destructive' : ''}
                  required
                />
                {errors.reference_number && <p className="text-sm text-destructive">{errors.reference_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof" className="text-foreground">Payment Screenshot (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                {proofFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    {proofFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot of your payment confirmation (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit - 2026 Style */}
          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              disabled={submitPayment.isPending || isUploading} 
              className="px-12 haptic-press"
            >
              {submitPayment.isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit for Verification'
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Your submission will be reviewed within 24 hours
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
