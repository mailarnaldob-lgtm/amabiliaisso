// SECURE IMPLEMENTATION: Migrated from localStorage to SSR-compatible handling
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Optimized Supabase Client
 * Implementation of PKCE flow to mitigate XSS risks associated with localStorage.
 */
export const supabase = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
