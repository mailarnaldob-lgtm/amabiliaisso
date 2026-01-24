/**
 * Tier Utilities
 * 
 * Manages tier-to-label mapping globally across the UI.
 * 'INACTIVE ACCOUNT' is the default for users with no assigned membership tier (membership_tier: null).
 * New signups start as inactive and need to pay ₱300 to become Basic.
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

// Tier configuration with accurate pricing
export const TIER_CONFIG: Record<string, TierConfig> = {
  free: {
    id: 'free',
    label: 'INACTIVE ACCOUNT',
    displayName: 'Inactive',
    price: 0,
    color: 'bg-muted',
    features: ['Basic platform access', 'Community browsing'],
  },
  basic: {
    id: 'basic',
    label: 'BASIC ACCOUNT',
    displayName: 'Basic',
    price: 300,
    color: 'bg-secondary',
    features: ['Referral access program', '50% referral commission', 'Access to community platform'],
  },
  pro: {
    id: 'pro',
    label: 'PRO ACCOUNT',
    displayName: 'Pro',
    price: 600,
    color: 'bg-primary',
    features: ['Referral access program', '50% referral commission', 'Activity-based credits (VPA)', 'Training access'],
  },
  elite: {
    id: 'elite',
    label: 'ELITE ACCOUNT',
    displayName: 'Elite',
    price: 900,
    color: 'bg-accent-foreground',
    features: ['Referral access program', '50% referral commission', 'Activity-based credits (VPA)', 'Credit marketplace (P2P Lending)', 'VIP support', 'KYC verification'],
  },
};

/**
 * Get the display label for a membership tier
 * Returns 'INACTIVE ACCOUNT' for null/undefined tiers
 */
export function getTierLabel(tier: MembershipTier): string {
  if (!tier) return TIER_CONFIG.free.label;
  return TIER_CONFIG[tier]?.label || TIER_CONFIG.free.label;
}

/**
 * Get the short display name for a membership tier
 * Returns 'Inactive' for null/undefined tiers
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
 * Get the price for a membership tier
 */
export function getTierPrice(tier: MembershipTier): number {
  if (!tier) return 0;
  return TIER_CONFIG[tier]?.price || 0;
}

/**
 * Get all features for a membership tier
 */
export function getTierFeatures(tier: MembershipTier): string[] {
  if (!tier) return TIER_CONFIG.free.features;
  return TIER_CONFIG[tier]?.features || TIER_CONFIG.free.features;
}

/**
 * Check if tier is a paid tier
 */
export function isPaidTier(tier: MembershipTier): boolean {
  return tier !== null && tier !== undefined;
}

/**
 * Format the tier for badge display
 */
export function formatTierBadge(tier: MembershipTier): string {
  if (!tier) return 'Inactive';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

// Commission rates (for documentation and display)
export const COMMISSION_RATES = {
  referral: 50, // 50% direct referral commission
  taskWorkerSplit: 90, // 90% of task reward goes to worker
  taskPlatformFee: 10, // 10% platform fee on tasks
} as const;
