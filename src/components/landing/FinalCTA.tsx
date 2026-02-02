import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Shield, Globe, Sparkles } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-400/8 rounded-full blur-[200px] pointer-events-none" />
      
      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, transparent 100%)',
            border: '1px solid hsl(45 100% 51% / 0.3)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Protocol is Live</span>
        </motion.div>
        
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          The Blueprint for{' '}
          <span className="text-amber-400">Next-Generation Finance</span>{' '}
          is Open
        </motion.h2>
        
        <motion.p 
          className="text-xl text-muted-foreground mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          The only question is:{' '}
          <span 
            className="font-semibold"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Are you part of the foundation?
          </span>
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/auth">
            <Button 
              size="lg" 
              className="relative gap-3 text-lg px-10 py-7 font-semibold rounded-lg text-black overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 0 50px hsl(45 100% 51% / 0.5), 0 10px 40px hsl(0 0% 0% / 0.4)'
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Enter ₳mabilia Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400/70" /> Limited founding window
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400/70" /> Secure infrastructure
          </span>
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-400/70" /> Global access
          </span>
        </motion.div>
      </div>
    </section>
  );
}
