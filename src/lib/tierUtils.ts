/**
 * Tier Utilities
 * 
 * Manages tier-to-label mapping globally across the UI.
 * Single ₱800 activation membership - simplified from 3-tier system.
 * 50% referral commission on all activations.
 */

export type MembershipTier = 'basic' | 'pro' | 'elite' | null;

export interface TierConfig {
  id: string;
  label: string;
  displayName: string;
  price: number;
  color: string;
  features: string[];
}

// Single activation membership - ₱800
export const ACTIVATION_FEE = 800;

// Tier configuration - simplified single-tier activation
export const TIER_CONFIG: Record<string, TierConfig> = {
  free: {
    id: 'free',
    label: 'OBSERVER',
    displayName: 'Observer',
    price: 0,
    color: 'bg-muted',
    features: ['View live missions', 'Browse VOLT dividends', 'Cannot participate'],
  },
  basic: {
    id: 'basic',
    label: 'ACTIVATED',
    displayName: 'Member',
    price: ACTIVATION_FEE,
    color: 'bg-primary',
    features: [
      '50% referral commission',
      'Access to VPA missions (90% payout)',
      'VOLT liquidity participation',
      'P2P Exchange access',
      'Full ecosystem access',
    ],
  },
  // Legacy tiers mapped to activated for backwards compatibility
  pro: {
    id: 'pro',
    label: 'ACTIVATED',
    displayName: 'Member',
    price: ACTIVATION_FEE,
    color: 'bg-primary',
    features: [
      '50% referral commission',
      'Access to VPA missions (90% payout)',
      'VOLT liquidity participation',
      'P2P Exchange access',
      'Full ecosystem access',
    ],
  },
  elite: {
    id: 'elite',
    label: 'ACTIVATED',
    displayName: 'Member',
    price: ACTIVATION_FEE,
    color: 'bg-primary',
    features: [
      '50% referral commission',
      'Access to VPA missions (90% payout)',
      'VOLT liquidity participation',
      'P2P Exchange access',
      'Full ecosystem access',
    ],
  },
};

/**
 * Get the display label for a membership tier
 * Returns 'OBSERVER' for null/undefined tiers
 */
export function getTierLabel(tier: MembershipTier): string {
  if (!tier) return TIER_CONFIG.free.label;
  return TIER_CONFIG[tier]?.label || TIER_CONFIG.free.label;
}

/**
 * Get the short display name for a membership tier
 * Returns 'Observer' for null/undefined tiers
 */
export function getTierDisplayName(tier: MembershipTier): string {
  if (!tier) return TIER_CONFIG.free.displayName;
  return TIER_CONFIG[tier]?.displayName || TIER_CONFIG.free.displayName;
}

/**
 * Get the color class for a membership tier
 */
export function getTierColor(tier: MembershipTier): string {
  if (!tier) return TIER_CONFIG.free.color;
  return TIER_CONFIG[tier]?.color || TIER_CONFIG.free.color;
}

/**
 * Get the price for activation
 */
export function getTierPrice(tier: MembershipTier): number {
  if (!tier) return 0;
  return ACTIVATION_FEE;
}

/**
 * Get all features for a membership tier
 */
export function getTierFeatures(tier: MembershipTier): string[] {
  if (!tier) return TIER_CONFIG.free.features;
  return TIER_CONFIG[tier]?.features || TIER_CONFIG.free.features;
}

/**
 * Check if tier is a paid/activated tier
 */
export function isPaidTier(tier: MembershipTier): boolean {
  return tier !== null && tier !== undefined;
}

/**
 * Format the tier for badge display
 */
export function formatTierBadge(tier: MembershipTier): string {
  if (!tier) return 'Observer';
  return 'Member';
}

// Commission rates - NEW BUSINESS RULES
export const COMMISSION_RATES = {
  referral: 50, // 50% direct referral commission (was 40%)
  taskWorkerShare: 90, // 90% of task reward goes to worker
  taskPlatformFee: 10, // 10% platform fee on tasks
  voltWeeklyDividend: 3, // 3% weekly growth dividend
  exchangeP2P: 1, // 1% P2P exchange fee
  exchangeDirectBuy: 6, // 6% direct buy fee
  exchangeDirectSell: 5, // 5% direct sell fee
} as const;

// Exchange fee structure
export const EXCHANGE_FEES = {
  p2p: 1,
  directBuy: 6,
  directSell: 5,
} as const;
