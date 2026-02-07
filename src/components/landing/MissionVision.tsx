import { motion } from 'framer-motion';
import { Target, Telescope, Globe, Users } from 'lucide-react';

/**
 * MISSION & VISION — FINAL FOOTING
 * Sovereign Purpose Statement
 */

export function MissionVision() {
  return (
    <section className="py-20 sm:py-28 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 51% / 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Mission */}
          <motion.div
            className="relative rounded-2xl p-8 lg:p-10"
            style={{
              background: 'linear-gradient(135deg, hsl(220 23% 8% / 0.95) 0%, hsl(220 23% 5%) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(220 23% 20% / 0.3)'
            }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{
              scale: 0.98,
              borderColor: 'hsl(45 100% 51% / 0.3)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Icon */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.2) 0%, hsl(45 100% 51% / 0.05) 100%)',
                  border: '1px solid hsl(45 100% 51% / 0.3)',
                  boxShadow: '0 0 30px hsl(45 100% 51% / 0.15)'
                }}
              >
                <Target className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Our Purpose</span>
                <h3 className="text-2xl font-bold text-foreground">Mission</h3>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-lg">
              To <span className="text-foreground font-medium">decentralize wealth creation</span> by rewarding verified human effort with a sovereign digital asset.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/30">
              <Users className="h-4 w-4 text-amber-400/60" />
              <span className="text-xs text-muted-foreground">Empowering the global individual</span>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="relative rounded-2xl p-8 lg:p-10"
            style={{
              background: 'linear-gradient(135deg, hsl(220 23% 8% / 0.95) 0%, hsl(220 23% 5%) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(220 23% 20% / 0.3)'
            }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{
              scale: 0.98,
              borderColor: 'hsl(45 100% 51% / 0.3)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Icon */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.2) 0%, hsl(45 100% 51% / 0.05) 100%)',
                  border: '1px solid hsl(45 100% 51% / 0.3)',
                  boxShadow: '0 0 30px hsl(45 100% 51% / 0.15)'
                }}
              >
                <Telescope className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Our Destination</span>
                <h3 className="text-2xl font-bold text-foreground">Vision</h3>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-lg">
              To become the <span className="text-foreground font-medium">global standard</span> for labor-to-equity conversion, bridging the gap between digital effort and physical wealth.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/30">
              <Globe className="h-4 w-4 text-amber-400/60" />
              <span className="text-xs text-muted-foreground">A worldwide financial revolution</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}