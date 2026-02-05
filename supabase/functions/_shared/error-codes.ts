/**
 * SOVEREIGN ERROR CODE SYSTEM V8.5
 * Standardized error codes to prevent information leakage
 * 
 * Format: ERR_{CATEGORY}_{NUMBER}
 * Categories: AUTH, BALANCE, WALLET, INVALID, SYSTEM, LOAN
 */

export const ERROR_CODES = {
  // Authentication Errors
  ERR_AUTH_001: 'Authentication required',
  ERR_AUTH_002: 'Session expired or invalid',
  ERR_AUTH_003: 'Insufficient permissions',
  ERR_AUTH_004: 'Cron authorization required',
  
  // Balance Errors
  ERR_BALANCE_001: 'Transaction failed',
  ERR_BALANCE_002: 'Operation unavailable',
  
  // Wallet Errors
  ERR_WALLET_001: 'Wallet unavailable',
  ERR_WALLET_002: 'Destination unavailable',
  
  // Invalid Request Errors
  ERR_INVALID_001: 'Invalid request',
  ERR_INVALID_002: 'Amount too low',
  ERR_INVALID_003: 'Invalid operation',
  ERR_INVALID_004: 'Invalid format',
  
  // System Errors
  ERR_SYSTEM_001: 'Service temporarily unavailable',
  ERR_SYSTEM_002: 'Operation failed',
  ERR_SYSTEM_003: 'Service misconfigured',
  
  // Loan Errors
  ERR_LOAN_001: 'Loan unavailable',
  ERR_LOAN_002: 'Loan operation failed',
  
  // Rate Limit Errors
  ERR_RATE_001: 'Too many requests',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Get a safe, user-friendly error message from an error code
 */
export function getSafeErrorMessage(errorCode: string): string {
  if (errorCode in ERROR_CODES) {
    return ERROR_CODES[errorCode as ErrorCode];
  }
  // Default generic message for unknown errors
  return ERROR_CODES.ERR_SYSTEM_001;
}

/**
 * Check if a string is a valid error code
 */
export function isErrorCode(value: string): value is ErrorCode {
  return value in ERROR_CODES;
}

/**
 * Map common database/RPC errors to safe error codes
 */
export function mapDbErrorToCode(error: unknown): ErrorCode {
  if (!error || typeof error !== 'object') {
    return 'ERR_SYSTEM_001';
  }
  
  const errorMessage = 'message' in error ? String(error.message).toLowerCase() : '';
  
  // Authentication errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
    return 'ERR_AUTH_001';
  }
  
  // Balance errors
  if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
    return 'ERR_BALANCE_001';
  }
  
  // Wallet errors
  if (errorMessage.includes('wallet') && errorMessage.includes('not found')) {
    return 'ERR_WALLET_001';
  }
  
  // Invalid input
  if (errorMessage.includes('invalid') || errorMessage.includes('validation')) {
    return 'ERR_INVALID_001';
  }
  
  return 'ERR_SYSTEM_001';
}