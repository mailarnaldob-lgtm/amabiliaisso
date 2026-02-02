import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethods, useUpdatePaymentMethods, useUploadQRCode, PaymentMethod } from '@/hooks/usePaymentMethods';
import { TaskManagementPanel } from '@/components/admin/TaskManagementPanel';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  QrCode,
  Upload,
  Trash2,
  Save,
  ImageIcon,
  Loader2,
  Shield,
  Bell,
  Building2,
  Zap
} from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(false);

  // Payment methods management
  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const updatePaymentMethods = useUpdatePaymentMethods();
  const uploadQRCode = useUploadQRCode();
  const [editedMethods, setEditedMethods] = useState<PaymentMethod[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    if (paymentMethods) {
      setEditedMethods(paymentMethods);
    }
  }, [paymentMethods]);

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const handleMethodChange = (index: number, field: keyof PaymentMethod, value: string) => {
    const updated = [...editedMethods];
    updated[index] = { ...updated[index], [field]: value };
    setEditedMethods(updated);
  };

  const handleQRUpload = async (index: number, file: File) => {
    const method = editedMethods[index];
    setUploadingFor(method.id);
    
    try {
      const url = await uploadQRCode.mutateAsync({ file, methodId: method.id });
      const updated = [...editedMethods];
      updated[index] = { ...updated[index], qrCodeUrl: url };
      setEditedMethods(updated);
      
      // Save immediately after upload
      await updatePaymentMethods.mutateAsync(updated);
    } catch (error) {
      console.error('QR upload failed:', error);
    } finally {
      setUploadingFor(null);
    }
  };

  const handleRemoveQR = async (index: number) => {
    const updated = [...editedMethods];
    updated[index] = { ...updated[index], qrCodeUrl: null };
    setEditedMethods(updated);
    await updatePaymentMethods.mutateAsync(updated);
  };

  const handleSavePaymentMethods = async () => {
    await updatePaymentMethods.mutateAsync(editedMethods);
  };

  return (
    <AdminPageWrapper 
      title="SYSTEM CONFIGURATION" 
      description="Manage platform settings and payment configuration"
    >
      {() => (
        <div className="space-y-8 max-w-4xl">
          {/* Notification Center */}
          <AdminNotificationCenter />

          {/* Exchanger Payment & QR Codes Configuration */}
          <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-mono">
                    <QrCode className="h-6 w-6 text-primary" />
                    Exchanger Payment & QR Codes
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure payment receiver accounts and upload QR codes for the PHP → Alpha exchanger system
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  Exchanger Config
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading payment methods...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Instructions */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      How to Configure Exchanger QR Codes
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Enter your payment receiver account details (account number, name)</li>
                      <li>Upload a clear QR code image for each payment method</li>
                      <li>Users will see these QR codes when converting PHP to Alpha (₳)</li>
                      <li>Click "Save Payment Methods" after making changes</li>
                    </ol>
                  </div>

                  {/* Payment Methods Grid */}
                  <div className="grid gap-6">
                    {editedMethods.map((method, index) => (
                      <div 
                        key={method.id} 
                        className="border border-primary/10 rounded-xl p-6 bg-card/50 hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-base px-3 py-1">
                            {method.name}
                          </Badge>
                          {method.qrCodeUrl && (
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                              QR Active
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Account Details */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`name-${index}`} className="text-sm font-medium text-muted-foreground">
                                Display Name
                              </Label>
                              <Input
                                id={`name-${index}`}
                                value={method.name}
                                onChange={(e) => handleMethodChange(index, 'name', e.target.value)}
                                className="bg-background border-primary/10 focus:border-primary/30"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`number-${index}`} className="text-sm font-medium text-muted-foreground">
                                Account Number / Mobile
                              </Label>
                              <Input
                                id={`number-${index}`}
                                value={method.number}
                                onChange={(e) => handleMethodChange(index, 'number', e.target.value)}
                                placeholder="e.g., 09171234567"
                                className="bg-background font-mono border-primary/10 focus:border-primary/30"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`accountName-${index}`} className="text-sm font-medium text-muted-foreground">
                                Account Holder Name
                              </Label>
                              <Input
                                id={`accountName-${index}`}
                                value={method.accountName}
                                onChange={(e) => handleMethodChange(index, 'accountName', e.target.value)}
                                placeholder="e.g., Amabilia Network"
                                className="bg-background border-primary/10 focus:border-primary/30"
                              />
                            </div>
                          </div>

                          {/* QR Code Upload */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground">QR Code Image</Label>
                            <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center hover:border-primary/40 transition-colors bg-primary/5">
                              {method.qrCodeUrl ? (
                                <div className="space-y-4">
                                  <div className="relative inline-block">
                                    <img 
                                      src={method.qrCodeUrl} 
                                      alt={`${method.name} QR Code`}
                                      className="w-40 h-40 mx-auto rounded-xl object-cover border border-primary/20 shadow-lg"
                                    />
                                    <div className="absolute -top-2 -right-2">
                                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-center gap-3">
                                    <label className="cursor-pointer">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleQRUpload(index, file);
                                        }}
                                      />
                                      <Button variant="outline" size="sm" asChild className="border-primary/30 hover:bg-primary/10">
                                        <span>
                                          <Upload className="h-4 w-4 mr-1" />
                                          Replace
                                        </span>
                                      </Button>
                                    </label>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                      onClick={() => handleRemoveQR(index)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label className="cursor-pointer block">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleQRUpload(index, file);
                                    }}
                                  />
                                  <div className="py-6">
                                    {uploadingFor === method.id ? (
                                      <div className="space-y-3">
                                        <Loader2 className="h-14 w-14 mx-auto text-primary animate-spin" />
                                        <p className="text-sm text-muted-foreground">Uploading...</p>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                                          <ImageIcon className="h-8 w-8 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                          Click to upload QR code
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          PNG, JPG up to 5MB
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <Button 
                    onClick={handleSavePaymentMethods}
                    disabled={updatePaymentMethods.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-mono"
                  >
                    {updatePaymentMethods.isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    Save Exchanger Payment Methods
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Task Management */}
          <TaskManagementPanel />

          {/* Platform Settings */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-mono">
                <Building2 className="h-5 w-5 text-primary" />
                Platform Information
              </CardTitle>
              <CardDescription>Basic information about the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName" className="text-muted-foreground">Platform Name</Label>
                <Input 
                  id="platformName" 
                  defaultValue="AMABILIA Network" 
                  className="bg-background border-primary/10 focus:border-primary/30 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformEmail" className="text-muted-foreground">Contact Email</Label>
                <Input 
                  id="platformEmail" 
                  type="email" 
                  defaultValue="admin@amabilianetwork.com" 
                  className="bg-background border-primary/10 focus:border-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformPhone" className="text-muted-foreground">Support Number</Label>
                <Input 
                  id="platformPhone" 
                  defaultValue="+63 917 123 4567" 
                  className="bg-background border-primary/10 focus:border-primary/30 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-mono">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about platform activity
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator className="bg-primary/10" />
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-foreground">New Member Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new members join
                  </p>
                </div>
                <Switch
                  checked={orderAlerts}
                  onCheckedChange={setOrderAlerts}
                />
              </div>
              
              <Separator className="bg-primary/10" />
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-foreground">System Health Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when system issues arise
                  </p>
                </div>
                <Switch
                  checked={lowStockAlerts}
                  onCheckedChange={setLowStockAlerts}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-mono"
          >
            <Save className="h-5 w-5 mr-2" />
            Save All Changes
          </Button>
        </div>
      )}
    </AdminPageWrapper>
  );
}
