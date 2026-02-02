import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useWallets } from '@/hooks/useWallets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  User, 
  Building2, 
  Search,
  AlertCircle,
  Check,
  Loader2,
  Shield,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoneyTransferWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecipientInfo {
  id: string;
  full_name: string;
  referral_code: string;
}

export function MoneyTransferWizard({ isOpen, onClose }: MoneyTransferWizardProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wallets } = useWallets();
  const mainWallet = wallets?.find(w => w.wallet_type === 'main');
  
  // Step 1: Transfer Type & Recipient
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientInfo | null>(null);
  const [searchResults, setSearchResults] = useState<RecipientInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // External transfer fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // Step 2: Amount
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  // Step 3: PIN
  const [pin, setPin] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Fees per Blueprint V8.0
  const INTERNAL_FEE = 5; // ₱5 for Internal (Member-to-Member)
  const EXTERNAL_FEE = 15; // ₱15 for External (Bank/E-Wallet)
  
  const fee = transferType === 'internal' ? INTERNAL_FEE : EXTERNAL_FEE;
  const totalAmount = Number(amount) + fee;

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, referral_code')
          .or(`full_name.ilike.%${searchQuery}%,referral_code.ilike.%${searchQuery}%`)
          .limit(5);

        if (!error && data) {
          // Filter out current user
          const { data: { user } } = await supabase.auth.getUser();
          setSearchResults(data.filter(p => p.id !== user?.id));
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (transferType === 'internal') {
        if (!selectedRecipient) {
          newErrors.recipient = 'Please select a recipient';
        }
      } else {
        if (!bankName.trim()) newErrors.bankName = 'Bank/E-Wallet name is required';
        if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (!/^[0-9]{10,20}$/.test(accountNumber.replace(/\D/g, ''))) {
          newErrors.accountNumber = 'Account number must be 10-20 digits';
        }
        if (!accountName.trim()) newErrors.accountName = 'Account name is required';
      }
    }

    if (currentStep === 2) {
      const numAmount = Number(amount);
      if (!amount || numAmount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (numAmount < 50) {
        newErrors.amount = 'Minimum transfer is ₳50';
      } else if (totalAmount > (mainWallet?.balance || 0)) {
        newErrors.amount = `Insufficient balance. You need ₳${totalAmount} (including ₳${fee} fee)`;
      }
    }

    if (currentStep === 3) {
      if (pin.length !== 6) {
        newErrors.pin = 'Please enter your 6-digit PIN';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // For internal transfers, use atomic RPC function
      if (transferType === 'internal' && selectedRecipient) {
        const { data, error } = await supabase.rpc('internal_transfer_atomic', {
          p_sender_id: user.id,
          p_recipient_id: selectedRecipient.id,
          p_amount: Number(amount),
          p_fee: fee,
          p_note: note || null
        });

        if (error) throw new Error(error.message);
        
        // Check RPC response for success
        const result = data as { success: boolean; error?: string };
        if (!result.success) {
          throw new Error(result.error || 'Transfer failed');
        }

        return result;

      } else {
        // External transfer - deduct and mark as pending
        const { data, error } = await supabase.rpc('cash_out_with_lock', {
          p_user_id: user.id,
          p_amount: Number(amount),
          p_fee_percent: (fee / Number(amount)) * 100,
          p_payment_method: bankName,
          p_account_name: accountName,
          p_account_number: accountNumber.replace(/\D/g, '')
        });

        if (error) throw new Error(error.message);
        
        const result = data as { success: boolean; error?: string };
        if (!result.success) {
          throw new Error(result.error || 'Transfer failed');
        }

        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: "Transfer Successful! ✅",
        description: transferType === 'internal' 
          ? `₳${amount} sent to ${selectedRecipient?.full_name}`
          : `₳${amount} transfer to ${bankName} is being processed`,
      });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    // In production, verify PIN here
    transferMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setTransferType('internal');
    setSearchQuery('');
    setSelectedRecipient(null);
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setAmount('');
    setNote('');
    setPin('');
    setErrors({});
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Send className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Select Recipient</h3>
              <p className="text-sm text-muted-foreground">Choose transfer type and recipient</p>
            </div>

            {/* Transfer Type Selection */}
            <RadioGroup
              value={transferType}
              onValueChange={(v) => setTransferType(v as 'internal' | 'external')}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="internal"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  transferType === 'internal' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="internal" id="internal" className="sr-only" />
                <User className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Internal</span>
                <span className="text-xs text-muted-foreground">₳{INTERNAL_FEE} Fee</span>
              </Label>
              
              <Label
                htmlFor="external"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  transferType === 'external' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="external" id="external" className="sr-only" />
                <Building2 className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">External</span>
                <span className="text-xs text-muted-foreground">₳{EXTERNAL_FEE} Fee</span>
              </Label>
            </RadioGroup>

            {transferType === 'internal' ? (
              <div className="space-y-3">
                <Label>Search Member (Name or Alpha ID)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or referral code..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedRecipient(null);
                    }}
                    className="pl-10"
                  />
                </div>

                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}

                {searchResults.length > 0 && !selectedRecipient && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <Card
                        key={user.id}
                        className={`p-3 cursor-pointer hover:border-primary/50 transition-all ${
                          selectedRecipient?.id === user.id ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => {
                          setSelectedRecipient(user);
                          setSearchQuery(user.full_name);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.referral_code}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedRecipient && (
                  <Card className="p-4 border-primary bg-primary/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{selectedRecipient.full_name}</p>
                          <p className="text-sm text-muted-foreground">ID: {selectedRecipient.referral_code}</p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  </Card>
                )}

                {errors.recipient && (
                  <p className="text-xs text-destructive">{errors.recipient}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank / E-Wallet Name</Label>
                  <Input
                    placeholder="e.g., GCash, Maya, BDO"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={errors.bankName ? 'border-destructive' : ''}
                  />
                  {errors.bankName && <p className="text-xs text-destructive">{errors.bankName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="e.g., 09171234567"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={errors.accountNumber ? 'border-destructive' : ''}
                  />
                  {errors.accountNumber && <p className="text-xs text-destructive">{errors.accountNumber}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input
                    placeholder="e.g., Juan Dela Cruz"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className={errors.accountName ? 'border-destructive' : ''}
                  />
                  {errors.accountName && <p className="text-xs text-destructive">{errors.accountName}</p>}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Banknote className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Enter Amount</h3>
              <p className="text-sm text-muted-foreground">Specify transfer amount</p>
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="font-bold text-primary font-mono">
                  ₳{(mainWallet?.balance || 0).toLocaleString()}
                </span>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`text-2xl font-mono text-center h-16 ${errors.amount ? 'border-destructive' : ''}`}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a message..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <Card className="p-4 border-primary/50 bg-primary/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transfer Amount</span>
                  <span className="font-mono">₳{Number(amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Transfer Fee ({transferType === 'internal' ? 'Internal' : 'External'})</span>
                  <span className="font-mono">₳{fee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-primary">
                  <span>Total Deduction</span>
                  <span className="font-mono">₳{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Authorize Transfer</h3>
              <p className="text-sm text-muted-foreground">Enter your 6-digit transaction PIN</p>
            </div>

            {/* Transfer Summary */}
            <Card className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">
                  {transferType === 'internal' 
                    ? selectedRecipient?.full_name 
                    : `${accountName} (${bankName})`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono text-primary font-bold">₳{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-mono">₳{fee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono text-primary">₳{totalAmount.toLocaleString()}</span>
              </div>
            </Card>

            {/* PIN Input */}
            <div className="flex flex-col items-center gap-4 py-4">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={setPin}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {errors.pin && <p className="text-xs text-destructive">{errors.pin}</p>}
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {transferType === 'internal' 
                  ? 'Internal transfers are instant and cannot be reversed.'
                  : 'External transfers are processed within 1-24 hours.'}
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Money Transfer
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext} className="bg-gradient-to-r from-primary to-primary/80">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={transferMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Confirm Transfer
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
