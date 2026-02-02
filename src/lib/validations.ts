import { z } from 'zod';

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

// Payment submission validation schema - SOVEREIGN BRANDING V8.7
export const paymentSchema = z.object({
  tier: z.enum(['pro', 'expert', 'elite'], {
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
