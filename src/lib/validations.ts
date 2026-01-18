import { z } from 'zod';

// Password validation schema with strong requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number;
  label: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'weak', color: 'bg-destructive' };
  if (score <= 4) return { score, label: 'fair', color: 'bg-yellow-500' };
  if (score <= 5) return { score, label: 'good', color: 'bg-blue-500' };
  return { score, label: 'strong', color: 'bg-green-500' };
}

// Profile validation schema
export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(200, 'Full name must be less than 200 characters')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  phone: z
    .string()
    .trim()
    .max(15, 'Phone number must be less than 15 characters')
    .regex(/^(\+?[0-9]{10,15})?$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

// Payment submission validation schema
export const paymentSchema = z.object({
  tier: z.enum(['basic', 'pro', 'elite'], {
    required_error: 'Please select a membership tier',
  }),
  payment_method: z.enum(['gcash', 'bpi', 'bdo'], {
    required_error: 'Please select a payment method',
  }),
  reference_number: z
    .string()
    .trim()
    .min(1, 'Reference number is required')
    .max(50, 'Reference number must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Reference number can only contain letters, numbers, and hyphens'),
});

// Type exports
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
