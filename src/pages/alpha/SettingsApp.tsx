import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Bell, Lock, ChevronRight, LogOut, HelpCircle, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, MEMBERSHIP_TIERS } from '@/stores/appStore';

export default function SettingsApp() {
  const { signOut } = useAuth();
  const { userName, membershipTier } = useAppStore();
  const tierInfo = MEMBERSHIP_TIERS[membershipTier];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AlphaLayout title="Settings" subtitle="Account & Preferences">
      {/* Profile Section - Terminal Style */}
      <Card className="mb-6 overflow-hidden bg-slate/80 border-accent/20 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-2xl font-bold text-accent font-mono">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-platinum font-mono">{userName}</h3>
              <Badge className="mt-1 bg-accent/20 text-accent border-accent/30 font-mono">{tierInfo.name}</Badge>
            </div>
            <ChevronRight className="h-5 w-5 text-platinum/30" />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <h3 className="text-xs font-mono text-platinum/50 uppercase tracking-widest mb-3">
        SECURITY
      </h3>
      
      <Card className="mb-6 bg-slate/60 border-platinum/10">
        <CardContent className="divide-y divide-platinum/10">
          <SettingItem icon={Lock} label="Change Password" description="Update your account password" />
          <SettingItem icon={Shield} label="Two-Factor Auth" description="Add extra security to your account" hasSwitch />
          <SettingItem icon={AlertTriangle} label="Login History" description="View recent account activity" />
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <h3 className="text-xs font-mono text-platinum/50 uppercase tracking-widest mb-3">
        NOTIFICATIONS
      </h3>
      
      <Card className="mb-6 bg-slate/60 border-platinum/10">
        <CardContent className="divide-y divide-platinum/10">
          <SettingItem icon={Bell} label="Push Notifications" description="Receive activity alerts" hasSwitch defaultChecked />
          <SettingItem icon={Bell} label="Email Notifications" description="Get updates via email" hasSwitch />
        </CardContent>
      </Card>

      {/* Support Section */}
      <h3 className="text-xs font-mono text-platinum/50 uppercase tracking-widest mb-3">
        SUPPORT
      </h3>
      
      <Card className="mb-6 bg-slate/60 border-platinum/10">
        <CardContent className="divide-y divide-platinum/10">
          <SettingItem icon={HelpCircle} label="Help Center" description="FAQs and support articles" />
          <SettingItem icon={FileText} label="Terms of Service" description="Review platform policies" />
          <SettingItem icon={FileText} label="Privacy Policy" description="How we handle your data" />
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button 
        variant="destructive" 
        className="w-full gap-2 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 font-mono active:scale-95 transition-all duration-150" 
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        SIGN_OUT
      </Button>

      {/* Version */}
      <div className="mt-8 text-center">
        <p className="text-xs text-platinum/30 font-mono">₳LPHA_ECOSYSTEM v8.0</p>
        <p className="text-xs text-platinum/20 font-mono mt-1">SOVEREIGN LEDGER EDITION</p>
      </div>
    </AlphaLayout>
  );
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
  return (
    <div className="flex items-center justify-between py-4 first:pt-4 last:pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-obsidian/50 border border-platinum/10">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="font-medium text-sm text-platinum font-mono">{label}</p>
          <p className="text-xs text-platinum/50">{description}</p>
        </div>
      </div>
      {hasSwitch ? (
        <Switch defaultChecked={defaultChecked} className="data-[state=checked]:bg-accent" />
      ) : (
        <ChevronRight className="h-4 w-4 text-platinum/30" />
      )}
    </div>
  );
}
