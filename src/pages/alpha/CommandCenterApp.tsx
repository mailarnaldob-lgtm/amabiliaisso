import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { DualColumnCommandCenter } from '@/components/command';
import { CommandCenterHeader } from '@/components/command/CommandCenterHeader';
import { ActivateAccountCard } from '@/components/dashboard/ActivateAccountCard';
import { AlphaExchangerCard } from '@/components/dashboard/AlphaExchangerCard';
import { useProfile } from '@/hooks/useProfile';
import { useWallets } from '@/hooks/useWallets';

export default function CommandCenterApp() {
  const { data: profile } = useProfile();
  const { totalBalance } = useWallets();
  
  // Check if user is inactive (no membership tier)
  const isInactive = !profile?.membership_tier;

  return (
    <AlphaLayout 
      title="Command Center" 
      subtitle="High-Velocity Operations Hub"
    >
      {/* Welcome Header with User Info + Balance */}
      <CommandCenterHeader />
      
      {/* ACTIVATE ACCOUNT or ALPHA EXCHANGER Module */}
      <div className="mt-6">
        {isInactive ? (
          <ActivateAccountCard />
        ) : (
          <AlphaExchangerCard balance={totalBalance} />
        )}
      </div>
      
      {/* Main Dual-Column Interface */}
      <div className="mt-6">
        <DualColumnCommandCenter />
      </div>
      
      {/* System Flow Info */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          The Command Center powers your Alpha Network velocity. 
          Missions update every 15 seconds. Campaigns deploy capital across the sovereign network.
        </p>
      </div>
    </AlphaLayout>
  );
}
