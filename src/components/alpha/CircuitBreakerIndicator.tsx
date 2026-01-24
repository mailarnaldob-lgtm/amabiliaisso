import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  AlertOctagon, 
  Lock,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface CircuitBreakerIndicatorProps {
  reserveRatio: number; // percentage
  compact?: boolean;
}

type SystemStatus = 'normal' | 'warning' | 'critical' | 'frozen';

function getSystemStatus(ratio: number): SystemStatus {
  if (ratio >= 120) return 'normal';
  if (ratio >= 100) return 'warning';
  if (ratio >= 80) return 'critical';
  return 'frozen';
}

const statusConfig: Record<SystemStatus, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  actions: string[];
}> = {
  normal: {
    label: 'Normal Operations',
    description: 'All features available',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle2,
    actions: ['All lending cycles open', 'Withdrawals processing normally', 'No restrictions']
  },
  warning: {
    label: 'Elevated Monitoring',
    description: 'System under observation',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    icon: AlertTriangle,
    actions: ['New cycles may have delays', 'Large withdrawals queued', 'Monitoring active']
  },
  critical: {
    label: 'New Cycles Paused',
    description: 'Circuit breaker triggered',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    icon: AlertOctagon,
    actions: ['No new P2P cycles', 'Existing cycles continue', 'Withdrawal queue active']
  },
  frozen: {
    label: 'System Freeze',
    description: 'Emergency protocol active',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    icon: Lock,
    actions: ['All operations paused', 'Withdrawals frozen', 'Admin intervention required']
  }
};

export function CircuitBreakerIndicator({ reserveRatio, compact = false }: CircuitBreakerIndicatorProps) {
  const status = getSystemStatus(reserveRatio);
  const config = statusConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {reserveRatio}% Reserve
      </Badge>
    );
  }

  return (
    <Card className={`border ${
      status === 'normal' ? 'border-emerald-500/30' :
      status === 'warning' ? 'border-amber-500/30' :
      status === 'critical' ? 'border-orange-500/30' :
      'border-destructive/30'
    }`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${config.color}`}>{config.label}</span>
              <Badge variant="outline" className="text-[10px]">Circuit Breaker</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Reserve Ratio Gauge */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Reserve Ratio
            </span>
            <span className={`font-bold ${config.color}`}>{reserveRatio}%</span>
          </div>
          <div className="relative">
            <Progress value={Math.min(reserveRatio, 150)} max={150} className="h-3" />
            {/* Threshold markers */}
            <div className="absolute top-0 left-0 w-full h-full flex">
              <div className="w-[53%] border-r-2 border-orange-500/50" title="80% - Freeze" />
              <div className="w-[14%] border-r-2 border-amber-500/50" title="100% - Critical" />
              <div className="w-[13%] border-r-2 border-emerald-500/50" title="120% - Normal" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0%</span>
            <span className="text-orange-500">80%</span>
            <span className="text-amber-500">100%</span>
            <span className="text-emerald-500">120%</span>
            <span>150%</span>
          </div>
        </div>

        {/* Current Actions */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Current Status:</p>
          {config.actions.map((action, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${config.bgColor.replace('/10', '')}`} />
              <span className="text-muted-foreground">{action}</span>
            </div>
          ))}
        </div>

        {/* System Note */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Sovereign Ledger Protocol • Circuit breakers are automatic system behaviors
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
