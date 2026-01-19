// Shared validation schemas for edge functions
// Using lightweight validation without external dependencies

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Validate UUID format
export function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

// Validate positive number within range
export function isValidAmount(value: unknown, min = 0, max = Infinity): value is number {
  return typeof value === 'number' && !isNaN(value) && value > min && value <= max;
}

// Sanitize string input (remove potential XSS/injection characters)
export function sanitizeString(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"`;]/g, ''); // Remove dangerous characters
}

// Validate alphanumeric with spaces only
export function isAlphanumericWithSpaces(value: string): boolean {
  return /^[a-zA-Z0-9\s]+$/.test(value);
}

// Validate numeric string (for account numbers)
export function isNumericString(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

// Lending post offer validation
export interface LendingPostOfferInput {
  amount: number;
  termDays: number;
}

export function validateLendingPostOffer(input: unknown): ValidationResult<LendingPostOfferInput> {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { amount, termDays = 7 } = input as Record<string, unknown>;

  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isValidAmount(parsedAmount, 0, 50000)) {
    return { success: false, error: 'Amount must be between ₳1 and ₳50,000' };
  }

  if (parsedAmount < 500) {
    return { success: false, error: 'Minimum lending amount is ₳500' };
  }

  const parsedTermDays = typeof termDays === 'string' ? parseInt(termDays, 10) : termDays;
  if (![7, 14, 30].includes(parsedTermDays as number)) {
    return { success: false, error: 'Term must be 7, 14, or 30 days' };
  }

  return {
    success: true,
    data: {
      amount: parsedAmount as number,
      termDays: parsedTermDays as number
    }
  };
}

// Lending take offer validation
export interface LendingTakeOfferInput {
  loanId: string;
}

export function validateLendingTakeOffer(input: unknown): ValidationResult<LendingTakeOfferInput> {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { loanId } = input as Record<string, unknown>;

  if (!isValidUUID(loanId)) {
    return { success: false, error: 'Invalid loan ID format' };
  }

  return {
    success: true,
    data: { loanId }
  };
}

// Lending repayment validation
export interface LendingRepaymentInput {
  loanId: string;
  useAutoDeduct: boolean;
}

export function validateLendingRepayment(input: unknown): ValidationResult<LendingRepaymentInput> {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { loanId, useAutoDeduct = false } = input as Record<string, unknown>;

  if (!isValidUUID(loanId)) {
    return { success: false, error: 'Invalid loan ID format' };
  }

  return {
    success: true,
    data: {
      loanId,
      useAutoDeduct: Boolean(useAutoDeduct)
    }
  };
}

// Cash out validation
export interface CashOutInput {
  amount: number;
  payment_method: string;
  account_number: string;
  account_name: string;
}

export function validateCashOut(input: unknown): ValidationResult<CashOutInput> {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { amount, payment_method, account_number, account_name } = input as Record<string, unknown>;

  // Validate amount
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isValidAmount(parsedAmount, 0, 100000)) {
    return { success: false, error: 'Amount must be between ₳1 and ₳100,000' };
  }

  if ((parsedAmount as number) < 500) {
    return { success: false, error: 'Minimum withdrawal is ₳500' };
  }

  // Validate payment method
  const validPaymentMethods = ['gcash', 'maya', 'bank_transfer', 'GCash', 'Maya', 'Bank Transfer'];
  if (typeof payment_method !== 'string' || !validPaymentMethods.some(m => m.toLowerCase() === payment_method.toLowerCase())) {
    return { success: false, error: 'Invalid payment method. Use GCash, Maya, or Bank Transfer' };
  }

  // Validate and sanitize account name (letters and spaces only, 1-100 chars)
  if (typeof account_name !== 'string') {
    return { success: false, error: 'Account name is required' };
  }
  const sanitizedAccountName = sanitizeString(account_name, 100);
  if (sanitizedAccountName.length < 2) {
    return { success: false, error: 'Account name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s.,-]+$/.test(sanitizedAccountName)) {
    return { success: false, error: 'Account name can only contain letters, spaces, and basic punctuation' };
  }

  // Validate account number (digits only, 10-20 chars)
  if (typeof account_number !== 'string') {
    return { success: false, error: 'Account number is required' };
  }
  const sanitizedAccountNumber = account_number.replace(/\D/g, '');
  if (sanitizedAccountNumber.length < 10 || sanitizedAccountNumber.length > 20) {
    return { success: false, error: 'Account number must be 10-20 digits' };
  }

  return {
    success: true,
    data: {
      amount: parsedAmount as number,
      payment_method: payment_method.toLowerCase(),
      account_number: sanitizedAccountNumber,
      account_name: sanitizedAccountName
    }
  };
}

// Wallet transfer validation
export interface WalletTransferInput {
  from_wallet_type: 'task' | 'royalty' | 'main';
  to_wallet_type: 'task' | 'royalty' | 'main';
  amount: number;
}

export function validateWalletTransfer(input: unknown): ValidationResult<WalletTransferInput> {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid request body' };
  }

  const { from_wallet_type, to_wallet_type, amount } = input as Record<string, unknown>;

  const validWalletTypes = ['task', 'royalty', 'main'];
  
  if (typeof from_wallet_type !== 'string' || !validWalletTypes.includes(from_wallet_type)) {
    return { success: false, error: 'Invalid source wallet type' };
  }

  if (typeof to_wallet_type !== 'string' || !validWalletTypes.includes(to_wallet_type)) {
    return { success: false, error: 'Invalid destination wallet type' };
  }

  if (from_wallet_type === to_wallet_type) {
    return { success: false, error: 'Cannot transfer to the same wallet' };
  }

  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isValidAmount(parsedAmount, 0, 1000000)) {
    return { success: false, error: 'Invalid transfer amount' };
  }

  return {
    success: true,
    data: {
      from_wallet_type: from_wallet_type as 'task' | 'royalty' | 'main',
      to_wallet_type: to_wallet_type as 'task' | 'royalty' | 'main',
      amount: parsedAmount as number
    }
  };
}
