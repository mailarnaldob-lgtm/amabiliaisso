import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, Shield, LogOut, Settings as SettingsIcon, Key, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordChangeDialog } from '@/components/dashboard/PasswordChangeDialog';

export default function Settings() {
  const { signOut, isLoggingOut } = useAuth();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [referralAlerts, setReferralAlerts] = useState(true);

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEnable2FA = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Two-factor authentication will be available in a future update.',
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Obsidian with Glassmorphism */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Page Header - 2026 Style */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded bg-primary/10 border border-primary/20 cyan-glow-sm">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Notifications - 2026 Titanium Card */}
        <Card className="mb-6 titanium-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between p-4 rounded bg-muted/30 border border-border">
              <div>
                <Label htmlFor="email-notifications" className="font-medium text-foreground">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded bg-muted/30 border border-border">
              <div>
                <Label htmlFor="payment-alerts" className="font-medium text-foreground">Payment Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about payment status changes</p>
              </div>
              <Switch
                id="payment-alerts"
                checked={paymentAlerts}
                onCheckedChange={setPaymentAlerts}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded bg-muted/30 border border-border">
              <div>
                <Label htmlFor="referral-alerts" className="font-medium text-foreground">Referral Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone uses your referral link</p>
              </div>
              <Switch
                id="referral-alerts"
                checked={referralAlerts}
                onCheckedChange={setReferralAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security - 2026 Titanium Card */}
        <Card className="mb-6 titanium-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 rounded bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-primary/10 border border-primary/20">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
              </div>
              <PasswordChangeDialog 
                trigger={
                  <Button variant="outline" size="sm" className="haptic-press">
                    Change
                  </Button>
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-primary/10 border border-primary/20">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleEnable2FA} className="haptic-press">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions - 2026 Titanium Card */}
        <Card className="titanium-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Button onClick={handleSave} className="w-full haptic-press">
              Save Preferences
            </Button>
            <Button 
              variant="destructive" 
              className="w-full gap-2 haptic-press" 
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
