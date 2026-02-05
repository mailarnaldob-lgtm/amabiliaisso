/**
 * Shared API utilities for all Edge Functions
 * Implements strict JSON contract and safe fetch operations
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Standard API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status = 200): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string,
  code: string = 'API_ERROR',
  status: number = 400,
  details?: string
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error,
    code,
    ...(details && { details }),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Safe fetch with JSON validation
 * Handles HTML error pages and invalid JSON gracefully
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: unknown; error?: string; status: number }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const responseText = await response.text();
    
    // Check for HTML response (error pages)
    if (
      responseText.trim().startsWith('<!DOCTYPE') ||
      responseText.trim().startsWith('<html') ||
      responseText.trim().startsWith('<?xml') ||
      responseText.trim().startsWith('<')
    ) {
      console.error(`[SAFE_FETCH] Received HTML instead of JSON from ${url}`);
      console.error(`[SAFE_FETCH] Response preview: ${responseText.substring(0, 300)}`);
      return {
        ok: false,
        error: 'Backend service returned HTML instead of JSON. The endpoint may not exist or has an error.',
        status: 503,
      };
    }

    // Check for empty response
    if (!responseText.trim()) {
      console.error(`[SAFE_FETCH] Empty response from ${url}`);
      return {
        ok: false,
        error: 'Backend service returned empty response',
        status: 502,
      };
    }

    // Try to parse JSON
    try {
      const data = JSON.parse(responseText);
      return {
        ok: response.ok,
        data,
        status: response.status,
      };
    } catch (parseError) {
      console.error(`[SAFE_FETCH] JSON parse error from ${url}: ${responseText.substring(0, 300)}`);
      return {
        ok: false,
        error: 'Backend service returned invalid JSON',
        status: 502,
      };
    }
  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
    console.error(`[SAFE_FETCH] Network error: ${errorMessage}`);
    return {
      ok: false,
      error: `Network error: ${errorMessage}`,
      status: 503,
    };
  }
}

/**
 * Parse request body safely
 */
export async function parseRequestBody<T>(req: Request): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const text = await req.text();
    if (!text.trim()) {
      return { ok: false, error: 'Empty request body' };
    }
    const data = JSON.parse(text) as T;
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: 'Invalid JSON in request body' };
  }
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Log with consistent formatting
 */
export function log(context: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${context}] ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * Log error with consistent formatting
 */
export function logError(context: string, message: string, error?: unknown) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] [${context}] ERROR: ${message}`, errorMessage);
}

/**
 * Verify CRON_SECRET header for cron job endpoints
 * Accepts either x-cron-secret header OR service role key in Authorization header
 * Returns null if valid, or an error Response if invalid
 */
export function verifyCronSecret(req: Request, context: string): Response | null {
  // Method 1: Check x-cron-secret header (for external cron services)
  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');
  
  if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
    log(context, 'Authenticated via CRON_SECRET header');
    return null; // Success
  }
  
  // Method 2: Check for service role key in Authorization header (Supabase pg_cron standard)
  const authHeader = req.headers.get('Authorization');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (authHeader && serviceRoleKey) {
    const token = authHeader.replace('Bearer ', '');
    if (token === serviceRoleKey) {
      log(context, 'Authenticated via service role key');
      return null; // Success
    }
  }
  
  // Neither method succeeded - unauthorized
  console.warn(`[${context}] Unauthorized cron access attempt from origin: ${req.headers.get('origin') || 'unknown'}`);
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'ERR_AUTH_004',
      message: 'Unauthorized'
    }),
    { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
