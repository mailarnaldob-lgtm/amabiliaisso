import React, { Suspense, ReactNode } from 'react';
import { AlphaLoader } from './AlphaLoader';

interface AlphaSuspenseBoundaryProps {
  children: ReactNode;
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Premium AlphaSuspenseBoundary wrapper for lazy-loaded route transitions.
 * Automatically displays the AlphaLoader during component loading.
 * 
 * Usage:
 * <AlphaSuspenseBoundary>
 *   <LazyLoadedComponent />
 * </AlphaSuspenseBoundary>
 */
export const AlphaSuspenseBoundary: React.FC<AlphaSuspenseBoundaryProps> = ({
  children,
  message = "INITIALIZING SOVEREIGN LEDGER",
  fullScreen = true,
  size = 'md'
}) => {
  return (
    <Suspense
      fallback={
        <AlphaLoader 
          fullScreen={fullScreen} 
          message={message} 
          size={size} 
        />
      }
    >
      {children}
    </Suspense>
  );
};

export default AlphaSuspenseBoundary;
