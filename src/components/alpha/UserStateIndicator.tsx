import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Shield, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  XCircle,
  Activity
} from 'lucide-react';

export type UserState = 'GUEST' | 'REGISTERED' | 'FUNDED' | 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'BANNED';

interface UserStateIndicatorProps {
  state: UserState;
  fraudScore?: number;
  compact?: boolean;
}

const stateConfig: Record<UserState, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
}> = {
  GUEST: {
    label: 'Guest',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    icon: User,
    description: 'Unverified visitor'
  },
  REGISTERED: {
    label: 'Registered',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: CheckCircle2,
    description: 'Email verified, awaiting funding'
  },
  FUNDED: {
    label: 'Funded',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Wallet,
    description: 'Has ₳ balance, awaiting activation'
  },
  ACTIVE: {
    label: 'Active',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: Shield,
    description: 'Full platform access'
  },
  SUSPENDED: {
    label: 'Suspended',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: AlertTriangle,
    description: 'Payouts blocked pending review'
  },
  FROZEN: {
    label: 'Frozen',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    icon: Lock,
    description: 'All actions blocked'
  },
  BANNED: {
    label: 'Banned',
    color: 'text-destructive',
    bgColor: 'bg-destructive/20',
    borderColor: 'border-destructive/50',
    icon: XCircle,
    description: 'Permanently locked'
  }
};

export function UserStateIndicator({ state, fraudScore = 0, compact = false }: UserStateIndicatorProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  if (compact) {
    return (
      <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <Card className={`${config.borderColor} border overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${config.color}`}>{config.label}</span>
              <Badge variant="outline" className="text-[10px]">Account State</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        
        {/* Fraud Score Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              Trust Score
            </span>
            <span className={`font-medium ${
              fraudScore >= 80 ? 'text-destructive' :
              fraudScore >= 60 ? 'text-orange-500' :
              fraudScore >= 30 ? 'text-amber-500' :
              'text-emerald-500'
            }`}>
              {100 - fraudScore}%
            </span>
          </div>
          <Progress 
            value={100 - fraudScore} 
            className="h-1.5"
          />
          <p className="text-[10px] text-muted-foreground">
            {fraudScore < 30 && 'Normal operations'}
            {fraudScore >= 30 && fraudScore < 60 && 'Some features restricted'}
            {fraudScore >= 60 && fraudScore < 80 && 'Payout delays active'}
            {fraudScore >= 80 && 'Account under review'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserLifecycleFlow() {
  const states: UserState[] = ['GUEST', 'REGISTERED', 'FUNDED', 'ACTIVE'];
  
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {states.map((state, index) => {
        const config = stateConfig[state];
        const Icon = config.icon;
        return (
          <div key={state} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{config.label}</span>
            </div>
            {index < states.length - 1 && (
              <div className="w-8 h-0.5 bg-border mx-2 mt-[-12px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
