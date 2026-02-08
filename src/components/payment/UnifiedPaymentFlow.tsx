/**
 * UNIFIED PAYMENT FLOW - Canonical Premium Payment Experience
 * 
 * AMABILIA NETWORK STANDARD:
 * - Branded loading transition (1.5-2s)
 * - Simplified QR-only payment (no provider choices)
 * - Required proof upload before submit
 * - Cinematic glassmorphism UI
 * - Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Shield, 
  Clock,
  Sparkles,
  Camera,
  FileImage,
  X,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SuccessConfetti } from '@/components/ui/success-confetti';
import { AmabiliaPaymentLoader } from '@/components/ui/AmabiliaPaymentLoader';
import { usePaymentMethodsPolling } from '@/hooks/usePaymentMethodsPolling';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatAlpha } from '@/lib/utils';

type PaymentStep = 'loading' | 'qr' | 'upload' | 'pending' | 'complete';

interface UnifiedPaymentFlowProps {
  amount: number;
  type: 'cash-in' | 'membership';
  tier?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

// File validation constants
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function UnifiedPaymentFlow({
  amount,
  type,
  tier,
  onSuccess,
  onCancel,
  className
}: UnifiedPaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>('loading');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethodsPolling(15000);
  
  // Get the first available QR code (simplified - no provider choice)
  const activePaymentMethod = useMemo(() => {
    return paymentMethods.find(m => m.qrCodeUrl) || paymentMethods[0];
  }, [paymentMethods]);
  
  // Validation states
  const isProofValid = proofFile !== null;
  const isReferenceValid = referenceNumber.trim().length >= 4;
  const canSubmit = isProofValid && isReferenceValid && !isSubmitting;
  
  // Handle loading complete - transition to QR display
  const handleLoadingComplete = useCallback(() => {
    setStep('qr');
  }, []);
  
  // Handle file selection with validation
  const handleFileSelect = useCallback((file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, or PDF file',
      });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Maximum file size is 5MB',
      });
      return;
    }
    
    setProofFile(file);
  }, [toast]);
  
  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);
  
  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);
  
  // Copy account details to clipboard
  const handleCopyDetails = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: `${label} Copied`, 
        description: 'Paste this in your payment app' 
      });
    });
  }, [toast]);
  
  // Submit proof for review
  const handleSubmit = useCallback(async () => {
    if (!user || !proofFile || !referenceNumber.trim() || !activePaymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload proof and enter reference number',
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
      
      // Get session for edge function authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }
      
      // Call appropriate edge function based on type
      const endpoint = type === 'membership' 
        ? 'submit-membership-payment'
        : 'swap-cash-in';
      
      const body = type === 'membership'
        ? {
            tier,
            paymentMethod: activePaymentMethod.name,
            proofUrl: urlData.publicUrl,
            referenceNumber: referenceNumber.trim(),
          }
        : {
            amount,
            payment_method: activePaymentMethod.name,
            reference_number: referenceNumber.trim(),
            proof_url: urlData.publicUrl,
          };
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(body),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed');
      }
      
      setStep('pending');
      setShowConfetti(true);
      toast({
        title: '🎉 Payment Submitted!',
        description: 'Your payment is pending admin review',
      });
      
      // Callback after brief delay
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
      
    } catch (error) {
      console.error('[UNIFIED_PAYMENT] Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, proofFile, referenceNumber, activePaymentMethod, amount, type, tier, toast, onSuccess]);
  
  return (
    <div className={cn("relative", className)}>
      {/* AMABILIA Loading Transition */}
      <AmabiliaPaymentLoader 
        isLoading={step === 'loading'} 
        onComplete={handleLoadingComplete}
        duration={2000}
      />
      
      {/* Success Confetti */}
      <SuccessConfetti 
        isActive={showConfetti}
        variant="golden"
        particleCount={60}
        duration={3500}
      />
      
      <AnimatePresence mode="wait">
        {/* STEP: QR Code Display */}
        {step === 'qr' && (
          <motion.div
            key="qr-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Payment Amount Header */}
            <div className="text-center">
              <Badge className="bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30 mb-3">
                <Shield className="w-3 h-3 mr-1" />
                Secure Payment
              </Badge>
              <h2 className="text-xl font-bold text-white mb-1">
                Pay <span className="text-[#FFD700] font-mono">₳{formatAlpha(amount)}</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Scan the QR code using any e-wallet or online banking app
              </p>
            </div>
            
            {/* QR Code Card - Glassmorphism */}
            <Card className="relative overflow-hidden border-[#FFD700]/20 bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0d0d0d] backdrop-blur-2xl">
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent" />
              
              <CardContent className="p-6 sm:p-8">
                {methodsLoading ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FFD700] mb-3" />
                    <p className="text-sm text-muted-foreground">Loading payment gateway...</p>
                  </div>
                ) : activePaymentMethod?.qrCodeUrl && !qrLoadFailed ? (
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* QR Container with Bloom Effect */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,215,0,0.15)]"
                    >
                      <img 
                        src={activePaymentMethod.qrCodeUrl}
                        alt="Payment QR Code"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                        onError={() => setQrLoadFailed(true)}
                      />
                      
                      {/* Corner Accents */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FFD700]/50 rounded-tl" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#FFD700]/50 rounded-tr" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#FFD700]/50 rounded-bl" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FFD700]/50 rounded-br" />
                    </motion.div>
                    
                    {/* Payment Method Info */}
                    <div className="mt-6 text-center space-y-2">
                      <p className="text-sm font-medium text-white">
                        {activePaymentMethod.name}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg font-mono text-sm text-[#FFD700]">
                          {activePaymentMethod.number}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#FFD700] hover:bg-[#FFD700]/10"
                          onClick={() => handleCopyDetails(activePaymentMethod.number, 'Account Number')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activePaymentMethod.accountName}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <QrCode className="h-16 w-16 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">QR code not available</p>
                    {activePaymentMethod && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-white">{activePaymentMethod.name}</p>
                        <code className="text-[#FFD700] font-mono">{activePaymentMethod.number}</code>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
            </Card>
            
            {/* Instruction Alert */}
            <Alert className="border-[#FFD700]/20 bg-[#FFD700]/5">
              <AlertTriangle className="h-4 w-4 text-[#FFD700]" />
              <AlertDescription className="text-xs text-[#FFD700]/80">
                Pay exactly <strong className="text-[#FFD700]">₳{formatAlpha(amount)}</strong>. 
                Keep your transaction screenshot for the next step.
              </AlertDescription>
            </Alert>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 border-[#FFD700]/20 text-muted-foreground hover:bg-[#FFD700]/5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('upload')}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold hover:opacity-90"
              >
                I've Paid — Upload Proof
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* STEP: Proof Upload */}
        {step === 'upload' && (
          <motion.div
            key="upload-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center">
              <Badge className="bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30 mb-3">
                <FileImage className="w-3 h-3 mr-1" />
                Proof Required
              </Badge>
              <h2 className="text-xl font-bold text-white mb-1">
                Upload Payment Proof
              </h2>
              <p className="text-sm text-muted-foreground">
                Submit your payment screenshot for admin verification
              </p>
            </div>
            
            {/* Drag & Drop Upload Zone */}
            <Card className="border-[#FFD700]/20 bg-[#050505]/80 backdrop-blur-2xl">
              <CardContent className="p-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('proof-upload-input')?.click()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                    isDragging 
                      ? "border-[#FFD700] bg-[#FFD700]/10" 
                      : proofFile 
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-[#FFD700]/20 hover:border-[#FFD700]/40 hover:bg-[#FFD700]/5"
                  )}
                >
                  {proofFile ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                      </div>
                      <p className="font-medium text-white truncate max-w-[200px]">
                        {proofFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs text-muted-foreground hover:text-[#FFD700]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProofFile(null);
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-[#FFD700]" />
                      </div>
                      <p className="text-sm text-white font-medium mb-1">
                        {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, PDF • Max 5MB
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('proof-upload-input')?.click();
                          }}
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          Take Photo
                        </Button>
                      </div>
                    </>
                  )}
                  
                  <input
                    id="proof-upload-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    capture="environment"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Reference Number Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#FFD700]">
                Transaction Reference Number
              </Label>
              <Input
                placeholder="Enter your payment reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className={cn(
                  "h-12 font-mono bg-[#050505] border-[#FFD700]/20",
                  "focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20",
                  "placeholder:text-muted-foreground/50"
                )}
              />
              <p className="text-[10px] text-muted-foreground">
                Enter the reference number from your payment receipt
              </p>
            </div>
            
            {/* Submit Button - DISABLED until proof uploaded */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('qr')}
                className="flex-1 border-[#FFD700]/20 text-muted-foreground"
              >
                Back
              </Button>
              <motion.div className="flex-1" whileTap={{ scale: canSubmit ? 0.95 : 1 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={cn(
                    "w-full h-12 font-semibold transition-all",
                    canSubmit
                      ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 shadow-lg shadow-[#FFD700]/20"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : canSubmit ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Proof to Continue
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* STEP: Pending Review */}
        {step === 'pending' && (
          <motion.div
            key="pending-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 12 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10 border-2 border-[#FFD700]/40 flex items-center justify-center"
            >
              <Sparkles className="h-10 w-10 text-[#FFD700] animate-pulse" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                🎉 Payment Submitted!
              </h2>
              <p className="text-muted-foreground">
                Your payment is pending admin review
              </p>
            </motion.div>
            
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-[#FFD700]/20 bg-[#FFD700]/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono font-bold text-[#FFD700]">
                      ₳{formatAlpha(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs text-white truncate max-w-[150px]">
                      {referenceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-muted-foreground"
            >
              You'll receive a notification when your payment is approved
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* System Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-3 rounded-lg bg-[#050505]/50 border border-[#FFD700]/10"
      >
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-[#FFD700]" />
            <span>Alpha Sovereign Payment Gateway</span>
          </div>
          <span>End-to-End Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}

export default UnifiedPaymentFlow;
