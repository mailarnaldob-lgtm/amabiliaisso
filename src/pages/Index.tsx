import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/mockData";
import { ArrowRight, Truck, Shield, HeadphonesIcon } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const featuredProducts = products.slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        
        <div className="container relative py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Quality Products for Your <span className="text-primary">Business</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Discover our curated selection of premium products designed to meet your business needs. 
              From artisan ingredients to specialty supplies.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="gap-2">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fast Delivery</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Free shipping on orders over $50
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Payments</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  100% secure payment processing
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <HeadphonesIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">24/7 Support</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Always here to help you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Featured Products</h2>
              <p className="mt-2 text-muted-foreground">Handpicked for quality and value</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
            Join thousands of businesses that trust Amabilia for their supply needs.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/products">
              <Button size="lg" variant="secondary">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
