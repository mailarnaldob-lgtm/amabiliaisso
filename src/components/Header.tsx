import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Header V8.5 - Sovereign Prestige Navigation
 * High-end fintech aesthetic with smart window logic
 * Desktop: Auth opens in new tab | Mobile: Same window navigation
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  const handleAuthNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Desktop: Open in new tab | Mobile: Navigate in same window
    if (!isMobile) {
      e.preventDefault();
      window.open('/auth', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'hsl(220 23% 5% / 0.95)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid hsl(45 100% 51% / 0.08)'
      }}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
              border: '1px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 15px hsl(45 100% 51% / 0.2)'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span 
              className="font-bold text-base"
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
            className="text-lg font-semibold tracking-[0.12em] text-foreground"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AMABILIA
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* About Link */}
          <Link 
            to="/about" 
            className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300 group ${
              isActive('/about') ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>About</span>
            <span 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300 ${
                isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            />
          </Link>

          {/* Contact Link */}
          <Link 
            to="/contact" 
            className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300 group ${
              isActive('/contact') ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Contact</span>
            <span 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300 ${
                isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
            />
          </Link>

          {/* Divider */}
          <div 
            className="w-px h-6 mx-3"
            style={{ background: 'hsl(45 100% 51% / 0.2)' }}
          />

          {/* Login */}
          <Link to="/auth" onClick={handleAuthNavigation}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 font-medium tracking-wide"
            >
              Login
            </Button>
          </Link>

          {/* Access Portal */}
          <Link to="/auth" onClick={handleAuthNavigation}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="px-5 py-2 text-sm rounded-md font-semibold text-black tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                }}
              >
                Access Portal
              </Button>
            </motion.div>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-amber-400/10 transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-amber-400" />
          ) : (
            <Menu className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden"
            style={{
              background: 'hsl(220 23% 5% / 0.98)',
              borderTop: '1px solid hsl(45 100% 51% / 0.08)'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="container py-4 flex flex-col gap-2">
              <Link 
                to="/about" 
                className={`px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
                  isActive('/about') 
                    ? 'bg-amber-400/10 text-amber-400' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
                  isActive('/contact') 
                    ? 'bg-amber-400/10 text-amber-400' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="h-px bg-border/10 my-2" />
              
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  className="w-full py-3 text-sm rounded-lg font-semibold text-black tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                  }}
                >
                  Access Portal
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
