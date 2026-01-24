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

          {/* Payment Methods & QR Codes */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Payment Methods & QR Codes
              </CardTitle>
              <CardDescription>
                Configure payment receiver accounts and upload QR codes for easy payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {editedMethods.map((method, index) => (
                    <div key={method.id} className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          {method.name}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Account Details */}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${index}`}>Display Name</Label>
                            <Input
                              id={`name-${index}`}
                              value={method.name}
                              onChange={(e) => handleMethodChange(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`number-${index}`}>Account Number</Label>
                            <Input
                              id={`number-${index}`}
                              value={method.number}
                              onChange={(e) => handleMethodChange(index, 'number', e.target.value)}
                              placeholder="e.g., 09171234567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`accountName-${index}`}>Account Name</Label>
                            <Input
                              id={`accountName-${index}`}
                              value={method.accountName}
                              onChange={(e) => handleMethodChange(index, 'accountName', e.target.value)}
                              placeholder="e.g., Amabilia Network"
                            />
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="space-y-3">
                          <Label>QR Code</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            {method.qrCodeUrl ? (
                              <div className="space-y-3">
                                <img 
                                  src={method.qrCodeUrl} 
                                  alt={`${method.name} QR Code`}
                                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                                />
                                <div className="flex justify-center gap-2">
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
                                <div className="py-4">
                                  {uploadingFor === method.id ? (
                                    <Loader2 className="h-12 w-12 mx-auto text-muted-foreground animate-spin" />
                                  ) : (
                                    <>
                                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                      <p className="text-sm text-muted-foreground">
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

                  <Button 
                    onClick={handleSavePaymentMethods}
                    disabled={updatePaymentMethods.isPending}
                    className="w-full"
                  >
                    {updatePaymentMethods.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Payment Methods
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

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
