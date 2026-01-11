// SECURE IMPLEMENTATION: SSR-safe Supabase browser client
// Uses PKCE flow and avoids localStorage-based auth handling

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// --- Environment validation (fail fast in dev & prod) ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable'
  );
}

/**
 * Supabase Browser Client
 *
 * - SSR compatible
 * - Uses PKCE auth flow (default for @supabase/ssr)
 * - Prevents XSS risks from localStorage-based token handling
 * - Session is resolved via cookies when paired with server client
 */
export const supabase = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
