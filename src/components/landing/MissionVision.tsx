import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Telescope, Globe, Users, Shield, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * MISSION & VISION — LEGENDARY CINEMATIC SECTION
 * Sovereign Purpose Statement with Interactive Effects
 */

// Highlighted phrase component with gold glow on hover
function HighlightedPhrase({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.span
      className="relative inline-block cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span 
        className="relative z-10 font-semibold text-[#FFD700] transition-all duration-300"
        style={{
          textShadow: isHovered 
            ? '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)' 
            : '0 0 10px rgba(255, 215, 0, 0.2)'
        }}
      >
        {children}
      </span>
      <motion.span
        className="absolute inset-0 -z-10 rounded"
        animate={{
          background: isHovered 
            ? 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)'
            : 'transparent',
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.span>
  );
}

// Ambient gold dust particles
function GoldDustParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; duration: number }[]>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-[#FFD700]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.6)',
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function MissionVision() {
  return (
    <section className="py-24 sm:py-32 px-6 lg:px-8 relative overflow-hidden">
      {/* Deep Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(45 100% 51% / 0.03) 0%, transparent 50%)'
        }}
      />
      
      {/* Gold Light Streaks */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(255, 215, 0, 0.15), transparent)'
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-1/4 w-px h-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(255, 215, 0, 0.1), transparent)'
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Ambient Gold Dust */}
      <GoldDustParticles />
      
      {/* Bottom Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 51% / 0.06) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs text-[#FFD700] uppercase tracking-[0.3em] font-semibold mb-4 block">
            Our Foundation
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Purpose & Aspiration
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 relative">
          {/* Vertical Gold Separator Line (Desktop) */}
          <motion.div
            className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 215, 0, 0.4) 20%, rgba(255, 215, 0, 0.4) 80%, transparent 100%)'
            }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Mission Card */}
          <motion.div
            className="relative rounded-2xl p-8 lg:p-10 lg:mr-6"
            style={{
              background: 'linear-gradient(135deg, hsl(220 23% 8% / 0.95) 0%, hsl(220 23% 5%) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(220 23% 20% / 0.3)'
            }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{
              scale: 0.98,
              borderColor: 'hsl(45 100% 51% / 0.4)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.1)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#FFD700]/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#FFD700]/30 rounded-br-2xl pointer-events-none" />

            {/* Icon Header */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="h-8 w-8 text-[#FFD700]" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.div>
              <div>
                <span className="text-xs text-[#FFD700] uppercase tracking-wider font-semibold">Our Purpose</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Mission</h3>
              </div>
            </div>

            {/* Mission Content */}
            <p className="text-muted-foreground leading-relaxed text-lg lg:text-xl mb-6">
              To decentralize wealth creation by rewarding <HighlightedPhrase>verified human effort</HighlightedPhrase> with a sovereign digital asset, empowering individuals globally to convert time, skill, and labor into <HighlightedPhrase>financial independence</HighlightedPhrase>.
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-6 border-t border-border/30">
              <Users className="h-5 w-5 text-[#FFD700]/60" />
              <span className="text-sm text-muted-foreground">Empowering the global individual</span>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            className="relative rounded-2xl p-8 lg:p-10 lg:ml-6"
            style={{
              background: 'linear-gradient(135deg, hsl(220 23% 8% / 0.95) 0%, hsl(220 23% 5%) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(220 23% 20% / 0.3)'
            }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            whileHover={{
              scale: 0.98,
              borderColor: 'hsl(45 100% 51% / 0.4)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.1)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#FFD700]/30 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#FFD700]/30 rounded-bl-2xl pointer-events-none" />

            {/* Icon Header */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
                }}
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Telescope className="h-8 w-8 text-[#FFD700]" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                />
              </motion.div>
              <div>
                <span className="text-xs text-[#FFD700] uppercase tracking-wider font-semibold">Our Destination</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Vision</h3>
              </div>
            </div>

            {/* Vision Content */}
            <p className="text-muted-foreground leading-relaxed text-lg lg:text-xl mb-6">
              To become the <HighlightedPhrase>global standard</HighlightedPhrase> for labor-to-equity conversion, bridging the gap between human effort and tangible wealth, and establishing a <HighlightedPhrase>sovereign ecosystem</HighlightedPhrase> where digital effort holds real-world value.
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-6 border-t border-border/30">
              <Globe className="h-5 w-5 text-[#FFD700]/60" />
              <span className="text-sm text-muted-foreground">A worldwide financial revolution</span>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/auth">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="relative h-14 px-10 text-base font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 shadow-lg shadow-[#FFD700]/30 gap-2 overflow-hidden"
              >
                <Sparkles className="w-5 h-5" />
                Join the Alpha Ecosystem
                <ArrowUpRight className="w-5 h-5" />
                
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </Link>
          
          <p className="text-xs text-muted-foreground mt-4 opacity-60">
            Activate your membership and start earning ₳ today
          </p>
        </motion.div>
      </div>
    </section>
  );
}
