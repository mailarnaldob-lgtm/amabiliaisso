import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="enterprise-header sticky top-0 z-50 w-full border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo with red glow effect */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="h-8 w-8 text-primary animate-pulse-glow" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-serif text-2xl font-black tracking-widest text-foreground">
            ₳LPHA
          </span>
        </Link>
        
        {/* Desktop Navigation with pill styling */}
        <nav className="hidden md:flex items-center gap-2">
          <Link 
            to="/about" 
            className={`nav-pill px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isActive('/about') 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`nav-pill px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isActive('/contact') 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* CTA Button with enterprise styling */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/auth">
            <Button className="btn-enterprise bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground font-semibold px-6 py-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
              Access Portal
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button with glow */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-primary/10 transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
      </div>

      {/* Mobile Navigation with enterprise styling */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container py-6 flex flex-col gap-3">
            <Link 
              to="/about" 
              className={`nav-pill px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive('/about') 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`nav-pill px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive('/contact') 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="mt-2">
              <Button className="w-full btn-enterprise bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg shadow-primary/25">
                Access Portal
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
