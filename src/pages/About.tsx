import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, CheckCircle, Heart, ArrowLeft, Layers } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Obsidian with Glassmorphism */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center cyan-glow-sm">
              <span className="text-primary font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Amabilia</span>
          </Link>
        </div>
      </header>

      <main className="container py-16 relative z-10">
        {/* Hero - 2026 Style */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 mb-6">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            About Amabilia Network
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A community-powered platform designed for structured participation and collaboration. 
            Our mission is to create an organized ecosystem where contributions are recognized 
            through transparent, admin-controlled processes.
          </p>
        </div>

        {/* Values - 2026 Titanium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="titanium-card widget-hover">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Admin Oversight</h3>
              <p className="text-sm text-muted-foreground">
                All activities and credit allocations are reviewed and approved by administrators.
              </p>
            </CardContent>
          </Card>

          <Card className="titanium-card widget-hover">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Community Focus</h3>
              <p className="text-sm text-muted-foreground">
                Built around community collaboration and structured participation models.
              </p>
            </CardContent>
          </Card>

          <Card className="titanium-card widget-hover">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Transparent System</h3>
              <p className="text-sm text-muted-foreground">
                Clear tracking of all participation activities and credit allocations.
              </p>
            </CardContent>
          </Card>

          <Card className="titanium-card widget-hover">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Member Support</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated support for all members throughout their participation journey.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Description - 2026 Titanium Card */}
        <Card className="titanium-card mb-12">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">Our Platform</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Amabilia Network operates as a closed-loop ecosystem where participation is tracked 
                  using internal system credits (₳). This is not a financial platform—credits represent 
                  recognition for contributions within our community structure.
                </p>
                <p>
                  All credit allocations are manually reviewed and approved by our administrative team. 
                  Members can participate through verified activities, referral programs, and community 
                  engagement initiatives.
                </p>
                <p>
                  Our tiered membership system allows members to choose their level of access and 
                  participation. Each tier unlocks different features and opportunities within the 
                  platform ecosystem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice - 2026 Style */}
        <div className="bg-muted/30 border border-border rounded p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-semibold text-foreground mb-4">Important Notice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ₳ Credits are internal system units used exclusively for tracking participation within 
              the Amabilia Network. They do not represent money, stored value, or any form of 
              investment. Credits cannot be redeemed, converted, or exchanged for cash or monetary 
              equivalents. All platform activities are subject to administrative review and approval.
            </p>
          </div>
        </div>
      </main>

      {/* Footer - 2026 Minimal */}
      <footer className="py-12 px-6 lg:px-8 border-t border-border relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">A</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Amabilia Network © 2026
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
