import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Globe, Heart } from "lucide-react";

const About = () => {
  return (
    <PublicLayout>
      <div className="container py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Amabilia
          </h1>
          <p className="text-lg text-muted-foreground">
            We're passionate about delivering quality products and exceptional service 
            to businesses of all sizes. Our mission is to be your trusted partner in 
            sourcing the finest ingredients and supplies.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quality First</h3>
              <p className="text-sm text-muted-foreground">
                We source only the finest products from trusted suppliers worldwide.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Customer Focus</h3>
              <p className="text-sm text-muted-foreground">
                Your success is our priority. We go above and beyond to serve you.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Serving businesses across the country with reliable delivery.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Sustainability</h3>
              <p className="text-sm text-muted-foreground">
                Committed to eco-friendly practices and sustainable sourcing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story */}
        <div className="bg-card rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded with a passion for quality, Amabilia began as a small family business 
                dedicated to sourcing the finest products for local businesses. Over the years, 
                we've grown into a trusted supplier serving customers nationwide.
              </p>
              <p>
                Our commitment to excellence has never wavered. We personally vet every supplier 
                and product in our catalog to ensure it meets our rigorous standards. When you 
                shop with Amabilia, you can trust that you're getting the best.
              </p>
              <p>
                Today, we continue to expand our offerings while maintaining the personalized 
                service that sets us apart. Whether you're a small bakery or a large restaurant 
                chain, we're here to support your success.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
