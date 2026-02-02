/**
 * PAYMENT ASSET MANAGER V2.2 - Ultra-Stable QR Command Center
 * 
 * Independent Admin Control Module for QR Code Management
 * - Atomic save operations
 * - Standard RESTful logic (no WebSockets)
 * - 15-second global polling sync
 * - Zero state-blocking architecture
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlphaLoader } from '@/components/ui/AlphaLoader';
import { 
  QrCode,
  Upload,
  Trash2,
  Save,
  ImageIcon,
  Loader2,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wallet,
  Smartphone,
  Building2,
  Zap,
  Globe
} from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface PaymentAsset {
  id: string;
  name: string;
  number: string;
  accountName: string;
  qrCodeUrl: string | null;
}

const DEFAULT_PAYMENT_ASSETS: PaymentAsset[] = [
  { id: 'gcash', name: 'GCash', number: '', accountName: '', qrCodeUrl: null },
  { id: 'maya', name: 'Maya', number: '', accountName: '', qrCodeUrl: null },
  { id: 'bpi', name: 'BPI', number: '', accountName: '', qrCodeUrl: null },
  { id: 'bdo', name: 'BDO', number: '', accountName: '', qrCodeUrl: null },
];

// Wallet address validation patterns
const validateWalletAddress = (address: string, type: string): { valid: boolean; message: string } => {
  if (!address || address.trim().length === 0) {
    return { valid: false, message: 'Address is required' };
  }
  
  const trimmed = address.trim();
  
  // Minimum length check
  if (trimmed.length < 8) {
    return { valid: false, message: 'Address must be at least 8 characters' };
  }
  
  // Type-specific validation
  const lowerType = type.toLowerCase();
  
  if (lowerType === 'gcash' || lowerType === 'maya' || lowerType === 'paymaya') {
    // Philippine mobile number format
    const cleanNumber = trimmed.replace(/[\s\-]/g, '');
    const mobilePattern = /^(09|\+639)\d{9,10}$/;
    if (!mobilePattern.test(cleanNumber)) {
      return { valid: false, message: 'Invalid mobile number format (e.g., 09171234567)' };
    }
  } else if (lowerType === 'bpi' || lowerType === 'bdo' || lowerType === 'metrobank' || lowerType === 'unionbank') {
    // Bank account: 10-16 digits
    const cleanBank = trimmed.replace(/[\s\-]/g, '');
    const bankPattern = /^\d{10,16}$/;
    if (!bankPattern.test(cleanBank)) {
      return { valid: false, message: 'Bank account must be 10-16 digits' };
    }
  }
  
  return { valid: true, message: '' };
};

export function PaymentAssetManager() {
  const { toast } = useToast();
  
  // State
  const [paymentAssets, setPaymentAssets] = useState<PaymentAsset[]>(DEFAULT_PAYMENT_ASSETS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Fetch payment assets using standard REST call
   */
  const fetchPaymentAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'payment_methods')
        .single();
      
      if (error) {
        console.error('[PaymentAssetManager] Fetch error:', error);
        // Keep existing data on error (fail-safe)
        return;
      }
      
      if (data?.value && Array.isArray(data.value)) {
        // Safe type assertion with validation
        const assets = (data.value as unknown as PaymentAsset[]).filter(
          (item): item is PaymentAsset => 
            typeof item === 'object' && 
            item !== null && 
            'id' in item && 
            'name' in item
        );
        if (assets.length > 0) {
          setPaymentAssets(assets);
        }
      }
      setLastSynced(new Date());
    } catch (error) {
      console.error('[PaymentAssetManager] Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPaymentAssets();
  }, [fetchPaymentAssets]);

  /**
   * Handle field changes with validation
   */
  const handleFieldChange = useCallback((index: number, field: keyof PaymentAsset, value: string) => {
    setPaymentAssets(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    
    // Clear validation error when user types
    if (field === 'number') {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-number`];
        return newErrors;
      });
    }
  }, []);

  /**
   * Upload QR code image with validation
   */
  const handleQRUpload = useCallback(async (index: number, file: File) => {
    const asset = paymentAssets[index];
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'QR image must be under 5MB',
      });
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Only PNG, JPG, or SVG files allowed',
      });
      return;
    }
    
    setUploadingFor(asset.id);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${asset.id}/${Date.now()}.${fileExt}`;
      
      // Delete existing QR for this method
      try {
        const { data: existingFiles } = await supabase.storage
          .from('qr-codes')
          .list(asset.id);
        
        if (existingFiles && existingFiles.length > 0) {
          await supabase.storage
            .from('qr-codes')
            .remove(existingFiles.map(f => `${asset.id}/${f.name}`));
        }
      } catch {
        // Silent fail - cleanup is optional
      }
      
      // Upload new QR
      const { error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(fileName);
      
      // Update local state
      setPaymentAssets(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], qrCodeUrl: urlData.publicUrl };
        return updated;
      });
      
      toast({
        title: 'QR Uploaded',
        description: 'Remember to click SAVE to apply changes globally',
      });
    } catch (error) {
      console.error('[PaymentAssetManager] Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Please try again',
      });
    } finally {
      setUploadingFor(null);
    }
  }, [paymentAssets, toast]);

  /**
   * Remove QR code
   */
  const handleRemoveQR = useCallback((index: number) => {
    setPaymentAssets(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qrCodeUrl: null };
      return updated;
    });
    
    toast({
      title: 'QR Removed',
      description: 'Click SAVE to apply changes globally',
    });
  }, [toast]);

  /**
   * Validate all wallet addresses before saving
   */
  const validateAllAddresses = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let hasErrors = false;
    
    paymentAssets.forEach((asset, index) => {
      if (asset.number && asset.number.trim()) {
        const result = validateWalletAddress(asset.number, asset.name);
        if (!result.valid) {
          errors[`${index}-number`] = result.message;
          hasErrors = true;
        }
      }
    });
    
    setValidationErrors(errors);
    return !hasErrors;
  }, [paymentAssets]);

  /**
   * ATOMIC SAVE - Single database update with global sync
   */
  const handleAtomicSave = useCallback(async () => {
    // Validate before saving
    if (!validateAllAddresses()) {
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: 'Please fix wallet address format errors',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Cast to Json type for Supabase
      const jsonValue = paymentAssets as unknown as Json;
      
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: jsonValue,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'payment_methods');
      
      if (error) throw error;
      
      setLastSynced(new Date());
      
      toast({
        title: '✓ Update Successful',
        description: 'Payment assets synced globally. All users will see changes on next refresh.',
      });
    } catch (error) {
      console.error('[PaymentAssetManager] Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  }, [paymentAssets, validateAllAddresses, toast]);

  /**
   * Get icon for payment method
   */
  const getMethodIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('gcash') || lower.includes('maya') || lower.includes('paymaya')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Building2 className="h-4 w-4" />;
  };

  // Loading state with Alpha Loader
  if (isLoading) {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
        <CardContent className="p-12">
          <AlphaLoader size="sm" message="LOADING PAYMENT ASSETS" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-mono">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <QrCode className="h-6 w-6 text-amber-500" />
              </div>
              PAYMENT ASSET MANAGER
            </CardTitle>
            <CardDescription className="mt-2">
              QR Command Center • Ultra-Stable • Global Sync
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {lastSynced && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 font-mono text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Synced {lastSynced.toLocaleTimeString()}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentAssets}
              className="border-amber-500/30 hover:bg-amber-500/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Instructions Panel */}
        <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4 text-amber-500" />
            QR Asset Configuration Protocol
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500">1</span>
                Upload QR code images (PNG/SVG, max 5MB)
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500">2</span>
                Enter wallet address as fallback
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500">3</span>
                Click SAVE for atomic global sync
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500">4</span>
                Users auto-receive updates via 15s polling
              </p>
            </div>
          </div>
        </div>

        {/* Payment Assets Grid */}
        <div className="grid gap-6">
          {paymentAssets.map((asset, index) => (
            <div 
              key={asset.id}
              className="border border-amber-500/20 rounded-xl p-6 bg-card/50 hover:border-amber-500/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-base px-3 py-1.5">
                  {getMethodIcon(asset.name)}
                  <span className="ml-2">{asset.name}</span>
                </Badge>
                <div className="flex items-center gap-2">
                  {asset.qrCodeUrl ? (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      QR Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      No QR
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Account Details Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Wallet className="h-3 w-3" />
                      Account Number / Mobile
                    </Label>
                    <Input
                      value={asset.number}
                      onChange={(e) => handleFieldChange(index, 'number', e.target.value)}
                      placeholder="e.g., 09171234567 or 1234567890"
                      className={`bg-background font-mono border-amber-500/20 focus:border-amber-500/50 ${
                        validationErrors[`${index}-number`] ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors[`${index}-number`] && (
                      <p className="text-xs text-red-500">{validationErrors[`${index}-number`]}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Account Holder Name
                    </Label>
                    <Input
                      value={asset.accountName}
                      onChange={(e) => handleFieldChange(index, 'accountName', e.target.value)}
                      placeholder="e.g., Amabilia Network"
                      className="bg-background border-amber-500/20 focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* QR Upload Column */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <QrCode className="h-3 w-3" />
                    QR Code Image
                  </Label>
                  <div className="border-2 border-dashed border-amber-500/30 rounded-xl p-4 text-center hover:border-amber-500/50 transition-colors bg-amber-500/5">
                    {uploadingFor === asset.id ? (
                      <div className="py-8">
                        <AlphaLoader size="sm" message="UPLOADING QR ASSET" />
                      </div>
                    ) : asset.qrCodeUrl ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img 
                            src={asset.qrCodeUrl} 
                            alt={`${asset.name} QR Code`}
                            className="w-32 h-32 mx-auto rounded-xl object-cover border-2 border-amber-500/30 shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center gap-3">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleQRUpload(index, file);
                              }}
                            />
                            <Button variant="outline" size="sm" asChild className="border-amber-500/30 hover:bg-amber-500/10">
                              <span>
                                <Upload className="h-4 w-4 mr-1" />
                                Replace
                              </span>
                            </Button>
                          </label>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleRemoveQR(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-6">
                        <input
                          type="file"
                          accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQRUpload(index, file);
                          }}
                        />
                        <div className="w-14 h-14 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 border border-amber-500/30">
                          <ImageIcon className="h-7 w-7 text-amber-500" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Click to upload QR code
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, SVG up to 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-amber-500/20" />

        {/* Atomic Save Button */}
        <Button 
          onClick={handleAtomicSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-6 text-lg font-mono shadow-lg shadow-amber-500/20"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              SYNCING GLOBALLY...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              ATOMIC SAVE • GLOBAL SYNC
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Changes propagate to all users via 15-second REST polling • Zero WebSocket dependency
        </p>
      </CardContent>
    </Card>
  );
}

export default PaymentAssetManager;
