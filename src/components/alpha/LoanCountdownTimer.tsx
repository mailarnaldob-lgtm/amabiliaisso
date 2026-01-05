import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface LoanCountdownTimerProps {
  dueDate: Date;
  startDate: Date;
  status: 'active' | 'overdue' | 'repaid';
  compact?: boolean;
}

export function LoanCountdownTimer({ 
  dueDate, 
  startDate, 
  status,
  compact = false 
}: LoanCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const difference = dueDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isOverdue: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  const totalDuration = dueDate.getTime() - startDate.getTime();
  const elapsed = new Date().getTime() - startDate.getTime();
  const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);

  const isUrgent = timeLeft.days === 0 && !timeLeft.isOverdue;
  const isOverdue = timeLeft.isOverdue || status === 'overdue';

  if (status === 'repaid') {
    return (
      <div className="flex items-center gap-2 text-emerald-500">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Repaid</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${
        isOverdue ? 'text-destructive' : 
        isUrgent ? 'text-amber-500' : 
        'text-muted-foreground'
      }`}>
        {isOverdue ? (
          <>
            <AlertTriangle className="h-4 w-4" />
            <span className="font-bold">OVERDUE</span>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4" />
            <span className="font-mono">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${
      isOverdue ? 'border-destructive bg-destructive/5' :
      isUrgent ? 'border-amber-500/50 bg-amber-500/5' :
      'border-border'
    }`}>
      <CardContent className="p-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Cycle Countdown</span>
          {isOverdue ? (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              OVERDUE
            </Badge>
          ) : isUrgent ? (
            <Badge className="bg-amber-500">
              <Zap className="h-3 w-3 mr-1" />
              Final Day
            </Badge>
          ) : (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {/* Countdown Display */}
        {!isOverdue ? (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <TimeBlock value={timeLeft.days} label="Days" urgent={isUrgent} />
            <TimeBlock value={timeLeft.hours} label="Hours" urgent={isUrgent} />
            <TimeBlock value={timeLeft.minutes} label="Min" urgent={isUrgent} />
            <TimeBlock value={timeLeft.seconds} label="Sec" urgent={isUrgent} />
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-destructive">Payment Overdue</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rescue Protocol may be activated
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Cycle Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress 
            value={progressPercent} 
            className={`h-2 ${isOverdue ? '[&>div]:bg-destructive' : isUrgent ? '[&>div]:bg-amber-500' : ''}`}
          />
        </div>

        {/* Day Markers */}
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <span 
              key={day} 
              className={`${
                day <= 7 - timeLeft.days 
                  ? 'text-primary font-bold' 
                  : ''
              }`}
            >
              D{day}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimeBlock({ value, label, urgent }: { value: number; label: string; urgent?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-lg ${urgent ? 'bg-amber-500/10' : 'bg-muted/50'}`}>
      <p className={`text-xl font-mono font-bold ${urgent ? 'text-amber-600' : 'text-foreground'}`}>
        {value.toString().padStart(2, '0')}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
