import { Link } from 'react-router-dom';
import { MemberLayout } from '@/components/layouts/MemberLayout';
import { useAppStore, MEMBERSHIP_TIERS, ARMY_LEVELS } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Shield, LogOut, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { userName, membershipTier, armyLevel, isKycVerified, referralCode } = useAppStore();
  const { signOut } = useAuth();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
  };

  return (
    <MemberLayout title="Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full alpha-gradient mx-auto mb-4 flex items-center justify-center text-3xl">
            {ARMY_LEVELS[armyLevel].icon}
          </div>
          <h2 className="text-xl font-bold text-foreground">{userName}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className="alpha-gradient text-alpha-foreground">
              {MEMBERSHIP_TIERS[membershipTier].name}
            </Badge>
            {isKycVerified && (
              <Badge variant="outline" className="border-success text-success">
                <Shield className="w-3 h-3 mr-1" /> KYC Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Referral Card */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-alpha/10 border border-alpha/20">
            <span className="font-mono text-2xl font-bold alpha-text">{referralCode}</span>
            <Button size="sm" variant="outline" onClick={copyReferralCode}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Earn 50% commission (₱400) on every referral!</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <Link to="/app/settings">
            <button className="w-full flex items-center justify-between p-4 rounded-xl glass-card hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </Link>
          <button className="w-full flex items-center justify-between p-4 rounded-xl glass-card hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">KYC Verification</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive/50"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </MemberLayout>
  );
}
