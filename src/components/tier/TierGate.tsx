import { ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { MembershipTier } from '@/stores/appStore';
import { LockedFeature } from './LockedFeature';

interface TierGateProps {
  children: ReactNode;
  requiredTier?: MembershipTier;
  featureName?: string;
}

/**
 * TierGate - Simplified for single-tier activation model
 * 
 * With the new ₱800 single activation fee, access is binary:
 * - null tier = OBSERVER (free, cannot participate)
 * - Any non-null tier = ACTIVATED MEMBER (full access)
 */
export function TierGate({ children, requiredTier, featureName }: TierGateProps) {
  const { data: profile } = useProfile();
  
  // With single-tier model, just check if user is activated (has any tier)
  const isActivated = profile?.membership_tier !== null && profile?.membership_tier !== undefined;
  
  if (!isActivated) {
    return <LockedFeature tierRequired={requiredTier || 'basic'} featureName={featureName} />;
  }
  
  return <>{children}</>;
}

export function useTierAccess() {
  const { data: profile } = useProfile();
  
  // With single-tier model, check if user has any tier (is activated)
  const isActivated = profile?.membership_tier !== null && profile?.membership_tier !== undefined;
  
  return {
    currentTier: profile?.membership_tier || null,
    isActivated,
    // Legacy compatibility - all activated users have full access
    isBasic: isActivated,
    isPro: isActivated,
    isElite: isActivated,
    canAccessPro: isActivated,
    canAccessElite: isActivated,
    hasTierAccess: (_requiredTier: MembershipTier): boolean => isActivated,
  };
}
