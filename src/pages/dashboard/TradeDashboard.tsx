/**
 * TRADE PILLAR - Sovereign Liquidity Engine  
 * Buy & Sell ₳ Credits (Alpha Exchanger)
 * Routes: /dashboard/trade
 */
import { lazy, Suspense } from 'react';
import { AlphaLoader } from '@/components/ui/AlphaLoader';

// Lazy load the full ExchangerApp since it's a heavy component
const ExchangerApp = lazy(() => import('../alpha/ExchangerApp'));

export default function TradeDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AlphaLoader size="lg" />
      </div>
    }>
      <ExchangerApp />
    </Suspense>
  );
}
