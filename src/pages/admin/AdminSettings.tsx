import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { 
  Users, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  FileCheck,
  Eye,
  Settings,
  DollarSign,
  ArrowLeft,
  Loader2,
  QrCode,
  Upload,
  Trash2,
  Save,
  ImageIcon
} from 'lucide-react';
import { initAdminSession, clearAdminSession, getAdminInfoSync } from '@/lib/adminSession';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/task-proofs', label: 'Activity Proofs', icon: FileCheck },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/admin/god-eye', label: 'God-Eye Panel', icon: Eye },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  
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

  useEffect(() => {
    const init = async () => {
      const isAdmin = await initAdminSession();
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      setAdminInfo(getAdminInfoSync());
      setIsInitialized(true);
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

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

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Admin Panel</span>
          </Link>
          {adminInfo && (
            <p className="text-sm text-muted-foreground mt-2">{adminInfo.email}</p>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
          <Button variant="ghost" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="space-y-6 max-w-4xl">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            <p className="text-muted-foreground">Manage platform settings and payment configuration</p>
          </div>

          {/* Notification Center */}
          <AdminNotificationCenter />

          {/* Exchanger Payment & QR Codes Configuration */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <QrCode className="h-6 w-6 text-primary" />
                    Exchanger Payment & QR Codes
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure payment receiver accounts and upload QR codes for the PHP → Alpha exchanger system
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
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
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
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
                      <div key={method.id} className="border border-border rounded-xl p-6 bg-card hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-base px-3 py-1">
                            {method.name}
                          </Badge>
                          {method.qrCodeUrl && (
                            <Badge variant="outline" className="text-primary border-primary/30">
                              QR Active
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Account Details */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`name-${index}`} className="text-sm font-medium">Display Name</Label>
                              <Input
                                id={`name-${index}`}
                                value={method.name}
                                onChange={(e) => handleMethodChange(index, 'name', e.target.value)}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`number-${index}`} className="text-sm font-medium">Account Number / Mobile</Label>
                              <Input
                                id={`number-${index}`}
                                value={method.number}
                                onChange={(e) => handleMethodChange(index, 'number', e.target.value)}
                                placeholder="e.g., 09171234567"
                                className="bg-background font-mono"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`accountName-${index}`} className="text-sm font-medium">Account Holder Name</Label>
                              <Input
                                id={`accountName-${index}`}
                                value={method.accountName}
                                onChange={(e) => handleMethodChange(index, 'accountName', e.target.value)}
                                placeholder="e.g., Amabilia Network"
                                className="bg-background"
                              />
                            </div>
                          </div>

                          {/* QR Code Upload */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">QR Code Image</Label>
                            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/30">
                              {method.qrCodeUrl ? (
                                <div className="space-y-4">
                                  <div className="relative inline-block">
                                    <img 
                                      src={method.qrCodeUrl} 
                                      alt={`${method.name} QR Code`}
                                      className="w-40 h-40 mx-auto rounded-xl object-cover border border-border shadow-lg"
                                    />
                                    <div className="absolute -top-2 -right-2">
                                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-primary-foreground text-xs">✓</span>
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
                                      <Button variant="outline" size="sm" asChild>
                                        <span>
                                          <Upload className="h-4 w-4 mr-1" />
                                          Replace
                                        </span>
                                      </Button>
                                    </label>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
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
                                        <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
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
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
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
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>Basic information about the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" defaultValue="AMABILIA Network" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformEmail">Contact Email</Label>
                <Input id="platformEmail" type="email" defaultValue="admin@amabilianetwork.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformPhone">Support Number</Label>
                <Input id="platformPhone" defaultValue="+63 917 123 4567" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about platform activity
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Member Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new members join
                  </p>
                </div>
                <Switch
                  checked={orderAlerts}
                  onCheckedChange={setOrderAlerts}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Health Alerts</Label>
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

          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
