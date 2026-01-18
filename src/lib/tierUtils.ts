// Utility functions for membership tier display

export type MembershipTierValue = 'basic' | 'pro' | 'elite' | null;

export interface TierDisplayInfo {
  label: string;
  isPaid: boolean;
}

/**
 * Get display label for membership tier.
 * Returns "FREE" for null/unpaid accounts, paid tier names otherwise.
 */
export function getTierDisplayLabel(tier: MembershipTierValue): string {
  switch (tier) {
    case 'basic':
      return 'Basic';
    case 'pro':
      return 'Pro';
    case 'elite':
      return 'Elite';
    default:
      return 'Free';
  }
}

/**
 * Check if tier is a paid tier
 */
export function isPaidTier(tier: MembershipTierValue): boolean {
  return tier === 'basic' || tier === 'pro' || tier === 'elite';
}

/**
 * Get the next upgrade tier for CTA display
 */
export function getNextUpgradeTier(tier: MembershipTierValue): { name: string; cost: number } | null {
  switch (tier) {
    case null:
      return { name: 'Basic', cost: 1000 };
    case 'basic':
      return { name: 'Pro', cost: 2000 };
    case 'pro':
      return { name: 'Elite', cost: 3000 };
    case 'elite':
      return null; // Already at highest tier
    default:
      return { name: 'Basic', cost: 1000 };
  }
}
