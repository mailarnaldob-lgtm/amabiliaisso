import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * LandingHeader V9.0 - Sovereign Prestige Navigation (Mobile Optimized)
 * High-end fintech aesthetic with responsive burger menu
 * Desktop: Full nav | Mobile: Logo + Burger Menu (44x44px touch targets)
 */
export function LandingHeader() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAuthNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Desktop: Open in new tab | Mobile: Navigate in same window
    if (!isMobile) {
      e.preventDefault();
      window.open('/auth', '_blank', 'noopener,noreferrer');
    }
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      className="sticky top-0 z-50"
      style={{
        background: 'hsl(220 23% 5% / 0.95)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid hsl(45 100% 51% / 0.08)'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto py-4 flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 20px hsl(45 100% 51% / 0.2)'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(45 100% 51% / 0.4)' }}
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
          </motion.div>
          <span 
            className="text-xl font-semibold tracking-[0.15em] text-foreground group-hover:text-amber-400 transition-colors duration-300 hidden sm:block"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AMABILIA
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-4">
          {/* About Link */}
          <Link 
            to="/about" 
            className="relative px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 group"
          >
            <span>About</span>
            <span 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-full transition-all duration-300"
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            />
          </Link>

          {/* Contact Link */}
          <Link 
            to="/contact" 
            className="relative px-3 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 group"
          >
            <span>Contact</span>
            <span 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-full transition-all duration-300"
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            />
          </Link>

          {/* Divider */}
          <div 
            className="hidden sm:block w-px h-6 mx-2"
            style={{ background: 'hsl(45 100% 51% / 0.2)' }}
          />

          {/* Login Button */}
          <Link to="/auth" onClick={handleAuthNavigation}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 font-medium tracking-wide transition-all duration-300"
            >
              Login
            </Button>
          </Link>

          {/* Access Portal CTA */}
          <Link to="/auth" onClick={handleAuthNavigation}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="px-5 py-2 text-sm rounded-md font-semibold text-black tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 20px hsl(45 100% 51% / 0.3), inset 0 1px 0 hsl(45 100% 80% / 0.3)'
                }}
              >
                Access Portal
              </Button>
            </motion.div>
          </Link>
        </nav>

        {/* Mobile Burger Menu Button - 44x44px touch target */}
        <button
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-amber-400/10 transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-amber-400" />
          ) : (
            <Menu className="h-6 w-6 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Slide-in Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden overflow-hidden"
            style={{
              background: 'hsl(220 23% 5% / 0.98)',
              borderTop: '1px solid hsl(45 100% 51% / 0.08)'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="container py-4 flex flex-col gap-2 px-4">
              {/* Access Portal - Primary Action (Golden) */}
              <Link to="/auth" onClick={handleAuthNavigation}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <Button 
                    className="w-full py-4 text-base rounded-lg font-semibold text-black tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                    }}
                  >
                    Access Portal
                  </Button>
                </motion.div>
              </Link>

              <div className="h-px my-2" style={{ background: 'hsl(45 100% 51% / 0.1)' }} />

              {/* About */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link 
                  to="/about" 
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                  onClick={handleLinkClick}
                >
                  About
                </Link>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Link 
                  to="/contact" 
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                  onClick={handleLinkClick}
                >
                  Contact
                </Link>
              </motion.div>

              {/* Login */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link 
                  to="/auth" 
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                  onClick={handleAuthNavigation}
                >
                  Login
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
