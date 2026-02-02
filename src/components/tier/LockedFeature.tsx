import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipTier, MEMBERSHIP_TIERS } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface LockedFeatureProps {
  tierRequired: MembershipTier;
  featureName?: string;
  className?: string;
  compact?: boolean;
  /** If true, redirects to /auth instead of upgrade page */
  enforceAuth?: boolean;
}

export function LockedFeature({ 
  tierRequired, 
  featureName, 
  className, 
  compact = false,
  enforceAuth = false 
}: LockedFeatureProps) {
  const tierInfo = MEMBERSHIP_TIERS[tierRequired];
  const { user } = useAuth();
  const navigate = useNavigate();

  // If no user session, always redirect to auth
  const shouldRedirectToAuth = enforceAuth || !user;
  
  const handleAction = () => {
    if (shouldRedirectToAuth) {
      navigate('/auth');
    } else {
      navigate('/dashboard/upgrade');
    }
  };
  
  if (compact) {
    return (
      <button 
        onClick={handleAction}
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted/80 transition-colors',
          className
        )}
      >
        {shouldRedirectToAuth ? (
          <LogIn className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground">
          {shouldRedirectToAuth ? 'Login Required' : `Requires ${tierInfo.name}`}
        </span>
      </button>
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
          {shouldRedirectToAuth ? (
            <LogIn className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Lock className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {shouldRedirectToAuth ? 'Authentication Required' : (featureName || 'Feature Locked')}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          {shouldRedirectToAuth ? (
            'Please login or create an account to access this feature'
          ) : (
            <>Upgrade to <span className="text-alpha font-medium">{tierInfo.name}</span> to unlock this feature</>
          )}
        </p>
        
        <Button 
          onClick={handleAction}
          className="alpha-gradient text-alpha-foreground"
        >
          {shouldRedirectToAuth ? 'Login / Register' : 'Upgrade Membership'}
        </Button>
      </div>
    </div>
  );
}
