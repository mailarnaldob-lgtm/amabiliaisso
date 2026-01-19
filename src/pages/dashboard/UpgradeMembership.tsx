import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Crown,
  Zap,
  Star,
  CheckCircle,
  Copy,
  Info,
  Loader2,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';

const MEMBERSHIP_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1000,
    icon: Star,
    color: 'bg-secondary',
    features: ['Referral access program', 'Access to community platform'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2000,
    icon: Zap,
    color: 'bg-primary',
    features: ['Referral access program', 'Activity-based credits', 'Training access'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 3000,
    icon: Crown,
    color: 'bg-accent-foreground',
    features: ['Referral access program', 'Activity-based credits', 'Credit marketplace', 'VIP support'],
  },
];

const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', number: '09171234567', accountName: 'Amabilia Network' },
  { id: 'bpi', name: 'BPI', number: '1234567890', accountName: 'Amabilia Network Inc.' },
  { id: 'bdo', name: 'BDO', number: '0987654321', accountName: 'Amabilia Network Inc.' },
];

export default function UpgradeMembership() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTier, setSelectedTier] = useState<string>('pro');
  const [paymentMethod, setPaymentMethod] = useState<string>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ reference_number?: string }>({});

  const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.id === profile?.membership_tier);
  const availableTiers = MEMBERSHIP_TIERS.filter((_, index) => index > currentTierIndex);

  const selectedTierData = MEMBERSHIP_TIERS.find(t => t.id === selectedTier);
  const selectedPaymentData = PAYMENT_METHODS.find(p => p.id === paymentMethod);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Account number copied to clipboard' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please upload an image file (JPG, PNG, etc.)',
        });
        return;
      }
      // Validate file size (max 5MB)
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

      // Upload proof file if provided
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

      // Insert payment record into membership_payments table
      const { error } = await supabase
        .from('membership_payments')
        .insert({
          user_id: user.id,
          tier: selectedTier as 'basic' | 'pro' | 'elite',
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
      // Reset form
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
    
    // Validate input using zod schema
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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 text-center">
          <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">You're at the Top!</h1>
          <p className="text-muted-foreground">
            You already have Elite access - the highest tier available.
          </p>
          <Link to="/dashboard">
            <Button className="mt-6">Return to Dashboard</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade Your Access Level</h1>
          <p className="text-muted-foreground">
            Unlock more participation opportunities with a higher tier
          </p>
        </div>

        {/* Info Notice */}
        <Alert className="mb-6 border-muted bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Membership fees are one-time registration payments for platform access. All registrations require admin verification before activation.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          {/* Tier Selection */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle>1. Select Your Access Level</CardTitle>
              <CardDescription>Choose the access level you want to upgrade to</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="grid md:grid-cols-3 gap-4">
                {availableTiers.map((tier) => {
                  const TierIcon = tier.icon;
                  return (
                    <div key={tier.id}>
                      <RadioGroupItem value={tier.id} id={tier.id} className="peer sr-only" />
                      <Label
                        htmlFor={tier.id}
                        className="flex flex-col items-center p-6 border-2 border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-muted transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center mb-3`}>
                          <TierIcon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-lg">{tier.name}</span>
                        <span className="text-2xl font-bold text-primary mt-1">₱{tier.price.toLocaleString()}</span>
                        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                          {tier.features.map((f) => (
                            <li key={f} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" /> {f}
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

          {/* Payment Method */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle>2. Choose Payment Method</CardTitle>
              <CardDescription>Send your registration fee to one of these accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="flex items-center space-x-4">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.accountName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-1 bg-muted rounded font-mono">{method.number}</code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(method.number);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedPaymentData && selectedTierData && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium">
                    Send exactly{' '}
                    <span className="text-primary font-bold text-lg">
                      ₱{selectedTierData.price.toLocaleString()}
                    </span>{' '}
                    to {selectedPaymentData.name}: {selectedPaymentData.number}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Proof */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle>3. Submit Verification</CardTitle>
              <CardDescription>Enter your transaction reference number and upload proof</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number *</Label>
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
                <Label htmlFor="proof">Payment Screenshot (Optional)</Label>
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
                    <Upload className="h-4 w-4" />
                    {proofFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot of your payment confirmation (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              disabled={submitPayment.isPending || isUploading} 
              className="px-12"
            >
              {submitPayment.isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit for Admin Review'
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Your registration will be verified within 24 hours. You'll receive a notification once approved.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
