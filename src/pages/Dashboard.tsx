import { MemberLayout } from '@/components/layouts/MemberLayout';
import { TriWalletDashboard } from '@/components/wallet/TriWalletDashboard';
import { useAppStore, MEMBERSHIP_TIERS, ARMY_LEVELS } from '@/stores/appStore';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { userName, membershipTier, armyLevel, referralCode } = useAppStore();
  const tierInfo = MEMBERSHIP_TIERS[membershipTier];
  const levelInfo = ARMY_LEVELS[armyLevel];

  return (
    <MemberLayout title="Dashboard">
      {/* Welcome Card */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h2 className="text-xl font-bold text-foreground">{userName}</h2>
          </div>
          <div className="text-right">
            <Badge className="alpha-gradient text-alpha-foreground mb-1">
              {tierInfo.name}
            </Badge>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              {levelInfo.icon} {levelInfo.name}
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-secondary/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Referral Code</span>
          <span className="font-mono font-bold text-alpha">{referralCode}</span>
        </div>
      </div>

      <TriWalletDashboard />
    </MemberLayout>
  );
}
