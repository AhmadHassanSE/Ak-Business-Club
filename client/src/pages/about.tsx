import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { ChefHat, Leaf, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const features = [
    {
      icon: ChefHat,
      title: "Premium Quality",
      description: "Handpicked ingredients and authentic recipes to bring you the finest flavors."
    },
    {
      icon: Leaf,
      title: "Fresh & Natural",
      description: "We use only the freshest ingredients with no artificial additives or preservatives."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery to your doorstep, keeping products fresh and delicious."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6 text-foreground">
              About <span className="text-primary">AK Business</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Bringing authentic flavors and premium quality food products to your table since establishment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-8 text-foreground">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              AK Business was founded with a simple mission: to provide customers with the highest quality food products at affordable prices. We believe that good food should be accessible to everyone, and our commitment to excellence drives everything we do.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              From our carefully selected sauces to our delicious frozen specialties and authentic kababs, every product is sourced and prepared with care. We work directly with trusted suppliers to ensure freshness, quality, and authenticity.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our team is passionate about food and customer satisfaction. We're not just selling products; we're sharing a passion for culinary excellence and bringing communities together through the universal language of good food.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-display font-bold text-3xl md:text-4xl mb-16 text-foreground text-center"
          >
            Why Choose Us
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="p-8 h-full hover-elevate text-center">
                    <div className="flex justify-center mb-6">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-2xl mb-4 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-8 text-foreground">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              To deliver exceptional food products that enhance everyday meals and celebrations, while maintaining the highest standards of quality, freshness, and customer service. We aim to be your trusted partner in creating memorable culinary experiences.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
