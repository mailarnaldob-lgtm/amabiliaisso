import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipTier, MEMBERSHIP_TIERS } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface LockedOverlayProps {
  children: ReactNode;
  tierRequired: MembershipTier;
  isLocked: boolean;
  className?: string;
}

export function LockedOverlay({ children, tierRequired, isLocked, className }: LockedOverlayProps) {
  const tierInfo = MEMBERSHIP_TIERS[tierRequired];
  
  if (!isLocked) {
    return <>{children}</>;
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Blurred content */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 text-center px-4">
          Upgrade to {tierInfo.name} to Unlock
        </p>
        
        <Link to="/dashboard/upgrade">
          <Button size="sm" className="alpha-gradient text-alpha-foreground">
            Upgrade Membership
          </Button>
        </Link>
      </div>
    </div>
  );
}
