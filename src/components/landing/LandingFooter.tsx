import { motion } from 'framer-motion';
import { Shield, Scale, Globe, Lock, Landmark, CheckCircle, Building, Home, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

/**
 * LandingFooter V8.5 - Banking-Grade Enterprise Footer
 * Goldman Sachs / Maya inspired aesthetic
 * Features: Return to Home + Back to Dashboard buttons
 * All other links scroll to top (display only)
 */

const scrollToTop = (e: React.MouseEvent) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const footerSections = [
  {
    title: 'LEGAL',
    icon: Scale,
    links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Compliance']
  },
  {
    title: 'TRUST',
    icon: Shield,
    links: ['Security Center', 'Data Protection', 'Risk Disclosure', 'Audit Reports']
  },
  {
    title: 'SOVEREIGN',
    icon: Landmark,
    links: ['About Alpha', 'Leadership', 'Careers', 'Press Room']
  }
];

const certifications = [
  { icon: Lock, label: 'SSL Secured' },
  { icon: CheckCircle, label: 'PCI Compliant' },
  { icon: Shield, label: '256-bit Encryption' }
];

export function LandingFooter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <footer 
      className="relative pt-16 pb-8 px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, hsl(220 23% 4%) 0%, hsl(220 23% 2%) 100%)',
        borderTop: '1px solid hsl(45 100% 51% / 0.08)'
      }}
    >
      {/* Top Accent Line */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
      />

      <div className="container mx-auto max-w-6xl">
        {/* Quick Navigation Buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="px-6 py-3 text-sm rounded-md font-semibold text-black tracking-wide flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                }}
              >
                <Home className="w-4 h-4" />
                RETURN TO HOME
              </Button>
            </motion.div>
          </Link>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleDashboardClick}
              className="px-6 py-3 text-sm rounded-md font-semibold tracking-wide flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                border: '1px solid hsl(45 100% 51% / 0.3)',
                color: '#FFD700',
                boxShadow: '0 0 15px hsl(45 100% 51% / 0.15)'
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              BACK TO DASHBOARD
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Footer Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                  border: '1px solid hsl(45 100% 51% / 0.2)'
                }}
              >
                <span 
                  className="font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ₳
                </span>
              </div>
              <div>
                <span 
                  className="text-lg font-semibold tracking-[0.15em] text-foreground block"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  AMABILIA
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest">
                  ALPHA ECOSYSTEM
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Engineered financial architecture for the global individual. 
              Bridging high-velocity liquidity with exponential growth.
            </p>
            
            {/* Security Badges */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] text-muted-foreground"
                  style={{
                    background: 'hsl(220 23% 8%)',
                    border: '1px solid hsl(45 100% 51% / 0.1)'
                  }}
                >
                  <cert.icon className="w-3 h-3 text-amber-500/70" />
                  <span>{cert.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-4 h-4 text-amber-500/80" />
                <h4 
                  className="text-xs font-semibold tracking-[0.2em] text-foreground"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {section.title}
                </h4>
              </div>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a 
                      href="#"
                      onClick={scrollToTop}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors duration-300 cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div 
          className="w-full h-px mb-6"
          style={{ background: 'hsl(45 100% 51% / 0.08)' }}
        />

        {/* Bottom Bar */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {/* Regulatory Notice */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Global Operations
            </span>
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              Sovereign Licensed
            </span>
          </div>

          {/* Copyright - Center */}
          <p 
            className="text-xs text-muted-foreground tracking-wide text-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            © 2026 Amabilia Alpha Ecosystem. All Rights Reserved.
          </p>

          {/* Spacer for symmetry */}
          <div className="hidden sm:block w-[180px]" />
        </motion.div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-border/5">
          <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed max-w-3xl mx-auto">
            ₳ Credits are the primary Sovereign Utility Units powering the Amabilia Network's decentralized protocols. 
            They represent Proof-of-Participation and fuel P2P Liquidity Agreements within the ecosystem. 
            Please review our documentation before participating in Sovereign Growth activities.
          </p>
        </div>
      </div>
    </footer>
  );
}
