import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="font-serif text-2xl font-bold text-foreground">₳LPHA</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container py-4 flex flex-col gap-4">
            <Link 
              to="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">Get Started</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
