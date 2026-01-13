import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { getAdminInfo, clearAdminSession, isAdminSessionValid } from '@/lib/adminSession';

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
  const adminInfo = getAdminInfo();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(false);

  useEffect(() => {
    if (!isAdminSessionValid()) {
      navigate('/admin/login');
    }
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
            <p className="text-sm text-muted-foreground mt-2">{adminInfo.username}</p>
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
      <main className="flex-1 p-8">
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

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