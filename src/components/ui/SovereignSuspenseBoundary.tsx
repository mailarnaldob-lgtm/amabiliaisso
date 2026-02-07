import React, { Suspense, ReactNode } from 'react';
import { SovereignLoader } from './SovereignLoader';

interface SovereignSuspenseBoundaryProps {
  children: ReactNode;
  message?: string;
  fullScreen?: boolean;
}

/**
 * AMABILIA NETWORK Sovereign Suspense Boundary
 * Wraps lazy-loaded routes with the branded SovereignLoader.
 * Provides a cinematic loading experience during route transitions.
 */
export const SovereignSuspenseBoundary: React.FC<SovereignSuspenseBoundaryProps> = ({
  children,
  message = "INITIALIZING SOVEREIGN LEDGER",
  fullScreen = true
}) => {
  return (
    <Suspense
      fallback={
        <SovereignLoader 
          fullScreen={fullScreen} 
          message={message} 
        />
      }
    >
      {children}
    </Suspense>
  );
};

export default SovereignSuspenseBoundary;
