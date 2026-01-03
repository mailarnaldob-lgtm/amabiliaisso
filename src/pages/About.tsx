import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Globe, Heart, Shield, CheckCircle } from "lucide-react";

const About = () => {
  return (
    <PublicLayout>
      <div className="container py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Amabilia Network
          </h1>
          <p className="text-lg text-muted-foreground">
            A community-powered platform designed for structured participation and collaboration. 
            Our mission is to create an organized ecosystem where contributions are recognized 
            through transparent, admin-controlled processes.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Admin Oversight</h3>
              <p className="text-sm text-muted-foreground">
                All activities and credit allocations are reviewed and approved by administrators.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Community Focus</h3>
              <p className="text-sm text-muted-foreground">
                Built around community collaboration and structured participation models.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Transparent System</h3>
              <p className="text-sm text-muted-foreground">
                Clear tracking of all participation activities and credit allocations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Member Support</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated support for all members throughout their participation journey.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Description */}
        <div className="bg-card rounded-lg p-8 md:p-12 mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Our Platform</h2>
            <div className="space-y-4 text-muted-foreground">
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
        </div>

        {/* Important Notice */}
        <div className="bg-muted/50 border border-border rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-semibold text-foreground mb-4">Important Notice</h3>
            <p className="text-sm text-muted-foreground">
              ₳ Credits are internal system units used exclusively for tracking participation within 
              the Amabilia Network. They do not represent money, stored value, or any form of 
              investment. Credits cannot be redeemed, converted, or exchanged for cash or monetary 
              equivalents. All platform activities are subject to administrative review and approval.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
