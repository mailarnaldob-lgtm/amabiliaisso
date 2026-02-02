import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveAlphaStats } from '@/components/landing/LiveAlphaStats';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { FoundingCountdown } from '@/components/landing/FoundingCountdown';
import { TierShowcase } from '@/components/landing/TierShowcase';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FloatingAlphaHub } from '@/components/landing/FloatingAlphaHub';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Premium Dark Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, hsl(220 23% 8%) 0%, hsl(220 23% 4%) 50%, hsl(220 23% 2%) 100%)'
        }}
      />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(45 100% 51% / 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(45 100% 51% / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <LandingHeader />
        <HeroSection />
        <LiveAlphaStats />
        <FeaturesGrid />
        <FoundingCountdown />
        <TierShowcase />
        <FinalCTA />
        <LandingFooter />
      </div>
      
      {/* Floating Alpha Hub (FAB) */}
      <FloatingAlphaHub />
    </div>
  );
}
