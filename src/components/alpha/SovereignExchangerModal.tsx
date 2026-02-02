/**
 * ALPHA EXCHANGER SOVEREIGN - Production-Grade Exchange Modal
 * 
 * Stability-First Architecture:
 * - Standard REST polling (no WebSockets)
 * - Fail-safe UI rendering
 * - Dynamic QR code generation
 * - Comprehensive input validation
 */

import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  QrCode, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  RefreshCw,
  Smartphone,
  Building2,
  Shield,
  Loader2,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethodsPolling, PaymentMethod } from '@/hooks/usePaymentMethodsPolling';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type ExchangerStep = 'input' | 'payment' | 'verification' | 'pending' | 'complete';

interface SovereignExchangerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Validation constants
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50000;

export function SovereignExchangerModal({ open, onOpenChange }: SovereignExchangerModalProps) {
  const [step, setStep] = useState<ExchangerStep>('input');
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Use the polling-based hook for stability
  const { 
    paymentMethods, 
    isLoading: methodsLoading, 
    isError: methodsError,
    isStale,
    refetch: refetchMethods,
    lastUpdated
  } = usePaymentMethodsPolling(15000); // 15-second polling

  const phpAmount = parseFloat(amount) || 0;
  const alphaAmount = phpAmount; // 1:1 peg

  // Find selected payment method
  const selectedMethod = useMemo(() => {
    return paymentMethods.find(m => m.id === selectedMethodId) || null;
  }, [paymentMethods, selectedMethodId]);

  // Validation
  const isAmountValid = phpAmount >= MIN_AMOUNT && phpAmount <= MAX_AMOUNT;
  const canProceedToPayment = isAmountValid && selectedMethodId;

  // Copy account details to clipboard
  const handleCopyDetails = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: `${label} Copied`, 
        description: 'Paste this in your payment app' 
      });
    }).catch(() => {
      toast({ 
        variant: 'destructive',
        title: 'Copy Failed', 
        description: 'Please copy manually' 
      });
    });
  }, [toast]);

  // Submit proof for admin review
  const handleSubmitProof = useCallback(async () => {
    if (!user || !proofFile || !referenceNumber || !selectedMethod) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill all required fields',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload proof to storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Submit cash-in request via edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/swap-cash-in`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            amount: phpAmount,
            payment_method: selectedMethod.name,
            reference_number: referenceNumber,
            proof_url: urlData.publicUrl,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setStep('pending');
      toast({
        title: 'Proof Submitted',
        description: 'Your payment is pending admin review',
      });
    } catch (error) {
      console.error('[EXCHANGER] Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, proofFile, referenceNumber, selectedMethod, phpAmount, toast]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStep('input');
    setAmount('');
    setSelectedMethodId('');
    setReferenceNumber('');
    setProofFile(null);
    setIsSubmitting(false);
  }, []);

  // Get payment method icon
  const getMethodIcon = (methodName: string) => {
    const name = methodName.toLowerCase();
    if (name.includes('gcash') || name.includes('maya') || name.includes('paymaya')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Building2 className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">₳</span>
            LPHA Sovereign Exchanger
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Convert PHP to ₳ Credits (1:1 rate)
            {isStale && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                <WifiOff className="h-3 w-3 mr-1" />
                Cached
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          {['input', 'payment', 'verification', 'pending', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s 
                  ? 'bg-primary text-primary-foreground' 
                  : ['input', 'payment', 'verification', 'pending', 'complete'].indexOf(step) > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 4 && (
                <div className={`w-6 h-0.5 ${
                  ['input', 'payment', 'verification', 'pending', 'complete'].indexOf(step) > i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Input Amount & Select Method */}
        {step === 'input' && (
          <div className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="phpAmount">Enter PHP Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₱</span>
                <Input
                  id="phpAmount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-xl font-mono"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Min: ₱{MIN_AMOUNT.toLocaleString()} | Max: ₱{MAX_AMOUNT.toLocaleString()}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Payment Method</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchMethods()}
                  disabled={methodsLoading}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${methodsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {methodsLoading && paymentMethods.length === 0 ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : methodsError && paymentMethods.length === 0 ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load payment methods. Please try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(method.name)}
                          <span>{method.name}</span>
                          {method.qrCodeUrl && (
                            <Badge variant="outline" className="text-xs ml-2">QR</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Preview Card */}
            {phpAmount > 0 && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">You will receive</p>
                      <p className="text-2xl font-mono font-bold text-amber-600">
                        ₳{Math.floor(alphaAmount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span>1:1 Rate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Processing time: Admin-reviewed within 24 hours</p>
              <p>• ₳ Credits are non-monetary internal units</p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              disabled={!canProceedToPayment}
              onClick={() => setStep('payment')}
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment View */}
        {step === 'payment' && selectedMethod && (
          <div className="space-y-4">
            {/* Payment Details Card */}
            <Card className="border-2 border-primary/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary">
                    {getMethodIcon(selectedMethod.name)}
                    <span className="ml-1">{selectedMethod.name}</span>
                  </Badge>
                  <span className="text-xl font-mono font-bold">₱{phpAmount.toLocaleString()}</span>
                </div>

                {/* QR Code or Account Details */}
                {selectedMethod.qrCodeUrl ? (
                  <div className="text-center space-y-3">
                    <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border border-border">
                      <img 
                        src={selectedMethod.qrCodeUrl} 
                        alt={`${selectedMethod.name} QR Code`}
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          // Fallback if QR image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-muted">
                              <span class="text-muted-foreground text-sm">QR Not Available</span>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Scan to Pay</p>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No QR code available</p>
                    <p className="text-xs text-muted-foreground">Use account details below</p>
                  </div>
                )}

                {/* Account Details */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Number:</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="font-mono text-sm h-auto py-1 px-2"
                      onClick={() => handleCopyDetails(selectedMethod.number, 'Account Number')}
                    >
                      {selectedMethod.number}
                      <Copy className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Name:</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-sm h-auto py-1 px-2"
                      onClick={() => handleCopyDetails(selectedMethod.accountName, 'Account Name')}
                    >
                      {selectedMethod.accountName}
                      <Copy className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-xs text-amber-600">
                Pay the exact amount: <strong>₱{phpAmount.toLocaleString()}</strong>. 
                After payment, proceed to upload your proof.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1"
                onClick={() => setStep('verification')}
              >
                I've Made the Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verification (Proof Upload) */}
        {step === 'verification' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refNumber">Transaction Reference Number</Label>
              <Input
                id="refNumber"
                placeholder="Enter your payment reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Payment Screenshot</Label>
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('proofUpload')?.click()}
              >
                {proofFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium truncate max-w-[200px]">{proofFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input 
                  id="proofUpload" 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (5MB max)
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
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                disabled={!referenceNumber.trim() || !proofFile || isSubmitting}
                onClick={handleSubmitProof}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Pending State */}
        {step === 'pending' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Conversion Pending</h3>
              <p className="text-sm text-muted-foreground">Awaiting Admin Review</p>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">₱{phpAmount.toLocaleString()} → ₳{Math.floor(alphaAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs truncate max-w-[150px]">{referenceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">
              You'll receive a notification when approved
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 'complete' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Conversion Complete!</h3>
              <p className="text-3xl font-mono font-bold text-primary mt-2">
                ₳{Math.floor(alphaAmount).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">credited to your wallet</p>
            </div>
            <Button onClick={() => {
              resetModal();
              onOpenChange(false);
            }}>
              Done
            </Button>
          </div>
        )}

        {/* System Notice */}
        <div className="mt-2 p-2 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              Alpha Sovereign Ledger v2.0
            </p>
            {lastUpdated && (
              <p className="text-[10px] text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SovereignExchangerModal;
