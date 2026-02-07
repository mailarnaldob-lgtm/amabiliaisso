import { useState } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAdCampaigns, CAMPAIGN_TYPES, PROOF_TYPES, CreateCampaignInput } from '@/hooks/useAdCampaigns';
import { useWallets } from '@/hooks/useWallets';
import { ChevronLeft, ChevronRight, Rocket, Sparkles, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
 import { OdometerNumber } from '@/components/command/OdometerNumber';
 import { cn } from '@/lib/utils';

interface AdWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdWizardModal({ isOpen, onClose }: AdWizardModalProps) {
  const [step, setStep] = useState(1);
  const { createCampaign } = useAdCampaigns();
  const { wallets } = useWallets();
  const mainWallet = wallets?.find(w => w.wallet_type === 'main');
  
  const [formData, setFormData] = useState<CreateCampaignInput>({
    title: '',
    description: '',
    campaign_type: 'social_engagement',
    target_url: '',
    proof_type: 'screenshot',
    reward_per_task: 5,
    total_budget: 500,
    max_completions: 100,
    required_level: 'pro',
    expires_days: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const platformFee = formData.total_budget * 0.10;
  const netBudget = formData.total_budget - platformFee;
  const estimatedCompletions = Math.floor(netBudget / formData.reward_per_task);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Campaign title is required';
      if (formData.title.length > 100) newErrors.title = 'Title must be under 100 characters';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length > 500) newErrors.description = 'Description must be under 500 characters';
    }

    if (currentStep === 2) {
      if (!formData.target_url.trim()) newErrors.target_url = 'Target URL is required';
      if (!formData.target_url.startsWith('http')) newErrors.target_url = 'URL must start with http:// or https://';
    }

    if (currentStep === 3) {
      if (formData.total_budget < 100) newErrors.total_budget = 'Minimum budget is ₳100';
      if (formData.reward_per_task < 1) newErrors.reward_per_task = 'Minimum reward is ₳1';
      if (formData.max_completions < 1) newErrors.max_completions = 'At least 1 completion required';
      if (formData.reward_per_task * formData.max_completions > netBudget) {
        newErrors.max_completions = 'Budget insufficient for specified completions';
      }
      if (mainWallet && formData.total_budget > (mainWallet.balance || 0)) {
        newErrors.total_budget = 'Insufficient balance';
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

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    await createCampaign.mutateAsync(formData);
    onClose();
    setStep(1);
    setFormData({
      title: '',
      description: '',
      campaign_type: 'social_engagement',
      target_url: '',
      proof_type: 'screenshot',
      reward_per_task: 5,
      total_budget: 500,
      max_completions: 100,
      required_level: 'pro',
      expires_days: 30,
    });
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Campaign Details</h3>
              <p className="text-sm text-muted-foreground">Tell us about your campaign</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g., Watch My YouTube Video"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what users need to do..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select
                value={formData.campaign_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold">Target & Proof</h3>
              <p className="text-sm text-muted-foreground">Where should users go?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_url">Target URL</Label>
              <Input
                id="target_url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.target_url}
                onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                className={errors.target_url ? 'border-destructive' : ''}
              />
              {errors.target_url && <p className="text-xs text-destructive">{errors.target_url}</p>}
            </div>

            <div className="space-y-2">
              <Label>Proof Type Required</Label>
              <Select
                value={formData.proof_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, proof_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROOF_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Required Membership Level</Label>
              <Select
                value={formData.required_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, required_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">PRO Members</SelectItem>
                  <SelectItem value="expert">EXPERT Members</SelectItem>
                  <SelectItem value="elite">ELITE Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold">Budget & Rewards</h3>
              <p className="text-sm text-muted-foreground">Set your campaign budget</p>
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="font-bold text-primary">₳{(mainWallet?.balance || 0).toLocaleString()}</span>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_budget">Total Budget (₳)</Label>
                <Input
                  id="total_budget"
                  type="number"
                  min={100}
                  value={formData.total_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_budget: Number(e.target.value) }))}
                  className={errors.total_budget ? 'border-destructive' : ''}
                />
                {errors.total_budget && <p className="text-xs text-destructive">{errors.total_budget}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_per_task">Reward Per Task (₳)</Label>
                <Input
                  id="reward_per_task"
                  type="number"
                  min={1}
                  value={formData.reward_per_task}
                  onChange={(e) => setFormData(prev => ({ ...prev, reward_per_task: Number(e.target.value) }))}
                  className={errors.reward_per_task ? 'border-destructive' : ''}
                />
                {errors.reward_per_task && <p className="text-xs text-destructive">{errors.reward_per_task}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_completions">Maximum Completions</Label>
              <Input
                id="max_completions"
                type="number"
                min={1}
                value={formData.max_completions}
                onChange={(e) => setFormData(prev => ({ ...prev, max_completions: Number(e.target.value) }))}
                className={errors.max_completions ? 'border-destructive' : ''}
              />
              {errors.max_completions && <p className="text-xs text-destructive">{errors.max_completions}</p>}
            </div>

            <Card className="p-4 border-amber-500/50 bg-amber-500/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Platform Fee (10%)</span>
                  <span className="text-muted-foreground">₳{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Campaign Budget</span>
                  <span className="font-medium">₳{netBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary font-semibold">
                  <span>Est. Completions</span>
                  <span>~{estimatedCompletions} tasks</span>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Review & Launch</h3>
              <p className="text-sm text-muted-foreground">Confirm your campaign details</p>
            </div>

            <Card className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium text-right max-w-[200px] truncate">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{CAMPAIGN_TYPES.find(t => t.value === formData.campaign_type)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward/Task</span>
                <span className="text-primary font-bold">₳{formData.reward_per_task}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-bold">₳{formData.total_budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Completions</span>
                <span>{formData.max_completions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proof Type</span>
                <span>{PROOF_TYPES.find(t => t.value === formData.proof_type)?.label}</span>
              </div>
            </Card>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Your campaign will be reviewed by our team before going live. 
                Budget will be deducted immediately and held in escrow.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
       <DialogContent 
         className={cn(
           "max-w-[90vw] max-h-[90vh] sm:max-w-lg w-full overflow-hidden",
           "bg-background/95 backdrop-blur-xl border-amber-500/30",
           "shadow-2xl shadow-amber-500/10"
         )}
       >
         <DialogHeader className="border-b border-border/50 pb-4">
          <DialogTitle className="flex items-center gap-2">
             <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
               <Sparkles className="h-4 w-4 text-white" />
             </div>
            <span>Ad Wizard</span>
          </DialogTitle>
           <DialogDescription className="text-xs text-muted-foreground">
             Deploy capital across the Sovereign Network
           </DialogDescription>
        </DialogHeader>

         {/* SOVEREIGN V12.1: Available for All Accounts Notice */}
         <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-2">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
           <span className="text-[11px] text-emerald-400 font-medium">
             Available for All Accounts • Create campaigns without activation
           </span>
         </div>

         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.3 }}
           className="space-y-4"
         >
         <div className="mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

         <AnimatePresence mode="wait" initial={false}>
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
            <Button onClick={handleNext} className="bg-gradient-to-r from-amber-500 to-amber-600">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createCampaign.isPending}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              {createCampaign.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Launch Campaign
                </>
              )}
            </Button>
          )}
        </div>
         </motion.div>
      </DialogContent>
    </Dialog>
  );
}
