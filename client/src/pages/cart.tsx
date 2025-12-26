import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const cartTotal = total();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-display font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl shadow-sm border border-border/50">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything delicious yet.</p>
            <Link href="/">
              <Button size="lg" className="rounded-full px-8">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className="p-4 flex gap-6 items-center border-border/50 hover:border-primary/20 transition-colors">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg font-display">{item.name}</h3>
                          <p className="font-bold text-primary">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">${(item.price / 100).toFixed(2)} each</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg bg-background">
                            <button 
                              className="p-2 hover:bg-secondary rounded-l-lg transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button 
                              className="p-2 hover:bg-secondary rounded-r-lg transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearCart} className="text-muted-foreground">
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-8 shadow-lg border-primary/10">
                  <h3 className="text-xl font-display font-bold mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${(cartTotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>$5.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold text-foreground">
                      <span>Total</span>
                      <span className="text-primary">${((cartTotal + 500) / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <Link href="/checkout" className="w-full block">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 rounded-xl h-14 text-lg shadow-lg shadow-primary/25">
                      Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Secure checkout powered by Stripe (Mock)
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
