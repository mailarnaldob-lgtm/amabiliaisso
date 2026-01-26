import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Bell, Lock, ChevronRight, LogOut, HelpCircle, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, MEMBERSHIP_TIERS } from '@/stores/appStore';
export default function SettingsApp() {
  const {
    signOut
  } = useAuth();
  const {
    userName,
    membershipTier
  } = useAppStore();
  const tierInfo = MEMBERSHIP_TIERS[membershipTier];
  const handleSignOut = async () => {
    await signOut();
  };
  return <AlphaLayout title="Settings" subtitle="Account & Preferences">
      {/* Profile Section */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{userName}</h3>
              <Badge className="mt-1">{tierInfo.name}</Badge>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Security
      </h3>
      
      <Card className="mb-6">
        <CardContent className="divide-y divide-border">
          <SettingItem icon={Lock} label="Change Password" description="Update your account password" />
          <SettingItem icon={Shield} label="Two-Factor Authentication" description="Add extra security to your account" hasSwitch />
          <SettingItem icon={AlertTriangle} label="Login History" description="View recent account activity" />
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Notifications
      </h3>
      
      <Card className="mb-6">
        <CardContent className="divide-y divide-border">
          <SettingItem icon={Bell} label="Push Notifications" description="Receive activity alerts" hasSwitch defaultChecked />
          <SettingItem icon={Bell} label="Email Notifications" description="Get updates via email" hasSwitch />
        </CardContent>
      </Card>

      {/* Support Section */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Support
      </h3>
      
      <Card className="mb-6">
        <CardContent className="divide-y divide-border">
          <SettingItem icon={HelpCircle} label="Help Center" description="FAQs and support articles" />
          <SettingItem icon={FileText} label="Terms of Service" description="Review platform policies" />
          <SettingItem icon={FileText} label="Privacy Policy" description="How we handle your data" />
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>

      {/* Version */}
      

      {/* Disclaimer */}
      
    </AlphaLayout>;
}
function SettingItem({
  icon: Icon,
  label,
  description,
  hasSwitch,
  defaultChecked
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  hasSwitch?: boolean;
  defaultChecked?: boolean;
}) {
  return <div className="flex items-center justify-between py-4 first:pt-4 last:pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {hasSwitch ? <Switch defaultChecked={defaultChecked} /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>;
}