import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ApiErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  title?: string;
  isNetworkError?: boolean;
}

export function ApiErrorFallback({ 
  error, 
  onRetry, 
  title = 'Unable to load data',
  isNetworkError = false 
}: ApiErrorFallbackProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-full bg-destructive/10">
            {isNetworkError ? (
              <WifiOff className="h-6 w-6 text-destructive" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {error || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateFallbackProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyStateFallback({ icon, title, description, action }: EmptyStateFallbackProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center gap-4">
          {icon && (
            <div className="p-3 rounded-full bg-muted">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
