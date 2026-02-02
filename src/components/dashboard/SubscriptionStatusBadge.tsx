import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarClock, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SubscriptionStatusBadgeProps {
  status: 'inactive' | 'active' | 'expired' | 'grace_period' | null;
  expiresAt: string | null;
  tier: string | null;
  compact?: boolean;
}

export function SubscriptionStatusBadge({ 
  status, 
  expiresAt, 
  tier,
  compact = false 
}: SubscriptionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Active',
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        };
      case 'grace_period':
        return {
          icon: AlertTriangle,
          label: 'Grace Period',
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          bgColor: 'bg-amber-500/10 border-amber-500/20',
        };
      case 'expired':
        return {
          icon: XCircle,
          label: 'Expired',
          color: 'bg-destructive/10 text-destructive border-destructive/30',
          bgColor: 'bg-destructive/10 border-destructive/20',
        };
      case 'inactive':
      default:
        return {
          icon: CalendarClock,
          label: 'Inactive',
          color: 'bg-muted text-muted-foreground border-border',
          bgColor: 'bg-muted/30 border-border',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Calculate days remaining
  const daysRemaining = expiresAt 
    ? differenceInDays(parseISO(expiresAt), new Date())
    : null;

  const formattedExpiry = expiresAt 
    ? format(parseISO(expiresAt), 'MMM dd, yyyy')
    : null;

  if (compact) {
    return (
      <Badge variant="outline" className={`${config.color} text-xs font-medium`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {config.label}
        {daysRemaining !== null && daysRemaining > 0 && (
          <span className="ml-1">({daysRemaining}d)</span>
        )}
      </Badge>
    );
  }

  return (
    <Alert className={`${config.bgColor} border`}>
      <StatusIcon className="h-4 w-4" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {tier ? `${tier} Membership` : 'Membership'} - {config.label}
          </p>
          {status === 'active' && formattedExpiry && (
            <p className="text-xs text-muted-foreground">
              Active until {formattedExpiry}
              {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                <span className="text-amber-500 ml-2">
                  ({daysRemaining} days remaining)
                </span>
              )}
            </p>
          )}
          {status === 'expired' && (
            <p className="text-xs text-destructive">
              Your subscription has expired. Renew to continue accessing platform features.
            </p>
          )}
          {status === 'grace_period' && (
            <p className="text-xs text-amber-600">
              Your subscription is in grace period. Renew soon to avoid losing access.
            </p>
          )}
          {status === 'inactive' && (
            <p className="text-xs text-muted-foreground">
              Activate your membership to access Global Assignments and Royalty Distributions.
            </p>
          )}
        </div>
        
        {(status === 'expired' || status === 'grace_period' || status === 'inactive') && (
          <Link to="/dashboard/upgrade">
            <Button size="sm" className="haptic-press">
              <RefreshCw className="h-3 w-3 mr-1" />
              {status === 'inactive' ? 'Activate Now' : 'Renew Now'}
            </Button>
          </Link>
        )}
      </AlertDescription>
    </Alert>
  );
}
