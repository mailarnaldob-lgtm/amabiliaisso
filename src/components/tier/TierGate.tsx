import { ReactNode } from 'react';
import { useAppStore, MembershipTier } from '@/stores/appStore';
import { LockedFeature } from './LockedFeature';

interface TierGateProps {
  children: ReactNode;
  requiredTier: MembershipTier;
  featureName?: string;
}

const tierHierarchy: Record<MembershipTier, number> = {
  basic: 1,
  pro: 2,
  elite: 3,
};

export function TierGate({ children, requiredTier, featureName }: TierGateProps) {
  const membershipTier = useAppStore((state) => state.membershipTier);
  
  const hasAccess = tierHierarchy[membershipTier] >= tierHierarchy[requiredTier];
  
  if (!hasAccess) {
    return <LockedFeature tierRequired={requiredTier} featureName={featureName} />;
  }
  
  return <>{children}</>;
}

export function useTierAccess() {
  const membershipTier = useAppStore((state) => state.membershipTier);
  
  const hasTierAccess = (requiredTier: MembershipTier): boolean => {
    return tierHierarchy[membershipTier] >= tierHierarchy[requiredTier];
  };
  
  return {
    currentTier: membershipTier,
    hasTierAccess,
    isBasic: membershipTier === 'basic',
    isPro: membershipTier === 'pro',
    isElite: membershipTier === 'elite',
    canAccessPro: tierHierarchy[membershipTier] >= tierHierarchy.pro,
    canAccessElite: membershipTier === 'elite',
  };
}
