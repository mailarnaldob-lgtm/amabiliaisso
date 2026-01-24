import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminSessionValid } from '@/lib/adminSession';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Sovereign Route Guard
 * Enforces authentication with zero-latency redirections
 * Logs unauthorized access attempts to maintain Sovereign Ledger security
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  // Log unauthorized access attempts
  useEffect(() => {
    if (!authLoading && !user) {
      console.warn(`%c⚠️ ALPHA SYSTEM: Route access attempt blocked → ${location.pathname}`, 
        'color: #ff6b6b; font-weight: bold;');
    }
  }, [authLoading, user, location.pathname]);

  // Loading state with Sovereign branding
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <Shield className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground font-mono">SOVEREIGN LEDGER AUTHENTICATING...</p>
      </div>
    );
  }

  // Instant redirect for unauthenticated users
  if (!user) {
    // Preserve intended destination for post-login redirect
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin route protection with memory-based session
  if (requireAdmin && !isAdminSessionValid()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
