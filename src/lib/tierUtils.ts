/**
 * Tier Utilities - SOVEREIGN BRANDING V8.7
 * 
 * Manages tier-to-label mapping globally across the UI.
 * 'INACTIVE ACCOUNT' is the default for users with no assigned membership tier (membership_tier: null).
 * New signups start as inactive and need to pay ₱300 to become PRO.
 * 
 * TIER HIERARCHY:
 * - PRO: ₱300 (Entry Level)
 * - EXPERT: ₱600 (Ad Wizard, Priority Queue, 10% Overrides)
 * - ELITE: ₱900 (Alpha Bankers Cooperative, 1% Daily Vault Yield)
 */

export type MembershipTier = 'pro' | 'expert' | 'elite' | null;

export interface TierConfig {
  id: string;
  label: string;
  displayName: string;
  price: number;
  color: string;
  features: string[];
}

// Tier configuration with accurate pricing per Blueprint V8.7
export const TIER_CONFIG: Record<string, TierConfig> = {
  free: {
    id: 'free',
    label: 'INACTIVE ACCOUNT',
    displayName: 'Inactive',
    price: 0,
    color: 'bg-muted',
    features: ['Basic platform access', 'Community browsing'],
  },
  pro: {
    id: 'pro',
    label: 'PRO ACCOUNT',
    displayName: 'Pro',
    price: 300,
    color: 'bg-secondary',
    features: ['Full VPA Mission Access', '50% Referral Commission', 'Omni-Transfer Engine', 'Alpha Mobile Dashboard'],
  },
  expert: {
    id: 'expert',
    label: 'EXPERT ACCOUNT',
    displayName: 'Expert',
    price: 600,
    color: 'bg-primary',
    features: ['All Pro Features', 'Ad Wizard Professional', 'Priority Mission Queue', '10% Network Overrides (Lvl 1-2)', '15,000 ₳ Daily Transfer Limit'],
  },
  elite: {
    id: 'elite',
    label: 'ELITE ACCOUNT',
    displayName: 'Elite',
    price: 900,
    color: 'bg-accent-foreground',
    features: ['All Expert Features', 'Alpha Bankers Cooperative', '1% Daily Vault Yield', 'P2P Lending Access', 'Full Royalty Engine', 'Priority Support'],
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
