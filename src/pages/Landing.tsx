import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveAlphaStats } from '@/components/landing/LiveAlphaStats';
import { FourPillars } from '@/components/landing/FourPillars';
import { CurrencyManifesto } from '@/components/landing/CurrencyManifesto';
import { TierShowcase } from '@/components/landing/TierShowcase';
import { MissionVision } from '@/components/landing/MissionVision';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Parallax for background elements
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.02, 0.03, 0.01]);
  
  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Premium Dark Background with Parallax */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, hsl(220 23% 8%) 0%, hsl(220 23% 4%) 50%, hsl(220 23% 2%) 100%)'
        }}
      />
      
      {/* Animated Grid Pattern */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: gridOpacity,
          backgroundImage: `linear-gradient(hsl(45 100% 51% / 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(45 100% 51% / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Floating ambient orbs with parallax */}
      <motion.div
        className="fixed top-1/4 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 51% / 0.03) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{
          y: [0, 50, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="fixed bottom-1/4 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 51% / 0.02) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, -20, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <LandingHeader />
        <HeroSection />
        <LiveAlphaStats />
        <FourPillars />
        <CurrencyManifesto />
        <TierShowcase />
        <MissionVision />
        <FinalCTA />
        <LandingFooter />
      </div>
      
      {/* Floating Action Center now handled globally in App.tsx */}
    </div>
  );
}