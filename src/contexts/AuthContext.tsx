import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { clearAdminSession, clearAdminCache } from '@/lib/adminSession';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoggingOut: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  secureSignOut: (options?: { redirectTo?: string; clearAllData?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure session cleanup utility
const clearAllSessionData = () => {
  // Clear admin session cache
  clearAdminCache();
  
  // Clear any cached auth data from localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('sb-') || 
      key.includes('supabase') ||
      key.includes('auth') ||
      key.includes('session')
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear sessionStorage as well
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.startsWith('sb-') || 
      key.includes('supabase') ||
      key.includes('auth') ||
      key.includes('session')
    )) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isSigningOut = useRef(false);

  // Handle logout redirect to homepage
  const handleLogoutRedirect = useCallback((redirectTo: string = '/') => {
    // Clear all session data
    clearAllSessionData();
    
    // Redirect to specified path (default: homepage)
    if (window.location.pathname !== redirectTo && window.location.pathname !== '/auth') {
      window.location.href = redirectTo;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle session expiration or sign out - redirect to homepage
        if ((event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) && !isSigningOut.current) {
          console.log('ALPHA SYSTEM: Session expired or revoked, redirecting...');
          handleLogoutRedirect('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [handleLogoutRedirect]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone || null,
          referral_code: referralCode || null,
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  // Legacy signOut for backwards compatibility
  const signOut = async () => {
    await secureSignOut({ redirectTo: '/', clearAllData: true });
  };

  // Enhanced secure sign out with comprehensive cleanup
  const secureSignOut = async (options?: { redirectTo?: string; clearAllData?: boolean }) => {
    const { redirectTo = '/', clearAllData = true } = options || {};
    
    // Prevent duplicate logout calls
    if (isSigningOut.current || isLoggingOut) {
      return;
    }
    
    isSigningOut.current = true;
    setIsLoggingOut(true);
    
    try {
      console.log('ALPHA SYSTEM: Initiating secure logout...');
      
      // Step 1: Clear admin session
      clearAdminSession();
      
      // Step 2: Sign out from Supabase (invalidates tokens server-side)
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('ALPHA SYSTEM: Logout error:', error.message);
      }
      
      // Step 3: Clear all local session data
      if (clearAllData) {
        clearAllSessionData();
      }
      
      // Step 4: Clear component state
      setUser(null);
      setSession(null);
      
      console.log('ALPHA SYSTEM: Secure logout complete');
      
      // Step 5: Redirect to specified path
      window.location.href = redirectTo;
      
    } catch (error) {
      console.error('ALPHA SYSTEM: Secure logout failed:', error);
      // Force cleanup even on error
      clearAllSessionData();
      setUser(null);
      setSession(null);
      window.location.href = redirectTo;
    } finally {
      isSigningOut.current = false;
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isLoggingOut,
      signUp, 
      signIn, 
      signOut,
      secureSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
