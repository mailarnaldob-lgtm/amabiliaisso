// Admin session management using Supabase Auth
// This replaces the memory-only session with proper Supabase authentication

import { supabase } from '@/integrations/supabase/client';

// Check if current user has admin role
export async function checkAdminRole(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

// Get admin info from current session
export async function getAdminInfo(): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const isAdmin = await checkAdminRole();
    if (!isAdmin) return null;

    return {
      id: user.id,
      email: user.email || 'admin',
      role: 'admin'
    };
  } catch {
    return null;
  }
}

// Check if admin session is valid (user is logged in AND has admin role)
export async function isAdminSessionValid(): Promise<boolean> {
  return await checkAdminRole();
}

// Admin logout
export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}

// Legacy exports for backwards compatibility (synchronous versions that return cached values)
let cachedAdminStatus: boolean | null = null;
let cachedAdminInfo: { id: string; email: string; role: string } | null = null;

// Initialize cache (call this on app load or admin page mount)
export async function initAdminSession(): Promise<boolean> {
  cachedAdminStatus = await checkAdminRole();
  if (cachedAdminStatus) {
    cachedAdminInfo = await getAdminInfo();
  } else {
    cachedAdminInfo = null;
  }
  return cachedAdminStatus;
}

// Synchronous version using cached value (for backwards compatibility)
export function isAdminSessionValidSync(): boolean {
  return cachedAdminStatus === true;
}

// Synchronous version using cached value (for backwards compatibility)
export function getAdminInfoSync(): { id: string; email: string; role: string } | null {
  return cachedAdminInfo;
}

// Clear cache on logout
export function clearAdminCache(): void {
  cachedAdminStatus = null;
  cachedAdminInfo = null;
}

// Legacy function names for full backwards compatibility
export function clearAdminSession(): void {
  clearAdminCache();
  adminLogout();
}

export function getAdminSessionToken(): string | null {
  // Return a dummy token if admin is valid (for legacy code that checks for token presence)
  return cachedAdminStatus ? 'supabase-auth' : null;
}

export function setAdminSession(_token: string, _expiresAt: string, _info?: { username: string; role: string }): void {
  // No-op - session is managed by Supabase Auth now
}
