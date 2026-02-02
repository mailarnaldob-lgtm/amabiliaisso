import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, ArrowLeft, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Our team will review your inquiry and respond shortly.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

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
        {/* Header - 2026 Style */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 mb-6">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have questions about the Amabilia Network? Our support team is here to help. 
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info - 2026 Titanium Cards */}
          <div className="space-y-6">
            <Card className="titanium-card widget-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base text-foreground">Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-mono text-sm">support@amabilianetwork.com</p>
              </CardContent>
            </Card>

            <Card className="titanium-card widget-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base text-foreground">Phone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-mono text-sm">+63 917 123 4567</p>
              </CardContent>
            </Card>

            <Card className="titanium-card widget-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base text-foreground">Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Metro Manila<br />
                  Philippines
                </p>
              </CardContent>
            </Card>

            <Card className="titanium-card widget-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base text-foreground">Support Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-muted-foreground text-sm">Mon - Fri: 9AM - 6PM PHT</p>
                <p className="text-muted-foreground text-sm">Sat: 10AM - 2PM PHT</p>
                <p className="text-muted-foreground text-sm">Sun: Closed</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form - 2026 Titanium Card */}
          <Card className="lg:col-span-2 titanium-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                    <Input id="firstName" placeholder="Juan" required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                    <Input id="lastName" placeholder="Dela Cruz" required className="bg-background" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="juan@example.com" required className="bg-background" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">Subject</Label>
                  <Input id="subject" placeholder="What is your inquiry about?" required className="bg-background" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please describe your question or concern..." 
                    className="min-h-[150px] bg-background"
                    required 
                  />
                </div>
                
                <Button type="submit" className="w-full haptic-press" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>
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

export default Contact;
