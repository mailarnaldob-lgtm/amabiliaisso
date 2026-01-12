import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipTier, MEMBERSHIP_TIERS } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface LockedFeatureProps {
  tierRequired: MembershipTier;
  featureName?: string;
  className?: string;
  compact?: boolean;
}

export function LockedFeature({ tierRequired, featureName, className, compact = false }: LockedFeatureProps) {
  const tierInfo = MEMBERSHIP_TIERS[tierRequired];
  
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border',
        className
      )}>
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Requires {tierInfo.name}
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'relative rounded-xl border border-border overflow-hidden',
      className
    )}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />
      
      {/* Lock content */}
      <div className="relative z-20 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {featureName || 'Feature Locked'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Upgrade to <span className="text-alpha font-medium">{tierInfo.name}</span> to unlock this feature
        </p>
        
        <Link to="/dashboard/upgrade">
          <Button className="alpha-gradient text-alpha-foreground">
            Upgrade Membership
          </Button>
        </Link>
      </div>
    </div>
  );
}
