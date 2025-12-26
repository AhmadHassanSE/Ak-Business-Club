import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const { data: products, isLoading, error } = useProducts({ 
    category: category === "All" ? undefined : category,
    search: search || undefined
  });

  const categories = ["All", "Sauces", "Frozen", "Kababs", "Spices"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Unsplash image of delicious food spread */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop" 
            alt="Delicious Food Spread" 
            className="w-full h-full object-cover brightness-[0.6]"
          />
        </div>
        
        <div className="container relative z-10 px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display font-bold text-5xl md:text-7xl mb-6">
              Taste the <span className="text-primary">Passion</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Premium quality sauces, frozen delights, and authentic kababs delivered straight to your door.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-primary/25" onClick={() => {
              document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              View Our Menu
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <h2 className="text-4xl font-display font-bold text-foreground">Our Menu</h2>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-12 rounded-full border-2 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="All" className="w-full" onValueChange={setCategory}>
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start md:justify-center mb-10 p-0">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-6 py-2 border border-muted-foreground/20 text-muted-foreground hover:text-foreground transition-all text-base"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-500">
                  Something went wrong. Please try again later.
                </div>
              ) : products?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-xl">No products found.</p>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {products?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </div>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
