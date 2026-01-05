import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  QrCode, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  Download,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ExchangerStep = 'input' | 'payment' | 'verification' | 'pending' | 'complete';

interface ExchangerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExchangerModal({ open, onOpenChange }: ExchangerModalProps) {
  const [step, setStep] = useState<ExchangerStep>('input');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const { toast } = useToast();

  const phpAmount = parseFloat(amount) || 0;
  const alphaAmount = phpAmount; // 1:1 peg

  const handleCopyQR = () => {
    navigator.clipboard.writeText('ALPHA-QRPH-12345-DEMO');
    toast({ title: "QR Reference Copied", description: "Paste this in your payment app" });
  };

  const handleSubmitProof = () => {
    setStep('pending');
    // In production: Submit to edge function for admin review
  };

  const resetModal = () => {
    setStep('input');
    setAmount('');
    setReferenceNumber('');
    setProofFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">₳</span>
            LPHA Exchanger
          </DialogTitle>
          <DialogDescription>
            Convert PHP to ₳ Credits (1:1 rate)
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
                <div className={`w-8 h-0.5 ${
                  ['input', 'payment', 'verification', 'pending', 'complete'].indexOf(step) > i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Input Amount */}
        {step === 'input' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phpAmount">Enter PHP Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                <Input
                  id="phpAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-xl font-bold"
                />
              </div>
            </div>

            {phpAmount > 0 && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">You will receive</p>
                      <p className="text-2xl font-bold text-amber-600">₳{alphaAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span>1:1 Rate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Minimum: ₱100 | Maximum: ₱50,000</p>
              <p>• Processing time: Admin-reviewed within 24 hours</p>
              <p>• ₳ Credits are non-monetary internal units</p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              disabled={phpAmount < 100 || phpAmount > 50000}
              onClick={() => setStep('payment')}
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment View (QR Code) */}
        {step === 'payment' && (
          <div className="space-y-4">
            <Card className="border-2 border-dashed border-primary/30">
              <CardContent className="p-6 text-center">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="h-32 w-32 text-foreground/20" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Scan to Pay</p>
                <p className="font-bold text-xl">₱{phpAmount.toLocaleString()}</p>
                <Badge className="mt-2 bg-primary/10 text-primary">QRPH Demo</Badge>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCopyQR}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Reference
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pay the exact amount shown. After payment, proceed to verification.
              </p>
            </div>

            <Button 
              className="w-full"
              onClick={() => setStep('verification')}
            >
              I've Made the Payment
            </Button>
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
                    <span className="font-medium">{proofFile.name}</span>
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
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              disabled={!referenceNumber || !proofFile}
              onClick={handleSubmitProof}
            >
              Submit for Review
            </Button>
          </div>
        )}

        {/* Step 4: Pending State */}
        {step === 'pending' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Converting...</h3>
              <p className="text-sm text-muted-foreground">Pending Admin Review</p>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">₱{phpAmount.toLocaleString()} → ₳{alphaAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs">{referenceNumber}</span>
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
              <p className="text-3xl font-bold text-primary mt-2">₳{alphaAmount.toLocaleString()}</p>
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

        {/* Demo Notice */}
        <div className="mt-2 p-2 rounded-lg bg-muted/30 border border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            UI MOCKUP • Demo mode - no actual transactions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
