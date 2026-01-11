// This file is generated as a safe replacement. You can edit as needed.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. Add it to your .env file (VITE_SUPABASE_URL) and restart the dev server.'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable. Add it to your .env file (VITE_SUPABASE_PUBLISHABLE_KEY) and restart the dev server.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Optional: set a more explicit fetch implementation if running in SSR environments
  // fetch: typeof window === 'undefined' ? (await import('node-fetch')).default : fetch,
});

// Optional helper: a small wrapper to get the current user safely
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export default supabase;
